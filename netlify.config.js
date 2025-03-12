// Netlify configuration for Bolt application

module.exports = {
  // Configure build plugins if needed
  plugins: [],
  
  // Configure build settings
  build: {
    // Command to execute before the build
    command: "pnpm run build",
    // Directory to publish (output of the build)
    publish: "public",
    // Environment variables to be set during build
    environment: {
      NODE_VERSION: "18.18.0",
      PNPM_VERSION: "9.4.0",
      // Add any other environment variables needed for the build
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