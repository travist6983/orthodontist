# Story validation: "The Archwire Smile"

The story is fixed. This document checks it against the real homepage content and against clinical reality, proposes a visual style, and picks the signature moment.

## The hero system, top to bottom

**The arch:** 10 upper teeth (second premolar to second premolar), in a stylized front view.

**The brackets:** three are on the wire from the start, on the two centrals and the right canine. Seven more attach during The Havens Difference, one per card.

| # | Section (homepage order) | Wire | Smile |
|---|---|---|---|
| 1 | **Hero**: "Start Smiling Again" | Starts threaded through 3 brackets on a crowded arch. On scroll, the end of the wire slips out of the last bracket and drops into the page as the scroll path. | Crowded, with some teeth rotated, stepped or overlapping. As the wire leaves, the teeth fade to soft outlines that stay in the hero. |
| 2 | **The Havens Difference**: 7 cards | Runs down the gutter beside the cards. As each card enters, one bracket clicks onto the wire level with that card. The 5th, at *No Invisalign Surcharge*, is a **clear bracket**. | — |
| 3 | **Our Philosophy**: video | **Waviness peaks here**, now that all 10 brackets are on the wire. It passes beside the video and never over it. | — |
| 4 | **New Patient?** | Runs under the CTA row and briefly underlines the **new patient scheduling** button. It's a drawn line only; the button itself never moves or hides. | — |
| 5 | **Testimonials**: video | Waviness eases. Passes beside the video in the blue band and never crosses it. | — |
| 6 | **Our Doctors** | Waviness eases further. Stays in the gutter, away from the doctors' photo. | — |
| 7 | **Adult Patients / Why Age 7?** | Nearly straight, passing in the gap between the two cards. | — |
| 8 | **Our greatest goal… / Our Patient Is You** | Starts curving into an arch shape. | — |
| 9 | **Helping People Smile**: locations | **The signature moment.** The wire closes into the arch and its 10 brackets slide into their final spots. The ghost teeth from the hero rematerialize behind the brackets, **perfectly aligned**. The 8-location list sits directly beneath. | The same 10 teeth, aligned. |
| 10 | **Footer** | Static. All legal links and the Roadside credit stay put. | — |

## Conflicts, and how each one is resolved

**1. In real treatment, brackets go on the teeth first and the wire goes in second.** The story has the wire collecting brackets.
- **Fix:** keep it as a clear metaphor: the wire "collects the Havens Difference." Each bracket comes to rest on the **front surface of a tooth**, with the wire passing through its slot.
- The visuals never show a bracket floating on a bare wire in the finale. The wire only becomes "the arch" once the teeth are behind it.

**2. Why waviness peaks at Philosophy instead of in the hero.**
- This is clinically right. A flexible archwire is most deflected right after it's tied into every bracket on crowded teeth, then relaxes as the teeth move.
- So: moderate in the hero (3 brackets), **peak once all 10 are engaged**, then it eases section by section. The teeth only move in the finale, and gradually (about 1.5 screens of scroll), never snapping.

**3. A metal-wire story could exclude Clear Braces and Invisalign® patients.**
- **Fix:** the bracket at **No Invisalign Surcharge** is clear (translucent with a blue edge), and it stays visible in the finished arch. The finale shows a mixed arch of metal and clear.

**4. Made in the USA.**
- No red, white or blue flag motif is added. That card's existing photo (a flag) already appears on the live site and stays as-is. Its bracket is a normal bracket.

**5. Faces in photos and videos.** Card photos, the doctors' photo, the testimonial video and the Our Patient photo all show real people.
- **Fix:** the wire is routed through gutters and the gaps between sections and is **never drawn over a photo or video**. On tight screens it goes behind them.
- No new people imagery is added; every smile is an original illustration.

**6. The 8 locations vs the 10-tooth arch.**
- **Fix:** teeth are **not** mapped to locations. That would invite counting, and the location data is itself in conflict (8 in the list vs 9 in the nav, two Clawson URLs).
- The list renders exactly as it is today and is flagged in QA.md.

