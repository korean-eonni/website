# Design Specifications - Korean Eonni

## 🎨 Color Palette

### Primary Colors
| Color | Hex | Usage |
|-------|-----|-------|
| **Primary** | `#B8B5D8` | CTA buttons, accents |
| **Primary Light** | `#C2BFE3` | Button hover states |
| **Primary Dark** | `#9D9AC4` | Button active states |
| **Black** | `#000000` | Text, borders |
| **White** | `#FFFFFF` | Backgrounds, text on dark |

### Background Colors
| Color | Hex | Usage |
|-------|-----|-------|
| **Primary BG** | `#FFFFFF` | Main background |
| **Secondary BG** | `#F5F5F5` | Alternate sections |
| **Tertiary BG** | `#F8F7FB` | Cards, containers |

### Text Colors
| Color | Hex | Usage |
|-------|-----|-------|
| **Primary Text** | `#000000` | Headlines, body |
| **Secondary Text** | `#666666` | Subtext |
| **Muted Text** | `#999999` | Captions, labels |

### Border Colors
| Color | Hex | Usage |
|-------|-----|-------|
| **Light Border** | `#E5E5E5` | Dividers, card borders |
| **Dark Border** | `#CCCCCC` | Input borders |

## 📝 Typography

### Font Families
- **Primary**: System font stack (San Francisco, Segoe UI, etc.)
- **Logo**: Georgia, serif (italic)

### Font Sizes
| Element | Size | Line Height | Weight |
|---------|------|-------------|--------|
| **Hero H1** | 96px (desktop), 72px (mobile) | 0.9 | Bold (700) |
| **H2** | 48px | 1.2 | Bold (700) |
| **H3** | 36px | 1.3 | Semi-bold (600) |
| **Body Large** | 18px | 1.6 | Regular (400) |
| **Body** | 16px | 1.5 | Regular (400) |
| **Body Small** | 14px | 1.4 | Regular (400) |
| **Caption** | 12px | 1.3 | Regular (400) |
| **Nav Items** | 15px | 1 | Regular (400) |
| **Button Text** | 15px | 1 | Semi-bold (600) |

### Letter Spacing
- **Logo Subtitle**: 0.2em
- **Buttons**: 0.1em
- **Body**: Normal (0)

## 📐 Spacing & Layout

### Container
- **Max Width**: 1440px
- **Side Padding**: 24px (desktop), 16px (mobile)

### Section Padding
- **Vertical**: 80px (desktop), 48px (mobile)
- **Between Elements**: 24px - 48px

### Component Spacing
| Element | Spacing |
|---------|---------|
| **Header Height** | ~80px |
| **Promo Banner Height** | 52px |
| **Button Padding** | 16px 48px |
| **Icon Size** | 24px × 24px |
| **Logo Width** | ~170px |
| **Nav Item Gap** | 48px |

## 🖼️ Component Specifications

### Header
- Background: White
- Border Bottom: 1px solid #E5E5E5
- Height: ~80px
- Layout: Logo (left) | Nav (center) | Icons (right)

### Promo Banner
- Background: White
- Border Bottom: 1px solid #E5E5E5
- Height: 52px
- Animation: Scroll left, 30s duration
- Separator: ✦ symbol

### Hero Section
- Height: calc(100vh - 108px), min 600px
- Image: Full bleed background
- Overlay: Optional 5% black for contrast
- Content Alignment: Left, vertically centered
- Button Style: Lavender background, black text

### Buttons

#### Primary Button (Lavender)
- Background: #B8B5D8
- Text: Black, 15px, semi-bold, uppercase
- Padding: 16px 48px
- Hover: #C2BFE3
- Transition: 300ms

#### Secondary Button (Black)
- Background: #000000
- Text: White, 15px, semi-bold, uppercase
- Padding: 16px 48px
- Hover: #333333
- Transition: 300ms

### Icons
- Size: 24px × 24px
- Color: Black
- Hover: 70% opacity
- Transition: 200ms

### Navigation
- Font Size: 15px
- Color: Black
- Hover: #666666
- Active: Underline
- Transition: 200ms

## 🎭 Interactions & Animations

### Hover States
- **Links**: Color change to gray (#666666)
- **Buttons**: Background color lightens
- **Icons**: Opacity reduces to 70%
- **Promo Banner**: Animation pauses

### Transitions
- **Standard**: 300ms ease-in-out
- **Quick**: 200ms ease-in-out
- **Slow**: 500ms ease-in-out

### Animations
- **Promo Banner Scroll**: Linear, 30s, infinite
- **Carousel Dots**: 300ms ease
- **Page Transitions**: Fade, 500ms

## 📱 Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| **Mobile** | < 768px | Single column, stacked |
| **Tablet** | 768px - 1024px | 2 column grid |
| **Desktop** | > 1024px | Full layout |
| **Wide** | > 1440px | Max width container |

### Mobile Adjustments
- Nav: Hamburger menu
- Hero H1: 72px → 48px
- Padding: 24px → 16px
- Button: Full width or centered

## ✨ Special Effects

### Hero Image
- Object Fit: Cover
- Object Position: Center
- Quality: 95%
- Priority: True (for LCP)

### Text Shadows (if needed)
- Hero text on image: 0 2px 4px rgba(0,0,0,0.3)

### Box Shadows (if needed)
- Cards: 0 2px 8px rgba(0,0,0,0.08)
- Hover: 0 4px 16px rgba(0,0,0,0.12)

## 🔤 Logo Specifications

### Main Logo
- Font: Georgia, italic
- Size: 38px
- Color: Black
- Weight: Regular (400)

### Subtitle
- Text: "KOREAN COSMETICS"
- Size: 9px
- Letter Spacing: 0.2em
- Transform: Uppercase
- Color: Black

## 🎯 Pixel-Perfect Checklist

When building new sections, verify:
- ✅ Colors match exactly
- ✅ Font sizes correct
- ✅ Spacing accurate
- ✅ Hover states work
- ✅ Transitions smooth
- ✅ Responsive on all sizes
- ✅ Images optimized
- ✅ Text matches design
- ✅ Icons correct size
- ✅ Alignment perfect
