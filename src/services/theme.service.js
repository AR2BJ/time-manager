export function setTheme(mode) {
  const root = document.documentElement;

  if (mode === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.classList.add("light");
    root.classList.remove("dark");
  }

  localStorage.setItem("theme", mode);
}

export function getTheme() {
  return localStorage.getItem("theme") || "dark";
}

export function toggleTheme() {
  const current = getTheme();

  const next = current === "dark" ? "light" : "dark";

  setTheme(next);
}
