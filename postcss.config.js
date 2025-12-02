module.exports = {
  plugins: [
    require("postcss-import"), // handle @import in style.css
    require("postcss-nesting"), // remove CSS nesting
    require("postcss-url")({
      url: "copy", // copy referenced files instead of rebasing
      assetsPath: "local/images", // destination folder in local build
      useHash: true, // optional: add hash to filenames
    }),
    require("cssnano")({ preset: "default" }), // minify CSS
  ],
}
