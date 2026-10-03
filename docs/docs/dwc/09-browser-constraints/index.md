---
sidebar_position: 11
title: "Browser Constraints"
---

# Browser Constraints

This chapter covers browser constraints and limitations when working with DWC applications.

## Overview

The browser environment has certain constraints that differ from traditional GUI applications. Understanding these constraints helps you design better DWC applications.

## Handling Client Files

The browser does not support direct access to client files. This section describes how to implement file uploads and downloads with DWC.

![Client Files Handling](./img/client-files.png)

### File Uploads

```bbj
rem Create a file chooser for uploads
fileChooser! = wnd!.addFileChooser()
fileChooser!.setCallback(BBjFileChooser.ON_FILE_SELECTED, "onFileSelected")
```

### File Downloads

```bbj
rem Trigger a file download
web! = BBjAPI().getWebManager()
web!.download(serverFilePath$, clientFileName$)
```

## Printing and Print Preview

The browser does not offer direct access to printers. Modern webapp printing is typically done by:

1. Displaying the printout in the client
2. Using the browser's print selection

### Printing Options

| Method | Description |
|--------|-------------|
| `SYSPRINT` | Server-side printing |
| `BBjPrinter` | BBj's printer interface |
| `Jasper Reports` | Generate PDF reports for download |

### Print Preview

```bbj
rem Generate a PDF for preview
rem Then download or display in browser
web!.download(pdfPath$, "report.pdf")
```

## Security Constraints

Browsers enforce security policies that affect DWC apps:

- **Same-Origin Policy** - Restricts cross-domain requests
- **HTTPS Requirements** - Some features require secure connections
- **Cookie Limitations** - Third-party cookie restrictions

## Local Storage

For storing client-side data:

```bbj
rem Store data in browser
web!.setSessionStorage("key", "value")

rem Retrieve data
value$ = web!.getSessionStorage("key")
```

## Clipboard Access

Clipboard operations require user interaction:

```bbj
rem Copy to clipboard (requires user gesture)
web!.copyToClipboard(text$)
```

## Best Practices

1. **Design for the web** - Don't expect desktop behaviors
2. **Handle offline scenarios** - Consider network interruptions
3. **Use progressive enhancement** - Basic functionality should work everywhere
4. **Test on multiple browsers** - Chrome, Firefox, Edge, Safari
