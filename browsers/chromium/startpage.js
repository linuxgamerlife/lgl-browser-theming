(() => {
  "use strict";

  const config = window.STARTPAGE_CONFIG || {};
  const clockElement = document.getElementById("clock");
  const dateElement = document.getElementById("date");
  const clockSection = document.getElementById("clock-section");
  const searchSection = document.getElementById("search-section");
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const themeElement = document.getElementById("generated-theme");

  let activeTheme = "";

  function updateClock() {
    if (!config.showClock || !clockElement) return;
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    clockElement.textContent = `${hours}:${minutes}`;
  }

  function updateDate() {
    if (!config.showDate || !dateElement) return;
    const now = new Date();
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    dateElement.textContent = now.toLocaleDateString(undefined, options);
  }

  function initClock() {
    if (!config.showClock && clockSection) {
      clockSection.style.display = "none";
      return;
    }
    if (!config.showDate && dateElement) {
      dateElement.style.display = "none";
    }
    updateClock();
    updateDate();
    setInterval(() => {
      updateClock();
      updateDate();
    }, 1000);
  }

  function initSearch() {
    if (!config.search || !config.search.enabled) {
      if (searchSection) searchSection.style.display = "none";
      return;
    }

    if (searchForm && searchInput) {
      searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
          chrome.search.query({ text: query });
        }
      });
    }
  }

  async function refreshTheme() {
    if (!themeElement) return;

    try {
      const themeUrl = new URL("theme.css", window.location.href);
      themeUrl.searchParams.set("revision", Date.now().toString());

      const response = await fetch(themeUrl, { cache: "no-store" });
      if (!response.ok) return;

      const nextTheme = await response.text();
      if (!nextTheme || nextTheme === activeTheme) return;

      activeTheme = nextTheme;
      themeElement.textContent = nextTheme;
    } catch {
      // Retain the last valid theme and try again on the next interval.
    }
  }

  function initThemeRefresh() {
    refreshTheme();
    window.setInterval(refreshTheme, 2000);
  }

  function init() {
    initClock();
    initSearch();
    initThemeRefresh();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
