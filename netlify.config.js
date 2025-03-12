// Netlify configuration for Bolt application

module.exports = {
  // Configure build plugins if needed
  plugins: [],
  
  // Configure build settings
  build: {
    base: "/",
    command: "pnpm install && pnpm run build",
    publish: "build/client",
    environment: {
      NODE_VERSION: "20.15.1",
      PNPM_VERSION: "9.4.0",
      NODE_ENV: "production"
    },
  },
  
  // Configure development settings
  dev: {
    command: "pnpm run dev",
    port: 5173,
    targetPort: 5173,
  },
  
  // Configure serverless functions
  functions: {
    directory: "functions",
    node_bundler: "esbuild",
    included_files: ["build/server/**/*"]
  },
  
  // Configure redirects
  redirects: [
    {
      from: "/*",
      to: "/index.html",
      status: 200,
    },
  ],
};