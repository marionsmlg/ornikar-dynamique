const { minify } = require("html-minifier-terser");

const result = minify('<p title="blah" id="moo">foo</p>', {
  removeAttributeQuotes: true,
});
const cssDataIndex = require("./css/index.css");
// const cssIndexMinified = minify(cssDataIndex, {
//   collapseWhitespace: true,
//   removeComments: true,
//   minifyCSS: true,
// });

// cssIndexMinified.then(function (value) {
//   console.log(value);
// });
console.log(cssDataIndex);
