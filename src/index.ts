// Библиотека translit для Node.js: алфавиты — файлы данных в alphabets/, выбранный — в translit.config.json.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { BASE_ALPHABET, parseAlphabet, translit as translitWith, type Alphabet } from "./translit.ts";

export { parseAlphabet, type Alphabet } from "./translit.ts";

// Данные: из исходников (src/) — алфавиты и настройка в корне проекта; в собранном пакете npm run build кладёт их
// копией в dist/ рядом с кодом — в архив npm pack идёт только dist/ ("files": ["dist"]).
const ROOT = new URL(existsSync(new URL("./alphabets/", import.meta.url)) ? "./" : "../", import.meta.url);
const ALPHABETS = new URL("alphabets/", ROOT);
const CONFIG = new URL("translit.config.json", ROOT);

/** Имена всех алфавитов — по файлам alphabets/<имя>.json. */
export function alphabetNames(): string[] {
  if (!existsSync(ALPHABETS)) {
    throw new Error("папки alphabets нет рядом с пакетом — соберите пакет командой npm run build");
  }
  return readdirSync(ALPHABETS)
    .filter((f) => f.endsWith(".json") && !f.startsWith("."))
    .map((f) => f.slice(0, -".json".length))
    .sort();
}

/** Алфавит по имени файла данных. */
export function loadAlphabet(name: string): Alphabet {
  if (!alphabetNames().includes(name)) {
    throw new Error(`Алфавит "${name}" не найден. Есть: ${alphabetNames().join(", ")}`);
  }
  const file = `alphabets/${name}.json`;
  return parseAlphabet(readFileSync(new URL(`${name}.json`, ALPHABETS), "utf8"), file);
}

/** Имя алфавита из translit.config.json. */
export function configuredAlphabet(): string {
  let config: { alphabet?: unknown };
  try {
    config = JSON.parse(readFileSync(CONFIG, "utf8"));
  } catch {
    throw new Error("translit.config.json не читается: проверьте запятые, кавычки и скобки");
  }
  if (typeof config.alphabet !== "string" || config.alphabet === "") {
    throw new Error('translit.config.json: нет строки "alphabet" — имени алфавита');
  }
  return config.alphabet;
}

/** Переводит текст в латиницу алфавитом из настройки или названным. */
export function translit(text: string, alphabet: string = configuredAlphabet()): string {
  return translitWith(text, loadAlphabet(alphabet), loadAlphabet(BASE_ALPHABET));
}
