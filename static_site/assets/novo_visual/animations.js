/**
 * CloudTrilhas — Novo Visual 2026
 * Micro-interações e animações de scroll
 */

// Intersection Observer para animações de scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Aplica animação em cards e seções
document.addEventListener('DOMContentLoaded', () => {
  const animatedElements = document.querySelectorAll(
    '.feature-card, .training-card, .resource-card, .learning-box, .section-heading'
  );

  animatedElements.forEach((el, index) => {
    el.classList.add('animate-on-scroll');
    el.style.transitionDelay = `${index * 0.08}s`;
    observer.observe(el);
  });

  // Parallax sutil no hero
  const hero = document.querySelector('.hero');
  if (hero) {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const heroPanel = hero.querySelector('.hero-panel');
      if (heroPanel && scrolled < 600) {
        heroPanel.style.transform = `translateY(${scrolled * 0.05}px)`;
      }
    }, { passive: true });
  }

  // Header shrink on scroll
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.style.background = 'rgba(250, 250, 250, 0.92)';
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.06)';
      } else {
        header.style.background = 'rgba(250, 250, 250, 0.72)';
        header.style.boxShadow = 'none';
      }
    }, { passive: true });
  }
});
