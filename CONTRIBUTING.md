# Contributing to the VettID Playbooks

## Voice and tone (the rules that matter)

**Voice:** factual, positive, fun. Snark is permitted and encouraged with one
absolute rule: **aim the snark at the surveillance economy, never at the
reader.**

- ✅ "Your apps have been gossiping about you. Time to end the group chat."
- ✅ "That flashlight app does not need your contacts. It's a flashlight."
- ❌ Anything implying the reader should have known better, or is late,
  careless, or naive.

**Placement:**

- Voice lives in **framing**: article intros, playbook openings, recaps, card
  copy, coach prompts.
- **Play steps are precision zones.** No jokes inside numbered steps.
  Imperative, exact, boring on purpose.
- Fear is a tool we don't use. State risks factually with real-world
  grounding. No countdown urgency.
- "You," never "we'll handle it." The coach never touches your phone; every
  play, the reader runs themselves.
- Plain words beat industry words everywhere a user can see: "someone watching
  your traffic," not "adversary-in-the-middle."

**Editorial boundary:** education content teaches; [/why](https://vettid.org/why)
argues. If a draft article starts arguing, move that text to /why or cut it.
The test: if the /why link were deleted, would the educational content still
stand complete?

**The stalkerware path is serious.** No jokes anywhere on it; safety notes
lead; observation before removal; flag which plays a monitoring party can
detect.

## Content mechanics

- Articles follow three H2s: **What it is → Why it's a problem → What it
  costs**. The middle section carries the *mechanism*; "What it costs"
  carries the *real-world stakes*. The auto-derived playbook bridge is the
  article's only call to action — if you find yourself writing imperative
  advice ("turn on…", "switch to…") in an article, that content belongs in
  a playbook.
- Frontmatter schemas are enforced at build time (`src/content/config.ts`).
- Concern tags live in `src/data/concerns.json` — adding one means updating
  exactly that file plus tagging content.
- Cross-links (article ⇄ playbook, coach results) derive from concern tags.
  Never hand-wire them.
- Playbook plays use `<ol class="plays">` with per-play `<strong>` title,
  `<span class="path">` tap path, and `<p class="did">` explanation.
- `os_verified` / `verified_date` must reflect a real device test. Staleness
  over 6 months shows a banner automatically — that's a feature.

## Workflow

Branch → PR → CI (gitleaks, build, validation) → merge. Deploys are manual:
`npm run deploy` (requires AWS credentials for the vettid.org account).
