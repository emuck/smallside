(function () {
  "use strict";
  const storageKey = "smallside-theme";
  const themes = {
    field: { label: "Dark view", color: "#fffdf5" },
    dark: { label: "Field view", color: "#07120e" }
  };
  function savedTheme() {
    try {
      const value = window.localStorage.getItem(storageKey);
      return themes[value] ? value : "field";
    } catch (_) { return "field"; }
  }
  function applyTheme(theme) {
    const selected = themes[theme] ? theme : "field";
    document.documentElement.dataset.theme = selected;
    document.documentElement.style.colorScheme = selected === "dark" ? "dark" : "light";
    const themeColor = document.querySelector("meta[name=theme-color]");
    if (themeColor) themeColor.content = themes[selected].color;
    const toggle = document.getElementById("theme-toggle");
    if (toggle) {
      toggle.setAttribute("aria-pressed", String(selected === "dark"));
      toggle.setAttribute("aria-label", `Switch to ${themes[selected].label.toLowerCase()}`);
      const label = toggle.querySelector(".theme-toggle-label");
      if (label) label.textContent = themes[selected].label;
    }
  }
  applyTheme(savedTheme());
  document.addEventListener("DOMContentLoaded", function () {
    applyTheme(savedTheme());
    const toggle = document.getElementById("theme-toggle");
    if (!toggle) return;
    toggle.addEventListener("click", function () {
      const next = document.documentElement.dataset.theme === "dark" ? "field" : "dark";
      try { window.localStorage.setItem(storageKey, next); } catch (_) {}
      applyTheme(next);
    });
  });
}());
