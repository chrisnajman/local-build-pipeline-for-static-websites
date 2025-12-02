# Local Build Pipeline for Static Websites

This build pipeline combines and minifies all JavaScript modules and CSS, allowing the app to run entirely from the local file system. The build process also minifies HTML, handles CSS nesting, copies optional images, and ensures paths are correctly resolved.

## Important Note About JSON-Driven Apps

> [!CAUTION]
> This build pipeline is **not suitable** for apps that rely on JSON files. Any app that fetches JSON data will not work correctly when run from the `local/` folder due to browser security (CORS) restrictions. Use this pipeline only for static assets (HTML, CSS, JS, images).

## Assumed Folder Structure

```

css/
js-modules/
index.js
style.css
favicon.ico
index.html      // and possibly more *.html files (all stored in the root)
images/         // optional
build.js
postcss.config.js
package.json    // lists all required npm packages

```

> [!WARNING]
> If you don't follow the folder structure outlined above, you will have to edit `build.js` (and possibly `postcss.config.js`) to suit your requirements.

## What the Build Does

> [!NOTE] > `build.js` creates a new folder, `local/`, which will contain all the processed files. If you want to rename the output folder to something else, e.g. `desktop/`, search and replace `local` in both `build.js` and `postcss.config.js`.

### JavaScript

`build.js` uses `esbuild` to bundle all your JavaScript modules (starting from `index.js`) into a single file called `index.min.js`. The resulting file is minified and ready to use in the browser.

### CSS

The build process reads `style.css` and resolves all `@import rules`, removing CSS nesting using `postcss-nesting`. Any background images referenced in the CSS are copied into the `local/images/` folder. The CSS is then minified using `cssnano` and saved as `style.min.css`.

### HTML

All HTML files in the root directory are copied into the `local/` folder and minified using `html-minifier-terser`. During this process:

- Any existing favicon/apple-touch/manifest links are removed.
- A new `<link rel="icon" type="image/x-icon" href="./favicon.ico">` is inserted.
- References to CSS and JS are updated:

```html
<link
  rel="stylesheet"
  href="./style.min.css"
/>
<script
  src="./index.min.js"
  defer
></script>
```

- The favicon.ico is copied into `local/`.

### Optional Assets

- Any images in `images/` are copied to `local/images/`.
- The `local/` folder is fully self-contained; you can open `index.html` from this folder in any browser and **the app will run without a server**.

## NPM Requirements

Ensure you have `Node.js` installed. The following packages are required and listed in `package.json`:

- `esbuild`
- `fs-extra`
- `html-minifier-terser`
- `postcss`
- `postcss-import`
- `postcss-nesting`
- `postcss-url`
- `cssnano`

## Installing Packages

In a terminal, run:

```bash
npm install
```

## Running the Build

To generate a self-contained `local/` folder with minified assets, run:

```bash
node build.js
```

After running, the `local/` folder will contain:

```
index.html      // minified HTML
index.min.js    // bundled & minified JavaScript
style.min.css   // combined & minified CSS
favicon.ico
images/         // optional
```

You can now open `local/index.html` directly in your browser.

## Notes

- All CSS imports and nested rules are flattened and minified.
- JavaScript is bundled in order and minified for performance.
- HTML files are automatically updated to reference minified assets and the single favicon.
- This process is **fully repeatable** - just re-run `node build.js` after updating any JS, CSS, HTML, or images.
