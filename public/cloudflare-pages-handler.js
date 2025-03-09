// Cloudflare Pages specific handler script
(function() {
  console.log('[Cloudflare Pages Handler] Script initialized');
  
  // Check if we're running on Cloudflare Pages
  const isCloudflarePages = window.location.hostname.includes('pages.dev') || 
                           document.referrer.includes('pages.dev');
  
  if (isCloudflarePages) {
    console.log('[Cloudflare Pages Handler] Cloudflare Pages environment detected');
    
    // Set global flag for other scripts to check
    window.CLOUDFLARE_PAGES_ENVIRONMENT = true;
    
    // Add this to the HTML element for CSS targeting
    document.documentElement.setAttribute('data-cloudflare-pages', 'true');
    
    // Listen for DOMContentLoaded to check app initialization
    document.addEventListener('DOMContentLoaded', function() {
      console.log('[Cloudflare Pages Handler] DOM loaded, setting up WebContainer bypass');
      
      // Create a global WebContainer mock to prevent errors
      if (typeof window.WebContainer === 'undefined') {
        console.log('[Cloudflare Pages Handler] Creating WebContainer mock');
        
        // Create a mock WebContainer API
        window.WebContainer = {
          boot: function() {
            console.log('[Cloudflare Pages Handler] Mock WebContainer.boot called');
            return Promise.reject(new Error('WebContainer not supported in Cloudflare Pages'));
          }
        };
        
        // Dispatch event to notify app that WebContainer failed
        setTimeout(function() {
          console.log('[Cloudflare Pages Handler] Dispatching webcontainer-failed event');
          document.dispatchEvent(new CustomEvent('webcontainer-failed'));
          document.dispatchEvent(new CustomEvent('cloudflare-pages-detected'));
        }, 1000);
      }
      
      // Monitor app loading
      const appLoadingCheck = setInterval(function() {
        const rootElement = document.getElementById('root');
        
        if (rootElement && rootElement.children.length > 0) {
          console.log('[Cloudflare Pages Handler] Application appears to be loaded');
          clearInterval(appLoadingCheck);
        } else {
          console.log('[Cloudflare Pages Handler] Application still loading...');
          
          // After 8 seconds, try to force continue if app isn't loaded
          if (window.forceContinue) {
            console.log('[Cloudflare Pages Handler] Forcing application to continue');
            window.forceContinue();
          }
        }
      }, 8000);
    });
    
    // Add a small visual indicator for Cloudflare Pages mode
    window.addEventListener('load', function() {
      const indicator = document.createElement('div');
      indicator.style.position = 'fixed';
      indicator.style.bottom = '10px';
      indicator.style.left = '10px';
      indicator.style.background = 'rgba(244, 127, 35, 0.8)';
      indicator.style.color = 'white';
      indicator.style.padding = '5px 10px';
      indicator.style.borderRadius = '3px';
      indicator.style.fontSize = '12px';
      indicator.style.fontFamily = 'system-ui, sans-serif';
      indicator.style.zIndex = '9999';
      indicator.textContent = 'Cloudflare Pages Mode';
      document.body.appendChild(indicator);
    });
  }
})();