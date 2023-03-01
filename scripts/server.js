import http from "http";
import fs from "fs/promises";
import path from "path";

const server = http.createServer(async (request, response) => {
  if (request.method === "GET") {
    let url = request.url;
    const extname = path.extname(url);
    let filePath = `./dist${url}`;

    if (await isDir(filePath)) {
      filePath += "/index";
    }
    if (extname !== ".html" && extname !== ".css" && extname !== ".js") {
      filePath += ".html";
      if ((await pathExists(filePath)) && (await isFile(filePath))) {
        let content = await fs.readFile(filePath, "utf-8");
        response.setHeader("Content-type", await getContentType(request.url));
        response.end(content);
      } else {
        response.statusCode = 404;
        response.end("<h1>Page not found</h1>");
      }
    } else if (
      ((await pathExists(filePath)) &&
        (await isFile(filePath)) &&
        extname === ".css") ||
      extname === ".js"
    ) {
      let content = await fs.readFile(filePath, "utf-8");
      response.setHeader("Content-type", await getContentType(request.url));
      response.end(content);
    } else {
      response.statusCode = 404;
      response.end("<h1>Page not found</h1>");
    }
  }
});

server.listen(3000, () => {
  console.log("http://localhost:3000");
});

async function getContentType(reqUrl) {
  if (reqUrl.endsWith(".css")) {
    return "text/css";
  } else if (reqUrl.endsWith(".js")) {
    return "application/javascript";
  } else {
    return "text/html";
  }
}

async function pathExists(path) {
  try {
    await fs.access(path);
    return true;
  } catch (err) {
    return false;
  }
}

async function isFile(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile();
  } catch (error) {
    return false;
  }
}

async function isDir(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return stat.isDirectory();
  } catch (error) {
    return false;
  }
}
