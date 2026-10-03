---
sidebar_position: 6
title: "DWC Debugging"
---

# DWC Debugging

This chapter covers debugging techniques specific to the Dynamic Web Client.

## Overview

When a BBj program encounters an untrapped error, it drops to a minimal debug console where the developer can debug the problem and either restart or terminate the program. As of BBj 22, a basic console is available for debugging in DWC.

:::note
Like the BUI mini console, this debug console is not intended for production deployment.
:::

## The DWC Debug Console

The DWC debug console provides a way to:
- View variable values
- Execute BBj commands
- Step through code
- Restart or terminate the program

### Triggering the Console

You can programmatically trigger the debug console using the `ESCAPE` statement:

```bbj
console:
    escape
return
```

### Example Program with Console Access

This example adds a button that triggers the debug console:

```bbj
rem ' hello.txt
sysgui = unt
open (sysgui)"X0"
bbjapi! = bbjapi()
sysgui! = bbjapi!.getSysGui()
window! = sysgui!.addWindow(25,25,275,125,"Hello",$00090083$,$$)
window!.setCallback(bbjapi!.ON_CLOSE,"eoj")

hello! = window!.addButton(1,25,25,100,25,"Hello!")
hello!.focus()
hello!.setCallback(bbjapi!.ON_BUTTON_PUSH,"msgbox")

goodbye! = window!.addButton(2,150,25,100,25,"Goodbye!")
goodbye!.setCallback(bbjapi!.ON_BUTTON_PUSH,"eoj")

console! = window!.addButton(3,25,75,100,25,"Console")
console!.setCallback(bbjapi!.ON_BUTTON_PUSH,"console")

process_events

eoj:
release

msgbox:
  i = msgbox(info(1,4),64,fnmode$(info(3,6)))
  hello!.focus()
return

def fnmode$(mode$)
  if mode$="0" then return "Fat Client"
  if mode$="1" then return "Thin Client"
  if mode$="2" then return "Java Applet"
  if mode$="3" then return "Java Web Start"
  if mode$="4" then return "JavaBBjBridge"
  if mode$="5" then return "BUI (Browser)"
  if mode$="6" then return "DWC (Browser)"
  return mode$
fnend

console:
    escape
return
```

## Using Browser Developer Tools

In addition to the DWC debug console, you can use the browser's built-in developer tools (covered in Chapter 02) for:

- **Console tab** - View JavaScript errors and `print` statement output
- **Network tab** - Monitor communication between client and server
- **Elements tab** - Inspect the DOM structure of DWC controls

### Printing Debug Output

Use `print` statements to output debug information to the DWC mini console:

```bbj
print "Variable value: ", myVar$
print "Object: ", myObject!
```

## Comparison: BUI vs DWC Debugging

| Feature | BUI | DWC |
|---------|-----|-----|
| Mini console | Full-featured | Basic (as of BBj 22) |
| Browser DevTools | Yes | Yes |
| Print output | Mini console | Mini console |
| Escape to debug | Yes | Yes |

## Best Practices

1. **Use print statements liberally during development** - They help track program flow
2. **Check the browser console** - JavaScript errors appear there
3. **Use Network tab** - To diagnose communication issues
4. **Remove debug code before production** - Don't leave console triggers in production code
