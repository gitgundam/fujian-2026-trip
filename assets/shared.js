import { photos } from "./photos.js";
export const root = new URL("../", import.meta.url);
export const url = (path) => new URL(path, root).href;
export const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export const icon = (name) =>
  `<svg viewBox="0 0 24 24" aria-hidden="true">${{ map: '<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Z"/><path d="M9 3v16M15 5v16"/>', bed: '<path d="M3 19V7m18 12V7M3 15h18M3 11h18V7H3zM7 7V5h10v2"/>', bag: '<rect x="5" y="6" width="14" height="15" rx="2"/><path d="M9 6V3h6v3M9 10v7m6-7v7"/>', arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>', back: '<path d="M20 12H5m6-6-6 6 6 6"/>', play: '<path d="m9 5 10 7-10 7Z"/>', pause: '<path d="M8 5v14M16 5v14"/>', nav: '<path d="m20 4-7 17-3-8-8-3Z"/>' }[name] || ""}</svg>`;
export const nav = (active) =>
  `<nav class="nav" aria-label="主要导航">${[
    ["index.html", "全程", "map", "home"],
    ["stays.html", "住宿", "bed", "stays"],
    ["essentials.html", "随行", "bag", "essentials"],
  ]
    .map(
      ([href, label, i, id]) =>
        `<a href="${url(href)}" ${active === id ? 'aria-current="page"' : ""}>${icon(i)}${label}</a>`,
    )
    .join("")}</nav>`;
export const topbar = (back = false, label = "山海之间") =>
  `<header class="topbar ${back ? "city-top" : ""}">${back ? `<a class="back" href="${url("index.html")}">${icon("back")}全程地图</a><span class="eyebrow">${esc(label)}</span>` : `<a class="wordmark" href="${url("index.html")}"><span class="brand-seal">行</span>山海之间</a><span class="top-meta">两个人 · 一辆车 · 八天七晚</span>`}</header>`;
export const store = {
  get(k, f = null) {
    try {
      return JSON.parse(sessionStorage.getItem("coast-v2:" + k)) ?? f;
    } catch {
      return f;
    }
  },
  set(k, v) {
    try {
      sessionStorage.setItem("coast-v2:" + k, JSON.stringify(v));
    } catch {}
  },
};
export function image(key, alt = "", eager = false) {
  const p = photos[key];
  return p?.status === "available"
    ? `<img src="${url(p.file)}" alt="${esc(alt || p.title.replace(/^File:/, ""))}" width="${p.width}" height="${p.height}" loading="${eager ? "eager" : "lazy"}" decoding="async" ${eager ? 'fetchpriority="high"' : ""}>`
    : `<div class="no-photo"><b>${esc(alt || "沿途")}</b><span>实景图片待补 · 保留地点与攻略</span></div>`;
}
export const transitArt = (name, label) =>
  `<div class="transit-art" role="img" aria-label="${esc(name)}行程文字插画，非实景照片"><span>${esc(name)}</span><small>${esc(label)}</small></div>`;
export function navigation(name, city, walk = false) {
  return `https://uri.amap.com/search?keyword=${encodeURIComponent(city + " " + name)}&city=${encodeURIComponent(city)}&view=map&src=fujian-guide${walk ? "&mode=walk" : ""}`;
}
export const footer = () =>
  `<footer class="source-footer">行程依据：2026 年 9 月 23 日整理的福建自驾攻略。车程为平时路况，候选不代表预订。<br><a href="${url("credits.html")}">图片来源与资料说明</a> · 两个人，慢慢走。</footer>`;
export function installImageFallback() {
  document.addEventListener(
    "error",
    (e) => {
      if (e.target.tagName === "IMG") {
        if (e.target.id === "large-photo") {
          const photo = e.target;
          const dialog = photo.closest("dialog");
          dialog.querySelector(".photo-error")?.remove();
          const fallback = document.createElement("div");
          fallback.className = "no-photo photo-error";
          fallback.textContent = "大图暂时无法加载，关闭后仍可阅读攻略。";
          photo.style.display = "none";
          dialog.append(fallback);
          photo.addEventListener(
            "load",
            () => {
              photo.style.display = "";
              fallback.remove();
            },
            { once: true },
          );
          return;
        }
        const el = document.createElement("div");
        el.className = "no-photo photo-error";
        el.innerHTML = `<b>${esc(e.target.alt)}</b><span>图片暂时无法加载 · 文字攻略仍可阅读</span>`;
        e.target.replaceWith(el);
      }
    },
    true,
  );
}
