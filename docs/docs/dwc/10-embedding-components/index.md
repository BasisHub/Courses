---
title: "Embedding Third-Party Components"
description: Embed third-party JavaScript components, such as charts and maps, in your DWC app.
---

This chapter covers embedding third-party JavaScript components like charts, maps, and widgets into DWC applications.

## Overview

DWC can embed third-party components like charts, maps, and widgets that have been written in JavaScript or TypeScript and run in the browser.

## Using the BBjHTMLView to Embed Third-Party Components

You embed third-party components in BBj with the [BBjHTMLView](https://documentation.basis.cloud/BASISHelp/WebHelp/bbjobjects/Window/bbjhtmlview/bbjhtmlview.htm) control. The concept is not limited to the DWC. It works in principle the same way in the GUI client, which loads a Chromium engine for that purpose, and in BUI.

The `BBjHTMLView` is a widget that acts like an embedded browser. You can load HTML code into it, execute JavaScript, and even send events from JavaScript back to the BBj interpreter.

Embedding an HTML component in BBj typically takes these steps:

1. Add a `BBjHTMLView` to your BBj window.
2. Seed the HTML view with any necessary static HTML code.
3. Load the required JavaScript library.
4. Execute JavaScript to initialize the component.
5. Optionally, register events that the component can fire in that JavaScript code, and add callback routines for them to your BBj program.

Step 3 must only run once step 2 is finished, and step 4 runs after step 3. To guarantee that order, use the following pattern. First seed the HTML view and register callbacks for the page loaded and the script loaded events:

```bbj
html$ = "<html><body><div id='myComponent'></div></body></html>"
htmlview! = window!.addHtmlView(102,20,70,760,430,html$,$$)
htmlview!.setCallback(htmlview!.ON_PAGE_LOADED,"handlePageLoaded")
htmlview!.setCallback(htmlview!.ON_SCRIPT_LOADED,"handleScriptLoaded")
```

The two callback routines then form the cascade:

```bbj
process_events

handlePageLoaded:
  rem after the initial HTML is loaded we can inject the library
  htmlview!.clearCallback(htmlview!.ON_PAGE_LOADED)
  url$ = "https://cdn.url.for.libary.js"
  htmlview!.injectUrl(url$,1)
return

handleScriptLoaded:
  rem after the library is loaded we can work with it
  htmlview!.clearCallback(htmlview!.ON_SCRIPT_LOADED)
  js$ = ""
  js$ = js$ + "var chartCanvas = document.getElementById('myComponent');"
  js$ = js$ + "/* further JavaScript code */"
  htmlview!.injectScript(js$,1)
return
```

The cascade of events, one for the page loaded followed by one for the script loaded, ensures that each part that relies on the previous one runs only after the previous step has finished.

## Embedding a JavaScript Chart Component

This section explains how to embed a chart from the Chart.js library.

The example embeds a chart widget with the Chart.js library. It follows the [Getting Started](https://www.chartjs.org/docs/latest/getting-started/) document of Chart.js. The sequence of loading code starts with a `<canvas>` element and gives it an ID that the JavaScript code can address later:

```bbj
html$ = "<html><head></head><body><canvas id='myChart'></canvas></body></html>"
htmlview! = window!.addHtmlView(102,20,70,760,430,html$,$$)
```

If you plan to embed several similar components on your page, give each one a unique ID.

### Setup

1. Include the Chart.js library
2. Create a container element
3. Initialize the chart with data

### Example: Chart.js Integration {#example-chartsjs-integration}

The downloadable `ChartJS_NoEventFromJS.bbj` sample uses this setup on its existing `window!`. Keep the loading callbacks: the chart can only be created after both the HTML and the library have loaded.

```bbj
declare auto BBjHtmlView htmlview!
html$ = "<html><head></head><body><canvas id='myChart'></canvas></body></html>"
htmlview! = window!.addHtmlView(102,20,70,760,430,html$,$$)
htmlview!.setOpaque(0)
htmlview!.setNoEdge(1)
htmlview!.setCallback(htmlview!.ON_PAGE_LOADED,"handlePageLoaded")
htmlview!.setCallback(htmlview!.ON_SCRIPT_LOADED,"handleScriptLoaded")
```

After the page is loaded, the `ON_PAGE_LOADED` event fires, and you can load the library from a CDN:

```bbj
handlePageLoaded:
  rem after the initial HTML is loaded we can inject the library
  htmlview!.clearCallback(htmlview!.ON_PAGE_LOADED)
  url$ = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.5.1/chart.min.js"
  htmlview!.injectUrl(url$,1)
return
```

To host the library locally, download it and put it somewhere under the `htdocs` folder of the BBj installation. The URL then looks like this:

```bbj
url$ = "http://bbjservername:8888/files/chart.min.js"
```

After the library loads successfully, the `ON_SCRIPT_LOADED` event fires. Now you can work with the library and instantiate the chart with JavaScript. The sample hardcodes the data. In a real program you would either build the data dynamically into the JavaScript code or load it later with `executeScript`.

```bbj
handleScriptLoaded:
  rem after the library is loaded we can work with it
  rem ' https://www.chartjs.org/docs/latest/getting-started/

  htmlview!.clearCallback(htmlview!.ON_SCRIPT_LOADED)
  js$ = ""
  js$ = js$ + "var chartCanvas = document.getElementById('myChart');"
  js$ = js$ + "var ctx = chartCanvas.getContext('2d');"
  js$ = js$ + "var chart = new Chart(ctx, {"
  js$ = js$ + "    type: 'line',"
  js$ = js$ + "    data: {"
  js$ = js$ + "        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],"
  js$ = js$ + "        datasets: ["
  js$ = js$ + "         {"
  js$ = js$ + "            label: 'Year 2021',"
  js$ = js$ + "            backgroundColor: '#ff1a68',"
  js$ = js$ + "            borderColor: '#ff1a68',"
  js$ = js$ + "            data: [40, 20, 33, 22, 25, 15, 7]"
  js$ = js$ + "         },"
  js$ = js$ + "         {"
  js$ = js$ + "            label: 'Year 2022',"
  js$ = js$ + "            backgroundColor: '#25c2a0',"
  js$ = js$ + "            borderColor: '#25c2a0',"
  js$ = js$ + "            data: [2, 10, 5, 2, 20, 30, 45]"
  js$ = js$ + "         },"
  js$ = js$ + "        ]"
  js$ = js$ + "    }"
  js$ = js$ + "});"
  js$ = js$ + "window.myChart = chart;"
  rem A canvas does not repaint when CSS changes. Update its text and grid colors with the DWC theme.
  js$ = js$ + "var applyChartTheme = () => {"
  js$ = js$ + "  const styles = getComputedStyle(chartCanvas);"
  js$ = js$ + "  chart.options.plugins.legend.labels.color = styles.color;"
  js$ = js$ + "  for (const axis of Object.values(chart.options.scales)) {"
  js$ = js$ + "    axis.ticks.color = styles.color;"
  js$ = js$ + "    axis.grid.color = styles.getPropertyValue('--dwc-border-color').trim();"
  js$ = js$ + "  }"
  js$ = js$ + "  chart.update('none');"
  js$ = js$ + "};"
  js$ = js$ + "applyChartTheme();"
  js$ = js$ + "var chartThemeObserver = new MutationObserver(applyChartTheme);"
  js$ = js$ + "chartThemeObserver.observe(document.documentElement, {attributes: true, attributeFilter: ['data-app-theme']});"

  htmlview!.injectScript(js$,1)
return
```

## Receiving Events from JavaScript in BBj

Sometimes a component allows for interactivity with the user. In many cases, this interactivity needs to trigger actions inside your BBj program.

A JavaScript component can send events back to BBj, so you can react to user interaction in your BBj program. The BASIS documentation has a [sample](https://documentation.basis.cloud/BASISHelp/WebHelp/bbjevents/BBjNativeJavaScriptEvent/BBjNativeJavaScriptEvent_getEventMap.htm). Chart.js is a special case where BASIS still recommends the `BBjHTMLView`, because it is not directly a web component. The `EventMapSample.bbj` program shows how to include normal HTML components and inject JavaScript functions into them.

The relevant section in the enhanced chart sample is this part of the JavaScript code:

```bbj
  js$ = js$ + "        onClick: (evt, item, legend) => {"
  js$ = js$ + "         Chart.defaults.plugins.legend.onClick(evt, item, legend);"
  js$ = js$ + "         const customEvent = new CustomEvent('legend-clicked',{"
  js$ = js$ + "           detail:{text: item.text, index: item.datasetIndex, hidden: item.hidden}"
  js$ = js$ + "         });"
  js$ = js$ + "         window.basisDispatchCustomEvent(chartCanvas, customEvent);"
  js$ = js$ + "        }"
```

The key statement is `basisDispatchCustomEvent`, which passes the `customEvent` object back to BBj. In the event handler for the [ON_NATIVE_JAVASCRIPT](https://documentation.basis.cloud/BASISHelp/WebHelp/bbjevents/BBjNativeJavaScriptEvent/BBjNativeJavaScriptEvent.htm) event you can then work with the event object:

```bbj
handleNativeJavascript:
  declare auto BBjNativeJavaScriptEvent nativeEvent!
  declare auto java.util.Map map!
  nativeEvent! = sysgui!.getLastEvent()
  name$ = nativeEvent!.getEventName()
  map! = nativeEvent!.getEventMap()
  detail! = map!.get("detail")
  let x=MSGBOX(detail!, 0, "Event Details")
return
```

This handler only shows the contents of the event object in a `MSGBOX` for illustration.

### Setting Up Event Communication

```bbj
rem Register a custom event handler
htmlview!.setCallback(BBjAPI.ON_NATIVE_JAVASCRIPT, "handleNativeJavascript")
```

### Callback Handler

Use the preceding `handleNativeJavascript` callback. `getEventMap()` supplies the custom event's `detail` entry. The complete `ChartJS.bbj` sample includes this callback and the Line/Bar selector in [09_EmbeddingOtherComponents.zip](pathname:///files/dwc/09_EmbeddingOtherComponents.zip).

## Working with Slots

Slots allow you to insert content into specific locations within web components.

When you embed a web component or a third-party library, you sometimes need to put a BBj control such as a `BBjChildWindow` "in the middle" of the other control. That "in the middle" is a slot. A tab control or an accordion, for example, makes areas inside it visible or invisible depending on its state. For a BBj developer, these areas should be `BBjChildWindow` controls so that BBj can control them.

### Using slots

For a custom element, use [`BBjWindow::addWebComponent`](https://documentation.basis.cloud/BASISHelp/WebHelp/bbjobjects/Window/bbjwindow/BBjWindow_addWebComponent.htm) to create a `BBjWebComponent`. Then use [`setSlot`](https://documentation.basis.cloud/BASISHelp/WebHelp/bbjobjects/Window/BBjWebComponent/BBjWebComponent_setSlot.htm) to move a BBj control into a named slot. The slot name comes first:

```bbj
declare auto BBjWebComponent component!
declare auto BBjStaticText header!
component! = wnd!.addWebComponent("my-component")
header! = wnd!.addStaticText("Header Content")
component!.setSlot("header",header!)
```

This fragment assumes that `my-component` has been loaded and defines a `header` slot. `setSlot` moves the existing control into the component; BBj keeps its control object and callbacks. A `BBjHTMLView` remains useful for libraries such as Chart.js that draw into an HTML document.

### Example: a Shoelace split panel

The [Shoelace split panel](https://shoelace.style/components/split-panel) divides an area into two parts with a draggable divider. Its `start` and `end` slots hold the two panels; its `handle` slot customizes the divider.

![Shoelace split panel with a Start area above and an End area below a draggable divider](./img/shoelace-split-panel.png)

`ShoelaceSplitter.bbj` creates the component directly, loads Shoelace 2.20.1 as an ES module, and moves two `BBjChildWindow` controls into its slots. Run it in DWC with BBj 24.11 or later. The browser needs internet access to load the pinned Shoelace files and the divider icon.

The key calls are:

```bbj
declare auto BBjWebComponent splitter!
declare auto BBjChildWindow top!
declare auto BBjChildWindow bottom!
splitter! = window!.addWebComponent("sl-split-panel")
splitter!.setAttribute("vertical","true")
splitter!.setStyle("height","100%")

top! = window!.addChildWindow("",$00108800$,BBjAPI().getSysGui().getAvailableContext())
top!.addButton("This is the top panel").setAttribute("theme","danger")
splitter!.setSlot("start",top!)

bottom! = window!.addChildWindow("",$00108800$,BBjAPI().getSysGui().getAvailableContext())
bottom!.addButton("This is the bottom panel").setAttribute("theme","success")
splitter!.setSlot("end",bottom!)
```

The complete sample also gives the window and child panels their grid layout and height. It uses a `dwc-icon` in the divider's `handle` slot. There are no generated DOM IDs or `appendChild` scripts to maintain.

![Window with a red top panel and a green bottom panel inside the splitter](./img/shoelace-splitter-result.png)

These examples keep Shoelace 2.20.1 to make the course reproducible. Shoelace is [no longer in active development](https://shoelace.style/); evaluate a maintained component library for a new production app. The BBj component and slot APIs apply to other custom elements as well.

## Popular Libraries to Embed

| Library | Use Case |
|---------|----------|
| **Chart.js** | Charts and graphs |
| **Leaflet** | Interactive maps |
| **DataTables** | Enhanced data tables |
| **FullCalendar** | Calendar widgets |
| **Quill** | Rich text editor |

<!-- vale Google.Ordinal = NO -->
## Exercise: Embed a Third-Party Component {#exercise-embed-a-3rd-party-component}
<!-- vale Google.Ordinal = YES -->

Work through [Exercise: Embed a third-party component](./90-exercise-embed-component.mdx).

## Best Practices

1. **Use CDN links** for popular libraries
2. **Check licensing** before using libraries commercially
3. **Handle loading states** - Libraries may take time to load
4. **Fallback gracefully** - Handle cases where libraries fail to load
