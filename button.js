function getParam(name, fallback = "") {
  const url = new URL(window.location.href);
  return url.searchParams.get(name) ?? fallback;
}

function run() {
  const text = getParam("text", "Start Study");
  const sub = getParam("sub", "Tap to open");
  const to = getParam("to", "");

  const btn = document.getElementById("btn");
  const textEl = document.getElementById("text");
  const subEl = document.getElementById("sub");

  textEl.textContent = text;
  subEl.textContent = sub;

  // If no link provided, show a helpful message
  if (!to) {
    btn.removeAttribute("href");
    btn.style.cursor = "not-allowed";
    subEl.textContent = "Add ?to=YOUR_LINK to the URL.";
    return;
  }

  btn.href = to;
}

document.addEventListener("DOMContentLoaded", run);
