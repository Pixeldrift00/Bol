import { copyFile, mkdir } from 'fs/promises';
import { join } from 'path';

async function postBuild() {
  try {
    // Ensure directories exist
    await mkdir(join(process.cwd(), 'build/client'), { recursive: true });
    await mkdir(join(process.cwd(), 'build/server'), { recursive: true });
    
    // Copy package.json to necessary locations
    await copyFile(
      join(process.cwd(), 'package.json'),
      join(process.cwd(), 'build/package.json')
    );
    
    await copyFile(
      join(process.cwd(), 'package.json'),
      join(process.cwd(), 'build/client/package.json')
    );
    
    console.log('Post-build file copying completed successfully');
  } catch (error) {
    console.error('Post-build error:', error);
    process.exit(1);
  }
}

postBuild();