# &lt;form-control-validator&gt;

A functional web component for normalizing form validation message display.

It provides the following benefits:

- Block user agent validation message tooltips.
- Normalize validation message display across devices.
- Normalize / customize validation message content (optional).

## For users with an access token

Add a `.npmrc` file to your project, with the following lines:

```text
@zooduck:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_ACCESS_TOKEN
```

Install from the command line:

```node
npm install @zooduck/form-control-validator@latest
```

Install via package.json:

```json
"@zooduck/form-control-validator": "latest"
```

## For users without an access token

Clone or [Download](https://github.com/zooduck/form-control-validator/archive/refs/heads/master.zip) the repository to your machine.

## Import

Import using a module file:

```javascript
import 'path/to/@zooduck/form-control-validator/dist/index.module.js'
```

Import using a script tag:

```html
<script src="path/to/@zooduck/form-control-validator/dist/index.module.js" type="module"></script>
```

## Pre-requisites

- Always use semantic HTML.
- Don't forget to include validation message elements (one for each form control).

## Validation Message Elements

Each form control requires it's own validation message element.

These can be placed anywhere in the DOM (typically immediately adjacent to the form control) and must have a `data-validation-message-for` content attribute set to the `id` of your form control element.

For example:

```html
<label for="user">User</label>
<form-control-validator>
  <input id="user" name="user" required>
</form-control-validator>
<div data-validation-message-for="user"></div>
```

## Styling

The `<form-control-validator>` element is a purely functional component and does not include any style definitions or markup.

However, it is strongly recommended that you include at least the following styles in your project:

```css
button,
input:not([type="checkbox"], [type="radio"]),
select,
textarea {
  width: 100%;
}

[data-validation-message-for] {
  color: red;
}
```

### Input validity states

If you want to use input validity states to style your form controls, you should use the `aria-valid` and `aria-invalid` attributes, and **not** the `:invalid` psuedo class.

This is because the `:invalid` pseudo-class is active on invalid form controls even *before* a `<form>` has been submitted (so any `required` and empty fields are immediately invalid).

The `aria-valid` and `aria-invalid` attributes on the other hand, are applied dynamically by the `<form-control-validator>` element and are therefore safe to use.

Do **not** use `:invalid` psuedo-classes:

```css
input:not(:invalid) {
  /* ... */
}
input:invalid {
  /* ... */
}
```

Do use `aria-valid` and `aria-invalid` attributes:

```css
input[aria-valid="true"] {
  /* ... */
}

input[aria-invalid="true"] {
  /* ... */
}
```

## Validation message content

Validation messages for all validity states are automatically provided by the user agent.

They are automatically translated based on your locale settings - which may conflict with site-specific language settings.

Additionally, their content may differ across user agents and devices. For example, in the case of the `patternMismatch` validation message, Chrome displays: *"Please match the format requested."* whereas Firefox opts for: *"Please match the requested format."*

To solve these issues, you can define values for each or any of the validity states, using the `customValidationMessages` property (see below).

### Normalizing validation message content using the `<form-control-validator>.customValidationMessages` property

This property expects an object with one or more validity state key / config object pairs.

The config object has the following type definition:

```javascript
Object.<string, {message: string|Function, merge?: boolean}>
```

The optional `merge` flag specifies whether or not you want the user agent validation message to be shown alongside your custom validation message (separated by a new line).

By default, your custom validation message  will replace the user agent validation message.

#### Static validation messages

To set custom validation messages for the `valueMissing` and `patternMismatch` validity states:

```javascript
const formControlElement = document.querySelector('form-control-validator')

formControlElement.customValidationMessages = {
  valueMissing: { message: 'Please fill in this field.' },
  patternMismatch: { message: 'Please match the format requested.' }
}
```

#### Dynamic validation messages

Some validity states, like `tooShort`, have dynamic content.

In that case, you can assign a callback to the `message` property instead of a string.

The form control is passed to your callback as it's only argument, allowing you to compose dynamic messages based on it's current state:

```javascript
formControlElement.customValidationMessages = {
  tooShort: {
    message: (input) => {
      return `Please lengthen this text to ${input.minLength} characters or more (you are currently using ${input.value.length} characters).`
    }
  }
}
```

#### Know your validity states

It should be noted that you only need to provide config objects for validity states that are relevant to your form control.

For example, providing a config object with a message for the `tooShort` validity state, for a text input that does not have a `minlength` attribute, is unnecessary, since the `tooShort` validity state will never be evaluated on that input.

Likewise, providing a config object with a message for the `valueMissing` validity state, for an input that does not have a `required` attribute, is equally pointless.

## Examples

Text Input + label:

```html
<label for="user">User</label>
<form-control-validator>
  <input id="user" name="user" required>
</form-control-validator>
<div data-validation-message-for="user"></div>
```

Checkbox + label:

```html
<fieldset>
  <label for="terms">
    <form-control-validator>
      <input id="terms" name="terms" type="checkbox">
    </form-control-validator>
    I have read the terms and conditions.
  </label>
  <div data-validation-message-for="terms"></div>
</fieldset>
```
