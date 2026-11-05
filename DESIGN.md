# Auctervia site design

## Brief
- Subject: Auctervia, a gateway and evidence layer for AI agents that take real actions.
- Audience: engineering leaders and security reviewers at companies giving agents write access.
- Job: explain what Auctervia does in under a minute, then book a pilot.
- Out of scope: founders, fundraising, market sizing.
- Assumptions (placeholders): contact `hello@auctervia.com`, site URL `https://auctervia.com`.

## Concept card
```
Idea:        Every action an agent takes passes a checkpoint and leaves with a stamp.
Metaphor:    A checkpoint road: crates (actions) queue, are held at a barrier, pass or stop, get stamped.
Signature:   The gateway scene. Scroll drives one crate up to the arm, holds it, lifts the arm, stamps it.
Emotion:     Calm control. Lots of motion arriving, one precise line it cannot cross unchecked.
Motion verb: travel, hold, stamp. Things glide in, stop dead at a line, then snap.
Screenshot:  The isometric gate with one red crate held and one violet-stamped crate past the arm.
```

## Art direction
- Palette: canvas `#faf9f6`, linen `#f1eee9`, hairline `#dedbd6`, ink `#111111`, muted `#5f5f5f`,
  neutral ink controls. The shared blue/coral/amber palette appears in text/number reveal sweeps,
  fading scan/chart trails and permanent action-crate fills, never button fills.
  Allow/deny green/red only inside figures;
  third-party logos and the illustrative product UI retain their identifying colours.
- Type: Switzer 300/400/500 for display (Fontshare, self-hosted), Inter Tight for body and UI.
  Sentence case everywhere. No eyebrow labels, no uppercase.
- Shape: 8px radius on buttons, inputs and compact cards, 12px on large panels, 6px on small badges.
  Circles are reserved for avatars, status dots and window lights. Hairline borders, restrained shadows.
- Motion: one ease family (expo.out / expo.inOut), scrubbed sticky stages, GSAP ticker as the one clock
  (Lenis, ScrollTrigger, glyph canvases).
- Texture: canvas glyph fields on ink sections, glyph-dissolve bands at cream/ink breaks.

## Section flow
Minimal: theme-aware canvas ground, no WebGL beam, particles, edge lighting or glyph breaks.
Buttons have static neutral treatments: no sweep, arrow travel, hover lift or press scaling.
Buttons are capped at 36px high, including navbar and booking actions; keep targets at least 24px.
The navbar uses the hero ground and shows only the home logo and booking action. Desktop suite width
leaves 12px inside each rule, with an 800px minimum design height to keep the full sidebar visible.
Agent cursors have 22px arrows and labels ending in “agent”.
Color mode defaults to System, with explicit Light/System/Dark choices in the footer and OS change tracking.
The selector sits at the right of the footer bar. Footer link columns and legal links are temporarily hidden.
Right-click a brand logo for the icon-based SVG/PNG copy menu; left-click returns to `/`.
Bento cards and their product slices are static on hover; background glows are absent in dark mode.

1. Hero (after attio.com): capped-width nav bar, announcement pill, one-line headline, subline, two buttons,
   and the "Kestrel" product suite open below (customers table, agent chat, app library, workflow, terminal)
   with named agent cursors looping through their work. Scroll centres the suite, frosts everything but the
   chat, and lifts Rune's proposed refund out into the x-ray card.
2. X-ray (after headroom.com, same section): problem headline over the unverified card, then a three-layer
   scan reveals the card checked and sealed by Auctervia.
3. Why now (after attio.com): a statement fills in word by word, then gives way to a full-bleed chart
   (agent adoption curving up, governance flat) with the 40% and 21% stats.
4. Gateway (signature): request, hold, decide, stamp.
5. Platform bento (after spara.com): connect, evidence, re-testing, release sign-off, and the comparison
   with evals, guardrails and certification.
6. Pilot: crate climbs three plinths.
7. FAQ: six questions.
8. Neutral CTA with footer.

## Genericness check
- A generic build would be a centered hero over a gradient with three feature cards. Replaced with the
  tunnel of real agent actions and an isometric checkpoint that carries the whole page.
- Idle state: the illustrative product suite's agent cursors work; off-screen loops pause.
