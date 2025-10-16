# 📱 Quick Reference - Responsive Breakpoints

## 🎯 Media Query Summary

```css
/* Mobile First Approach */

/* ═══════════════════════════════════════════ */
/* 📱 MOBILE (Default)                         */
/* ═══════════════════════════════════════════ */
/* < 768px */
- Single column layout
- Sidebar: Hidden (slide in/out)
- Stats Grid: 1 column
- Period Buttons: 2x2 grid
- Touch targets: 44x44px
- Font size: 16px (prevent iOS zoom)
- Tables: Horizontal scroll
- Modals: Full screen
- Form buttons: Full width

/* ═══════════════════════════════════════════ */
/* 📱 TABLET                                   */
/* ═══════════════════════════════════════════ */
@media (min-width: 769px) and (max-width: 1024px) {
    - Two column layout
    - Sidebar: 200px width
    - Stats Grid: 2 columns
    - Filter Cards: 2 columns
    - Font size: 95%
}

/* ═══════════════════════════════════════════ */
/* 💻 DESKTOP                                  */
/* ═══════════════════════════════════════════ */
@media (min-width: 1025px) and (max-width: 1399px) {
    - Multi-column layout
    - Sidebar: 260px width (default)
    - Stats Grid: 4 columns
    - Filter Cards: 3 columns
    - Font size: 100%
}

/* ═══════════════════════════════════════════ */
/* 🖥️ LARGE DESKTOP                           */
/* ═══════════════════════════════════════════ */
@media (min-width: 1400px) {
    - Centered layout
    - Max-width: 1400px
    - Stats Grid: 4 columns
    - Optimal spacing
}
```

---

## 📊 Layout Comparison

### Dashboard Stats Grid

| Device | Columns | Gap | Card Width |
|--------|---------|-----|------------|
| Mobile | 1 | 15px | 100% |
| Tablet | 2 | 20px | ~50% |
| Desktop | 4 | 25px | ~25% |
| Large | 4 | 25px | Fixed max |

---

### Filter Cards Grid

| Device | Columns | Gap | Layout |
|--------|---------|-----|--------|
| Mobile | 1 | 15px | Vertical stack |
| Tablet | 2 | 20px | 2 columns |
| Desktop | 3 | 25px | 3 columns |

---

### Period Selector

| Device | Layout | Button Size |
|--------|--------|-------------|
| Mobile | Grid 2x2 | 44x22px each |
| Tablet+ | Horizontal | 100x40px each |

---

## 🎨 Touch Target Sizes

### Mobile Standards (WCAG 2.5.5)

```
Minimum: 44x44px (Apple HIG)
Recommended: 48x48px (Material Design)
Current: 44x44px
```

### Applied to:

| Element | Desktop | Mobile |
|---------|---------|--------|
| Buttons | 32-36px | 44px |
| Input fields | 40px | 44px |
| Period buttons | 36px | 44px |
| Action icons | 32px | 44px |
| Nav items | 40px | 48px |

---

## 🔤 Typography Scale

### Font Sizes

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Page Title | 1.1rem | 1.2rem | 1.3rem |
| Card Title | 0.9rem | 1rem | 1.1rem |
| Stat Value | 1.8rem | 2rem | 2.5rem |
| Body Text | 0.85rem | 0.9rem | 0.95rem |
| Small Text | 0.75rem | 0.8rem | 0.85rem |
| Input Text | 16px | 14px | 14px |

**Note:** Mobile inputs = 16px to prevent iOS zoom

---

## 🎯 Spacing System

### Padding

| Element | Mobile | Desktop |
|---------|--------|---------|
| Content wrapper | 15px | 25px |
| Cards | 15-20px | 25px |
| Modal | 15px | 30px |
| Form groups | 12px | 15px |

### Margins

| Element | Mobile | Desktop |
|---------|--------|---------|
| Page sections | 15px | 25px |
| Card gaps | 15px | 25px |
| Button gaps | 8px | 10px |

---

## 📱 Mobile-Specific Features

### Sidebar Behavior

```javascript
// Mobile (< 768px)
.sidebar {
    position: fixed;
    transform: translateX(-100%);  // Hidden by default
    z-index: 1000;
}

.sidebar.active {
    transform: translateX(0);      // Slide in
}

// Desktop (≥ 768px)
.sidebar {
    position: fixed;
    transform: translateX(0);      // Always visible
}
```

---

### Table Scroll

```css
/* Mobile */
.data-table {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;  /* iOS momentum */
}

table th:nth-child(1),
table td:nth-child(1) {
    position: sticky;
    left: 0;
    background: white;
    z-index: 1;
}
```

---

### Modal Optimization

```css
/* Mobile */
.modal-content {
    margin: 10px;
    max-width: calc(100% - 20px);
    max-height: calc(100vh - 20px);
}

.modal-footer {
    flex-direction: column-reverse;  /* Stack vertically */
}

.modal-footer .btn {
    width: 100%;  /* Full width buttons */
}
```

---

## 🕐 Timezone Functions

### formatThaiDateTime()

```javascript
Input:  "2025-10-06T14:30:00"
Output: "06/10/2568, 14:30:45 (GMT+7)"

Options: {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
}
```

---

### formatTimeAgo()

