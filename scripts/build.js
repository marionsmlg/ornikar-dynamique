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

async function main() {
  await fsp.rm("./dist", { recursive: true, force: true });
  await fsp.mkdir("./dist");

  await Promise.all([
    handleIndexHtml(
      "./src/template/index.njk",
      "./src/data/index.json",
      "./src/data/articles.json",
      "./src/data/global.json",
      "./dist/index.html"
    ),
    handleCss("./src/css/index.css", "./dist/index.css"),

    handleCss("./src/css/global.css", "./dist/global.css"),

    handleJs("./src/js/global.js", "./dist/global.js"),

    handleHtml(
      "./src/template/login.njk",
      "./src/data/login.json",
      "./src/data/global.json",
      "./dist/login.html"
    ),
    handleCss("./src/css/login.css", "./dist/login.css"),

    handleArticles(
      "./src/template/articles.njk",
      "./src/data/articles.json",
      "./src/data/global.json"
    ),
    handleCss("./src/css/articles.css", "./dist/blog/articles.css"),
  ]);
}

main();

async function pathExists(path) {
  try {
    await fsp.access(path);
    return true;
  } catch (err) {
    return false;
  }
}

function createSlug(title, id) {
  const slug = `${slugify(title)}-${id}`;
  return slug;
}

async function readJSON(jsonPath) {
  const dataStr = await fsp.readFile(jsonPath);
  const data = JSON.parse(dataStr);
  return data;
}

async function handleHtml(njkPath, jsonPath, jsonGlobalPath, dest) {
  const njkData = await readJSON(jsonPath);
  const dataGlobal = await readJSON(jsonGlobalPath);
  const data = Object.assign({}, njkData, dataGlobal);

  const html = nunjucks.render(njkPath, data);
  if (!(await pathExists(path.dirname(dest)))) {
    await fsp.mkdir(path.dirname(dest)), { recursive: true };
  }
  if (isDev) {
    await fsp.writeFile(dest, html);
    console.info(`${path.basename(dest)} file created`);
  } else {
    const minifedHtml = await minify(html, {
      removeAttributeQuotes: true,
      collapseWhitespace: true,
      removeComments: true,
    });
    await fsp.writeFile(dest, minifedHtml);
    console.info(`${path.basename(dest)} file created and minified`);
  }
}

async function handleIndexHtml(
  njkPath,
  jsonIndexPath,
  jsonArticlesPath,
  jsonGlobalPath,
  dest
) {
  const indexData = await readJSON(jsonIndexPath);
  const articles = await readJSON(jsonArticlesPath);
  const dataGlobal = await readJSON(jsonGlobalPath);

  const highlightArticles = articles.slice(0, 3);
  indexData.highlightArticles = highlightArticles;

  const data = Object.assign({}, indexData, dataGlobal);

  for (const article of highlightArticles) {
    article.href = `/blog/${createSlug(article.title, article.id)}`;
  }
  const indexHtml = nunjucks.render(njkPath, data);
  if (!(await pathExists(path.dirname(dest)))) {
    await fsp.mkdir(path.dirname(dest)), { recursive: true };
  }
  if (isDev) {
    await fsp.writeFile(dest, indexHtml);
    console.info(`${path.basename(dest)} file created`);
  } else {
    const minifedHtml = await minify(indexHtml, {
      removeAttributeQuotes: true,
      collapseWhitespace: true,
      removeComments: true,
    });
    await fsp.writeFile(dest, minifedHtml);
    console.info(`${path.basename(dest)} file created and minified`);
  }
}

async function handleArticles(njkPath, jsonPath, jsonGlobalPath) {
  const articles = await readJSON(jsonPath);
  const dataGlobal = await readJSON(jsonGlobalPath);

  for (const article of articles) {
    const dest = `./dist/blog/${createSlug(article.title, article.id)}.html`;
    if (!(await pathExists(path.dirname(dest)))) {
      await fsp.mkdir(path.dirname(dest)), { recursive: true };
    }

    const data = Object.assign(
      {
        titlePage: article.title,
        openGraphTitle: article.title,
        openGraphImg: article.img,
        openGraphDescription: article.description,
        openGraphUrl: `/blog/${createSlug(article.title, article.id)}.html`,
        cssFile: "./articles.css",
        article,
      },
      dataGlobal
    );

    const html = nunjucks.render(njkPath, data);
    if (isDev) {
      await fsp.writeFile(dest, html);
    } else {
      const minifedHtml = await minify(html, {
        removeAttributeQuotes: true,
        collapseWhitespace: true,
        removeComments: true,
      });
      await fsp.writeFile(dest, minifedHtml);
    }
  }
}

async function handleCss(src, dest) {
  if (!(await pathExists(path.dirname(dest)))) {
    await fsp.mkdir(path.dirname(dest)), { recursive: true };
  }
  if (isDev) {
    await fsp.copyFile(src, dest);
    console.info(`${path.basename(src)} file has been copied`);
  } else {
    const data = await fsp.readFile(src, "utf8");
    const minifiedData = await new cleanCSS().minify(data);
    await fsp.writeFile(dest, minifiedData.styles);
    console.info(`${path.basename(src)} file has been minified`);
  }
}

async function handleJs(src, dest) {
  if (!(await pathExists(path.dirname(dest)))) {
    await fsp.mkdir(path.dirname(dest)), { recursive: true };
  }
  if (isDev) {
    await fsp.copyFile(src, dest);
    console.info(`${path.basename(src)} file has been copied`);
  } else {
    const data = await fsp.readFile(src, "utf8");
    const minifiedData = await minifyterser(data);
    await fsp.writeFile(dest, minifiedData.code);
    console.info(`${path.basename(src)} file has been minified`);
  }
}
