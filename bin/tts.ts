import { GoogleGenAI } from "@google/genai";
import mime from "mime";
import { writeFile, mkdirSync, existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { Writer as WavWriter } from "wav";
import { Readable } from "stream";
import "dotenv/config";

const VERSION = "1.0.0";

interface CliOptions {
  text: string;
  output: string;
  model: string;
  voice?: string;
  style: string;
  language: string;
  verbose: boolean;
  dir?: string;
  inputFile?: string;
}

const AVAILABLE_VOICES = [
  "Zephyr",
  "Puck",
  "Enceladus",
  "Kore",
  "Charon",
  "Fenrir",
  "Aoede",
  "Orbit",
  "Pegasus",
  "Quasar"
];

function showHelp() {
  console.log(`Gemini Text-to-Speech CLI v${VERSION}

DESCRIPTION:
  Generate natural-sounding speech from text using Google's Gemini AI TTS models.
  Perfect for creating guided meditations, audiobooks, or any voice content.
  Requires GEMINI_API_KEY environment variable to be set.

USAGE:
  npm run tts -- [OPTIONS] <text> <filename>
  npx tsx bin/tts.ts [OPTIONS] <text> <filename>

ARGUMENTS:
  <text>        Text to convert to speech (or use -i/--input for file)
  <filename>    Output filename without extension

OPTIONS:
  -t, --text <text>         Text to convert (alternative to positional arg)
  -i, --input <file>        Read text from a file instead of command line
  -o, --output <name>       Output filename (alternative to positional arg)
  -m, --model <model>       Gemini TTS model (default: gemini-2.5-flash-preview-tts)
  -v, --voice <name>        Voice to use (see AVAILABLE VOICES below)
  -s, --style <prompt>      Style description (e.g., "calm, soothing, slow")
  -l, --language <code>     Language code (default: fr-FR)
  -d, --dir <directory>     Output directory (default: current directory)
  -V, --verbose             Enable verbose logging
  -h, --help                Show this help message
  --version                 Show version number

AVAILABLE MODELS:
  - gemini-2.5-flash-preview-tts (default, fast and economical)
  - gemini-2.5-pro-preview-tts (higher quality)

AVAILABLE VOICES:
  ${AVAILABLE_VOICES.join(", ")}
  (Note: Not all voices may be available for all languages)

LANGUAGES:
  fr-FR (French), en-US (English US), es-ES (Spanish), de-DE (German),
  ar-XA (Arabic), and 19+ other languages supported

STYLE EXAMPLES:
  - "calm, soothing, slow, meditative"
  - "energetic, upbeat, clear"
  - "gentle, warm, compassionate"
  - "neutral, professional, clear"

ENVIRONMENT:
  GEMINI_API_KEY           Required. Your Google Gemini API key.
                          Get one at: https://aistudio.google.com/apikey

EXAMPLES:
  # Generate speech from text
  npm run tts -- "Bienvenue à cette méditation de pleine conscience" meditation_intro

  # Using a file as input
  npm run tts -- -i scripts/meditation.txt -o meditation_full

  # Specify voice and style
  npm run tts -- -v Enceladus -s "calm, slow, meditative" "Prenez une profonde respiration" breath_intro

  # Use Pro model with custom style
  npm run tts -- -m gemini-2.5-pro-preview-tts -s "gentle, compassionate" "Que vous soyez en paix" loving_kindness

  # Specify output directory
  npm run tts -- -d ./public/audio/meditations "Observez votre respiration" breath_awareness

  # Verbose mode with detailed logging
  npm run tts -- -V "Détendez vos épaules" relaxation_shoulders

  # English meditation
  npm run tts -- -l en-US "Welcome to this mindfulness practice" welcome_en
`);
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);

  // Handle version flag
  if (args.includes("--version")) {
    console.log(`v${VERSION}`);
    process.exit(0);
  }

  // Handle help flag
  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    showHelp();
    process.exit(args.includes("--help") || args.includes("-h") ? 0 : 1);
  }

  let text = "";
  let output = "";
  let model = "gemini-2.5-flash-preview-tts";
  let voice: string | undefined = undefined;
  let style = "calm, soothing, slow, meditative";
  let language = "fr-FR";
  let verbose = false;
  let dir: string | undefined = undefined;
  let inputFile: string | undefined = undefined;

  // Parse all flags
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case "-t":
      case "--text":
        if (nextArg && !nextArg.startsWith("-")) {
          text = nextArg;
          i++;
        }
        break;
      case "-i":
      case "--input":
        if (nextArg && !nextArg.startsWith("-")) {
          inputFile = nextArg;
          i++;
        }
        break;
      case "-o":
      case "--output":
        if (nextArg && !nextArg.startsWith("-")) {
          output = nextArg;
          i++;
        }
        break;
      case "-m":
      case "--model":
        if (nextArg && !nextArg.startsWith("-")) {
          model = nextArg;
          i++;
        }
        break;
      case "-v":
      case "--voice":
        if (nextArg && !nextArg.startsWith("-")) {
          voice = nextArg;
          i++;
        }
        break;
      case "-s":
      case "--style":
        if (nextArg && !nextArg.startsWith("-")) {
          style = nextArg;
          i++;
        }
        break;
      case "-l":
      case "--language":
        if (nextArg && !nextArg.startsWith("-")) {
          language = nextArg;
          i++;
        }
        break;
      case "-d":
      case "--dir":
        if (nextArg && !nextArg.startsWith("-")) {
          dir = nextArg;
          i++;
        }
        break;
      case "-V":
      case "--verbose":
        verbose = true;
        break;
    }
  }

  // If input file specified, read text from file
  if (inputFile) {
    try {
      const filePath = resolve(inputFile);
      text = readFileSync(filePath, "utf-8");
      if (verbose) {
        console.log(`📄 Read ${text.length} characters from ${inputFile}`);
      }
    } catch (error) {
      console.error(`❌ Error reading input file: ${inputFile}`);
      if (error instanceof Error) {
        console.error(`   ${error.message}`);
      }
      process.exit(1);
    }
  }

  // If not found via flags, try positional arguments
  if (!text || !output) {
    // Get all arguments that aren't flags and weren't already consumed
    const positionalArgs: string[] = [];
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      // Skip if it's a flag
      if (arg.startsWith("-")) {
        // Skip the flag and its value if it has one
        if (
          ["-t", "--text", "-i", "--input", "-o", "--output", "-m", "--model",
           "-v", "--voice", "-s", "--style", "-l", "--language", "-d", "--dir"].includes(arg)
        ) {
          i++; // Skip next arg (the value)
        }
        continue;
      }
      positionalArgs.push(arg);
    }

    if (positionalArgs.length >= 2) {
      text = text || positionalArgs[0];
      output = output || positionalArgs[1];
    } else if (positionalArgs.length === 1 && !text && !output) {
      // Only one positional arg provided, unclear which one it is
      console.error("❌ Error: Please provide both text and output filename");
      console.error("   Use named arguments: -t \"text\" -o filename");
      console.error("   Or positional: \"text\" filename");
      console.error("   Or use input file: -i input.txt -o filename");
      process.exit(1);
    }
  }

  // Validate required arguments
  if (!text || !output) {
    console.error("❌ Error: Both text/input and output filename are required\n");
    console.log("Run with --help for usage information");
    process.exit(1);
  }

  return { text, output, model, voice, style, language, verbose, dir, inputFile };
}

