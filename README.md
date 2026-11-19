# Leonida Trophy Guide — GTA VI

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/ukyo9k/gta6-trophy-guide-01/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/ukyo9k/gta6-trophy-guide-01/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

An offline, open-source guide and tracker for all **55 PlayStation 5 trophies**
of Grand Theft Auto VI — 1 platinum, 2 gold, 6 silver and 46 bronze — built for
the [make.fun bounty gta6-trophy-guide-01](https://make.fun/c/gta6-trophy-guide-01).

## What it does

- **Tracker** — every trophy with its official name, description and grade,
  as PlayStation publishes them. Tick trophies off as you earn them; progress
  is saved in your browser (localStorage) and can be exported to a file and
  imported back.
- **Filters** — by kind (story, missable, collectibles, activities), by grade,
  and by free-text search, so any trophy and its guide is a glance away.
- **Spoiler setting** — hides the names and descriptions of story trophies
  until you earn them.
- **Roadmap to the platinum** — four ordered stages built from the official
  descriptions, with progress per stage.
- **Missables flagged** — every trophy that can only be earned in a
  one-time story moment or with a specific character or partner present.
- **A guide for each trophy, in our own words, with its sources named** —
  the official list on Exophase for name, description and grade, PSNProfiles
  for PSN's progress counts, and plain advice drawn from the official
  description where a place or step is not yet pinned down. Where a step is
  not confirmed in the game, the guide says so instead of inventing it.

## Open it offline

No build step, no network. Serve `app/` with any static server and open
`index.html`:

```sh
node serve.ts        # serves app/ at http://localhost:8080
# or: python3 -m http.server --directory app 8080
```

Then open http://localhost:8080 in a desktop browser. Everything the page
loads lives under `app/`; with the network off it still works.

Handy deep links (also used for the screenshots):

- `?seed=13` — start with 13 trophies earned, for a first look
- `?view=roadmap` or `?view=missables` — open on that tab
- `?spoilers=on` — turn the spoiler setting on
- `?trophy=17` — open the guide for a trophy by its number

## Sources

- Official trophy names, descriptions and grades:
  [Exophase — Grand Theft Auto VI trophies](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/)
- PSN progress counts where PlayStation tracks one:
  [PSNProfiles — Grand Theft Auto VI](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi)
- Every guide is written for this entry, in our own words. No Rockstar logo
  or official artwork is used anywhere; the look is our own.

## Layout

- `app/` — the guide itself (`index.html`, `style.css`, `app.js`,
  `store.js`, `views.js`, `data/trophies.json`)
- `screenshots/` — renders of the guide running in a browser
- `main.ts` — hands the entry in: copies `app/` and `screenshots/` to the
  output directory and writes `dossier.json` with
  `vendor/makefun-frontend.ts`
- `serve.ts` — a small static server for local testing

## License

MIT — see [LICENSE](LICENSE).
