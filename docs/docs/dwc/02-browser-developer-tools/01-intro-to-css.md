---
sidebar_position: 1
title: "Introduction to CSS"
---

# Introduction to CSS

## Overview

This section covers the introduction to CSS.

## What is CSS?

CSS (Cascading Style Sheets) is, as its name implies, style sheets that cascade downwards, meaning that styles applied to parent elements are inherited by their children.

CSS is used to control the appearance, layout, and general presentation of a website. In BBj you can give elements styles directly, but having at least a CSS string with all your CSS makes your code look cleaner and more maintainable. Even better is putting all your CSS into a separate `.css` file.

## How to use CSS Selectors

Style definitions in a CSS file are always enclosed in `{}` brackets and follow the `property: value;` standard. There are many ways to select different parts of your site with CSS, but for now let's concentrate on the main three:

### CSS Type Selector

CSS Types apply to all elements that are that specific type. For example, the following code snippet would apply to all HTML `<p>` elements (every normal text):

```css
p {
    property: value;
}
```

You just write out your element name followed by the style definition. This is especially useful if you want all elements of a specific type to look the same.

### CSS Class Selector

CSS Classes apply to all elements that have specifically been given this class:

```css
.myClass {
    property: value;
}
```

For classes, you write the name of your class but put a period before the selector. This is the most common way to apply CSS to something.

### CSS Id Selector

CSS Id Selector is somewhat uncommon. The CSS gets applied to all elements that share this Id, but it most likely will only affect one element because, as the Id states, it's an identifier—something unique:

```css
#myId {
    property: value;
}
```

This is important if you want to give one specific element the style without having to use `addClass` in your BBj code. Just remember: for this to take effect, you need to give your object in BBj a static Id by using `setAttribute("id", "yourIdHere")`.

:::note
An Id does not have to consist of only numbers.
:::

## CSS Selector Combinators

CSS Classes can also be combined. The combinations do different things based on how you write them:

### Comma (OR)

```css
element-one, .class-two {
    ...
}
```

A comma between selectors applies the same style to all selectors in the list. In this example, the styles will apply to all `element-one` elements AND anything that has the `class-two` class.

### Chaining (AND)

```css
element-one.class-two.class-three {
    ...
}
```

Chaining classes with other classes or onto an element selects something that fits ALL these criteria. In this example, it will target all `element-one` elements that have both the `class-two` and `class-three` classes.

### Space (Descendant)

```css
element-one .class-two {
    ...
}
```

A space between selectors specifies descendants. In this example, the styles will apply to anything with the `class-two` class that is a child of an `element-one` element.

### Greater Than (Direct Descendant)

```css
element-one > element-two {
    ...
}
```

A `>` between selectors specifies a direct descendant. This example will target an `element-two` element that is an immediate descendant of an `element-one` element.

## CSS Pseudo-Classes (States)

Pseudo-classes are CSS selectors that can represent state or other information about an element. These are some commonly used pseudo-classes:

| Pseudo-Class | Description |
|--------------|-------------|
| `:hover` | When the mouse pointer is over an element |
| `:focus` | When an element has focus |
| `:not()` | Can be used for not matching some other selector |

:::tip
The inspector tool can toggle pseudo-classes!
:::

For a complete list, see the [MDN List of Pseudo-Classes](https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes).

## Shadow DOMs

**DOM (Document Object Model)** is the structural model of all elements on a page. It's used by JavaScript and CSS to apply styles and functionality.

**Shadow DOMs** are elements that have their own DOM that is hidden from the page's CSS and JavaScript, which prevents interference and improves reusability.

DWC Components are implemented as custom Web Components with Shadow DOMs. You can access different parts of the Shadow DOM by using the `::part()` selector.

You can inspect the elements with the Browser Developer Tools to see the structure of these components.

The [Mozilla Developer Network](https://developer.mozilla.org/en-US/docs/Web/CSS) is a good source to learn about CSS including Shadow DOM.

## Apply Classes and Inject CSS Files in BBj

### Adding Classes

Classes are easily applied to any object by using `addClass("CSSClassNameWithoutDot")`. You can also add multiple classes to any object by using multiple `addClass` method calls.

### Injecting CSS

Injecting a CSS file works like this:

```bbj
injectStyle(String style, boolean top, String attributes)
```

Parameters:
- **style**: A String of CSS. This could be as large as the entire contents of a CSS file, or it could be only a single CSS definition.
- **top**: Injected into the head of the page if true (the default), otherwise injected in the body (not preferred).
- **attributes**: Additional attributes - this can be used to give a name to the injected CSS, which can be useful when determining which styles are taking effect when you look at the final output of your program.

## Notes

The programs `ExternalCssExample.bbj` and `InlineCssExample.bbj` will show you the different ways to style and inject the CSS.

This is only meant as a small introduction. Should you need further exercise, we recommend:
- [The CSS Tutorial on W3Schools.com](https://www.w3schools.com/css/)