**7. "Age 7" and no counters.**
- Nothing is counted on screen. There's no "bracket 3 of 7" style text.
- The arch shows permanent teeth (stylized), not a 7-year-old's mixed teeth. That's acceptable because it's an illustration, not a diagnosis.

**8. There's a third video.** The live hero has a muted background video of the office (`havens-hero-home.mp4`). The brief didn't list it.
- It must survive. **Your call, in the questions:** keep it as a softly dimmed ambient layer behind the smile (with a pause button), or show its poster with a tap-to-play button.
- Either way it loads after the H1 and CTAs, so it never becomes the LCP element.

**9. LCP.** The H1 and the **new patient scheduling** button are real text and paint first. The smile SVG is inline and lightweight, and the background video defers.

**10. Gums and anatomy.** No gums are drawn.
- Teeth hang from an implied gum line with flat tops, and the wire and brackets sit mid-crown.
- No roots, no blood, no close-ups.

**11. Mobile (390 px).** The wire runs down a single **left gutter**, about 20 px in, and brackets clip on beside each card.
- In the finale the arch scales down to fit the full width.
- The crowded hero smile sits under the CTAs, with scheduling, Text and Call visible above the fold.

**12. Reduced motion.**
- The hero shows the crowded smile, and the finale shows the aligned smile.
- Each Havens Difference card shows its bracket as a static icon beside its title.
- No scroll-linked motion at all.

## Visual style directions

Sketches are in `docs/sketches/` (style-A.svg, style-B.svg, style-C.svg and styles.png). Each shows the crowded hero arch and the aligned finale arch.

- **A · Soft line (recommended).**
  - Teeth: white with a 2 px navy `#21408C` outline and rounded corners.
  - Brackets: rounded brand-blue `#059DEF` squares with a navy slot.
  - Wire: a 2.6 px navy line.
  - It's friendly and illustrative, like a children's book drawn with a technical pen. It reads clearly on white and on the light blue tint, and **the blue bracket square echoes the blue square in the Havens logo.**
- **B · Soft fill.**
  - Teeth: white with a soft blue-tint gradient and no outline.
  - Brackets: steel-gray neutral with a darker slot.
  - Wire: a silver gradient.
  - The most realistic of the three, and still stylized. It's quieter, but it reads more clinical and the brackets look like generic hardware.
- **C · Logo mark.**
  - Teeth: solid white on the brand-blue band.
  - Brackets: square navy marks.
  - Wire: a heavy navy line.
  - Bold and graphic, and it ties straight to the logo. The catch: it only works on blue backgrounds, so it struggles on white sections.

## The signature moment

**Helping People Smile: the arch closes and the smile comes back aligned.**

How it plays out:
- A sticky stage pins for about 1.5 screens.
- The wire's final segment bends from nearly straight into the arch curve, and the 10 brackets glide to their final spots.
- The ghost outlines from the hero fade back in as solid teeth, already sitting behind the brackets.
- The location list then rises into place beneath the smile.

How the frame rate is protected:
- **The finished arch is precomputed.** Each tooth and bracket is a `<g>` moved only by `transform`, with opacity cross-fades.
- **No filters, blur or masks animate.** Any glow is a static gradient.
- **The wire `d` is rebuilt from a fixed 120-point polyline.** It only updates when scroll changes, with no per-frame layout reads.
- **Only the visible portion of the long wire is redrawn.** The page-length path is split into the "travel" path (static, revealed with dashoffset) and a short "active" segment near the viewport, which carries the waviness math.
- **Performance checks:** Chrome's Performance panel on the finale, a 4× CPU-throttle pass, and a frame-time capture like the last two builds (target: 0 frames over 20 ms on desktop).

**Runner-up moment:** each Havens Difference bracket clicking onto the wire, with the clear bracket at No Invisalign Surcharge as a small surprise.

No Three.js. Everything is SVG and CSS.
