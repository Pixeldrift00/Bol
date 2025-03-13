import { copyFile, mkdir } from 'fs/promises';
import { join } from 'path';

async function preBuild() {
  try {
    // Ensure all directories exist
    await mkdir(join(process.cwd(), 'build/client'), { recursive: true });
    await mkdir(join(process.cwd(), 'build/server'), { recursive: true });
    await mkdir(join(process.cwd(), 'opt/build/repo'), { recursive: true });  // Add opt directory
    
    // Copy package.json to all necessary locations
    const locations = [
      'build/package.json',
      'build/client/package.json',
      'build/server/package.json',
      'opt/build/repo/package.json'  // Add opt location
    ];

    await Promise.all(
      locations.map(location =>
        copyFile(
          join(process.cwd(), 'package.json'),
          join(process.cwd(), location)
        )
      )
    );
    
    console.log('Pre-build file copying completed successfully');
  } catch (error) {
    console.error('Pre-build error:', error);
    process.exit(1);
  }
}

preBuild();