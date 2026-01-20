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

  // 00:00 local
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
  if (d.getDate() < originalDay) d.setDate(0);
  return d;
}

function breakdown(now, target) {
  if (target <= now) {
    return { months: 0, weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  }

  let months = 0;
  let cursor = new Date(now);

  while (true) {
    const next = addMonths(cursor, 1);
    if (next <= target) {
      months += 1;
      cursor = next;
    } else break;
  }

  let remainingMs = target.getTime() - cursor.getTime();

  const sec = 1000;
  const min = 60 * sec;
  const hr  = 60 * min;
  const day = 24 * hr;
  const week = 7 * day;

  const weeks = Math.floor(remainingMs / week); remainingMs -= weeks * week;
  const days  = Math.floor(remainingMs / day);  remainingMs -= days * day;
  const hours = Math.floor(remainingMs / hr);   remainingMs -= hours * hr;
  const minutes = Math.floor(remainingMs / min); remainingMs -= minutes * min;
  const seconds = Math.floor(remainingMs / sec);

  return { months, weeks, days, hours, minutes, seconds, done: false };
}

function pad2(n) { return String(n).padStart(2, "0"); }

function run() {
  const $ = (id) => document.getElementById(id);

  // If files are mixed, stop (prevents “nothing shows” bugs)
  const required = ["title","badge","meta","dateText","subline","months","weeks","days","hours","minutes","seconds","tzLabel"];
  const missing = required.filter(id => !$(id));
  if (missing.length) {
    console.warn("Countdown widget mismatch. Missing IDs:", missing);
    return;
  }

  const title = getParam("title", "TOPIK I");
  const label = getParam("label", "TOPIK");
  const subtitle = getParam("subtitle", "Study today");
  const dateStr = getParam("date", "");
  const tz = getParam("tz", "Europe/Berlin");

  $("title").textContent = title;
  $("badge").textContent = label;
  $("tzLabel").textContent = `TZ: ${tz}`;

  const target = parseTargetDate(dateStr);

  if (!target) {
    $("meta").textContent = "Countdown";
    $("dateText").textContent = "—";
    $("subline").textContent = "Add ?date=YYYY-MM-DD to the URL.";
    ["months","weeks","days","hours","minutes","seconds"].forEach(k => $(k).textContent = "00");
    return;
  }

  const now = new Date();
  $("meta").textContent = "Until";
  $("dateText").textContent = formatLocalDate(target);

  const b = breakdown(now, target);

  $("months").textContent = pad2(b.months);
  $("weeks").textContent = pad2(b.weeks);
  $("days").textContent = pad2(b.days);
  $("hours").textContent = pad2(b.hours);
  $("minutes").textContent = pad2(b.minutes);
  $("seconds").textContent = pad2(b.seconds);

  $("subline").textContent = b.done ? "Today. You got this 💪" : subtitle;
}

document.addEventListener("DOMContentLoaded", () => {
  run();
  setInterval(run, 1000); // ✅ updates every second
});
