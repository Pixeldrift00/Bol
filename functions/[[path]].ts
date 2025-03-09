// Simple handler for Cloudflare Pages
export function onRequest(context) {
  const url = new URL(context.request.url);
  
  // API routes should be handled by functions
  if (url.pathname.startsWith('/api/')) {
    return new Response("API endpoint not implemented", { status: 501 });
  }
  
  // For all other routes, serve the SPA
  return new Response(null, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
      'Location': '/',
    },
  });
}