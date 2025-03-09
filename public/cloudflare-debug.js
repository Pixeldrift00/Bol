// Cloudflare Pages specific debug script
(function() {
  console.log('[Cloudflare Debug] Script initialized');
  
  // Track loading stages
  const loadingStages = {
    scriptInitialized: true,
    domContentLoaded: false,
    windowLoaded: false,
    reactMounted: false
  };
  
  // Log loading progress
  function logProgress(stage, success) {
    loadingStages[stage] = success;
    console.log(`[Cloudflare Debug] ${stage}: ${success}`);
    updateDebugDisplay();
  }
  
  // Create debug display
  let debugDisplay = null;
  
  function createDebugDisplay() {
    if (debugDisplay) return;
    
    debugDisplay = document.createElement('div');
    debugDisplay.id = 'cloudflare-debug-display';
    debugDisplay.style.position = 'fixed';
    debugDisplay.style.bottom = '10px';
    debugDisplay.style.left = '10px';
    debugDisplay.style.background = 'rgba(0,0,0,0.8)';
    debugDisplay.style.color = 'white';
    debugDisplay.style.padding = '10px';
    debugDisplay.style.borderRadius = '5px';
    debugDisplay.style.zIndex = '99999';
    debugDisplay.style.fontSize = '12px';
    debugDisplay.style.fontFamily = 'monospace';
    debugDisplay.style.maxWidth = '80%';
    debugDisplay.style.overflow = 'auto';
    
    document.body.appendChild(debugDisplay);
  }
  
  function updateDebugDisplay() {
    if (!document.body) return;
    
    if (!debugDisplay) {
      createDebugDisplay();
    }
    
    let content = '<strong>Cloudflare Pages Debug</strong><br>';
    for (const [stage, status] of Object.entries(loadingStages)) {
      const icon = status ? '✅' : '⏳';
      content += `${icon} ${stage}<br>`;
    }
    
    // Add environment info
    content += '<br><strong>Environment:</strong><br>';
    content += `URL: ${window.location.href}<br>`;
    content += `User Agent: ${navigator.userAgent}<br>`;
    
    debugDisplay.innerHTML = content;
  }
  
  // Monitor DOM loading
  document.addEventListener('DOMContentLoaded', () => {
    logProgress('domContentLoaded', true);
    
    // Check if root element exists
    const rootElement = document.getElementById('root');
    if (rootElement) {
      console.log('[Cloudflare Debug] Root element found');
    } else {
      console.error('[Cloudflare Debug] Root element not found');
    }
  });
  
  // Monitor window load
  window.addEventListener('load', () => {
    logProgress('windowLoaded', true);
  });
  
  // Monitor React mounting
  const originalRender = window.ReactDOM?.render || window.ReactDOM?.hydrate || window.ReactDOM?.createRoot;
  if (originalRender) {
    console.log('[Cloudflare Debug] React detected, monitoring mounting');
  }
  
  // Check React mounting after a delay
  setTimeout(() => {
    const rootContent = document.getElementById('root');
    if (rootContent && rootContent.children.length > 0) {
      logProgress('reactMounted', true);
    } else {
      console.error('[Cloudflare Debug] React not mounted after timeout');
      logProgress('reactMounted', false);
    }
  }, 5000);
  
  // Force continue function
  window.forceContinue = function() {
    console.log('[Cloudflare Debug] Force continue triggered');
    document.dispatchEvent(new CustomEvent('webcontainer-failed'));
    document.dispatchEvent(new CustomEvent('force-continue'));
    
    // Add a message
    const forceMessage = document.createElement('div');
    forceMessage.style.position = 'fixed';
    forceMessage.style.top = '10px';
    forceMessage.style.right = '10px';
    forceMessage.style.background = 'rgba(255,165,0,0.9)';
    forceMessage.style.color = 'white';
    forceMessage.style.padding = '10px';
    forceMessage.style.borderRadius = '5px';
    forceMessage.style.zIndex = '99999';
    forceMessage.textContent = 'Force continue triggered. Refresh if app still not loading.';
    document.body.appendChild(forceMessage);
    
    // Add refresh button
    const refreshButton = document.createElement('button');
    refreshButton.textContent = 'Refresh Page';
    refreshButton.style.marginTop = '10px';
    refreshButton.style.padding = '5px 10px';
    refreshButton.style.background = 'white';
    refreshButton.style.color = 'black';
    refreshButton.style.border = 'none';
    refreshButton.style.borderRadius = '3px';
    refreshButton.style.cursor = 'pointer';
    refreshButton.style.display = 'block';
    refreshButton.onclick = () => window.location.reload();
    forceMessage.appendChild(refreshButton);
  };
  
  // Expose debug info to console
  window.cloudflareDebug = {
    loadingStages,
    forceContinue: window.forceContinue
  };
  
  console.log('[Cloudflare Debug] Debug helpers available in console as window.cloudflareDebug');
})();