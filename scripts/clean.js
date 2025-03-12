import { rm, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dirsToRemove = ['node_modules/.vite', 'node_modules/.cache', '.cache', 'dist', 'build'];

console.log('🧹 Cleaning project...');

// Remove directories
for (const dir of dirsToRemove) {
  const fullPath = join(__dirname, '..', dir);

  try {
    if (existsSync(fullPath)) {
      console.log(`Removing ${dir}...`);
      rm(fullPath, { recursive: true, force: true }, (err) => {
        if (err) {
          console.error(`Error removing ${dir}:`, err.message);
        }
      });
    }
  } catch (err) {
    console.error(`Error removing ${dir}:`, err.message);
  }
}

// Run pnpm commands
console.log('\n📦 Reinstalling dependencies...');

try {
  execSync('pnpm install', { stdio: 'inherit' });
  console.log('\n🏗️  Building project...');
  execSync('pnpm run build', { stdio: 'inherit', cwd: process.cwd() });
  console.log('\n✨ Clean completed! You can now run pnpm dev');
} catch (err) {
  console.error('\n❌ Error during cleanup:', err.message);
  process.exit(1);
}
