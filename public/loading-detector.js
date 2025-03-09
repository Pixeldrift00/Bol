// Loading detector script to prevent getting stuck on loading screen
(function() {
  // Check if the page is stuck loading
  let loadingTimeout = setTimeout(() => {
    // If the page is still loading after 15 seconds, try to force continue
    if (document.body.classList.contains('loading') || 
        document.getElementById('root')?.children.length === 0) {
      console.error('Page appears to be stuck loading, attempting to continue');
      
      // Try to dispatch an event that our app might be listening for
      document.dispatchEvent(new CustomEvent('webcontainer-failed'));
      
      // Add a visible message
      const loadingDiv = document.createElement('div');
      loadingDiv.style.position = 'fixed';
      loadingDiv.style.top = '10px';
      loadingDiv.style.left = '10px';
      loadingDiv.style.background = 'rgba(255,0,0,0.7)';
      loadingDiv.style.color = 'white';
      loadingDiv.style.padding = '10px';
      loadingDiv.style.borderRadius = '5px';
      loadingDiv.style.zIndex = '9999';
      loadingDiv.textContent = 'Loading timeout reached. Try refreshing the page.';
      document.body.appendChild(loadingDiv);
      
      // Add a refresh button
      const refreshButton = document.createElement('button');
      refreshButton.textContent = 'Refresh Page';
      refreshButton.style.marginTop = '10px';
      refreshButton.style.padding = '5px 10px';
      refreshButton.style.background = 'white';
      refreshButton.style.color = 'black';
      refreshButton.style.border = 'none';
      refreshButton.style.borderRadius = '3px';
      refreshButton.style.cursor = 'pointer';
      refreshButton.onclick = () => window.location.reload();
      loadingDiv.appendChild(refreshButton);
    }
  }, 15000);

  // Clear the timeout if the page loads successfully
  window.addEventListener('DOMContentLoaded', () => {
    // Give a little extra time for React to render
    setTimeout(() => {
      if (document.getElementById('root')?.children.length > 0) {
        clearTimeout(loadingTimeout);
      }
    }, 2000);
  });
})();