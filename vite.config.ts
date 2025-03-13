import UnoCSS from 'unocss/vite';
import { defineConfig, type ConfigEnv, type UserConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { optimizeCssModules } from 'vite-plugin-optimize-css-modules';
import tsconfigPaths from 'vite-tsconfig-paths';
import { vitePlugin as remix } from '@remix-run/dev';
import { netlifyPlugin } from "@netlify/remix-adapter/plugin";
import * as dotenv from 'dotenv';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
// Replace viteCommonjs with @rollup/plugin-commonjs
import commonjs from '@rollup/plugin-commonjs';

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

export default defineConfig((config: ConfigEnv): UserConfig => {
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
      target: 'es2020',
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true,
        requireReturnsDefault: 'namespace'
      },
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
          format: 'es'
        },
        plugins: [],
        onwarn(warning, warn) {
          if (warning.code === 'MIXED_EXPORTS') return;
          if (warning.code === 'CIRCULAR_DEPENDENCY') return;
          warn(warning);
        }
      }
    },
    optimizeDeps: {
      include: [
        '@remix-run/react',
        '@remix-run/node',
        '@remix-run/netlify',
        '@netlify/remix-adapter'
      ],
      exclude: ['@remix-run/dev/server-build'],
      esbuildOptions: {
        target: 'es2020',
        format: 'esm',
        platform: 'node',
        supported: { 
          'top-level-await': true 
        }
      }
    },
    resolve: {
      dedupe: ['react', 'react-dom'],
      preserveSymlinks: true,
      mainFields: ['module', 'main', 'browser']
    },
    plugins: [
      viteCommonJsTypeFixPlugin(), // Re-enable this plugin
      remix() as PluginOption,
      tsconfigPaths() as PluginOption,
      netlifyPlugin() as PluginOption,
      commonjs() as PluginOption,
      nodePolyfills({
        include: ['path', 'buffer', 'process', 'fs'],
        globals: {
          process: true,
          Buffer: true
        }
      }) as PluginOption,
      react() as PluginOption,
      UnoCSS() as PluginOption,
      chrome129IssuePlugin() as PluginOption,
      config.mode === 'production' && optimizeCssModules({ apply: 'build' })
    ].filter((p): p is PluginOption => Boolean(p)),
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
    configureServer(server: import('vite').ViteDevServer) {
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

function viteCommonJsTypeFixPlugin() {
  return {
    name: 'vite-commonjs-type-fix',
    configResolved(config: import('vite').ResolvedConfig) {
      // Find the commonjs resolver plugin
      const plugins = config.plugins || [];
      for (const plugin of plugins) {
        if (plugin && plugin.name === 'commonjs--resolver') {
          // Monkey patch the resolveId method to add type checking
          const originalResolveId = plugin.resolveId;
          if (originalResolveId) {
            plugin.resolveId = function(id, ...args) {
              // Handle non-string ids by returning null
              if (id === null || id === undefined || typeof id !== 'string') {
                console.log('Intercepted non-string ID in commonjs--resolver:', id);
                return null;
              }
              // Only proceed with string ids
              try {
                return typeof originalResolveId === 'function' ? originalResolveId.call(this, id, ...args) : originalResolveId.handler.call(this, id, ...args);
              } catch (error) {
                console.error('Error in commonjs--resolver resolveId:', error);
                return null;
              }
            };
          }
          
          // Also patch the load method if it exists
          const originalLoad = plugin.load;
          if (originalLoad) {
            plugin.load = function(id, ...args) {
              // Handle non-string ids
              if (id === null || id === undefined || typeof id !== 'string') {
                return null;
              }
              // Only proceed with string ids
              try {
                return typeof originalLoad === 'function' ? originalLoad.call(this, id, ...args) : originalLoad.handler.call(this, id, ...args);
              } catch (error) {
                console.error('Error in commonjs--resolver load:', error);
                return null;
              }
            };
          }
          
          // Patch transform method if it exists
          const originalTransform = plugin.transform;
          if (originalTransform) {
            plugin.transform = function(code, id, ...args) {
              // Handle non-string ids
              if (id === null || id === undefined || typeof id !== 'string') {
                return null;
              }
              // Only proceed with string ids and valid code
              if (typeof code !== 'string') {
                console.log('Intercepted non-string code in commonjs--resolver transform');
                return null;
              }
              try {
                return typeof originalTransform === 'function' ? originalTransform.call(this, code, id, ...args) : originalTransform.handler.call(this, code, id, ...args);
              } catch (error) {
                console.error('Error in commonjs--resolver transform:', error);
                return null;
              }
            };
          }
        }
      }
    }
  };
}
