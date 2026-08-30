// lightbox.js — open a gallery thumbnail fullscreen on click.
(function () {
  var lb = document.getElementById('lightbox');
  if (!lb) return;
  var img = lb.querySelector('.lightbox__img');

  function open(src, alt) {
    img.src = src;
    img.alt = alt || '';
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
  }
  function close() {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
  }

  document.querySelectorAll('.gallery__grid img').forEach(function (im) {
    im.addEventListener('click', function () { open(im.currentSrc || im.src, im.alt); });
  });

  lb.addEventListener('click', function (e) {
    if (e.target === lb || e.target.classList.contains('lightbox__close')) close();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
})();
