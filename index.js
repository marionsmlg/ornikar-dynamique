const nunjucks = require("nunjucks");
const language = require("./language_fr.json");
const fs = require("fs");
nunjucks.configure({ autoescape: true });
let outString = nunjucks.render("index.njk", language);
fs.writeFile("index.html", outString, (err) => {
  if (err) {
    throw new err(`erreur`);
  }
  console.log(`index.html file created`);
});

// fs.writeFileSync("index.html", outString);
// console.log("index.html file created");

// const nunjucks = require("nunjucks");
// nunjucks.configure({ autoescape: true });
// let helloStr = nunjucks.renderString("Hello {{username}}", {
//   username: "Marion",
// });
// console.log(helloStr);
