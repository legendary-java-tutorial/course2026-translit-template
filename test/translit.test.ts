// Тесты курса: npm test. Свой алфавит проверяется сам — тестом «файлы данных алфавитов» и, если в файле есть
// примеры ("examples": {"Привет": "Privet"}), тестом «алфавит <имя>: примеры».
import { test } from "node:test";
import assert from "node:assert/strict";
import { alphabetNames, configuredAlphabet, loadAlphabet, translit } from "../src/index.ts";

/** Все буквы алфавита курса: «буква=латиница» через пробел; опечатка в любой букве файла — красный тест алфавита. */
function lettersOf(name: string): string {
  return Object.entries(loadAlphabet(name).letters)
    .filter(([ch]) => ch === ch.toLowerCase())
    .map(([ch, latin]) => `${ch}=${latin}`)
    .join(" ");
}

const COURSE = ["passport", "iso9", "ukrainian", "belarusian", "kazakh"];

test("файлы данных алфавитов: каждый читается, буквы — латиницей", () => {
  for (const name of alphabetNames()) {
    const a = loadAlphabet(name);
    assert.ok(Object.keys(a.letters).length >= 30,
      `alphabets/${name}.json: букв меньше 30 — новый алфавит делают копией готового (например, passport.json) и меняют нужные буквы`);
  }
});

test("настройка: translit.config.json называет алфавит из папки alphabets", () => {
  const name = configuredAlphabet();
  assert.ok(alphabetNames().includes(name), `в translit.config.json алфавит "${name}" — такого файла в alphabets/ нет`);
});

test("алфавит passport: паспортный", () => {
  assert.equal(lettersOf("passport"),
    "а=a б=b в=v г=g д=d е=e ё=e ж=zh з=z и=i й=i к=k л=l м=m н=n о=o п=p р=r с=s т=t у=u ф=f х=kh ц=ts ч=ch ш=sh щ=shch ъ=ie ы=y ь= э=e ю=iu я=ia");
  assert.equal(translit("Привет, жёлтый щенок", "passport"), "Privet, zheltyi shchenok");
  assert.equal(translit("Юлия Хрущёва", "passport"), "Iuliia Khrushcheva");
});

test("алфавит iso9: ISO 9", () => {
  assert.equal(lettersOf("iso9"),
    "а=a б=b в=v г=g д=d е=e ё=ë ж=ž з=z и=i й=j к=k л=l м=m н=n о=o п=p р=r с=s т=t у=u ф=f х=h ц=c ч=č ш=š щ=ŝ ъ=ʺ ы=y ь=ʹ э=è ю=û я=â і=ì ї=ï є=ê ґ=g̀ ў=ŭ");
  assert.equal(translit("Привет, жёлтый щенок", "iso9"), "Privet, žëltyj ŝenok");
  assert.equal(translit("Объявление", "iso9"), "Obʺâvlenie");
});

test("алфавит ukrainian: украинский", () => {
  assert.equal(lettersOf("ukrainian"),
    "а=a б=b в=v г=h ґ=g д=d е=e є=ie ж=zh з=z и=y і=i ї=i й=i к=k л=l м=m н=n о=o п=p р=r с=s т=t у=u ф=f х=kh ц=ts ч=ch ш=sh щ=shch ь= ю=iu я=ia ’= '= ʼ=");
  assert.equal(translit("Привет, жёлтый щенок", "ukrainian"), "Pryvet, zheltyi shchenok");
  assert.equal(translit("Їжак Юрій з Згурівки", "ukrainian"), "Yizhak Yurii z Zghurivky");
});

test("алфавит belarusian: белорусский", () => {
  assert.equal(lettersOf("belarusian"),
    "а=a б=b в=v г=g д=d е=ie ё=io ж=zh з=z і=i й=j к=k л=l м=m н=n о=o п=p р=r с=s т=t у=u ў=w ф=f х=h ц=c ч=ch ш=sh ы=y ь= э=e ю=iu я=ia ’= '= ʼ=");
  assert.equal(translit("Привет, жёлтый щенок", "belarusian"), "Priviet, zhioltyj shchienok");
  assert.equal(translit("Гаўя, Ельск, Мар’іна Горка", "belarusian"), "Gawja, Jelsk, Marjina Gorka");
  assert.equal(translit("МАР’ІНА ГОРКА", "belarusian"), "MARJINA GORKA");
});

test("алфавит kazakh: казахский", () => {
  assert.equal(lettersOf("kazakh"),
    "а=a ә=ä б=b в=v г=g ғ=ğ д=d е=e ё=io ж=j з=z и=i й=i к=k қ=q л=l м=m н=n ң=ñ о=o ө=ö п=p р=r с=s т=t у=u ұ=ū ү=ü ф=f х=h һ=h ц=ts ч=tş ш=ş щ=ştş ъ= ы=y і=ı ь= э=e ю=iu я=ia");
  assert.equal(translit("Привет, жёлтый щенок", "kazakh"), "Privet, jioltyi ştşenok");
  assert.equal(translit("Қазақстан, Иса, Юлия, ЁЛКА", "kazakh"), "Qazaqstan, İsa, İuliia, İOLKA");
});

test("заглавные и знаки: слово заглавными, цифры и латиница не меняются", () => {
  assert.equal(translit("ЩИ и Borscht 2026!", "passport"), "SHCHI i Borscht 2026!");
});

// свои алфавиты: примеры из поля "examples" файла данных
for (const name of alphabetNames().filter((n) => !COURSE.includes(n))) {
  const examples = loadAlphabet(name).examples;
  if (examples === undefined) continue;
  test(`алфавит ${name}: примеры`, () => {
    for (const [text, latin] of Object.entries(examples)) assert.equal(translit(text, name), latin);
  });
}
