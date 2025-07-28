/**
 * ==========================================================================
 * SCRIPT PRINCIPAL POUR BMS VENTOUSE v5.0 (ENTERPRISE EDITION)
 * ==========================================================================
 * Gère toutes les interactions du site avec une architecture modulaire,
 * performante et accessible (Focus Trap, Escape Key, etc.).
 */
document.addEventListener('DOMContentLoaded', () => {

  // --------------------------------------------------------------------------
  // CONFIGURATION CENTRALISÉE
  // --------------------------------------------------------------------------
  const CONFIG = {
    theme: {
      storageKey: 'bms-theme-preference'
    },
    animations: {
      threshold: 0.1,
      rootMargin: '0px'
    },
    scrollspy: {
      rootMargin: '-50% 0px -50% 0px'
    }
  };

  // --------------------------------------------------------------------------
  // MODULE: MENU HAMBURGER & ACCESSIBILITÉ
  // --------------------------------------------------------------------------
  const setupHamburgerMenu = () => {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const navOverlay = document.getElementById('navOverlay');

    if (!hamburger || !navLinks || !navOverlay) {
      console.warn("Éléments du menu mobile non trouvés. Le module ne sera pas initialisé.");
      return;
    }

    const focusableElements = navLinks.querySelectorAll('a[href], button');
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];

    const toggleMenu = (isActive) => {
      hamburger.classList.toggle('active', isActive);
      navLinks.classList.toggle('active', isActive);
      navOverlay.classList.toggle('active', isActive);
      hamburger.setAttribute('aria-expanded', isActive);
      document.body.style.overflow = isActive ? 'hidden' : '';
      if (isActive) {
        firstFocusableElement.focus();
      }
    };

    const handleMenuClick = () => {
      const isActive = !hamburger.classList.contains('active');
      toggleMenu(isActive);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && hamburger.classList.contains('active')) {
        toggleMenu(false);
      }
      // Focus Trap
      if (e.key === 'Tab' && hamburger.classList.contains('active')) {
        if (e.shiftKey) { // Shift + Tab
          if (document.activeElement === firstFocusableElement) {
            lastFocusableElement.focus();
            e.preventDefault();
          }
        } else { // Tab
          if (document.activeElement === lastFocusableElement) {
            firstFocusableElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    hamburger.addEventListener('click', handleMenuClick);
    navOverlay.addEventListener('click', () => toggleMenu(false));
    document.addEventListener('keydown', handleKeyDown);
  };

  // --------------------------------------------------------------------------
  // MODULE: ANIMATIONS AU DÉFILEMENT (Intersection Observer)
  // --------------------------------------------------------------------------
  const setupScrollAnimations = () => {
    const animatedItems = document.querySelectorAll('.animated-item');
    if (animatedItems.length === 0) return;

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: CONFIG.animations.rootMargin,
      threshold: CONFIG.animations.threshold
    });

    animatedItems.forEach(item => observer.observe(item));
  };

  // --------------------------------------------------------------------------
  // MODULE: ACCORDÉON FAQ
  // --------------------------------------------------------------------------
  const setupFaqAccordion = () => {
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length === 0) return;

    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');

      if (question && answer) {
        question.addEventListener('click', () => {
          const isOpen = item.classList.contains('is-open');
          
          faqItems.forEach(otherItem => {
            if (otherItem !== item) {
              otherItem.classList.remove('is-open');
              otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
              otherItem.querySelector('.faq-answer').style.maxHeight = null;
            }
          });

          item.classList.toggle('is-open', !isOpen);
          question.setAttribute('aria-expanded', !isOpen);
          answer.style.maxHeight = !isOpen ? answer.scrollHeight + 'px' : null;
        });
      }
    });
  };

  // --------------------------------------------------------------------------
  // MODULE: SCROLLSPY
  // --------------------------------------------------------------------------
  const setupScrollspy = () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    if (sections.length === 0 || navLinks.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href').includes(id));
          });
        }
      });
    }, {
      rootMargin: CONFIG.scrollspy.rootMargin
    });

    sections.forEach(section => observer.observe(section));
  };

  // --------------------------------------------------------------------------
  // MODULE: THÈME SOMBRE (Dark Mode)
  // --------------------------------------------------------------------------
  const setupDarkMode = () => {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    const applyTheme = (theme) => {
      document.body.classList.toggle('dark-theme', theme === 'dark');
    };

    const savedTheme = localStorage.getItem(CONFIG.theme.storageKey);
    if (savedTheme) {
      applyTheme(savedTheme);
    }

    themeToggle.addEventListener('click', () => {
      const newTheme = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
      applyTheme(newTheme);
      localStorage.setItem(CONFIG.theme.storageKey, newTheme);
    });
  };

  // --------------------------------------------------------------------------
  // MODULE: CARROUSEL DES RÉFÉRENCES
  // --------------------------------------------------------------------------
  /**
   * Initialise un carrousel horizontal pour la section "Ils Nous Font Confiance".
   * Les boutons précédent et suivant décalent le conteneur de logos à chaque clic.
   */
  const setupReferencesCarousel = () => {
    const track = document.querySelector('.references-carousel .carousel-track');
    const slides = track ? Array.from(track.children) : [];
    const prevBtn = document.querySelector('.references-carousel .carousel-control.prev');
    const nextBtn = document.querySelector('.references-carousel .carousel-control.next');
    if (!track || slides.length === 0 || !prevBtn || !nextBtn) return;

    // Calcule la largeur d'un slide (y compris ses marges) après le chargement
    const getSlideWidth = () => {
      const slide = slides[0];
      const slideStyle = window.getComputedStyle(slide);
      const marginRight = parseFloat(slideStyle.marginRight) || 0;
      return slide.getBoundingClientRect().width + marginRight;
    };
    let currentIndex = 0;
    const scrollToIndex = (index) => {
      const slideWidth = getSlideWidth();
      const position = slideWidth * index;
      track.scrollTo({ left: position, behavior: 'smooth' });
    };
    nextBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % slides.length;
      scrollToIndex(currentIndex);
    });
    prevBtn.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      scrollToIndex(currentIndex);
    });
  };

  // ==========================================================================
  // INITIALISATION DE TOUS LES MODULES
  // ==========================================================================
  try {
    setupHamburgerMenu();
    setupScrollAnimations();
    setupFaqAccordion();
    setupScrollspy();
    setupDarkMode();
    setupReferencesCarousel();
  } catch (error) {
    console.error("Erreur lors de l'initialisation des scripts du site :", error);
  }
});
<script>
  window.addEventListener('load', function() {
    let imgStatus = [];
    const imgs = document.getElementsByTagName('img');
    
    for(let i = 0; i < imgs.length; i++) {
      const img = imgs[i];
      imgStatus.push({
        src: img.src,
        loaded: img.complete,
        naturalWidth: img.naturalWidth
      });
    }
    
    // Créer un élément visible pour afficher les résultats
    const div = document.createElement('div');
    div.style.position = 'fixed';
    div.style.bottom = '0';
    div.style.left = '0';
    div.style.right = '0';
    div.style.background = 'white';
    div.style.padding = '10px';
    div.style.zIndex = '10000';
    div.style.maxHeight = '150px';
    div.style.overflow = 'auto';
    div.style.fontSize = '10px';
    
    // Ajouter les informations sur les images
    imgStatus.forEach(status => {
      div.innerHTML += `<p>${status.src.split('/').pop()}: ${status.loaded ? '✅' : '❌'} (${status.naturalWidth}px)</p>`;
    });
    
    document.body.appendChild(div);
  });
</script>
