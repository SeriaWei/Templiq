/**
 * Navbar Component — Aether
 * Apple-inspired translucent navigation with mobile overlay menu
 */
(function () {
  'use strict';

  const navbar = document.getElementById('aeNavbar');
  const toggleBtn = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (!navbar || !toggleBtn) return;

  // Create overlay menu
  const overlay = document.createElement('div');
  overlay.className = 'ae-navbar__overlay';
  overlay.id = 'aeNavOverlay';

  const overlayList = document.createElement('ul');
  overlayList.className = 'ae-navbar__overlay-links';

  // Clone links from nav
  const originalLinks = navLinks ? navLinks.querySelectorAll('a') : [];
  const linkTexts = [];
  const linkHrefs = [];

  originalLinks.forEach(function (link) {
    linkTexts.push(link.textContent);
    linkHrefs.push(link.getAttribute('href'));
  });

  linkTexts.forEach(function (text, i) {
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = linkHrefs[i] || '#';
    a.textContent = text;
    a.addEventListener('click', function (e) {
      e.preventDefault();
      closeMenu();
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
    li.appendChild(a);
    overlayList.appendChild(li);
  });

  overlay.appendChild(overlayList);
  document.body.appendChild(overlay);

  // Toggle menu
  var menuOpen = false;

  function openMenu() {
    menuOpen = true;
    toggleBtn.classList.add('ae-navbar__toggle--active');
    overlay.classList.add('ae-navbar__overlay--open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menuOpen = false;
    toggleBtn.classList.remove('ae-navbar__toggle--active');
    overlay.classList.remove('ae-navbar__overlay--open');
    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', function () {
    if (menuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close overlay on resize to desktop
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 768 && menuOpen) {
      closeMenu();
    }
  });

  // Scroll effects
  var lastScroll = 0;
  var scrollThreshold = 10;

  window.addEventListener('scroll', function () {
    var currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    // Add shadow after scrolling
    if (currentScroll > 20) {
      navbar.classList.add('ae-navbar--scrolled');
    } else {
      navbar.classList.remove('ae-navbar--scrolled');
    }

    // Hide/show navbar on scroll direction
    if (currentScroll > lastScroll && currentScroll > 100) {
      navbar.classList.add('ae-navbar--hidden');
    } else {
      navbar.classList.remove('ae-navbar--hidden');
    }

    lastScroll = currentScroll;
  });

  // Active nav link highlighting
  var allLinks = document.querySelectorAll(
    '.ae-navbar__links a, .ae-navbar__overlay-links a'
  );

  function setActiveLink() {
    var scrollPos = window.pageYOffset || document.documentElement.scrollTop;

    document.querySelectorAll('section[id]').forEach(function (section) {
      var sectionTop = section.offsetTop - 120;
      var sectionBottom = sectionTop + section.offsetHeight;

      if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
        var id = section.getAttribute('id');
        allLinks.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', setActiveLink);

  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      var target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
})();