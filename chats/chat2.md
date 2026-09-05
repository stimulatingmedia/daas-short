# Scene edits and revisions

_Started 2026-06-16 12:42 UTC_

---

## User

Let's remove "Art Director" from the first scene. Change "Designer" to "Graphic Designer". 

On the 2nd scene, edit "Slide deck" to "polish slide deck". Add "Create infographic", Add "Quarterly Business Report". Add "Create pitch deck"

Switch "you settle for "good enough" with "Let designers design." to improve flow.

## Assistant

_[tool: read_file]_

_[tool: read_file]_

I'll make these edits to the animation scenes in `animations.jsx`.

_[tool: str_replace_edit]_

All four edits are in. Summary of changes:

- **Scene 1 (The Problem):** removed "Art Director", renamed "Designer" → "Graphic Designer".
- **Scene 2 (Buried):** "Slide deck" → "polish slide deck"; added "Create infographic", "Quarterly Business Report", and "Create pitch deck" to the falling task tags.
- **Headline swap:** "Let designers design." now lands on the compromise scene and "You settle for 'good enough.'" follows on the next.

One thing to flag: the compromise scene still has the eyebrow **"SO YOU SETTLE"** above the now-swapped headline, so "SO YOU SETTLE → Let designers design." reads a little oddly. Want me to adjust those eyebrows to match the new headline order?

_[tool: ready_for_verification]_

Done. The changes are live and the file loads cleanly. Let me know if you'd like me to fix up the eyebrow text on the swapped scenes to match the new flow.

## User

you only switched the headlines. Switch the whole scenes.

## Assistant

You're right — let me swap the entire scenes (timing windows and all content), not just the headline text.

_[tool: str_replace_edit]_

Now the full scenes are swapped: **"Let designers design."** (with the gains/losses chart) plays first at 14–21s, and **"You settle for 'good enough.'"** (with the "SO YOU SETTLE" eyebrow and line graph) follows at 21–27s. Each scene moved intact — eyebrows, graphics, and subtext all travel with their headline.

_[tool: ready_for_verification]_

Done — scenes fully swapped and loading cleanly.

## User

In the first scene, update the total yearly amount displayed. 


In the scene "So you settle".... remove "So you settle". Update to "Don't settle for good enough." 

review every single scene and update content to make the flow and message hit it's mark.

## Assistant

Let me review the current scenes and apply coherent updates. First, let me note the role salaries now total $380K (Graphic Designer $95K + Motion Designer $110K + Video Editor $90K + Illustrator $85K), so the displayed total is stale.

_[tool: str_replace_edit]_

Reviewed all six scenes and tightened the arc. Here's the flow now and what I changed:

1. **The Problem (0–7s)** — total corrected to **"= $380,000 / year"** to match the four roles shown (Graphic Designer, Motion Designer, Video Editor, Illustrator).
2. **Meanwhile (7–14s)** — best people buried in busywork; left intact.
3. **Let designers design. (14–21s)** — gains/losses chart; left intact (no eyebrow).
4. **Don't settle for "good enough." (21–27s)** — removed the "SO YOU SETTLE" eyebrow, raised the headline to fill the space, and updated the subtext to **"That gap is the growth you're leaving on the table."** so it pays off the potential-vs-shipped graph.
5. **The Solution (27–39s)** — eyebrow trimmed "THE BEST SOLUTION" → **"THE SOLUTION"** to parallel "THE PROBLEM".
6. **CTA (39–45s)** — "maxes out its full potential" → **"can reach its full potential"** for cleaner phrasing.

The two imperative scenes (3 & 4) now both run eyebrow-free, giving them a consistent, punchier rhythm leading into the solution.

_[tool: ready_for_verification]_

All updates are in and the file loads cleanly. The verifier is checking the scenes in the background — I'll flag anything it catches.

## User

Provide the voice over text I can use to accompany this.

## Assistant

Let me pull the exact scene content and timings so the VO maps cleanly.

_[tool: grep]_

Here's a voiceover script timed to each scene. Pacing is roughly natural speaking rate (~2.5 words/sec), with light pauses so the lines land as the on-screen text resolves.

---

**SCENE 1 — The Problem (0:00–0:07)**
> "Building a full creative team — a graphic designer, motion designer, video editor, illustrator? That's nearly four hundred thousand dollars a year. A whole team most companies just can't justify hiring."

**SCENE 2 — Meanwhile (0:07–0:14)**
> "So your best people get buried in busywork. Resizing, reformatting, one more 'quick' fix… and the design ends up with whoever happens to be free."

**SCENE 3 — Let designers design (0:14–0:21)**
> "Imagine letting designers design — and letting the rest of your team do what they actually do best."

**SCENE 4 — Don't settle (0:21–0:27)**
> "Don't settle for 'good enough.' Because that gap, between what you ship and what you could? That's the growth you're leaving on the table."

**SCENE 5 — The Solution (0:27–0:39)**
> "Meet Design as a Service. Human creativity at AI speed. Instantly scale your output — presentations, email campaigns, infographics, video, and more — with a simple client portal, managed assets, no hourly overages, and one flat, predictable bill."

**SCENE 6 — CTA (0:39–0:45)**
> "We simplify design operations, so your team can reach its full potential. Visit us — or just drop us a DM."

---

**Notes:**
- Scene 5 is the densest at ~12 seconds — it's readable but tight. If your VO artist runs long, drop "with a simple client portal, managed assets" to give it air.
- I can tighten any line to an exact word count if you have a fixed read speed, or rewrite in a different tone (punchier, more conversational, more corporate). Want me to also embed these as `data-vo` notes on each scene in the file?

## User

