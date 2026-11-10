#!/usr/bin/env node
// translit в терминале: npm start -- Привет (из исходников) или npx translit Привет (из пакета).
import { alphabetNames, configuredAlphabet, loadAlphabet, translit } from "./index.ts";

const FLAGS = "--list — алфавиты, --alphabet <имя> — перевести другим алфавитом";

try {
  const words: string[] = [];
  let alphabet: string | undefined;
  let list = false;
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    if (arg === "--list") {
      list = true;
    } else if (arg === "--alphabet") {
      alphabet = args[++i];
      if (alphabet === undefined) throw new Error(`после --alphabet нужно имя алфавита: ${alphabetNames().join(", ")}`);
    } else if (arg.startsWith("--")) {
      throw new Error(`флаг ${arg} не знаю. Есть: ${FLAGS}`);
    } else {
      words.push(arg);
    }
  }
  if (list) {
    const current = configuredAlphabet();
    for (const name of alphabetNames()) {
      console.log(`${name === current ? "*" : " "} ${name} — ${loadAlphabet(name).name}`);
    }
  } else if (words.length === 0) {
    console.log(`Напишите слово: npm start -- Привет (или npx translit Привет). Флаги: ${FLAGS}`);
  } else {
    console.log(translit(words.join(" "), alphabet));
  }
} catch (e) {
  console.error(`Ошибка: ${(e as Error).message}`);
  process.exit(1);
}
