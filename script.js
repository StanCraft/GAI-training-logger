const calendar = document.getElementById("calendar");
const modal = document.getElementById("modal");
const selectedDateText = document.getElementById("selectedDate");
const workoutText = document.getElementById("workoutText");
const importFile = document.getElementById("importFile");
const monthLabel = document.getElementById("monthLabel");
const result = document.getElementById("result");

let currentDate = new Date();
let selectedDate = "";

function formatDate(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function generateCalendar() {
  calendar.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);

  monthLabel.textContent = first.toLocaleDateString("default", {
    month: "long",
    year: "numeric"
  });

  for (let i = 0; i < first.getDay(); i++) {
    calendar.appendChild(document.createElement("div"));
  }

  for (let d = 1; d <= last.getDate(); d++) {
    const date = formatDate(year, month, d);

    const el = document.createElement("div");
    el.className = "day";

    if (localStorage.getItem(date)) el.classList.add("has-workout");

    el.innerHTML = `<strong>${d}</strong>`;
    el.onclick = () => openDay(date);

    calendar.appendChild(el);
  }
}

function prevMonth() {
  currentDate.setMonth(currentDate.getMonth() - 1);
  generateCalendar();
}

function nextMonth() {
  currentDate.setMonth(currentDate.getMonth() + 1);
  generateCalendar();
}

function openDay(date) {
  selectedDate = date;
  selectedDateText.textContent = date;
  workoutText.value = localStorage.getItem(date) || "";
  modal.style.display = "flex";
}

function closeModal() {
  modal.style.display = "none";
}

function saveWorkout() {
  if (!selectedDate) return;

  localStorage.setItem(selectedDate, workoutText.value);
  generateCalendar();
  closeModal();
}

function exportWorkouts() {
  let text = "";

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    text += `DATE: ${key}\n${localStorage.getItem(key)}\n\n------------------\n`;
  }

  const blob = new Blob([text], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "workouts.txt";
  a.click();
}

document.getElementById("importFile").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = ev => {
    const sections = ev.target.result.split("------------------");

    sections.forEach(s => {
      const lines = s.trim().split("\n");
      if (!lines[0] || !lines[0].includes("DATE:")) return;

      const date = lines[0].replace("DATE:", "").trim();
      const workout = lines.slice(1).join("\n").trim();

      localStorage.setItem(date, workout);
    });

    generateCalendar();
    alert("Imported!");
  };

  reader.readAsText(file);
});

function calculate1RM() {
  const w = parseFloat(document.getElementById("weight").value);
  const r = parseFloat(document.getElementById("reps").value);
  const rpe = parseFloat(document.getElementById("rpe").value);

  if (isNaN(w) || isNaN(r) || isNaN(rpe)) return;

  const est = w * (1 + (r + (10 - rpe)) / 30);
  result.textContent = `Estimated 1RM: ${est.toFixed(1)} kg`;
}

generateCalendar();