```javascript
// Time ranges and outputs
< 60 sec       → "เมื่อสักครู่"
< 60 min       → "X นาทีที่แล้ว"
< 24 hours     → "X ชั่วโมงที่แล้ว"
< 30 days      → "X วันที่แล้ว"
< 12 months    → "X เดือนที่แล้ว"
≥ 1 year       → "X ปีที่แล้ว"
```

---

## 🎨 Color System

### Stat Cards

```css
:root {
    --stat-hearts: linear-gradient(135deg, #ff6b9d 0%, #c06c84 100%);
    --stat-clicks: linear-gradient(135deg, #ff9a56 0%, #ff6a00 100%);
    --stat-visits: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --stat-hotels: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Activity Types

```css
.activity-add    { border-left-color: #00d2a0; }  /* Green */
.activity-edit   { border-left-color: #f39c12; }  /* Orange */
.activity-delete { border-left-color: #e74c3c; }  /* Red */
.activity-like   { border-left-color: #e91e63; }  /* Pink */
```

---

## 🔧 CSS Variables

```css
:root {
    /* Layout */
    --sidebar-width: 260px;
    --sidebar-collapsed: 70px;
    --topbar-height: 60px;
    
    /* Colors */
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --success-color: #00d2a0;
    --danger-color: #e74c3c;
    --warning-color: #f39c12;
    
    /* Shadows */
    --shadow: 0 2px 8px rgba(0,0,0,0.08);
    --shadow-lg: 0 4px 16px rgba(0,0,0,0.12);
}
```

---

## ⚡ Performance Optimizations

### Scroll Performance

```css
/* Enable GPU acceleration */
.sidebar,
.modal {
    will-change: transform;
    transform: translateZ(0);
}

/* Smooth scrolling */
.modal-body,
.data-table {
    -webkit-overflow-scrolling: touch;
}
```

### Animation Performance

```css
/* Use transform instead of top/left */
.sidebar {
    transition: transform 0.3s ease;
}

/* Optimize repaints */
.stat-card {
    will-change: transform, box-shadow;
}
```

---

## 📋 Testing Checklist

### Mobile (< 768px)

```
Navigation:
□ Sidebar slides in/out
□ Hamburger menu works
□ Menu items tap-able

Dashboard:
□ Stats cards 1 column
□ Period selector 2x2 grid
□ Cards animate properly

Tables:
□ Horizontal scroll works
□ First column sticky
□ Touch scroll smooth

Forms:
□ Inputs full width
□ No iOS zoom
□ Buttons full width
□ Modals full screen

Time:
□ Shows GMT+7
□ Relative time updates
□ Format correct
```

### Tablet (769-1024px)

```
Layout:
□ 2 column grids
□ Sidebar 200px
□ Stats readable

Interaction:
□ Touch targets adequate
□ Hover effects work
□ Forms usable
```

### Desktop (≥ 1025px)

```
Layout:
□ 4 column stats
□ Full sidebar
□ Optimal spacing

Features:
□ All features work
□ Performance good
□ No layout breaks
```

---

## 🛠️ Developer Notes

### Adding New Breakpoint

```css
/* Example: Large tablet */
@media (min-width: 1025px) and (max-width: 1200px) {
    .stats-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}
```

### Custom Touch Target

```css
.custom-button {
    min-height: 44px;
    min-width: 44px;
    padding: 12px 16px;
}
```

### Prevent iOS Zoom

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
```

```css
input, textarea, select {
    font-size: 16px; /* Must be ≥16px */
}
```

---

## 📱 Device Testing Matrix

| Device | Width | Height | DPR | Test |
|--------|-------|--------|-----|------|
| iPhone SE | 375px | 667px | 2x | ✅ |
| iPhone 12 Pro | 390px | 844px | 3x | ✅ |
| iPhone 14 Pro Max | 430px | 932px | 3x | ✅ |
| iPad Mini | 768px | 1024px | 2x | ✅ |
| iPad Air | 820px | 1180px | 2x | ✅ |
| iPad Pro 12.9" | 1024px | 1366px | 2x | ✅ |
| Samsung S20+ | 384px | 854px | 3.5x | ✅ |
| Desktop HD | 1366px | 768px | 1x | ✅ |
| Desktop FHD | 1920px | 1080px | 1x | ✅ |

---

## 🔗 Resources

### CSS Units Reference

```
px  - Pixels (absolute)
rem - Root em (relative to html font-size)
em  - Relative to parent font-size
%   - Percentage of parent
vw  - Viewport width
vh  - Viewport height
```

### Flexbox Quick Reference

```css
/* Parent */
display: flex;
flex-direction: row | column;
justify-content: flex-start | center | flex-end | space-between;
align-items: flex-start | center | flex-end | stretch;
gap: 10px;

/* Child */
flex: 1;  /* flex-grow: 1; flex-shrink: 1; flex-basis: 0%; */
```

### Grid Quick Reference

```css
display: grid;
grid-template-columns: repeat(4, 1fr);  /* 4 equal columns */
grid-template-columns: 1fr 2fr 1fr;     /* Custom widths */
gap: 20px;                               /* Space between items */
```

---

**Last Updated:** October 6, 2025  
**Version:** 2.0 (Responsive + Timezone)
