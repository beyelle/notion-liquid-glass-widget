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

  const dt = new Date(y, mo, d, 0, 0, 0, 0);
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

function formatLocalDate(d) {
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

function daysLeft(target) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = target.getTime() - startOfToday.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function run() {
  const title = getParam("title", "TOPIK Exam");
  const label = getParam("label", "TOPIK");
  const subtitle = getParam("subtitle", "Make today count.");
  const dateStr = getParam("date", "");
  const tz = getParam("tz", "Europe/Berlin");

  document.getElementById("title").textContent = title;
  document.getElementById("badge").textContent = label;
  document.getElementById("tzLabel").textContent = `TZ: ${tz}`;

  const target = parseTargetDate(dateStr);

  if (!target) {
    document.getElementById("days").textContent = "--";
    document.getElementById("subline").textContent =
      "Add ?date=YYYY-MM-DD to the URL.";
    document.getElementById("dateLabel").textContent = "Date: —";
    document.getElementById("meta").textContent = "Countdown";
    return;
  }

  const n = daysLeft(target);
  document.getElementById("days").textContent = String(Math.max(n, 0));

  if (n > 1) {
    document.getElementById("subline").textContent = subtitle;
    document.getElementById("meta").textContent = "Days remaining";
  } else if (n === 1) {
    document.getElementById("subline").textContent = "Tomorrow. Final push ✨";
    document.getElementById("meta").textContent = "Almost there";
  } else if (n === 0) {
    document.getElementById("subline").textContent = "Today. You got this 💪";
    document.getElementById("meta").textContent = "Exam day";
  } else {
    document.getElementById("subline").textContent = "Date has passed — update your target date.";
    document.getElementById("meta").textContent = "Finished";
  }

  document.getElementById("dateLabel").textContent = `Date: ${formatLocalDate(target)}`;
}

run();
setInterval(run, 60 * 60 * 1000);
