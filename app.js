/**
 * ALKA Artisanals
 * Core Interaction Script
 */

document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loader');
  const mainContent = document.getElementById('main-content');
  const scrollIndicator = document.querySelector('.scroll-indicator');
  
  // Set main content as visually/structurally hidden for screen readers while loading
  if (mainContent) {
    mainContent.setAttribute('aria-hidden', 'true');
  }

  // Check if reduced motion is preferred
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lenis = null;

  // Initialize Lenis smooth scroll if browser supports it and motion is not reduced
  if (!isReducedMotion && typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutQuart
      smoothWheel: true,
      smoothTouch: false
    });

    // Stop scrolling during loading screen curtain animation
    if (loader) {
      lenis.stop();
    }

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  }

  // 1. Curtain Loading Screen Orchestration
  const startApp = () => {
    if (loader) {
      loader.classList.add('loaded');
      
      // Toggle accessibility attributes once loader opens
      if (mainContent) {
        mainContent.setAttribute('aria-hidden', 'false');
      }

      // Restore Lenis scrolling
      if (lenis) {
        lenis.start();
      }

      // Cleanup loader after panels transition out to prevent layout/tabbing overlap
      loader.addEventListener('transitionend', (e) => {
        // Only trigger once (transition occurs on left/right panels)
        if (e.propertyName === 'transform') {
          loader.style.display = 'none';
          loader.remove();
        }
      });
    }
  };

  // Run loading curtain split after 2.2 seconds (matching shimmer sequence)
  const loaderTimeout = setTimeout(startApp, 2200);

  // Allow user to skip or interrupt loader animation by pressing any key
  const handleSkipLoader = (e) => {
    clearTimeout(loaderTimeout);
    startApp();
    window.removeEventListener('keydown', handleSkipLoader);
    window.removeEventListener('click', handleSkipLoader);
  };
  
  window.addEventListener('keydown', handleSkipLoader);
  window.addEventListener('click', handleSkipLoader);


  // 2. Scroll Reveal: Intersection Observer
  const revealElements = document.querySelectorAll('.reveal');
  
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const revealOptions = {
      root: null, // viewport
      threshold: 0.1, // trigger when 10% is visible
      rootMargin: '0px 0px -40px 0px' // offset bottom triggers slightly for better feel
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          observer.unobserve(entry.target); // Trigger animation once only
        }
      });
    }, revealOptions);

    revealElements.forEach(el => {
      revealObserver.observe(el);
    });
  } else {
    // Fallback if IntersectionObserver is not supported
    revealElements.forEach(el => {
      el.classList.add('reveal-visible');
    });
  }


  // 3. Collection Keyboard Accessibility (Enter/Space to DM)
  const collectionCards = document.querySelectorAll('.collection-card');
  
  collectionCards.forEach(card => {
    // Navigate to order page (Instagram DM) on select
    const triggerOrder = () => {
      window.open('https://instagram.com/alkaartisnals', '_blank', 'noopener,noreferrer');
    };

    // Keyboard handlers
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); // Prevent scroll on Space
        triggerOrder();
      }
    });

    // Mouse click handler on the card itself
    card.addEventListener('click', () => {
      triggerOrder();
    });
  });


  // 4. Smooth Anchor Scrolling Helper (Routed via Lenis if active)
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = scrollIndicator.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      
      if (targetSection) {
        if (lenis) {
          lenis.scrollTo(targetSection);
        } else {
          targetSection.scrollIntoView({
            behavior: 'auto',
            block: 'start'
          });
        }
        
        // Update focus for screen readers
        targetSection.setAttribute('tabindex', '-1');
        targetSection.focus({ preventScroll: true });
      }
    });
  }
});
