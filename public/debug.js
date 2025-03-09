// Add this to your public folder
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded');
  
  // Check if WebContainer API is available
  if (window.WebContainer) {
    console.log('WebContainer API is available');
  } else {
    console.log('WebContainer API is NOT available');
  }
  
  // Add a visible message to the page
  const debugDiv = document.createElement('div');
  debugDiv.style.position = 'fixed';
  debugDiv.style.bottom = '10px';
  debugDiv.style.right = '10px';
  debugDiv.style.background = 'rgba(0,0,0,0.7)';
  debugDiv.style.color = 'white';
  debugDiv.style.padding = '10px';
  debugDiv.style.borderRadius = '5px';
  debugDiv.style.zIndex = '9999';
  debugDiv.textContent = 'Debug mode: Checking WebContainer API...';
  document.body.appendChild(debugDiv);
  
  // Update after a delay to check if WebContainer loaded
  setTimeout(() => {
    if (window.WebContainer) {
      debugDiv.textContent = 'WebContainer API loaded successfully!';
      debugDiv.style.background = 'rgba(0,128,0,0.7)';
    } else {
      debugDiv.textContent = 'WebContainer API failed to load!';
      debugDiv.style.background = 'rgba(255,0,0,0.7)';
    }
  }, 5000);
});