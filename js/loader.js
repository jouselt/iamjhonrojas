// Hide the loading overlay once the page is ready.
// Fallback timeout guarantees the user is never trapped behind the spinner
// if some heavy image is slow to fire window.load.
(function () {
  var loader = document.getElementById('loader');
  function hide() {
    if (!loader) return;
    loader.classList.add('is-hidden');
    setTimeout(function () { if (loader && loader.parentNode) loader.parentNode.removeChild(loader); }, 600);
  }
  if (document.readyState === 'complete') {
    hide();
  } else {
    window.addEventListener('load', hide);
  }
  setTimeout(hide, 3000);
})();
