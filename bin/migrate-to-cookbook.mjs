#!/usr/bin/env node

import { readFile, writeFile, readdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

/**
 * Migration script to rename mainCategory to cookbook
 * in all recipe JSON files
 */
async function migrateMainCategoryToCookbook() {
  console.log('🔄 Starting migration: mainCategory → cookbook\n');

  // Find all recipe JSON files
  const cuisineDir = path.join(projectRoot, 'src/content/cuisine');
  const files = await readdir(cuisineDir);
  const recipeFiles = files
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(cuisineDir, file));

  console.log(`📁 Found ${recipeFiles.length} recipe files\n`);

  let migratedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const filePath of recipeFiles) {
    const fileName = path.basename(filePath);

    try {
      // Read the JSON file
      const content = await readFile(filePath, 'utf-8');
      const recipe = JSON.parse(content);

      // Check if mainCategory exists
      if (recipe.mainCategory) {
        // Rename mainCategory to cookbook
        recipe.cookbook = recipe.mainCategory;
        delete recipe.mainCategory;

        // Write back to file with pretty formatting
        await writeFile(
          filePath,
          JSON.stringify(recipe, null, 2) + '\n',
          'utf-8'
        );

        console.log(`✅ ${fileName}: mainCategory → cookbook (${recipe.cookbook})`);
        migratedCount++;
      } else if (recipe.cookbook) {
        console.log(`⏭️  ${fileName}: already has cookbook field`);
        skippedCount++;
      } else {
        console.log(`⚠️  ${fileName}: no mainCategory or cookbook field`);
        skippedCount++;
      }
    } catch (error) {
      console.error(`❌ ${fileName}: ${error.message}`);
      errorCount++;
    }
  }

  console.log('\n📊 Migration Summary:');
  console.log(`   ✅ Migrated: ${migratedCount}`);
  console.log(`   ⏭️  Skipped: ${skippedCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📁 Total: ${recipeFiles.length}`);
}

// Run the migration
migrateMainCategoryToCookbook().catch(console.error);
