const calendar = document.getElementById("calendar");
const modal = document.getElementById("modal");
const selectedDateText = document.getElementById("selectedDate");
const workoutText = document.getElementById("workoutText");
const importFile = document.getElementById("importFile");
const monthLabel = document.getElementById("monthLabel");
const resultBox = document.getElementById("result");

let selectedDate = "";
let currentDate = new Date();

function formatDate(year, month, day) {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function generateCalendar() {
  calendar.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  monthLabel.textContent = firstDay.toLocaleString("default", {
    month: "long",
    year: "numeric"
  });

  const startDay = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  for (let i = 0; i < startDay; i++) {
    calendar.appendChild(document.createElement("div"));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = formatDate(year, month, day);

    const dayElement = document.createElement("div");
    dayElement.classList.add("day");

    if (localStorage.getItem(date)) {
      dayElement.classList.add("has-workout");
    }

    dayElement.innerHTML = `<strong>${day}</strong>`;
    dayElement.addEventListener("click", () => openDay(date));

    calendar.appendChild(dayElement);
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

async function saveWorkout() {
  if (!selectedDate) return;

  localStorage.setItem(selectedDate, workoutText.value);

  generateCalendar();
  closeModal();

  const msg = await generateEncouragement(workoutText.value);
  alert(msg);
}
/*
function getLocalEncouragement(text) {
  if (!text || text.length < 10) return "Good work showing up.";

  const messages = [
    "Solid work today. Keep building consistency.",
    "Nice session. Small steps compound into strength.",
    "Good training — recovery matters just as much now.",
    "Strong effort. Stay disciplined and keep progressing."
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}
*/
function exportWorkouts() {
  let exportText = "";

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);

    exportText += `DATE: ${key}
${value}

------------------

`;
  }

  const blob = new Blob([exportText], { type: "text/plain" });
  const a = document.createElement("a");

  a.href = URL.createObjectURL(blob);
  a.download = "workouts.txt";
  a.click();
}

importFile.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    const text = e.target.result;

    const sections = text.split("------------------");

    sections.forEach(section => {
      const trimmed = section.trim();
      if (!trimmed) return;

      const lines = trimmed.split("");
      if (!lines[0] || !lines[0].startsWith("DATE:")) return;

      const date = lines[0].replace("DATE:", "").trim();
      const workout = lines.slice(1).join("").trim();

      localStorage.setItem(date, workout);
    });

    generateCalendar();
    alert("Workouts imported successfully!");
  };

  reader.readAsText(file);
});

function calculate1RM() {
  const weight = parseFloat(document.getElementById("weight").value);
  const reps = parseFloat(document.getElementById("reps").value);
  const rpe = parseFloat(document.getElementById("rpe").value);

  if (isNaN(weight) || isNaN(reps) || isNaN(rpe)) {
    alert("Please fill all calculator fields.");
    return;
  }

  const rir = 10 - rpe;
  const estimatedReps = reps + rir;
  const estimated1RM = weight * (1 + estimatedReps / 30);

  resultBox.textContent = `Estimated 1RM: ${estimated1RM.toFixed(1)} kg`;
}

async function generateEncouragement(workoutText) {
  const res = await fetch("/api/encouragement", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ workout: workoutText })
  });

  const data = await res.json();
  return data.message;
}

// Init
generateCalendar();