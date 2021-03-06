---
layout: page.11ty.cjs
title: <jshsj-timer> ⌲ Home
---

# &lt;jshsj-timer>

`<jshsj-timer>` is an awesome element. It's a great introduction to building web components with LitElement, with nice documentation site as well.

## As easy as HTML

<section class="columns">
  <div>

`<jshsj-timer>` is just an HTML element. You can it anywhere you can use HTML!

```html
<jshsj-timer></jshsj-timer>
```

  </div>
  <div>

<jshsj-timer></jshsj-timer>

  </div>
</section>

## Configure with attributes

<section class="columns">
  <div>

`<jshsj-timer>` can be configured with attributed in plain HTML.

```html
<jshsj-timer name="HTML"></jshsj-timer>
```

  </div>
  <div>

<jshsj-timer name="HTML"></jshsj-timer>

  </div>
</section>

## Declarative rendering

<section class="columns">
  <div>

`<jshsj-timer>` can be used with declarative rendering libraries like Angular, React, Vue, and lit-html

```js
import {html, render} from 'lit-html';

const name = 'lit-html';

render(
  html`
    <h2>This is a &lt;jshsj-timer&gt;</h2>
    <jshsj-timer .name=${name}></jshsj-timer>
  `,
  document.body
);
```

  </div>
  <div>

<h2>This is a &lt;jshsj-timer&gt;</h2>
<jshsj-timer name="lit-html"></my-element>

  </div>
</section>
