import { GoogleGenAI } from "@google/genai";
import mime from "mime";
import { writeFile, mkdirSync, existsSync } from "fs";
import { resolve } from "path";
import "dotenv/config";

const VERSION = "1.0.0";

interface CliOptions {
  prompt: string;
  output: string;
  model: string;
  modalities: string[];
  verbose: boolean;
  dir?: string;
}

function showHelp() {
  console.log(`Gemini Image Generator CLI v${VERSION}

DESCRIPTION:
  Generate images and audio using Google's Gemini AI models with text prompts.
  Requires GEMINI_API_KEY environment variable to be set.

USAGE:
  npm run gemini -- [OPTIONS] <prompt> <filename>
  npx tsx bin/gemini.ts [OPTIONS] <prompt> <filename>

ARGUMENTS:
  <prompt>      Text prompt for image generation
  <filename>    Output filename without extension

OPTIONS:
  -p, --prompt <text>       Text prompt (alternative to positional arg)
  -o, --output <name>       Output filename (alternative to positional arg)
  -m, --model <model>       Gemini model to use (default: gemini-2.5-flash-image)
  -M, --modalities <list>   Comma-separated response modalities (default: IMAGE,TEXT)
  -d, --dir <directory>     Output directory (default: current directory)
  -v, --verbose             Enable verbose logging
  -h, --help                Show this help message
  --version                 Show version number

AVAILABLE MODELS:
  - gemini-2.5-flash-image (default, fastest)
  - gemini-2.5-pro-image (higher quality)

MODALITIES:
  IMAGE, TEXT, AUDIO (comma-separated, e.g., "IMAGE,TEXT")

ENVIRONMENT:
  GEMINI_API_KEY           Required. Your Google Gemini API key.
                          Get one at: https://aistudio.google.com/apikey

EXAMPLES:
  # Generate an image with positional arguments
  npm run gemini -- "une image d'un renard mystique" fox_image

  # Using named arguments
  npm run gemini -- --prompt "un paysage de montagne" --output mountain

  # Specify model and output directory
  npm run gemini -- -m gemini-2.5-pro-image -d ./images "un coucher de soleil" sunset

  # Verbose mode with detailed logging
  npm run gemini -- -v "une forêt enchantée" forest

  # Generate audio (experimental)
  npm run gemini -- -M "AUDIO" "une mélodie relaxante de piano" piano_melody

  # Generate multiple modalities (image and audio)
  npm run gemini -- -M "IMAGE,AUDIO,TEXT" "une scène de pluie" rain_scene
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

  let prompt = "";
  let output = "";
  let model = "gemini-2.5-flash-image";
  let modalities = ["IMAGE", "TEXT"];
  let verbose = false;
  let dir: string | undefined = undefined;

  // Parse all flags
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case "-p":
      case "--prompt":
        if (nextArg && !nextArg.startsWith("-")) {
          prompt = nextArg;
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
      case "-M":
      case "--modalities":
        if (nextArg && !nextArg.startsWith("-")) {
          modalities = nextArg.split(",").map((m) => m.trim().toUpperCase());
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
      case "-v":
      case "--verbose":
        verbose = true;
        break;
    }
  }

  // If not found via flags, try positional arguments
  if (!prompt || !output) {
    // Get all arguments that aren't flags and weren't already consumed
    const positionalArgs: string[] = [];
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      // Skip if it's a flag
      if (arg.startsWith("-")) {
        // Skip the flag and its value if it has one
        if (
          ["-p", "--prompt", "-o", "--output", "-m", "--model", "-M", "--modalities", "-d", "--dir"].includes(arg)
        ) {
          i++; // Skip next arg (the value)
        }
        continue;
      }
      positionalArgs.push(arg);
    }

    if (positionalArgs.length >= 2) {
      prompt = prompt || positionalArgs[0];
      output = output || positionalArgs[1];
    } else if (positionalArgs.length === 1 && !prompt && !output) {
      // Only one positional arg provided, unclear which one it is
      console.error("❌ Error: Please provide both prompt and output filename");
      console.error("   Use named arguments: -p \"prompt\" -o filename");
      console.error("   Or positional: \"prompt\" filename");
      process.exit(1);
    }
  }

  // Validate required arguments
  if (!prompt || !output) {
    console.error("❌ Error: Both prompt and output filename are required\n");
    console.log("Run with --help for usage information");
    process.exit(1);
  }

  return { prompt, output, model, modalities, verbose, dir };
}

function saveBinaryFile(fileName: string, content: Buffer) {
  writeFile(fileName, content, "utf8", (err) => {
    if (err) {
      console.error(`Error writing file ${fileName}:`, err);
      return;
    }
    console.log(`File ${fileName} saved to file system.`);
  });
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
    console.log("🚀 Starting image generation...");
    console.log(`📝 Prompt: "${options.prompt}"`);
    console.log(`🤖 Model: ${options.model}`);
    console.log(`📊 Modalities: ${options.modalities.join(", ")}`);
    console.log(`💾 Output: ${outputPath}`);
    console.log();
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const config = {
      responseModalities: options.modalities,
    };

    const contents = [
      {
        role: "user",
        parts: [
          {
            text: options.prompt,
          },
        ],
      },
    ];

    if (options.verbose) {
      console.log("⏳ Generating images...\n");
    }

    const response = await ai.models.generateContentStream({
      model: options.model,
      config,
      contents,
    });

    let fileIndex = 0;
    let imageCount = 0;
    let audioCount = 0;

    for await (const chunk of response) {
      if (
        !chunk.candidates ||
        !chunk.candidates[0].content ||
        !chunk.candidates[0].content.parts
      ) {
        continue;
      }

      const parts = chunk.candidates[0].content.parts;

      // Process all parts (not just the first one)
      for (const part of parts) {
        if (part.inlineData) {
          const fileName =
            fileIndex === 0 ? outputPath : `${outputPath}_${fileIndex}`;
          fileIndex++;

          const inlineData = part.inlineData;
          const mimeType = inlineData.mimeType || "";
          const fileExtension = mime.getExtension(mimeType);
          const buffer = Buffer.from(inlineData.data || "", "base64");
          const fullPath = `${fileName}.${fileExtension}`;

          // Determine file type from MIME type
          const isImage = mimeType.startsWith("image/");
          const isAudio = mimeType.startsWith("audio/");

          if (isImage) {
            imageCount++;
            saveBinaryFile(fullPath, buffer);
            if (options.verbose) {
              console.log(`🖼️  Saving image ${imageCount}: ${fullPath}`);
            }
          } else if (isAudio) {
            audioCount++;
            saveBinaryFile(fullPath, buffer);
            if (options.verbose) {
              console.log(`🎵 Saving audio ${audioCount}: ${fullPath}`);
            }
          } else {
            // Unknown type, save it anyway
            saveBinaryFile(fullPath, buffer);
            if (options.verbose) {
              console.log(`💾 Saving file (${mimeType}): ${fullPath}`);
            }
          }
        } else if (part.text) {
          if (options.verbose) {
            console.log("📄 Text response:");
          }
          console.log(part.text);
        }
      }
    }

    // Summary messages
    const outputs = [];
    if (imageCount > 0) {
      outputs.push(`${imageCount} image${imageCount > 1 ? "s" : ""}`);
    }
    if (audioCount > 0) {
      outputs.push(`${audioCount} audio file${audioCount > 1 ? "s" : ""}`);
    }

    if (outputs.length === 0) {
      console.warn("\n⚠️  No files were generated");
    } else if (!options.verbose) {
      console.log(`✅ Generated ${outputs.join(" and ")}`);
    }
  } catch (error) {
    console.error("\n❌ Error during generation:");
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
