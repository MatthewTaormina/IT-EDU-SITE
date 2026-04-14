---
title: "Forms"
lesson_plan: "HTML"
order: 8
duration_minutes: 25
sidebar_position: 8
tags:
  - html
  - forms
  - input
  - label
  - validation
  - accessibility
  - fieldset
---

# Forms

> **Lesson Summary:** Forms are the primary mechanism through which users send data to a server — login credentials, search queries, registrations, orders, messages. Every form input must have a label. Every form must have a submit button. Built-in validation exists and should be used. This lesson covers the complete HTML form toolkit.

![A glowing form panel with labeled input fields, radio buttons, a dropdown, and a submit button on a dark background](../../../Assets/Images/webdev/html/html_forms.png)

## The `<form>` Element

```html
<form action="/submit" method="post">
  <!-- inputs go here -->
</form>
```

`<form>` is the container. Two key attributes:

| Attribute | Purpose |
| :--- | :--- |
| `action` | The URL to send the form data to. If omitted, data is sent to the current URL. |
| `method` | `get` or `post`. `get` appends data to the URL as a query string. `post` sends it in the request body. |

Use `method="get"` for **search forms** (the search query should be bookmarkable as a URL).  
Use `method="post"` for **everything else** — registration, login, submissions. Sensitive data in a URL is a security problem and a privacy issue.

---

## `<label>` — Always Required

Every form control must have a `<label>`. This is not optional — it is an accessibility requirement.

The correct pattern uses `for` on the label and a matching `id` on the input:

```html
<label for="email">Email address</label>
<input type="email" id="email" name="email" />
```

When a label is correctly associated:
- Clicking the label focuses the input (larger click target — important on mobile)
- Screen readers announce the label when the input is focused
- Search engines can understand the input's purpose

> **⚠️ Warning:** `placeholder` text is not a label. Placeholders disappear when the user starts typing, leaving them with no reminder of what the field is for. Always use `<label>`. Placeholders are supplementary hints, not field names.

---

## `<input>` — Input Types

`<input>` is the most versatile form element. The `type` attribute determines its behaviour and the keyboard shown on mobile.

### Text inputs

```html
<input type="text"     name="first_name" />   <!-- Single-line text -->
<input type="email"    name="email" />         <!-- Email — validates format, shows email keyboard on mobile -->
<input type="password" name="password" />      <!-- Obscures characters as typed -->
<input type="url"      name="website" />       <!-- URL — validates format -->
<input type="search"   name="q" />             <!-- Search — may show a clear button -->
<input type="tel"      name="phone" />         <!-- Telephone — shows phone keyboard on mobile -->
<input type="number"   name="age" />           <!-- Numeric — shows number pad on mobile -->
```

### Date/time inputs

```html
<input type="date"           name="birthdate" />
<input type="time"           name="meeting_time" />
<input type="datetime-local" name="appointment" />
<input type="month"          name="billing_month" />
<input type="week"           name="week" />
```

### Choice inputs

```html
<!-- Checkbox — one or more can be selected -->
<input type="checkbox" id="terms" name="terms" value="agreed" />
<label for="terms">I agree to the terms of service</label>

<!-- Radio — only one per group can be selected (groups share the same name) -->
<input type="radio" id="plan_free"  name="plan" value="free" />
<label for="plan_free">Free plan</label>

<input type="radio" id="plan_pro"   name="plan" value="pro" />
<label for="plan_pro">Pro plan</label>
```

### Other types

```html
<input type="range"  name="volume" min="0" max="100" step="5" />   <!-- Slider -->
<input type="color"  name="theme_color" />                          <!-- Colour picker -->
<input type="file"   name="attachment" accept=".pdf,.docx" />       <!-- File upload -->
<input type="hidden" name="csrf_token" value="abc123" />            <!-- Hidden — not shown to user -->
```

---

## `<textarea>` — Multi-line Text

```html
<label for="message">Your message</label>
<textarea id="message" name="message" rows="5" cols="40">
  Default text here (optional)
</textarea>
```

Unlike `<input>`, `<textarea>` has a closing tag. Content between the tags is the default value. `rows` and `cols` set the initial visible size (CSS can override these).

