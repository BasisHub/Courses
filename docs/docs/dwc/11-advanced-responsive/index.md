---
title: "Advanced Responsive Design"
description: Learn advanced responsive design with media queries and CSS transitions.
---

This chapter covers advanced responsive design techniques including media queries and CSS transitions.

## Sections

- [Media Queries](./01-media-queries.md)
- [Transitions](./02-transitions.md)

## Overview

Advanced responsive design goes beyond basic layouts to include:
- Adapting to different screen sizes with media queries
- Adding smooth animations with CSS transitions
- Creating engaging user experiences

## Media Queries

Media queries allow you to apply CSS rules based on device characteristics:

```css
/* Mobile first approach */
.container {
    grid-template-columns: 1fr;
}

/* Tablet */
@media (min-width: 768px) {
    .container {
        grid-template-columns: 1fr 1fr;
    }
}

/* Desktop */
@media (min-width: 1024px) {
    .container {
        grid-template-columns: 1fr 1fr 1fr;
    }
}
```

## CSS Transitions

Transitions create smooth animations between states:

```css
.button {
    background-color: var(--dwc-color-primary);
    transition: background-color 0.3s ease;
}

.button:hover {
    background-color: var(--dwc-color-primary-dark);
}
```

## Exercises

- [Exercise: Use media queries](./90-exercise-media-queries.mdx) - Create layouts that adapt to screen size
- [Exercise: Add a transition to a button](./91-exercise-button-transition.mdx) - Add hover effects to buttons
