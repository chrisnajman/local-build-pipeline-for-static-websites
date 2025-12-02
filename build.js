const esbuild = require("esbuild")
const fse = require("fs-extra")
const fs = require("fs")
const path = require("path")
const postcss = require("postcss")
const postcssImport = require("postcss-import")
const postcssNesting = require("postcss-nesting")
const postcssUrl = require("postcss-url")
const cssnano = require("cssnano")
const { minify } = require("html-minifier-terser")

const SRC_DIR = "."
const DEST_DIR = "local"

async function buildJS() {
  await esbuild.build({
    entryPoints: ["./index.js"],
    bundle: true,
    minify: true,
    outfile: path.join(DEST_DIR, "index.min.js"),
    sourcemap: false,
    format: "iife",
  })
  console.log("Build complete: index.min.js created in /local")
}

async function buildCSS() {
  const cssInput = path.join(SRC_DIR, "style.css")
  const cssOutput = path.join(DEST_DIR, "style.min.css")

  const css = fs.readFileSync(cssInput, "utf-8")

  const result = await postcss([
    postcssImport(),
    postcssNesting(),
    postcssUrl({
      url: "copy",
      assetsPath: path.join(DEST_DIR, "images"),
      useHash: false,
    }),
    cssnano({ preset: "default" }),
  ]).process(css, { from: cssInput, to: cssOutput })

  fs.writeFileSync(cssOutput, result.css)
  console.log("Build complete: style.min.css created in /local")
}

async function copyExtras() {
  await fse.ensureDir(DEST_DIR)

  // Copy favicon.ico
  const faviconSrc = path.join(SRC_DIR, "favicon.ico")
  const faviconDest = path.join(DEST_DIR, "favicon.ico")
  if (fs.existsSync(faviconSrc)) {
    await fse.copy(faviconSrc, faviconDest)
    console.log("Copied favicon.ico to /local")
  }

  // Copy images folder if exists
  const imagesSrc = path.join(SRC_DIR, "images")
  const imagesDest = path.join(DEST_DIR, "images")
  if (fs.existsSync(imagesSrc)) {
    await fse.copy(imagesSrc, imagesDest)
    console.log("Copied images folder to /local")
  }

  // Copy json folder if exists
  const jsonSrc = path.join(SRC_DIR, "json")
  const jsonDest = path.join(DEST_DIR, "json")
  if (fs.existsSync(jsonSrc)) {
    await fse.copy(jsonSrc, jsonDest)
    console.log("Copied json folder to /local")
  }
}

async function processHTML() {
  await fse.ensureDir(DEST_DIR)

  const files = fs.readdirSync(SRC_DIR).filter((f) => f.endsWith(".html"))

  const minifyOptions = {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeEmptyAttributes: true,
    minifyCSS: true,
    minifyJS: true,
  }

  for (const file of files) {
    const srcPath = path.join(SRC_DIR, file)
    const destPath = path.join(DEST_DIR, file)
    const rawContent = fs.readFileSync(srcPath, "utf-8")

    let content = await minify(rawContent, minifyOptions)

    // Remove old favicons/apple-touch/manifest
    content = content.replace(
      /<link[^>]+(apple-touch-icon|favicon-\d+x\d+|manifest)[^>]*>/gi,
      ""
    )

    // Insert favicon.ico before CSS
    content = content.replace(
      /(<link\s+rel=["']stylesheet["'][^>]*>)/i,
      '<link rel="icon" type="image/x-icon" href="./favicon.ico">\n$1'
    )

    // Update CSS reference
    content = content.replace(
      /<link[^>]+href=["']\.?\/style\.css["'][^>]*>/i,
      '<link rel="stylesheet" href="./style.min.css">'
    )

    // Update JS reference
    content = content.replace(
      /<script[^>]+src=["']\.?\/index\.js["'][^>]*type=["']module["'][^>]*><\/script>/i,
      '<script src="./index.min.js" defer></script>'
    )

    fs.writeFileSync(destPath, content, "utf-8")
    console.log(`Processed: ${file}`)
  }

  console.log("All HTML files copied and minified to /local")
}

;(async () => {
  try {
    await buildJS()
    await buildCSS()
    await copyExtras()
    await processHTML()
    console.log("Build complete: everything ready in /local")
  } catch (err) {
    console.error("Build failed:", err)
    process.exit(1)
  }
})()
