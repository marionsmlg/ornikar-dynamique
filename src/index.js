const nunjucks = require("nunjucks");
const data = require("./data/index.json");
const fs = require("fs");
const dataLogin = require("./data/login.json");
const { minify } = require("html-minifier-terser");

nunjucks.configure({ autoescape: true });

let templateMenu = nunjucks.render("./src/template/index.njk", data);
let templateLogin = nunjucks.render("./src/template/login.njk", dataLogin);

const templateMenuMinified = minify(templateMenu, {
  removeAttributeQuotes: true,
  collapseWhitespace: true,
  removeComments: true,
});

const templateLoginMinified = minify(templateLogin, {
  removeAttributeQuotes: true,
  collapseWhitespace: true,
  removeComments: true,
});

fs.rm("./dist", { recursive: true, force: true }, (err) => {
  if (err) {
    throw err;
  }
  fs.mkdir("./dist", function (error) {
    if (error) {
      throw error;
    }
    templateMenuMinified.then(function (minifiedMainPage) {
      fs.writeFile("./dist/index.html", minifiedMainPage, (err) => {
        if (err) {
          throw err;
        }
        console.log(`index.html file created`);
      });
    });

    fs.copyFile("./src/css/index.css", "./dist/index.css", (err) => {
      if (err) throw err;
      console.log("Le fichier index.css a été copié!");
    });
    fs.copyFile("./src/css/global.css", "./dist/global.css", (err) => {
      if (err) throw err;
      console.log("Le fichier global.css a été copié!");
    });

    fs.mkdir("./dist/member", function (error) {
      if (error) {
        throw error;
      }
      templateLoginMinified.then(function (minifiedLoginPage) {
        fs.writeFile("./dist/member/login.html", minifiedLoginPage, (err) => {
          if (err) {
            throw err;
          }
          console.log(`login.html file created`);
        });
      });

      fs.copyFile("./src/css/login.css", "./dist/member/login.css", (err) => {
        if (err) throw err;
        console.log("Le fichier login.css a été copié!");
      });
    });
  });
});

// fs.writeFileSync("index.html", outString);
// console.log("index.html file created");

// const nunjucks = require("nunjucks");
// nunjucks.configure({ autoescape: true });
// let helloStr = nunjucks.renderString("Hello {{username}}", {
//   username: "Marion",
// });
// console.log(helloStr);
