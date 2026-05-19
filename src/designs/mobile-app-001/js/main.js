/**
 * Main — Lingua
 * Scroll animations, interactions, and form handling
 */
(function () {
  'use strict';

  // ============================================================
  // Intersection Observer for reveal animations
  // ============================================================
  function initRevealAnimations() {
    var revealSelectors = [
      '.lg-features__card',
      '.lg-howitworks__step',
      '.lg-testimonials__card',
      '.lg-cta__content',
      '.lg-hero__stats',
      '.lg-features__highlight'
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
      // Store original transform if any
      var origTransform = window.getComputedStyle(el).transform;
      var hasStagger = el.classList.contains('lg-features__card');

      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';

      // Stagger for feature cards
      if (hasStagger) {
        var index = Array.from(el.parentElement.children).indexOf(el);
        el.style.transitionDelay = (index * 0.1) + 's';
      }

      el.style.transition =
        'opacity 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94), ' +
        'transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94), ' +
        'box-shadow 0.4s ease';

      observer.observe(el);
    });
  }

  // ============================================================
  // Timeline step reveal with direction awareness
  // ============================================================
  function initTimelineAnimation() {
    var steps = document.querySelectorAll('.lg-howitworks__step');
    if (steps.length === 0) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var content = entry.target.querySelector('.lg-howitworks__step-content');
            var number = entry.target.querySelector('.lg-howitworks__step-number');

            if (content) {
              var offset = entry.target.classList.contains('lg-howitworks__step--left')
                ? '-30px'
                : '30px';
              content.style.opacity = '1';
              content.style.transform = 'translateX(0)';
            }

            if (number) {
              number.style.opacity = '1';
              number.style.transform = 'translateX(-50%) scale(1)';
            }

            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -60px 0px'
      }
    );

    steps.forEach(function (step) {
      var content = step.querySelector('.lg-howitworks__step-content');
      var number = step.querySelector('.lg-howitworks__step-number');

      if (content) {
        content.style.opacity = '0';
        content.style.transform = 'translateX(' +
          (step.classList.contains('lg-howitworks__step--left') ? '-30px' : '30px') +
        ')';
        content.style.transition =
          'opacity 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94), ' +
          'transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      }

      if (number) {
        number.style.opacity = '0';
        number.style.transform = 'translateX(-50%) scale(0.6)';
        number.style.transition =
          'opacity 0.5s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
      }

      observer.observe(step);
    });
  }

  // ============================================================
  // Parallax effect for globe decoration
  // ============================================================
  function initParallax() {
    var globeBg = document.querySelector('.lg-hero__globe-bg');
    if (!globeBg) return;

    window.addEventListener('scroll', function () {
      var scrollY = window.scrollY;
      var speed = 0.15;
      globeBg.style.transform = 'translateY(calc(-50% + ' + (scrollY * speed) + 'px))';
    }, { passive: true });
  }

  // ============================================================
  // Newsletter form
  // ============================================================
  function initNewsletter() {
    var form = document.querySelector('.lg-footer__form');
    if (!form) return;

    var input = form.querySelector('.lg-footer__input');
    var submitBtn = form.querySelector('.lg-footer__submit');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = input.value.trim();

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        input.style.borderColor = 'var(--l-accent)';
        input.style.color = 'var(--l-accent)';
        setTimeout(function () {
          input.style.borderColor = '';
          input.style.color = '';
        }, 1500);
        return;
      }

      // Success feedback
      var originalBtnHtml = submitBtn.innerHTML;
      submitBtn.innerHTML =
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
        '<path d="M20 6L9 17l-5-5"/>' +
        '</svg>';
      submitBtn.style.color = 'var(--l-success)';

      input.value = '';
      input.placeholder = 'Thanks for subscribing!';

      setTimeout(function () {
        submitBtn.innerHTML = originalBtnHtml;
        submitBtn.style.color = '';
        input.placeholder = 'Enter your email';
      }, 3000);
    });
  }

  // ============================================================
  // App card entrance stagger
  // ============================================================
  function initAppCardAnimation() {
    var cards = document.querySelectorAll('.lg-hero__app-card');
    cards.forEach(function (card, i) {
      card.style.opacity = '0';
      card.style.transform = 'translateY(16px)';
      card.style.transition =
        'opacity 0.5s ease ' + (1 + i * 0.15) + 's, ' +
        'transform 0.5s ease ' + (1 + i * 0.15) + 's';

      setTimeout(function () {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 100);
    });
  }

  // ============================================================
  // Smooth scroll for nav links
  // ============================================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var href = this.getAttribute('href');
        if (href === '#') return;

        var target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // ============================================================
  // Initialize
  // ============================================================
  function init() {
    initRevealAnimations();
    initTimelineAnimation();
    initParallax();
    initNewsletter();
    initAppCardAnimation();
    initSmoothScroll();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();