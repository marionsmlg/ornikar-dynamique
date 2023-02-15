import fsp from "fs/promises";
import path from "path";
import nunjucks from "nunjucks";
nunjucks.configure({ autoescape: true });
import { minify } from "html-minifier-terser";
import cleanCSS from "clean-css";
import { minify as minifyterser } from "terser";
import slugify from "@sindresorhus/slugify";

const args = process.argv.slice(2);
const isDev = args[0] === "dev";

async function handleHtml(njkPath, jsonPath, dest) {
  const dataJson = await fsp.readFile(jsonPath);
  const dataJsonParse = JSON.parse(dataJson);
  const dataHtml = nunjucks.render(njkPath, dataJsonParse);
  if (isDev) {
    await fsp.writeFile(dest, dataHtml);
    console.log(`${path.basename(dest)} file created`);
  } else {
    const minifedDataHtml = await minify(dataHtml, {
      removeAttributeQuotes: true,
      collapseWhitespace: true,
      removeComments: true,
    });
    await fsp.writeFile(dest, minifedDataHtml);
    console.log(`${path.basename(dest)} file created and minified`);
  }
}

async function handleArticles(njkPath, jsonPath) {
  const dataJson = await fsp.readFile(jsonPath);
  const dataJsonParse = JSON.parse(dataJson);
  const articles = dataJsonParse.articles;

  for (const article of articles) {
    const dest = `./dist/blog/${slugify(article.title)}${article.id}.html`;

    const data = {
      titlePage: article.title,
      openGraphTitle: article.title,
      openGraphImg: article.img,
      openGraphDescription: article.description,
      openGraphUrl: "https://ornikar-dynamique.vercel.app/",
      cssGlobal: "/global.css",
      cssFile: "./articles.css",
      jsFile: "/global.js",
      article,
    };

    const html = nunjucks.render(njkPath, data);
    await fsp.writeFile(dest, html);
  }
}

async function handleCss(src, dest) {
  if (isDev) {
    await fsp.copyFile(src, dest);
    console.log(`${path.basename(src)} file has been copied`);
  } else {
    const data = await fsp.readFile(src, "utf8");
    const minifiedData = await new cleanCSS().minify(data);
    await fsp.writeFile(dest, minifiedData.styles);
    console.log(`${path.basename(src)} file has been minified`);
  }
}

async function handleJs(src, dest) {
  if (isDev) {
    await fsp.copyFile(src, dest);
    console.log(`${path.basename(src)} file has been copied`);
  } else {
    const data = await fsp.readFile(src, "utf8");
    const minifiedData = await minifyterser(data);
    await fsp.writeFile(dest, minifiedData.code);
    console.log(`${path.basename(src)} file has been minified`);
  }
}

async function main() {
  await fsp.rm("./dist", { recursive: true, force: true });
  await fsp.mkdir("./dist");
  await Promise.all([fsp.mkdir("./dist/member"), fsp.mkdir("./dist/blog")]);

  await Promise.all([
    handleHtml(
      "./src/template/index.njk",
      "./src/data/index.json",
      "./dist/index.html"
    ),
    handleCss("./src/css/index.css", "./dist/index.css"),

    handleCss("./src/css/global.css", "./dist/global.css"),

    handleJs("./src/js/global.js", "./dist/global.js"),

    handleHtml(
      "./src/template/login.njk",
      "./src/data/login.json",
      "./dist/member/login.html"
    ),
    handleCss("./src/css/login.css", "./dist/member/login.css"),

    handleArticles("./src/template/articles.njk", "./src/data/articles.json"),
    handleCss("./src/css/articles.css", "./dist/blog/articles.css"),
  ]);
}

main();
