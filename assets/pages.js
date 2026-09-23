import { cities, days, places, hotels, essentials } from "./data.js";
import { photos } from "./photos.js";
import {
  esc,
  url,
  topbar,
  nav,
  image,
  transitArt,
  store,
  navigation,
  footer,
  icon,
} from "./shared.js";
const dateLabel = (date) =>
  `${Number(date.slice(0, 2))}月${Number(date.slice(3))}日`;
const hotelRow = (id) => {
  const h = hotels[id];
  return `<article class="hotel-row"><div class="hotel-top"><h3>${h.name}</h3><span class="status ${h.status === "已订" ? "booked" : ""}">${h.status}</span></div><div class="hotel-price">${h.price}</div><p>${h.area} · ${h.address}</p><details><summary>停车与预订说明</summary><p>${h.parking}</p><p>${h.note}</p><div class="hotel-links"><a href="${navigation(h.name, h.area)}" target="_blank" rel="noopener noreferrer">查找位置 ↗</a>${h.url ? `<a href="${h.url}" target="_blank" rel="noopener noreferrer">查看预订平台 ↗</a>` : ""}</div></details></article>`;
};
function stopCard(id, i, time) {
  const p = places[id];
  return `<article class="stop"><div class="stop-index">${String(i + 1).padStart(2, "0")}</div><div class="stop-content"><div class="stop-meta"><span>${esc(time || "顺路慢慢走")}</span><span>${p.kind}</span></div><button class="photo-button" data-spot="${id}" aria-label="查看${p.name}照片与攻略">${image(id, p.name, i === 0)}<span class="photo-open" aria-hidden="true">↗</span></button><div class="stop-text"><div><h3>${p.name}</h3><p>${p.text}</p></div><button class="text-button" data-spot="${id}">探索这里 ↗</button></div></div></article>`;
}
function altCard(id) {
  const p = places[id];
  return `<button class="alt-card" data-spot="${id}" aria-label="查看备选景点${p.name}"><div class="alt-photo">${image(id, p.name)}</div><h3>${p.name} ↗</h3><p>${p.kind}</p></button>`;
}
function support(d) {
  return `<section class="support-section food-block"><h2>吃点什么</h2><p>${d.food}</p></section><section class="support-section"><div class="section-title"><h2>${d.stay.length ? "今晚住哪里" : "今晚，回家"}</h2><span>${d.stay.length ? "已订 / 候选分开看" : "这一天不住酒店"}</span></div>${d.stay.map(hotelRow).join("")}</section><aside class="note-block"><h3>这一天，记住就好</h3><p>${d.note}</p></aside>`;
}
let currentCity, currentDay;
export function renderCity(id) {
  currentCity = cities.find((c) => c.id === id) || cities[0];
  store.set("city", id);
  document.body.className = "page-body";
  const query = new URLSearchParams(location.search).get("day");
  currentDay = currentCity.dates.includes(query)
    ? query
    : store.get("day:" + id, currentCity.defaultDay || currentCity.dates[0]);
  if (!currentCity.dates.includes(currentDay))
    currentDay = currentCity.dates[0];
  document.title = `${currentCity.name} · 福建，沿海慢行`;
  document.querySelector("#app").outerHTML =
    `${topbar(true, currentCity.en)}<main id="main"><div class="city-cover">${currentCity.photo ? image(currentCity.photo, currentCity.name + " · " + currentCity.subtitle, true) : transitArt(currentCity.name, currentCity.coverNote || "这里，是旅途的一晚")}<span class="cover-stamp">${currentCity.photo ? "A LITTLE JOURNEY BY THE SEA" : ""}</span></div><div class="city-main"><header class="city-heading"><div><h1>${currentCity.name}</h1><p>${currentCity.subtitle}</p></div><span class="city-en">${currentCity.en}</span></header><nav class="day-tabs" aria-label="选择行程日期">${currentCity.dates.map((date) => `<a href="?day=${date}" data-day="${date}">${days[date].label}<span>${days[date].short}</span></a>`).join("")}</nav><div id="day-content"></div><a class="next-city" href="${url("cities/" + cities[(cities.indexOf(currentCity) + 1) % 6].id + ".html" + (currentCity.id === "jinjiang" ? "?day=10-07" : ""))}"><div><p>沿着旅程，继续走</p><h3>${cities[(cities.indexOf(currentCity) + 1) % 6].name}</h3></div>${icon("arrow")}</a>${footer()}</div></main>${nav("home")}`;
  function renderDay() {
    const d = days[currentDay];
    store.set("day:" + id, currentDay);
    document
      .querySelectorAll("[data-day]")
      .forEach((el) =>
        el.setAttribute(
          "aria-current",
          el.dataset.day === currentDay ? "page" : "false",
        ),
      );
    const transit = currentCity.transit || id === "tongxiang";
    let body = "";
    if (transit) {
      let intro = d.intro,
        drive = d.drive;
      if (id === "hanjiang") {
        intro =
          "从长江澳出发到涵江，今晚只安排吃饭与休息。不进兴化府，不去湄洲岛。明早再去厦门。";
        drive =
          "今晚到涵江约 98 公里 / 81 分钟；明早到东渡约 179 公里 / 2 小时 12 分";
      }
      if (id === "jinjiang" && currentDay === "10-06") {
        intro =
          "傍晚从厦门取行李往池店，住一晚，为明天北上留足睡眠。五店市不是必去。";
        drive = "黄厝 → 池店约 78 公里 / 76 分钟，不含取行李";
      }
      body = `<section class="transit-copy"><p class="eyebrow">${d.label} / ON THE ROAD</p><h2>${id === "hanjiang" ? "今晚，在涵江歇一歇" : id === "jinjiang" && currentDay === "10-06" ? "北上之前，好好睡一晚" : d.title}</h2><p>${intro}</p><div class="drive-display">${drive}</div></section>${support({ ...d, main: [], food: id === "hanjiang" ? days["10-03"].food : d.food })}`;
    } else {
      body = `<section class="day-intro"><h2>${d.title}</h2><p>${d.intro}</p><div class="route-strip">${d.route}</div><p class="day-map-note">建议顺序，可按体力取舍</p></section>${d.main.map((p, i) => stopCard(p, i, d.times?.[i]) + (i < d.main.length - 1 ? `<div class="leg">${d.between?.[i] || "按当天体力与导航安排，不赶路"}</div>` : "")).join("")}${!d.main.length ? `<div class="drive-display">${d.drive}</div>` : ""}${d.alternatives.length ? `<section class="alternatives"><div class="section-title"><h2>也可以，换个地方</h2><span>备选，不必全部去</span></div><div class="alt-grid">${d.alternatives.map(altCard).join("")}</div></section>` : ""}${support(d)}<p class="day-map-note" style="margin-top:18px">转场参考：${d.drive}。不含国庆拥堵、充电与吃饭。</p>`;
    }
    document.querySelector("#day-content").innerHTML = body;
  }
  function saveScroll() {
    store.set("scroll:" + id + ":" + currentDay, window.scrollY);
  }
  function restore() {
    const y = store.get("scroll:" + id + ":" + currentDay, 0);
    requestAnimationFrame(() =>
      window.scrollTo({ top: y, behavior: "instant" }),
    );
  }
  document.querySelectorAll("[data-day]").forEach(
    (a) =>
      (a.onclick = (e) => {
        e.preventDefault();
        if (a.dataset.day === currentDay) return;
        saveScroll();
        currentDay = a.dataset.day;
        history.pushState({ day: currentDay }, "", `?day=${currentDay}`);
        renderDay();
        window.scrollTo({
          top:
            document.querySelector(".day-tabs").getBoundingClientRect().top +
            window.scrollY -
            10,
          behavior: "instant",
        });
      }),
  );
  window.addEventListener("pagehide", saveScroll);
  window.addEventListener("popstate", () => {
    const day =
      new URLSearchParams(location.search).get("day") ||
      store.get("day:" + id, currentCity.defaultDay || currentCity.dates[0]);
    if (day !== currentDay && currentCity.dates.includes(day)) {
      saveScroll();
      currentDay = day;
      renderDay();
      restore();
    }
  });
  // Canonicalize the initial date so browser Back cannot pick up a newer session date.
  history.replaceState(
    { ...history.state, day: currentDay },
    "",
    `?day=${currentDay}${location.hash}`,
  );
  renderDay();
  restore();
}
export function renderUtility(kind) {
  document.body.className = "page-body";
  let content = "";
  if (kind === "stays") {
    content = `<header class="utility-heading"><p class="eyebrow">REST ALONG THE WAY</p><h1>每一晚，都好好休息。</h1><p>七晚的落脚点，按入住日期放在这里。现有资料只有 9 月 30 日艾思顿明确已订，其余都是候选。所有房价是历史参考，不汇总成已确定的住宿预算。</p></header>${Object.entries(
      days,
    )
      .filter(([_, d]) => d.stay.length)
      .map(
        ([date, d]) =>
          `<section class="stay-day"><h2>${dateLabel(date)} <span class="small muted">${d.short}</span></h2>${d.stay.map(hotelRow).join("")}</section>`,
      )
      .join("")}`;
  }
  if (kind === "essentials") {
    content = `<header class="utility-heading"><p class="eyebrow">A FEW THINGS TO REMEMBER</p><h1>出发时，心里有底。</h1><p>把需要记住的事情放在这里。累了可以删景点，吃饭、睡觉和休息不删。</p></header>${essentials.map((g, i) => `<section class="essentials-group"><div class="section-title"><h2>${g.title}</h2><span>0${i + 1}</span></div>${g.items.map(([title, text], j) => `<article class="essentials-item"><span>0${j + 1}</span><h3>${title}</h3><p>${text}</p></article>`).join("")}</section>`).join("")}`;
  }
  if (kind === "credits") {
    const missing = Object.keys(places).filter(
      (k) => photos[k]?.status !== "available",
    );
    content = `<header class="utility-heading"><p class="eyebrow">SOURCES & PHOTOGRAPHS</p><h1>照片有出处，行程有依据。</h1><p>行程来自本地《福建国庆自驾攻略》，整理日期 2026-09-23。没有重新核价、增加餐馆研究或重新规划旅行。图片根据来源页名称、描述与画面核对地点。</p></header><section class="note-block"><h3>资料边界</h3><p>旧 HTML 与攻略对平潭酒店、东渡取消规则及赶船时刻存在差异；相关页面保留待核实说明。车程为平时参考，不是实时道路导航。地图以 Natural Earth 1:50m 陆地数据绘制，城市坐标为示意点，不代表酒店或停车入口。</p><p><a href="https://www.naturalearthdata.com/about/terms-of-use/" target="_blank" rel="noopener noreferrer">Natural Earth · 公有领域地理数据 ↗</a></p></section><section class="support-section"><div class="section-title"><h2>图片情况</h2></div><p class="small">${Object.keys(places).length - missing.length} / ${Object.keys(places).length} 个景点已配对应实景。${missing.length ? "以下地点暂无核实后可用图片：" + missing.map((k) => places[k].name).join("、") + "。页面保留明确缺口，不用其他景点的图片冒充。" : "全部景点已有对应实景图片。"}</p><p class="small muted">涵江、晋江与桐乡中转封面为文字插画，不冒充当地实景。图片为裁切展示，放大可看完整画面；版权及许可见各来源。</p></section><div class="credits-list support-section">${Object.entries(
      photos,
    )
      .filter(([_, p]) => p.status === "available")
      .map(
        ([k, p]) =>
          `<article class="credit">${image(k, p.title)}<h3>${esc(places[k.replace(/-2$/, "")]?.name || p.title)}</h3><p>${esc(p.artist)}</p><p>${esc(p.license)}</p><a href="${esc(p.source)}" target="_blank" rel="noopener noreferrer">查看图片来源 ↗</a>${p.licenseUrl ? ` · <a href="${esc(p.licenseUrl)}" target="_blank" rel="noopener noreferrer">许可</a>` : ""}</article>`,
      )
      .join("")}</div>`;
  }
  document.querySelector("#app").outerHTML =
    `${topbar(true, kind === "stays" ? "STAY" : kind === "essentials" ? "TRAVEL NOTES" : "CREDITS")}<main id="main" class="utility-main">${content}${footer()}</main>${nav(kind)}`;
}
