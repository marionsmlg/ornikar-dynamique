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

// async function readJSON(jsonPath) {
//   const dataStr = await fsp.readFile(jsonPath);
//   const data = JSON.parse(dataStr);
//   return data;
// }

async function handleHtml(njkPath, jsonPath, dest) {
  const dataStr = await fsp.readFile(jsonPath);
  const data = JSON.parse(dataStr);
  const html = nunjucks.render(njkPath, data);
  // await fsp.mkdir(dest, { recursive: true });
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

async function handleIndexHtml(njkPath, jsonIndexPath, jsonArticlesPath, dest) {
  const indexDataStr = await fsp.readFile(jsonIndexPath);
  const indexData = JSON.parse(indexDataStr);
  const articlesDataStr = await fsp.readFile(jsonArticlesPath);
  const articles = JSON.parse(articlesDataStr);
  const highlightArticles = articles.slice(0, 3);
  indexData.highlightArticles = highlightArticles;
  const indexHtml = nunjucks.render(njkPath, indexData);
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

async function handleArticles(njkPath, jsonPath) {
  const dataJson = await fsp.readFile(jsonPath);
  const articles = JSON.parse(dataJson);

  for (const article of articles) {
    const dest = `./dist/blog/${slugify(article.title)}${article.id}.html`;

    const data = {
      titlePage: article.title,
      openGraphTitle: article.title,
      openGraphImg: article.img,
      openGraphDescription: article.description,
      openGraphUrl: `/blog/${slugify(article.title)}-${article.id}.html`,
      cssGlobal: "/global.css",
      cssFile: "./articles.css",
      jsFile: "/global.js",
      navlinks: [
        {
          title: "Code de la route",
          href: "https://www.ornikar.com/code",
        },
        {
          title: "Permis de conduire",
          href: "https://www.ornikar.com/permis",
        },

        {
          title: "Assurance auto",
          href: "https://www.ornikar.com/assurance-auto",
        },
      ],
      article,
    };

    const html = nunjucks.render(njkPath, data);
    await fsp.writeFile(dest, html);
  }
}

async function handleCss(src, dest) {
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

async function main() {
  await fsp.rm("./dist", { recursive: true, force: true });
  await fsp.mkdir("./dist");
  await Promise.all([fsp.mkdir("./dist/member"), fsp.mkdir("./dist/blog")]);

  await Promise.all([
    handleIndexHtml(
      "./src/template/index.njk",
      "./src/data/index.json",
      "./src/data/articles.json",
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
