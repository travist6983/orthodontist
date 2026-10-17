# Storyboard: "The Archwire Smile"

**Locked choices:**
- **Style A, Soft line:** white teeth with a navy `#21408C` outline, brand-blue `#059DEF` square brackets with a navy slot, a navy wire, and a clear bracket at No Invisalign Surcharge.
- **The hero's office video stays** as a dimmed ambient layer with a pause button.
- **On phones, the wire runs down the left gutter.**

## Systems

**Header:** sticky, a navy bar with the white logo. Always visible on it:
- **Text Us: 855-959-4430** (sms)
- **Call or Visit Our Locations** (/contact-us/)
- a phone icon (tel:734-499-0563)
- the **new patient scheduling** button (LeadSigma)

The nav keeps the live structure (About Us, Services, Resources, Patients, Contact Us, each with its children), with link targets exactly as they are today:
- desktop (1200 px and up): dropdowns that work with hover and keyboard
- below that: a hamburger opening a full-screen menu

**The wire:** one `<path>` in a page-spanning SVG layer that sits **behind** cards, photos, videos and text, and **above** section backgrounds.
- The base route is measured from the real layout: gutters, the gaps between cards, the CTA row.
- The visible stretch is rebuilt from about 8 px samples, with a sine offset along the route's normal. Its amplitude comes from scroll progress, not time.
- The leading end is drawn down to about 65% of the viewport, so the wire grows as you read.