function convertPcmToWav(pcmData: Buffer, mimeType: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // Parse sample rate from MIME type (e.g., "audio/L16;codec=pcm;rate=24000")
    const rateMatch = mimeType.match(/rate=(\d+)/);
    const sampleRate = rateMatch ? parseInt(rateMatch[1]) : 24000;

    // L16 = 16-bit PCM, mono
    const channels = 1;
    const bitDepth = 16;

    const wavWriter = new WavWriter({
      sampleRate,
      channels,
      bitDepth
    });

    const chunks: Buffer[] = [];

    wavWriter.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    wavWriter.on('end', () => {
      resolve(Buffer.concat(chunks));
    });

    wavWriter.on('error', (err: Error) => {
      reject(err);
    });

    // Create readable stream from PCM data
    const readable = Readable.from(pcmData);
    readable.pipe(wavWriter);
  });
}

async function saveAudioFile(fileName: string, content: Buffer, mimeType: string): Promise<string> {
  // If it's raw PCM (L16), convert to WAV
  let finalContent = content;
  let finalFileName = fileName;

  if (mimeType.includes('audio/L16') || mimeType.includes('audio/l16')) {
    finalContent = await convertPcmToWav(content, mimeType);
    // Change extension to .wav
    finalFileName = fileName.replace(/\.(mp3|pcm)$/, '.wav');
    if (!finalFileName.endsWith('.wav')) {
      finalFileName += '.wav';
    }
  }

  return new Promise((resolve, reject) => {
    writeFile(finalFileName, finalContent, (err) => {
      if (err) {
        console.error(`❌ Error writing file ${finalFileName}:`, err);
        reject(err);
        return;
      }
      console.log(`✅ Audio file saved: ${finalFileName}`);
      resolve(finalFileName);
    });
  });
}

