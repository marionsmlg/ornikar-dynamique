import http from "http";
import fs from "fs/promises";
import path from "path";

async function pathExists(path) {
  try {
    await fs.access(path);
    return true;
  } catch (err) {
    return false;
  }
}

async function isFile(path) {
  const stats = await fs.stat(path);
  return stats.isFile();
}

const server = http.createServer(async (request, response) => {
  if (request.method === "GET") {
    let contentType = "text/html";
    const ext = path.parse(request.url).ext;
    let urlWithoutExt = request.url.replace(path.extname(request.url), "");
    let filePath = "./dist" + urlWithoutExt + ext;

    if (ext === ".html") {
      request.url = urlWithoutExt;
    }
    console.log({ ext, urlWithoutExt, filePath });
    console.log(request.url);

    if (request.url.endsWith(".css")) {
      contentType = "text/css";
    } else if (request.url.endsWith(".js")) {
      contentType = "application/javascript";
    }
    if (request.url === "/") {
      filePath = "./dist/index.html";
    }

    if ((await pathExists(filePath)) && (await isFile(filePath))) {
      const content = await fs.readFile(filePath, "utf-8");
      response.setHeader("Content-type", contentType);
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