**The brackets:** each is a `<g>` placed on the wire with the same route function (equivalent to MotionPath's `getPositionOnPath`). Each one clicks on with a short scrubbed snap: it slides in from its card and settles at scale 1.

**Pinned stages:** only two, the hero (unthreading) and Helping People Smile (the arch closing). Everything else scrolls normally, so reading and booking are never held up.

## Chapters

The reduced-motion and mobile columns are summarized; the details are in the systems above and the notes below.

| # | Section (homepage order) | Scroll range* | Wire and smile | Text on screen (verbatim) | Technique | Reduced motion | Mobile (390 px) |
|---|---|---|---|---|---|---|---|
| 0 | Header | always | — | Logo, *Text Us: 855-959-4430*, *Call or Visit Our Locations*, the tel icon, **new patient scheduling**, the full nav | Sticky bar that shrinks after the hero | Same | Logo, Text, Call and scheduling, plus a menu button. The scheduling button stays in the bar. |
| 1 | **Hero** | 0–160vh, pinned for 60vh | **Start:** a crowded 10-tooth arch next to the H1, with the wire threaded through 3 brackets (centrals and right canine) and wavy because the teeth are uneven. **0–0.35:** the wire's end slips back through the brackets toward the left; the brackets ride along. **0.2–0.6:** the teeth fade to soft outlines that stay. **0.35–1:** the freed wire and its 3 brackets drop to the bottom-left of the stage and continue as the page wire. | **H1 Start Smiling Again**, **new patient scheduling**, **About Us** | Sticky stage with an inline SVG, scrubbed with ScrollTrigger. A light blue tint over the dimmed ambient video (poster first, video after load). | Static crowded smile, no unthreading, video paused on its poster | Smile sits under the CTAs at 70% scale. The wire drops to the left gutter. |
| 2 | **The Havens Difference**: 7 cards | 160–430vh | The wire runs down a centre spine between two staggered card columns. As each card's middle crosses about 70% of the viewport, **a bracket slides out from that card and clicks onto the wire level with it**. Order: Our Promise, We Support…, Affordable…, Made in the USA, **No Invisalign Surcharge (clear bracket)**, Education, No Impressions Ever. Waviness climbs from moderate to high. | **H2 The Havens Difference**; each card's photo, its title and **Learn More**, linking to its live anchor | Staggered grid with a centre spine. Bracket position comes from the route function, and the click is a scrubbed scale. | Each card shows a small static bracket icon beside its title (clear on No Invisalign Surcharge). The wire is drawn statically down the spine. | Single column with cards inset 44 px. The wire is in the left gutter and brackets clip on beside each card title. |
| 3 | **Our Philosophy**: video | 430–530vh | **Peak waviness** (all 10 brackets on). The wire curves into the left gutter and passes beside the video, never over it. | **H3 Our Philosophy**; the video's poster with a play button | Amplitude peak. The video uses `preload="none"` and loads on tap. | Static wire, poster plus play | Wire in the gutter, video full width |
| 4 | **New Patient?** | 530–640vh | The wire comes under the CTA row and **underlines new patient scheduling**: a short horizontal run with a slight lift, then back to the gutter. Waviness starts easing. | **H3 New Patient?**, both paragraphs; **Why Choose Us**, **new patient scheduling**, **Contact Us**; the three office photos | Route passes through a point just under the button. The underline is part of the same path. | Static | Underline under the scheduling button, which goes full width |
| 5 | **Testimonials**: video in the blue band | 640–740vh | Waviness eases. The wire runs down the right gutter, beside the video. | **H3 Testimonials**; poster plus play | Amplitude easing; video loads on tap | Static | Gutter |
| 6 | **Our Doctors** | 740–820vh | Eases further. The wire stays in the right gutter, clear of the doctors' photo. | **H3 Our Doctors**, the paragraph, **Learn More About Our Doctors** | — | Static | Gutter |
| 7 | **Adult Patients / Why Age 7?** | 820–900vh | **Nearly straight**, passing through the gap between the two cards. | Card titles and **Learn More** | Route through the gap; amplitude near 0 | Static | Gutter between stacked cards |
| 8 | **Our greatest goal… / Our Patient Is You** | 900–1000vh | Straight, then **starts curving into an arch**: a wide, shallow bow toward the centre. | **H3 Our greatest goal is to provide…**; **H3 Our Patient Is You**, its paragraph, **See Real Results**, and the photo | The route bends toward the centre line | Static | Curve toward the centre in the last 40vh |
| 9 | **Helping People Smile**: locations | 1000–1260vh, pinned for 160vh | **The signature moment.** **0–0.25:** the wire enters from the top and bends into the arch curve. **0.15–0.5:** all 10 brackets glide down the wire to their spots (the clear one at the upper right lateral). **0.4–0.55:** the ghost outlines from the hero fade in, **still crowded**, behind their brackets. **0.55–0.85:** the teeth move gradually into alignment, with the brackets riding on them and the wire relaxing from wavy to a smooth arch. **0.85–1:** the teeth fill white, a soft light sweeps across, and the location list settles beneath. | **H3 Helping People Smile**; CANTON \| CLARKSTON \| CLAWSON \| FARMINGTON \| IMLAY CITY \| ST. CLAIR SHORES \| WASHINGTON \| LAPEER, with links exactly as today (Clawson → /contact-us-2/clawson) | Sticky stage. Teeth and brackets move by `transform` only. The wire is rebuilt from bracket points (fixed sample count). No filters in motion. | The finished aligned smile drawn statically above the list | The arch scales to fit 358 px. List wraps to 2–3 lines. Pinned for 120vh. |
| 10 | **Footer** | end | Static | Facebook; the nav row (Home … Contact Us, **Website Accessibility**, **HIPAA Policy**); **Havens Orthodontics © 2026 All Rights Reserved**, **Privacy Policy**, **Sitemap**, **Marketing by Roadside Dental Marketing**; the logo | No motion | Same | Wraps; every link stays at least as large as it is today |

\* Scroll ranges are approximate at 1440×900. The real ones come from the measured layout.

## Notes

**No counted moments.** The only numbers in the copy are phone numbers and "Age 7".

**Videos:**
- Philosophy and Testimonials show their posters with an accessible play button, use `preload="none"`, and play only on tap, with native controls after that.
- The hero video is muted and decorative (`aria-hidden`), loads after `load` and idle, and has a visible pause/play toggle. It doesn't autoplay under reduced motion.

**Compliance:**
- Footer legal links keep their size or get larger. They're never animated.
- Every link target from content.json is kept, including the two 404 links and both Clawson URLs. All of these are flagged in QA.md.

**Performance:**
- The H1 and CTAs are the LCP element.
- The smile SVG is inline and small. Images below the hero are lazy-loaded.
- Fonts: Roboto 300/400/700, subset and self-hosted.
- The wire layer only rebuilds the visible stretch of the path.

## As built (2026-10-17)

These changes were made during QA. Full detail is in QA.md.
- **No scheduling underline on phones.** The stacked full-width CTAs leave no room, so the wire stays in the left gutter.
- **Contrast.** Text and text panels use brand navy. Brand blue on white or under white text fails WCAG AA, so blue stays on brackets, accents and graphics.
- **Finale entry.** The page wire ends above the arch's left end and drops straight in, instead of entering from the centre.
