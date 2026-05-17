/**
 * CrystaMem — 晶存科技
 * Main JavaScript
 */

(function () {
  'use strict';

  // ============================================================
  // 1. NAVBAR — Scroll effect & mobile toggle
  // ============================================================
  var navbar = document.getElementById('cmNavbar');
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  var navLinkItems = navLinks.querySelectorAll('a');

  // Scroll handler
  function handleNavScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('cm-navbar--scrolled');
    } else {
      navbar.classList.remove('cm-navbar--scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  // Mobile toggle
  navToggle.addEventListener('click', function () {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  // Close mobile nav on link click
  navLinkItems.forEach(function (link) {
    link.addEventListener('click', function () {
      navToggle.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  // ============================================================
  // 2. HERO — Particle Canvas Animation
  // ============================================================
  var canvas = document.getElementById('heroCanvas');
  var ctx = canvas.getContext('2d');
  var particles = [];
  var connections = [];
  var mouseX = -1000;
  var mouseY = -1000;
  var animationId;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Particle class
  function Particle(x, y) {
    this.x = x || Math.random() * canvas.width;
    this.y = y || Math.random() * canvas.height;
    this.size = Math.random() * 2 + 1;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.speedY = (Math.random() - 0.5) * 0.4;
    this.opacity = Math.random() * 0.4 + 0.1;
    this.hue = Math.random() > 0.7 ? 40 : 190; // 190=cyan, 40=amber
  }

  Particle.prototype.update = function () {
    this.x += this.speedX;
    this.y += this.speedY;

    // Wrap around edges
    if (this.x < 0) this.x = canvas.width;
    if (this.x > canvas.width) this.x = 0;
    if (this.y < 0) this.y = canvas.height;
    if (this.y > canvas.height) this.y = 0;

    // Mouse interaction
    var dx = this.x - mouseX;
    var dy = this.y - mouseY;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 120) {
      var force = (120 - dist) / 120;
      this.x += (dx / dist) * force * 0.5;
      this.y += (dy / dist) * force * 0.5;
    }
  };

  Particle.prototype.draw = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    var color = this.hue === 190 ? '0, 212, 255' : '245, 158, 11';
    ctx.fillStyle = 'rgba(' + color + ', ' + this.opacity + ')';
    ctx.fill();

    // Glow for larger particles
    if (this.size > 1.5) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + color + ', ' + (this.opacity * 0.08) + ')';
      ctx.fill();
    }
  };

  // Initialize particles
  var particleCount = Math.min(Math.floor(canvas.width * canvas.height / 8000), 120);
  for (var i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  // Mouse tracking
  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  document.addEventListener('mouseleave', function () {
    mouseX = -1000;
    mouseY = -1000;
  });

  // Draw connections
  function drawConnections() {
    for (var i = 0; i < particles.length; i++) {
      for (var j = i + 1; j < particles.length; j++) {
        var dx = particles[i].x - particles[j].x;
        var dy = particles[i].y - particles[j].y;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 150) {
          var opacity = (1 - dist / 150) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = 'rgba(0, 212, 255, ' + opacity + ')';
          ctx.stroke();
        }
      }
    }
  }

  // Animation loop
  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawConnections();
    particles.forEach(function (p) {
      p.update();
      p.draw();
    });
    animationId = requestAnimationFrame(animateParticles);
  }

  animateParticles();

  // Cleanup on page hide
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
    } else {
      animateParticles();
    }
  });

  // ============================================================
  // 3. ABOUT — Counter animation
  // ============================================================
  var counterElements = document.querySelectorAll('.cm-about__stat-num');
  var countersAnimated = false;

  function animateCounters() {
    if (countersAnimated) return;

    var section = document.getElementById('about');
    var rect = section.getBoundingClientRect();

    if (rect.top < window.innerHeight - 100) {
      countersAnimated = true;
      counterElements.forEach(function (el) {
        var target = parseInt(el.getAttribute('data-count'), 10);
        var current = 0;
        var increment = Math.ceil(target / 60);
        var timer = setInterval(function () {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          el.textContent = current;
        }, 25);
      });
    }
  }

  window.addEventListener('scroll', animateCounters, { passive: true });
  // Check on load too
  animateCounters();

  // ============================================================
  // 4. TESTIMONIALS — Carousel
  // ============================================================
  var testimonials = document.querySelectorAll('.cm-testimonial');
  var dots = document.querySelectorAll('.cm-testimonials__dots span');
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

  // Auto-advance
  var autoInterval = setInterval(function () {
    var next = (currentTestimonial + 1) % testimonials.length;
    showTestimonial(next);
  }, 6000);

  prevBtn.addEventListener('click', function () {
    clearInterval(autoInterval);
    var prev = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
    showTestimonial(prev);
    autoInterval = setInterval(function () {
      var next = (currentTestimonial + 1) % testimonials.length;
      showTestimonial(next);
    }, 6000);
  });

  nextBtn.addEventListener('click', function () {
    clearInterval(autoInterval);
    var next = (currentTestimonial + 1) % testimonials.length;
    showTestimonial(next);
    autoInterval = setInterval(function () {
      var n = (currentTestimonial + 1) % testimonials.length;
      showTestimonial(n);
    }, 6000);
  });

  dots.forEach(function (dot, idx) {
    dot.addEventListener('click', function () {
      clearInterval(autoInterval);
      showTestimonial(idx);
      autoInterval = setInterval(function () {
        var n = (currentTestimonial + 1) % testimonials.length;
        showTestimonial(n);
      }, 6000);
    });
  });

  // ============================================================
  // 5. SMOOTH SCROLL for anchor links
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

})();