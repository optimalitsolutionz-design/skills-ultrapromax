# Digital Paradigm Health — High-Conversion Landing Page

A rebuilt, conversion-optimized landing page for a healthcare digital-growth
agency serving Australian clinics. Zero dependencies, zero build step — three
static files that deploy anywhere (Vercel, Netlify, GitHub Pages, S3).

```
digital-paradigm-health/
├── index.html    # semantic, SEO + structured-data markup
├── styles.css    # design system, light/dark theming, responsive
├── script.js     # calculator, count-ups, reveals, form validation
└── README.md
```

## Run it

Any static server works:

```bash
cd digital-paradigm-health
python3 -m http.server 8000      # then open http://localhost:8000
```

Deploy to Vercel: point the project root at this folder (no framework preset
needed — it's a static site).

---

## What changed vs. the original, and why

The brief was "maximum conversion." Every decision below maps to a known
conversion lever rather than decoration.

### 1. The loss calculator is now the hero, not a sidebar widget
The original buried an "estimate your weekly loss" number in a static panel.
Here it is a **live, interactive calculator** sitting beside the headline —
the single strongest persuasion device on the page. Two sliders (consultation
fee, empty slots/week) drive an animated weekly/annual loss figure in real
time. It reframes from abstract loss to a personal, moving number, then adds a
**"potentially recoverable"** band to convert fear into opportunity. The
annualized figure also feeds the sticky mobile CTA so the cost follows the user
down the page.

### 2. One clear primary action, repeated
A single primary CTA ("free audit", green) recurs at every natural decision
point: header, hero, calculator, pricing, and a dedicated closing section,
with a low-friction lead form as the alternative path. Secondary actions are
visually subordinate (outline / ghost) so there is never CTA ambiguity.

### 3. Trust and risk-reversal made structural
- AHPRA compliance is a full feature section (regulatory fear is the #1 buying
  objection in AU healthcare marketing), not fine print.
- Risk reversal is explicit and repeated: *you own your website, cancel
  anytime, no lock-in*.
- Social proof is layered: trust badges in the hero, a results grid with
  per-specialty metrics, named testimonials, and a cost-comparison table that
  quantifies the saving.

### 4. Problem → transformation → system → proof → offer
The page follows a problem-agitate-solve funnel: name the four leaks, show the
before/after contrast, explain the build-then-grow system, prove it with
results and testimonials, justify price with a comparison table, then close
with a guarantee-backed CTA and FAQ to kill last-minute objections.

### 5. Honest, AHPRA-safe copy
All claims stay operational ("booking completion", "no-show rate") rather than
clinical, every metric carries a variance disclaimer, and testimonials are
framed around service experience. Persuasive, but defensible.

---

## Design system

| Token | Light | Dark |
|------|-------|------|
| Primary (medical teal) | `#0891B2` | `#22D3EE` |
| CTA (accessible green) | `#15803D` | `#34D399` |
| Background | `#F6FBFB` | `#061A19` |
| Text | `#0E2A28` | `#E8F6F3` |

- **Type pairing:** Figtree (display) + Inter (body/UI). Inter's tabular
  figures keep the calculator and price numbers from shifting.
- **Style:** "Accessible & Ethical" — appropriate for regulated healthcare,
  high contrast, large hit areas.
- **CTA color** uses dedicated tokens tuned for ≥4.5:1 white-on-fill contrast
  (WCAG AA), and the brand gradient was darkened so white text on teal
  sections also passes.

## Accessibility & performance

- Semantic landmarks, skip link, logical heading order, ARIA on icon-only
  controls, visible focus rings, `aria-live` on the calculator output and form.
- Form: real labels, semantic input types, inline validation on blur, focus
  moves to the first invalid field, success state announced via `role="status"`.
- Keyboard-operable nav, FAQ (native `<details>`), and theme toggle; theme
  persists via `localStorage` and respects `prefers-color-scheme`.
- `prefers-reduced-motion` disables count-ups, reveals, and hover transforms.
- No external JS/CSS frameworks. Fonts loaded with `display=swap`. Animations
  use only `transform`/`opacity`. `<noscript>` fallback guarantees content is
  visible without JS.
- Mobile-first, tested at 375 / 768 / 1024 / 1440; sticky mobile CTA bar.

## Wiring the lead form to a real backend

`script.js` simulates submission. Point it at a real endpoint (e.g. Formspree,
or your own API) by replacing the `setTimeout` block in the form handler with a
`fetch()` to your endpoint, and set the Calendly URL throughout `index.html` to
the live booking link.
