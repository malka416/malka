const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const list = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");

let tasks = [];

function render() {
  list.innerHTML = "";

  tasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = `task-item ${task.done ? "done" : ""}`;

    const text = document.createElement("span");
    text.className = "text";
    text.textContent = task.text;

    const actions = document.createElement("div");
    actions.className = "actions";

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.textContent = task.done ? "בטל" : "סמן";
    toggle.addEventListener("click", () => {
      task.done = !task.done;
      render();
    });

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "delete";
    remove.textContent = "מחק";
    remove.addEventListener("click", () => {
      tasks = tasks.filter((t) => t.id !== task.id);
      render();
    });

    actions.append(toggle, remove);
    item.append(text, actions);
    list.append(item);
  });

  emptyState.classList.toggle("hidden", tasks.length > 0);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const value = input.value.trim();
  if (!value) {
    return;
  }

  tasks.unshift({
    id: crypto.randomUUID(),
    text: value,
    done: false,
  });

  input.value = "";
  render();
});

render();
