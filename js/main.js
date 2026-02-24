/**
 * 青岛西海岸新区第一高级中学 官方网站
 * 主脚本 - js/main.js
 */

(function () {
  "use strict";

  /* ── 导航栏汉堡菜单 ───────────────── */
  var toggle = document.getElementById("nav-toggle");
  var navList = document.getElementById("nav-list");
  if (toggle && navList) {
    toggle.addEventListener("click", function () {
      navList.classList.toggle("open");
    });
    // 点击外部关闭
    document.addEventListener("click", function (e) {
      if (!toggle.contains(e.target) && !navList.contains(e.target)) {
        navList.classList.remove("open");
      }
    });
  }

  /* ── 高亮当前页导航项 ────────────── */
  var navLinks = document.querySelectorAll("#nav-list > li > a");
  var currentPage = window.location.pathname.split("/").pop() || "index.html";
  navLinks.forEach(function (link) {
    var href = link.getAttribute("href");
    if (href === currentPage || (currentPage === "" && href === "index.html")) {
      link.closest("li").classList.add("active");
    }
  });

  /* ── 英雄轮播 ─────────────────────── */
  var slides = document.querySelectorAll(".hero-slide");
  var dots   = document.querySelectorAll(".hero-dot");
  var prevBtn = document.querySelector(".hero-arrow.prev");
  var nextBtn = document.querySelector(".hero-arrow.next");
  var current = 0;
  var timer;

  function goTo(n) {
    if (!slides.length) return;
    slides[current].classList.remove("active");
    if (dots[current]) dots[current].classList.remove("active");
    current = (n + slides.length) % slides.length;
    slides[current].classList.add("active");
    if (dots[current]) dots[current].classList.add("active");
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(function () { goTo(current + 1); }, 5000);
  }

  if (slides.length) {
    slides[0].classList.add("active");
    if (dots[0]) dots[0].classList.add("active");
    startTimer();

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () { goTo(i); startTimer(); });
    });
    if (prevBtn) prevBtn.addEventListener("click", function () { goTo(current - 1); startTimer(); });
    if (nextBtn) nextBtn.addEventListener("click", function () { goTo(current + 1); startTimer(); });
  }

  /* ── 返回顶部按钮 ─────────────────── */
  var btt = document.getElementById("back-to-top");
  if (btt) {
    window.addEventListener("scroll", function () {
      btt.classList.toggle("visible", window.scrollY > 400);
    });
    btt.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ── 数字滚动动画 ─────────────────── */
  function animateNumbers() {
    var counters = document.querySelectorAll("[data-count]");
    counters.forEach(function (el) {
      if (el.dataset.animated) return;
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 60) {
        el.dataset.animated = "1";
        var target = parseInt(el.dataset.count, 10);
        var duration = 1500;
        var step = target / (duration / 16);
        var current = 0;
        var interval = setInterval(function () {
          current += step;
          if (current >= target) { current = target; clearInterval(interval); }
          el.textContent = Math.floor(current).toLocaleString();
        }, 16);
      }
    });
  }
  window.addEventListener("scroll", animateNumbers);
  animateNumbers();

  /* ── 滚动显示元素 ─────────────────── */
  function fadeInOnScroll() {
    var items = document.querySelectorAll(".fade-in");
    items.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 50) {
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }
    });
  }
  var fadeEls = document.querySelectorAll(".fade-in");
  fadeEls.forEach(function (el) {
    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
  });
  window.addEventListener("scroll", fadeInOnScroll);
  fadeInOnScroll();

  /* ── 公告轮换 ─────────────────────── */
  var noticeItems = document.querySelectorAll(".notice-ticker-item");
  var noticeIdx = 0;
  if (noticeItems.length > 1) {
    noticeItems[0].style.display = "block";
    setInterval(function () {
      noticeItems[noticeIdx].style.display = "none";
      noticeIdx = (noticeIdx + 1) % noticeItems.length;
      noticeItems[noticeIdx].style.display = "block";
    }, 3500);
  }

})();
