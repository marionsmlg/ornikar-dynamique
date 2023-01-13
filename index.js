const nunjucks = require("nunjucks");
const data = require("./src/data/data_fr.json");
const fs = require("fs");
nunjucks.configure({ autoescape: true });
let templateMenu = nunjucks.render("./src/template/index.njk", data);
fs.writeFile("./dist/index.html", templateMenu, (err) => {
  if (err) {
    throw err;
  }
  console.log(`index.html file created`);
});

const dataLogin = require("./src/data/data_login.json");
let templateLogin = nunjucks.render("./src/template/login.njk", dataLogin);
fs.writeFile("./dist/login.html", templateLogin, (err) => {
  if (err) {
    throw err;
  }
  console.log(`login.html file created`);
});

// fs.writeFileSync("index.html", outString);
// console.log("index.html file created");

// const nunjucks = require("nunjucks");
// nunjucks.configure({ autoescape: true });
// let helloStr = nunjucks.renderString("Hello {{username}}", {
//   username: "Marion",
// });
// console.log(helloStr);
