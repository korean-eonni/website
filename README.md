# Shop - E-commerce Website

Built from Figma design, pixel-perfect implementation.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
shop/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (Button, Input, etc.)
│   │   ├── layout/         # Layout components (Header, Footer, etc.)
│   │   ├── sections/       # Page sections (Hero, Products, etc.)
│   │   └── features/       # Feature components (Cart, Checkout, etc.)
│   ├── lib/                # Utilities and constants
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript type definitions
│   ├── styles/             # Global styles
│   └── assets/             # Static assets
│       ├── images/         # Product and brand images
│       ├── fonts/          # Custom fonts
│       └── icons/          # SVG icons
└── public/                 # Public static files
```

## Figma Design Tokens

Update the following files with your Figma values:
- `src/lib/constants.ts` - Colors, typography, spacing
- `tailwind.config.ts` - Tailwind theme extensions
- `src/styles/globals.css` - Font imports

## Adding Assets from Figma

1. **Fonts**: Export from Figma and place in `src/assets/fonts/`
2. **Images**: Export and place in `src/assets/images/` or `public/`
3. **Icons**: Export as SVG and place in `src/assets/icons/`
