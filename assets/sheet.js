import { places } from "./data.js";
import { photos } from "./photos.js";
import { image, esc, navigation, url, icon } from "./shared.js";
export function installSheet() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `<dialog class="sheet" id="spot-sheet" aria-labelledby="spot-title"><header class="sheet-header"><span class="handle" aria-hidden="true"></span><span class="eyebrow">沿途的一个地方</span><button id="expand-sheet" aria-label="展开详情面板">展开 ↟</button><button id="close-sheet" aria-label="关闭景点详情">关闭 ×</button></header><div class="sheet-scroll" id="sheet-scroll"></div><div class="sheet-bottom" id="sheet-bottom"></div></dialog><dialog class="lightbox" id="lightbox" aria-label="照片大图"><button id="close-lightbox">关闭 ×</button><img id="large-photo" alt=""><div class="lightbox-caption" id="large-caption"></div></dialog>`,
  );
  const sheet = document.querySelector("#spot-sheet"),
    lightbox = document.querySelector("#lightbox");
  let active = "",
    previousFocus = null,
    pageScroll = 0;
  const state = () => new URLSearchParams(location.hash.slice(1));
  const keys = (id) =>
    Object.keys(photos).filter(
      (k) =>
        (k === id || k.startsWith(id + "-")) &&
        photos[k].status === "available",
    );
  function close() {
    if (history.state?.coastModal) {
      history.back();
    } else {
      const h = state();
      if (h.has("photo")) {
        h.delete("photo");
        history.replaceState(
          history.state,
          "",
          location.pathname + location.search + "#" + h.toString(),
        );
      } else
        history.replaceState(
          history.state,
          "",
          location.pathname + location.search,
        );
      sync();
    }
  }
  function open(id) {
    if (!places[id]) return;
    previousFocus = document.activeElement;
    history.pushState(
      { coastModal: true },
      "",
      location.pathname + location.search + "#spot=" + id,
    );
    sync();
  }
  function render(id) {
    const p = places[id],
      images = keys(id);
    sheet.classList.remove("expanded");
    document.querySelector("#expand-sheet").textContent = "展开 ↟";
    document.querySelector("#sheet-scroll").innerHTML =
      `<div class="gallery"><div class="gallery-track">${images.length ? images.map((k) => `<button data-large="${k}" aria-label="放大${p.name}照片">${image(k, p.name, true)}</button>`).join("") : image(id, p.name)}</div><div class="gallery-caption"><span>${images.length ? `${images.length} 张实景 · 点照片放大` : "图片待补，攻略仍可阅读"}</span>${images.length > 1 ? `<div class="gallery-buttons"><button id="photo-prev" aria-label="上一张照片">‹</button><button id="photo-next" aria-label="下一张照片">›</button></div>` : ""}</div></div><div class="sheet-content"><p class="eyebrow">${p.kind}</p><h2 id="spot-title">${p.name}</h2><p>${p.text}</p><h3>可以这样逛</h3><p>${p.guide}</p>${p.facts.length ? `<h3>顺路记住</h3><ul>${p.facts.map((f) => `<li>${f}</li>`).join("")}</ul>` : ""}<h3>出发前留意</h3><p>${p.note}</p><div class="photo-credit">${images.map((k) => `<p>照片：${esc(photos[k].artist)} · ${esc(photos[k].license)}<br><a href="${esc(photos[k].source)}" target="_blank" rel="noopener noreferrer">查看原图来源 ↗</a></p>`).join("") || "尚未取得可核实的对应实景图片。"}</div></div>`;
    document.querySelector("#sheet-bottom").innerHTML =
      `<a class="primary-link" href="${navigation(p.name, p.city, p.city.includes("鼓浪屿"))}" target="_blank" rel="noopener noreferrer">${icon("nav")}${p.city.includes("鼓浪屿") ? "查找步行目的地" : "在高德查找目的地"} ↗</a>`;
    document.querySelectorAll("[data-large]").forEach(
      (b) =>
        (b.onclick = () => {
          history.pushState(
            { coastModal: true },
            "",
            location.pathname +
              location.search +
              "#spot=" +
              id +
              "&photo=" +
              b.dataset.large,
          );
          sync();
        }),
    );
    const gallery = document.querySelector(".gallery-track");
    if (images.length > 1) {
      let photoIndex = 0;
      const move = (d) => {
        photoIndex =
          (Math.round(gallery.scrollLeft / gallery.clientWidth) +
            d +
            images.length) %
          images.length;
        gallery.scrollTo({
          left: photoIndex * gallery.clientWidth,
          behavior: matchMedia("(prefers-reduced-motion:reduce)").matches
            ? "instant"
            : "smooth",
        });
      };
      document.querySelector("#photo-prev").onclick = () => move(-1);
      document.querySelector("#photo-next").onclick = () => move(1);
    }
    document.querySelector("#sheet-scroll").scrollTop = 0;
  }
  function sync() {
    const s = state(),
      id = s.get("spot"),
      photo = s.get("photo");
    if (!places[id]) {
      if (!sheet.open && !lightbox.open) return;
      if (lightbox.open) lightbox.close();
      if (sheet.open) sheet.close();
      document.body.style.overflow = "";
      active = "";
      if (previousFocus?.isConnected)
        previousFocus.focus({ preventScroll: true });
      window.scrollTo({ top: pageScroll, behavior: "instant" });
      return;
    }
    if (active !== id) {
      render(id);
      active = id;
    }
    if (!sheet.open) {
      pageScroll = window.scrollY;
      sheet.showModal();
      document.body.style.overflow = "hidden";
      window.scrollTo({ top: pageScroll, behavior: "instant" });
    }
    if (photo && keys(id).includes(photo)) {
      const p = photos[photo];
      document.querySelector("#large-photo").src = url(p.file);
      document.querySelector("#large-photo").alt = places[id].name + " · 实景";
      document.querySelector("#large-caption").textContent =
        places[id].name + " · " + p.artist;
      if (!lightbox.open) lightbox.showModal();
    } else if (lightbox.open) lightbox.close();
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-spot]");
    if (b) open(b.dataset.spot);
  });
  document.querySelector("#close-sheet").onclick = close;
  document.querySelector("#close-lightbox").onclick = close;
  sheet.addEventListener("cancel", (e) => {
    e.preventDefault();
    close();
  });
  lightbox.addEventListener("cancel", (e) => {
    e.preventDefault();
    close();
  });
  sheet.addEventListener("click", (e) => {
    if (e.target === sheet) {
      const r = sheet.getBoundingClientRect();
      if (e.clientY < r.top || e.clientX < r.left || e.clientX > r.right)
        close();
    }
  });
  const expand = document.querySelector("#expand-sheet");
  expand.onclick = () => {
    const on = sheet.classList.toggle("expanded");
    expand.textContent = on ? "收起 ↡" : "展开 ↟";
    expand.setAttribute("aria-label", on ? "收起详情面板" : "展开详情面板");
  };
  let startY = null;
  const handle = document.querySelector(".sheet-header");
  handle.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button")) return;
    startY = e.clientY;
    handle.setPointerCapture(e.pointerId);
  });
  handle.addEventListener("pointermove", (e) => {
    if (startY === null) return;
    const d = e.clientY - startY;
    if (d > 0) sheet.style.transform = `translateY(${Math.min(d, 200)}px)`;
  });
  handle.addEventListener("pointerup", (e) => {
    if (startY === null) return;
    const d = e.clientY - startY;
    startY = null;
    sheet.style.transform = "";
    if (d > 85) close();
    else if (d < -45) {
      sheet.classList.add("expanded");
      expand.textContent = "收起 ↡";
    }
  });
  handle.addEventListener("pointercancel", () => {
    startY = null;
    sheet.style.transform = "";
  });
  window.addEventListener("popstate", sync);
  window.addEventListener("hashchange", sync);
  sync();
}
