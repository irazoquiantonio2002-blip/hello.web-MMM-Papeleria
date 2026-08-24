const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

document.addEventListener("DOMContentLoaded", () => {
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  initLoader();
  initNavbar();
  initMobileMenu();
  initReveal();
  initMarquee();
  initCounters();
  initContactForm();
  initHeroCanvas();
});

function initLoader() {
  const loader = $("#loader");
  if (!loader) return;

  window.addEventListener("load", () => {
    window.setTimeout(() => loader.classList.add("loader-hidden"), 450);
  });
}

function initNavbar() {
  const navbar = $("#navbar");
  if (!navbar) return;

  const update = () => {
    navbar.classList.toggle("scrolled", window.scrollY > 20);
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
}

function initMobileMenu() {
  const button = $("#hamburger");
  const menu = $("#mob-menu");
  if (!button || !menu) return;

  const close = () => {
    button.classList.remove("is-active");
    button.setAttribute("aria-expanded", "false");
    menu.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  };

  button.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    button.classList.toggle("is-active", isOpen);
    button.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("menu-open", isOpen);
  });

  $$("a", menu).forEach((link) => link.addEventListener("click", close));
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
}

function initReveal() {
  const items = $$(".reveal");
  if (!items.length) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.16 });

  items.forEach((item) => observer.observe(item));
}

function initMarquee() {
  const marquee = $("#marquee");
  if (!marquee) return;

  const words = [
    "Útiles escolares",
    "Copias",
    "Impresiones",
    "Engargolados",
    "Enmicados",
    "Forrado de cuadernos",
    "Regalos",
    "Material didáctico",
    "Papeles",
    "Pegamentos",
    "Juguetes",
    "Pilas y cargadores"
  ];

  const loop = [...words, ...words, ...words, ...words];
  marquee.innerHTML = loop.map((word) => `<span>${word}</span>`).join("");
}

function initCounters() {
  const counters = $$(".stat-num");
  if (!counters.length) return;

  const animateCounter = (counter) => {
    const target = Number(counter.dataset.count || 0);
    const suffix = counter.dataset.suffix || "";
    const duration = 1200;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = `${Math.round(target * eased)}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  if (!("IntersectionObserver" in window)) {
    counters.forEach(animateCounter);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || entry.target.dataset.done) return;
      entry.target.dataset.done = "true";
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.45 });

  counters.forEach((counter) => observer.observe(counter));
}

function initContactForm() {
  const form = $("#wa-form");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = $("#f-name")?.value.trim();
    const interest = $("#f-interest")?.value.trim();
    const message = $("#f-msg")?.value.trim();

    if (!name || !message) {
      form.reportValidity();
      return;
    }

    const text = [
      "Hola, soy " + name + ".",
      "Me interesa: " + interest + ".",
      "Detalle: " + message
    ].join("\n");

    const phone = (form.dataset.whatsapp || "").replace(/\D/g, "");

    if (phone) {
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      alert("Tu solicitud se copió al portapapeles. Puedes pegarla en el canal de contacto de MMM Papelería.");
    } catch {
      alert(text);
    }
  });
}

function initHeroCanvas() {
  const canvas = $("#hero-canvas");
  if (!canvas) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  const ctx = canvas.getContext("2d");
  const colors = ["#ffd735", "#ff4fb8", "#27c8ff", "#46e56a"];
  let particles = [];
  let width = 0;
  let height = 0;
  let animationFrame = null;

  const resize = () => {
    const ratio = window.devicePixelRatio || 1;
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    const count = Math.min(72, Math.max(34, Math.floor(width / 22)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.4 + 1,
      speed: Math.random() * 0.35 + 0.12,
      drift: Math.random() * 0.4 - 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.38 + 0.12
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      p.y -= p.speed;
      p.x += p.drift;

      if (p.y < -10) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }

      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;

      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size * 4, p.size);
    });

    ctx.globalAlpha = 1;
    animationFrame = requestAnimationFrame(draw);
  };

  resize();
  draw();

  window.addEventListener("resize", () => {
    cancelAnimationFrame(animationFrame);
    resize();
    draw();
  }, { passive: true });
}
