/* Oasis Supply — мини-приложение. Данные берутся из catalog.json (его готовит sync/sync.py). */
'use strict';

// ------------------------------------------------------------------ тексты (правьте под себя)
const TEXTS = {
  tagline: 'Оригинальная техника из ОАЭ и Китая',
  heroTitle: 'Одна витрина — три площадки',
  heroText: 'Сравните наши цены на Ozon, Wildberries и Яндекс Маркете и купите там, где удобнее. Оплата, доставка и возврат — через маркетплейс.',
  trust: ['Только оригинал', 'Новые, не активированы', 'Проверка IMEI', 'Как получить лучшую цену'],
  // пояснения к плашкам доверия (показываются по наведению / нажатию)
  tips: {
    'Только оригинал': 'Закупаем технику напрямую у проверенных поставщиков в ОАЭ и отправляем сразу Вам! Кликните на отзыв в карточке товара, чтобы перейти на маркетплейс и убедиться в реальности отзыва.',
    'Оригинал': 'Закупаем технику напрямую у проверенных поставщиков в ОАЭ и отправляем сразу Вам! Кликните на отзыв в карточке товара, чтобы перейти на маркетплейс и убедиться в реальности отзыва.',
    'Новые, не активированы': 'Устройства приходят в заводской упаковке с целыми пломбами и ни разу не включались.',
    'Новый, не активирован': 'Устройство приходит в заводской упаковке с целыми пломбами и ни разу не включалось.',
    'Новый, в упаковке': 'Товар приходит новым, в заводской упаковке с целыми пломбами.',
    'Проверка IMEI': 'Проверить устройство можно прямо на ПВЗ, даже не вскрывая пломбы. Введите серийный номер, указанный на коробке, на checkcoverage.apple.com (для устройств Apple) или IMEI на imei.info (для устройств других брендов).',
    'Проверка серийного номера': 'Проверить товар можно прямо на ПВЗ, даже не вскрывая пломбы. Введите серийный номер, указанный на коробке, на checkcoverage.apple.com (для устройств Apple) или на сайте производителя.',
    'Как получить лучшую цену': 'После перехода из нашего приложения на маркетплейс не забудьте проверить, что вы авторизованы на площадке. Залогиненным пользователям маркетплейсы часто дают более выгодные цены (например, показывают дополнительную скидку для оплаты картами Озон Банка или ВБ Банка)',
  },
  checkTitle: 'Как мы проверяем оригинальность',
  checkSteps: [
    ['Закупка у проверенных поставщиков', 'в ОАЭ и Китае'],
    ['Проверка каждой партии:', 'серийные номера, IMEI, статус активации'],
    ['Инструкция для вас:', 'как самостоятельно проверить IMEI на сайте производителя'],
  ],
  supportTitle: 'Купили по нашей ссылке?',
  supportText: 'Напишите нам номер заказа — поможем с настройкой, проверкой и спорными ситуациями на любой площадке.',
  priceNote: 'Цена указана примерно — с учётом обычной скидки площадки. Точная цена и пошлина — на маркетплейсе при оформлении.',
};

const MP = {
  ozon: { name: 'Ozon', short: 'Ozon', color: '#005BFF', fg: '#fff' },
  wb: { name: 'Wildberries', short: 'WB', color: '#7B22D4', fg: '#fff' },
  ym: { name: 'Яндекс Маркет', short: 'Маркет', color: '#FFCC00', fg: '#15171A' },
};
const MP_ORDER = ['ozon', 'wb', 'ym'];
const AXES = [['memory', 'Память'], ['color', 'Цвет'], ['sim', 'SIM'], ['size', 'Размер']];

const tg = window.Telegram && window.Telegram.WebApp;
const S = { data: null, cat: 'all', q: '', fav: new Set(), sel: {}, revTab: 'all', revShown: 5 };
const $app = document.getElementById('app');

