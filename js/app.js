document.documentElement.classList.add('js');

let pageInitialized = false;

document.addEventListener('DOMContentLoaded', loadPage);

async function loadPage() {
  const componentElements = [...document.querySelectorAll('[data-component]')];

  await Promise.all(componentElements.map(loadComponent));
  initializePage();
}

async function loadComponent(element) {
  const componentPath = element.dataset.component;
  if (!componentPath) return;

  try {
    const response = await fetch(new URL(componentPath, document.baseURI), {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`No se pudo cargar ${componentPath}: ${response.status}`);
    }

    element.innerHTML = await response.text();
  } catch (error) {
    console.error(error);
    element.classList.add('component-error');
    element.innerHTML = '<p class="component-error-message">No se pudo cargar este contenido.</p>';
  }
}

function initializePage() {
  if (pageInitialized) return;
  pageInitialized = true;

  initNavigation();
  initSlider();
  initReveal();
  initCounters();
  initContactForm();
  initCurrentYear();
}

function initNavigation() {
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.main-nav');
  const submenuItems = [...document.querySelectorAll('.nav-item.has-submenu')];
  const mobileQuery = window.matchMedia('(max-width: 980px)');

  if (header) {
    const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  if (menuToggle && navigation) {
    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!isOpen));
      navigation.classList.toggle('is-open', !isOpen);
      document.body.classList.toggle('menu-open', !isOpen);
    });
  }

  const closeMenu = () => {
    if (!menuToggle || !navigation) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  };

  submenuItems.forEach((item) => {
    const toggle = item.querySelector('.submenu-toggle');
    const submenu = item.querySelector('.sub-menu');
    if (!toggle || !submenu) return;

    toggle.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      const isOpen = item.classList.contains('is-submenu-open');
      submenuItems.forEach((otherItem) => {
        otherItem.classList.remove('is-submenu-open');
        otherItem.querySelector('.submenu-toggle')?.setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('is-submenu-open');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      closeMenu();

      if (link.closest('.sub-menu')) {
        link.closest('.nav-item')?.classList.remove('is-submenu-open');
        link.closest('.nav-item')?.querySelector('.submenu-toggle')?.setAttribute('aria-expanded', 'false');
      }
    });
  });

  document.addEventListener('click', (event) => {
    if (!mobileQuery.matches) return;
    if (!navigation?.contains(event.target) && !menuToggle?.contains(event.target)) {
      closeMenu();
    }
  });

  mobileQuery.addEventListener('change', (event) => {
    if (!event.matches) closeMenu();
  });
}

function initSlider() {
  const slider = document.querySelector('[data-slider]');
  if (!slider) return;

  const slides = [...slider.querySelectorAll('[data-slide]')];
  const dotsContainer = slider.querySelector('[data-slider-dots]');
  const previousButton = slider.querySelector('[data-slider-prev]');
  const nextButton = slider.querySelector('[data-slider-next]');
  const status = slider.querySelector('[data-slider-status]');
  if (slides.length === 0) return;

  let currentIndex = 0;
  let autoplayTimer;
  let touchStartX = 0;

  slides.forEach((slide, index) => {
    const dot = document.createElement('button');
    dot.className = `slider-dot${index === 0 ? ' is-active' : ''}`;
    dot.type = 'button';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Mostrar lámina ${index + 1}`);
    dot.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    dot.addEventListener('click', () => showSlide(index));
    dotsContainer?.appendChild(dot);
  });

  const dots = [...(dotsContainer?.children || [])];

  function showSlide(index) {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === currentIndex;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
      slide.toggleAttribute('inert', !isActive);
    });

    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === currentIndex;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-selected', String(isActive));
    });

    if (status) {
      status.textContent = slides[currentIndex].dataset.slideTitle || `Lámina ${currentIndex + 1}`;
    }
  }

  const stopAutoplay = () => window.clearInterval(autoplayTimer);
  const startAutoplay = () => {
    stopAutoplay();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    autoplayTimer = window.setInterval(() => showSlide(currentIndex + 1), 6500);
  };

  previousButton?.addEventListener('click', () => {
    showSlide(currentIndex - 1);
    startAutoplay();
  });

  nextButton?.addEventListener('click', () => {
    showSlide(currentIndex + 1);
    startAutoplay();
  });

  slider.addEventListener('mouseenter', stopAutoplay);
  slider.addEventListener('mouseleave', startAutoplay);
  slider.addEventListener('focusin', stopAutoplay);
  slider.addEventListener('focusout', startAutoplay);
  slider.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].clientX;
    stopAutoplay();
  }, { passive: true });
  slider.addEventListener('touchend', (event) => {
    const touchDistance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(touchDistance) > 45) {
      showSlide(currentIndex + (touchDistance < 0 ? 1 : -1));
    }
    startAutoplay();
  }, { passive: true });

  showSlide(0);
  startAutoplay();
}

function initReveal() {
  const elements = [...document.querySelectorAll('[data-reveal]')];
  if (elements.length === 0) return;

  if (!('IntersectionObserver' in window)) {
    elements.forEach((element) => element.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -35px' });

  elements.forEach((element) => observer.observe(element));

  window.setTimeout(() => {
    elements.forEach((element) => element.classList.add('is-visible'));
  }, 1600);
}

function initCounters() {
  const counters = [...document.querySelectorAll('[data-counter]')];
  if (counters.length === 0) return;

  const animateCounter = (element) => {
    if (element.dataset.counted === 'true') return;
    element.dataset.counted = 'true';

    const target = Number(element.dataset.counter || 0);
    const suffix = element.dataset.suffix || '';
    const start = performance.now();
    const duration = 1300;
    const formatter = new Intl.NumberFormat('es-PE');

    const update = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = `${formatter.format(Math.round(target * eased))}${suffix}`;
      if (progress < 1) window.requestAnimationFrame(update);
    };

    window.requestAnimationFrame(update);
  };

  if (!('IntersectionObserver' in window)) {
    counters.forEach(animateCounter);
    return;
  }

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.4 });

  counters.forEach((counter) => observer.observe(counter));
}

function initContactForm() {
  const form = document.querySelector('#contact-form');
  if (!form || form.dataset.bound === 'true') return;
  form.dataset.bound = 'true';

  const status = form.querySelector('[data-form-status]');
  const fields = [...form.querySelectorAll('input, textarea')];

  const clearFieldError = (field) => {
    field.removeAttribute('aria-invalid');
  };

  fields.forEach((field) => {
    field.addEventListener('input', () => clearFieldError(field));
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    fields.forEach(clearFieldError);

    if (!form.checkValidity()) {
      const firstInvalidField = form.querySelector(':invalid');
      firstInvalidField?.setAttribute('aria-invalid', 'true');
      firstInvalidField?.focus();
      if (status) {
        status.textContent = 'Revisa los campos obligatorios.';
        status.classList.add('is-error');
      }
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Enviando…';
    }

    window.setTimeout(() => {
      form.reset();
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Enviar mensaje <span aria-hidden="true">→</span>';
      }
      if (status) {
        status.textContent = 'Gracias por escribirnos. Te responderemos pronto.';
        status.classList.remove('is-error');
      }
    }, 550);
  });
}

function initCurrentYear() {
  const yearElement = document.querySelector('[data-current-year]');
  if (yearElement) yearElement.textContent = String(new Date().getFullYear());
}
