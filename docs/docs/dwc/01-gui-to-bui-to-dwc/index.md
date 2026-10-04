---
title: "GUI to BUI to DWC"
description: Learn how BBj GUI apps move to the Browser User Interface and the Dynamic Web Client.
---

This chapter covers the fundamentals of transitioning from BBj GUI applications to Browser User Interface (BUI) and the Dynamic Web Client (DWC).

## How the DWC Works

The diagram below shows how a BBj application runs in the DWC. Your BBj code executes on the server, which generates the DWC runtime. The runtime renders the UI in the user's web browser, and user interactions flow back to the server through a JavaScript bridge.

```mermaid
graph TD
    A[BBj Application Code] -->|Runs on| B[BBj Server / BBjServices]
    B -->|Generates| C[DWC Client Runtime]
    C -->|Renders UI in| D[Web Browser]
    D -->|User Events| E[JavaScript Bridge]
    E -->|Callbacks to| B

    style A fill:#2e8555,color:#fff
    style D fill:#25c2a0,color:#fff
```

## Concepts Covered in This Chapter

- Registering and launching BBj GUI apps in the BUI and DWC clients using Eclipse and Enterprise Manager
- Using the `INFO(3,6)` to identify the client
- Using BBjSysGui constants with the BBj message box
- Specifying custom DWC modes with the BBj message box
- Running a complete graphical BBj app in the thin client (GUI), the Browser User Interface (BUI), and the Dynamic Web Client (DWC)
- Changing the window to use flow layout, ignoring the x, y, width, and height parameters, and then applying a CSS Grid layout strategy
- Setting attributes on a BBjButton to affect its size and appearance
- Making your app look and act like a real web app instead of a desktop app running in the browser
- Handling runtime errors in the browser's Developer Tools console

## Sections

- [Registering and Launching a DWC App](./01-registering-launching.md)
- [Running a "Hello World" App in BUI and DWC](./02-hello-world.md)
- [Taking an App From GUI to BUI to DWC](./03-gui-to-bui-to-dwc.md)