// ------------------------------------------------------------------ утилиты
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rub = (n) => Math.round(n).toLocaleString('ru-RU') + ' ₽';
const stars = (r) => '★★★★★'.slice(0, Math.round(r)) + '☆☆☆☆☆'.slice(0, 5 - Math.round(r));
const haptic = () => { try { tg && tg.HapticFeedback && tg.HapticFeedback.selectionChanged(); } catch (e) {} };
function openLink(url) {
  if (tg && tg.openLink) tg.openLink(url, { try_instant_view: false });
  else window.open(url, '_blank', 'noopener');
}
const ICON = {
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="#5E636B" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="#C2410C" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="#C2410C" stroke-width="1.8" stroke-linecap="round"><rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M10 18.5h4"/></svg>',
  code: '<svg viewBox="0 0 24 24" fill="none" stroke="#C2410C" stroke-width="1.8" stroke-linecap="round"><path d="M4 7V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2M7 20H5a1 1 0 0 1-1-1v-2"/><path d="M8 9v6M11 9v6M14 9v6M17 9v6"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="#C2410C" stroke-width="1.8" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.9A8 8 0 1 1 21 12z"/></svg>',
  cash: '<svg viewBox="0 0 24 24" fill="none" stroke="#C2410C" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v5M18 9.5v5"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  ph: '<svg width="46" height="78" viewBox="0 0 46 78" fill="none" stroke="#9A9EA5" stroke-width="2"><rect x="2" y="2" width="42" height="74" rx="9"/></svg>',
};

// ------------------------------------------------------------------ избранное (облако Telegram / браузер)
function loadFav() {
  return new Promise((resolve) => {
    const done = (v) => { try { (JSON.parse(v || '[]') || []).forEach((x) => S.fav.add(x)); } catch (e) {} resolve(); };
    try {
      if (tg && tg.CloudStorage && tg.isVersionAtLeast && tg.isVersionAtLeast('6.9')) {
        tg.CloudStorage.getItem('fav', (err, v) => done(err ? null : v));
        return;
      }
    } catch (e) {}
    try { done(localStorage.getItem('fav')); } catch (e) { resolve(); }
  });
}
function saveFav() {
  const v = JSON.stringify([...S.fav]);
  try { if (tg && tg.CloudStorage && tg.isVersionAtLeast('6.9')) tg.CloudStorage.setItem('fav', v); } catch (e) {}
  try { localStorage.setItem('fav', v); } catch (e) {}
}
function toggleFav(id) { S.fav.has(id) ? S.fav.delete(id) : S.fav.add(id); saveFav(); haptic(); }

// ------------------------------------------------------------------ данные
function modelSummary(m) {
  return [...new Set(m.variants.map((v) => v.memory).filter(Boolean))].join(' / ');
}
// палитра цветов в карточке каталога: только цвета, которые где-то есть в наличии (если нет ни одного — все)
function colorDots(m) {
  const inStock = (v) => Object.values(v.offers).some((o) => o.inStock);
  const pool = m.variants.some(inStock) ? m.variants.filter(inStock) : m.variants;
  const seen = new Map();
  pool.forEach((v) => { if (v.color && !seen.has(v.color)) seen.set(v.color, v.colorHex); });
  if (seen.size < 2) return '';
  const list = [...seen.entries()];
  const max = 6;
  return `<div class="cdots" aria-label="Цвета: ${esc(list.map((c) => c[0]).join(', '))}">${list.slice(0, max).map(([name, hex]) => `<i title="${esc(name)}" style="background:${esc(hex)}"></i>`).join('')}${list.length > max ? `<span>+${list.length - max}</span>` : ''}</div>`;
}
function modelMps(m) { return MP_ORDER.filter((k) => m.variants.some((v) => v.offers[k] && v.offers[k].inStock)); }
function categories() { return ['all', ...new Set(S.data.models.map((m) => m.category))]; }
function filtered(models) {
  const q = S.q.trim().toLowerCase();
  return models.filter((m) => (S.cat === 'all' || m.category === S.cat) && (!q || m.name.toLowerCase().includes(q)));
}
function sortModels(list) { return list.slice().sort((a, b) => b.inStock - a.inStock); } // порядок — как в каталоге

