/* ============================================================
   1. ANIMATED STARFIELD  (canvas)
   ============================================================ */
(function starfield() {
  const canvas = document.getElementById("starfield");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let stars = [];
  let shootingStars = [];
  let w, h;

  // Respect reduced-motion: draw static stars, skip animation
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = Math.min(260, Math.floor((w * h) / 6500)); // scale with screen size
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.4 + 0.3,
      base: Math.random() * 0.5 + 0.3,     // base brightness
      tw: Math.random() * 0.02 + 0.005,    // twinkle speed
      phase: Math.random() * Math.PI * 2,
    }));
  }

  function spawnShootingStar() {
    if (reduceMotion) return;
    // occasionally launch a shooting star from a random top-ish position
    shootingStars.push({
      x: Math.random() * w,
      y: (Math.random() * h) / 3,
      len: Math.random() * 120 + 80,
      speed: Math.random() * 6 + 6,
      angle: Math.PI / 4,        // 45° downward-right
      life: 0,
      maxLife: 60,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // twinkling stars
    for (const s of stars) {
      s.phase += s.tw;
      const alpha = s.base + Math.sin(s.phase) * 0.3;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${Math.max(0, alpha)})`;
      ctx.fill();
    }

    // shooting stars
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const ss = shootingStars[i];
      ss.life++;
      ss.x += Math.cos(ss.angle) * ss.speed;
      ss.y += Math.sin(ss.angle) * ss.speed;

      const tailX = ss.x - Math.cos(ss.angle) * ss.len;
      const tailY = ss.y - Math.sin(ss.angle) * ss.len;
      const grad = ctx.createLinearGradient(ss.x, ss.y, tailX, tailY);
      const fade = 1 - ss.life / ss.maxLife;
      grad.addColorStop(0, `rgba(174,203,255,${fade})`);
      grad.addColorStop(1, "rgba(174,203,255,0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ss.x, ss.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();

      if (ss.life > ss.maxLife || ss.x > w || ss.y > h) shootingStars.splice(i, 1);
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  resize();

  if (reduceMotion) {
    // draw a single static frame
    for (const s of stars) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.base})`;
      ctx.fill();
    }
  } else {
    draw();
    setInterval(spawnShootingStar, 4500); // a shooting star every ~4.5s
  }
})();

/* ============================================================
   2. NAV: background on scroll, mobile toggle, active link
   ============================================================ */
(function nav() {
  const navEl = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");

  // add background once the user scrolls a bit
  const onScroll = () => navEl.classList.toggle("scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // mobile hamburger
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });
  // close the menu after clicking a link (mobile)
  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => links.classList.remove("open"))
  );

  // highlight the nav link for the section currently in view
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = links.querySelectorAll('a[href^="#"]');
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          navLinks.forEach((l) =>
            l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id)
          );
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => spy.observe(s));
})();

/* ============================================================
   3. SCROLL REVEAL for elements with class "reveal"
   ============================================================ */
(function reveal() {
  const items = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  items.forEach((el) => io.observe(el));
})();

/* ============================================================
   4. Project "Paper ↓" link → scroll to the matching publication
      and flash it so it's easy to spot.
   ============================================================ */
(function paperJump() {
  document.querySelectorAll('a.paper-jump[href^="#"]').forEach((link) => {
    link.addEventListener("click", () => {
      const target = document.getElementById(link.getAttribute("href").slice(1));
      if (!target) return;
      // The href handles the smooth scroll; we just (re)trigger the flash.
      target.classList.remove("pub--flash");
      void target.offsetWidth; // force reflow so the animation restarts every click
      target.classList.add("pub--flash");
      setTimeout(() => target.classList.remove("pub--flash"), 1900);
    });
  });
})();

/* ============================================================
   5. Footer year
   ============================================================ */
document.getElementById("year").textContent = new Date().getFullYear();
