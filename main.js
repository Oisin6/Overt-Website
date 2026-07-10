/* Overt Creative shared JS */
(function () {
  // Mobile nav toggle
  var nav = document.querySelector('nav.site-nav');
  var burger = document.querySelector('.nav-burger');
  if (nav && burger) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // close menu after tapping a link
    nav.querySelectorAll('.nav-menu a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); });
    });
  }

  // Smooth scroll for same-page anchors
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1);
      if (!id) return;
      var el = document.getElementById(id);
      if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });
})();


/* Lead-capture popup: shows once per 7 days, after 45% scroll or 15s */
(function () {
  if (location.pathname.indexOf('/contact') === 0) return;
  try {
    var last = localStorage.getItem('ov_popup');
    if (last && Date.now() - Number(last) < 7 * 86400000) return;
  } catch (e) {}
  var shown = false;
  function show() {
    if (shown) return; shown = true;
    try { localStorage.setItem('ov_popup', String(Date.now())); } catch (e) {}
    var d = document.createElement('div');
    d.className = 'lead-pop';
    d.innerHTML =
      '<button class="lp-x" aria-label="Close">&times;</button>' +
      '<h4>Want video that pulls customers in?</h4>' +
      '<p>Leave your details and Oisin will get back to you, usually the same day.</p>' +
      '<form action="https://formspree.io/f/mlgyqpbk" method="POST">' +
      '<input type="hidden" name="_subject" value="Popup lead from overt.ie">' +
      '<input type="hidden" name="_next" value="https://overt.ie/contact/thanks/">' +
      '<input type="text" name="_gotcha" style="display:none" tabindex="-1" autocomplete="off">' +
      '<input type="text" name="Name" placeholder="Your name" required autocomplete="name">' +
      '<input type="email" name="Email" placeholder="Email" required autocomplete="email">' +
      '<input type="tel" name="Phone" placeholder="Phone (optional)" autocomplete="tel">' +
      '<button type="submit" class="btn btn-red">Get in touch &rarr;</button>' +
      '</form>';
    document.body.appendChild(d);
    requestAnimationFrame(function () { requestAnimationFrame(function () { d.classList.add('on'); }); });
    d.querySelector('.lp-x').addEventListener('click', function () { d.remove(); });
  }
  setTimeout(show, 15000);
  window.addEventListener('scroll', function onS() {
    var doc = document.documentElement;
    var depth = (window.scrollY + window.innerHeight) / doc.scrollHeight;
    if (depth > 0.45) { window.removeEventListener('scroll', onS); show(); }
  }, { passive: true });
})();


/* Graceful form submit: background POST with spinner, timeout and a
   clear fallback so a slow/unavailable handler never leaves a dead page.
   Works with Formspree (POST straight to the endpoint) and FormSubmit
   (rewrites to its /ajax/ endpoint), covering the contact and popup forms. */
(function () {
  var FALLBACK_EMAIL = 'Oisin@Overt.ie';
  var TIMEOUT_MS = 12000;

  function isHandled(f) {
    return f && /formspree\.io|formsubmit\.co/i.test(f.getAttribute('action') || '');
  }
  function ajaxUrl(action) {
    // Formspree accepts a JSON POST straight to its endpoint; only
    // FormSubmit needs the /ajax/ path swapped in.
    return action.replace(/formsubmit\.co\/(ajax\/)?/i, 'formsubmit.co/ajax/');
  }
  function statusEl(form, btn) {
    var el = form.querySelector('.form-status');
    if (!el) {
      el = document.createElement('p');
      el.className = 'form-status';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      if (btn && btn.parentNode) { btn.parentNode.insertBefore(el, btn.nextSibling); }
      else { form.appendChild(el); }
    }
    return el;
  }

  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!isHandled(form)) return;
    e.preventDefault();

    var btn = form.querySelector('button[type="submit"], button:not([type])');
    var origBtn = btn ? btn.innerHTML : '';
    var nextInput = form.querySelector('input[name="_next"]');
    var next = nextInput ? nextInput.value : '';
    var status = statusEl(form, btn);

    status.className = 'form-status';
    status.textContent = '';
    if (btn) { btn.disabled = true; btn.innerHTML = 'Sending…'; }

    var controller = ('AbortController' in window) ? new AbortController() : null;
    var timer = setTimeout(function () { if (controller) controller.abort(); }, TIMEOUT_MS);

    var opts = {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form)
    };
    if (controller) opts.signal = controller.signal;

    fetch(ajaxUrl(form.getAttribute('action')), opts)
      .then(function (r) { if (!r.ok) throw new Error('status ' + r.status); return r.json(); })
      .then(function () {
        clearTimeout(timer);
        if (next) { window.location.href = next; return; }
        form.reset();
        if (btn) { btn.disabled = false; btn.innerHTML = origBtn; }
        status.className = 'form-status ok';
        status.textContent = 'Thanks, that came through. I’ll be in touch shortly.';
      })
      .catch(function () {
        clearTimeout(timer);
        if (btn) { btn.disabled = false; btn.innerHTML = origBtn; }
        status.className = 'form-status err';
        status.innerHTML = 'Sorry, that didn’t send just now. Please email me directly at ' +
          '<a href="mailto:' + FALLBACK_EMAIL + '">' + FALLBACK_EMAIL + '</a> ' +
          'and I’ll come straight back to you.';
      });
  }, false);
})();
