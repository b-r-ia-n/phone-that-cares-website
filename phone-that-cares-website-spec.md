# Phone That Cares About You — Portfolio Website Scaffold

## Overview

Build a static portfolio site for a speculative phone-design project called "Phone That Cares About You." The site uses Astro with React integration. It has five content tabs, each with a distinct color theme from the "Sage & Stone" palette. The key UI element is a floating outlined-pill navigation bar that hides on scroll-down and reappears on scroll-up.

The aesthetic is: natural, muted, grounded. Think Japanese minimalism meets material design warmth. The site should feel calm, friendly, and slightly crunchy — like a field notebook, not a SaaS landing page. Typography should be distinctive but readable. Generous whitespace. Let the content breathe.

## Tech Stack

- **Astro** (latest stable) with React integration (`@astrojs/react`)
- **MDX support** (`@astrojs/mdx`) for content pages
- CSS custom properties for theming (no Tailwind, no CSS-in-JS)
- Vanilla JS for scroll behavior (no heavy libraries)
- Google Fonts for typography

## Project Structure

```
phone-site/
├── src/
│   ├── config/
│   │   └── tabs.ts
│   ├── content/
│   │   └── tabs/
│   │       ├── welcome.mdx
│   │       ├── the-phone.mdx
│   │       ├── experiments.mdx
│   │       ├── ideas.mdx
│   │       └── writing.mdx
│   ├── components/
│   │   ├── NavBar.astro
│   │   ├── NavBarScript.astro
│   │   └── AsciiPhoneHero.jsx
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   └── [tab].astro
│   └── styles/
│       ├── global.css
│       └── themes.css
├── public/
│   └── diagrams/
└── astro.config.mjs
```

## Tab Configuration — src/config/tabs.ts

```ts
export interface Tab {
  slug: string;
  label: string;
  theme: string;
  order: number;
}

export const tabs: Tab[] = [
  { slug: 'welcome',     label: 'Welcome',     theme: 'welcome',     order: 0 },
  { slug: 'the-phone',   label: 'The Phone',   theme: 'phone',       order: 1 },
  { slug: 'experiments',  label: 'Experiments',  theme: 'experiments',  order: 2 },
  { slug: 'ideas',       label: 'Ideas',       theme: 'ideas',       order: 3 },
  { slug: 'writing',     label: 'Writing',     theme: 'writing',     order: 4 },
];

export function getTab(slug: string): Tab | undefined {
  return tabs.find(t => t.slug === slug);
}
```

## Color Themes — src/styles/themes.css

Each tab sets a data-theme attribute on the body element. CSS custom properties cascade from there.

The palette is "Sage & Stone" — muted, earthy tones. Each tab should feel like a distinct room in the same building. The differences are subtle but noticeable.

IMPORTANT: The five tabs must be chromatically distinct from one another — not all green. Phone is sage-green. Experiments is bluer/teal-green. Ideas is warm golden ochre. Writing is warm clay/terracotta. Welcome is neutral cream.

```css
:root {
  --bg: #F2EFE7;
  --accent: #2B2B22;
  --accent-muted: rgba(43, 43, 34, 0.45);
  --border-subtle: rgba(43, 43, 34, 0.15);
  --text-primary: #2B2B22;
  --text-secondary: rgba(43, 43, 34, 0.7);
  --nav-bg: #F2EFE7;
}

[data-theme="welcome"] {
  --bg: #F2EFE7;
  --accent: #2B2B22;
  --accent-muted: rgba(43, 43, 34, 0.45);
  --border-subtle: rgba(43, 43, 34, 0.15);
  --text-primary: #2B2B22;
  --text-secondary: rgba(43, 43, 34, 0.7);
  --nav-bg: #F2EFE7;
}

[data-theme="phone"] {
  --bg: #DEE6D8;
  --accent: #3F5B32;
  --accent-muted: rgba(63, 91, 50, 0.45);
  --border-subtle: rgba(63, 91, 50, 0.15);
  --text-primary: #2B3B22;
  --text-secondary: rgba(43, 59, 34, 0.75);
  --nav-bg: #DEE6D8;
}

[data-theme="experiments"] {
  --bg: #D6E2E0;
  --accent: #2B5B52;
  --accent-muted: rgba(43, 91, 82, 0.45);
  --border-subtle: rgba(43, 91, 82, 0.15);
  --text-primary: #1F3B35;
  --text-secondary: rgba(31, 59, 53, 0.75);
  --nav-bg: #D6E2E0;
}

[data-theme="ideas"] {
  --bg: #EBE2D0;
  --accent: #7B5A1F;
  --accent-muted: rgba(123, 90, 31, 0.45);
  --border-subtle: rgba(123, 90, 31, 0.15);
  --text-primary: #3B2F15;
  --text-secondary: rgba(59, 47, 21, 0.75);
  --nav-bg: #EBE2D0;
}

[data-theme="writing"] {
  --bg: #EDDED0;
  --accent: #8B4A2B;
  --accent-muted: rgba(139, 74, 43, 0.45);
  --border-subtle: rgba(139, 74, 43, 0.15);
  --text-primary: #3B1F12;
  --text-secondary: rgba(59, 31, 18, 0.75);
  --nav-bg: #EDDED0;
}
```

## Global Styles — src/styles/global.css

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;1,9..40,400&family=DM+Serif+Display&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'DM Sans', system-ui, sans-serif;
  background-color: var(--bg);
  color: var(--text-primary);
  transition: background-color 350ms ease, color 350ms ease;
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3 {
  font-family: 'DM Serif Display', Georgia, serif;
  font-weight: 400;
  line-height: 1.2;
}

