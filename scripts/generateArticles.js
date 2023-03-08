import fsp from "fs/promises";
import { customAlphabet } from "nanoid";
import { randParagraph, randPhrase, randTextRange } from "@ngneat/falso";

const arrOfArticles = [];
const arrOfCategories = [
  "Assurance auto",
  "Code de la route",
  "Permis de conduire",
  "Conduite accompagnée",
  "Informations",
  "Mecanique",
  "Conduite",
];

function getRandomFromArr(arr) {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

const nanoid = customAlphabet("0123456789qwertyuiopasdfghjklzxcvbnm", 10);

for (let i = 0; i <= 97; i++) {
  const articleId = nanoid();
  const newArticle = {
    id: articleId,
    title: randPhrase(),
    description: randParagraph(),
    category: getRandomFromArr(arrOfCategories),
    content: randTextRange({ min: 2000, max: 3000 }),
    img: `https://picsum.photos/300/200?${articleId}`,
  };
  arrOfArticles.push(newArticle);
}

const strOfArticles = JSON.stringify(arrOfArticles, null, "\t");

async function generateArticles() {
  await fsp.writeFile("./scripts/articles.json", strOfArticles);
}

generateArticles();
