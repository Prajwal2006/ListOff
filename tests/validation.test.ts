import { describe, expect, it } from "vitest";
import { normalizeAnswer } from "@/lib/validation/normalize";
import { TopicIndex, countValidUnique, validateSubmissions, type IndexedAnswer } from "@/lib/validation/topic-index";
import { parseAnswers } from "@/lib/seed/parse";

function indexFrom(src: string): TopicIndex {
  const answers: IndexedAnswer[] = parseAnswers(src).map((a, i) => ({
    id: i + 1,
    canonical: a.canonical,
    normalized: normalizeAnswer(a.canonical),
    aliases: a.aliases.map(normalizeAnswer),
  }));
  return new TopicIndex(answers);
}

const fruits = indexFrom(
  "Apple|Banana|Mango|Orange|Grape=Grapes|Watermelon|Strawberry|Kiwi=Kiwifruit|Lychee=Litchi|Star fruit=Carambola|Brussels sprout",
);
const cities = indexFrom("New York City=New York=NYC|Los Angeles=LA|St. Louis|Spider-Man");

describe("TopicIndex matching", () => {
  it("accepts the canonical answer in any case or spacing", () => {
    for (const s of ["Apple", "apple", "  APPLE  ", "ApPlE"]) {
      expect(fruits.match(s).canonical).toBe("Apple");
    }
  });

  it("matches aliases to their canonical answer", () => {
    expect(fruits.match("litchi").canonical).toBe("Lychee");
    expect(fruits.match("Kiwifruit").canonical).toBe("Kiwi");
    expect(cities.match("NYC").canonical).toBe("New York City");
    expect(cities.match(" new york ").canonical).toBe("New York City");
    expect(cities.match("LA").canonical).toBe("Los Angeles");
  });

  it("handles plural and spacing variants safely", () => {
    expect(fruits.match("Bananas").canonical).toBe("Banana");
    expect(fruits.match("water melon").canonical).toBe("Watermelon");
    expect(fruits.match("Brussels sprouts").canonical).toBe("Brussels sprout");
    expect(fruits.match("starfruit").canonical).toBe("Star fruit");
    expect(cities.match("spiderman").canonical).toBe("Spider-Man");
  });

  it("matches St./Saint variants", () => {
    expect(cities.match("Saint Louis").canonical).toBe("St. Louis");
    expect(cities.match("st louis").canonical).toBe("St. Louis");
  });

  it("rejects answers from outside the topic", () => {
    for (const s of ["Car", "Laptop", "Football", "Carrot", ""]) {
      expect(fruits.match(s).answerId).toBeNull();
    }
  });

  it("autocorrects typos: missing, extra, wrong and swapped letters", () => {
    expect(fruits.match("Bananna")).toMatchObject({ canonical: "Banana", method: "typo" });
    expect(fruits.match("Mangoe")).toMatchObject({ canonical: "Mango", method: "typo" });
    expect(fruits.match("Oragne")).toMatchObject({ canonical: "Orange", method: "typo" });
    expect(fruits.match("strawbery").canonical).toBe("Strawberry");
    expect(fruits.match("watermellon").canonical).toBe("Watermelon");
  });

  it("can turn autocorrect off", () => {
    expect(fruits.match("Bananna", { autocorrect: false }).answerId).toBeNull();
  });

  it("recognizes sound-alike spellings", () => {
    const countries = indexFrom("Philippines|Kyrgyzstan|Switzerland|Czechia=Czech Republic|Mexico");
    expect(countries.match("filipines").canonical).toBe("Philippines");
    expect(countries.match("Kirgistan").canonical).toBe("Kyrgyzstan");
    expect(countries.match("Swizerland").canonical).toBe("Switzerland");
  });

  it("accepts a distinctive partial name only when it fits one answer", () => {
    expect(fruits.match("brussels").canonical).toBe("Brussels sprout");
    const states = indexFrom("North Dakota|South Dakota|New Mexico|North Carolina|South Carolina");
    expect(states.match("Dakota").answerId).toBeNull();
    expect(states.match("Carolina").answerId).toBeNull();
    // Dropping a meaningful word changes the answer: Mexico is not New Mexico.
    expect(states.match("Mexico").answerId).toBeNull();
    expect(states.match("South Korea").answerId).toBeNull();
  });

  it("never corrects one real answer into a different one", () => {
    const idx = indexFrom("Slovakia|Ireland|Niger");
    const known = new Set(["slovenia", "iceland", "nigeria"]);
    const isKnownAnswer = (k: string) => known.has(k);
    expect(idx.match("Slovenia", { isKnownAnswer }).answerId).toBeNull();
    expect(idx.match("Iceland", { isKnownAnswer }).answerId).toBeNull();
    expect(idx.match("Nigeria", { isKnownAnswer }).answerId).toBeNull();
    expect(idx.match("Slovakai", { isKnownAnswer }).canonical).toBe("Slovakia");
  });

  it("never guesses when a typo is equally close to two answers", () => {
    const idx = indexFrom("Austria|Australia|Iran|Iraq");
    expect(idx.match("Austrailia").canonical).toBe("Australia");
    expect(idx.match("Irad").answerId).toBeNull(); // one letter from both Iran and Iraq
    expect(idx.match("Irac").canonical).toBe("Iraq"); // sounds like Iraq
    const tied = indexFrom("Pears|Peach");
    expect(tied.match("Peacs").answerId).toBeNull();
  });

  it("does not accept short or unrelated words", () => {
    for (const s of ["Car", "Laptop", "Football", "Pen", "Apples and pears"]) {
      expect(fruits.match(s).answerId).toBeNull();
    }
  });

  it("flags an autocorrected repeat as a duplicate", () => {
    const res = validateSubmissions(fruits, ["Banana", "Bananna"]);
    expect(res[1]).toMatchObject({ canonicalAnswer: "Banana", isDuplicate: true });
  });

  it("never matches an ambiguous loose key", () => {
    const idx = indexFrom("Ice cream|Icecreams");
    // Both answers loosen to "icecream", so that loose key is ambiguous and is never used...
    expect(idx.match("icecream", { autocorrect: false }).answerId).toBeNull();
    // ...but with autocorrect on, the strictly closest spelling still wins.
    expect(idx.match("icecream").canonical).toBe("Ice cream");
    // ...while exact spellings still resolve.
    expect(idx.match("ice cream").canonical).toBe("Ice cream");
    expect(idx.match("ICECREAMS").canonical).toBe("Icecreams");
  });
});

describe("validateSubmissions", () => {
  it("flags duplicates by canonical answer, even via aliases", () => {
    const res = validateSubmissions(fruits, ["Grape", "grapes", "GRAPE", "Mango", "Car", "car"]);
    expect(res.map((r) => [r.canonicalAnswer, r.isValid, r.isDuplicate])).toEqual([
      ["Grape", true, false],
      ["Grape", true, true],
      ["Grape", true, true],
      ["Mango", true, false],
      [null, false, false],
      [null, false, true],
    ]);
    expect(countValidUnique(res)).toBe(2);
  });

  it("returns the AnswerValidationResult contract", () => {
    const [r] = validateSubmissions(fruits, ["  Watermelon "]);
    expect(r).toEqual({
      submittedAnswer: "  Watermelon ",
      canonicalAnswer: "Watermelon",
      isValid: true,
      isDuplicate: false,
    });
  });

  it("counts the six-fruit example as six valid answers", () => {
    const res = validateSubmissions(fruits, ["Apple", "Banana", "Mango", "Orange", "Grapes", "Watermelon"]);
    expect(countValidUnique(res)).toBe(6);
  });
});
