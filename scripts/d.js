response.setHeader("Content-Type", "text/html");

if (request.method === "GET" && request.url === "/") {
  const contentIndexHtml = await fs.readFile("./dist/index.html", "utf-8");
  response.end(contentIndexHtml);
} else if (request.method === "GET" && request.url === "/index.css") {
  response.setHeader("Content-type", "text/css");
  const content = await fs.readFile("./dist/index.css", "utf-8");
  response.end(content);
} else if (request.method === "GET" && request.url === "/global.css") {
  response.setHeader("Content-type", "text/css");
  const content = await fs.readFile("./dist/global.css", "utf-8");
  response.end(content);
} else if (request.method === "GET" && request.url === "/member/login.html") {
  const content = await fs.readFile("./dist/member/login.html", "utf-8");
  response.end(content);
} else if (request.method === "GET" && request.url === "/member/login.css") {
  response.setHeader("Content-type", "text/css");
  const content = await fs.readFile("./dist/member/login.css", "utf-8");
  response.end(content);
} else if (request.method === "GET" && request.url === "/global.js") {
  response.setHeader("Content-type", "application/javascript");
  const content = await fs.readFile("./dist/global.js", "utf-8");
  response.end(content);
} else if (request.method === "GET" && request.url === "/blog/articles.css") {
  response.setHeader("Content-type", "text/css");
  const content = await fs.readFile("./dist/blog/articles.css", "utf-8");
  response.end(content);
} else if (request.method === "GET") {
  response.statusCode = 404;
  response.end("<h1>Page not found</h1>");
}
