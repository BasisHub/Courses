---
sidebar_position: 10
title: "Control Validation"
---

# Control Validation

This chapter covers implementing control validation in DWC applications.

## Overview

The DWC provides built-in validation capabilities that allow you to validate user input with visual feedback.

## Validation Attributes

Controls support validation attributes that provide automatic validation:

| Attribute | Description |
|-----------|-------------|
| `required` | Field must have a value |
| `pattern` | Regex pattern the value must match |
| `min` / `max` | Minimum/maximum values for numbers |
| `minlength` / `maxlength` | Character length constraints |

## Setting Validation

### Required Field

```bbj
editBox!.setAttribute("required", "true")
editBox!.setAttribute("label", "Email Address")
```

### Pattern Validation

```bbj
rem Email pattern
editBox!.setAttribute("pattern", "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
editBox!.setAttribute("invalid-message", "Please enter a valid email address")
```

## Visual Feedback

When validation fails:
- The control's border changes color (typically red for danger theme)
- The label changes color to match
- An invalid message can be displayed

![Validation Visual Feedback](./img/validation-1.png)

![Validation States Example](./img/validation-2.png)

## Validation States

Controls have three validation states:

1. **Valid** - Input meets all requirements
2. **Invalid** - Input fails validation
3. **Pristine** - Control hasn't been interacted with yet

![Validation Demo](./img/validation-demo.gif)

## Checking Validation in Code

```bbj
rem Check if a control is valid
if (editBox!.isValid()) then
    rem Process the form
else
    rem Show error message
endif
```

## Custom Validation

For complex validation logic:

```bbj
rem Set custom validity
editBox!.setCustomValidity("This username is already taken")

rem Clear custom validity
editBox!.setCustomValidity("")
```

![Custom Validation Example](./img/validation-3.png)

![Validation Patterns](./img/validation-4.png)

## Example - Email Validation

```bbj
rem Create email input with validation
email! = wnd!.addEditBox("")
email!.setAttribute("label", "Email")
email!.setAttribute("required", "true")
email!.setAttribute("type", "email")
email!.setAttribute("invalid-message", "Please enter a valid email")
```

![Email Validation Example](./img/validation-5.png)

![Validation Demo 2](./img/validation-demo2.gif)

## Exercise: Adding Validation to an Email Field

Run `DWCTraining/07_ControlValidation/` examples to see validation in action.

![Validation Exercise](./img/validation-6.png)

![More Validation Examples](./img/validation-7.png)

### Testing Regular Expressions

Use [Regex101](https://regex101.com) to test your validation patterns:

![Regex101 for testing patterns](./img/regex101.png)

![Validation Complete Example](./img/validation-8.png)

![Validation Demo 3](./img/validation-demo3.gif)

![Final Validation Example](./img/validation-9.png)

## Best Practices

1. **Always provide helpful error messages** - Tell users what's wrong and how to fix it
2. **Validate on blur** - Check fields when the user leaves them
3. **Use appropriate input types** - Email, number, etc. provide built-in validation
4. **Combine client and server validation** - Never trust client-side validation alone
