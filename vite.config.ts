import UnoCSS from 'unocss/vite';
import { defineConfig, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { optimizeCssModules } from 'vite-plugin-optimize-css-modules';
import tsconfigPaths from 'vite-tsconfig-paths';
import * as dotenv from 'dotenv';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { cwd } from 'process';

dotenv.config();

// Replace the ESM __dirname calculation with direct path resolution
const projectRoot = cwd();

function getPackageJson() {
  const packagePath = resolve(projectRoot, 'package.json');
  try {
    return JSON.parse(readFileSync(packagePath, 'utf-8'));
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
    const execOptions = { cwd: projectRoot, encoding: 'utf8' as BufferEncoding };
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
        ]
      },
    },
    optimizeDeps: {
      include: ['@remix-run/react'],
      exclude: ['@remix-run/dev/server-build']
    },
    resolve: {
      dedupe: ['react', 'react-dom'],
      preserveSymlinks: true
    },
    plugins: [
      nodePolyfills({
        include: ['path', 'buffer', 'process', 'fs'],
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
