# Quick Start Guide - Korean Eonni Shop

## 🚀 Running the Project

```bash
# Navigate to project
cd /Users/andriiliudvichuk/Projects/shop

# Install dependencies (already done)
npm install

# Start development server
npm run dev
```

**Live at**: http://localhost:3001

## 🎯 Adding New Sections - Workflow

### 1. Share the Section
Send me:
- Screenshot (desktop + mobile if different)
- Exact text/copy
- Any hover states or interactions

### 2. I'll Create the Component
```bash
src/components/sections/YourSection.tsx
```

### 3. Add to Page
```tsx
import YourSection from '@/components/sections/YourSection'

export default function Home() {
  return (
    <main>
      <Header />
      <PromoBanner />
      <Hero />
      <YourSection />  {/* New section */}
    </main>
  )
}
```

### 4. Verify
Check http://localhost:3001 - hot reload will show changes instantly!

## 📂 Where Things Are

| What | Where |
|------|-------|
| **Pages** | `src/app/` |
| **Components** | `src/components/` |
| **Colors/Fonts** | `src/lib/constants.ts` & `tailwind.config.ts` |
| **Global Styles** | `src/styles/globals.css` |
| **Images/Icons** | `public/` & `src/assets/` |
| **Types** | `src/types/index.ts` |

## 🎨 Using Design Tokens

### Colors
```tsx
// In Tailwind classes
className="bg-primary text-black"
className="bg-primary-light hover:bg-primary-dark"

// In JavaScript
import { COLORS } from '@/lib/constants'
style={{ backgroundColor: COLORS.primary }}
```

### Typography
```tsx
// Headings
className="text-4xl lg:text-6xl font-bold"

// Body text
className="text-base lg:text-lg"
```

### Spacing
```tsx
className="px-6 py-4"  // Padding
className="mb-8"       // Margin bottom
className="gap-4"      // Flex/Grid gap
```

## 🔧 Common Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 📱 Responsive Design

Our breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

Use Tailwind responsive prefixes:
```tsx
className="text-base md:text-lg lg:text-xl"
className="px-4 md:px-6 lg:px-12"
```

## 🖼️ Adding Images

### Method 1: Public folder
```tsx
import Image from 'next/image'

<Image 
  src="/your-image.png" 
  alt="Description"
  width={800}
  height={600}
/>
```

### Method 2: Assets folder
Place in `src/assets/images/` and import:
```tsx
import heroImage from '@/assets/images/hero.png'

<Image src={heroImage} alt="Hero" />
```

## ✨ Tips

1. **Save files** - Changes auto-reload in browser
2. **Check terminal** - Watch for errors
3. **Use TypeScript** - It'll catch bugs early
4. **Tailwind classes** - Follow existing patterns
5. **Components** - Keep them small and focused

## 🐛 Troubleshooting

**Port already in use?**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Or Next.js will auto-use 3001
```

**Changes not showing?**
1. Check terminal for errors
2. Hard refresh: Cmd+Shift+R
3. Restart dev server

**TypeScript errors?**
- Check types in `src/types/`
- Install missing packages
- Restart VS Code TypeScript server

## 📞 Ready for Next Section!

Just share the screenshot and I'll build it! 🎨
