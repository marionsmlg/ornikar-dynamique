import http from "http";
import path from "path";
import fs from "fs/promises";

// const server = http.createServer((req, res) => {
//   const filename = path.parse(req.url).name; // extract filename without extension
//   const filePath = `./dist/${filename}.html`; // create file path with .html extension
//   fs.readFile(filePath, (err, data) => {
//     if (err) {
//       res.writeHead(404, { "Content-Type": "text/html" });
//       res.write("<h1>404 Not Found</h1>");
//       return res.end();
//     }
//     res.writeHead(200, { "Content-Type": "text/html" });
//     res.write(data);
//     return res.end();
//   });
// });

// server.listen(4000, () => {
//   console.log("Server running on port 4000");
// });
async function isDir(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return stat.isDirectory();
  } catch (error) {
    return false;
  }
}

console.log(await isDir("/blog"));
