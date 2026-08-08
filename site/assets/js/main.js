/* Ксения Колесникова — metalzmk.ru */
(function () {
  'use strict';

  /* ---------------------------------------------------------------------
   * НАСТРОЙКИ — поменяйте эти три строки, и сайт готов принимать заявки.
   * ------------------------------------------------------------------- */
  var CONFIG = {
    // Куда POST-ить форму. Подойдёт Formspree, Getform, FormCarry, свой php.
    // Пока здесь пусто — форма собирает текст и открывает мессенджер.
    formEndpoint: '',
    phone: '+7 927 263-36-38',    // как показывать
    phoneHref: '+79272633638',    // как звонить
    email: '',                    // не задана — пункт «Почта» с сайта убран
    telegram: 'KolesnikovaKseniia',  // ник без @
    whatsapp: '79272633638'       // номер только цифрами
  };

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* --- Год в подвале --------------------------------------------------- */
  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* --- Мобильное меню -------------------------------------------------- */
  var burger = $('#burger');
  var nav = $('#nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      nav.setAttribute('data-open', String(!open));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        burger.setAttribute('aria-expanded', 'false');
        nav.setAttribute('data-open', 'false');
      }
    });
  }

  /* --- Появление при скролле -------------------------------------------
   * Страховка обязательна: при быстром скролле, прыжке по якорю или
   * тяжёлой странице observer может не успеть — контент не должен
   * оставаться невидимым ни при каких обстоятельствах.
   * ------------------------------------------------------------------- */
  var risers = $$('.rise, .dev');
  function revealAll() {
    risers.forEach(function (el) { el.setAttribute('data-in', 'true'); });
  }

  // Кадры в одном ряду проявляются с небольшой задержкой друг за другом
  $$('.folio__item, .demo__row').forEach(function (row) {
    $$('.dev', row).forEach(function (img, i) {
      img.style.transitionDelay = Math.min(i * 70, 420) + 'ms';
    });
  });
  ['.folio', '.quotes', '.courses'].forEach(function (sel) {
    $$(sel).forEach(function (grid) {
      $$('.dev', grid).forEach(function (img, i) {
        if (!img.style.transitionDelay) img.style.transitionDelay = Math.min(i * 55, 500) + 'ms';
      });
    });
  });

  if ('IntersectionObserver' in window && risers.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.setAttribute('data-in', 'true');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -4% 0px', threshold: 0 });
    risers.forEach(function (el) { io.observe(el); });
    // если что-то пошло не так — через 4 секунды показываем всё
    setTimeout(revealAll, 4000);
  } else {
    revealAll();
  }

  /* --- Контакты: единая точка правки -------------------------------------
   * Номер, почта и ники берутся из CONFIG и разъезжаются по всей странице,
   * чтобы при смене телефона не пришлось искать его в шести местах.
   * ------------------------------------------------------------------- */
  (function fillContacts() {
    $$('a[href^="tel:"]').forEach(function (a) {
      a.href = 'tel:' + CONFIG.phoneHref;
      var slot = a.querySelector('span:not(.phone__lbl)');
      if (slot) slot.textContent = CONFIG.phone;
      else if (/^[+\d\s()·-]+$/.test(a.textContent.trim())) a.textContent = CONFIG.phone;
    });
    if (CONFIG.email) $$('a[href^="mailto:"]').forEach(function (a) { a.href = 'mailto:' + CONFIG.email; });
    $$('a[href*="t.me/"]').forEach(function (a) { a.href = 'https://t.me/' + CONFIG.telegram; });
    $$('a[href*="wa.me/"]').forEach(function (a) {
      a.href = 'https://wa.me/' + CONFIG.whatsapp;
      var val = a.querySelector('.channel__val');
      if (val) val.textContent = CONFIG.phone;
    });
  })();

  /* --- Карусель героя ----------------------------------------------------
   * Четыре направления съёмки. Номер на бирке и подпись меняются вместе
   * с кадром — иначе бирка называет не то, что показано.
   * ------------------------------------------------------------------- */
  var shotsBox = $('#hero-shots');
  if (shotsBox) {
    var shots = $$('.shot', shotsBox);
    var dots = $$('.hero__dot');
    var num = $('#hero-num'), capEl = $('#hero-cap'), note = $('#hero-note');
    var idx = 0, timer = null;
    var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function go(i) {
      idx = (i + shots.length) % shots.length;
      shots.forEach(function (s, k) {
        if (k === idx) s.setAttribute('data-on', 'true');
        else s.removeAttribute('data-on');
      });
      dots.forEach(function (d, k) { d.setAttribute('aria-selected', String(k === idx)); });
      var d = dots[idx];
      if (d) {
        if (num) num.textContent = String(idx + 1).padStart(2, '0');
        if (capEl) capEl.textContent = d.dataset.tag;
        if (note) note.textContent = d.dataset.caption;
      }
    }

    function play() {
      if (still) return;
      stop();
      timer = setInterval(function () { go(idx + 1); }, 6000);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    dots.forEach(function (d, k) {
      d.addEventListener('click', function () { go(k); play(); });
    });

    var fig = shotsBox.closest('.hero__figure');
    fig.addEventListener('mouseenter', stop);
    fig.addEventListener('mouseleave', play);
    fig.addEventListener('focusin', stop);
    fig.addEventListener('focusout', play);
    // не крутим, пока вкладка в фоне
    document.addEventListener('visibilitychange', function () {
      document.hidden ? stop() : play();
    });

    go(0);
    play();
  }

  /* --- Плавающая кнопка связи -------------------------------------------- */
  var fab = $('#fab'), fabBtn = $('#fab-btn'), fabMenu = $('#fab-menu');
  if (fab && fabBtn && fabMenu) {
    function fabSet(open) {
      fab.setAttribute('data-open', String(open));
      fabBtn.setAttribute('aria-expanded', String(open));
      if (open) { fabMenu.hidden = false; }
      else { setTimeout(function () { if (fab.getAttribute('data-open') !== 'true') fabMenu.hidden = true; }, 260); }
      fabBtn.removeAttribute('data-ping');
    }
    fabBtn.addEventListener('click', function () {
      fabSet(fab.getAttribute('data-open') !== 'true');
    });
    document.addEventListener('click', function (e) {
      if (!fab.contains(e.target) && fab.getAttribute('data-open') === 'true') fabSet(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && fab.getAttribute('data-open') === 'true') { fabSet(false); fabBtn.focus(); }
    });
    // один раз за визит мягко подсказываем, что кнопка живая
    try {
      if (!sessionStorage.getItem('fab-seen')) {
        setTimeout(function () { fabBtn.setAttribute('data-ping', 'true'); }, 6000);
        sessionStorage.setItem('fab-seen', '1');
      }
    } catch (e) { /* приватный режим — просто без подсказки */ }
  }

  /* --- Уведомление о cookie -----------------------------------------------
   * Выбор храним в localStorage, а не в cookie: так на сайте не появляется
   * ни одного собственного cookie-файла, и заявление в политике остаётся
   * правдой.
   * ------------------------------------------------------------------- */
  var cookieBox = $('#cookie');
  if (cookieBox) {
    var KEY = 'cookie-notice-v1';
    var seen = false;
    try { seen = localStorage.getItem(KEY) === 'ok'; } catch (e) { seen = true; }
    if (!seen) {
      cookieBox.hidden = false;
      setTimeout(function () { cookieBox.setAttribute('data-on', 'true'); }, 1200);
      $('#cookie-ok').addEventListener('click', function () {
        cookieBox.removeAttribute('data-on');
        try { localStorage.setItem(KEY, 'ok'); } catch (e) {}
        setTimeout(function () { cookieBox.hidden = true; }, 500);
      });
    }
  }

  /* --- Шапка реагирует на скролл ---------------------------------------- */
  var head = $('.site-head');
  if (head) {
    var onScroll = function () {
      head.setAttribute('data-scrolled', String(window.scrollY > 40));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* --- Разбор кадра: метки автофокуса ------------------------------------ */
  $$('.anat-grid').forEach(function (anat) {
    var pins = $$('.anat__pin', anat);
    var notes = $$('.anat__note', anat);
    if (!pins.length || !notes.length) return;

    function select(i) {
      pins.forEach(function (p, k) { p.setAttribute('aria-pressed', String(k === i)); });
      notes.forEach(function (n, k) { n.setAttribute('data-on', String(k === i)); });
    }

    pins.forEach(function (pin, i) {
      pin.addEventListener('click', function () { select(i); });
      pin.addEventListener('mouseenter', function () { select(i); });
    });
    select(0);
  });

  /* --- Плёнка: клон кадров для бесшовной прокрутки -----------------------
   * Лента едет на -50%, поэтому вторая половина должна быть точным клоном
   * первой. Клонируем только кадры: перфорация лежит абсолютом на всю
   * ширину ленты и дублировать её не нужно.
   * ------------------------------------------------------------------- */
  $$('.reel__track').forEach(function (track) {
    $$('.reel__cell', track).forEach(function (cell) {
      var copy = cell.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      var img = copy.querySelector('img');
      if (img) img.alt = '';
      track.appendChild(copy);
    });
  });

  /* --- Карточка курса раскрывает программу -------------------------------- */
  $$('.course__more').forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      panel.style.maxHeight = open ? '0px' : panel.scrollHeight + 'px';
    });
  });

  /* --- Фильтр портфолио ------------------------------------------------- */
  var filterBtns = $$('.folio-filter__btn');
  var folioItems = $$('#folio-grid .folio__item');
  if (filterBtns.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var want = btn.dataset.filter;
        filterBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        folioItems.forEach(function (it) {
          it.hidden = !(want === 'all' || it.dataset.cat === want);
        });
      });
    });
  }

  /* --- Лайтбокс --------------------------------------------------------- */
  var lb = $('#lightbox');
  if (lb) {
    var lbImg = $('#lb-img');
    var lbCap = $('#lb-cap');
    var visible = [];
    var cursor = 0;
    var lastFocus = null;

    function refresh() {
      visible = folioItems.filter(function (it) { return !it.hidden; });
    }

    function show(i) {
      if (!visible.length) return;
      cursor = (i + visible.length) % visible.length;
      var img = visible[cursor].querySelector('img');
      var cap = visible[cursor].querySelector('figcaption');
      lbImg.src = img.dataset.full || img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = cap ? cap.textContent : '';
    }

    function open(item) {
      refresh();
      lastFocus = document.activeElement;
      show(visible.indexOf(item));
      lb.setAttribute('data-open', 'true');
      document.body.style.overflow = 'hidden';
      $('#lb-close').focus();
    }

    function close() {
      lb.removeAttribute('data-open');
      document.body.style.overflow = '';
      lbImg.removeAttribute('src');
      if (lastFocus) lastFocus.focus();
    }

    folioItems.forEach(function (it) {
      var img = it.querySelector('img');
      img.style.cursor = 'zoom-in';
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.addEventListener('click', function () { open(it); });
      img.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(it); }
      });
    });

    $('#lb-close').addEventListener('click', close);
    $('#lb-prev').addEventListener('click', function () { show(cursor - 1); });
    $('#lb-next').addEventListener('click', function () { show(cursor + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (lb.getAttribute('data-open') !== 'true') return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(cursor - 1);
      if (e.key === 'ArrowRight') show(cursor + 1);
    });
  }

  /* --- FAQ -------------------------------------------------------------- */
  $$('.faq__item').forEach(function (item) {
    var q = item.querySelector('.faq__q');
    var a = item.querySelector('.faq__a');
    q.addEventListener('click', function () {
      var open = item.getAttribute('data-open') === 'true';
      item.setAttribute('data-open', String(!open));
      q.setAttribute('aria-expanded', String(!open));
      a.style.maxHeight = open ? '0px' : a.scrollHeight + 'px';
    });
  });
  window.addEventListener('resize', function () {
    $$('.faq__item[data-open="true"] .faq__a').forEach(function (a) {
      a.style.maxHeight = a.scrollHeight + 'px';
    });
    $$('.course__more[aria-expanded="true"]').forEach(function (b) {
      var p = document.getElementById(b.getAttribute('aria-controls'));
      if (p) p.style.maxHeight = p.scrollHeight + 'px';
    });
  });

  /* --- Предзаполнение темы из ссылки ?tema= ----------------------------- */
  var form = $('#lead-form');
  var params = new URLSearchParams(location.search);
  if (form && params.get('tema')) {
    var sel = form.querySelector('[name="topic"]');
    Array.prototype.forEach.call(sel.options, function (o) {
      if (o.value.toLowerCase().indexOf(params.get('tema').toLowerCase()) > -1) sel.value = o.value;
    });
  }

  /* --- Кнопка курса подставляет курс в форму ---------------------------- */
  $$('[data-course]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!form) return;
      var sel = form.querySelector('[name="topic"]');
      var want = btn.dataset.course.toLowerCase();
      Array.prototype.forEach.call(sel.options, function (o) {
        if (o.value.toLowerCase().indexOf(want) > -1) sel.value = o.value;
      });
    });
  });

  /* --- Отправка формы --------------------------------------------------- */
  if (form) {
    var status = $('#form-status');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var name = (data.get('name') || '').trim();
      var contact = (data.get('contact') || '').trim();

      if (!name || !contact) {
        status.dataset.kind = 'err';
        status.textContent = 'Заполните имя и способ связи — без них я не смогу ответить.';
        return;
      }

      var consent = form.querySelector('[name="consent"]');
      if (consent && !consent.checked) {
        consent.closest('.consent').dataset.invalid = 'true';
        consent.focus();
        status.dataset.kind = 'err';
        status.textContent = 'Отметьте согласие на обработку персональных данных — без него я не вправе принять заявку.';
        return;
      }
      if (consent) consent.closest('.consent').removeAttribute('data-invalid');

      var text = [
        'Заявка с сайта metalzmk.ru',
        'Имя: ' + name,
        'Связь: ' + contact,
        'Собака: ' + (data.get('dog') || '—'),
        'Формат: ' + (data.get('topic') || '—'),
        'Комментарий: ' + (data.get('message') || '—')
      ].join('\n');

      status.dataset.kind = '';
      status.textContent = 'Отправляю…';

      if (CONFIG.formEndpoint) {
        fetch(CONFIG.formEndpoint, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: data
        }).then(function (r) {
          if (!r.ok) throw new Error('bad status');
          form.reset();
          status.dataset.kind = 'ok';
          status.textContent = 'Заявка ушла. Отвечу в течение дня.';
        }).catch(function () {
          status.dataset.kind = 'err';
          status.textContent = 'Не получилось отправить. Напишите, пожалуйста, в Telegram или WhatsApp.';
        });
      } else if (CONFIG.telegram) {
        // Бэкенда нет. Telegram не умеет принимать текст через ссылку на
        // человека, поэтому заявку кладём в буфер обмена.
        window.open('https://t.me/' + CONFIG.telegram, '_blank', 'noopener');
        status.dataset.kind = 'ok';
        status.textContent = 'Открыл Telegram — напишите, что вам нужно, я на связи.';
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () {
            status.textContent = 'Открыл Telegram, текст заявки скопирован — осталось вставить и отправить.';
          }).catch(function () { /* буфер недоступен — сообщение остаётся прежним */ });
        }
      } else {
        // WhatsApp умеет подставить текст прямо из ссылки.
        window.open('https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
        status.dataset.kind = 'ok';
        status.textContent = 'Открыл WhatsApp — текст заявки уже подставлен, осталось отправить.';
      }
    });
  }
})();
