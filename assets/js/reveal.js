(() => {
  const selector = [
    ".case-hero-media",
    ".case-panel",
    ".case-media-panel",
    ".case-carousel",
    ".projects .card",
    ".content > .playground",
    ".content > .footer",
  ].join(", ");
  const nodes = [...document.querySelectorAll(selector)];

  if (!nodes.length) {
    return;
  }

  const showAll = () => {
    nodes.forEach((node) => node.classList.add("is-inview"));
  };

  if (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    !("IntersectionObserver" in window)
  ) {
    showAll();
    return;
  }

  const content = document.querySelector(".content");
  const useContentRoot =
    Boolean(content) &&
    content.scrollHeight > content.clientHeight + 1 &&
    !window.matchMedia("(max-width: 1280px)").matches;
  const root = useContentRoot ? content : null;

  const setEdge = (entry) => {
    const rootTop = entry.rootBounds?.top ?? 0;
    entry.target.classList.toggle("reveal-up", entry.boundingClientRect.top < rootTop);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        setEdge(entry);
        entry.target.classList.toggle("is-inview", entry.isIntersecting);
      });
    },
    {
      root,
      rootMargin: "0px",
      threshold: 0,
    }
  );

  nodes.forEach((node) => observer.observe(node));
})();

(() => {
  const footer = document.querySelector(".footer--next");
  const title = footer?.querySelector(".footer__text");
  const button = footer?.querySelector(".footer__next");

  if (!footer || !title || !button) {
    return;
  }

  const update = () => {
    footer.classList.remove("is-stacked");

    const styles = getComputedStyle(footer);
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 16;
    const padding =
      Number.parseFloat(styles.paddingLeft) + Number.parseFloat(styles.paddingRight);
    const available = footer.clientWidth - padding;
    const needed = title.scrollWidth + button.offsetWidth + gap;

    footer.classList.toggle("is-stacked", needed > available + 0.5);
  };

  const schedule = () => requestAnimationFrame(update);

  if (typeof ResizeObserver === "function") {
    new ResizeObserver(schedule).observe(footer);
  } else {
    window.addEventListener("resize", schedule);
  }

  if (document.fonts?.ready) {
    document.fonts.ready.then(schedule);
  }

  schedule();
})();
