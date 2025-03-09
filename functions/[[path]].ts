// Simple handler for Cloudflare Pages
export function onRequest(context) {
  // For API routes, pass through to the appropriate function
  const url = new URL(context.request.url);
  
  if (url.pathname.startsWith('/api/')) {
    // Let API requests be handled by other functions
    return context.next();
  }
  
  // For all other routes, let the static site handle it
  return context.next();
}