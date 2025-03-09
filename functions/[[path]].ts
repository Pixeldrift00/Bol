// Handler for Cloudflare Pages
export function onRequest(context) {
  // For API routes, pass through to the appropriate function
  const url = new URL(context.request.url);
  
  if (url.pathname.startsWith('/api/')) {
    return context.next();
  }
  
  // For all other routes, serve the SPA
  return context.next();
}