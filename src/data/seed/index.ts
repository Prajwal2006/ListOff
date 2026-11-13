import type { CategorySeed } from "@/lib/seed/types";
import { animals } from "./animals";
import { entertainment } from "./entertainment";
import { food } from "./food";
import { geography } from "./geography";
import { popCulture } from "./pop-culture";
import { science } from "./science";
import { technology } from "./technology";
import { sports } from "./sports";
import { general } from "./general";
import { culture } from "./culture";
import { oddsAndEnds } from "./odds-and-ends";

export const allCategories: CategorySeed[] = [
  ...food,
  ...geography,
  ...animals,
  ...entertainment,
  ...popCulture,
  ...science,
  ...technology,
  ...sports,
  ...general,
  ...culture,
  ...oddsAndEnds,
];
