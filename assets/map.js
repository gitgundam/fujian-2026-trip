import { cities, journey } from "./data.js";
import { coastline } from "./coast.js";
import {
  url,
  esc,
  icon,
  image,
  store,
  transitArt,
  nav,
  topbar,
} from "./shared.js";
const project = ([x, y]) => [(x - 116.4) * 78, (31.25 - y) * 78];
const coords = Object.fromEntries(cities.map((c) => [c.id, project(c.coord)]));
const point = (id) => coords[id].map((n) => n.toFixed(1)).join(" ");
const segments = [
  `M${point("tongxiang")} C330 158 267 223 ${point("fuzhou")}`,
  `M${point("fuzhou")} Q257 419 ${point("pingtan")}`,
  `M${point("pingtan")} Q245 478 ${point("hanjiang")}`,
  `M${point("hanjiang")} Q177 477 ${point("xiamen")}`,
  `M${point("xiamen")} Q145 512 ${point("jinjiang")}`,
  `M${point("jinjiang")} C110 351 193 184 ${point("tongxiang")}`,
];
const callouts = {
  tongxiang: [350, 66],
  fuzhou: [287, 340],
  pingtan: [341, 446],
  hanjiang: [122, 437],
  xiamen: [77, 591],
  jinjiang: [250, 561],
};
export function renderHome() {
  document.body.className = "home";
  document.querySelector("#app").outerHTML =
    `${topbar()}<main id="main" class="home-main"><section class="atlas" aria-label="全程互动地图"><div class="atlas-heading"><h1>福建，沿海慢行</h1><p>09.30 — 10.07<br>沿途，不必匆忙。</p></div><div class="compass" aria-label="北">N</div><div class="map-stage"><svg viewBox="0 0 470 650" role="group" aria-label="桐乡往返福建，点击城市选择站点"><defs><pattern id="grid" width="78" height="78" patternUnits="userSpaceOnUse"><path d="M78 0H0V78" class="map-grid"/></pattern></defs><rect x="-150" y="-100" width="800" height="850" fill="url(#grid)"/><g class="map-world"><path class="land" d="${coastline}"/><text class="geo-label" x="185" y="206">浙江</text><text class="geo-label" x="65" y="376">福建</text><text class="sea-label" x="371" y="274" transform="rotate(12 371 274)">东 海</text><text class="sea-label" x="318" y="564" transform="rotate(-59 318 564)">台湾海峡</text>${segments.map((d, i) => `<path id="segment-${i}" class="${i === 5 ? "return-path" : "route-path"}" d="${d}"/>`).join("")}<path id="progress-path" class="route-highlight" d=""/><circle id="traveller" class="moving-light" r="6" visibility="hidden"/>${cities
      .map((c, i) => {
        const [x, y] = coords[c.id],
          [lx, ly] = callouts[c.id];
        return `<g class="map-node" role="button" tabindex="0" data-city="${c.id}" aria-label="${c.name}，${c.tag}" aria-pressed="false"><path class="node-leader" d="M${x} ${y} L${lx} ${ly - 10}"/><circle class="node-halo" cx="${x}" cy="${y}" r="20"/><circle class="node-core" cx="${x}" cy="${y}" r="6"/><rect class="hit" x="${lx - 23}" y="${ly - 39}" width="98" height="70" rx="12"/><text class="node-number" x="${lx}" y="${ly - 22}">${i === 0 ? "START / END" : String(i).padStart(2, "0")}</text><text class="node-name" x="${lx}" y="${ly + 5}">${c.name}</text></g>`;
      })
      .join(
        "",
      )}</g></svg></div><div class="map-legend" aria-label="图例"><span>沿海去程</span><span>北上返程</span></div><div class="map-actions"><button class="play-button" id="play">${icon("play")}<span>播放全程</span></button><button class="reset-button" id="reset">恢复全景 ↗</button></div><p class="map-caption">城市间路线示意 · 非道路导航 · 海岸数据 Natural Earth</p></section><section class="preview" id="preview" aria-label="选中站点"></section><div class="sr-only" id="journey-status" aria-live="polite"></div></main>${nav("home")}`;
  let current = store.get("city", "pingtan");
  if (!cities.some((c) => c.id === current)) current = "pingtan";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let running = false,
    elapsed = 0,
    last = 0,
    frame = 0,
    lastSegment = -1;
  const duration = 3300,
    total = segments.length * duration;
  function setCity(id, manual = true) {
    if (manual) {
      pause();
      elapsed = 0;
      lastSegment = -1;
      document.querySelector("#progress-path").setAttribute("d", "");
      document.querySelector("#traveller").setAttribute("visibility", "hidden");
      updateButton();
    }
    current = id;
    store.set("city", id);
    const c = cities.find((c) => c.id === id),
      index = cities.indexOf(c);
    document
      .querySelectorAll(".map-node")
      .forEach((n) =>
        n.setAttribute("aria-pressed", String(n.dataset.city === id)),
      );
    const preview = document.querySelector("#preview");
    preview.innerHTML = `<div class="preview-counter"><span class="eyebrow">沿途的一站 / JOURNEY NOTES</span><span class="pages"><strong>${String(index + 1).padStart(2, "0")}</strong> / 06</span></div><a class="preview-photo" href="${url("cities/" + id + ".html")}" aria-label="走进${c.name}">${c.photo ? image(c.photo, c.name + " · " + c.subtitle, true) : transitArt(c.name, c.id === "tongxiang" ? "去程与归途" : "今晚，好好休息")}</a><div class="preview-copy ${manual && !reduced.matches ? "fade-enter" : ""}"><p class="eyebrow">${c.tag}</p><h2>${c.name}</h2><p class="subtitle">${c.subtitle}</p><p class="description">${c.description}</p></div><div class="preview-footer"><a class="enter-city" href="${url("cities/" + id + ".html")}">${c.id === "tongxiang" ? "出发与回家" : c.transit ? "看看这一晚" : "走进" + c.name}${icon("arrow")}</a><div class="pager"><button id="prev-city" aria-label="上一站">‹</button><button id="next-city" aria-label="下一站">›</button></div></div><span class="home-subtitle">A LITTLE JOURNEY BY THE SEA</span>`;
    document.querySelector("#prev-city").onclick = () =>
      setCity(cities[(index + 5) % 6].id);
    document.querySelector("#next-city").onclick = () =>
      setCity(cities[(index + 1) % 6].id);
    let startX = 0;
    preview.onpointerdown = (e) => {
      startX = e.clientX;
    };
    preview.onpointerup = (e) => {
      if (Math.abs(e.clientX - startX) > 55 && e.pointerType === "touch") {
        e.preventDefault();
        setCity(cities[(index + (e.clientX < startX ? 1 : 5)) % 6].id);
      }
    };
    const world = document.querySelector(".map-world");
    if (manual && !reduced.matches) {
      const [cx, cy] = coords[id];
      world.style.transform = `translate(${(235 - cx) * 0.025}px,${(325 - cy) * 0.012}px) scale(1.012)`;
    }
    document.querySelector("#journey-status").textContent =
      `${c.name}，${c.tag}`;
  }
  function updateButton() {
    document.querySelector("#play").innerHTML =
      icon(running ? "pause" : "play") +
      `<span>${running ? "暂停旅程" : elapsed > 0 && elapsed < total ? "继续播放" : elapsed >= total ? "再走一遍" : "播放全程"}</span>`;
    document
      .querySelector("#play")
      .setAttribute("aria-pressed", String(running));
  }
  function pause() {
    running = false;
    cancelAnimationFrame(frame);
    updateButton();
  }
  function draw() {
    const seg = Math.min(5, Math.floor(elapsed / duration)),
      t = Math.min(1, (elapsed - seg * duration) / duration);
    const path = document.querySelector("#segment-" + seg),
      length = path.getTotalLength(),
      pos = path.getPointAtLength(length * t);
    const light = document.querySelector("#traveller");
    light.setAttribute("visibility", reduced.matches ? "hidden" : "visible");
    light.setAttribute("cx", pos.x);
    light.setAttribute("cy", pos.y);
    const progress = document.querySelector("#progress-path");
    progress.setAttribute("d", segments[seg]);
    progress.setAttribute(
      "stroke-dasharray",
      `${reduced.matches ? length : length * t} ${length}`,
    );
    if (seg !== lastSegment) {
      setCity(journey[seg], false);
      lastSegment = seg;
    }
    if (elapsed >= total) setCity("tongxiang", false);
  }
  function tick(now) {
    if (!running) return;
    if (last) elapsed = Math.min(total, elapsed + Math.min(now - last, 100));
    last = now;
    draw();
    if (elapsed >= total) {
      pause();
      return;
    }
    frame = requestAnimationFrame(tick);
  }
  document.querySelector("#play").onclick = () => {
    if (running) {
      pause();
      return;
    }
    if (elapsed >= total) {
      elapsed = 0;
      lastSegment = -1;
    }
    running = true;
    last = 0;
    updateButton();
    frame = requestAnimationFrame(tick);
  };
  document.querySelector("#reset").onclick = () => {
    pause();
    elapsed = 0;
    lastSegment = -1;
    document.querySelector("#progress-path").setAttribute("d", "");
    document.querySelector("#traveller").setAttribute("visibility", "hidden");
    setCity("tongxiang");
    document.querySelector(".map-world").style.transform = "none";
    updateButton();
  };
  document.querySelectorAll(".map-node").forEach((n) => {
    n.onclick = () => setCity(n.dataset.city);
    n.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setCity(n.dataset.city);
      }
    };
  });
  const resizeHits = () => {
    const svg = document.querySelector(".map-stage>svg"),
      scale = svg.getScreenCTM()?.a || 1;
    document.querySelectorAll(".map-node").forEach((n) => {
      const [lx, ly] = callouts[n.dataset.city],
        r = n.querySelector(".hit"),
        h = Math.max(70, 44 / scale);
      r.setAttribute("y", ly - 10 - h / 2);
      r.setAttribute("height", h);
    });
  };
  new ResizeObserver(resizeHits).observe(document.querySelector(".map-stage"));
  resizeHits();
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pause();
  });
  window.addEventListener("pagehide", pause);
  setCity(current, false);
  updateButton();
}
