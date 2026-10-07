/* ============================================================
   Garage Doors by Atkins & Co. Inc. — Sacramento, CA
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- Page-load: populate _page hidden fields ------------- */
  function setPageFields() {
    var href = window.location.href;
    document.querySelectorAll('input[name="_page"]').forEach(function (el) {
      el.value = href;
    });
  }

  /* ---------------- Success confirmation (?submitted=1) ----------------- */
  function showSuccessIfSubmitted() {
    var params;
    try {
      params = new URLSearchParams(window.location.search);
    } catch (e) {
      return;
    }
    if (params.get("submitted") === "1") {
      showSuccess();
      var contact = document.getElementById("contact");
      if (contact && params.get("anchor") !== "none") {
        try { contact.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (e) {}
      }
    }
  }

  function showSuccess() {
    var form = document.getElementById("contactForm");
    var success = document.getElementById("formSuccess");
    if (form) form.hidden = true;
    if (success) {
      success.hidden = false;
      try { success.focus(); } catch (e) {}
    }
  }

  /* ---------------- Sticky header shadow -------------------------------- */
  function headerShadow() {
    var header = document.getElementById("siteHeader");
    if (!header) return;
    var onScroll = function () {
      if (window.scrollY > 8) header.classList.add("is-scrolled");
      else header.classList.remove("is-scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------------- Mobile nav toggle ----------------------------------- */
  function navToggle() {
    var toggle = document.getElementById("navToggle");
    var nav = document.getElementById("primaryNav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------------- Animated stats -------------------------------------- */
  function animateStats() {
    var nums = document.querySelectorAll(".stat__num[data-count]");
    if (!nums.length || !("IntersectionObserver" in window)) {
      nums.forEach(function (n) { n.textContent = finalStatText(n); });
      return;
    }
    var seen = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !seen) {
          seen = true;
          nums.forEach(countUp);
          io.disconnect();
        }
      });
    }, { threshold: 0.4 });
    io.observe(nums[0].closest(".stats") || nums[0]);
  }

  function finalStatText(el) {
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var isDecimal = String(target).indexOf(".") !== -1;
    return prefix + (isDecimal ? target.toFixed(1) : target) + suffix;
  }

  function countUp(el) {
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var isDecimal = String(target).indexOf(".") !== -1;
    var start = null;
    var duration = 1200;

    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = prefix + (isDecimal ? val.toFixed(1) : Math.round(val)) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------------- Form: AJAX submit to LeadrVision -------------------- */
  function wireForm() {
    var form = document.getElementById("contactForm");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      if (typeof window.fetch !== "function") return; // let the plain form POST

      e.preventDefault();

      var data = {};
      new FormData(form).forEach(function (value, key) {
        data[key] = value;
      });
      data._page = window.location.href; // ensure the return page is the current URL

      var action = form.getAttribute("action");
      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Sending…"; }

      fetch(action, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data)
      })
        .then(function (res) { return res.json().catch(function () { return { ok: res.ok }; }); })
        .then(function (json) {
          if (json && json.ok) {
            showSuccess();
          } else {
            form.submit(); // fall back to a native, non-JS submission
          }
        })
        .catch(function () {
          form.submit(); // network error: hand off to the browser
        })
        .finally(function () {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Get My Free Estimate"; }
        });
    });
  }

  /* ---------------- Init ------------------------------------------------- */
  function init() {
    setPageFields();
    headerShadow();
    navToggle();
    animateStats();
    wireForm();
    showSuccessIfSubmitted();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
