# Number Creator 🔮

A playful PWA for inventing your own **fictional numbers** — numbers that don't exist yet! Draw a custom number shape, name it, give it a value, then supercharge it with exponents. Built for iPad (landscape), installable to the home screen.

> Original concept & design by Hooper (age 8).

## Features

- ✏️ **Draw** custom number shapes — strokes are auto-smoothed (perfect-freehand)
- 🔢 **Library** of every number you've created
- ⚡ **Exponents** — multipliers that make your numbers bigger, with live results
- 🎁 **Free fictional numbers** — a mystery setting that invents one for you
- 🌙 Light & dark themes
- 📱 Installable PWA, works offline, iPad landscape friendly

## Tech stack

Vite · React + TypeScript · Radix UI · BEM CSS · Zustand · perfect-freehand · vite-plugin-pwa

## Develop

```bash
npm install
npm run dev
```

## Build & preview

```bash
npm run build
npm run preview
```

## Deploy

Pushing to `main` triggers the GitHub Actions workflow that builds and deploys to GitHub Pages.

Live at: https://jamessann.github.io/number-creator/
