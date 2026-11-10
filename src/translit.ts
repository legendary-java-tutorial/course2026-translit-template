// Транслитерация: кириллица → латиница по алфавиту из файла данных alphabets/<имя>.json.

/** Алфавит — содержимое файла данных. */
export interface Alphabet {
  /** Название для людей: в списке сайта и в ошибках. */
  name: string;
  /** Буква → латиница; строчные. Заглавные получаются сами; особую заглавную можно задать отдельно. */
  letters: Record<string, string>;
  /** Буквы, которые в начале слова пишутся иначе (украинское «я» → «ya» в начале, «ia» в середине). */
  wordStart?: Record<string, string>;
  /** После каких букв правило начала слова тоже действует (белорусское «е» после гласной → «je»). */
  wordStartAfter?: string;
  /** Две буквы подряд со своей передачей (украинское «зг» → «zgh»). */
  pairs?: Record<string, string>;
  /** Примеры для теста своего алфавита: текст → латиница («алфавит <имя>: примеры» в npm test). */
  examples?: Record<string, string>;
}

/** Алфавит по умолчанию для букв, которых в выбранном нет: паспортный. */
export const BASE_ALPHABET = "passport";

/** Проверяет файл данных алфавита; ошибка — по-русски, с причиной. */
export function parseAlphabet(text: string, file: string): Alphabet {
  let data: unknown;
  try {
    data = JSON.parse(text.replace(/^\uFEFF/, "")); // файл «UTF-8 с BOM» из Блокнота — тоже читается
  } catch (e) {
    const where = /line \d+ column \d+/.exec((e as Error).message)?.[0].replace("line", "строка").replace("column", "столбец");
    throw new Error(`${file} не читается${where ? ` (${where})` : ""}: проверьте запятые между строками, кавычки и скобки`);
  }
  const a = data as Partial<Alphabet>;
  if (typeof a?.name !== "string" || a.name.trim() === "") {
    throw new Error(`${file}: нет поля "name" — названия алфавита`);
  }
  if (typeof a.letters !== "object" || a.letters === null || Object.keys(a.letters).length === 0) {
    throw new Error(`${file}: нет поля "letters" — букв алфавита`);
  }
  for (const [ch, latin] of Object.entries(a.letters)) {
    if ([...ch].length !== 1) throw new Error(`${file}: в "letters" ключ "${ch}" — не одна буква`);
    if (typeof latin !== "string") throw new Error(`${file}: у буквы "${ch}" значение не строка`);
    if (/[а-яёіїєґўәғқңөұүһ]/i.test(latin)) {
      throw new Error(`${file}: у буквы "${ch}" в значении "${latin}" осталась кириллица`);
    }
  }
  return a as Alphabet;
}

const APOSTROPHES = "’'ʼ";

function isUpper(ch: string): boolean {
  return ch !== ch.toLowerCase() && ch === ch.toUpperCase();
}

function isLetter(ch: string | undefined): boolean {
  return ch !== undefined && /\p{L}/u.test(ch);
}

/** Заглавная — как у исходной буквы: «Щ» → «Shch», «ЩИ» (всё слово заглавными) → «SHCHI». */
function withCase(latin: string, ch: string, wholeWordUpper: boolean): string {
  if (!isUpper(ch) || latin === "") return latin;
  if (wholeWordUpper) return latin.toUpperCase();
  return latin[0]!.toUpperCase() + latin.slice(1);
}

/** Переводит текст в латиницу. Буквы, которых нет в алфавите, берутся из base; прочие знаки остаются как есть. */
export function translit(text: string, alphabet: Alphabet, base?: Alphabet): string {
  const chars = [...text];
  const pairs = alphabet.pairs ?? {};
  const after = alphabet.wordStartAfter ?? "";
  let out = "";
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]!;
    const lower = ch.toLowerCase();
    const prev = chars[i - 1];
    const next = chars[i + 1];
    const wordUpper = isUpper(ch) && (isUpper(next ?? "") || isUpper(prev ?? ""));

    const pair = next !== undefined ? pairs[lower + next.toLowerCase()] : undefined;
    if (pair !== undefined) {
      // регистр пары — по первой букве в ней: у «’І» — по «І»
      // слово заглавными — если заглавная и буква рядом с парой: «ЗГУРІВКА» → «ZGHURIVKA», «Згурівка» → «Zghurivka»
      const letterFirst = isLetter(ch) && !APOSTROPHES.includes(ch);
      const caseCh = letterFirst ? ch : next!;
      const neighbours = [prev, letterFirst ? next : undefined, chars[i + 2]];
      const pairUpper = isUpper(caseCh) && neighbours.some((c) => c !== undefined && isUpper(c));
      out += withCase(pair, caseCh, pairUpper);
      i++;
      continue;
    }

    // начало слова: перед буквой нет буквы (апостроф — часть слова) или стоит знак из wordStartAfter (гласная, апостроф, ь, ў)
    const atStart = (!isLetter(prev) && !(prev !== undefined && APOSTROPHES.includes(prev))) || (prev !== undefined && after.includes(prev.toLowerCase()));
    const start = alphabet.wordStart?.[lower];
    let latin: string | undefined;
    if (start !== undefined && atStart) {
      latin = start;
    } else if (alphabet.letters[ch] !== undefined && ch !== lower) {
      // особая заглавная (казахская «И» → «İ»): слово заглавными — вся передача заглавными («ЁЛКА» → «İOLKA»)
      out += wordUpper ? alphabet.letters[ch]!.toUpperCase() : alphabet.letters[ch];
      continue;
    } else {
      latin = alphabet.letters[lower] ?? base?.letters[lower];
    }
    out += latin === undefined ? ch : withCase(latin, ch, wordUpper);
  }
  return out;
}
