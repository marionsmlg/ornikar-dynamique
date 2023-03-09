import http from "http";
import fs from "fs/promises";
import path from "path";
import mime from "mime-types";

const server = http.createServer(async (request, response) => {
  if (request.method === "GET") {
    let url = request.url;
    const extname = path.extname(url);
    let filePath = `./dist${url}`;

    if (await isDir(filePath)) {
      filePath += "/index";
    }
    if (extname === "") {
      filePath += ".html";
      if ((await pathExists(filePath)) && (await isFile(filePath))) {
        const content = await fs.readFile(filePath, "utf-8");
        response.setHeader("Content-type", mime.lookup(url));
        response.end(content);
      } else {
        await render404(response, url);
      }
    } else if (
      (await pathExists(filePath)) &&
      (await isFile(filePath)) &&
      extname !== ".html"
    ) {
      const content = await fs.readFile(filePath, "utf-8");
      response.setHeader("Content-type", mime.lookup(url));
      response.end(content);
    } else {
      await render404(response, url);
    }
  }
});

server.listen(3000, () => {
  console.log("http://localhost:3000");
});

// function getContentType(reqUrl) {
//   if (reqUrl.endsWith(".css")) {
//     return "text/css";
//   } else if (reqUrl.endsWith(".js")) {
//     return "application/javascript";
//   } else {
//     return "text/html";
//   }
// }

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

async function render404(response, url) {
  response.statusCode = 404;
  const content = await fs.readFile("./dist/404.html", "utf-8");
  response.setHeader("Content-type", mime.lookup(url));
  response.end(content);
}
