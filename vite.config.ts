import UnoCSS from 'unocss/vite';
import { defineConfig, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { optimizeCssModules } from 'vite-plugin-optimize-css-modules';
import tsconfigPaths from 'vite-tsconfig-paths';
import * as dotenv from 'dotenv';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

dotenv.config();

// Get detailed git info with fallbacks
const getGitInfo = () => {
  try {
    return {
      commitHash: execSync('git rev-parse --short HEAD').toString().trim(),
      branch: execSync('git rev-parse --abbrev-ref HEAD').toString().trim(),
      commitTime: execSync('git log -1 --format=%cd').toString().trim(),
      author: execSync('git log -1 --format=%an').toString().trim(),
      email: execSync('git log -1 --format=%ae').toString().trim(),
      remoteUrl: execSync('git config --get remote.origin.url').toString().trim(),
      repoName: execSync('git config --get remote.origin.url')
        .toString()
        .trim()
        .replace(/^.*github.com[:/]/, '')
        .replace(/\.git$/, ''),
    };
  } catch {
    return {
      commitHash: 'no-git-info',
      branch: 'unknown',
      commitTime: 'unknown',
      author: 'unknown',
      email: 'unknown',
      remoteUrl: 'unknown',
      repoName: 'unknown',
    };
  }
};

// Read package.json with detailed dependency info
const getPackageJson = () => {
  try {
    const possiblePaths = [
      // Current and parent directories
      join(process.cwd(), 'package.json'),
      join(__dirname, 'package.json'),
      join(__dirname, '../package.json'),
      join(process.cwd(), '../package.json'),
      
      // Docker paths
      '/app/package.json',
      '/app/build/package.json',
      '/workspace/package.json',
      
      // Netlify paths
      '/.netlify/functions/package.json',
      join(process.env.LAMBDA_TASK_ROOT || '', 'package.json'),
      
      // Build directories
      './build/package.json',
      '../build/package.json',
      './dist/package.json',
      
      // Absolute paths from root
      '/var/task/package.json',
      '/opt/build/repo/package.json',
      
      // Windows-style paths
      'C:\\app\\package.json',
      'D:\\app\\package.json',
      
      // Additional common locations
      './functions/package.json',
      './server/package.json',
      './client/package.json'
    ];

    // Add environment-specific paths
    if (process.env.PROJECT_ROOT) {
      possiblePaths.push(join(process.env.PROJECT_ROOT, 'package.json'));
    }

    // Add paths from environment variables
    Object.entries(process.env).forEach(([key, value]) => {
      if (value && (key.includes('PATH') || key.includes('DIR'))) {
        possiblePaths.push(join(value, 'package.json'));
      }
    });

    let lastError;
    for (const pkgPath of possiblePaths) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
        console.log(`Successfully loaded package.json from: ${pkgPath}`);
        return {
          name: pkg.name,
          description: pkg.description,
          license: pkg.license,
          dependencies: pkg.dependencies || {},
          devDependencies: pkg.devDependencies || {},
          peerDependencies: pkg.peerDependencies || {},
          optionalDependencies: pkg.optionalDependencies || {},
        };
      } catch (error) {
        lastError = error;
        console.debug(`Failed to load package.json from ${pkgPath}: ${(error as Error).message}`);
      }
    }

    // If all paths fail, try searching recursively up the directory tree
    let currentDir = process.cwd();
    while (currentDir !== join(currentDir, '..')) {
      try {
        const pkgPath = join(currentDir, 'package.json');
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
        console.log(`Successfully loaded package.json from recursive search: ${pkgPath}`);
        return {
          name: pkg.name,
          description: pkg.description,
          license: pkg.license,
          dependencies: pkg.dependencies || {},
          devDependencies: pkg.devDependencies || {},
          peerDependencies: pkg.peerDependencies || {},
          optionalDependencies: pkg.optionalDependencies || {},
        };
      } catch {
        currentDir = join(currentDir, '..');
      }
    }

    throw lastError || new Error('No package.json found in any location');
  } catch {
    return {
      name: 'bolt.diy',
      description: 'A DIY LLM interface',
      license: 'MIT',
      dependencies: {},
      devDependencies: {},
      peerDependencies: {},
      optionalDependencies: {},
    };
  }
};

