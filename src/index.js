const nunjucks = require("nunjucks");
const dataIndex = require("./data/index.json");
const fs = require("fs");
const dataLogin = require("./data/login.json");
const { minify } = require("html-minifier-terser");
const fsp = require("fs/promises");
const cleanCSS = require("clean-css");
const { minify: minifyterser } = require("terser");
nunjucks.configure({ autoescape: true });

let dataIndexHtml = nunjucks.render("./src/template/index.njk", dataIndex);
let dataLoginHtml = nunjucks.render("./src/template/login.njk", dataLogin);
let args = process.argv.slice(2);

async function IsMinified(pathIn, pathOut) {
  if (pathIn.endsWith(".css")) {
    const data = await fsp.readFile(pathIn, "utf8");
    const minifiedData = await new cleanCSS().minify(data);
    await fsp.writeFile(pathOut, minifiedData.styles);
    console.log("The css file has been minified");
  }
  if (pathIn.endsWith(".js")) {
    const data = await fsp.readFile(pathIn, "utf8");
    const minifiedData = await minifyterser(data);
    await fsp.writeFile(pathOut, minifiedData.code);
    console.log("The js file has been minified");
  } else {
    return "the file used is not a css or js format";
  }
}

const minifyOptionsHtml = {
  removeAttributeQuotes: true,
  collapseWhitespace: true,
  removeComments: true,
};

function containsDev(arr) {
  if (arr[0] === "dev") {
    return true;
  } else {
    return false;
  }
}

async function main() {
  await fsp.rm("./dist", { recursive: true, force: true });
  await fsp.mkdir("./dist");
  if (containsDev(args)) {
    const minifedDataIndexHtml = await minify(dataIndexHtml, minifyOptionsHtml);
    await fsp.writeFile("./dist/index.html", minifedDataIndexHtml);
    console.log(`index.html file created and minified`);

    IsMinified("./src/css/index.css", "./dist/index.css");

    IsMinified("./src/css/global.css", "./dist/global.css");

    IsMinified("./src/js/global.js", "./dist/global.js");

    await fsp.mkdir("./dist/member");

    const minifedDataLoginHtml = await minify(dataLoginHtml, minifyOptionsHtml);
    await fsp.writeFile("./dist/member/login.html", minifedDataLoginHtml);
    console.log(`login.html file created and minified`);

    IsMinified("./src/css/login.css", "./dist/member/login.css");
  } else {
    await fsp.writeFile("./dist/index.html", dataIndexHtml);
    console.log(`index.html file created`);

    await fsp.copyFile("./src/css/index.css", "./dist/index.css");
    console.log("Le fichier index.css a été copié!");

    await fsp.copyFile("./src/css/global.css", "./dist/global.css");
    console.log("Le fichier global.css a été copié!");

    await fsp.copyFile("./src/js/global.js", "./dist/global.js");
    console.log("Le fichier global.js a été copié!");

    await fsp.mkdir("./dist/member");

    await fsp.writeFile("./dist/member/login.html", dataLoginHtml);
    console.log(`login.html file created`);

    await fsp.copyFile("./src/css/login.css", "./dist/member/login.css");
    console.log("Le fichier login.css a été copié!");
  }
}

main();
