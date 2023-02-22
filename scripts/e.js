import http from "http";
import fs from "fs/promises";

async function pathExists(path) {
  try {
    await fsp.access(path);
    return true;
  } catch (err) {
    return false;
  }
}

// const file = isFile("./dist/index.html");
// console.log(file);

async function isFile(path) {
  const stats = await fs.stat(path);
  return stats.isFile();
}
console.log(await isFile("./dist"));
