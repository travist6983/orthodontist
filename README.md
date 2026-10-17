# Havens Orthodontics: homepage concept ("The Archwire Smile")

A scroll-driven redesign concept for [havensorthodontics.com](https://havensorthodontics.com).

**Concept preview only.** It isn't affiliated with or published by Havens Orthodontics, and it's marked `noindex`. All copy, photos, videos and logos belong to the client.

## The story

The page's scroll path is an orthodontic archwire:
1. It unthreads from a crowded smile in the hero.
2. It collects a bracket beside each Havens Difference card. The one at No Invisalign Surcharge is a clear bracket.
3. It's at its waviest once every bracket is on, then relaxes section by section.
4. It closes back into the arch above the location list, where the same teeth glide into alignment.

## Run it

```bash
npm install
npm run dev      # http://127.0.0.1:5175
npm run build    # outputs dist/
```

**Query flags:**
- `?rm=1` forces the reduced-motion version.
- `?debug=1` exposes `__go(selector, progress)` for QA.

## Files

| File | What it is |
|---|---|
| `RESEARCH.md` | Client and inspiration research |
| `STORY_VALIDATION.md` | Story validation, with style sketches in `docs/sketches/` |
| `STORYBOARD.md` | Approved storyboard |
| `QA.md` | Test results, open issues, and the data conflicts to confirm |
| `design-tokens.json` | Colours and fonts |
| `content.json` | Verbatim homepage content, links and media |
| `src/smile.js` | Teeth, brackets and arch geometry |
| `src/main.js` | Hero unthreading, page wire, finale, videos |
| `src/ui.js` | Nav dropdowns and mobile drawer |
| `media/` | Journey recordings: desktop MP4 + GIF, mobile MP4 |

Pushing to `main` deploys to GitHub Pages through `.github/workflows/pages.yml`.
