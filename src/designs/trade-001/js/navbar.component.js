/**
 * Navbar Component — Marex
 * Dark industrial navbar with scroll-activated background and mobile overlay menu
 */
(function () {
  'use strict';

  var navbar = document.getElementById('mxNavbar');
  var toggleBtn = document.getElementById('mxNavToggle');
  var navLinks = document.getElementById('mxNavLinks');

  if (!navbar) return;

  // ============================================================
  // Scroll handler
  // ============================================================
  function handleScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('mx-navbar--solid');
    } else {
      navbar.classList.remove('mx-navbar--solid');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // ============================================================
  // Active link highlighting
  // ============================================================
  function updateActiveLink() {
    var sections = document.querySelectorAll('section[id], footer');
    var scrollPos = window.scrollY + 120;

    sections.forEach(function (section) {
      var link = document.querySelector('.mx-navbar__links a[href="#' + section.id + '"]');
      if (!link) return;

      var top = section.offsetTop;
      var height = section.offsetHeight;

      if (scrollPos >= top && scrollPos < top + height) {
        document.querySelectorAll('.mx-navbar__links a').forEach(function (l) {
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
    overlay.className = 'mx-navbar__overlay';
    overlay.id = 'mxNavOverlay';

    var overlayList = document.createElement('ul');
    overlayList.className = 'mx-navbar__overlay-links';

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
      if (overlay.classList.contains('mx-navbar__overlay--open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    function openMenu() {
      overlay.classList.add('mx-navbar__overlay--open');
      toggleBtn.classList.add('mx-navbar__toggle--open');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      overlay.classList.remove('mx-navbar__overlay--open');
      toggleBtn.classList.remove('mx-navbar__toggle--open');
      document.body.style.overflow = '';
    }

    // Close on escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  initMobileMenu();
})();