// ------------------------------------------------------------------ компоненты
function cardHTML(m) {
  const mps = modelMps(m);
  return `<a class="pc" href="#/p/${esc(m.id)}">
    <div class="img">${m.image ? `<img loading="lazy" src="${esc(m.image)}" alt="">` : ICON.ph}</div>
    <div class="n">${esc(m.name)}</div>
    ${modelSummary(m) ? `<div class="s">${esc(modelSummary(m))}</div>` : ''}
    ${colorDots(m)}
    ${m.minPrice ? `<div class="p">от ${rub(m.minPrice)}</div>` : '<div class="na">Нет в наличии</div>'}
    <div class="tags">${mps.map((k) => `<span class="tag" style="background:${MP[k].color};color:${MP[k].fg}">${MP[k].short}</span>`).join('')}</div>
  </a>`;
}
function chipsHTML() {
  return `<div class="chips">${categories().map((c) => `<button class="chip ${S.cat === c ? 'on' : ''}" data-cat="${esc(c)}">${c === 'all' ? 'Все' : esc(c)}</button>`).join('')}</div>`;
}
function searchHTML() {
  return `<div class="search"><label for="q" class="hidden">Поиск</label>${ICON.search}<input id="q" type="search" placeholder="iPhone 17, AirPods, Galaxy…" value="${esc(S.q)}" autocomplete="off"></div>`;
}
function gridHTML(home) {
  const filteringNow = S.q.trim() || S.cat !== 'all';
  let list = filtered(S.data.models);
  if (home && !filteringNow) list = list.filter((m) => m.hit);
  list = sortModels(list);
  if (!list.length) return '<div class="empty">Ничего не нашли. Попробуйте другой запрос.</div>';
  return `<div class="grid">${list.map(cardHTML).join('')}</div>`;
}
function bindListControls(home) {
  const q = document.getElementById('q');
  if (q) q.addEventListener('input', () => { S.q = q.value; document.getElementById('grid').innerHTML = gridHTML(home); });
  $app.querySelectorAll('[data-cat]').forEach((b) => b.addEventListener('click', () => { S.cat = b.dataset.cat; haptic(); render(); }));
}
function supportBlock() {
  const u = S.data.supportUsername;
  if (!u) return '';
  return `<section class="dark"><b>${esc(TEXTS.supportTitle)}</b><p>${esc(TEXTS.supportText)}</p>
    <button class="btn btn-white" data-support>Написать в поддержку</button></section>`;
}
function bindSupport() {
  $app.querySelectorAll('[data-support]').forEach((b) => b.addEventListener('click', () => {
    const url = 'https://t.me/' + S.data.supportUsername.replace(/^@/, '');
    if (tg && tg.openTelegramLink) tg.openTelegramLink(url); else openLink(url);
  }));
}

function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100;
  return m10 === 1 && m100 !== 11 ? one : (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? few : many);
}
function statsHTML() {
  const st = S.data.storeStats;
  if (!st || !st.orders) return '';
  const chips = [];
  if (st.rating) chips.push(`<span class="schip"><svg viewBox="0 0 24 24" fill="#F5A623"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z"/></svg>${String(st.rating).replace('.', ',')}</span>`);
  if (st.reviews) chips.push(`<span class="schip"><svg viewBox="0 0 24 24" fill="#9A9EA5"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4V6a2 2 0 0 1 2-2z"/></svg>${st.reviews.toLocaleString('ru-RU')} ${plural(st.reviews, 'отзыв', 'отзыва', 'отзывов')}</span>`);
  chips.push(`<span class="schip"><svg viewBox="0 0 24 24" fill="#9A9EA5"><path d="M12 2l9 5v10l-9 5-9-5V7z"/></svg>${st.orders.toLocaleString('ru-RU')} ${plural(st.orders, 'заказ', 'заказа', 'заказов')}</span>`);
  return `<div class="schips">${chips.join('')}</div>`;
}

function tileHTML(title, icon) {
  const tip = TEXTS.tips[title];
  return tip ? `<button type="button" class="tile" data-tip="${esc(tip)}">${icon}<span>${esc(title)}</span><i class="tinfo" aria-hidden="true">i</i></button>`
             : `<div class="tile">${icon}<span>${esc(title)}</span></div>`;
}

