import fsp from "fs/promises";
import path from "path";
import nunjucks from "nunjucks";
nunjucks.configure({ autoescape: true });
import { minify } from "html-minifier-terser";
import cleanCSS from "clean-css";
import { minify as minifyterser } from "terser";
import slugify from "@sindresorhus/slugify";

import fs from "fs";

async function dir() {
  const files = await fsp.readdir("./dist");
  return files;
}

console.log(await dir());
