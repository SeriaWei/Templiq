/**
 * Main — Aether
 * Apple-inspired mobile website - Intersection Observer animations & interactions
 */
(function () {
  'use strict';

  // ============================================================
  // Intersection Observer for reveal animations
  // ============================================================
  function initRevealAnimations() {
    var revealElements = document.querySelectorAll(
      '.ae-showcase__card, ' +
      '.ae-features__card, ' +
      '.ae-gallery__item'
    );

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
      el.style.transition =
        'opacity 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94), ' +
        'transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      observer.observe(el);
    });
  }

  // ============================================================
  // Gallery item click -> smooth scroll (placeholder interaction)
  // ============================================================
  function initGalleryInteraction() {
    var galleryItems = document.querySelectorAll('.ae-gallery__item');

    galleryItems.forEach(function (item) {
      item.addEventListener('click', function () {
        // Subtle feedback: briefly lighten
        this.style.transition = 'filter 0.3s ease';
        this.style.filter = 'brightness(1.2)';
        setTimeout(
          function (el) {
            el.style.filter = '';
          },
          300,
          this
        );
      });
    });
  }

  // ============================================================
  // Newsletter form
  // ============================================================
  function initNewsletter() {
    var form = document.querySelector('.ae-footer__form');
    if (!form) return;

    var input = form.querySelector('.ae-footer__input');
    var submitBtn = form.querySelector('.ae-footer__submit');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = input.value.trim();

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        // Error state
        input.style.borderColor = '#ff453a';
        input.placeholder = '请输入有效的邮箱地址';
        return;
      }

      // Success
      input.style.borderColor = 'var(--ae-success)';
      input.value = '';
      input.placeholder = '订阅成功！感谢您';
      submitBtn.style.background = 'var(--ae-success)';

      setTimeout(function () {
        input.style.borderColor = '';
        input.placeholder = '输入您的邮箱';
        submitBtn.style.background = '';
      }, 3000);
    });
  }

  // ============================================================
  // Hero scroll hint fade on scroll
  // ============================================================
  function initScrollHint() {
    var scrollHint = document.querySelector('.ae-hero__scroll-hint');
    if (!scrollHint) return;

    window.addEventListener('scroll', function () {
      var scrollPos = window.pageYOffset || document.documentElement.scrollTop;
      var opacity = Math.max(0, 1 - scrollPos / 200);
      scrollHint.style.opacity = opacity;
      scrollHint.style.transform =
        'translateX(-50%) translateY(' + scrollPos * 0.05 + 'px)';
      scrollHint.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    });
  }

  // ============================================================
  // Parallax effect for hero orbs
  // ============================================================
  function initParallaxOrbs() {
    var orbs = document.querySelectorAll('.ae-hero__orb');

    if (orbs.length === 0) return;

    window.addEventListener('scroll', function () {
      var scrollPos = window.pageYOffset || document.documentElement.scrollTop;
      var factor = scrollPos * 0.03;

      orbs.forEach(function (orb, index) {
        var direction = index % 2 === 0 ? 1 : -1;
        orb.style.transform =
          orb.style.transform.replace(/translateY\([^)]+\)/, '') +
          ' translateY(' + factor * direction + 'px)';
      });
    });
  }

  // ============================================================
  // Init on DOM ready
  // ============================================================
  function init() {
    initRevealAnimations();
    initGalleryInteraction();
    initNewsletter();
    initScrollHint();
    initParallaxOrbs();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();