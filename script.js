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

  // Target = 00:00 lokale Zeit
  const dt = new Date(y, mo, d, 0, 0, 0, 0);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function formatLocalDate(d) {
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function addMonths(date, months) {
  const d = new Date(date);
  const originalDay = d.getDate();

  d.setMonth(d.getMonth() + months);

  // Rollover fix (z.B. 31. -> Feb)
  if (d.getDate() < originalDay) {
    d.setDate(0); // letzter Tag des Vormonats
  }
  return d;
}

/**
 * Countdown breakdown:
 * - months = echte Kalendermonate (unterschiedliche Monatslängen korrekt)
 * - rest -> weeks/days/hours/minutes/seconds
 */
function breakdown(now, target) {
  if (target <= now) {
    return { months: 0, weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  }

  // volle Kalendermonate zählen
  let months = 0;
  let cursor = new Date(now);

  // month-by-month vorgehen, solange "next month" <= target
  while (true) {
    const next = addMonths(cursor, 1);
    if (next <= target) {
      months += 1;
      cursor = next;
    } else {
      break;
    }
  }

  // Restzeit nach Monaten
  let remainingMs = target.getTime() - cursor.getTime();

  const sec = 1000;
  const min = 60 * sec;
  const hr = 60 * min;
  const day = 24 * hr;
  const week = 7 * day;

  const weeks = Math.floor(remainingMs / week);
  remainingMs -= weeks * week;

  const days = Math.floor(remainingMs / day);
  remainingMs -= days * day;

  const hours = Math.floor(remainingMs / hr);
  remainingMs -= hours * hr;

  const minutes = Math.floor(remainingMs / min);
  remainingMs -= minutes * min;

  const seconds = Math.floor(remainingMs / sec);

  return { months, weeks, days, hours, minutes, seconds, done: false };
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function run() {
  const title = getParam("title", "TOPIK I");
  const label = getParam("label", "TOPIK");
  const subtitle = getParam("subtitle", "Study today");
  const dateStr = getParam("date", "");
  const tz = getParam("tz", "Europe/Berlin");

  const el = (id) => document.getElementById(id);

  // basic labels
  el("title").textContent = title;
  el("badge").textContent = label;
  el("tzLabel").textContent = `TZ: ${tz}`;

  const target = parseTargetDate(dateStr);

  // if date missing/invalid -> show zeros (so you always see numbers)
  if (!target) {
    el("meta").textContent = "Countdown";
    el("dateText").textContent = "—";
    el("subline").textContent = "Add ?date=YYYY-MM-DD to the URL.";

    ["months", "weeks", "days", "hours", "minutes", "seconds"].forEach((k) => {
      el(k).textContent = "00"; // CHANGED: was "--"
    });
    return;
  }

  const now = new Date();

  el("meta").textContent = "Until";
  el("dateText").textContent = formatLocalDate(target);

  const b = breakdown(now, target);

  el("months").textContent = pad2(b.months);
  el("weeks").textContent = pad2(b.weeks);
  el("days").textContent = pad2(b.days);
  el("hours").textContent = pad2(b.hours);
  el("minutes").textContent = pad2(b.minutes);
  el("seconds").textContent = pad2(b.seconds);

  if (b.done) {
    el("subline").textContent = "Today. You got this 💪";
  } else {
    el("subline").textContent = subtitle;
  }
}

run();

/**
 * Auto-update:
 * - every second -> seconds ticking
 * - also guarantees daily change at midnight automatically
 */
setInterval(run, 1000);
