
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const taskCount = document.getElementById("task-count");
const emptyMessage = document.getElementById("empty-message");
const errorMessage = document.getElementById("error-message");
const filterButtons = document.querySelectorAll(".filter");

let tasks = [];

try {
    const savedTasks = JSON.parse(
        localStorage.getItem("myTasks") || "[]"
    );

    if (Array.isArray(savedTasks)) {
        tasks = savedTasks.filter(task =>
            task &&
            typeof task.id === "string" &&
            typeof task.text === "string" &&
            typeof task.completed === "boolean"
        );
    }
} catch (error) {
    tasks = [];
}

let currentFilter = "all";

function saveTasks() {
    try {
        localStorage.setItem("myTasks", JSON.stringify(tasks));
    } catch (error) {
        errorMessage.textContent =
            "Unable to save tasks in this browser.";
    }
}

function updateTaskCount() {
    const pending = tasks.filter(task => !task.completed).length;
    taskCount.textContent = `Pending tasks: ${pending}`;
}

function renderTasks() {
    taskList.replaceChildren();

    const filteredTasks = tasks.filter(task => {
        if (currentFilter === "completed") {
            return task.completed;
        }

        if (currentFilter === "pending") {
            return !task.completed;
        }

        return true;
    });

    filteredTasks.forEach(task => {
        const li = document.createElement("li");
        li.className = "task-item";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute(
            "aria-label",
            `Mark ${task.text} as completed`
        );

        checkbox.addEventListener("change", () => {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        const span = document.createElement("span");
        span.className = "task-text";
        span.textContent = task.text;

        if (task.completed) {
            span.classList.add("completed");
        }

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute(
            "aria-label",
            `Delete ${task.text}`
        );

        deleteButton.addEventListener("click", () => {
            tasks = tasks.filter(item => item.id !== task.id);
            saveTasks();
            renderTasks();
        });

        li.append(checkbox, span, deleteButton);
        taskList.appendChild(li);
    });

    emptyMessage.hidden = filteredTasks.length > 0;
    emptyMessage.textContent = tasks.length === 0
        ? "No tasks yet. Add your first task!"
        : "No tasks in this filter.";

    updateTaskCount();
}

taskForm.addEventListener("submit", event => {
    event.preventDefault();

    const text = taskInput.value.trim();

    if (text === "") {
        errorMessage.textContent = "Please enter a task!";
        taskInput.focus();
        return;
    }

    tasks.push({
        id: crypto.randomUUID(),
        text: text,
        completed: false
    });

    saveTasks();
    taskInput.value = "";
    errorMessage.textContent = "";
    renderTasks();
    taskInput.focus();
});

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;

        filterButtons.forEach(item => {
            item.classList.toggle("active", item === button);
        });

        renderTasks();
    });
});

taskInput.addEventListener("input", () => {
    errorMessage.textContent = "";
});

renderTasks();
