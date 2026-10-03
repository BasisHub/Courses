---
sidebar_position: 2
title: "Transitions"
---

# Transitions

## Overview

CSS transitions provide a way to animate changes to CSS properties over time, creating smooth visual effects.

## Basic Syntax

```css
.element {
    transition: property duration timing-function delay;
}
```

## Transition Properties

| Property | Description | Example |
|----------|-------------|---------|
| `transition-property` | Which CSS property to animate | `background-color` |
| `transition-duration` | How long the animation takes | `0.3s`, `300ms` |
| `transition-timing-function` | The acceleration curve | `ease`, `linear`, `ease-in-out` |
| `transition-delay` | Delay before animation starts | `0.1s` |

## Timing Functions

| Function | Description |
|----------|-------------|
| `linear` | Constant speed |
| `ease` | Slow start, fast middle, slow end (default) |
| `ease-in` | Slow start |
| `ease-out` | Slow end |
| `ease-in-out` | Slow start and end |
| `cubic-bezier()` | Custom curve |

## Common Use Cases

### Button Hover Effect

```css
.button {
    background-color: var(--dwc-color-primary);
    transition: background-color 0.2s ease, transform 0.2s ease;
}

.button:hover {
    background-color: var(--dwc-color-primary-dark);
    transform: scale(1.05);
}
```

### Color Theme Transition

```css
.window {
    background-color: var(--dwc-background);
    color: var(--dwc-color);
    transition: background-color 0.3s ease, color 0.3s ease;
}
```

### Expanding Element

```css
.panel {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease-out;
}

.panel.expanded {
    max-height: 500px;
}
```

## Multiple Transitions

```css
.element {
    transition:
        background-color 0.3s ease,
        transform 0.2s ease-in-out,
        opacity 0.3s ease;
}
```

Or use `all` to transition everything (use sparingly):

```css
.element {
    transition: all 0.3s ease;
}
```

## Example in BBj

```bbj
rem Add transition to a button
css$ = ".my-button {"
css$ = css$ + "  transition: background-color 0.3s ease, transform 0.2s ease;"
css$ = css$ + "}"
css$ = css$ + ".my-button:hover {"
css$ = css$ + "  transform: scale(1.02);"
css$ = css$ + "}"

web! = BBjAPI().getWebManager()
web!.injectStyle(css$)

btn!.addClass("my-button")
```

## Performance Considerations

### Properties That Animate Well

These properties can be animated efficiently by the GPU:
- `transform` (translate, rotate, scale)
- `opacity`

### Properties to Avoid Animating

These cause layout recalculation (expensive):
- `width` / `height`
- `margin` / `padding`
- `top` / `left` / `right` / `bottom`

:::tip
Use `transform: scale()` instead of animating `width`/`height`, and `transform: translate()` instead of animating position properties.
:::

## Exercise: Transition on Button

Run `DWCTraining/10_AdvancedResponsive/Transitions.bbj` to experiment with button transitions.
