---
title: "Audit what your iPhone apps can reach"
platform: ios
concerns: [data-collection, tracking]
difficulty: fundamentals
time_minutes: 20
os_verified: "iOS 19 (draft — pending device verification)"
verified_date: 2026-08-16
plays: 7
---

## What you'll be able to do afterward

- You'll have seen — with receipts — which apps actually use the access they hold.
- Every permission category is trimmed to apps with a working reason.
- The quiet ones (Bluetooth, Local Network) stop being a blind spot.

The quick-win playbook hit the big three in one pass. This is the full
sweep, powered by the iPhone's own surveillance-of-the-surveillers.

## The plays

<ol class="plays">
<li>
<strong>Turn on the App Privacy Report</strong>
<span class="path">Settings → Privacy &amp; Security → App Privacy Report → Turn On</span>
<p class="did">What this just did: started collecting the receipts. From now on the phone records which apps touched your location, mic, camera, contacts, and which domains they contacted. Come back after a few days of normal use — the rest of this playbook is better with data.</p>
</li>
<li>
<strong>Read the report and pick your suspects</strong>
<span class="path">Settings → Privacy &amp; Security → App Privacy Report — look for access you don't remember granting and apps phoning domains you've never heard of</span>
<p class="did">What this just did: replaced guessing with evidence. The app that checked your location forty times on a day you never opened it is the one the next plays are for.</p>
</li>
<li>
<strong>Sweep Location down a notch</strong>
<span class="path">Settings → Privacy &amp; Security → Location Services — "Always" becomes "While Using," "While Using" becomes "Ask" or "Never" unless there's a working reason; turn off "Precise" for anything that only needs the city</span>
<p class="did">What this just did: converted standing location access into on-demand access. Maps needs precise location while navigating; almost nothing else needs either.</p>
</li>
<li>
<strong>Cut Photos access to Selected</strong>
<span class="path">Settings → Privacy &amp; Security → Photos — move "Full Access" apps to "Limited Access" (or None)</span>
<p class="did">What this just did: turned "my entire camera roll and its location metadata" into "the three photos I chose to share." The app can still do its job; it just can't browse.</p>
</li>
<li>
<strong>Sweep Contacts, Microphone, and Camera</strong>
<span class="path">Settings → Privacy &amp; Security → Contacts / Microphone / Camera — revoke anything without an obvious working need</span>
<p class="did">What this just did: closed the classic over-asks. Your contacts are other people's data too — an app that syncs them uploads your friends, who never agreed to anything.</p>
</li>
<li>
<strong>Check the quiet two: Bluetooth and Local Network</strong>
<span class="path">Settings → Privacy &amp; Security → Bluetooth, and → Local Network — revoke apps with no obvious hardware or home-device reason</span>
<p class="did">What this just did: trimmed the permissions nobody reads. Bluetooth and local-network access are used for proximity and home-network scanning — location tracking's quieter cousins — and most apps holding them have no business there.</p>
</li>
<li>
<strong>Re-check the tracking switch</strong>
<span class="path">Settings → Privacy &amp; Security → Tracking — "Allow Apps to Request to Track" off, and clear any per-app allowances listed</span>
<p class="did">What this just did: re-confirmed the master switch from the quick-win and caught any app you'd said yes to before flipping it. Belt, meet suspenders.</p>
</li>
</ol>

## You're now covered against…

- **Standing surveillance** — no app holds always-on access to where you are, what you say, or what you shot.
- **The contact-list harvest** — your friends stop being your apps' product.
- **The quiet channels** — Bluetooth and local-network scanning trimmed to hardware that's actually yours.

Twenty minutes now, then five minutes whenever the App Privacy Report
surprises you. The report is the habit; the sweeps are just what it tells
you to do.
