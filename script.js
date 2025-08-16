// quick scratchpad vars
let calendar = null;
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];

document.addEventListener("DOMContentLoaded", () => {
  const nameModal = document.getElementById("name-modal-overlay");
  const nameInput = document.getElementById("name-input");
  const saveBtn = document.getElementById("save-name-btn");
  const usernameEl = document.getElementById("username");
  const usernameTopEl = document.getElementById("username2");
  const eventModal = document.getElementById("event-modal");

  function setUserName(name) {
    usernameEl.textContent = name;
    usernameTopEl.textContent = name;
  }

  function saveName() {
    const name = nameInput.value.trim() || "Guest";
    setUserName(name);
    nameModal.classList.add("hidden");
  }

  saveBtn.addEventListener("click", saveName);
  nameInput.addEventListener("keyup", e => {
    if (e.key === "Enter") saveName();
  });

  // show name modal every time for now
  // TODO: remember name in localStorage
  nameModal.classList.remove("hidden");

  // initialize calendar
  const calendarEl = document.getElementById("calendar-placeholder");
  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    height: "100%",
    dayMaxEvents: true,
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek"
    },
    events: taskList
      .filter(t => t.date)
      .map(t => ({
        title: t.title,
        start: t.date,
        allDay: true,
        description: t.description
      })),
    eventClick: info => {
      document.getElementById("modal-title").textContent = info.event.title;
      document.getElementById("modal-date").textContent =
        info.event.start.toDateString();
      document.getElementById("modal-description").textContent =
        info.event.extendedProps.description || "No description provided.";
      eventModal.classList.remove("hidden");
    }
  });
  calendar.render();

  renderTasks();

  // form & button events
  document.getElementById("add-task-form").addEventListener("submit", e => {
    e.preventDefault();
    addTask();
  });

  document.getElementById("add-plan-form").addEventListener("submit", addPlan);
  document.getElementById("start-timer").addEventListener("click", startTimer);
  document.getElementById("pause-timer").addEventListener("click", pauseTimer);
  document.getElementById("reset-timer").addEventListener("click", resetTimer);

  document
    .getElementById("modal-close-btn")
    .addEventListener("click", () => eventModal.classList.add("hidden"));
});

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(taskList));
}

function addTask() {
  const input = document.getElementById("todo-input");
  const txt = input.value.trim();
  if (!txt) return;

  taskList.push({ title: txt, completed: false, date: null, description: "" });
  saveTasks();
  renderTasks();
  input.value = "";
}

function renderTasks() {
  const list = document.getElementById("todo-list");
  list.innerHTML = "";
  let completedCount = 0;

  taskList.forEach((task, idx) => {
    const li = document.createElement("li");
    if (task.completed) {
      li.classList.add("completed");
      completedCount++;
    }

    li.innerHTML = `
      <input type="checkbox" id="task-${idx}" ${task.completed ? "checked" : ""}>
      <label for="task-${idx}"></label>
      <div class="task-text-container">
        <span class="task-title">${task.title}</span>
        ${task.description ? `<p class="task-description">${task.description}</p>` : ""}
      </div>
      <span class="delete-btn">x</span>
    `;

    li.querySelector('input[type="checkbox"]').onchange = () => toggleTask(idx);
    li.querySelector(".delete-btn").onclick = () => deleteTask(idx);

    list.appendChild(li);
  });

  document.getElementById("task-count").textContent = taskList.length;
  document.getElementById("completed-count").textContent = completedCount;

  const percent = taskList.length
    ? (completedCount / taskList.length) * 100
    : 0;
  document.getElementById("progress-bar").style.width = `${percent}%`;
}

function toggleTask(i) {
  taskList[i].completed = !taskList[i].completed;
  saveTasks();
  renderTasks();
}

function deleteTask(i) {
  taskList.splice(i, 1);
  saveTasks();
  renderTasks();
}

// timer stuff
let timeLeft = 1500; // 25min
let timerInterval = null;

function updateDisplay() {
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  document.getElementById("timer").textContent =
    `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

function startTimer() {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    timeLeft--;
    updateDisplay();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      alert("Pomodoro session finished!");
      resetTimer();
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function resetTimer() {
  pauseTimer();
  timeLeft = 1500;
  updateDisplay();
}

function addPlan(e) {
  e.preventDefault();
  const title = document.getElementById("plan-title").value.trim();
  const date = document.getElementById("plan-date").value;
  const desc = document.getElementById("plan-desc").value.trim();
  if (!title || !date) return;

  taskList.push({ title, completed: false, date, description: desc });
  saveTasks();

  if (calendar) {
    calendar.addEvent({
      title,
      start: date,
      allDay: true,
      description: desc
    });
  }

  renderTasks();
  e.target.reset();
}