function buildStylePrompt(text: string, style: string, voice?: string): string {
  const voiceInstruction = voice ? `avec la voix ${voice}` : "";

  return `Lisez ce texte de méditation guidée ${voiceInstruction} avec un style ${style}.
Parlez très lentement (environ 50 mots par minute), avec un rythme fluide et des pauses naturelles.
Le ton doit être chaleureux, neutre et adapté à la méditation de pleine conscience.

Texte à lire:
${text}`;
}

async function main() {
  const options = parseArgs();

  // Validate API key
  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ Error: GEMINI_API_KEY environment variable is not set");
    console.error("\nPlease set your API key:");
    console.error("  export GEMINI_API_KEY='your-api-key'");
    console.error("\nGet an API key at: https://aistudio.google.com/apikey");
    console.error("Or add it to your .env file");
    process.exit(1);
  }

  // Prepare output path
  let outputPath = options.output;
  if (options.dir) {
    const outputDir = resolve(options.dir);
    if (!existsSync(outputDir)) {
      if (options.verbose) {
        console.log(`📁 Creating directory: ${outputDir}`);
      }
      mkdirSync(outputDir, { recursive: true });
    }
    outputPath = resolve(outputDir, options.output);
  }

  if (options.verbose) {
    console.log("🚀 Starting text-to-speech generation...");
    console.log(`📝 Text: "${options.text.substring(0, 100)}${options.text.length > 100 ? "..." : ""}"`);
    console.log(`📊 Text length: ${options.text.length} characters (~${Math.round(options.text.split(/\s+/).length)} words)`);
    console.log(`🤖 Model: ${options.model}`);
    if (options.voice) {
      console.log(`🎤 Voice: ${options.voice}`);
    }
    console.log(`🎨 Style: ${options.style}`);
    console.log(`🌍 Language: ${options.language}`);
    console.log(`💾 Output: ${outputPath}`);
    console.log();
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const config = {
      responseModalities: ["AUDIO"],
      speechConfig: options.voice ? {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: options.voice,
          }
        }
      } : undefined,
    };

    const stylePrompt = buildStylePrompt(options.text, options.style, options.voice);

    const contents = [
      {
        role: "user",
        parts: [
          {
            text: stylePrompt,
          },
        ],
      },
    ];

    if (options.verbose) {
      console.log("⏳ Generating audio...\n");
    } else {
      console.log("⏳ Generating audio...");
    }

    const response = await ai.models.generateContentStream({
      model: options.model,
      config,
      contents,
    });

    let audioSaved = false;
    let fileIndex = 0;

    for await (const chunk of response) {
      if (
        !chunk.candidates ||
        !chunk.candidates[0].content ||
        !chunk.candidates[0].content.parts
      ) {
        continue;
      }

      const parts = chunk.candidates[0].content.parts;

      for (const part of parts) {
        if (part.inlineData) {
          const fileName =
            fileIndex === 0 ? outputPath : `${outputPath}_${fileIndex}`;
          fileIndex++;

          const inlineData = part.inlineData;
          const mimeType = inlineData.mimeType || "";
          const buffer = Buffer.from(inlineData.data || "", "base64");

          // Save audio with automatic PCM to WAV conversion
          const savedPath = await saveAudioFile(fileName, buffer, mimeType);
          audioSaved = true;

          if (options.verbose) {
            const savedExtension = (mimeType.includes('audio/L16') || mimeType.includes('audio/l16')) ? 'wav' : (mime.getExtension(mimeType) || 'audio');
            console.log(`🎵 Audio file: ${savedPath}`);
            console.log(`📊 Size: ${(buffer.length / 1024).toFixed(2)} KB`);
            console.log(`🎼 Format: ${mimeType}${savedExtension === 'wav' ? ' (converted to WAV)' : ''}`);
          }
        } else if (part.text && options.verbose) {
          console.log("📄 Response text:");
          console.log(part.text);
        }
      }
    }

    if (!audioSaved) {
      console.warn("\n⚠️  No audio file was generated");
      console.warn("This might be because:");
      console.warn("  - The text was too short or empty");
      console.warn("  - The model encountered an error");
      console.warn("  - The API is experiencing issues");
      console.warn("\nTry running with -V/--verbose for more details");
    } else if (options.verbose) {
      console.log("\n✅ Audio generation completed successfully!");
    }
  } catch (error) {
    console.error("\n❌ Error during audio generation:");
    if (error instanceof Error) {
      console.error(`  ${error.message}`);
      if (options.verbose && error.stack) {
        console.error("\nStack trace:");
        console.error(error.stack);
      }
    } else {
      console.error(`  ${String(error)}`);
    }
    process.exit(1);
  }
}

main();
