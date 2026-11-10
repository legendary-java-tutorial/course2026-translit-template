// Онлайн-транслитератор: страница site/index.html (npm run build:site). Алфавиты — те же файлы данных.
import { BASE_ALPHABET, parseAlphabet, translit, type Alphabet } from "./translit.ts";

const input = document.querySelector<HTMLInputElement>("#text")!;
const select = document.querySelector<HTMLSelectElement>("#alphabet")!;
const output = document.querySelector<HTMLElement>("#result")!;
const status = document.querySelector<HTMLElement>("#status")!;

async function load(name: string): Promise<Alphabet> {
  const res = await fetch(`./alphabets/${name}.json`);
  if (!res.ok) throw new Error(`alphabets/${name}.json не найден`);
  return parseAlphabet(await res.text(), `alphabets/${name}.json`);
}

async function main(): Promise<void> {
  const names: string[] = await (await fetch("./alphabets/index.json")).json();
  const config: { alphabet?: string } = await (await fetch("./translit.config.json")).json();
  const alphabets = new Map<string, Alphabet>();
  for (const name of names) alphabets.set(name, await load(name));
  for (const [name, a] of alphabets) select.add(new Option(a.name, name, false, name === config.alphabet));
  status.textContent = `Алфавитов: ${alphabets.size}`;
  const update = (): void => {
    output.textContent = translit(input.value, alphabets.get(select.value)!, alphabets.get(BASE_ALPHABET));
  };
  input.addEventListener("input", update);
  select.addEventListener("change", update);
  update();
  input.focus();
}

main().catch((e: Error) => {
  status.textContent = `Ошибка: ${e.message}`;
});
