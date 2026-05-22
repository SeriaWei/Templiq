/**
 * Main — Marex
 * Scroll animations, counter effects, form handling, and interactions
 */
(function () {
  'use strict';

  // ============================================================
  // Intersection Observer for reveal animations
  // ============================================================
  function initRevealAnimations() {
    var revealSelectors = [
      '.mx-categories__card',
      '.mx-showcase__card',
      '.mx-services__card',
      '.mx-stats__item',
      '.mx-contact__inner',
      '.mx-hero__stats'
    ];

    var revealElements = document.querySelectorAll(revealSelectors.join(', '));

    if (revealElements.length === 0) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    revealElements.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
      observer.observe(el);
    });
  }

  // ============================================================
  // Animated counter
  // ============================================================
  function initCounters() {
    var counters = document.querySelectorAll('[data-target]');

    if (counters.length === 0) return;

    var counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var target = parseFloat(el.getAttribute('data-target'));
            var duration = 2000;
            var startTime = null;

            function animate(timestamp) {
              if (!startTime) startTime = timestamp;
              var progress = Math.min((timestamp - startTime) / duration, 1);
              // Ease out cubic
              var eased = 1 - Math.pow(1 - progress, 3);
              var current = eased * target;

              if (Number.isInteger(target)) {
                el.textContent = Math.floor(current);
              } else {
                el.textContent = current.toFixed(1);
              }

              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                el.textContent = Number.isInteger(target) ? target : target.toFixed(1);
              }
            }

            requestAnimationFrame(animate);
            counterObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.3 }
    );

    counters.forEach(function (el) {
      counterObserver.observe(el);
    });
  }

  // ============================================================
  // Hero stats counter (separate for the hero section)
  // ============================================================
  function initHeroCounters() {
    var heroCounters = document.querySelectorAll('.mx-hero__stat-counter');

    if (heroCounters.length === 0) return;

    var heroObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            heroCounters.forEach(function (el) {
              var target = parseFloat(el.getAttribute('data-target'));
              var duration = 2000;
              var startTime = null;

              function animate(timestamp) {
                if (!startTime) startTime = timestamp;
                var progress = Math.min((timestamp - startTime) / duration, 1);
                var eased = 1 - Math.pow(1 - progress, 3);
                var current = Math.floor(eased * target);

                el.textContent = current;

                if (progress < 1) {
                  requestAnimationFrame(animate);
                } else {
                  el.textContent = target;
                }
              }

              requestAnimationFrame(animate);
            });
            heroObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    var heroStats = document.querySelector('.mx-hero__stats');
    if (heroStats) {
      heroObserver.observe(heroStats);
    }
  }

  // ============================================================
  // Parallax effect on stats background
  // ============================================================
  function initParallax() {
    var statsSection = document.querySelector('.mx-stats');
    if (!statsSection) return;

    window.addEventListener('scroll', function () {
      var rect = statsSection.getBoundingClientRect();
      var windowHeight = window.innerHeight;
      var offset = rect.top / windowHeight;

      if (offset > -0.5 && offset < 1.5) {
        var bgImage = statsSection.querySelector('.mx-stats__bg-image');
        if (bgImage) {
          bgImage.style.transform = 'translateY(' + (offset * 20 - 10) + 'px)';
        }
      }
    }, { passive: true });
  }

  // ============================================================
  // Init
  // ============================================================
  document.addEventListener('DOMContentLoaded', function () {
    initRevealAnimations();
    initCounters();
    initHeroCounters();
    initParallax();
  });
})();