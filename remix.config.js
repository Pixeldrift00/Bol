/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  serverModuleFormat: "cjs", // Change to CommonJS for better Netlify compatibility
  serverBuildTarget: "netlify", // Add Netlify as the build target
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
      // Define explicit route mapping for @app paths
      route("/app/*", "routes/$1.tsx");
    });
  },
  serverDependenciesToBundle: [
    /^marked.*/,
    /^rehype.*/,
    /^remark.*/,
    /^unified.*/,
    /^unist.*/,
    /^hast.*/,
    /^bail.*/,
    /^trough.*/,
    /^mdast.*/,
    /^micromark.*/,
    /^decode.*/,
    /^character.*/,
    /^property.*/,
    /^space.*/,
    /^comma.*/,
    /^react-markdown$/,
    /^vfile.*/,
  ]
};
