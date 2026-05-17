/**
 * Noty — Beautiful Notes, Brilliant Ideas
 * Main JavaScript
 */
(function () {
  'use strict';

  // ============================================================
  // 1. NAVBAR — Scroll effect & mobile toggle
  // ============================================================
  var navbar = document.getElementById('nnNavbar');
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  var navLinkItems = navLinks.querySelectorAll('a');

  function handleNavScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('nn-navbar--scrolled');
    } else {
      navbar.classList.remove('nn-navbar--scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  navToggle.addEventListener('click', function () {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  navLinkItems.forEach(function (link) {
    link.addEventListener('click', function () {
      navToggle.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  // ============================================================
  // 2. HERO — Parallax sticky notes on mouse move
  // ============================================================
  var heroNotes = document.querySelectorAll('.nn-hero__note');
  var heroSection = document.querySelector('.nn-hero');

  if (heroSection && heroNotes.length) {
    document.addEventListener('mousemove', function (e) {
      var rect = heroSection.getBoundingClientRect();
      if (e.clientY > rect.bottom || e.clientY < rect.top) return;

      var xFactor = (e.clientX / window.innerWidth - 0.5) * 2;
      var yFactor = (e.clientY / window.innerHeight - 0.5) * 2;

      heroNotes.forEach(function (note, i) {
        var speed = 4 + i * 2;
        var x = xFactor * speed;
        var y = yFactor * speed;
        note.style.transform = 'translate(' + x + 'px, ' + y + 'px) rotate(' + (note.dataset.rotate || '0') + 'deg)';
      });
    });
  }

  // ============================================================
  // 3. TESTIMONIALS — Carousel
  // ============================================================
  var testimonials = document.querySelectorAll('.nn-testimonial');
  var dots = document.querySelectorAll('.nn-testimonials__dots span');
  var prevBtn = document.getElementById('testimonialPrev');
  var nextBtn = document.getElementById('testimonialNext');
  var currentTestimonial = 0;

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

  prevBtn.addEventListener('click', function () {
    var prev = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
    showTestimonial(prev);
    resetAutoInterval();
  });

  nextBtn.addEventListener('click', function () {
    var next = (currentTestimonial + 1) % testimonials.length;
    showTestimonial(next);
    resetAutoInterval();
  });

  dots.forEach(function (dot, idx) {
    dot.addEventListener('click', function () {
      showTestimonial(idx);
      resetAutoInterval();
    });
  });

  // ============================================================
  // 4. SMOOTH SCROLL
  // ============================================================
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        var navOffset = navbar.offsetHeight;
        var targetPos = target.getBoundingClientRect().top + window.pageYOffset - navOffset;
        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });
      }
    });
  });

  // ============================================================
  // 5. CTA FORM — Simple validation
  // ============================================================
  var ctaForm = document.querySelector('.nn-cta__form');
  if (ctaForm) {
    ctaForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = this.querySelector('.nn-cta__input');
      var email = input.value.trim();
      if (email && email.indexOf('@') > -1) {
        input.value = '';
        input.placeholder = 'Thanks! Check your inbox :)';
        input.style.borderColor = '#bbf7d0';
      } else {
        input.style.borderColor = '#d94b2a';
        input.focus();
      }
    });
  }

  // ============================================================
  // 6. INTERSECTION OBSERVER — Scroll reveal animations
  // ============================================================
  if ('IntersectionObserver' in window) {
    var revealElements = document.querySelectorAll(
      '.nn-feature-card, .nn-how-step, .nn-pricing-card'
    );

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    revealElements.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });
  }

})();
