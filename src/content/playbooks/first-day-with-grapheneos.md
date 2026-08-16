---
title: "First day with GrapheneOS: set it up right"
platform: grapheneos
concerns: [new-phone, tracking, data-collection]
difficulty: fundamentals
time_minutes: 45
os_verified: "GrapheneOS current release (draft — pending device verification)"
verified_date: 2026-08-16
plays: 8
---

## What you'll be able to do afterward

- A verified GrapheneOS install, set up in the order that avoids re-doing things.
- Google exactly where you want it: absent, or sandboxed with no special powers.
- The hardening features that make GrapheneOS worth it actually turned on.

Do the previous playbook first if you haven't — this one assumes the answer
was yes and there's a supported Pixel on the desk.

## The plays

<ol class="plays">
<li>
<strong>Install with the official web installer</strong>
<span class="path">Where: the install guide at grapheneos.org, from a computer with a good cable — follow it exactly, including the final "lock the bootloader" step</span>
<p class="did">What this just did: put a verified operating system on the phone with verified boot re-enabled. The web installer checks what it flashes; locking the bootloader at the end is what makes the verification mean something.</p>
</li>
<li>
<strong>Set a strong unlock</strong>
<span class="path">Settings → Security → Screen lock — a 6+ digit PIN (or passphrase), then fingerprint on top</span>
<p class="did">What this just did: the passcode play, same as any phone — except here it also protects the encryption GrapheneOS leans on harder than stock Android does.</p>
</li>
<li>
<strong>Decide about sandboxed Google Play</strong>
<span class="path">Where: the pre-installed Apps app → Google Play services — install only if your must-have apps need it</span>
<p class="did">What this just did: made Google an unprivileged guest, if you invited it at all. Sandboxed Play runs as a normal app with no special system access — most Play-dependent apps work, and Google sees what any ordinary app sees, which is dramatically less than on stock.</p>
</li>
<li>
<strong>Get your apps from the right doors</strong>
<span class="path">Where: the GrapheneOS Apps app first; then your chosen store (sandboxed Play, or an alternative like Accrescent) for the rest</span>
<p class="did">What this just did: established the trust order — system apps from GrapheneOS itself, everything else from a store you chose deliberately rather than the one that came with the landlord.</p>
</li>
<li>
<strong>Use scopes instead of broad access</strong>
<span class="path">When: an app demands all your photos or contacts — grant Storage Scopes / Contact Scopes in the permission prompt instead</span>
<p class="did">What this just did: taught you GrapheneOS's best trick. Scopes let an app believe it has full access while it actually sees only the folders or contacts you picked — the app works, the dragnet doesn't.</p>
</li>
<li>
<strong>Turn on auto-reboot and USB protection</strong>
<span class="path">Settings → Security → Auto reboot (pick an interval like 18 hours); and USB-C port → "Charging only when locked"</span>
<p class="did">What this just did: made a seized or stolen phone go cold on its own. Auto-reboot returns the phone to its strongest encryption state; the USB setting refuses data handshakes while locked — together they're most of what "advanced forensics" runs into.</p>
</li>
<li>
<strong>Consider a second profile for the risky stuff</strong>
<span class="path">Settings → System → Users → Add user — e.g. one profile for daily life, one for apps you don't fully trust</span>
<p class="did">What this just did: gave untrusted apps a separate, disposable apartment. Profiles are fully isolated — what installs and runs in one can't see the other. Optional on day one, worth knowing exists.</p>
</li>
<li>
<strong>Confirm updates are automatic</strong>
<span class="path">Settings → System → System update — leave automatic updates on</span>
<p class="did">What this just did: kept the whole point intact. GrapheneOS ships security updates fast and installs them in the background; your job is only to not turn that off.</p>
</li>
</ol>

## You're now covered against…

- **The stock-Android default** — Google is sandboxed or absent, chosen per profile, with no privileged access either way.
- **Data-hungry apps** — scopes feed them a partial view they can't tell from the real thing.
- **Physical seizure scenarios** — verified boot, auto-reboot, and a locked USB port raise the cost of every offline attack.

Forty-five minutes for the phone; the habits from the earlier playbooks
still apply on top. Welcome to the ceiling.
