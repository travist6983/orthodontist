# Research: Havens Orthodontics homepage redesign

The client site was inspected 2026-10-17 in Chrome and from raw HTML. Screenshots are in `recon/` (1440 px and 390 px).

The four inspiration sites were inspected in Chrome the same day: tech detection via JS, scroll passes and screenshots.

## The client

**What they deliver:** braces, Clear Braces and Invisalign® for children, teens and adults, across Metro Detroit and Thumb-area offices:
- Canton, Clarkston, Clawson, Farmington, Imlay City, St. Clair Shores, Washington and Lapeer
- the nav also lists Romeo, which links to a 404

It's a family practice started by two brothers, Dr. Aaron and Dr. David Havens. Their training is from the University of Michigan and Harvard.

**Who books:**
- **Parents of kids and teens.** The homepage features "Why Age 7?", and the AAO recommends a first check-up at 7.
- **Adults** who want to improve their smile ("Adult Patients", "whether you are 7 or 70").

**What buyers care about** (from their own copy):
1. **Trust and expertise:** "Education", "Our Doctors", "Our Promise", the testimonials video.
2. **Comfort:** "No Impressions Ever" (iTero digital scanner instead of goopy impressions), "most individualized, comfortable, and effective".
3. **Cost and financing:** "Affordable & Flexible Finances" (insurance, in-office plans, CareCredit), "No Invisalign Surcharge", a free first visit ("Your first visit is complimentary"), discounts for military, police, fire and EMS.
4. **Choosing between aligners and braces:** Invisalign®, Clear Braces and metal braces all offered. The story has to feel inclusive of clear options.
5. **A convenient location:** 8–9 offices, with the "Helping People Smile" list just before the footer.
6. **Values:** "Made in the USA" braces, a family focus.

**Conversion path:**
- The external LeadSigma booking link ("new patient scheduling"), shown in the hero and again in New Patient.
- Text (`sms:+18559594430`) and phone (`tel:734-499-0563`).
- There's no form on the homepage.

**Brand:**
- Brand blue `#059DEF`, navy `#21408C`, gray body text `#868686`, footer `#474142`, mist `#D2DDE3`.
- Roboto (300 body and headings, 700 H1), uppercase headings, square-cornered buttons.
- The logo is a blue square crossed by two hand-drawn strokes under a white script "HavenS". **It already reads like a bracket with a wire through it.** That's the visual hook for this story.
- There are also blue blobs with diagonal hatching.

**Issues on the live site that matter to the build:**
- **Text overflows the screen on phones** (the H1 is cut off at 390 px).
- **Two nav links 404:** Meet the Doctors `?page_id=1429` and Romeo `?page_id=2396`.
- **The location list and the nav disagree.**
- **Two videos preload in full:** `preload="preload"`, 13 MB + 12 MB.
- **The hero background video** is 7.6 MB at 1080p, with audio, set to autoplay muted.

## Inspiration sites: techniques to borrow

### unitedcarriers.com (primary)
*Webflow, Lenis, 32k px of page, 26 sticky/fixed elements, six canvases.*
1. **Pinned stages.** Sticky wrappers (`home-service-stick` first/second/third) inside tall sections turn scroll distance into scene time.
2. **One vehicle carried through every chapter.** Crane → truck → ship canvases are scrubbed by section progress, so the cargo reads as one continuous journey.
3. **A readout tied to scroll speed** (`home-service-speed`).
4. **A preloader that turns into the hero:** a dotted map becomes a WebGL globe with route arcs. **Arcs drawn along a path are the closest cousin of our archwire.**
5. **The page's colour shifts with scroll position,** a gradient tied to where you are in the story.

### drone.riotters.com
*Next.js, Three r183 full-screen canvas, Lenis.*
1. **One persistent object on a fixed layer.** Its position and rotation are keyed to section progress; it glides and banks between sections.
2. **Word-by-word scroll reveal:** words go from 20% to 100% opacity.
3. **Sticky split layout:** text column on one side, object on the other.
4. **Hairline grid and numbered section pills** for an engineered feel.

### cerebrium.ai
*Lenis + swup, fixed WebGPU/Three background.*
1. **A fixed animated background behind all content** (ribbons that react to scroll).
2. **A white rounded-top sheet that slides over a dark hero:** a soft chapter break.
3. **Two-tone headlines.**
4. **Infinite logo marquee.**
5. **Sticky label column.**

### apple.com and the AirPods Pro 3 page
*AnimSystem `data-anim-keyframe`, 16 videos.*
1. **A sticky local nav with a persistent Buy button.** This is the model for keeping "new patient scheduling" and Text/Call always visible.
2. **Keyframes keyed to element position,** so animations reverse when you scroll back up.
3. **Videos with posters and an explicit play/pause control.** Inline video never autoplays with sound.
4. **Media pinned while captions change.**

## Techniques for the Archwire Smile

**The wire:**
- One `<path>` spans the document in an absolutely positioned SVG.
- Scroll reveals it with `stroke-dashoffset`, ScrollTrigger scrubbing the whole page height (UC route arcs).
- **Waviness is computed, not morphed.** The wire is a base route plus a sine offset along its normal. The offset's amplitude comes from scroll progress (peak just after all seven brackets are engaged, then decaying), and the `d` is rebuilt from about 220 sample points only when it changes. No MorphSVG needed, and it stays cheap.

**The brackets:**
- MotionPathPlugin `getPositionOnPath` places each bracket on the wire at its card's stage boundary.
- Each one "clicks" on with a short scale and snap, scrubbed and reversible.

**The hero:**
- A sticky stage pins the crowded smile while the teeth ghost to outlines and the wire unthreads.

**The finale:**
- A sticky stage pins the arch formation.
- Teeth move only by `transform`, with opacity cross-fades. No filters in motion.
- The ghosted teeth come back as the same `<g>` nodes, now on their aligned positions.

**Elsewhere:**
- The sticky header keeps scheduling, Text and Call visible.
- Videos show their poster with a play button and only load on tap (`preload="none"`).
