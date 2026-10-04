---
title: "Media Queries"
description: Use CSS media queries to adapt your DWC app to different screen sizes.
---

## Overview

Media queries are a CSS feature that allows you to apply styles based on the characteristics of the device or viewport.

## Basic Syntax

```css
@media (condition) {
    /* CSS rules */
}
```

## Common Media Features

| Feature | Description | Example |
|---------|-------------|---------|
| `min-width` | Minimum viewport width | `@media (min-width: 768px)` |
| `max-width` | Maximum viewport width | `@media (max-width: 600px)` |
| `orientation` | Portrait or landscape | `@media (orientation: landscape)` |
| `prefers-color-scheme` | Light or dark mode preference | `@media (prefers-color-scheme: dark)` |

## Breakpoint Strategy

### Mobile-First Approach (Recommended)

Start with mobile styles, then add complexity for larger screens:

```css
/* Base styles (mobile) */
.grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
}

/* Tablet (768px and up) */
@media (min-width: 768px) {
    .grid {
        grid-template-columns: 1fr 1fr;
    }
}

/* Desktop (1024px and up) */
@media (min-width: 1024px) {
    .grid {
        grid-template-columns: 1fr 1fr 1fr;
    }
}
```

### Common Breakpoints

| Size | Width | Devices |
|------|-------|---------|
| Small | < 576px | Phones (portrait) |
| Medium | 576px - 768px | Phones (landscape), small tablets |
| Large | 768px - 1024px | Tablets |
| XL | 1024px - 1200px | Laptops, desktops |
| XXL | > 1200px | Large desktops |

## Combining Conditions

```css
/* AND - both conditions must be true */
@media (min-width: 768px) and (orientation: landscape) {
    /* Tablet in landscape */
}

/* OR - either condition */
@media (max-width: 600px), (orientation: portrait) {
    /* Small screen OR portrait orientation */
}
```

## Example in BBj

```bbj
rem Inject responsive CSS
css$ = "@media (min-width: 600px) {"
css$ = css$ + "  .my-window { grid-template-columns: auto 1fr auto 1fr; }"
css$ = css$ + "}"
css$ = css$ + "@media (min-width: 900px) {"
css$ = css$ + "  .my-window { grid-template-columns: repeat(3, auto 1fr); }"
css$ = css$ + "}"

web! = BBjAPI().getWebManager()
web!.injectStyle(css$)
```

## Testing Media Queries

### In Browser Developer Tools

1. Open Developer Tools (F12)
2. Click the device emulation icon
3. Select "Responsive" mode
4. Drag handles to resize viewport
5. Watch layout change at breakpoints

![Media Queries Size Change Demo](./img/media-queries-size-change.png)

## Exercise: Media Queries

Work through [Exercise: Use media queries](./90-exercise-media-queries.mdx).
