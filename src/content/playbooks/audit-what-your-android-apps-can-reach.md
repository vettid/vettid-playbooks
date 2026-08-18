---
title: "Audit what your Android apps can reach"
platform: android
concerns: [data-collection, tracking]
difficulty: fundamentals
time_minutes: 20
os_verified: "Android 16, Pixel paths (draft — pending device verification; menu names vary by brand)"
verified_date: 2026-08-16
plays: 7
---

## What you'll be able to do afterward

- You'll have read the phone's own log of who accessed what, and acted on it.
- Every permission category is trimmed to apps with a working reason.
- The special powers — drawing over the screen, device admin, notification access — are down to a justified few.

The quick-win playbook hit the big three in one pass. This is the full
sweep, using the receipts Android already keeps.

## The plays

<ol class="plays">
<li>
<strong>Read the Privacy Dashboard</strong>
<span class="path">Settings → Security &amp; privacy → Privacy → Privacy dashboard — review the last 24 hours of location, camera, and mic access</span>
<p class="did">What this just did: replaced guessing with the phone's own access log. The app that checked your location at 3 a.m. is who the rest of this playbook is about.</p>
</li>
<li>
<strong>Sweep Location down a notch</strong>
<span class="path">Settings → Security &amp; privacy → Privacy controls → Permission manager → Location — "All the time" becomes "Only while in use"; anything without a working reason becomes "Don't allow"; turn off "Use precise location" where approximate will do</span>
<p class="did">What this just did: converted standing location access into on-demand access, and gave city-level apps city-level data instead of your doorstep.</p>
</li>
<li>
<strong>Trim Photos and storage access</strong>
<span class="path">Permission manager → Photos and videos — prefer "Allow limited access" (selected photos) over full library access</span>
<p class="did">What this just did: turned "my entire gallery" into "the photos I picked." Apps that genuinely manage media keep working; apps that were browsing lose the library card.</p>
</li>
<li>
<strong>Sweep Contacts, Microphone, and Camera</strong>
<span class="path">Permission manager → Contacts / Microphone / Camera — revoke anything without an obvious working need</span>
<p class="did">What this just did: closed the classic over-asks. Contacts are other people's data — an app that uploads your address book uploads your friends, who never agreed to anything.</p>
</li>
<li>
<strong>Audit the special powers</strong>
<span class="path">Settings → Apps → Special app access — review "Display over other apps," "Device admin apps," "Notification access," and "Usage access"; remove anything you can't explain</span>
<p class="did">What this just did: checked the permissions that don't live in the normal list. These are the levers with real reach — reading every notification, drawing over your banking app, resisting uninstall — and almost nothing you installed casually should hold them.</p>
</li>
<li>
<strong>Let Android take back unused permissions</strong>
<span class="path">Settings → Apps → [app] → "Pause app activity if unused" — confirm it's on for apps you rarely open</span>
<p class="did">What this just did: put permission cleanup on autopilot. Apps you haven't opened in months automatically lose their grants and stop running in the background — the audit that runs itself.</p>
</li>
<li>
<strong>Re-check the advertising ID is still gone</strong>
<span class="path">Settings → Privacy → Ads — confirm "Delete advertising ID" took, or do it now</span>
<p class="did">What this just did: re-confirmed the quick-win's biggest single move. With the ID deleted, the cross-app profile loses its primary key.</p>
</li>
</ol>

## You're now covered against…

- **Standing surveillance** — no app holds always-on access to where you are, what you say, or what you shot.
- **The special-power abuses** — screen overlay, device admin, and notification reading trimmed to a justified few.
- **Permission rot** — unused apps lose their access automatically from here on.

Twenty minutes now; the Privacy Dashboard is the recurring five-minute
habit. When it surprises you, you know which play to re-run.
