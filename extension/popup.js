let detectedUrl = null;

function showState(id) {
  document.querySelectorAll(".state").forEach((el) => el.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function setStatus(msg, type) {
  const el = document.getElementById("status");
  el.textContent = msg;
  el.className = "status " + (type || "");
}

async function getProjects() {
  const res = await fetch(`${APP_URL}/api/projects`, {
    credentials: "include",
  });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error("Failed to load projects");
  return res.json();
}

async function addPaper(input, projectId) {
  const res = await fetch(`${APP_URL}/api/papers`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input, projectId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to add paper");
  return data;
}

async function getPaperUrlFromTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.id) return resolve(null);
      chrome.tabs.sendMessage(tab.id, { type: "GET_PAPER_URL" }, (response) => {
        if (chrome.runtime.lastError) return resolve(null);
        resolve(response?.url ?? null);
      });
    });
  });
}

async function init() {
  showState("state-loading");

  let projects;
  try {
    projects = await getProjects();
  } catch {
    projects = null;
  }

  if (projects === null) {
    showState("state-not-logged-in");
    return;
  }

  detectedUrl = await getPaperUrlFromTab();

  if (!detectedUrl) {
    showState("state-no-paper");
    return;
  }

  // Show paper URL (truncated for display)
  document.getElementById("paper-url-display").textContent = detectedUrl;

  // Populate project dropdown
  const select = document.getElementById("project-select");
  select.innerHTML = "";
  if (projects.length === 0) {
    const opt = document.createElement("option");
    opt.textContent = "No projects yet";
    opt.disabled = true;
    select.appendChild(opt);
    document.getElementById("add-btn").disabled = true;
  } else {
    projects.forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.name;
      select.appendChild(opt);
    });
  }

  showState("state-add-paper");
}

document.getElementById("open-app").addEventListener("click", () => {
  chrome.tabs.create({ url: APP_URL });
});

document.getElementById("sign-in-btn")?.addEventListener("click", () => {
  chrome.tabs.create({ url: `${APP_URL}/signin` });
});

document.getElementById("add-btn")?.addEventListener("click", async () => {
  const projectId = document.getElementById("project-select").value;
  const btn = document.getElementById("add-btn");
  btn.disabled = true;
  btn.textContent = "Adding…";
  setStatus("");

  try {
    await addPaper(detectedUrl, projectId);
    btn.textContent = "Add paper";
    setStatus("Added!", "success");
  } catch (e) {
    btn.disabled = false;
    btn.textContent = "Add paper";
    setStatus(e.message, "error");
  }
});

init();
