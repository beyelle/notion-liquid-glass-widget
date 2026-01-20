function getParam(name, fallback = "") {
  const url = new URL(window.location.href);
  return url.searchParams.get(name) ?? fallback;
}

function parseTargetDate(dateStr) {
  if (!dateStr) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  if (!m) return null;

  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);

  // 00:00 local time
  const dt = new Date(y, mo, d, 0, 0, 0, 0);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function formatLocalDate(d) {
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

function addMonths(date, months) {
  const d = new Date(date);
  const originalDay = d.getDate();
  d.setMonth(d.getMonth() + months);
  // rollover fix (e.g. 31st)
  if (d.getDate() < originalDay) d.setDate(0);
  return d;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function run() {
  const $ = (id) => document.getElementById(id);

  const required = ["badge","dateText","months","daysTotal","hours","minutes","seconds","hint","title"];
  const missing = required.filter(id => !$(id));
  if (missing.length) {
    console.warn("Widget mismatch. Missing IDs:", missing);
    return;
  }

  const label = getParam("label", "TOPIK");
  const title = getParam("title", ""); // default empty
  const dateStr = getParam("date", "");

  $("badge").textContent = label;

  if (title.trim().length) {
    $("title").textContent = title.trim();
    $("title").style.display = "block";
  } else {
    $("title").style.display = "none";
  }

  const target = parseTargetDate(dateStr);

  if (!target) {
    $("dateText").textContent = "—";
    $("hint").textContent = "Add ?date=YYYY-MM-DD to the URL.";
    $("hint").style.display = "block";

    $("months").textContent = "00";
    $("daysTotal").textContent = "00";
    $("hours").textContent = "00";
    $("minutes").textContent = "00";
    $("seconds").textContent = "00";
    return;
  }

  $("hint").style.display = "none";
  $("dateText").textContent = formatLocalDate(target);

  const now = new Date();

  if (target <= now) {
    $("months").textContent = "00";
    $("daysTotal").textContent = "00";
    $("hours").textContent = "00";
    $("minutes").textContent = "00";
    $("seconds").textContent = "00";
    return;
  }

  // 1) full calendar months
  let months = 0;
  let cursor = new Date(now);

  while (true) {
    const next = addMonths(cursor, 1);
    if (next <= target) {
      months += 1;
      cursor = next;
    } else break;
  }

  // 2) remaining -> TOTAL DAYS + h/m/s
  let remainingMs = target.getTime() - cursor.getTime();

  const sec = 1000;
  const min = 60 * sec;
  const hr  = 60 * min;
  const day = 24 * hr;

  const totalDays = Math.floor(remainingMs / day);
  remainingMs -= totalDays * day;

  const hours = Math.floor(remainingMs / hr);
  remainingMs -= hours * hr;

  const minutes = Math.floor(remainingMs / min);
  remainingMs -= minutes * min;

  const seconds = Math.floor(remainingMs / sec);

  $("months").textContent = pad2(months);
  $("daysTotal").textContent = pad2(totalDays);
  $("hours").textContent = pad2(hours);
  $("minutes").textContent = pad2(minutes);
  $("seconds").textContent = pad2(seconds);
}

document.addEventListener("DOMContentLoaded", () => {
  run();
  setInterval(run, 1000); // ✅ auto-update jede Sekunde
});
