# QA: Havens Orthodontics homepage concept

Tested 2026-10-17 in Chrome on macOS:
- the Vite dev server (`127.0.0.1:5175`)
- the production build served with `vite preview` (`127.0.0.1:4175`)

Test helpers (`__go`, `__lenis`) only exist when the URL has `?debug=1`. `?rm=1` forces the reduced-motion version.

## Viewports and modes

| Width | How | Result |
|---|---|---|
| 1568×779 / 1869×929 | live Chrome, every section at several scroll points | Pass |
| 1440×810 | headless screencast of the full journey (`media/havens-journey-desktop.mp4`, GIF alongside) | Pass |
| 1024 | below the 1280 px nav breakpoint: hamburger menu, Text and Call as icons, scheduling button kept | Pass |
| 390×780 / 390×844 | three iframes in Chrome, plus a headless screencast (`media/havens-journey-mobile.mp4`) | Pass |
| Reduced motion (`?rm=1`, same path as `prefers-reduced-motion`) | No Lenis, no pinning, no page wire. Crowded smile in the hero, static bracket beside each Havens Difference card title (clear one at No Invisalign Surcharge), finished aligned smile above the locations. The hero video doesn't load. | Pass |

## Storyboard vs build

**Matches the storyboard:**
- **Hero:** the wire pulls back through the 3 brackets and drops out of the stage, and the teeth fade to dashed outlines.
- **The Havens Difference:** the wire runs down the spine. Each card's bracket slides out and clicks on level with its card, and the 5th is clear. Waviness climbs.
- **Philosophy:** peak waviness in the left gutter, beside the video and never over it.
- **New Patient (desktop):** the wire runs under the CTA row and underlines **new patient scheduling**.
- **Testimonials and Doctors:** the wire is in the right gutter and eases off. The white halo keeps it readable on navy.
- **Adult Patients / Why Age 7?:** nearly straight, through the gap between the cards.
- **Our Patient Is You:** the wire bows toward the arch's entry point.
- **Finale (pinned):** the wire drops into the arch's left end and 10 brackets glide on left to right. The crowded ghost teeth appear, then **move gradually into alignment** as the wire relaxes, fill in, and catch a light sweep. The location list sits beneath at all times.

**Deviations:**
- **Phones don't get the underline under new patient scheduling.** With the buttons stacked full width there's no room for a horizontal run; the wire stays in the left gutter.
- **Contrast fixes** (see Accessibility). Text is navy instead of brand blue, and text-bearing bands (Testimonials, Our Doctors, the goal statement, Helping People Smile) are navy instead of blue. Brand blue is still used for brackets, the heading bracket glyphs, borders, focus rings, blobs and gradients. **No new hues.**

## Performance

Lighthouse 12.8.2 against the production build, after the fixes listed below:

| Run | Perf | A11y | Best practices | LCP | FCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| Mobile #1 | 99 | 100 | 100 | 1.81 s | 1.5 s | 0 | 0 ms |
| Mobile #2 | 99 | 100 | 100 | 1.84 s | 1.5 s | 0 | 0 ms |
| Mobile #3 | 99 | 100 | 100 | 1.84 s | 1.5 s | 0 | 0 ms |
| Desktop | 100 | 100 | 100 | 0.4 s | — | 0.001 | 0 ms |

**The LCP element is the H1** "Start Smiling Again", as required. It's never the SVG or a video.

**SEO scores 58 on purpose.** The concept ships `noindex, nofollow` plus a `robots.txt` that blocks crawlers, so it can't compete with the live site.

**Frame rate:**
- A linear full-page scroll at 1869×929 rendered 1,994 frames. That's an average of 13.3 ms per frame (75 Hz display), a 99th percentile of 15.4 ms, and **0 frames over 20 ms**.
- **Finale alone:** 451 frames, 0 over 20 ms, worst 15.3 ms.
- **Finale at 4× CPU throttle** (headless): 495 frames, a 99th percentile of 16.8 ms (60 fps), 2 frames over 20 ms, one of them the first frame after the jump.

**What fixed the budget along the way:**
- **Startup does less.** Only the hero smile builds at first paint; the page wire and the finale build in `requestIdleCallback`. This cut a 560 ms task down to 0 ms of blocking.
- **Below-the-hero images load through an IntersectionObserver** (900 px margin) instead of native lazy loading. On a fast connection, native lazy loading fetched the card photos before first paint.
- **Videos:**
  - The hero video poster loads after first paint.
  - The hero video itself is re-encoded muted at 1280 px (7.6 MB → 2.2 MB) and loads in idle time.
  - Philosophy and Testimonials use `preload="none"` behind a poster with a play button. The live site preloads 25 MB.
- **CSS is inlined.** Roboto 300/400/500/700 is subset (about 12 KB each), and 300/700 are preloaded.
- **The wire layer is cheap to redraw.** Only the visible stretch of the path is rebuilt, from 6 px samples, and only when the scroll position or amplitude changes. No filters animate.

## Content parity (checked by script against `content.json`)

**Links:** all 58 unique links on the page match `content.json`, with none missing. That covers:
- the header and nav, including the two 404 targets kept as-is
- the Havens Difference anchors
- every CTA (including the two **new patient scheduling** LeadSigma links)
- `sms:+18559594430` and `tel:734-499-0563`
- the location list (Clawson → `/contact-us-2/clawson`)
- the footer nav
- legal links and Facebook