---

## `<select>` and `<option>` — Dropdown

```html
<label for="country">Country</label>
<select id="country" name="country">
  <option value="">-- Select a country --</option>
  <option value="us">United States</option>
  <option value="gb">United Kingdom</option>
  <option value="ca">Canada</option>
</select>
```

The first empty `<option>` with a blank value serves as a placeholder — the user must make a selection.

Use `<optgroup>` to group related options:

```html
<select name="language">
  <optgroup label="Front-end">
    <option value="html">HTML</option>
    <option value="css">CSS</option>
    <option value="js">JavaScript</option>
  </optgroup>
  <optgroup label="Back-end">
    <option value="python">Python</option>
    <option value="go">Go</option>
  </optgroup>
</select>
```

---

## `<button>`

```html
<!-- Submit the form -->
<button type="submit">Create Account</button>

<!-- Reset all fields to their default values -->
<button type="reset">Clear form</button>

<!-- Trigger JavaScript without submitting -->
<button type="button" onclick="doSomething()">Preview</button>
```

> **⚠️ Warning:** A `<button>` inside a `<form>` defaults to `type="submit"`. If you add a `<button>` for any other purpose and forget to set `type="button"`, clicking it will submit the form. Always set the `type` attribute explicitly.

---

## Built-in Validation

HTML validation attributes let the browser enforce rules before the form is ever submitted:

```html
<input type="email" name="email" required />
<input type="text"  name="username" required minlength="3" maxlength="20" />
<input type="number" name="age" min="18" max="120" />
<input type="text"  name="postcode" pattern="[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}" />
```

| Attribute | Effect |
| :--- | :--- |
| `required` | Field must not be empty on submit |
| `minlength` / `maxlength` | Text length constraints |
| `min` / `max` | Numeric or date range |
| `pattern` | Regular expression the value must match |
| `type` itself | `email`, `url`, `number` have built-in format validation |

> **💡 Tip:** Built-in validation is a UX convenience, not a security mechanism. Users can bypass it trivially (by disabling JavaScript or sending raw HTTP requests). All validation must be repeated on the server. HTML validation is the first line, not the only line.

---

## `<fieldset>` and `<legend>`

Group related inputs under a shared heading:

```html
<fieldset>
  <legend>Billing Address</legend>

  <label for="street">Street</label>
  <input type="text" id="street" name="street" />

  <label for="city">City</label>
  <input type="text" id="city" name="city" />

  <label for="postcode">Postcode</label>
  <input type="text" id="postcode" name="postcode" />
</fieldset>
```

`<fieldset>` draws a visual border around the group. `<legend>` provides the group label, announced by screen readers before each field inside the group. Especially important for **radio button groups**, where the shared question (the `<legend>`) contextualises each individual option.

---

## The `name` Attribute

Every input you want to submit must have a `name` attribute. This is the key the server uses to look up the value:

```html
<input type="text" id="first_name" name="first_name" value="Alice" />
<!-- Submitted as: first_name=Alice -->
```

Without `name`, the input's value is not included in the submitted data — even if the user filled it in.

---

## Key Takeaways

- Every form control must have a `<label>` associated via `for`/`id`. Placeholder is not a label.
- `method="get"` for search (data in URL); `method="post"` for everything sensitive (data in body).
- `<input type="...">` controls the keyboard on mobile and enables browser format validation.
- `<button>` inside a form defaults to `type="submit"` — always set `type` explicitly.
- Built-in validation (`required`, `minlength`, `pattern`) is UX only — always validate on the server too.
- `<fieldset>` + `<legend>` group related controls; required for accessible radio groups.
- Inputs without a `name` attribute are not submitted.

## Research Questions

> **🔬 Research Question:** When a form is submitted with `method="get"`, the form data appears in the URL. What are the security implications of this? Why is `method="post"` required for passwords and sensitive data?
>
> *Hint: Search "HTTP GET POST difference sensitive data" and "browser history password in URL".*

> **🔬 Research Question:** What is a CSRF attack? How does the hidden `<input type="hidden" name="csrf_token">` pattern protect against it?
>
> *Hint: Search "CSRF cross-site request forgery explained" and "CSRF token form protection".*
