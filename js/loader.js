// Hide the loading overlay as soon as the DOM is ready.
// The model PNGs load as CSS backgrounds and are heavy; waiting for window.load
// would trap the user behind the spinner. Hide on DOMContentLoaded + a safety
// timeout so the page is never stuck.
(function () {
  var loader = document.getElementById('loader');
  function hide() {
    if (!loader) return;
    loader.classList.add('is-hidden');
    setTimeout(function () { if (loader && loader.parentNode) loader.parentNode.removeChild(loader); }, 600);
  }
  if (document.readyState !== 'loading') {
    hide();
  } else {
    document.addEventListener('DOMContentLoaded', hide);
  }
  // Absolute safety net
  setTimeout(hide, 2500);
})();