// ---- всплывающие подсказки: мышь — по наведению, палец — по нажатию; закрываются тапом мимо и прокруткой
const tipEl = document.createElement('div');
tipEl.className = 'tip hidden';
tipEl.setAttribute('role', 'tooltip');
document.body.appendChild(tipEl);
let tipFor = null;
function showTip(btn) {
  tipFor = btn;
  tipEl.textContent = btn.dataset.tip;
  tipEl.classList.remove('hidden');
  const r = btn.getBoundingClientRect(), w = Math.min(300, window.innerWidth - 32);
  tipEl.style.width = w + 'px';
  const left = Math.max(16, Math.min(r.left + r.width / 2 - w / 2, window.innerWidth - w - 16));
  tipEl.style.left = left + 'px';
  const h = tipEl.offsetHeight;
  const below = r.bottom + 8 + h < window.innerHeight - 70; // не залезать под нижнее меню
  tipEl.style.top = (below ? r.bottom + 8 : r.top - h - 8) + window.scrollY + 'px';
  tipEl.classList.toggle('up', !below);
  tipEl.style.setProperty('--ax', (r.left + r.width / 2 - left) + 'px');
  btn.classList.add('on');
}
function hideTip() {
  if (tipFor) tipFor.classList.remove('on');
  tipFor = null;
  tipEl.classList.add('hidden');
}
document.addEventListener('pointerover', (e) => {
  const b = e.target.closest && e.target.closest('[data-tip]');
  if (e.pointerType === 'mouse' && b && b !== tipFor) showTip(b);
});
document.addEventListener('pointerout', (e) => {
  const b = e.target.closest && e.target.closest('[data-tip]');
  if (e.pointerType === 'mouse' && b && !b.contains(e.relatedTarget)) hideTip();
});
document.addEventListener('click', (e) => {
  const b = e.target.closest && e.target.closest('[data-tip]');
  if (b) { if (tipFor === b && e.pointerType !== 'mouse') hideTip(); else { showTip(b); haptic(); } return; }
  if (tipFor) hideTip();
});
window.addEventListener('scroll', () => { if (tipFor) hideTip(); }, { passive: true });
window.addEventListener('hashchange', hideTip);

// ------------------------------------------------------------------ экраны
function renderHome() {
  const filteringNow = S.q.trim() || S.cat !== 'all';
  $app.innerHTML = `
  <header class="hdr"><div class="brand"><img class="logo" src="logo.png" alt="Oasis Supply"><div><b>Oasis Supply</b>${statsHTML() || `<small>${esc(TEXTS.tagline)}</small>`}</div></div></header>
  ${searchHTML()}
  <section class="hero"><h2>${esc(TEXTS.heroTitle)}</h2><p>${esc(TEXTS.heroText)}</p>
    <div class="pills"><span class="pill p-ozon">Ozon</span><span class="pill p-wb">Wildberries</span><span class="pill p-ym">Яндекс Маркет</span></div></section>
  <section class="trust">${TEXTS.trust.map((t, i) => tileHTML(t, [ICON.shield, ICON.phone, ICON.code, ICON.cash][i])).join('')}</section>
  ${chipsHTML()}
  <section class="sec"><div class="sec-h"><h2>${filteringNow ? 'Результаты' : 'Хиты продаж'}</h2><a href="#/catalog">Весь каталог</a></div>
    <div id="grid">${gridHTML(true)}</div></section>
  <section class="card"><h2>${esc(TEXTS.checkTitle)}</h2>
    ${TEXTS.checkSteps.map((s, i) => `<div class="step"><div class="num">${i + 1}</div><div><b>${esc(s[0])}</b> ${esc(s[1])}</div></div>`).join('')}
  </section>
  ${supportBlock()}`;
  bindListControls(true);
  bindSupport();
}

function renderCatalog() {
  $app.innerHTML = `<header class="hdr"><div class="brand"><div><b>Каталог</b><small>${S.data.models.length} моделей</small></div></div></header>
  ${searchHTML()}${chipsHTML()}<section class="sec"><div id="grid">${gridHTML(false)}</div></section>`;
  bindListControls(false);
}

