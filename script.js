// ====================================================================
// Fathi & Shaza — Graduation Afterparty site
// Three.js particle backdrop + countdown + scroll reveals + RSVP
// ====================================================================

(function () {
  "use strict";

  /* ---------------------------------------------------------------
   * THREE.JS BACKGROUND — floating starfield / confetti particles
   * ------------------------------------------------------------- */
  function initThree() {
    const canvas = document.getElementById("bg-canvas");
    if (!canvas || typeof THREE === "undefined") return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Particle field: mix of gold, violet, maroon points
    const colors = [0xd21f3c, 0x9aa0ab, 0x7a1220, 0xffffff];
    const particleCount = window.innerWidth < 640 ? 260 : 500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colorArray = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const colorObj = new THREE.Color();

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;

      colorObj.set(colors[Math.floor(Math.random() * colors.length)]);
      colorArray[i * 3] = colorObj.r;
      colorArray[i * 3 + 1] = colorObj.g;
      colorArray[i * 3 + 2] = colorObj.b;

      sizes[i] = Math.random() * 1.6 + 0.4;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colorArray, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // A few larger glowing "confetti" sprites drifting slowly
    const confettiGroup = new THREE.Group();
    const confettiGeo = new THREE.PlaneGeometry(0.8, 0.8);
    for (let i = 0; i < 40; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: colors[Math.floor(Math.random() * colors.length)],
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(confettiGeo, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 40
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      mesh.userData.speed = 0.002 + Math.random() * 0.004;
      mesh.userData.rotSpeed = (Math.random() - 0.5) * 0.02;
      confettiGroup.add(mesh);
    }
    scene.add(confettiGroup);

    let mouseX = 0;
    let mouseY = 0;
    window.addEventListener(
      "pointermove",
      (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      },
      { passive: true }
    );

    let scrollY = 0;
    window.addEventListener(
      "scroll",
      () => {
        scrollY = window.scrollY;
      },
      { passive: true }
    );

    const clock = new THREE.Clock();
    let rafId;

    function animate() {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      points.rotation.y = t * 0.02 + mouseX * 0.15;
      points.rotation.x = mouseY * 0.1;
      points.position.y = -scrollY * 0.01;

      confettiGroup.children.forEach((mesh) => {
        mesh.rotation.x += mesh.userData.rotSpeed;
        mesh.rotation.y += mesh.userData.rotSpeed;
        mesh.position.y -= mesh.userData.speed * 8;
        if (mesh.position.y < -30) mesh.position.y = 30;
      });
      confettiGroup.rotation.y = t * 0.01;

      camera.position.x += (mouseX * 3 - camera.position.x) * 0.02;
      camera.position.y += (-mouseY * 3 - camera.position.y) * 0.02;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    }

    animate();

    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else {
        animate();
      }
    });
  }

  /* ---------------------------------------------------------------
   * SCROLL REVEAL — IntersectionObserver-based fade/slide-in
   * ------------------------------------------------------------- */
  function initReveals() {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in-view"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add("in-view"), i * 60);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
  }

  /* ---------------------------------------------------------------
   * COUNTDOWN
   * ------------------------------------------------------------- */
  function initCountdown() {
    const cfg = window.APP_CONFIG || {};
    const target = new Date(cfg.eventDateTime || "2026-07-18T20:00:00").getTime();

    const els = {
      days: document.getElementById("cd-days"),
      hours: document.getElementById("cd-hours"),
      mins: document.getElementById("cd-mins"),
      secs: document.getElementById("cd-secs"),
    };
    if (!els.days) return;

    function pad(n) {
      return String(Math.max(0, n)).padStart(2, "0");
    }

    function tick() {
      const now = Date.now();
      let diff = target - now;
      if (diff < 0) diff = 0;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);

      els.days.textContent = pad(days);
      els.hours.textContent = pad(hours);
      els.mins.textContent = pad(mins);
      els.secs.textContent = pad(secs);
    }

    tick();
    setInterval(tick, 1000);
  }

  /* ---------------------------------------------------------------
   * CONFETTI BURST — lightweight DOM confetti on RSVP success
   * ------------------------------------------------------------- */
  function fireConfetti() {
    const colors = ["#d21f3c", "#9aa0ab", "#7a1220", "#ffffff"];
    const container = document.createElement("div");
    container.style.cssText =
      "position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden;";
    document.body.appendChild(container);

    const count = 60;
    for (let i = 0; i < count; i++) {
      const piece = document.createElement("span");
      const size = 6 + Math.random() * 6;
      piece.style.cssText = `
        position:absolute;
        left:${Math.random() * 100}%;
        top:-10px;
        width:${size}px;
        height:${size * 0.4}px;
        background:${colors[Math.floor(Math.random() * colors.length)]};
        opacity:${0.7 + Math.random() * 0.3};
        transform:rotate(${Math.random() * 360}deg);
        border-radius:2px;
      `;
      container.appendChild(piece);

      const duration = 2200 + Math.random() * 1800;
      const drift = (Math.random() - 0.5) * 200;

      piece.animate(
        [
          { transform: `translate(0, 0) rotate(0deg)`, opacity: 1 },
          {
            transform: `translate(${drift}px, ${window.innerHeight + 40}px) rotate(${
              360 + Math.random() * 360
            }deg)`,
            opacity: 0.9,
          },
        ],
        { duration, easing: "cubic-bezier(.25,.46,.45,.94)", fill: "forwards" }
      );
    }

    setTimeout(() => container.remove(), 4200);
  }

  /* ---------------------------------------------------------------
   * RSVP FORM
   * ------------------------------------------------------------- */
  function initRsvp() {
    const form = document.getElementById("rsvp-form");
    if (!form) return;

    const input = document.getElementById("guest-name");
    const btn = document.getElementById("rsvp-btn");
    const btnText = btn.querySelector(".btn-text");
    const spinner = btn.querySelector(".btn-spinner");
    const message = document.getElementById("rsvp-message");
    const cfg = window.APP_CONFIG || {};

    function setLoading(loading) {
      btn.disabled = loading;
      spinner.hidden = !loading;
      btnText.textContent = loading ? "Sending..." : "I'll Be There!";
    }

    function showMessage(text, type) {
      message.textContent = text;
      message.className = "rsvp-message " + (type || "");
    }

    function replaceFormWithThankYou(name) {
      form.style.transition = "opacity 0.4s ease, transform 0.4s ease";
      form.style.opacity = "0";
      form.style.transform = "translateY(-10px)";
      setTimeout(() => {
        form.hidden = true;
        showMessage(`Yay! See you there, ${name}! 🎉`, "success");
      }, 400);
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = input.value.trim();
      if (!name) return;

      setLoading(true);
      showMessage("", "");

      const url = cfg.googleSheetWebAppUrl;

      try {
        if (url) {
          // Apps Script web apps typically don't return CORS headers,
          // so we submit with no-cors and treat the request as fire-and-forget.
          await fetch(url, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({ name }),
          });
        }

        fireConfetti();
        replaceFormWithThankYou(name);
      } catch (err) {
        showMessage(
          "Something went wrong — please check your connection and try again.",
          "error"
        );
        setLoading(false);
      }
    });
  }

  /* ---------------------------------------------------------------
   * INIT
   * ------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    initThree();
    initReveals();
    initCountdown();
    initRsvp();
  });
})();
