# Knowledge base: sources and licensing

The ListOff seed data is a hand-curated list of **facts** (names of countries, elements, films, players,
dishes and so on). It was put together from general knowledge for this project; it was not scraped
or copied from any single database.

- Individual facts and short names are not copyrightable. No prose, descriptions, lyrics or other
  creative text from third-party sources is included.
- Lists that change over time (sports teams, rosters, film releases, alliance membership such as
  EU-27 and NATO-32) reflect the state of the world at the end of 2025.
- For authoritative cross-checking, public references such as the UN member state list, IUPAC
  element names, IMDb/Box Office Mojo film listings and league websites are the natural sources.
  Where you extend the data from a CC BY-SA source such as Wikipedia, credit it in this file.

## Quality checks

Run `npm run data:stats` before committing data changes. It reports totals and flags duplicate
answers, alias collisions, and answers that would become ambiguous under loose matching
(spaces removed / singularized), plus topics too small to be dealt in a game.
