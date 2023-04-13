import fsp from "fs/promises";
import path from "path";
import nunjucks from "nunjucks";
nunjucks.configure({ autoescape: true });
import { minify } from "html-minifier-terser";
import cleanCSS from "clean-css";
import { minify as minifyterser } from "terser";
import slugify from "@sindresorhus/slugify";
import https from "https";

let env = nunjucks.configure({
  noCache: true,
});

const args = process.argv.slice(2);
const isDev = args[0] === "dev";

const optionsApiArticles = {
  hostname: "admin-ornikar-production.up.railway.app",
  path: "/api/articles",
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
};
const optionsApiArticlesCategories = {
  hostname: "admin-ornikar-production.up.railway.app",
  path: "/api/articles-categories",
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
};
const optionsApiHeader = {
  hostname: "admin-ornikar-production.up.railway.app",
  path: "/api/header",
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
};
const optionsApiFooter = {
  hostname: "admin-ornikar-production.up.railway.app",
  path: "/api/footer",
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
};

const dataHomePage = await getDataHomePage();
const dataLoginHtml = await getDataLogin();
const dataIndexArticles = await getDataIndexArticles();

const data404 = await getData404();

async function main() {
  await fsp.rm("./dist", { recursive: true, force: true });
  await fsp.mkdir("./dist");

  await Promise.all([
    handleNjkToHtml(
      "./src/template/index.njk",
      "./dist/index.html",
      dataHomePage
    ),

    handleCss("./src/css/index.css", "./dist/index.css"),

    handleCss("./src/css/global.css", "./dist/global.css"),

    handleJs("./src/js/global.js", "./dist/global.js"),

    handleNjkToHtml(
      "./src/template/login.njk",
      "./dist/login.html",
      dataLoginHtml
    ),

    handleCss("./src/css/login.css", "./dist/login.css"),

    handleArticles("./dist/blog"),

    handleCss("./src/css/articles.css", "./dist/blog/articles.css"),

    handleNjkToHtml(
      "./src/template/indexArticles.njk",
      "./dist/blog/index.html",
      dataIndexArticles
    ),
    handleCss("./src/css/indexArticles.css", "./dist/blog/indexArticles.css"),

    handleNjkToHtml("./src/template/404.njk", "./dist/404.html", data404),
    handleCss("./src/css/404.css", "./dist/404.css"),
  ]);
}

main().catch(console.error);

async function pathExists(path) {
  try {
    await fsp.access(path);
    return true;
  } catch (err) {
    console.log({ err });
    return false;
  }
}

function createArticleSlug(title, id) {
  const slug = `${slugify(title)}-${id}`;
  return slug;
}

async function readJSON(jsonPath) {
  const dataStr = await fsp.readFile(jsonPath);
  const data = JSON.parse(dataStr);
  return data;
}

async function mergeJsonFiles(arrOfjsonPaths) {
  let mergedData = {};

  for (const jsonPath of arrOfjsonPaths) {
    const data = await readJSON(jsonPath);
    mergedData = { ...mergedData, ...data };
  }

  return mergedData;
}
function mergeData(arrOfData) {
  let mergedData = {};

  for (const data of arrOfData) {
    mergedData = { ...mergedData, ...data };
  }

  return mergedData;
}

async function getData404() {
  const data = await getDataGlobal();
  data.cssFile = "/404.css";
  data.titlePage = "Ornikar";
  return data;
}

async function getDataHomePage() {
  const dataIndex = await readJSON("./src/data/index.json");
  const dataGlobal = await getDataGlobal();
  const data = mergeData([dataIndex, dataGlobal]);
  const dataArticlesCategories = await getDataApi(optionsApiArticlesCategories);
  const articles = await getDataApi(optionsApiArticles);
  const highlightArticles = articles.slice(0, 3);
  data.highlightArticles = highlightArticles;

  for (const article of highlightArticles) {
    const articleCategory = dataArticlesCategories.find(
      (category) => category.id === article.categoryId
    );
    article.href = `/blog/${createArticleSlug(article.title, article.id)}`;
    article.category = articleCategory.name;
  }
  return data;
}
async function getDataLogin() {
  const dataLogin = await readJSON("./src/data/login.json");
  const dataGlobal = await getDataGlobal();
  const data = mergeData([dataLogin, dataGlobal]);
  return data;
}

async function getDataIndexArticles() {
  const dataGlobal = await getDataGlobal();
  const dataArticles = await getDataApi(optionsApiArticles);
  const dataArticlesCategories = await getDataApi(optionsApiArticlesCategories);
  dataGlobal.articles = dataArticles;
  dataGlobal.cssFile = "/blog/indexArticles.css";
  for (const article of dataArticles) {
    const articleCategory = dataArticlesCategories.find(
      (category) => category.id === article.categoryId
    );
    article.href = `/blog/${createArticleSlug(article.title, article.id)}`;
    article.category = articleCategory.name;
  }
  return dataGlobal;
}
async function getDataGlobal() {
  const dataHeader = await getDataApi(optionsApiHeader);
  const dataFooter = await getDataApi(optionsApiFooter);
  const dataGlobal = mergeData([dataHeader, dataFooter]);
  dataGlobal.cssGlobal = "/global.css";
  dataGlobal.jsGlobal = "/global.js";
  return dataGlobal;
}

async function getDataApi(options) {
  return new Promise((resolve, reject) => {
    const request = https.request(options, (response) => {
      let data = "";
      response.on("data", (chunk) => {
        data += chunk;
      });
      response.on("end", () => {
        const jsonData = JSON.parse(data);
        resolve(jsonData);
      });
    });
    request.on("error", (error) => {
      reject(error);
    });
    request.end();
  });
}

async function handleArticles(dest) {
  const articles = await getDataApi(optionsApiArticles);
  const dataGlobal = await getDataGlobal();

  for (const article of articles) {
    const fileDest = `${dest}/${createArticleSlug(
      article.title,
      article.id
    )}.html`;

    const data = Object.assign(
      {
        titlePage: article.title,
        openGraphTitle: article.title,
        openGraphImg: article.img,
        openGraphDescription: article.description,
        openGraphUrl: `/blog/${createArticleSlug(
          article.title,
          article.id
        )}.html`,
        cssFile: "./articles.css",
        article,
      },
      dataGlobal
    );

    await handleNjkToHtml("./src/template/articles.njk", fileDest, data);
  }
  console.info("articles have been created");
}

async function handleNjkToHtml(src, dest, data) {
  const html = nunjucks.render(src, data);
  const dirDest = path.dirname(dest);
  await fsp.mkdir(dirDest, { recursive: true, force: true });

  if (isDev) {
    await fsp.writeFile(dest, html);
    // console.info(`${path.basename(dest)} file created`);
  } else {
    const minifedHtml = await minify(html, {
      removeAttributeQuotes: true,
      collapseWhitespace: true,
      removeComments: true,
    });
    await fsp.writeFile(dest, minifedHtml);
    // console.info(`${path.basename(dest)} file created and minified`);
  }
}

async function handleCss(src, dest) {
  await fsp.mkdir(path.dirname(dest), { recursive: true, force: true });
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
  await fsp.mkdir(path.dirname(dest), { recursive: true, force: true });

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
