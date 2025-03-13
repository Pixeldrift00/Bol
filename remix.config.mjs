/** @type {import('@remix-run/netlify').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*", "**/*.test.{js,jsx,ts,tsx}"],
  serverModuleFormat: "esm",
  serverBuildTarget: "netlify",
  serverBuildPath: "build/server/index.js",
  // Remove serverDependenciesToBundle: "all" and be more specific
  serverDependenciesToBundle: [
    // Bundle only what's needed for Netlify
    /^(?!@remix-run\/netlify|@netlify).*/
  ],
  server: "./server.js",
  future: {
    v2_errorBoundary: true,
    v2_headers: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
  },
  routes(defineRoutes) {
    return defineRoutes((route) => {
      route("/@app/*", "routes/$1.tsx");
      route("/api/*", "routes/api.$1.tsx");
    });
  },
  watchPaths: ["./package.json"]
};
