# Style Presets

When the user names a style, copy its `COLORS` object into the file skeleton's STYLE CONSTANTS block and apply its visual characteristics. If no style is named, use **minimalist**.

---

## Minimalist (default)

```tsx
const COLORS = {
  primary: '#18181B',
  secondary: '#71717A',
  accent: '#3B82F6',
  background: '#FAFAFA',
  text: '#18181B',
} as const;
```

**Characteristics:** maximum whitespace, subtle animations, thin fonts, no decorative elements. Let the content breathe — restraint is the point.

---

## Memphis

```tsx
const COLORS = {
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  accent: '#FFE66D',
  background: '#F7FFF7',
  text: '#2D3436',
} as const;
```

**Characteristics:** geometric shapes (triangles, circles, squiggles), bold black outlines, scattered elements, confetti particles. Playful and busy — lean into the chaos.

---

## Neo-brutalism

```tsx
const COLORS = {
  primary: '#FF5C00',
  secondary: '#3B82F6',
  accent: '#FACC15',
  background: '#FFFFFF',
  text: '#000000',
} as const;
```

**Characteristics:** harsh black borders (3–4px), solid color blocks, offset box shadows (`4px 4px 0px #000`), raw aesthetic. No gradients, no softness — everything is hard-edged.

---

## Glassmorphism

```tsx
const COLORS = {
  primary: '#FFFFFF',
  secondary: '#A855F7',
  accent: '#06B6D4',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  text: '#FFFFFF',
} as const;
```

**Characteristics:** frosted glass panels (`backdrop-filter: blur(...)`), transparency, subtle 1px borders, gradient backgrounds. Layer translucent cards over the gradient.

> Note: `background` here is a gradient string. Apply it via `background` (not `backgroundColor`) on the `AbsoluteFill`.

---

## Neon / Cyberpunk

```tsx
const COLORS = {
  primary: '#FF00FF',
  secondary: '#00FFFF',
  accent: '#FFFF00',
  background: '#0A0A0F',
  text: '#FFFFFF',
} as const;
```

**Characteristics:** dark backgrounds, glowing effects (`box-shadow` / `text-shadow` in the accent color), scanlines, tech-inspired elements. The glow is what sells it — apply colored shadows generously.

---

## Corporate

```tsx
const COLORS = {
  primary: '#1E40AF',
  secondary: '#3B82F6',
  accent: '#10B981',
  background: '#F8FAFC',
  text: '#1E293B',
} as const;
```

**Characteristics:** professional, clean, trustworthy blues, structured layouts, subtle gradients. Conservative motion — nothing flashy.
