import UnoCSS from 'unocss/vite';
import { defineConfig, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { optimizeCssModules } from 'vite-plugin-optimize-css-modules';
import tsconfigPaths from 'vite-tsconfig-paths';
import { vitePlugin as remix } from '@remix-run/dev';
import * as dotenv from 'dotenv';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

function getPackageJson() {
  try {
    // Try multiple possible locations
    const possiblePaths = [
      join(process.cwd(), 'package.json'),
      join(__dirname, 'package.json'),
      join(__dirname, '..', 'package.json'),
      '/opt/build/repo/package.json' // Netlify specific path
    ];

    for (const pkgPath of possiblePaths) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
        console.log('Found package.json at:', pkgPath);
        return {
          name: pkg.name,
          description: pkg.description,
          license: pkg.license,
          version: pkg.version,
          dependencies: pkg.dependencies || {},
          devDependencies: pkg.devDependencies || {},
          peerDependencies: pkg.peerDependencies || {},
          optionalDependencies: pkg.optionalDependencies || {},
        };
      } catch (e) {
        console.log('Failed to read from:', pkgPath);
      }
    }
    throw new Error('package.json not found in any expected location');
  } catch (error) {
    console.warn('Failed to read package.json:', error);
    return {
      name: 'bolt',
      description: 'An AI Agent',
      license: 'MIT',
      version: '0.0.7',
      dependencies: {},
      devDependencies: {},
      peerDependencies: {},
      optionalDependencies: {},
    };
  }
}

function getGitInfo() {
  try {
    const execOptions = { cwd: process.cwd(), encoding: 'utf8' as BufferEncoding };
    return {
      commitHash: execSync('git rev-parse --short HEAD', execOptions).trim(),
      branch: execSync('git rev-parse --abbrev-ref HEAD', execOptions).trim(),
      commitTime: execSync('git log -1 --format=%cd', execOptions).trim(),
      author: execSync('git log -1 --format=%an', execOptions).trim(),
      email: execSync('git log -1 --format=%ae', execOptions).trim(),
      remoteUrl: execSync('git config --get remote.origin.url', execOptions).trim(),
      repoName: execSync('git config --get remote.origin.url', execOptions)
        .trim()
        .replace(/^.*github.com[:/]/, '')
        .replace(/\.git$/, ''),
    };
  } catch (error) {
    console.warn('Failed to get git info:', error);
    return {
      commitHash: 'unknown',
      branch: 'unknown',
      commitTime: 'unknown',
      author: 'unknown',
      email: 'unknown',
      remoteUrl: 'unknown',
      repoName: 'unknown',
    };
  }
}

export default defineConfig((config) => {
  const isDev = config.mode === 'development';
  const pkg = getPackageJson();
  const gitInfo = getGitInfo();
  
  return {
    define: {
      // Only include git info in production
      ...(isDev ? {} : {
        __COMMIT_HASH: JSON.stringify(gitInfo.commitHash),
        __GIT_BRANCH: JSON.stringify(gitInfo.branch),
        __GIT_COMMIT_TIME: JSON.stringify(gitInfo.commitTime),
        __GIT_AUTHOR: JSON.stringify(gitInfo.author),
        __GIT_EMAIL: JSON.stringify(gitInfo.email),
        __GIT_REMOTE_URL: JSON.stringify(gitInfo.remoteUrl),
        __GIT_REPO_NAME: JSON.stringify(gitInfo.repoName),
      }),
      __APP_VERSION: JSON.stringify(pkg.version),
      __PKG_NAME: JSON.stringify(pkg.name),
      __PKG_DESCRIPTION: JSON.stringify(pkg.description),
      __PKG_LICENSE: JSON.stringify(pkg.license),
    },
    build: {
      target: 'esnext',
      rollupOptions: {
        input: {
          app: './index.html'
        },
        external: [
          '@remix-run/node',
          '@remix-run/netlify',
          '@remix-run/server-runtime',
          '@remix-run/dev/server-build',
          'express',
          'path',
          'fs',
          'crypto'
        ],
        output: {
          format: 'esm'
        }
      },
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true
      }
    },
    optimizeDeps: {
      include: ['@remix-run/react'],
      exclude: ['@remix-run/dev/server-build'],
      esbuildOptions: {
        target: 'esnext'
      }
    },
    resolve: {
      dedupe: ['react', 'react-dom'],
      preserveSymlinks: true,
      mainFields: ['module', 'main']
    },
    plugins: [
      remix({
        ssr: true
      }),
      nodePolyfills({
        include: ['path', 'buffer', 'process', 'fs'],
        globals: {
          process: true,
          Buffer: true
        }
      }),
      react(),
      UnoCSS(),
      tsconfigPaths(),
      chrome129IssuePlugin(),
      config.mode === 'production' && optimizeCssModules({ apply: 'build' })
    ].filter(Boolean),
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
