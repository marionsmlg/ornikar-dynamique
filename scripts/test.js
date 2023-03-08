import fsp from "fs/promises";
import path from "path";
import nunjucks from "nunjucks";
nunjucks.configure({ autoescape: true });
import { minify } from "html-minifier-terser";
import cleanCSS from "clean-css";
import { minify as minifyterser } from "terser";
import slugify from "@sindresorhus/slugify";

async function mergeJsonFiles(jsonPaths) {
  let mergedData = {};

  for (const jsonPath of jsonPaths) {
    const data = await readJSON(jsonPath);
    mergedData = { ...mergedData, ...data };
  }

  return mergedData;
}

async function getData(jsonPath, jsonGlobalPath) {
  const njkData = await readJSON(jsonPath);
  const dataGlobal = await readJSON(jsonGlobalPath);
  const data = Object.assign({}, njkData, dataGlobal);
  return data;
}

// console.log(
//   await mergeJsonFiles(["./src/data/login.json", "./src/data/global.json"])
// );
console.log(await getData("./src/data/login.json", "./src/data/global.json"));

async function readJSON(jsonPath) {
  const dataStr = await fsp.readFile(jsonPath);
  const data = JSON.parse(dataStr);
  return data;
}

function createArticleSlug(title, id) {
  const slug = `${slugify(title)}-${id}`;
  return slug;
}
