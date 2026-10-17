const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

export function initUI() {
  // desktop dropdowns: hover/focus via CSS; buttons toggle for touch + keyboard
  $$('.nav .has-sub').forEach((li) => {
    const btn = li.querySelector('.sub-btn');
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      $$('.nav .sub-btn[aria-expanded="true"]').forEach((b) => b !== btn && b.setAttribute('aria-expanded', 'false'));
      btn.setAttribute('aria-expanded', String(open));
    });
    li.addEventListener('focusout', (e) => { if (!li.contains(e.relatedTarget)) btn.setAttribute('aria-expanded', 'false'); });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = $('.nav .sub-btn[aria-expanded="true"]');
    if (open) { open.setAttribute('aria-expanded', 'false'); open.focus(); }
    closeDrawer(true);
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('.nav')) $$('.nav .sub-btn').forEach((b) => b.setAttribute('aria-expanded', 'false')); });

  // off-canvas menu: same structure as the main nav, as accordions
  const drawer = $('#drawer'), list = $('.dr-l1', drawer), mbtn = $('.menu-btn');
  $$('.nav-l1 > li').forEach((li, i) => {
    const top = li.querySelector(':scope > a');
    const item = document.createElement('li');
    const row = document.createElement('div'); row.className = 'dr-row';
    const a = top.cloneNode(true);
    const b = document.createElement('button');
    b.className = 'dr-toggle'; b.type = 'button';
    b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-controls', 'dr-sub-' + i);
    b.setAttribute('aria-label', top.textContent + ' submenu');
    b.innerHTML = '<i aria-hidden="true"></i>';
    row.append(a, b);
    const sub = li.querySelector('.sub').cloneNode(true);
    sub.className = 'dr-sub'; sub.id = 'dr-sub-' + i; sub.hidden = true;
    b.addEventListener('click', () => { const o = b.getAttribute('aria-expanded') !== 'true'; b.setAttribute('aria-expanded', String(o)); sub.hidden = !o; });
    item.append(row, sub);
    list.appendChild(item);
  });
  function closeDrawer(focusBtn) {
    if (drawer.hidden) return;
    drawer.hidden = true;
    mbtn.setAttribute('aria-expanded', 'false'); mbtn.setAttribute('aria-label', 'Open menu');
    document.documentElement.classList.remove('menu-open');
    if (focusBtn) mbtn.focus();
  }
  mbtn.addEventListener('click', () => {
    if (!drawer.hidden) return closeDrawer(false);
    drawer.hidden = false;
    mbtn.setAttribute('aria-expanded', 'true'); mbtn.setAttribute('aria-label', 'Close menu');
    document.documentElement.classList.add('menu-open');
    $('a', drawer).focus();
  });
}
