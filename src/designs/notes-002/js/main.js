/**
 * Scriptor — The Art of Note-Taking
 * Main JavaScript
 */
(function () {
  'use strict';

  // ============================================================
  // 1. NAVBAR — Scroll effect & mobile toggle
  // ============================================================
  var navbar = document.getElementById('srNavbar');
  var navToggle = document.getElementById('srNavToggle');
  var navLinks = document.getElementById('srNavLinks');
  var navLinkItems = navLinks ? navLinks.querySelectorAll('a') : [];
  var navRight = document.querySelector('.sr-navbar__right');

  function handleNavScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('sr-navbar--scrolled');
    } else {
      navbar.classList.remove('sr-navbar--scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  if (navToggle) {
    navToggle.addEventListener('click', function () {
      navToggle.classList.toggle('active');
      navRight.classList.toggle('open');
    });
  }

  navLinkItems.forEach(function (link) {
    link.addEventListener('click', function () {
      navToggle.classList.remove('active');
      navRight.classList.remove('open');
    });
  });

  // ============================================================
  // 2. ACTIVE NAV LINK — Highlight on scroll
  // ============================================================
  var sections = document.querySelectorAll('section[id]');
  var navAnchors = Array.from(navLinkItems);

  function updateActiveLink() {
    var scrollPos = window.scrollY + 120;

    sections.forEach(function (section) {
      var sectionTop = section.offsetTop;
      var sectionBottom = sectionTop + section.offsetHeight;
      var id = section.getAttribute('id');

      if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
        navAnchors.forEach(function (a) {
          a.classList.remove('active');
          if (a.getAttribute('href') === '#' + id) {
            a.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();

  // ============================================================
  // 3. TESTIMONIALS — Carousel
  // ============================================================
  var testimonials = document.querySelectorAll('.sr-testimonial');
  var dots = document.querySelectorAll('.sr-testimonials__dots span');
  var prevBtn = document.getElementById('srTestPrev');
  var nextBtn = document.getElementById('srTestNext');
  var currentTestimonial = 0;

  if (testimonials.length && dots.length) {
    function showTestimonial(index) {
      testimonials.forEach(function (t) { t.classList.remove('active'); });
      dots.forEach(function (d) { d.classList.remove('active'); });
      testimonials[index].classList.add('active');
      dots[index].classList.add('active');
      currentTestimonial = index;
    }

    var autoInterval = setInterval(function () {
      var next = (currentTestimonial + 1) % testimonials.length;
      showTestimonial(next);
    }, 6000);

    function resetAutoInterval() {
      clearInterval(autoInterval);
      autoInterval = setInterval(function () {
        var n = (currentTestimonial + 1) % testimonials.length;
        showTestimonial(n);
      }, 6000);
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        var prev = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
        showTestimonial(prev);
        resetAutoInterval();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        var next = (currentTestimonial + 1) % testimonials.length;
        showTestimonial(next);
        resetAutoInterval();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showTestimonial(i);
        resetAutoInterval();
      });
    });
  }

  // ============================================================
  // 4. STATS — Animated counter
  // ============================================================
  var statNumbers = document.querySelectorAll('.sr-stat__number');
  var statsSection = document.querySelector('.sr-stats');

  if (statNumbers.length && statsSection) {
    var statsAnimated = false;

    function animateStats() {
      if (statsAnimated) return;

      var rect = statsSection.getBoundingClientRect();
      if (rect.top > window.innerHeight) return;

      statsAnimated = true;

      statNumbers.forEach(function (el) {
        var target = parseFloat(el.getAttribute('data-target'));
        var duration = 2000;
        var startTime = null;

        function step(timestamp) {
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
            requestAnimationFrame(step);
          } else {
            el.textContent = target;
          }
        }

        requestAnimationFrame(step);
      });
    }

    window.addEventListener('scroll', animateStats, { passive: true });
    animateStats();
  }

  // ============================================================
  // 5. SMOOTH SCROLL — For anchor links
  // ============================================================
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        var offset = 80;
        var targetPos = target.offsetTop - offset;
        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });
      }
    });
  });

  // ============================================================
  // 6. SCROLL REVEAL — Fade in sections as they enter viewport
  // ============================================================
  var revealElements = document.querySelectorAll(
    '.sr-feature-card, .sr-how__step-row, .sr-stat'
  );

  function handleReveal() {
    revealElements.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      var windowHeight = window.innerHeight;
      if (rect.top < windowHeight * 0.85) {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }
    });
  }

  revealElements.forEach(function (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    var delay = el.getAttribute('data-delay');
    if (delay) {
      el.style.transitionDelay = delay + 'ms';
    }
  });

  window.addEventListener('scroll', handleReveal, { passive: true });
  handleReveal();

})();