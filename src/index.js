const nunjucks = require("nunjucks");
const dataIndex = require("./data/index.json");
const dataLogin = require("./data/login.json");
const { minify } = require("html-minifier-terser");
const fsp = require("fs/promises");
const cleanCSS = require("clean-css");
const { minify: minifyterser } = require("terser");
const path = require("path");
nunjucks.configure({ autoescape: true });

const args = process.argv.slice(2);

async function minifyCssOrJs(src, dest) {
  if (path.extname(src) === ".css") {
    const data = await fsp.readFile(src, "utf8");
    const minifiedData = await new cleanCSS().minify(data);
    await fsp.writeFile(dest, minifiedData.styles);
    console.log("The css file has been minified");
  } else if (path.extname(src) === ".js") {
    const data = await fsp.readFile(src, "utf8");
    const minifiedData = await minifyterser(data);
    await fsp.writeFile(dest, minifiedData.code);
    console.log("The js file has been minified");
  } else {
    throw new err("The file used is not a css or js format");
  }
}

async function copyFileinDist(src, dest) {
  await fsp.copyFile(src, dest);
  console.log(`${path.basename(src)} file has been copied`);
}

const minifyOptionsHtml = {
  removeAttributeQuotes: true,
  collapseWhitespace: true,
  removeComments: true,
};

async function main() {
  await fsp.rm("./dist", { recursive: true, force: true });
  await fsp.mkdir("./dist");
  const dataIndexHtml = nunjucks.render("./src/template/index.njk", dataIndex);
  const dataLoginHtml = nunjucks.render("./src/template/login.njk", dataLogin);
  if (args[0] === "dev") {
    await Promise.all([
      fsp.writeFile("./dist/index.html", dataIndexHtml),
      console.log(`index.html file created`),
      copyFileinDist("./src/css/index.css", "./dist/index.css"),

      copyFileinDist("./src/css/global.css", "./dist/global.css"),

      copyFileinDist("./src/js/global.js", "./dist/global.js"),

      fsp.mkdir("./dist/member"),
    ]);

    await Promise.all([
      fsp.writeFile("./dist/member/login.html", dataLoginHtml),
      console.log(`login.html file created`),

      copyFileinDist("./src/css/login.css", "./dist/member/login.css"),
    ]);
  } else {
    const minifedDataIndexHtml = await minify(dataIndexHtml, minifyOptionsHtml);
    await fsp.writeFile("./dist/index.html", minifedDataIndexHtml);
    console.log(`index.html file created and minified`);

    await Promise.all([
      minifyCssOrJs("./src/css/index.css", "./dist/index.css"),
      minifyCssOrJs("./src/css/global.css", "./dist/global.css"),
      minifyCssOrJs("./src/js/global.js", "./dist/global.js"),
      fsp.mkdir("./dist/member"),
    ]);

    const minifedDataLoginHtml = await minify(dataLoginHtml, minifyOptionsHtml);
    await fsp.writeFile("./dist/member/login.html", minifedDataLoginHtml);
    console.log(`login.html file created and minified`);

    minifyCssOrJs("./src/css/login.css", "./dist/member/login.css");
  }
}

main();
