/**
 * Navbar Component — Lingua
 * Transparent navbar with scroll-activated background and mobile overlay menu
 */
(function () {
  'use strict';

  var navbar = document.getElementById('lgNavbar');
  var toggleBtn = document.getElementById('lgNavToggle');
  var navLinks = document.getElementById('lgNavLinks');

  if (!navbar) return;

  // ============================================================
  // Scroll handler
  // ============================================================
  function handleScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('lg-navbar--solid');
    } else {
      navbar.classList.remove('lg-navbar--solid');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // ============================================================
  // Active link highlighting based on scroll position
  // ============================================================
  function updateActiveLink() {
    var sections = document.querySelectorAll('section[id], footer');
    var scrollPos = window.scrollY + 120;

    sections.forEach(function (section) {
      var link = document.querySelector('.lg-navbar__links a[href="#' + section.id + '"]');
      if (!link) return;

      var top = section.offsetTop;
      var height = section.offsetHeight;

      if (scrollPos >= top && scrollPos < top + height) {
        document.querySelectorAll('.lg-navbar__links a').forEach(function (l) {
          l.classList.remove('active');
        });
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });

  // ============================================================
  // Mobile menu
  // ============================================================
  function initMobileMenu() {
    if (!toggleBtn) return;

    // Create overlay
    var overlay = document.createElement('div');
    overlay.className = 'lg-navbar__overlay';
    overlay.id = 'lgNavOverlay';

    var overlayList = document.createElement('ul');
    overlayList.className = 'lg-navbar__overlay-links';

    var originalLinks = navLinks ? navLinks.querySelectorAll('a') : [];
    var linkData = [];

    originalLinks.forEach(function (link) {
      linkData.push({
        text: link.textContent,
        href: link.getAttribute('href')
      });
    });

    linkData.forEach(function (data) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = data.href;
      a.textContent = data.text;
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

    // Toggle
    toggleBtn.addEventListener('click', function () {
      if (overlay.classList.contains('lg-navbar__overlay--open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close on escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('lg-navbar__overlay--open')) {
        closeMenu();
      }
    });
  }

  function openMenu() {
    var overlay = document.getElementById('lgNavOverlay');
    if (overlay) {
      overlay.classList.add('lg-navbar__overlay--open');
      toggleBtn.classList.add('lg-navbar__toggle--active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeMenu() {
    var overlay = document.getElementById('lgNavOverlay');
    if (overlay) {
      overlay.classList.remove('lg-navbar__overlay--open');
      toggleBtn.classList.remove('lg-navbar__toggle--active');
      document.body.style.overflow = '';
    }
  }

  initMobileMenu();
})();