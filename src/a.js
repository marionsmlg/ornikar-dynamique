const { minify } = require("html-minifier-terser");

const result = minify('<p title="blah" id="moo">foo</p>', {
  removeAttributeQuotes: true,
});

const cssIndexMinified = minify("./src/css/index.css", {
  removeAttributeQuotes: true,
  collapseWhitespace: true,
  removeComments: true,
  minifyCSS: true,
});

cssIndexMinified.then(function (value) {
  console.log(value);
});
