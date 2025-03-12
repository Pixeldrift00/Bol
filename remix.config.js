/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  serverModuleFormat: "esm",
  serverBuildTarget: "netlify",
  server: "./server.js",
  future: {
    v2_dev: true,
    v2_errorBoundary: true,
    v2_headers: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_routeConvention: true,
  },
  routes(defineRoutes) {
    return defineRoutes((route) => {
      route("/@app/*", "routes/$1.tsx");
      route("/api/*", "routes/api.$1.tsx");
    });
  }
};
