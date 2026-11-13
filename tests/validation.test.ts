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
    for (const s of ["Car", "Laptop", "Football", "Carrot", "appl", "bananaz", ""]) {
      expect(fruits.match(s).answerId).toBeNull();
    }
  });

  it("does not fuzzy-match misspellings", () => {
    expect(fruits.match("Mangoe").answerId).toBeNull();
    expect(fruits.match("Oragne").answerId).toBeNull();
  });

  it("never matches an ambiguous loose key", () => {
    const idx = indexFrom("Ice cream|Icecreams");
    // Both answers loosen to "icecream", so that loose key is ambiguous and must not match...
    expect(idx.match("icecream").answerId).toBeNull();
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
