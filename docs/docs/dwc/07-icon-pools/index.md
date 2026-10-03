---
sidebar_position: 9
title: "Icon Pools"
---

# Icon Pools

This chapter covers working with icon pools in DWC applications.

## Overview

The DWC provides built-in icon pools that allow you to easily add icons to your BBj controls without needing to manage image files.

## Using Icons in DWC

Icons can be added to controls using HTML syntax:

```bbj
button!.setText("<html><dwc-icon name='sun'></dwc-icon> Light Mode")
```

![Icon Pools Overview](./img/icon-pools-1.png)

## Available Icon Pools

The DWC includes several icon pools:

- **Tabler Icons** - A comprehensive set of over 1900 icons
- **Font Awesome** - Popular icon library (if configured)

## Icon Syntax

### Basic Usage

```html
<dwc-icon name='icon-name'></dwc-icon>
```

### With Pool Specification

```html
<dwc-icon pool='tabler' name='icon-name'></dwc-icon>
```

## Common Icons

| Icon Name | Description |
|-----------|-------------|
| `sun` | Light mode indicator |
| `moon` | Dark mode indicator |
| `search` | Search functionality |
| `check` | Confirmation/success |
| `x` | Close/cancel |
| `plus` | Add item |
| `minus` | Remove item |
| `arrow-left` | Navigation |
| `arrow-right` | Navigation |

![Icon Examples](./img/icon-pools-2.png)

![More Icon Examples](./img/icon-pools-3.png)

## Styling Icons

Icons can be styled using CSS:

```css
dwc-icon {
    --dwc-icon-color: var(--dwc-color-primary);
    --dwc-icon-size: 24px;
}
```

## Example - Adding Icons to Buttons

```bbj
rem Create a button with an icon
btn! = wnd!.addButton("<html><dwc-icon name='check'></dwc-icon> Save")

rem Create a danger button with icon
deleteBtn! = wnd!.addButton("<html><dwc-icon name='trash'></dwc-icon> Delete")
deleteBtn!.setAttribute("theme", "danger")
```

![Icons in Buttons](./img/icon-pools-4.png)

![Icon Button Examples](./img/icon-pools-5.png)

![More Icon Examples](./img/icon-pools-6.png)

![Icon Pools Demo](./img/icon-pools-7.png)

## Resources

- [Tabler Icons](https://tabler.io/icons) - Browse available icons
- [BASIS Online Help](https://documentation.basis.cloud/BASISHelp/WebHelp/index.htm) - Search for "DWC icons"
