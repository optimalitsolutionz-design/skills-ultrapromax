/* =========================================================
   Digital Paradigm Health — interactions
   Vanilla JS, no dependencies. Accessible + reduced-motion aware.
   ========================================================= */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Footer year ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Theme toggle ---------- */
  const root = document.documentElement;
  const themeToggle = $("#themeToggle");
  const stored = (() => { try { return localStorage.getItem("dph-theme"); } catch (e) { return null; } })();
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (themeToggle) themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
  }
  applyTheme(stored || (systemDark ? "dark" : "light"));

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem("dph-theme", next); } catch (e) {}
    });
  }

  /* ---------- Header shadow on scroll ---------- */
  const header = $(".site-header");
  const onScrollHeader = () => {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 8);
  };
  onScrollHeader();

  /* ---------- Mobile nav ---------- */
  const navToggle = $("#navToggle");
  const mobileNav = $("#mobileNav");
  if (navToggle && mobileNav) {
    const closeNav = () => {
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open menu");
      mobileNav.hidden = true;
    };
    navToggle.addEventListener("click", () => {
      const open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!open));
      navToggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
      mobileNav.hidden = open;
    });
    $$("a", mobileNav).forEach((a) => a.addEventListener("click", closeNav));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
        closeNav(); navToggle.focus();
      }
    });
  }

  /* ---------- Currency formatting (AU) ---------- */
  const fmt = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 });
  const money = (n) => fmt.format(Math.round(n));

  /* ---------- Slider track fill ---------- */
  function paintRange(input) {
    const min = Number(input.min) || 0;
    const max = Number(input.max) || 100;
    const val = Number(input.value);
    const pct = ((val - min) / (max - min)) * 100;
    input.style.setProperty("--p", pct + "%");
  }

  /* ---------- Interactive loss calculator ---------- */
  const feeInput = $("#fee");
  const slotsInput = $("#slots");
  const feeOut = $("#feeOut");
  const slotsOut = $("#slotsOut");
  const weeklyLoss = $("#weeklyLoss");
  const annualLoss = $("#annualLoss");
  const recoverAmount = $("#recoverAmount");
  const recoverFill = $("#recoverFill");
  const mobileLoss = $("#mobileLoss");

  // Conservative recovery band: 25%–40% of lost revenue is recapturable
  const RECOVER_LOW = 0.25;
  const RECOVER_HIGH = 0.40;

  function calc() {
    if (!feeInput || !slotsInput) return;
    const fee = Number(feeInput.value);
    const slots = Number(slotsInput.value);
    const weekly = fee * slots;
    const annual = weekly * 52;

    if (feeOut) feeOut.textContent = money(fee);
    if (slotsOut) slotsOut.textContent = String(slots);
    if (weeklyLoss) weeklyLoss.textContent = money(weekly);
    if (annualLoss) annualLoss.textContent = money(annual);

    if (recoverAmount) {
      recoverAmount.textContent = money(annual * RECOVER_LOW) + "–" + money(annual * RECOVER_HIGH) + "/yr";
    }
    if (recoverFill) {
      // visualise the midpoint of the recoverable band
      const mid = (RECOVER_LOW + RECOVER_HIGH) / 2;
      recoverFill.style.transform = "scaleX(" + mid.toFixed(2) + ")";
    }
    if (mobileLoss) mobileLoss.textContent = money(annual) + "/yr";

    paintRange(feeInput);
    paintRange(slotsInput);
  }

  if (feeInput && slotsInput) {
    feeInput.addEventListener("input", calc);
    slotsInput.addEventListener("input", calc);
    calc();
  }

  /* ---------- Count-up for stat band ---------- */
  function countUp(el) {
    const target = parseFloat(el.dataset.count);
    if (isNaN(target)) return;
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    if (prefersReduced) {
      el.textContent = prefix + target.toFixed(decimals) + suffix;
      return;
    }
    const duration = 1300;
    const start = performance.now();
    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const val = target * eased;
      el.textContent = prefix + val.toFixed(decimals) + suffix;
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(tick);
  }

  /* ---------- IntersectionObserver: reveal + count ---------- */
  const reveals = $$(".reveal");
  reveals.forEach((el) => {
    const d = el.getAttribute("data-reveal-delay");
    if (d) el.style.setProperty("--d", d);
  });

  if ("IntersectionObserver" in window && !prefersReduced) {
    const revealObs = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("in"); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach((el) => revealObs.observe(el));

    const counted = new WeakSet();
    const countObs = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !counted.has(entry.target)) {
          counted.add(entry.target);
          countUp(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    $$(".stat-num").forEach((el) => countObs.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
    $$(".stat-num").forEach(countUp);
  }

  /* ---------- FAQ: single-open accordion ---------- */
  const faqItems = $$(".faq-item");
  faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (item.open) {
        faqItems.forEach((other) => { if (other !== item) other.open = false; });
      }
    });
  });

  /* ---------- Mobile sticky CTA visibility ---------- */
  const mobileCta = $(".mobile-cta");
  const hero = $(".hero");
  const finalCta = $("#contact");

  function onScroll() {
    onScrollHeader();
    if (!mobileCta) return;
    const heroBottom = hero ? hero.getBoundingClientRect().bottom : 400;
    const finalTop = finalCta ? finalCta.getBoundingClientRect().top : Infinity;
    const show = heroBottom < 0 && finalTop > window.innerHeight;
    mobileCta.classList.toggle("show", show);
  }
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => { onScroll(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  /* ---------- Lead form validation + submit ---------- */
  const form = $("#leadForm");
  if (form) {
    const submitBtn = $("#lf-submit", form);
    const successEl = $("#formSuccess");

    const validators = {
      "lf-name": (v) => v.trim().length >= 2 || "Please enter your name.",
      "lf-clinic": (v) => v.trim().length >= 2 || "Please enter your clinic name.",
      "lf-email": (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || "Please enter a valid email.",
    };

    function setError(id, msg) {
      const field = $("#" + id, form);
      const errEl = $('.field-error[data-for="' + id + '"]', form);
      if (field) field.classList.toggle("invalid", Boolean(msg));
      if (field) field.setAttribute("aria-invalid", msg ? "true" : "false");
      if (errEl) errEl.textContent = msg || "";
    }

    Object.keys(validators).forEach((id) => {
      const field = $("#" + id, form);
      if (!field) return;
      field.addEventListener("blur", () => {
        const res = validators[id](field.value);
        setError(id, res === true ? "" : res);
      });
      field.addEventListener("input", () => {
        if (field.classList.contains("invalid")) {
          const res = validators[id](field.value);
          if (res === true) setError(id, "");
        }
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let firstInvalid = null;
      Object.keys(validators).forEach((id) => {
        const field = $("#" + id, form);
        if (!field) return;
        const res = validators[id](field.value);
        const msg = res === true ? "" : res;
        setError(id, msg);
        if (msg && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) { firstInvalid.focus(); return; }

      // Simulate async submission. Wire to a real endpoint (Formspree / API) here.
      submitBtn.classList.add("loading");
      submitBtn.disabled = true;
      setTimeout(() => {
        submitBtn.classList.remove("loading");
        submitBtn.disabled = false;
        if (successEl) { successEl.hidden = false; successEl.focus && successEl.focus(); }
      }, 1100);
    });
  }
})();
