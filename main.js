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
      '<form action="https://formsubmit.co/Oisin@Overt.ie" method="POST">' +
      '<input type="hidden" name="_subject" value="Popup lead from overt.ie">' +
      '<input type="hidden" name="_next" value="https://overt.ie/contact/thanks/">' +
      '<input type="hidden" name="_template" value="table">' +
      '<input type="hidden" name="_captcha" value="false">' +
      '<input type="text" name="_honey" style="display:none" tabindex="-1" autocomplete="off">' +
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
