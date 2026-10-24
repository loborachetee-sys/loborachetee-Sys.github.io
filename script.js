
/* =========================================
   BELIEVE LOBO — INTERACTIONS & ANIMATIONS
   ========================================= */

document.documentElement.classList.add("js-ready");

document.addEventListener("DOMContentLoaded", () => {
  const loader = document.querySelector(".page-loader");
  const header = document.querySelector(".header");
  const progressBar = document.querySelector(".scroll-progress");
  const cursorGlow = document.querySelector(".cursor-glow");
  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".nav-menu");
  const navLinks = document.querySelectorAll(".nav-link");
  const revealElements = document.querySelectorAll(".reveal");
  const sections = document.querySelectorAll("main section[id]");

  // 1. ÉCRAN DE CHARGEMENT
  const hideLoader = () => {
    if (loader) loader.classList.add("is-hidden");
  };

  if (document.readyState === "complete") {
    hideLoader();
  } else {
    window.addEventListener("load", hideLoader, { once: true });

    // Évite de bloquer le site si une image externe tarde à charger.
    window.setTimeout(hideLoader, 1800);
  }

  // 2. ANNÉE AUTOMATIQUE DANS LE FOOTER
  const yearElement = document.querySelector("#year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // 3. MENU MOBILE
  function closeMenu() {
    if (!menuToggle || !navMenu) return;

    navMenu.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Ouvrir le menu");
    document.body.classList.remove("menu-open");
  }

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";

      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Ouvrir le menu" : "Fermer le menu"
      );

      navMenu.classList.toggle("open", !isOpen);
      document.body.classList.toggle("menu-open", !isOpen);
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) closeMenu();
    });
  }

  // 4. APPARITION DES ÉLÉMENTS AU SCROLL
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px"
      }
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });
  } else {
    // Compatibilité avec les navigateurs plus anciens.
    revealElements.forEach((element) => {
      element.classList.add("is-visible");
    });
  }

  // 5. BARRE DE PROGRESSION ET HEADER
  let scrollTicking = false;

  function updateScrollUI() {
    const scrollTop = window.scrollY;
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;

    const progress =
      maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;

    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }

    if (header) {
      header.classList.toggle("scrolled", scrollTop > 20);
    }

    scrollTicking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!scrollTicking) {
        window.requestAnimationFrame(updateScrollUI);
        scrollTicking = true;
      }
    },
    { passive: true }
  );

  updateScrollUI();

  // 6. SECTION ACTIVE DANS LE MENU
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const activeId = entry.target.id;

          navLinks.forEach((link) => {
            const isActive =
              link.getAttribute("href") === `#${activeId}`;

            link.classList.toggle("active", isActive);

            if (isActive) {
              link.setAttribute("aria-current", "location");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        });
      },
      {
        rootMargin: "-30% 0px -55% 0px",
        threshold: 0
      }
    );

    sections.forEach((section) => {
      sectionObserver.observe(section);
    });
  }

  // 7. EFFET LUMINEUX SUIVANT LA SOURIS
  const canUseFinePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  );

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  if (
    cursorGlow &&
    canUseFinePointer.matches &&
    !prefersReducedMotion.matches
  ) {
    window.addEventListener(
      "pointermove",
      (event) => {
        cursorGlow.style.left = `${event.clientX}px`;
        cursorGlow.style.top = `${event.clientY}px`;
      },
      { passive: true }
    );
  }

  // 8. LIENS INTERNES : DÉFILEMENT FLUIDE
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: prefersReducedMotion.matches ? "auto" : "smooth",
        block: "start"
      });

      // Met à jour l'URL sans recharger la page.
      if (window.location.hash !== targetId) {
        window.history.pushState(null, "", targetId);
      }
    });
  });

  // 9. ERREURS D'IMAGES : AFFICHAGE DE SECOURS
  document.querySelectorAll(".project-image img, .architecture-frame img")
    .forEach((img) => {
      img.addEventListener("error", () => {
        img.style.display = "none";
        img.parentElement.style.background =
          "linear-gradient(135deg, #19263a, #0b1220)";
      });
    });
});
