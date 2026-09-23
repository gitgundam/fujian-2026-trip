import { renderCity, renderUtility } from "./pages.js";
import { installSheet } from "./sheet.js";
import { installImageFallback } from "./shared.js";
installImageFallback();
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
const page = document.body.dataset.page;
if (page === "home") {
  const { renderHome } = await import("./map.js");
  renderHome();
} else if (page === "city") renderCity(document.body.dataset.city);
else renderUtility(page);
installSheet();
