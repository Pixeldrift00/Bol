// Cloudflare Pages specific fallback script
(function() {
  console.log('[Cloudflare Fallback] Script initialized');
  
  // Check if we're running on Cloudflare Pages
  const isCloudflarePages = window.location.hostname.includes('pages.dev') || 
                           document.referrer.includes('pages.dev');
  
  // Set a timeout to check if the app has loaded properly
  const fallbackTimeout = setTimeout(() => {
    const rootElement = document.getElementById('root');
    
    // If the root element is empty or we're still showing loading state
    if (!rootElement || rootElement.children.length === 0 || document.body.classList.contains('loading')) {
      console.log('[Cloudflare Fallback] Application failed to load, activating fallback');
      
      // Try to dispatch the webcontainer-failed event
      document.dispatchEvent(new CustomEvent('webcontainer-failed'));
      
      // If we're on Cloudflare Pages, try to bypass WebContainer initialization
      if (isCloudflarePages) {
        console.log('[Cloudflare Fallback] Detected Cloudflare Pages environment, applying specific fixes');
        
        // Set a flag that can be checked by the application
        window.CLOUDFLARE_PAGES_ENVIRONMENT = true;
        
        // Dispatch a custom event that the app can listen for
        document.dispatchEvent(new CustomEvent('cloudflare-pages-detected'));
        
        // Force the app to continue without WebContainer if possible
        if (window.forceContinue) {
          window.forceContinue();
        }
      }
      
      // Add a visible notification
      const fallbackNotice = document.createElement('div');
      fallbackNotice.style.position = 'fixed';
      fallbackNotice.style.top = '10px';
      fallbackNotice.style.left = '50%';
      fallbackNotice.style.transform = 'translateX(-50%)';
      fallbackNotice.style.background = 'rgba(255,165,0,0.9)';
      fallbackNotice.style.color = 'white';
      fallbackNotice.style.padding = '10px 20px';
      fallbackNotice.style.borderRadius = '5px';
      fallbackNotice.style.zIndex = '999999';
      fallbackNotice.style.textAlign = 'center';
      fallbackNotice.style.maxWidth = '80%';
      fallbackNotice.innerHTML = '<strong>Cloudflare Pages Detected</strong><br>Some features may be limited. <button id="cf-refresh" style="background: white; color: black; border: none; padding: 5px 10px; margin-top: 5px; border-radius: 3px; cursor: pointer;">Refresh</button>';
      document.body.appendChild(fallbackNotice);
      
      // Add refresh button functionality
      document.getElementById('cf-refresh').addEventListener('click', () => {
        window.location.reload();
      });
    }
  }, 10000); // Check after 10 seconds
  
  // Clear the timeout if the app loads successfully
  window.addEventListener('load', () => {
    setTimeout(() => {
      const rootElement = document.getElementById('root');
      if (rootElement && rootElement.children.length > 0 && !document.body.classList.contains('loading')) {
        console.log('[Cloudflare Fallback] Application loaded successfully, disabling fallback');
        clearTimeout(fallbackTimeout);
      }
    }, 2000); // Give a little extra time for React to render
  });
})();