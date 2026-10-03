---
sidebar_position: 15
title: "Deployment Options"
---

# Deployment Options

This chapter covers advanced deployment options for DWC applications, including embedded deployment and Progressive Web Apps (PWA).

## Overview

By default, BBj DWC apps are published to URLs in this format:

```
http://hostname:8888/webapp/appname
```

The default mapping to `/webapp/` can be changed in Enterprise Manager under Web Context Configuration, Override Mappings.

DWC offers additional deployment options beyond the standard webapp URL:
- **Embedded Deployment** - Host DWC apps in custom HTML pages
- **Progressive Web Apps (PWA)** - Deploy as installable apps with offline support

## DWC Embedded Deployment

In BBj 21.13+, a published DWC app can be deployed as a custom web page saved to `basis/htdocs/`.

### Basic Embedded Template

```html
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>DWC Embedded Hello</title>
</head>
<body>
    <noscript>Embedded DWC webapp 'hello' is offline.</noscript>
    <div id="bbj-dwc"></div>
    <script type="text/javascript" src="/dwcembed/hello.js"></script>
</body>
</html>
```

### How It Works

The `<script>` line tells the `/dwcembed/` servlet to start the DWC app named **hello**, adding it to the `bbj-dwc` div.

Save this HTML file to the `htdocs` directory under the BASIS home directory. Access it with a URL in the format:

```
http://localhost:8888/files/myhtml.html
```

### Use Cases for Embedded Deployment

- Add custom metadata to the `<head>` section
- Include custom CSS or JavaScript
- Integrate with existing web pages
- Add analytics or tracking code

### Limitations

:::warning
DWC apps, like BUI apps, expect to be the only BASIS web app on a given web page. Embedded deployment cannot run multiple DWC apps on a single page.
:::

To run multiple DWC apps on a single web page, load them from `<iframe>` elements that link to the standard DWC app URL:

```html
<iframe src="http://localhost:8888/webapp/app1"></iframe>
<iframe src="http://localhost:8888/webapp/app2"></iframe>
```

## BBjPWA - Progressive Web Apps

PWA (Progressive Web App) is a type of web application that works as both a web app and a mobile app on any device. The aim of PWA is to deliver a user experience similar to native apps.

### Why Use PWAs?

| Feature | Description |
|---------|-------------|
| **Responsive Design** | Adapts to various screen sizes across desktop and mobile |
| **Native-Like Interactions** | Smooth and intuitive interactions similar to native apps |
| **Secure** | Served over HTTPS for data security and privacy |
| **Installable** | Users can save to home screens with icons for easy access |
| **Shareable** | Share via URL without installation |
| **Cross-Platform** | Can be published to Apple Store, Google Play, and Microsoft Store |

### BBjPWA Tool

BASIS provides [BBjPWA](https://github.com/BasisHub/BBjPWA), a Node.js-based CLI tool designed to transform any DWC application into a Progressive Web App.

#### BBjPWA Capabilities

- **Index Page** - Creates an entry point for your DWC application as an embedded DWC app
- **Web App Manifest** - Generates a `manifest.json` file for PWA functionality
- **Icons** - Automatically generates icons in various sizes for different platforms
- **Service Worker** - Caches app resources for improved performance and offline support
- **Offline Page** - Generates a page displayed when users lose internet connectivity

### The Web App Manifest

The `manifest.json` file is crucial for PWAs. It contains important information about your web application:

```json
{
  "name": "My DWC App",
  "short_name": "DWC App",
  "start_url": "/webapp/myapp",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2e8555",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

### Getting Started with BBjPWA

1. Install Node.js (if not already installed)
2. Install BBjPWA from [GitHub](https://github.com/BasisHub/BBjPWA)
3. Run the CLI tool to generate PWA assets for your DWC app
4. Deploy the generated files alongside your DWC application

### Service Workers and Offline Support

Service workers cache your app's resources, including:
- HTML, CSS, and JavaScript files
- Images and other static assets
- API responses (when configured)

This enables your app to work offline or with poor network connectivity.

## Choosing a Deployment Option

| Option | Best For |
|--------|----------|
| **Standard webapp URL** | Most applications, simple deployment |
| **Embedded deployment** | Custom branding, additional metadata, integration with existing sites |
| **PWA** | Mobile users, offline support, app store distribution |

## Resources

- [BBjPWA on GitHub](https://github.com/BasisHub/BBjPWA)
- [MDN: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web App Manifest Reference](https://developer.mozilla.org/en-US/docs/Web/Manifest)
