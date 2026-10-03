---
sidebar_position: 4
title: "DWC Themes"
---

# DWC Themes

## Overview

This section covers adding a Light/Dark Mode toggle to a DWC application, introduces the DWC Themer utility, and demonstrates how to apply a CSS theme file created in the DWC Themer to a BBj DWC app.

## Concepts Covered in This Section

- Adding a Light/Dark Mode Toggle to an App
- Using the DWC Themer to Create CSS Themes
- Applying Saved CSS Themes to DWC Apps

## Light and Dark Themes

The previous section covered the DWC's App Themes (`light`, `dark`, and `dark-pure`). For some user-facing apps, providing a light/dark mode toggle (such as the toggle on the DWC's documentation page) is a really nice feature.

## Example 1 - Adding a Light/Dark Mode Toggle

### Step 1: Add the Toggle Button

Load the `CSSCustomProperties.bbj` program and add a BBjButton:

```bbj
rem Add a toggle button for dark/light mode
web! = BBjAPI().getWebManager()

declare auto BBjButton myThemeToggle!
currentTheme$ = "light"
lightTheme$ = "<html><dwc-icon name='sun'></dwc-icon> Light"
darkTheme$ = "<html><dwc-icon name='moon'></dwc-icon> Dark"

myThemeToggle! = myWindow!.addButton(lightTheme$)
myThemeToggle!.setCallback(BBjButton.ON_BUTTON_PUSH, "onThemeToggle")
```

:::note
This example uses the DWC's icon pools, which will be covered in more detail later in the course.
:::

### Step 2: Add the Callback

```bbj
onThemeToggle:
    if (currentTheme$ = "light") then
        currentTheme$ = "dark"
        myThemeToggle!.setText(darkTheme$)
    else
        currentTheme$ = "light"
        myThemeToggle!.setText(lightTheme$)
    endif
    web!.setTheme(currentTheme$)
return
```

### Step 3: Test

Run the program and test the button. The button displays:
- **Light mode**: Sun icon with "Light" text
- **Dark mode**: Moon icon with "Dark" text

Now users have control over the app's appearance with the click of a button!

## The DWC Themer

The DWC Themer is a utility that allows you to change various CSS custom properties that the BASIS Dynamic Web Client uses to affect the look and feel of BBj controls.

### Features

- **WYSIWYG Editor** - "What You See Is What You Get" - modify theme properties and see changes in real-time
- **Default Theme Loading** - Starts with default DWC theme showing CSS custom properties and their values
- **Custom Theme Creation** - Change any CSS custom property values to create your own theme
- **Theme Export** - Export themes to CSS files on disk
- **Theme Import** - Load existing theme files to modify or use as a base
- **Custom BBj Class** - Facilitates applying saved themes to DWC applications

### Interface

The DWC Themer has three main sections:

1. **Configuration Parameters** (left) - CSS custom properties with controls to modify values
2. **CSS Preview** (center) - Shows CSS custom properties with modified values
3. **BBjControls Preview** (right) - Displays BBjControls rendered with modified CSS values

Modified properties appear with an orange outline in the Configuration Parameters section.

## Example 2 - Creating a Theme in the DWC Themer

### Step 1: Create or Load a Theme

1. Launch the DWC Themer
2. Either load a sample theme (`DWCTraining/01_GUI2BUI2DWC/DWC_AppThemes/css/MyDwcTheme.css`) or create your own
3. Watch how controls in the preview section change as you modify the theme

### Step 2: Apply the Theme

Run `DWCTraining/01_GUI2BUI2DWC/DWC_AppThemes/DWCThemer.bbj`.

To use a custom theme, first import the required Java libraries:

```bbj
use java.nio.file.Paths
use java.nio.file.Files
```

Then load and inject the theme:

```bbj
rem Load the theme file
theme! = new String(Files.readAllBytes(Paths.get(fs!.resolvePath("./css/MyDwcTheme.css"))))

rem Get WebManager and inject the style
web! = BBjAPI().getWebManager()
web!.injectStyle(theme!, 1)
```

:::tip
Replace `"./css/MyDwcTheme.css"` with the full path to your downloaded custom theme if you created one in the DWC Themer.
:::

## Theme Customization Examples

Common CSS custom properties you might modify in the DWC Themer:

| Property | Description |
|----------|-------------|
| `--dwc-color-primary` | Primary color used throughout the app |
| `--dwc-font-family` | Font family for text |
| `--dwc-font-size` | Base font size |
| `--dwc-space` | Base spacing unit |
| `--dwc-border-radius` | Corner rounding for controls |

The DWC Themer makes it easy to create consistent, branded themes for your applications without manually editing CSS files.
