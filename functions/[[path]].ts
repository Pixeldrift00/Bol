// Handler for Cloudflare Pages
export function onRequest(context) {
  // Let Cloudflare Pages handle the request with the _redirects file
  return context.next();
}