h1 { font-size: clamp(2rem, 5vw, 3.2rem); }
h2 { font-size: clamp(1.5rem, 3.5vw, 2.2rem); }
h3 { font-size: clamp(1.2rem, 2.5vw, 1.5rem); }

p {
  font-size: clamp(0.95rem, 1.8vw, 1.1rem);
  color: var(--text-secondary);
  max-width: 640px;
}

a {
  color: var(--accent);
  text-decoration: none;
  border-bottom: 1px solid var(--border-subtle);
  transition: border-color 200ms ease;
}

a:hover {
  border-color: var(--accent);
}

::selection {
  background: var(--accent);
  color: var(--bg);
}
```

## Floating Nav Bar — src/components/NavBar.astro

### Visual spec:
- Centered horizontally, fixed position, top of viewport with 16px margin from top
- Pill-shaped (border-radius: 999px)
- Background: var(--nav-bg) — same as page background, so it blends seamlessly
- Border: 0.5px solid var(--border-subtle) — hairline outline defines the shape
- The nav bg and border transition colors along with the page (350ms ease)
- Padding: 10px 22px inside the pill
- Width: auto (shrink to fit content), centered with left: 50%; transform: translateX(-50%)

### Tab labels:
- Inactive tabs: color: var(--accent-muted) (~45% opacity of accent). Font-weight: 400.
- Active tab: color: var(--accent) at full opacity. Font-weight: 500.
- Hover on inactive: opacity transitions to ~80% over 150ms
- Font size: 14px on desktop, 13px on mobile
- Gap between labels: 24px on desktop, 14px on mobile
- Each label is an anchor tag linking to /{slug} (or / for welcome)

### Scroll-hide behavior (in NavBarScript.astro):
- When user scrolls DOWN past 80px from current position, nav slides up and out: transform adds translateY(-100%) and opacity goes to 0, transition 250ms ease
- When user scrolls UP any amount (with 5px dead zone), nav slides back in
- On page load, nav is always visible
- Use position: fixed; top: 16px; z-index: 100
- Implement with a simple scroll event listener tracking lastScrollY

### Mobile behavior (< 640px):
- Keep the pill visible with all labels, use smaller font (12px) and tighter gaps (12px)
- If labels overflow the viewport width, the pill should scroll horizontally with overflow-x: auto and -webkit-overflow-scrolling: touch
- Do NOT use a hamburger menu

## Layout — src/layouts/BaseLayout.astro

Standard HTML shell. Imports global.css and themes.css. Accepts theme and activeSlug props. Sets data-theme on body. Renders NavBar with activeSlug. Main content area has padding-top: 72px to clear the floating nav. Includes NavBarScript at the end of body.

Enable Astro View Transitions if straightforward (import ViewTransitions from astro:transitions, add to head). This makes tab-to-tab navigation feel like smooth palette shifts rather than page reloads.

## Pages

### src/pages/index.astro
Renders the Welcome tab. Uses BaseLayout with theme="welcome" and activeSlug="welcome".

Content (centered, max-width 720px, margin auto, padding 0 24px):
1. Placeholder div for ASCII phone hero: 200px tall, dashed 1px border in var(--border-subtle), centered text "ASCII phone animation goes here", border-radius 12px
2. H1: "A phone that cares about you"
3. Paragraph: "There's an untapped opportunity to create technology that drops the pretense of neutrality and actively helps users navigate engaging with digital information streams skillfully. This is a speculative project exploring what that looks like."
4. Section with teasers for the other 4 tabs. Each teaser: H3 with the tab name as a link to /{slug}, followed by a short description paragraph. Generous spacing (margin-bottom: 3rem) between teasers.
5. Small footer section: "Interested? Get in touch:" with a mailto link to hello@example.com (placeholder).

### src/pages/[tab].astro
Dynamic route for the-phone, experiments, ideas, writing.
Uses getStaticPaths() to generate routes from tabs config (excluding welcome).
Reads slug from Astro.params, looks up tab config, passes theme and activeSlug to BaseLayout.

Content (centered, max-width 720px, margin auto, padding 0 24px):
1. H1: the tab label
2. Paragraph with placeholder description:
   - The Phone: "Speculative industrial and interface design for a phone built on different principles."
   - Experiments: "The Scroll Lab and other prototypes for changing how content reaches you."
   - Ideas: "Mental models, diagrams, and the conceptual scaffolding behind the project."
   - Writing: "Essays on attention, integration, and what phones could become."
3. A div with text "Content coming soon" in var(--text-secondary).

## Content Collection Setup

Create src/content/config.ts defining a 'tabs' collection with schema (title: string, description: string). Create 5 MDX files in src/content/tabs/ with matching frontmatter. These are scaffolding for future content migration — they don't need to be rendered yet.

## Verification Checklist

Before stopping, verify ALL of the following:
1. npm run dev starts without errors
2. All 5 routes work: /, /the-phone, /experiments, /ideas, /writing
3. Each page has a visibly different background color (cream, sage, teal, ochre, clay)
4. The floating nav pill is centered at top, outlined (not filled), shows correct active tab
5. Scrolling down hides the nav; scrolling up reveals it
6. View Transitions (if enabled) show smooth color crossfade between tabs
7. Mobile viewport (390px) has legible nav labels
8. Typography uses DM Sans body + DM Serif Display headings
9. The site feels calm and grounded

## Important Notes

- Keep it simple. This is a scaffold.
- Do NOT install Tailwind. Pure CSS with custom properties.
- Do NOT build the Three.js ASCII phone animation — placeholder only.
- Tabs are data-driven from tabs.ts. Adding a new tab = add config entry + theme block + optional MDX file.
