(() => {
  const board = document.querySelector("[data-board]");
  const canvas = document.querySelector("[data-board-canvas]");
  const title = document.querySelector("[data-board-title]");

  if (!board || !canvas) {
    return;
  }

  let panX = 0;
  let panY = 0;
  let noteZ = 1;
  let imageZ = 10;
  let drag = null;

  const applyPan = () => {
    canvas.style.transform = `translate(${panX}px, ${panY}px)`;
  };

  const centerTitle = () => {
    const anchor = title ?? canvas;
    const midX = anchor.offsetLeft + anchor.offsetWidth / 2;
    const midY = anchor.offsetTop + anchor.offsetHeight / 2;
    panX = board.clientWidth / 2 - midX;
    panY = board.clientHeight / 2 - midY;
    applyPan();
  };

  centerTitle();

  canvas.querySelectorAll("img").forEach((img) => {
    img.setAttribute("draggable", "false");
    img.addEventListener("dragstart", (event) => event.preventDefault());
  });

  const startItemDrag = (event, item) => {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    item.setPointerCapture(event.pointerId);
    if (item.classList.contains("board-note")) {
      noteZ += 1;
      item.style.zIndex = String(noteZ);
    } else {
      imageZ += 1;
      item.style.zIndex = String(imageZ);
    }
    item.classList.add("is-dragging");
    drag = {
      type: "item",
      el: item,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      left: parseFloat(item.style.left) || item.offsetLeft,
      top: parseFloat(item.style.top) || item.offsetTop,
    };
  };

  canvas.querySelectorAll("[data-board-item]").forEach((item) => {
    item.addEventListener("pointerdown", (event) => startItemDrag(event, item));
  });

  board.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || drag) {
      return;
    }

    if (event.target.closest("[data-board-item]")) {
      return;
    }

    event.preventDefault();
    board.setPointerCapture(event.pointerId);
    board.classList.add("is-panning");
    drag = {
      type: "pan",
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      panX,
      panY,
    };
  });

  const onMove = (event) => {
    if (!drag || event.pointerId !== drag.pointerId) {
      return;
    }

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;

    if (drag.type === "pan") {
      panX = drag.panX + dx;
      panY = drag.panY + dy;
      applyPan();
      return;
    }

    drag.el.style.left = `${drag.left + dx}px`;
    drag.el.style.top = `${drag.top + dy}px`;
  };

  const onUp = (event) => {
    if (!drag || event.pointerId !== drag.pointerId) {
      return;
    }

    if (drag.type === "item") {
      drag.el.classList.remove("is-dragging");
    }

    board.classList.remove("is-panning");
    drag = null;
  };

  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onUp);

  board.addEventListener(
    "wheel",
    (event) => {
      if (event.ctrlKey) {
        return;
      }

      event.preventDefault();
      panX -= event.deltaX;
      panY -= event.deltaY;
      applyPan();
    },
    { passive: false }
  );

  const portfolio = document.querySelector(".portfolio");
  const waitForImage = (img) =>
    img.complete
      ? Promise.resolve()
      : new Promise((resolve) => {
          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
        });

  const criticalImages = [...document.querySelectorAll(".portfolio img")].filter(
    (img) => img.loading !== "lazy"
  );

  Promise.race([
    Promise.all(criticalImages.map(waitForImage)),
    new Promise((resolve) => setTimeout(resolve, 2000)),
  ]).then(() => requestAnimationFrame(() => portfolio?.classList.add("is-visible")));
})();
