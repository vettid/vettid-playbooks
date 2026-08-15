// Per-device progress on playbook cards ("5 of 8 plays done"), read from the
// same localStorage keys the playbook pages write. Local only, by design.

for (const card of document.querySelectorAll('[data-progress-slug]')) {
  try {
    const done = JSON.parse(localStorage.getItem(`vettid-playbook:${card.dataset.progressSlug}`) ?? '[]');
    if (done.length > 0) {
      const p = card.querySelector('.progress');
      p.textContent = `${done.length} of ${card.dataset.plays} plays done`;
      p.hidden = false;
    }
  } catch { /* unreadable state is the same as no state */ }
}