**Copy:** every string in `content.json` appears verbatim. The only change is the duplicate card titles (front plus hover overlay on the live site), which are shown once.

**Media:** all three videos are present:
- the hero ambient video, muted, decorative, with a pause toggle
- Philosophy, with an accessible play button and native controls after that
- Testimonials, same as Philosophy

Every existing photo appears where it appears today. No new people imagery was added; all smile art is original SVG.

**Legal and compliance:** Website Accessibility, HIPAA Policy, Privacy Policy, Sitemap, "Havens Orthodontics © 2026 All Rights Reserved" and "Marketing by Roadside Dental Marketing" are all in the footer and never animated. They're **more** prominent than today:
- White/light text on the footer gray. Live, they're navy on gray at about 1.7:1.
- The legal line is 13 px; live it's 12 px.

## Accessibility

- **Contrast:** the live palette fails WCAG AA in several places.
  - Gray body text `#868686` on white is about 3.6:1. It's now `#5A5A5A` (6.9:1).
  - White on `#059DEF` is 2.97:1. Primary buttons are now navy with white text, and text panels are navy.
  - Blue H2/H3 on white is 2.97:1. Headings are now navy, with a small blue bracket glyph.
- **Structure:** one H1. H2 and H3 follow the live page's levels.
- **Decoration hidden from assistive tech:** the wire layer, the smile SVGs and the hero video are all `aria-hidden`.
- **Keyboard:**
  - The nav dropdowns open on hover and focus, have toggle buttons with `aria-expanded`, and close on Escape and focus-out.
  - The mobile drawer mirrors the nav structure as accordions.
  - There's a skip link and a visible 3 px focus ring.
- **Labels:** the icon-only phone link has `aria-label="Call 734-499-0563"`. The video play buttons name the video and its length. The hero video has a visible pause/play control.
- **Forms:** there's no form on the homepage. Scheduling is an external LeadSigma link (live). The contact form lives on /contact-us/ and isn't part of this page, so there's no endpoint TODO.

## Data conflicts: please confirm with the client

1. **Locations:**
   - The nav lists **9** offices: Canton, Clarkston, Imlay City, St. Clair Shores, Washington, **Romeo**, Farmington, Clawson, Lapeer.
   - The "Helping People Smile" list shows **8**, with no Romeo.
   - Both are rendered exactly as they are today.
2. **Clawson has two URLs.** The nav uses `/contact-us-2/clawson-2/`; the location list uses `/contact-us-2/clawson`, which currently redirects to `clawson-2`.
3. **Two nav links return 404 today:**
   - **Meet the Doctors** → `?page_id=1429`. The homepage's "Learn More About Our Doctors" goes to `/about-us/meet-the-doctors/`, which works.
   - **Romeo** → `?page_id=2396`.
   - Both are kept exactly as the brief required.
4. **Copyright year:** the live footer reads "© 2026", so it's probably generated dynamically. It's static text here.

## Known limitations

- **No real-device check.** Not tested on a physical iPhone or Android, or in Safari or Firefox. Lenis, sticky positioning and SVG all work there, but give it a quick pass on a phone before the pitch.
- **Without JavaScript,** below-the-hero photos don't load, because they use observer-driven loading. All text, links and videos still work.
- **Very short desktop windows** (under about 640 px tall) squeeze the hero smile. It scales down but stays legible.

## Update 2026-10-17 (polish pass)

**Story changes:**
- **The smile has a face.** The teeth now sit inside a simple line-art mouth: navy outline, white lips, tooth tops tucked under the upper lip, so no gums are drawn.
  - In the hero it's a relaxed, slightly crooked smile.
  - In the finale, the mouth is waiting from the first frame as a dashed outline, firms up, and **breaks into a big smile with dimples** as the teeth finish aligning.
  - "Start Smiling Again" now pays off at "Helping People Smile".
- **The wire runs inside the mouth.** In both hero and finale it's drawn under the lips, so it reads as going in at the corner of the mouth and slipping out of it.

**Wire and bracket details:**
- The wire is 3 px navy with a thin white highlight, so it reads as metal rather than a pen line.
- Each Havens Difference bracket gives off a soft blue **ping** ring as it clicks on.
- Hovering or focusing a card makes its bracket on the wire pop and brighten.

**Clean-up:**
- "The Havens Difference" heading moved into the left column, so the wire runs straight down the centre instead of looping around it.
- The finale stage no longer opens blank or shows a stray wire stub. Its wire only appears once the page wire reaches it.
- Smoother approach curve into the finale. Tighter section spacing. Pinned finale 260vh → 235vh.
- Headings, copy and photos fade up gently as they enter. CTAs and cards are excluded so the wire's measurements stay exact.
- The hero has an inline SVG blob in the brand's own motif (blob, hatching, doodles) behind the smile. It's not a raster image, so it stays sharp and can't become the LCP element.

**Re-measured:**

| Check | Result |
|---|---|
| Lighthouse mobile ×2 | Perf 99, A11y 100, Best practices 100, LCP 1.81–1.84 s (H1), CLS 0, TBT 0 |
| Lighthouse desktop | 100 / 100 / 100, LCP 0.4 s (H1) |
| Finale at 4× CPU throttle | 503 frames, 99th percentile 16.8 ms, **0 frames over 20 ms** |

The recordings in `media/` were re-captured.
