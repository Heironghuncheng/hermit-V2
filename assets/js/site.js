(() => {
  "use strict";

  const normalizePath = (path) => {
    let value = path.replace(/\/index\.html$/, "/");
    if (value.length > 1) {
      value = value.replace(/\/+$/, "");
    }
    return value;
  };

  const markActiveNav = () => {
    const current = normalizePath(window.location.pathname);
    document.querySelectorAll("#site-header .site-nav a, #mobile-menu a").forEach((link) => {
      let target;
      try {
        target = normalizePath(new URL(link.href, window.location.origin).pathname);
      } catch (error) {
        return;
      }
      const matches = target === current || (target !== "" && target !== "/" && current.startsWith(`${target}/`));
      if (matches) {
        link.classList.add("is-active");
        link.setAttribute("aria-current", "page");
      }
    });
  };

  const mountReadingProgress = () => {
    if (!document.querySelector(".post-header")) {
      return;
    }
    const bar = document.createElement("div");
    bar.id = "read-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);

    let queued = false;
    const update = () => {
      queued = false;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? Math.min(Math.max(window.scrollY / scrollable, 0), 1) : 0;
      bar.style.transform = `scaleX(${ratio})`;
    };
    const requestUpdate = () => {
      if (queued) {
        return;
      }
      queued = true;
      window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    update();
  };

  const copyText = async (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(area);
    if (!copied) {
      throw new Error("Copy command was rejected");
    }
  };

  const mountCopyButtons = () => {
    document.querySelectorAll("[data-copy-email]").forEach((button) => {
      const idleLabel = button.dataset.copyLabel || button.textContent.trim();
      const copiedLabel = button.dataset.copiedLabel || "Copied";
      const failedLabel = button.dataset.failedLabel || "Copy failed";
      let timer;

      button.addEventListener("click", async () => {
        try {
          await copyText(button.dataset.copyEmail);
          button.textContent = copiedLabel;
        } catch (error) {
          button.textContent = failedLabel;
          console.error("Copy failed", error);
        }
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          button.textContent = idleLabel;
        }, 1600);
      });
    });
  };

  const start = () => {
    markActiveNav();
    mountReadingProgress();
    mountCopyButtons();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