const pkg = getPackageJson();
const gitInfo = getGitInfo();

export default defineConfig((config) => {
  return {
    define: {
      __COMMIT_HASH: JSON.stringify(gitInfo.commitHash),
      __GIT_BRANCH: JSON.stringify(gitInfo.branch),
      __GIT_COMMIT_TIME: JSON.stringify(gitInfo.commitTime),
      __GIT_AUTHOR: JSON.stringify(gitInfo.author),
      __GIT_EMAIL: JSON.stringify(gitInfo.email),
      __GIT_REMOTE_URL: JSON.stringify(gitInfo.remoteUrl),
      __GIT_REPO_NAME: JSON.stringify(gitInfo.repoName),
      __APP_VERSION: JSON.stringify(process.env.npm_package_version),
      __PKG_NAME: JSON.stringify(pkg.name),
      __PKG_DESCRIPTION: JSON.stringify(pkg.description),
      __PKG_LICENSE: JSON.stringify(pkg.license),
      __PKG_DEPENDENCIES: JSON.stringify(pkg.dependencies),
      __PKG_DEV_DEPENDENCIES: JSON.stringify(pkg.devDependencies),
      __PKG_PEER_DEPENDENCIES: JSON.stringify(pkg.peerDependencies),
      __PKG_OPTIONAL_DEPENDENCIES: JSON.stringify(pkg.optionalDependencies),
    },
    build: {
      target: 'esnext',
      rollupOptions: {
        input: {
          app: './index.html',
        },
      },
    },
    plugins: [
      nodePolyfills({
        include: ['path', 'buffer', 'process'],
      }),
      react(),
      {
        name: 'remix-vite-plugin',
        configResolved() {
          process.env.REMIX_FUTURE_V3_FETCHER_PERSIST = 'true';
          process.env.REMIX_FUTURE_V3_RELATIVE_SPLAT_PATH = 'true';
          process.env.REMIX_FUTURE_V3_THROW_ABORT_REASON = 'true';
          process.env.REMIX_FUTURE_V3_LAZY_ROUTE_DISCOVERY = 'true';
        },
        config() {
          return {
            build: {
              rollupOptions: {
                external: ['@remix-run/node', '@remix-run/netlify'],
              },
            },
            optimizeDeps: {
              include: ['@remix-run/react', '@remix-run/node'],
            },
            resolve: {
              dedupe: ['react', 'react-dom'],
            },
          };
        },
      },
      UnoCSS(),
      tsconfigPaths(),
      chrome129IssuePlugin(),
      config.mode === 'production' && optimizeCssModules({ apply: 'build' }),
    ],
    envPrefix: [
      'VITE_',
      'OPENAI_LIKE_API_BASE_URL',
      'OLLAMA_API_BASE_URL',
      'LMSTUDIO_API_BASE_URL',
      'TOGETHER_API_BASE_URL',
    ],
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
  };
});

function chrome129IssuePlugin() {
  return {
    name: 'chrome129IssuePlugin',
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        const raw = req.headers['user-agent']?.match(/Chrom(e|ium)\/([0-9]+)\./);

        if (raw) {
          const version = parseInt(raw[2], 10);

          if (version === 129) {
            res.setHeader('content-type', 'text/html');
            res.end(
              '<body><h1>Please use Chrome Canary for testing.</h1><p>Chrome 129 has an issue with JavaScript modules & Vite local development, see <a href="https://github.com/stackblitz/bolt.new/issues/86#issuecomment-2395519258">for more information.</a></p><p><b>Note:</b> This only impacts <u>local development</u>. `pnpm run build` and `pnpm run start` will work fine in this browser.</p></body>',
            );

            return;
          }
        }

        next();
      });
    },
  };
}
