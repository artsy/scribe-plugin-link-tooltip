# scribe-plugin-link-tooltip

A Scribe plugin for doing a Medium/Google Docs style tooltip UI instead of a prompt for inserting links.

## Example

````javascript
var scribe = new Scribe(scribeElement);
scribe.use(scribePluginLinkTooltip());
````

## Positioning

The tooltip will append itself to the body and use `position: absolute`, `top`, and `left` to position it close to the text you're highlighting. You can use CSS and target `.scribe-plugin-link-tooltip` to adjust styling of the tooltip.

e.g.

````html
<body>
  <div id='scribe'>
    <div content-editable='true' >
    </div>
  </div>
  <form class="scribe-plugin-link-tooltip">
    <input placeholder="Paste or type a link">
    <button type="submit">Apply</button>
  </form>
</body>
````

````css
.scribe-plugin-link-tooltip {
  padding: 10px;
  background: #eee;
  z-index: 2;
  /*
    Adds the following styles via JS
    position: absolute;
    top: xx;
    left: xx;
  */
}
````

## TODO

* Remove jQuery dependency
* Tests

# License

MIT
