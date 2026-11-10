// Шаг сборки курса: копия алфавитов и настройки в папку сборки — пакет (dist/) или сайт (site/). Не менять.
// node tools/copy-data.mjs dist   |   node tools/copy-data.mjs site
import { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";

const out = process.argv[2];
if (out !== "dist" && out !== "site") {
  console.error("Ошибка: нужна папка сборки — dist или site");
  process.exit(1);
}
mkdirSync(out, { recursive: true });
// прежняя копия алфавитов — долой: удалённый или переименованный алфавит не должен уйти в архив
rmSync(`${out}/alphabets`, { recursive: true, force: true });
cpSync("alphabets", `${out}/alphabets`, { recursive: true });
cpSync("translit.config.json", `${out}/translit.config.json`);
if (out === "site") {
  cpSync("page", out, { recursive: true });
  // сайт не читает папку — ему нужен список алфавитов файлом
  const names = readdirSync("alphabets").filter((f) => f.endsWith(".json") && !f.startsWith(".")).map((f) => f.slice(0, -5)).sort();
  writeFileSync(`${out}/alphabets/index.json`, JSON.stringify(names) + "\n");
}
