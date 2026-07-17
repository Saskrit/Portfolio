(() => {
  if (typeof lucide !== "undefined" && typeof lucide.createIcons === "function") {
    lucide.createIcons();
  }

  const header = document.querySelector(".sb-site-header");
  const nav = document.querySelector(".sb-site-nav");
  const toggle = document.querySelector(".sb-nav-toggle");
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const navLinks = document.querySelectorAll(".sb-site-nav a");
  const sections = document.querySelectorAll("main section[id]");
  const year = document.getElementById("year");
  const scrollEdges = {
    top: document.querySelector('[data-scroll-edge="top"]'),
    right: document.querySelector('[data-scroll-edge="right"]'),
    bottom: document.querySelector('[data-scroll-edge="bottom"]'),
    left: document.querySelector('[data-scroll-edge="left"]'),
  };
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  const tw = {
    s: document.querySelector('[data-tw="s"]'),
    a: document.querySelector('[data-tw="a"]'),
    sp: document.querySelector('[data-tw="sp"]'),
    b: document.querySelector('[data-tw="b"]'),
    h: document.querySelector('[data-tw="h"]'),
  };

  const runTypewriter = () => {
    if (!tw.s || !tw.a || !tw.sp || !tw.b || !tw.h) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      tw.s.textContent = "S";
      tw.a.textContent = "askrit";
      tw.sp.textContent = " ";
      tw.b.textContent = "B";
      tw.h.textContent = "hattarai";
      return;
    }

    const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

    const typeInto = async (el, text, speed = 70) => {
      for (let i = 1; i <= text.length; i += 1) {
        el.textContent = text.slice(0, i);
        await wait(text[i - 1] === " " ? speed + 50 : speed);
      }
    };

    const eraseFrom = async (el, speed = 38) => {
      while (el.textContent.length) {
        el.textContent = el.textContent.slice(0, -1);
        await wait(speed);
      }
    };

    /* After first pass: S / B / space stay fixed in place; only other letters loop */
    const loopRest = async () => {
      await wait(1400);
      await eraseFrom(tw.h);
      await eraseFrom(tw.a);
      await wait(350);
      await typeInto(tw.a, "askrit");
      await typeInto(tw.h, "hattarai");
      loopRest();
    };

    const firstPass = async () => {
      await wait(420);
      await typeInto(tw.s, "S");
      await typeInto(tw.a, "askrit");
      await typeInto(tw.sp, " ");
      await typeInto(tw.b, "B");
      await typeInto(tw.h, "hattarai");
      loopRest();
    };

    firstPass();
  };

  runTypewriter();

  const getTheme = () =>
    document.documentElement.getAttribute("data-theme") === "light"
      ? "light"
      : "dark";

  const setTheme = (theme) => {
    const next = theme === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    if (themeColorMeta) {
      themeColorMeta.content = next === "light" ? "#E1DCC9" : "#1F150C";
    }
    try {
      localStorage.setItem("theme", next);
    } catch (_) {
      /* ignore */
    }
    if (themeToggle) {
      themeToggle.setAttribute(
        "aria-label",
        next === "dark" ? "Switch to light theme" : "Switch to dark theme"
      );
    }
  };

  setTheme(getTheme());

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      setTheme(getTheme() === "dark" ? "light" : "dark");
      if (typeof paintHeroStars === "function") paintHeroStars();
    });
  }

  const updateScrollUI = () => {
    if (header) {
      header.classList.toggle("sb-is-scrolled", window.scrollY > 24);
    }

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const maxScroll = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight
    );
    const progress =
      maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;

    if (scrollEdges.top) {
      scrollEdges.top.style.transform = `scaleX(${progress})`;
    }
    if (scrollEdges.right) {
      scrollEdges.right.style.transform = `scaleY(${progress})`;
    }
    if (scrollEdges.bottom) {
      scrollEdges.bottom.style.transform = `scaleX(${progress})`;
    }
    if (scrollEdges.left) {
      scrollEdges.left.style.transform = `scaleY(${progress})`;
    }
  };

  updateScrollUI();
  window.addEventListener("scroll", updateScrollUI, { passive: true });
  window.addEventListener("resize", updateScrollUI);

  const heroBg = document.querySelector(".sb-hero-bg");
  let heroStarsCanvas = null;
  let heroStarSeed = Math.random() * 1e9;
  let heroStars = [];
  let heroStarsRaf = 0;
  let heroStarsW = 0;
  let heroStarsH = 0;
  let heroStarsDpr = 1;

  const prefersStarMotion = () =>
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const buildHeroStars = (w, h) => {
    const count = Math.min(
      prefersStarMotion() ? 2400 : 3400,
      Math.max(800, Math.floor((w * h) / (prefersStarMotion() ? 200 : 130)))
    );

    let t = heroStarSeed;
    const rand = () => {
      t = (t * 1664525 + 1013904223) % 4294967296;
      return t / 4294967296;
    };

    heroStars = Array.from({ length: count }, () => {
      const roll = rand();
      const radius =
        roll < 0.78
          ? 0.25 + rand() * 0.7
          : roll < 0.94
            ? 0.7 + rand() * 1.1
            : 1.2 + rand() * 1.6;
      const speed = 0.015 + rand() * 0.09;
      const angle = rand() * Math.PI * 2;
      return {
        x: rand() * w,
        y: rand() * h,
        r: radius,
        baseAlpha: 0.12 + rand() * 0.5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        twinkle: rand() * Math.PI * 2,
        twinkleSpeed: 0.004 + rand() * 0.012,
      };
    });
  };

  const drawHeroStarsFrame = () => {
    if (!heroStarsCanvas) return;
    const ctx = heroStarsCanvas.getContext("2d");
    if (!ctx) return;

    const w = heroStarsW;
    const h = heroStarsH;
    const fill =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--text")
        .trim() || "#E1DCC9";

    ctx.setTransform(heroStarsDpr, 0, 0, heroStarsDpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = fill;

    for (let i = 0; i < heroStars.length; i += 1) {
      const star = heroStars[i];
      const alpha =
        star.baseAlpha * (0.65 + 0.35 * Math.sin(star.twinkle));
      ctx.globalAlpha = Math.max(0.12, Math.min(0.9, alpha));
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  };

  const tickHeroStars = () => {
    if (!prefersStarMotion() || document.hidden) {
      heroStarsRaf = 0;
      return;
    }

    const w = heroStarsW;
    const h = heroStarsH;

    for (let i = 0; i < heroStars.length; i += 1) {
      const star = heroStars[i];
      star.x += star.vx;
      star.y += star.vy;
      star.twinkle += star.twinkleSpeed;

      if ((i + (heroStarsRaf % 97)) % 211 === 0) {
        star.vx += (Math.random() - 0.5) * 0.008;
        star.vy += (Math.random() - 0.5) * 0.008;
        const speed = Math.hypot(star.vx, star.vy) || 0.02;
        const max = 0.12;
        if (speed > max) {
          star.vx = (star.vx / speed) * max;
          star.vy = (star.vy / speed) * max;
        }
      }

      if (star.x < -2) star.x = w + 2;
      else if (star.x > w + 2) star.x = -2;
      if (star.y < -2) star.y = h + 2;
      else if (star.y > h + 2) star.y = -2;
    }

    drawHeroStarsFrame();
    heroStarsRaf = window.requestAnimationFrame(tickHeroStars);
  };

  const startHeroStars = () => {
    if (heroStarsRaf) return;
    if (!prefersStarMotion()) {
      drawHeroStarsFrame();
      return;
    }
    heroStarsRaf = window.requestAnimationFrame(tickHeroStars);
  };

  const stopHeroStars = () => {
    if (!heroStarsRaf) return;
    window.cancelAnimationFrame(heroStarsRaf);
    heroStarsRaf = 0;
  };

  const paintHeroStars = () => {
    const host = document.querySelector(".sb-site-stars");
    if (!host) return;

    const w = Math.max(1, window.innerWidth);
    const h = Math.max(1, window.innerHeight);

    if (!heroStarsCanvas) {
      heroStarsCanvas = document.createElement("canvas");
      heroStarsCanvas.className = "sb-hero-stars";
      heroStarsCanvas.setAttribute("aria-hidden", "true");
      host.appendChild(heroStarsCanvas);
    }

    heroStarsDpr = Math.min(window.devicePixelRatio || 1, 2);
    heroStarsW = w;
    heroStarsH = h;
    heroStarsCanvas.width = Math.floor(w * heroStarsDpr);
    heroStarsCanvas.height = Math.floor(h * heroStarsDpr);
    heroStarsCanvas.style.width = `${w}px`;
    heroStarsCanvas.style.height = `${h}px`;

    buildHeroStars(w, h);
    drawHeroStarsFrame();
    stopHeroStars();
    startHeroStars();
  };

  const fitHeroGrid = () => {
    if (!heroBg) return;
    const w = heroBg.clientWidth;
    const h = heroBg.clientHeight;
    if (w < 1 || h < 1) return;

    const ideal = window.innerWidth < 480 ? 56 : 80;
    const cols = Math.max(6, Math.round(w / ideal));
    const rows = Math.max(6, Math.round(h / ideal));

    heroBg.style.setProperty("--grid-x", `${w / cols}px`);
    heroBg.style.setProperty("--grid-y", `${h / rows}px`);
  };

  const refreshHeroEffects = () => {
    fitHeroGrid();
    paintHeroStars();
    syncStarsDepth();
  };

  const syncStarsDepth = () => {
    const host = document.querySelector(".sb-site-stars");
    const hero = document.querySelector(".sb-hero");
    if (!host || !hero) return;

    const heroBottom = hero.getBoundingClientRect().bottom;
    const pastHero = heroBottom < window.innerHeight * 0.45;
    host.dataset.depth = pastHero ? "soft" : "full";
  };

  refreshHeroEffects();
  window.addEventListener("resize", refreshHeroEffects);
  window.addEventListener("scroll", syncStarsDepth, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopHeroStars();
    else startHeroStars();
  });
  if (document.fonts?.ready) {
    document.fonts.ready.then(refreshHeroEffects);
  }

  const heroSection = document.querySelector(".sb-hero");
  const heroSpot = document.querySelector(".sb-hero-spot");

  if (
    heroSection &&
    heroSpot &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    window.matchMedia("(pointer: fine)").matches
  ) {
    let spotRaf = 0;
    let pendingX = 0;
    let pendingY = 0;
    let heroRect = heroSection.getBoundingClientRect();

    const refreshHeroRect = () => {
      heroRect = heroSection.getBoundingClientRect();
    };

    const flushSpot = () => {
      heroSpot.style.setProperty("--spot-x", `${pendingX}px`);
      heroSpot.style.setProperty("--spot-y", `${pendingY}px`);
      spotRaf = 0;
    };

    const moveSpot = (event) => {
      pendingX = event.clientX - heroRect.left;
      pendingY = event.clientY - heroRect.top;
      heroSection.classList.add("sb-is-spotting");
      if (!spotRaf) spotRaf = window.requestAnimationFrame(flushSpot);
    };

    window.addEventListener("resize", refreshHeroRect);
    window.addEventListener("scroll", refreshHeroRect, { passive: true });

    heroSection.addEventListener("pointerenter", (event) => {
      refreshHeroRect();
      moveSpot(event);
    });

    heroSection.addEventListener("pointermove", moveSpot);

    heroSection.addEventListener("pointerleave", () => {
      heroSection.classList.remove("sb-is-spotting");
    });
  }

  const setMenuOpen = (open) => {
    if (!nav || !toggle) return;
    nav.classList.toggle("sb-is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  };

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      setMenuOpen(!nav.classList.contains("sb-is-open"));
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => setMenuOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    });
  }

  const setActiveLink = () => {
    const offset = window.scrollY + 120;
    let current = "";

    sections.forEach((section) => {
      if (section.offsetTop <= offset) {
        current = section.id;
      }
    });

    navLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      const id = href.startsWith("#") ? href.slice(1) : "";
      const active = id === current && id !== "";
      link.classList.toggle("sb-is-active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };

  setActiveLink();
  window.addEventListener("scroll", setActiveLink, { passive: true });

  const contactForm = document.querySelector("[data-contact-form]");
  const formStatus = document.querySelector("[data-form-status]");
  const toast = document.querySelector("[data-toast]");
  const toastText = document.querySelector("[data-toast-text]");
  const toastClose = document.querySelector("[data-toast-close]");
  let toastTimer = 0;

  const hideToast = () => {
    if (!toast) return;
    toast.classList.remove("sb-is-visible");
    window.setTimeout(() => {
      if (!toast.classList.contains("sb-is-visible")) {
        toast.hidden = true;
        if (toastText) toastText.textContent = "";
      }
    }, 300);
  };

  const showToast = (message) => {
    if (!toast || !toastText) return;
    window.clearTimeout(toastTimer);
    toastText.textContent = message;
    toast.hidden = false;
    window.requestAnimationFrame(() => {
      toast.classList.add("sb-is-visible");
    });
    if (typeof lucide !== "undefined" && typeof lucide.createIcons === "function") {
      lucide.createIcons();
    }
    toastTimer = window.setTimeout(hideToast, 4200);
  };

  if (toastClose) {
    toastClose.addEventListener("click", () => {
      window.clearTimeout(toastTimer);
      hideToast();
    });
  }

  if (contactForm && formStatus) {
    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const submitButton = contactForm.querySelector('button[type="submit"]');
      const submitLabel = submitButton?.querySelector("span");
      const originalLabel = submitLabel?.textContent || "Send message";

      formStatus.textContent = "Sending your message…";
      formStatus.className = "sb-form-status";
      if (submitButton) submitButton.disabled = true;
      if (submitLabel) submitLabel.textContent = "Sending…";

      try {
        const response = await fetch(contactForm.action, {
          method: "POST",
          body: new FormData(contactForm),
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Message delivery failed");
        }

        contactForm.reset();
        formStatus.textContent = "";
        formStatus.className = "sb-form-status";
        showToast("Message sent. Thank you — I’ll reply soon.");
      } catch (_) {
        formStatus.textContent =
          "Couldn’t send the message. Please email me directly instead.";
        formStatus.classList.add("sb-is-error");
      } finally {
        if (submitButton) submitButton.disabled = false;
        if (submitLabel) submitLabel.textContent = originalLabel;
      }
    });
  }

  const copyEmailButton = document.querySelector("[data-copy-email]");

  if (copyEmailButton) {
    copyEmailButton.addEventListener("click", async () => {
      const email = copyEmailButton.getAttribute("data-copy-email") || "";
      const label = copyEmailButton.querySelector("[data-copy-label]");

      try {
        await navigator.clipboard.writeText(email);
      } catch (_) {
        const helper = document.createElement("textarea");
        helper.value = email;
        helper.style.position = "fixed";
        helper.style.opacity = "0";
        document.body.appendChild(helper);
        helper.select();
        document.execCommand("copy");
        helper.remove();
      }

      copyEmailButton.classList.add("sb-is-copied");
      if (label) label.textContent = "Copied";
      window.setTimeout(() => {
        copyEmailButton.classList.remove("sb-is-copied");
        if (label) label.textContent = "Copy";
      }, 1800);
    });
  }

  const eduTabs = document.querySelectorAll("[data-edu-tab]");
  const eduPanels = document.querySelectorAll("[data-edu-panel]");

  if (eduTabs.length && eduPanels.length) {
    const activateEducationTab = (tab, focus = false) => {
      const target = tab.getAttribute("data-edu-tab");

      eduTabs.forEach((item) => {
        const active = item === tab;
        item.classList.toggle("sb-is-active", active);
        item.setAttribute("aria-selected", active ? "true" : "false");
        item.tabIndex = active ? 0 : -1;
      });

      eduPanels.forEach((panel) => {
        const match = panel.getAttribute("data-edu-panel") === target;
        panel.classList.toggle("sb-is-active", match);
        panel.hidden = !match;
      });

      if (focus) tab.focus();
      if (typeof lucide !== "undefined" && typeof lucide.createIcons === "function") {
        lucide.createIcons();
      }
    };

    eduTabs.forEach((tab, index) => {
      tab.tabIndex = tab.classList.contains("sb-is-active") ? 0 : -1;
      tab.addEventListener("click", () => activateEducationTab(tab));
      tab.addEventListener("keydown", (event) => {
        let nextIndex = index;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % eduTabs.length;
        else if (event.key === "ArrowLeft") nextIndex = (index - 1 + eduTabs.length) % eduTabs.length;
        else if (event.key === "Home") nextIndex = 0;
        else if (event.key === "End") nextIndex = eduTabs.length - 1;
        else return;

        event.preventDefault();
        activateEducationTab(eduTabs[nextIndex], true);
      });
    });
  }

  const revealItems = document.querySelectorAll("[data-reveal]");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("sb-is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("sb-is-visible"));
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (typeof Swiper !== "undefined") {
    const projectSwiper = new Swiper(".sb-projects-swiper", {
      slidesPerView: 1,
      slidesPerGroup: 1,
      spaceBetween: 16,
      speed: reduceMotion ? 0 : 650,
      grabCursor: true,
      watchOverflow: true,
      pagination: {
        el: ".sb-projects-pagination",
        clickable: true,
      },
      navigation: {
        nextEl: ".sb-projects-next",
        prevEl: ".sb-projects-prev",
      },
      keyboard: {
        enabled: true,
        onlyInViewport: true,
      },
      breakpoints: {
        700: {
          slidesPerView: 2,
          slidesPerGroup: 2,
          spaceBetween: 18,
        },
        1050: {
          slidesPerView: 3,
          slidesPerGroup: 3,
          spaceBetween: 20,
        },
      },
    });

    const projectFilters = document.querySelectorAll("[data-project-filter]");
    const projectSlides = Array.from(
      document.querySelectorAll("[data-project-category]")
    );

    projectFilters.forEach((filter) => {
      filter.addEventListener("click", () => {
        const category = filter.getAttribute("data-project-filter");

        projectFilters.forEach((item) => {
          const active = item === filter;
          item.classList.toggle("sb-is-active", active);
          item.setAttribute("aria-pressed", active ? "true" : "false");
        });

        projectSlides.forEach((slide) => {
          const visible =
            category === "all" ||
            slide.getAttribute("data-project-category") === category;
          slide.hidden = !visible;
        });

        projectSwiper.slideTo(0, 0);
        projectSwiper.update();
        projectSwiper.pagination.render();
        projectSwiper.pagination.update();
        projectSwiper.navigation.update();
      });
    });
  }
})();
