# Pethernity — Design Document

## Overview

Pethernity is a web application that allows people who have lost a pet to create a digital memorial in a paradise-themed interactive map. The target audience is people over 45 who have recently lost a beloved animal companion.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Fonts**: Playfair Display (headings), DM Sans (body), Geist Mono (code)
- **Theme**: "Paradiso Etereo" — warm cloud-white, ruby, aurora pink, paradise blue
- **Map Library**: react-zoom-pan-pinch (lightweight infinite pan/zoom)
- **Data Storage**: localStorage (no auth, no backend for now)
- **Icons**: Lucide React

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing page — project story, emotional CTA |
| `/crea` | 4-step stepper to create a memorial |
| `/paradiso` | Paradise map with all memorials |
| `/memoriale/[id]` | Single memorial detail page |

## Data Model

```typescript
interface Memorial {
  id: string
  petName: string
  petType: 'dog' | 'cat' | 'other'
  photo: string           // base64 data URL
  phrase: string           // memory phrase
  birthDate?: string       // ISO date
  deathDate?: string       // ISO date
  position: { x: number; y: number }  // map position
  createdAt: string        // ISO datetime
}
```

Storage: `localStorage` key `pethernity-memorials` containing `Memorial[]`.

## Page Designs

### Landing Page (`/`)

1. **Hero Section**
   - Background: gradient from celeste-paradiso to rosa-aurora with animated CSS clouds
   - Title (Playfair Display): "Un paradiso per chi ci ha amato"
   - Subtitle (DM Sans): Warm, empathetic copy about the project
   - CTA button: "Crea un memoriale" → navigates to `/crea`
   - Decorative rainbow arc (CSS/SVG)

2. **How It Works Section**
   - 3 cards with Lucide icons:
     - Step 1: "Racconta" — Tell us about your companion
     - Step 2: "Posiziona" — Choose their place in paradise
     - Step 3: "Ricorda" — Visit them whenever you want
   - Large text, clear layout for 45+ audience

3. **Map Preview Section**
   - Interactive preview of the paradise map with sample memorials
   - "Esplora il paradiso" CTA → navigates to `/paradiso`

4. **Footer**
   - Project info, sensitivity note, contact

### Memorial Stepper (`/crea`)

4 steps with visual progress bar at top:

1. **"Il tuo compagno"** — Pet name (text input), pet type (large icon buttons: dog/cat/other)
2. **"Una foto"** — Photo upload with drag & drop + click fallback, preview
3. **"Un ricordo"** — Memory phrase (textarea), optional birth/death dates
4. **"Il suo posto in paradiso"** — Mini paradise map to click and place memorial, live preview of the tombstone marker

Navigation: Large "Indietro"/"Avanti" buttons. Final step: "Crea memoriale" with cloud-opening confirmation animation.

### Paradise Map (`/paradiso`)

- **react-zoom-pan-pinch** for infinite pan/zoom with touch support
- Background: large illustrated paradise image (green meadows, soft blue sky, white clouds) with tiling pattern for infinite feel
- **Animated clouds**: CSS floating overlays with slow drift animation
- **Rainbow**: SVG/CSS gradient arc as decorative element
- **Memorial markers**: HTML elements absolutely positioned inside the zoomable container
  - Styled tombstone with pet photo (circular), name, and a subtle glow
  - Click opens dialog with full memorial details
- **Controls**: Zoom +/- buttons, "Crea memoriale" floating button
- Mobile-optimized with native touch gestures

### Memorial Detail (`/memoriale/[id]`)

- Full memorial view with large photo, name, dates, memory phrase
- Paradise-themed background with soft gradients
- "Torna al paradiso" button
- Shareable (future: social sharing)

## Component Architecture

```
components/
├── landing/
│   ├── hero.tsx              # Hero section with animated clouds
│   ├── how-it-works.tsx      # 3-step cards
│   ├── map-preview.tsx       # Paradise map preview
│   └── footer.tsx            # Footer
├── memorial/
│   ├── stepper.tsx           # Main stepper container
│   ├── step-companion.tsx    # Step 1: pet info
│   ├── step-photo.tsx        # Step 2: photo upload
│   ├── step-memory.tsx       # Step 3: memory phrase + dates
│   ├── step-position.tsx     # Step 4: map position picker
│   ├── memorial-marker.tsx   # Tombstone marker on map
│   └── memorial-detail.tsx   # Full memorial view
├── paradise/
│   ├── paradise-map.tsx      # Main map with react-zoom-pan-pinch
│   ├── cloud-overlay.tsx     # Animated floating clouds
│   └── rainbow.tsx           # Decorative rainbow arc
└── ui/
    └── ... (shadcn components)
```

## Visual Design Guidelines

- **Typography**: Large fonts (16px+ body, 48px+ headings) for 45+ audience
- **Colors**: Warm, soft palette from the Paradiso Etereo theme
- **Animations**: Slow, gentle — floating clouds, soft glows, no jarring transitions
- **Interactions**: Large click targets, clear hover states, big buttons
- **Tone**: Warm, empathetic, never cold or technical
- **Accessibility**: High contrast text, keyboard navigation, screen reader support

## UX Considerations for Target (45+)

- Large, readable fonts throughout
- Clear navigation — no hidden menus
- Big, obvious buttons with descriptive text
- Minimal form fields in stepper
- Photo upload supports both drag-and-drop and click-to-browse
- Touch-friendly on tablets (common device for this demographic)
- No complex gestures required — pinch zoom is natural, everything else is click/tap
- Confirmation before final action
- Gentle, encouraging copy at every step

## Dependencies to Add

- `react-zoom-pan-pinch` — infinite pan/zoom for the paradise map
- `uuid` or `crypto.randomUUID()` — memorial ID generation

## Future Enhancements (Not in scope now)

- User authentication
- Backend API + database
- Social sharing of memorials
- Music/ambient sounds
- Memorial comments/condolences from visitors
- Premium memorial styles
- Memorial anniversaries/reminders
