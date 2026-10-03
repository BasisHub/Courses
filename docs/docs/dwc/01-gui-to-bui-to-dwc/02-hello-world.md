---
sidebar_position: 2
title: 'Running a "Hello World" App in BUI and DWC'
---

# Running a "Hello World" App in BUI and DWC

## Overview

This section covers registering a simple "Hello World" BBj program to run in BUI and the new Dynamic Web Client using the information from the previous section.

## Concepts Covered in This Section

- Registering and launching BBj GUI apps in the BUI and DWC clients
- Using the `INFO(3,6)` to identify the client
- Using BBjSysGui constants with the BBj message box
- Specifying custom DWC modes with the BBj message box

The previous section covered a couple of different ways to register a BBj app to run in the browser in the BUI and DWC clients. This section applies that knowledge by providing a sample program to register and run in the Dynamic Web Client. Additional exercises modify the message box using custom modes.

## Sample Code

The following program will be the source for your first DWC app. You may either copy/paste the code into Eclipse, or simply load the `MessageBox.bbj` program file from the `01_GUI2BUI2DWC` folder in the DWC Training zip file.

```bbj
if (info(3,6)="1") then client$ = "GUI"
if (info(3,6)="5") then client$ = "BUI"
if (info(3,6)="6") then client$ = "DWC"

temp = msgbox("Hello from BBj's " + client$ + " client!", BBjSysGui.MSGBOX_ICON_INFORMATION, "Greetings", MODE="theme=primary")

release
```

## Program Notes

The code determines the runtime client by comparing the value for the `INFO(3,6)` to known values listed in the INFO() Function documentation (search for "INFO Function" in the [BASIS Online Help](https://documentation.basis.cloud/BASISHelp/WebHelp/index.htm)). It then displays a BBj message box and includes the client information in the message body.

The message box specifies the information icon using a `BBjSysGui` constant, which corresponds to 64 in the MSGBOX() Function documentation (search for "MSGBOX Function" in the [BASIS Online Help](https://documentation.basis.cloud/BASISHelp/WebHelp/index.htm)). This is not necessary, but it does improve the code's legibility because the developer does not need to memorize all the numerical values for the icon types.

Finally, the code adds a MODE to the MSGBOX() function that indicates that the message box should be displayed in the DWC's primary color theme. This parameter is ignored in the GUI and BUI clients so it has no effect when run in those clients.

### DWC Component Themes

The DWC supports seven possible component themes:
- `primary`
- `default`
- `danger`
- `info`
- `success`
- `warning`
- `gray`

Any of these can be used with the message box. Many BBj controls also support setting the theme for the control via the `setAttribute()` method with the "theme" attribute and the desired value.

The message box documentation describes the `MODE="property=value"` as:

> In BBj 21.10 and higher, the mode string can specify arbitrary DWC properties (e.g., "theme=danger"). Themes can also be applied to individual buttons (e.g., "button-0-theme=success, button-1-theme=info, button-2-theme=danger").

## Example 1 - Running a BBj Program in GUI, BUI, and DWC

1. Load the above program (`MessageBox.bbj` in the zip file) into the Eclipse editor and then run it in the GUI client via Eclipse's **[Run]** tool button.

2. Now register and launch it in BUI using Eclipse's **[Run BUI Program]** tool button.

3. After seeing how the program runs in BUI, change the URL in your browser so that the app runs in the Dynamic Web Client.

## Example 2 - DWC Component Themes

The DWC offers seven different component themes: `default`, `primary`, `success`, `warning`, `danger`, `info`, and `gray`.

1. Modify the sample program to show the message box in the `danger` theme instead of the `primary` theme.

:::note
The message box function's MODE parameter may contain any number of key/value pairs that are comma-separated. That means you can provide a key/value pair for the message box's theme that colors the title bar and icon, as well as a key/value pair that sets the theme for the [OK] button (`button-0`).
:::

## Helpful Links

- [BASIS Online Help](https://documentation.basis.cloud/BASISHelp/WebHelp/index.htm) - Search for "MSGBOX Function", "BBjMsgBox", or "DWC themes"

## Going the Extra Mile

The short sample program used in the exercises included a MODE string in the message box function that set the message box's theme to "primary". This mode string is documented as only affecting programs running in the Dynamic Web Client, so removing it from the code shouldn't make any noticeable difference when running in BUI. But it does make a difference in the DWC, as the message box will revert to using the "default" control theme when we remove the mode string from the code.

Try experimenting with the code by first removing the mode string, then by adding it back again but specifying the "default" theme instead of the "primary" theme.

## Notes

### Running a BBj App in the Dynamic Web Client

There are a few different ways to run a BBj app in the DWC:

1. **Eclipse toolbar with URL modification** - Launch the app from Eclipse's [Run BUI Program] toolbar button, then modify the app's URL in the browser manually by replacing the BUI context (`apps`) with the DWC context (`webapp`).

2. **Enterprise Manager** - Launch the app from the app's definition page in Enterprise Manager via the [Launch In Browser (DWC)] button.

3. **Automatic switching code** - Add code to the top of the BBj app to force it to switch to running in the DWC if it was originally launched in BUI:

```bbj
rem If the app is running in BUI, switch it automatically to run in the DWC client instead
rem ================================================================================
if (info(3, 6) = "5") then
    bui! = BBjAPI().getBuiManager()
    url! = bui!.getUrl().replaceAll("apps", "webapp")
    action! = bui!.urlAction(url!)
    bui!.setEndAction(action!)
    release
endif
```

This can be combined with option #1, so a single click of the Eclipse tool button will launch the program in BUI and the app will switch automatically to running in the Dynamic Web Client.