function renderFavorites() {
  const list = S.data.models.filter((m) => S.fav.has(m.id));
  $app.innerHTML = `<header class="hdr"><div class="brand"><div><b>Избранное</b><small>${list.length ? list.length + ' шт.' : ''}</small></div></div></header>
  <section class="sec">${list.length ? `<div class="grid">${list.map(cardHTML).join('')}</div>` : '<div class="empty">Нажмите ♡ на странице товара, чтобы сохранить его здесь.</div>'}</section>`;
}

function renderSupport() {
  $app.innerHTML = `<header class="hdr"><div class="brand"><div><b>Поддержка</b></div></div></header>
  ${supportBlock() || `<section class="card"><h2>Скоро здесь будет чат</h2><p class="note">Пока задать вопрос можно в чате с продавцом на любой площадке.</p></section>`}`;
  bindSupport();
}

// ---- карточка товара
function pickDefault(m) {
  return m.variants.find((v) => v.id === m.defaultVariant)
    || m.variants.find((v) => Object.values(v.offers).some((o) => o.inStock)) || m.variants[0];
}
function axesOf(m) { return AXES.filter(([k]) => new Set(m.variants.map((v) => v[k]).filter(Boolean)).size > 1); }
function choose(m, cur, axis, value) {
  const others = axesOf(m).map(([k]) => k).filter((k) => k !== axis);
  return m.variants.find((v) => v[axis] === value && others.every((k) => v[k] === cur[k]))
    || m.variants.find((v) => v[axis] === value && Object.values(v.offers).some((o) => o.inStock))
    || m.variants.find((v) => v[axis] === value);
}

