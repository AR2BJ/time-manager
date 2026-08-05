const savedTheme = localStorage.getItem("theme") || "dark";
const root = document.documentElement;

root.classList.toggle("dark", savedTheme === "dark");
root.classList.toggle("light", savedTheme === "light");
