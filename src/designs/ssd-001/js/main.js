document.addEventListener('DOMContentLoaded', function() {
  // 导航栏切换
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function() {
      navLinks.classList.toggle('active');
    });
  }

  // 速度计动画
  const speedValue = document.getElementById('speedValue');
  const speedBar = document.getElementById('speedBar');
  const targetSpeed = 24000;

  if (speedValue && speedBar) {
    setTimeout(() => {
      animateValue(speedValue, 0, targetSpeed, 2000);
      speedBar.style.width = '100%';
    }, 500);
  }

  // 统计数字动画
  const statValues = document.querySelectorAll('.nd-stat-item__value');
  
  const observerOptions = {
    threshold: 0.5
  };

  const statsObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.dataset.target);
        const isDecimal = target % 1 !== 0;
        const duration = 2000;
        
        animateValue(el, 0, target, duration, isDecimal);
        statsObserver.unobserve(el);
      }
    });
  }, observerOptions);

  statValues.forEach(el => {
    statsObserver.observe(el);
  });

  // 平滑滚动
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        
        // 关闭移动菜单
        if (navLinks) {
          navLinks.classList.remove('active');
        }
      }
    });
  });

  // 导航栏滚动效果
  const navbar = document.getElementById('ndNavbar');
  let lastScroll = 0;

  window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset;
    
    if (navbar) {
      if (currentScroll > 100) {
        navbar.style.background = 'rgba(10, 10, 15, 0.98)';
        navbar.style.boxShadow = '0 5px 30px rgba(0, 0, 0, 0.5)';
      } else {
        navbar.style.background = 'linear-gradient(to bottom, rgba(10, 10, 15, 0.95), rgba(10, 10, 15, 0.7))';
        navbar.style.boxShadow = 'none';
      }
    }
    
    lastScroll = currentScroll;
  });
});

function animateValue(element, start, end, duration, isDecimal) {
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // 使用 easeOutQuart 缓动
    const easeProgress = 1 - Math.pow(1 - progress, 4);
    
    const currentValue = start + (end - start) * easeProgress;
    
    if (isDecimal) {
      element.textContent = currentValue.toFixed(1);
    } else if (end >= 1000000) {
      element.textContent = Math.floor(currentValue / 1000000) + 'M+';
    } else if (end >= 1000) {
      element.textContent = Math.floor(currentValue).toLocaleString();
    } else {
      element.textContent = Math.floor(currentValue);
    }
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}
