// Handler for Cloudflare Pages
export function onRequest(context) {
  // Get the URL and pathname
  const url = new URL(context.request.url);
  const pathname = url.pathname;
  
  // If this is the root path or an asset request, serve the static content
  if (pathname === '/' || pathname.includes('.')) {
    return context.next();
  }
  
  // For all other routes, serve the index.html file to support SPA routing
  return new Response(null, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}