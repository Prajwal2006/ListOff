import { describe, expect, it } from "vitest";
import { compact, keyVariants, nameKey, normalizeAnswer, singularize } from "@/lib/validation/normalize";

describe("normalizeAnswer", () => {
  it("treats case, padding and repeated spaces as identical", () => {
    const forms = ["New York", "new york", " NEW YORK ", "New   York", "\tnew york\n"];
    expect(new Set(forms.map(normalizeAnswer))).toEqual(new Set(["new york"]));
  });

  it("strips basic punctuation", () => {
    expect(normalizeAnswer("St. Louis")).toBe("st louis");
    expect(normalizeAnswer("Spider-Man")).toBe("spider man");
    expect(normalizeAnswer("Monsters, Inc.")).toBe("monsters inc");
    expect(normalizeAnswer("Shazam!")).toBe("shazam");
    expect(normalizeAnswer('"Apple"')).toBe("apple");
  });

  it("joins apostrophes instead of splitting words", () => {
    expect(normalizeAnswer("McDonald's")).toBe("mcdonalds");
    expect(normalizeAnswer("McDonald’s")).toBe("mcdonalds");
  });

  it("removes accents and ligatures", () => {
    expect(normalizeAnswer("São Paulo")).toBe("sao paulo");
    expect(normalizeAnswer("Crème brûlée")).toBe("creme brulee");
    expect(normalizeAnswer("Ærø")).toBe("aero");
  });

  it("keeps meaningful symbols", () => {
    expect(normalizeAnswer("C++")).toBe("c plus plus");
    expect(normalizeAnswer("C#")).toBe("c sharp");
    expect(normalizeAnswer("AT&T")).toBe("at and t");
  });

  it("drops a leading 'the'", () => {
    expect(normalizeAnswer("The Beatles")).toBe("beatles");
    expect(normalizeAnswer("the  Netherlands")).toBe("netherlands");
    expect(normalizeAnswer("Theatre")).toBe("theatre");
  });

  it("returns empty for punctuation-only input", () => {
    expect(normalizeAnswer("...")).toBe("");
    expect(normalizeAnswer("   ")).toBe("");
    expect(normalizeAnswer("")).toBe("");
  });
});

describe("singularize / compact / variants", () => {
  it("singularizes the last word only", () => {
    expect(singularize("grapes")).toBe("grape");
    expect(singularize("cherries")).toBe("cherry");
    expect(singularize("tomatoes")).toBe("tomato");
    expect(singularize("peaches")).toBe("peach");
    expect(singularize("brussels sprouts")).toBe("brussels sprout");
    expect(singularize("bananas")).toBe("banana");
  });

  it("leaves words that only look plural alone", () => {
    expect(singularize("glass")).toBe("glass");
    expect(singularize("octopus")).toBe("octopus");
    expect(singularize("paris")).toBe("paris");
    expect(singularize("bus")).toBe("bus");
  });

  it("compacts spaces", () => {
    expect(compact("spider man")).toBe("spiderman");
  });

  it("generates Saint/St and Mount/Mt variants", () => {
    expect(keyVariants("st louis")).toContain("saint louis");
    expect(keyVariants("mount everest")).toContain("mt everest");
  });

  it("normalizes lobby display names", () => {
    expect(nameKey("  Sam   Smith ")).toBe("sam smith");
  });
});
