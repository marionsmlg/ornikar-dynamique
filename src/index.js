const nunjucks = require("nunjucks");
const data = require("./data/index.json");
const fs = require("fs");
const dataLogin = require("./data/login.json");
const { minify } = require("html-minifier-terser");
const fsp = require("fs/promises");
const cleanCSS = require("clean-css");
const terser = require("terser");

nunjucks.configure({ autoescape: true });

let templateMenu = nunjucks.render("./src/template/index.njk", data);
let templateLogin = nunjucks.render("./src/template/login.njk", dataLogin);

const minifyOptionsHtml = {
  removeAttributeQuotes: true,
  collapseWhitespace: true,
  removeComments: true,
};

const templateMenuMinified = minify(templateMenu, minifyOptionsHtml);
const templateLoginMinified = minify(templateLogin, minifyOptionsHtml);

fsp
  .rm("./dist", { recursive: true, force: true })
  .catch((err) => {
    throw err;
  })
  .then(() => {
    fsp
      .mkdir("./dist")
      .catch((err) => {
        throw err;
      })
      .then(() => {
        templateMenuMinified.then(function (value) {
          fsp
            .writeFile("./dist/index.html", value)
            .catch((err) => {
              throw err;
            })
            .then(() => {
              console.log(`index.html file created`);
            });
        });

        fsp
          .readFile("./src/css/index.css", "utf8")
          .catch((err) => {
            throw err;
          })
          .then((data) => {
            let minifiedIndexCSS = new cleanCSS().minify(data).styles;
            fsp
              .writeFile("./dist/index.css", minifiedIndexCSS)
              .catch((err) => {
                throw err;
              })
              .then(() => {
                console.log("The index.css file has been minified and copied!");
              });
          });

        fsp
          .readFile("./src/css/global.css", "utf8")
          .catch((err) => {
            throw err;
          })
          .then((data) => {
            let minifiedGlobalCSS = new cleanCSS().minify(data).styles;
            fsp
              .writeFile("./dist/global.css", minifiedGlobalCSS)
              .catch((err) => {
                throw err;
              })
              .then(() => {
                console.log(
                  "The global.css file has been minified and copied!"
                );
              });
          });

        // fsp
        //   .readFile("./src/js/global.js", "utf8")
        //   .catch((err) => {
        //     throw err;
        //   })
        //   .then((data) => {
        //     let minifiedGlobalJS = minify(data);
        //     fsp
        //       .writeFile("./dist/global.js", minifiedGlobalJS.data)
        //       .catch((err) => {
        //         throw err;
        //       })
        //       .then(() => {
        //         console.log("The global.js file has been minified and copied!");
        //       });
        //   });

        fsp
          .copyFile("./src/js/global.js", "./dist/global.js")
          .catch((err) => {
            throw err;
          })
          .then(() => {
            console.log("Le fichier global.js a été copié!");
          });
        fsp
          .mkdir("./dist/member")
          .catch((err) => {
            throw err;
          })
          .then(() => {
            templateLoginMinified.then(function (value) {
              fsp
                .writeFile("./dist/member/login.html", value)
                .catch((err) => {
                  throw err;
                })
                .then(() => {
                  console.log("login.html file created");
                });
            });

            fsp
              .readFile("./src/css/login.css", "utf8")
              .catch((err) => {
                throw err;
              })
              .then((data) => {
                let minifiedLoginCSS = new cleanCSS().minify(data).styles;
                fsp
                  .writeFile("./dist/member/login.css", minifiedLoginCSS)
                  .catch((err) => {
                    throw err;
                  })
                  .then(() => {
                    console.log(
                      "The login.css file has been minified and copied!"
                    );
                  });
              });
          });
      });
  });
