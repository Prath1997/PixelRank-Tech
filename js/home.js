(() => {
  "use strict";
  const $ = (s, p = document) => p.querySelector(s),
    $$ = (s, p = document) => [...p.querySelectorAll(s)];
  const rm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* 3D thickness: stack copies of the real logo to fake depth */
  const L = $("#logo3d");
  if (L) {
    const src = $("img", L).src;
    $("img", L).classList.add("f");
    for (let i = 1; i <= 14; i++) {
      const im = new Image();
      im.src = src;
      im.style.transform = `translateZ(${-i * 3}px)`;
      im.style.filter = `brightness(${Math.max(0.15, 0.75 - i * 0.05)}) saturate(1.3)`;
      L.insertBefore(im, L.firstChild);
    }
  }
  let rx = 0,
    ry = 0,
    tx = 0,
    ty = 0;
  const st = $("#stage");
  addEventListener("pointermove", (e) => {
    tx = (e.clientY / innerHeight - 0.5) * -24;
    ty = (e.clientX / innerWidth - 0.5) * 40;
  });
  /* WebGL background: particles + floating glass crystals */
  const cv = $("#bg3d");
  if (window.THREE && !rm) {
    const r = new THREE.WebGLRenderer({
      canvas: cv,
      alpha: true,
      antialias: true,
    });
    r.setPixelRatio(Math.min(devicePixelRatio, 2));
    const sc = new THREE.Scene(),
      cam = new THREE.PerspectiveCamera(60, 1, 0.1, 200);
    cam.position.z = 40;
    const n = 900,
      pos = new Float32Array(n * 3),
      col = new Float32Array(n * 3),
      A = new THREE.Color("#00a3ff"),
      B = new THREE.Color("#00e676");
    for (let i = 0; i < n; i++) {
      pos.set(
        [
          (Math.random() - 0.5) * 120,
          (Math.random() - 0.5) * 120,
          (Math.random() - 0.5) * 80,
        ],
        i * 3,
      );
      const c = A.clone().lerp(B, Math.random());
      col.set([c.r, c.g, c.b], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const pts = new THREE.Points(
      g,
      new THREE.PointsMaterial({
        size: 0.35,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
      }),
    );
    sc.add(pts);
    const cr = [];
    for (let i = 0; i < 14; i++) {
      const m = new THREE.Mesh(
        new THREE.OctahedronGeometry(1 + Math.random() * 1.6),
        new THREE.MeshBasicMaterial({
          color: i % 2 ? 0x00a3ff : 0x00e676,
          wireframe: true,
          transparent: true,
          opacity: 0.35,
        }),
      );
      m.position.set(
        (Math.random() - 0.5) * 70,
        (Math.random() - 0.5) * 50,
        -Math.random() * 30,
      );
      m.userData.s = Math.random() * 0.01 + 0.003;
      sc.add(m);
      cr.push(m);
    }
    const rs = () => {
      r.setSize(innerWidth, innerHeight);
      cam.aspect = innerWidth / innerHeight;
      cam.updateProjectionMatrix();
    };
    rs();
    addEventListener("resize", rs);
    let sy = 0;
    addEventListener("scroll", () => (sy = scrollY));
    (function loop(t) {
      pts.rotation.y = t * 0.00004;
      pts.position.y = sy * 0.01;
      cr.forEach((m) => {
        m.rotation.x += m.userData.s;
        m.rotation.y += m.userData.s * 1.4;
      });
      cam.position.x += (ty * 0.1 - cam.position.x) * 0.03;
      cam.position.y += (tx * 0.1 - cam.position.y) * 0.03;
      r.render(sc, cam);
      requestAnimationFrame(loop);
    })(0);
  }
  /* logo tilt loop + float */
  (function tick(t) {
    rx += (tx - rx) * 0.06;
    ry += (ty - ry) * 0.06;
    if (L)
      L.style.transform = `rotateX(${rx}deg) rotateY(${ry + Math.sin(t * 0.0008) * 10}deg) translateY(${Math.sin(t * 0.0015) * 12}px)`;
    requestAnimationFrame(tick);
  })(0);
  /* card 3D tilt + light follow */
  $$(".tilt").forEach((c) => {
    c.addEventListener("pointermove", (e) => {
      const b = c.getBoundingClientRect(),
        x = (e.clientX - b.left) / b.width,
        y = (e.clientY - b.top) / b.height;
      c.style.setProperty("--mx", x * 100 + "%");
      c.style.setProperty("--my", y * 100 + "%");
      c.style.transform = `perspective(700px) rotateX(${(0.5 - y) * 10}deg) rotateY(${(x - 0.5) * 12}deg) translateZ(8px)`;
    });
    c.addEventListener("pointerleave", () => (c.style.transform = ""));
  });
  /* GSAP: intro, scroll reveals, counters, progress bar */
  if (window.gsap && !rm) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.from(".hero-text>*,.ph>*", {
      y: 50,
      opacity: 0,
      stagger: 0.12,
      duration: 1,
      ease: "power3.out",
    });
    gsap.from(".logo3d", {
      scale: 0.3,
      opacity: 0,
      rotateY: -180,
      duration: 1.8,
      ease: "expo.out",
    });
    gsap.from(".chip", {
      scale: 0,
      opacity: 0,
      stagger: 0.1,
      delay: 0.8,
      ease: "back.out(2)",
    });
    $$(".sec h2,.two .list li,details,.sec .eye,.card,.steps div").forEach(
      (el) => {
        el.classList.add("rv");
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 90%" },
        });
      },
    );
    $$("[data-n]").forEach((el) => {
      const o = { v: 0 };
      gsap.to(o, {
        v: +el.dataset.n,
        duration: 2.2,
        delay: 0.6,
        ease: "power2.out",
        onUpdate: () => (el.textContent = Math.round(o.v)),
      });
    });
    if ($(".hero"))
      gsap.to(".stage", {
        yPercent: -12,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          scrub: 1,
          start: "top top",
          end: "bottom top",
        },
      });
    gsap.to(".progress", {
      width: "100%",
      ease: "none",
      scrollTrigger: { scrub: 0.3, start: 0, end: "max" },
    });
  } else $$("[data-n]").forEach((e) => (e.textContent = e.dataset.n));
  /* v2: nav toggle, cursor glow, magnetic buttons */
  const bg = $(".burger"),
    nv = $(".nav nav");
  if (bg) bg.onclick = () => nv.classList.toggle("open");
  const cu = $(".cur");
  addEventListener("pointermove", (e) => {
    if (cu) cu.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
  });
  $$(".btn.pri,.btn.ghost").forEach((b) => {
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.15}px,${(e.clientY - r.top - r.height / 2) * 0.25 - 3}px)`;
    });
    b.addEventListener("pointerleave", () => (b.style.transform = ""));
  });
  /* contact form -> WhatsApp / mail */
  const cf = $("#cf");
  if (cf)
    cf.addEventListener("submit", (e) => {
      e.preventDefault();
      const d = new FormData(cf),
        m = `Hi PixelRank, I'm ${d.get("n")} (${d.get("e")}). Service: ${d.get("s")}. ${d.get("m")}`;
      location.href =
        d.get("via") === "mail"
          ? `mailto:info@pixelranktech.com?subject=New project enquiry&body=${encodeURIComponent(m)}`
          : `https://wa.me/91XXXXXXXXXX?text=${encodeURIComponent(m)}`;
    });
})();
