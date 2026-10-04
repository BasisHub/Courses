---
title: "Working with ARC Files"
description: Work with ARC files when you move an existing app to the DWC.
---

## Overview

This section covers working with ASCII Resource files (ARC or `.arc` files).

## Concepts Covered in This Section

- Modifying an existing `.arc` file to use a flow layout in the DWC

## ARC Files in DWC

You have learned in the previous sections that DWC is able to execute GUI programs with their pixel-based layouts. The same applies to `.arc` files: they will work directly in DWC with the same limitations that apply to the other samples.

:::warning Important Limitation
The most important limitation is probably the need to refactor BBj Grid code to use the BBjGridExWidget or something else.
:::

## Changing a Window in an `.arc` File to Use Flexible CSS-based Layout

We have seen that the window creation flag `$00100000$` tells DWC to drop all pixel-based position and size instructions. For an `.arc` file, the same can be achieved by adding the **GRAVITY** flag to the source of the ARC file.

### Key Points

- Adding the GRAVITY flag has **no impact** in GUI or BUI
- In DWC, it enables the window to receive layout instructions by CSS code

:::note Add Order Matters
The add order of elements in the `.arc` file will result in the same order of controls in the DOM. That means that - regardless of their prior visual order that was a result of the pixel positions - the order that the controls appear on the screen may differ.
:::

## Solutions for Control Order

You can address control ordering in two ways:

1. **Change the order of controls** in WindowBuilder
2. **Use CSS** to position the elements on the screen as desired

## Example

The following shows how a button that is added first in the ARC file appears as the first control in the window when using GRAVITY.

![ARC File Example - Before](./img/arc-image-1.png)

The DWC version of the program in the course material demonstrates how the button can be positioned at the end using CSS grid layout instructions.

![ARC File Example - After CSS](./img/arc-image-2.png)

## Source Code

See the `ArcFiles` folder in the course materials for complete examples.
