---
title: "Embedding Third-Party Components"
description: Embed third-party JavaScript components, such as charts and maps, in your DWC app.
---

This chapter covers embedding third-party JavaScript components like charts, maps, and widgets into DWC applications.

## Overview

DWC can embed third-party components like charts, maps, and widgets that have been written in JavaScript or TypeScript and run in the browser.

## Embedding a JavaScript Chart Component

This section explains how to embed a chart from the Charts.js library.

### Setup

1. Include the Chart.js library
2. Create a container element
3. Initialize the chart with data

### Example: Charts.js Integration

```bbj
use java.nio.file.Files
use java.nio.file.Paths

rem Get WebManager
web! = BBjAPI().getWebManager()

rem Inject Chart.js library
web!.injectUrl("https://cdn.jsdelivr.net/npm/chart.js", 1, "module")

rem Create container for chart
chartDiv! = wnd!.addHtmlView("<canvas id='myChart'></canvas>")

rem Initialize chart with JavaScript
chartJs$ = "const ctx = document.getElementById('myChart');"
chartJs$ = chartJs$ + "new Chart(ctx, { type: 'bar', data: {...} });"
web!.executeScript(chartJs$)
```

## Receiving Events from JavaScript in BBj

Sometimes a component allows for interactivity with the user. In many cases, this interactivity needs to trigger actions inside your BBj program.

### Setting Up Event Communication

```bbj
rem Register a custom event handler
web!.registerEvent("chartClick", "onChartClick")

rem In JavaScript, trigger the event
rem BBj.send('chartClick', { data: clickedData })
```

### Callback Handler

```bbj
onChartClick:
    event! = BBjAPI().getLastEvent()
    data! = event!.getData()
    rem Process the click data
return
```

## Working with Slots

Slots allow you to insert content into specific locations within web components.

### Using Slots

```bbj
rem Create a component with slots
html$ = "<my-component>"
html$ = html$ + "  <span slot='header'>Header Content</span>"
html$ = html$ + "  <span slot='content'>Main Content</span>"
html$ = html$ + "</my-component>"
htmlView! = wnd!.addHtmlView(html$)
```

## Popular Libraries to Embed

| Library | Use Case |
|---------|----------|
| **Chart.js** | Charts and graphs |
| **Leaflet** | Interactive maps |
| **DataTables** | Enhanced data tables |
| **FullCalendar** | Calendar widgets |
| **Quill** | Rich text editor |

## Exercise: Embed a Third-Party Component {#exercise-embed-a-3rd-party-component}

Work through [Exercise: Embed a third-party component](./90-exercise-embed-component.mdx).

## Best Practices

1. **Use CDN links** for popular libraries
2. **Check licensing** before using libraries commercially
3. **Handle loading states** - Libraries may take time to load
4. **Fallback gracefully** - Handle cases where libraries fail to load