function renderProduct(id, variantId) {
  const m = S.data.models.find((x) => x.id === id);
  if (!m) { $app.innerHTML = '<div class="empty">Товар не найден</div>'; return; }
  const v = m.variants.find((x) => x.id === (variantId || S.sel[id])) || pickDefault(m);
  S.sel[id] = v.id;
  const axes = axesOf(m);
  const imgs = v.images.length ? v.images : (m.image ? [m.image] : []);
  const live = MP_ORDER.filter((k) => v.offers[k]);
  const inStock = live.filter((k) => v.offers[k].inStock);
  const best = inStock.length ? inStock.reduce((a, b) => (v.offers[a].price <= v.offers[b].price ? a : b)) : null;
  const isPhone = /смартфон/i.test(m.category);

  const optHTML = axes.map(([k, title]) => {
    const values = [...new Set(m.variants.map((x) => x[k]).filter(Boolean))];
    const others = axes.map(([a]) => a).filter((a) => a !== k);
    const items = values.map((val) => {
      const exact = m.variants.some((x) => x[k] === val && others.every((a) => x[a] === v[a]));
      const on = v[k] === val;
      if (k === 'color') {
        const hex = (m.variants.find((x) => x.color === val) || {}).colorHex || '#ccc';
        return `<button class="sw ${on ? 'on' : ''} ${exact ? '' : 'off'}" data-axis="${k}" data-val="${esc(val)}" aria-label="${esc(val)}"><i style="background:${esc(hex)}"></i></button>`;
      }
      return `<button class="o ${on ? 'on' : ''} ${exact ? '' : 'off'}" data-axis="${k}" data-val="${esc(val)}">${esc(val)}</button>`;
    }).join('');
    return `<div class="opt"><div class="opt-l">${title}${k === 'color' ? `: <span>${esc(v.color)}</span>` : ''}</div><div class="opts">${items}</div></div>`;
  }).join('');

  const offersHTML = live.map((k) => {
    const o = v.offers[k];
    return `<div class="offer ${k === best ? 'best' : ''}">
      <div class="info">
        <div class="mp" style="color:${k === 'ym' ? '#15171A' : MP[k].color}">${MP[k].name}${k === best && inStock.length > 1 ? '<span class="badge">Лучшая цена</span>' : ''}</div>
        ${o.inStock ? `<div class="pr">от ${rub(o.price)}</div><div class="duty">${o.duty > 0 ? '+ пошлина ~' + rub(o.duty) : 'без пошлины'}</div>`
                    : '<div class="na">Нет в наличии</div>'}
      </div>
      ${o.inStock ? `<button class="buy b-${k}" data-open="${esc(o.url)}">Купить</button>`
                  : `<button class="buy btn-line" style="border:1px solid #E3E1DC;background:#fff" data-open="${esc(o.url)}">Открыть</button>`}
    </div>`;
  }).join('') || '<div class="empty">Этого варианта сейчас нет на площадках</div>';

  // отзывы
  const rv = m.reviews.filter((r) => S.revTab === 'all' || r.mp === S.revTab);
  const tabs = ['all', ...MP_ORDER.filter((k) => m.reviews.some((r) => r.mp === k))];
  const ozonReviewsUrl = (v.offers.ozon || {}).reviewsUrl;
  const ratingKeys = MP_ORDER.filter((k) => m.ratings[k]);
  const reviewsHTML = `
    <section class="sec" style="padding-top:24px"><div class="sec-h"><h2>Отзывы покупателей</h2></div>
    ${ratingKeys.length ? `<div class="rsum">${ratingKeys.map((k) => `<div><small style="color:${k === 'ym' ? '#15171A' : MP[k].color};font-weight:800;font-size:12px">${MP[k].short}</small><b>★ ${m.ratings[k].avg.toFixed(1).replace('.', ',')}</b><small>${m.ratings[k].count} оценок</small></div>`).join('')}</div>` : ''}
    ${tabs.length > 2 ? `<div class="chips" style="padding:0 0 12px">${tabs.map((t) => `<button class="chip ${S.revTab === t ? 'on' : ''}" data-rtab="${t}">${t === 'all' ? 'Все' : MP[t].short}</button>`).join('')}</div>` : ''}
    ${rv.slice(0, S.revShown).map((r) => `<a class="rv" href="#" data-open="${esc(r.url || '')}">
        <div class="rv-top"><span class="tag" style="background:${MP[r.mp].color};color:${MP[r.mp].fg}">${MP[r.mp].short}</span><span class="stars">${stars(r.rating)}</span><span class="meta" style="margin-left:auto">${esc(r.date.split('-').reverse().join('.'))}</span></div>
        <div class="meta">${esc(r.author)}${r.variant ? ' · ' + esc(r.variant) : ''}</div>
        <div class="txt">${esc(r.text)}</div>
        <div class="go">Открыть на ${MP[r.mp].short} →</div></a>`).join('') || '<div class="note">Отзывов с текстом пока нет.</div>'}
    ${rv.length > S.revShown ? '<button class="btn btn-line" data-more>Показать ещё</button>' : ''}
    ${ozonReviewsUrl && !m.reviews.some((r) => r.mp === 'ozon') ? `<button class="btn btn-line" style="margin-top:10px" data-open="${esc(ozonReviewsUrl)}">Отзывы на Ozon →</button>` : ''}
    </section>`;

  const specs = [['Память', v.memory], ['Цвет', v.color], ['SIM', v.sim], ['Размер', v.size], ['Состояние', 'Новый']].filter((x) => x[1]);
  const upd = new Date(S.data.updatedAt);

  $app.innerHTML = `
  <div class="back">
    <a class="iconbtn" href="#/" aria-label="Назад" data-back>${ICON.back}</a>
    <button class="iconbtn ${S.fav.has(m.id) ? 'on' : ''}" data-fav aria-label="В избранное">${ICON.heart}</button>
  </div>
  <div class="gallery" id="gal">${imgs.map((src) => `<div><img src="${esc(src)}" alt="" loading="lazy"></div>`).join('') || `<div>${ICON.ph}</div>`}</div>
  ${imgs.length > 1 ? `<div class="dots" id="dots">${imgs.map((_, i) => `<span class="${i ? '' : 'on'}"></span>`).join('')}</div>` : ''}
  <section class="ttl"><h1>${esc(m.name)}</h1><div>${esc(v.label)}</div></section>
  ${optHTML}
  <section class="offers">
    <div class="sec-h" style="margin:0"><h2 style="font-size:20px;margin:0">Где купить</h2><span class="note">обновлено ${upd.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span></div>
    ${offersHTML}
    <div class="note">${esc(TEXTS.priceNote)}</div>
  </section>
  <section class="trust">${[['Оригинал', ICON.shield], isPhone ? ['Новый, не активирован', ICON.phone] : ['Новый, в упаковке', ICON.phone], isPhone ? ['Проверка IMEI', ICON.code] : ['Проверка серийного номера', ICON.code], ['Как получить лучшую цену', ICON.cash]].map(([t, i]) => tileHTML(t, i)).join('')}</section>
  <section class="card" style="margin-top:0"><h2 style="font-size:18px">Характеристики</h2><div class="specs">${specs.map(([a, b]) => `<div><span>${a}</span><span>${esc(b)}</span></div>`).join('')}</div></section>
  ${reviewsHTML}
  ${supportBlock()}`;

  // события
  $app.querySelectorAll('[data-axis]').forEach((b) => b.addEventListener('click', () => {
    const nv = choose(m, v, b.dataset.axis, b.dataset.val);
    if (nv) { haptic(); history.replaceState(null, '', `#/p/${m.id}/${nv.id}`); renderProduct(m.id, nv.id); }
  }));
  $app.querySelectorAll('[data-open]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); if (b.dataset.open) openLink(b.dataset.open); }));
  $app.querySelectorAll('[data-rtab]').forEach((b) => b.addEventListener('click', () => { S.revTab = b.dataset.rtab; S.revShown = 5; renderProduct(m.id, v.id); }));
  const more = $app.querySelector('[data-more]');
  if (more) more.addEventListener('click', () => { S.revShown += 10; renderProduct(m.id, v.id); });
  $app.querySelector('[data-fav]').addEventListener('click', (e) => { toggleFav(m.id); e.currentTarget.classList.toggle('on', S.fav.has(m.id)); });
  $app.querySelector('[data-back]').addEventListener('click', (e) => { e.preventDefault(); goBack(); });
  const gal = document.getElementById('gal'), dots = document.getElementById('dots');
  if (gal && dots) gal.addEventListener('scroll', () => {
    const i = Math.round(gal.scrollLeft / gal.clientWidth);
    dots.querySelectorAll('span').forEach((d, j) => d.classList.toggle('on', i === j));
  }, { passive: true });
  bindSupport();
}

// ------------------------------------------------------------------ навигация
let lastList = '#/';
function goBack() { location.hash = lastList; }
function render() {
  const h = location.hash || '#/';
  const parts = h.replace(/^#\/?/, '').split('/');
  const tab = parts[0] === 'p' ? null : (parts[0] || 'home');
  document.querySelectorAll('#tabbar a').forEach((a) => a.classList.toggle('on', a.dataset.tab === tab));
  document.getElementById('tabbar').classList.toggle('hidden', parts[0] === 'p');
  if (tg && tg.BackButton) { parts[0] === 'p' ? tg.BackButton.show() : tg.BackButton.hide(); }
  if (parts[0] !== 'p') { lastList = h; S.revTab = 'all'; S.revShown = 5; }
  if (parts[0] === 'p') renderProduct(parts[1], parts[2]);
  else if (parts[0] === 'catalog') renderCatalog();
  else if (parts[0] === 'favorites') renderFavorites();
  else if (parts[0] === 'support') renderSupport();
  else renderHome();
}
let prevHash = location.hash;
window.addEventListener('hashchange', () => {
  const goingToProduct = location.hash.startsWith('#/p/') && !prevHash.startsWith('#/p/');
  prevHash = location.hash;
  render();
  if (goingToProduct || !location.hash.startsWith('#/p/')) window.scrollTo(0, 0);
});

// ------------------------------------------------------------------ старт
(async function init() {
  if (tg) {
    try { tg.ready(); tg.expand(); tg.setHeaderColor('#F3F2EF'); tg.setBackgroundColor('#F3F2EF'); } catch (e) {}
    if (tg.BackButton) tg.BackButton.onClick(goBack);
  }
  try {
    const r = await fetch('catalog.json?t=' + Date.now(), { cache: 'no-store' });
    S.data = await r.json();
  } catch (e) {
    $app.innerHTML = '<div class="empty">Не удалось загрузить каталог. Попробуйте позже.</div>';
    return;
  }
  await loadFav();
  // открытие конкретного товара по ссылке t.me/бот?startapp=<id модели>
  const sp = tg && tg.initDataUnsafe && tg.initDataUnsafe.start_param;
  if (sp && !location.hash) location.hash = '#/p/' + sp;
  render();
})();
