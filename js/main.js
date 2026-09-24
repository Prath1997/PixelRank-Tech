(() => {
  "use strict";

  const init = () => {
    const { gsap } = window;

    if (!gsap) {
      return;
    }

    if (window.ScrollTrigger) {
      gsap.registerPlugin(window.ScrollTrigger);
    }

    if (window.ScrollToPlugin) {
      gsap.registerPlugin(window.ScrollToPlugin);
    }

    const select = (selector, parent = document) =>
      parent.querySelector(selector);
    const selectAll = (selector, parent = document) =>
      Array.from(parent.querySelectorAll(selector));
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const header = select(".site-header");
    const hero = select(".hero-section");

    if (prefersReducedMotion) {
      gsap.set(
        ".site-header, .hero-content, .hero-stats, .hero-visual-placeholder, main section, .site-footer",
        { clearProps: "all" },
      );
      return;
    }

    const safeSet = (target, properties) => {
      if (target) {
        gsap.set(target, properties);
      }
    };

    const addGlowPulse = (targets, color = "#00d4ff") => {
      if (!targets.length) {
        return;
      }

      gsap.to(targets, {
        boxShadow: `0 0 34px ${color}33`,
        duration: 2.2,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: 0.35,
      });
    };

    const createParticles = () => {
      if (!hero) {
        return;
      }

      const particleLayer = document.createElement("div");
      particleLayer.className = "ambient-particle-layer";
      Object.assign(particleLayer.style, {
        position: "absolute",
        inset: "0",
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: "0",
      });
      hero.insertBefore(particleLayer, hero.firstChild);

      const colors = ["#00D4FF", "#00FF99"];
      const particles = Array.from({ length: 26 }, (_, index) => {
        const particle = document.createElement("span");
        const size = gsap.utils.random(2, 5);

        particle.className = "ambient-particle";
        Object.assign(particle.style, {
          position: "absolute",
          width: `${size}px`,
          height: `${size}px`,
          left: `${gsap.utils.random(4, 96)}%`,
          top: `${gsap.utils.random(6, 94)}%`,
          borderRadius: "50%",
          background: colors[index % colors.length],
          opacity: `${gsap.utils.random(0.12, 0.34)}`,
          boxShadow: `0 0 12px ${colors[index % colors.length]}`,
        });
        particleLayer.appendChild(particle);

        gsap.to(particle, {
          x: gsap.utils.random(-70, 70),
          y: gsap.utils.random(-90, 90),
          opacity: gsap.utils.random(0.04, 0.24),
          duration: gsap.utils.random(8, 15),
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: gsap.utils.random(0, 5),
        });

        return particle;
      });

      gsap.to(particles, {
        rotation: 360,
        duration: 20,
        ease: "none",
        repeat: -1,
        stagger: 0.25,
      });
    };

    const animateHero = () => {
      const heroContent = select(".hero-content");
      const heroText = heroContent
        ? selectAll(
            ".eyebrow, h1, .hero-subheading, .hero-description",
            heroContent,
          )
        : [];
      const heroActions = selectAll(".hero-actions .button");
      const heroStats = selectAll(".stat");
      const heroVisual = select(".hero-visual-placeholder");
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

      safeSet([header, ...heroText, ...heroActions, ...heroStats, heroVisual], {
        opacity: 0,
      });
      safeSet(heroText, { y: 24 });
      safeSet(heroActions, { y: 18, scale: 0.96 });
      safeSet(heroStats, { y: 22 });
      safeSet(heroVisual, { scale: 0.92, rotation: -3 });

      timeline
        .to(header, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          clearProps: "transform",
        })
        .to(
          heroText,
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.12 },
          "-=0.45",
        )
        .to(
          heroActions,
          { opacity: 1, y: 0, scale: 1, duration: 0.65, stagger: 0.12 },
          "-=0.45",
        )
        .to(
          heroStats,
          { opacity: 1, y: 0, duration: 0.65, stagger: 0.12 },
          "-=0.3",
        )
        .to(
          heroVisual,
          { opacity: 1, scale: 1, rotation: 0, duration: 1.2 },
          "-=0.8",
        );

      if (heroVisual) {
        gsap.to(heroVisual, {
          y: -12,
          rotation: 2,
          scale: 1.015,
          duration: 10,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      }
    };

    const animateSections = () => {
      const sections = selectAll("main > section");

      sections.forEach((section) => {
        const sectionItems = selectAll(
          ".section-label, h2, .section-introduction > p:not(.section-label), .section-introduction .button, .about-content > p:not(.section-label), .about-content .button, .contact-introduction > p:not(.section-label), .contact-details, .contact-form",
          section,
        );
        const cards = selectAll(
          ".service-card, .feature-card, .process-step, .technology-item, .project-card, .testimonial-card",
          section,
        );

        safeSet([...sectionItems, ...cards], { opacity: 0, y: 28 });

        gsap.to(sectionItems, {
          scrollTrigger: {
            trigger: section,
            start: "top 82%",
            once: true,
          },
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.07,
        });

        gsap.to(cards, {
          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            once: true,
          },
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: "power3.out",
          stagger: 0.09,
        });
      });
    };

    const animateCounters = () => {
      selectAll(".stat strong").forEach((stat) => {
        const original = stat.textContent.trim();
        const number = Number.parseInt(original, 10);
        const suffix = original.replace(String(number), "");
        const counter = { value: 0 };

        gsap.to(counter, {
          value: number,
          duration: 1.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: stat,
            start: "top 88%",
            once: true,
          },
          onUpdate: () => {
            stat.textContent = `${Math.round(counter.value)}${suffix}`;
          },
        });
      });
    };

    const setupHoverStates = () => {
      selectAll(
        ".service-card, .feature-card, .process-step, .technology-item",
      ).forEach((card) => {
        card.addEventListener("mouseenter", () =>
          gsap.to(card, {
            y: -8,
            duration: 0.3,
            boxShadow: "0 0 42px rgba(0, 212, 255, 0.24)",
            overwrite: true,
          }),
        );
        card.addEventListener("mouseleave", () =>
          gsap.to(card, {
            y: 0,
            duration: 0.4,
            boxShadow: "0 0 28px rgba(0, 212, 255, 0.1)",
            overwrite: true,
          }),
        );
      });

      selectAll(".button-primary").forEach((button) => {
        button.addEventListener("mouseenter", () =>
          gsap.to(button, { scale: 1.05, duration: 0.25, overwrite: true }),
        );
        button.addEventListener("mouseleave", () =>
          gsap.to(button, { scale: 1, duration: 0.3, overwrite: true }),
        );
      });

      selectAll(".project-card").forEach((card) => {
        const image = select(".project-image-placeholder", card);
        const arrow = select(".arrow-button", card);

        card.addEventListener("mouseenter", () => {
          gsap.to(image, {
            scale: 1.06,
            duration: 0.55,
            ease: "power2.out",
            overwrite: true,
          });
          gsap.to(arrow, { x: 5, duration: 0.3, overwrite: true });
        });
        card.addEventListener("mouseleave", () => {
          gsap.to(image, {
            scale: 1,
            duration: 0.55,
            ease: "power2.out",
            overwrite: true,
          });
          gsap.to(arrow, { x: 0, duration: 0.3, overwrite: true });
        });
      });
    };

    const setupNavbar = () => {
      if (!header) {
        return;
      }

      const updateHeader = () => {
        const isScrolled = window.scrollY > 24;
        gsap.to(header, {
          backgroundColor: isScrolled
            ? "rgba(2, 8, 23, 0.94)"
            : "rgba(2, 8, 23, 0.78)",
          boxShadow: isScrolled
            ? "0 8px 34px rgba(0, 212, 255, 0.16)"
            : "0 5px 28px rgba(0, 212, 255, 0.08)",
          duration: 0.35,
          overwrite: true,
        });
      };

      window.addEventListener("scroll", updateHeader, { passive: true });
      updateHeader();
    };

    const setupTestimonials = () => {
      const card = select(".testimonial-card");
      const previous = select(
        ".testimonial-controls .arrow-button:first-child",
      );
      const next = select(".testimonial-controls .arrow-button:last-child");

      if (!card || !previous || !next) {
        return;
      }

      const quote = select("blockquote", card);
      const client = select(".client-name", card);
      const testimonials = [
        {
          quote:
            "PixelRank helped us turn a complex idea into a clear, reliable digital product. Their team was responsive, thoughtful, and committed at every stage.",
          client: "Client Name",
        },
        {
          quote:
            "The team brought structure to our digital growth and delivered a product that feels ready for the next stage of our business.",
          client: "Growth Partner",
        },
        {
          quote:
            "From strategy through launch, PixelRank made every step transparent and easy to trust. The result exceeded our expectations.",
          client: "Business Leader",
        },
      ];
      let currentIndex = 0;

      const showTestimonial = (direction) => {
        currentIndex =
          (currentIndex + direction + testimonials.length) %
          testimonials.length;
        const testimonial = testimonials[currentIndex];

        gsap.to([quote, client], {
          opacity: 0,
          y: 8,
          duration: 0.2,
          onComplete: () => {
            quote.textContent = testimonial.quote;
            client.textContent = testimonial.client;
            gsap.to([quote, client], {
              opacity: 1,
              y: 0,
              duration: 0.35,
              stagger: 0.05,
            });
          },
        });
      };

      previous.addEventListener("click", () => showTestimonial(-1));
      next.addEventListener("click", () => showTestimonial(1));
      window.setInterval(() => showTestimonial(1), 5000);
    };

    createParticles();
    animateHero();
    animateSections();
    animateCounters();
    setupHoverStates();
    setupNavbar();
    setupTestimonials();
    addGlowPulse(selectAll(".button-primary, .hero-visual-placeholder"));
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