We want to highlight the system we've build behind it along with our AI workflow, how can we incorporate that in the last scenes? make adjustments as needed.

## Assistant

Let me read the solution and CTA scenes in full so I can weave in the system + AI workflow story.

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

Good — the file already has a dedicated **system + AI workflow** scene built in, but extending the timeline to 56s left two timing bugs that would break the final scenes. Let me fix those and tighten the workflow copy.

The issues:
- `Logo` is hardcoded to `end={45}`, so it never shows during the CTA (50–56s) — the brand lockup is missing.
- `ProgressBar` divides by `45` but the video is now 56s, so the bar maxes out 11s early.

_[tool: str_replace_edit]_

The last two scenes now spotlight the system and AI workflow as a clear, sequenced payoff. Here's how the back half of the video flows:

**Scene 5 — The Solution (27–39s):** "Design as a Service" reveal, with a feature grid leading on **"One intelligent platform"** and **"AI-accelerated workflow"** alongside human direction, portal/asset hub, and flat billing.

**Scene 6 — How It Works (39–50s):** the new system spotlight — **"Our system does the heavy lifting"** — walking a 4-step animated workflow:
1. Brief it in your portal
2. **AI drafts the first pass** — your AI workflow front and center
3. Designers refine & perfect
4. Delivered, ready to ship

Capped with the positioning line **"AI handles the busywork. Our designers do the magic."**

**Scene 7 — CTA (50–56s):** brand lockup + URL.

I also fixed two timing bugs from when the timeline was extended to 56s: the brand logo (was cut off at 45s) now persists through the CTA, and the progress bar now scales to the full duration instead of maxing out early.

Updated VO for the two new/changed scenes:
> **(How It Works)** "Behind it all is one intelligent system. You brief it in your portal, our AI workflow drafts the first pass in minutes, then our designers refine every detail on-brand. AI handles the busywork — our designers do the magic."
>
> **(CTA)** "We simplify design operations, so your team can reach its full potential. Visit us, or just drop us a DM."

_[tool: ready_for_verification]_

All set — loads cleanly and the verifier is reviewing in the background.

## User

For How it Works, instead of a step-by-step process, how about we highlight the strengths of our system and workflow.

## Assistant

Good call — strengths land harder than process steps in a short. Let me swap the numbered workflow for a strengths layout.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

"How It Works" is now **"Why It Works"** — four stat-forward strength cards instead of a sequence:

- **10× faster** — AI-accelerated drafting
- **100% on-brand** — trained on your brand
- **∞ scale** — flexes with demand
- **1 hub** — everything in one portal

Each card leads with the metric, divided from a short benefit line, and they stagger in with the same entrance rhythm. The tagline still caps it: "AI handles the busywork. Our designers do the magic."

_[tool: ready_for_verification]_

Done — strengths layout is live and loads cleanly.

## User

Found issues — fixing…

## Assistant

_[tool: str_replace_edit]_

Moved the closing subtitle down to clear the fourth card.

_[tool: ready_for_verification]_

Fixed — the overlap is resolved.

## User

Let's rework the scene "why it works" and make this a scene where we show the outcome and how the pain-points are addressed. Such as we streamlined design request, design projects done in days not weeks, on-demand access to a full creative team, no more design bottlenecks, brand assets in one place, brand and design consistency.

## Assistant

Let me read the current scene structure and the SystemStrengths component to rework it into an outcomes scene.

_[tool: grep]_

_[tool: read_file]_

Reworking into an outcomes scene — a 2×3 grid of the pain-points-addressed, each as a "before → resolved" card.

_[tool: str_replace_edit]_

"Why It Works" is now **"The Outcome — Every bottleneck, behind you."** A 2×3 grid where each card shows the resolved win in bold, with the old pain point struck through beneath it:

- Streamlined design requests ← ~~Messy email threads~~
- Projects done in days, not weeks ← ~~Weeks of waiting~~
- A full creative team on demand ← ~~No one to design it~~
- No more design bottlenecks ← ~~Stuck in a queue~~
- Brand assets in one place ← ~~Files scattered everywhere~~
- Total brand consistency ← ~~Off-brand, inconsistent~~

Cards stagger in with a check badge and a subtle pop. Updated VO for the scene:
> "And the bottlenecks? Behind you. Design requests streamlined, projects done in days not weeks, a full creative team on demand — your brand, finally consistent and all in one place."

_[tool: ready_for_verification]_

Done — the outcomes scene is live and loads cleanly.

## User

Update the last scene to say "We streamline Design Operations at AI speed — for a fraction of the cost of hiring.

## Assistant

_[tool: read_file]_

_[tool: str_replace_edit]_

Updated the CTA headline.

_[tool: ready_for_verification]_

Done.

## User

Scene: "Let designers design.".... tighten the time it takes to finish loading the last sentence. Load "and let your team do what they do best" right after the full potential graph finishes animating. 

Scene: "Don't settle for "good enough."... tighten this loading of animations so it feels tight instead of prolonging the loading of "The gap is the growth..."

Scene: "The Solution"... load DaaS and Design as a service quicker and right after so there's the time gap is shorter.

## Assistant

Let me read all three scenes plus their sub-components to find the exact timings.

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

Tightened all three:

- **Let designers design.** — subtitle now lands at **17.4s**, right as the gain/loss bars finish (~17.3s), instead of 18.2s.
- **Don't settle.** — "That gap is the growth…" now lands at **23.8s**, immediately after the line graph finishes drawing (~23.7s), instead of 24.4s.
- **The Solution** — "DaaS" pops in at **27.4s** and "Design as a Service" follows at **28.3s** (was 27.5/29.2), closing the gap.

_[tool: ready_for_verification]_

Done — all three scenes tightened.

