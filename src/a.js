const { minify } = require("html-minifier-terser");
const fsp = require("fs/promises");
let cssFile = fsp.readFile("./src/css/index.css", "utf-8").then(data);

console.log(cssFile);
