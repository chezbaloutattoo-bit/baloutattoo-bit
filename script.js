// ============================================
// BALOU TATTOO — Script
// ============================================

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// --- Intro vidéo ---
(function () {
  const screen = document.getElementById('intro-screen');
  const video  = document.getElementById('intro-video');
  const skip   = document.getElementById('intro-skip');

  if (!screen) return;

  function closeIntro() {
    screen.classList.add('fade-out');
    screen.addEventListener('transitionend', () => screen.remove(), { once: true });
  }

  if (video) {
    video.addEventListener('ended', closeIntro);
    // Si la vidéo ne se charge pas (fichier absent), skip auto après 1s
    video.addEventListener('error', () => setTimeout(closeIntro, 800));
    // Sécurité : skip auto si la vidéo dépasse 15s
    video.addEventListener('loadedmetadata', () => {
      if (video.duration > 15) setTimeout(closeIntro, 15000);
    });
  } else {
    // Pas de vidéo du tout → skip immédiat
    setTimeout(closeIntro, 300);
  }

  if (skip) skip.addEventListener('click', closeIntro);
})();

// --- Galerie Instagram (Behold.so feed) ---
async function loadInstagram() {
  const grid = document.getElementById('igGrid');
  if (!grid) return;

  try {
    const res  = await fetch('https://feeds.behold.so/sqFxCkjri8mRpJyX2YJO');
    const data = await res.json();
    const posts = data.posts || data;

    grid.innerHTML = '';

    posts.forEach(post => {
      const imgUrl = post.sizes?.medium?.mediaUrl || post.thumbnailUrl || post.mediaUrl;
      if (!imgUrl) return;

      const isVideo    = post.mediaType === 'VIDEO';
      const isCarousel = post.mediaType === 'CAROUSEL_ALBUM';
      const caption    = post.prunedCaption || post.caption || '';
      const altText    = caption.slice(0, 80) || 'Tatouage par @balou_tattoo.ink';

      // Création DOM sécurisée (aucun innerHTML avec données externes → no XSS)
      const item = document.createElement('a');
      item.className = 'ig-item';
      item.href      = post.permalink || '#';
      item.target    = '_blank';
      item.rel       = 'noopener';

      const img = document.createElement('img');
      img.src     = imgUrl;
      img.alt     = altText;
      img.loading = 'lazy';
      item.appendChild(img);

      if (isVideo || isCarousel) {
        const badge = document.createElement('span');
        badge.className = 'ig-type';
        badge.textContent = isVideo ? '▶ Reel' : '⊞';
        item.appendChild(badge);
      }

      const overlay = document.createElement('div');
      overlay.className = 'ig-overlay';
      if (caption) {
        const cap = document.createElement('p');
        cap.className = 'ig-caption';
        cap.textContent = caption;
        overlay.appendChild(cap);
      }
      item.appendChild(overlay);

      grid.appendChild(item);
    });

  } catch (err) {
    grid.textContent = '';
    const msg = document.createElement('p');
    msg.className = 'ig-loading';
    msg.textContent = 'Impossible de charger le feed Instagram.';
    grid.appendChild(msg);
  }
}

loadInstagram();

// --- Nav scroll ---
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

// --- Burger menu ---
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');

if (burger && mobileMenu) {
  burger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });

  mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
    });
  });
}

// --- Formulaire booking (Formspree) ---
// Remplacer VOTRE_ID_FORMSPREE dans index.html par ton vrai ID
// (créer un compte sur formspree.io, ajouter un formulaire → copier l'ID)
const form = document.getElementById('bookingForm');
if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();

    const name    = form.name.value.trim();
    const email   = form.email.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !message) {
      alert('Merci de remplir les champs obligatoires (nom, email, projet).');
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Envoi en cours…';
    btn.disabled = true;

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        btn.textContent = 'Message envoyé ✓';
        btn.style.background = '#4a7c59';
        btn.style.color = '#fff';
        form.reset();
      } else {
        const data = await res.json().catch(() => ({}));
        const errMsg = data?.errors?.map(e => e.message).join(', ') || 'Erreur inconnue';
        btn.textContent = 'Réessayer';
        btn.disabled = false;
        alert('Erreur : ' + errMsg);
      }
    } catch {
      btn.textContent = 'Réessayer';
      btn.disabled = false;
      alert('Connexion impossible. Merci de contacter via Instagram.');
    }
  });
}

// --- Apparition au scroll (Intersection Observer) ---
if (!prefersReducedMotion) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.stat, .about-img, .about-text, .booking-text, .booking-form').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    observer.observe(el);
  });
}

// --- Année dynamique footer ---
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
