(function () {
  var finishes = {
    mist: { body: '#e8e3d4', shadow: '#b9ad98' },
    clay: { body: '#b86842', shadow: '#7f3f28' },
    sage: { body: '#8b9d84', shadow: '#66735f' },
    ink: { body: '#20211c', shadow: '#090a08' }
  };

  var cup = document.getElementById('shopCup');
  var swatches = document.querySelectorAll('.cc-commerce__swatches button');

  swatches.forEach(function (button) {
    button.addEventListener('click', function () {
      var finish = finishes[button.getAttribute('data-finish')];

      swatches.forEach(function (item) {
        item.classList.remove('is-active');
      });

      button.classList.add('is-active');
      cup.classList.add('is-changing');
      cup.style.setProperty('--cup-body', finish.body);
      cup.style.setProperty('--cup-shadow', finish.shadow);

      window.setTimeout(function () {
        cup.classList.remove('is-changing');
      }, 180);
    });
  });

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });

    document.querySelectorAll('.cc-reveal').forEach(function (item) {
      item.style.animationPlayState = 'paused';
      observer.observe(item);
    });
  }
})();