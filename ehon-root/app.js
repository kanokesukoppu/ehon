const STORAGE_KEY = "akashio-shelf-unlocked";

const gateEl = document.getElementById("gate");
const libraryEl = document.getElementById("library");
const readerEl = document.getElementById("reader");
const gateForm = document.getElementById("gate-form");
const gateInput = document.getElementById("gate-input");
const gateError = document.getElementById("gate-error");
const gateSetup = document.getElementById("gate-setup");
const setupWarning = document.getElementById("setup-warning");
const tocList = document.getElementById("toc-list");
const tocCount = document.getElementById("toc-count");
const libraryTitle = document.getElementById("library-title");
const libraryLead = document.getElementById("library-lead");
const kickerEl = document.getElementById("kicker");
const titleEl = document.getElementById("title");
const bylineEl = document.getElementById("byline");
const bodyEl = document.getElementById("body");
const progressEl = document.getElementById("progress");
const toTocBtn = document.getElementById("to-toc");
const stage = document.getElementById("stage");

const config = window.SITE_CONFIG || {};
const stories = Array.isArray(window.STORIES) ? window.STORIES : [];

let currentStory = null;

function normalizeKey(value) {
  return String(value ?? "")
    .trim()
    .normalize("NFKC");
}

function expectedKey() {
  return normalizeKey(config.accessKey || "");
}

function rememberUnlock() {
  const key = expectedKey();
  if (!key) return;

  try {
    sessionStorage.setItem(STORAGE_KEY, key);
  } catch (_) {}

  try {
    const url = new URL(window.location.href);
    url.searchParams.set("k", key);
    history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  } catch (_) {}
}

function isUnlocked() {
  const key = expectedKey();
  if (!key) return false;

  const params = new URLSearchParams(window.location.search);
  const fromQuery = normalizeKey(params.get("k"));
  if (fromQuery && fromQuery === key) {
    rememberUnlock();
    return true;
  }

  try {
    return normalizeKey(sessionStorage.getItem(STORAGE_KEY)) === key;
  } catch (_) {
    return false;
  }
}

function unlock(candidate) {
  return normalizeKey(candidate) === expectedKey();
}

function showGate(message = "") {
  gateEl.hidden = false;
  libraryEl.hidden = true;
  readerEl.hidden = true;

  if (message) {
    gateSetup.hidden = false;
    gateSetup.textContent = message;
  } else {
    gateSetup.hidden = true;
    gateSetup.textContent = "";
  }
}

function showLibrary() {
  gateEl.hidden = true;
  libraryEl.hidden = false;
  readerEl.hidden = true;
  document.title = config.libraryTitle || "絵本庫";
  rememberUnlock();
  history.replaceState(null, "", withKey("./"));
}

function showReader() {
  gateEl.hidden = true;
  libraryEl.hidden = true;
  readerEl.hidden = false;
}

function withKey(path) {
  const key = expectedKey();
  if (!key) return path;
  const url = new URL(path, window.location.href);
  url.searchParams.set("k", key);
  return `${url.pathname}${url.search}${url.hash}`;
}

function storyById(id) {
  return stories.find((story) => story.id === id) || null;
}

function renderSetupWarnings() {
  if (!Array.isArray(window.STORIES)) {
    setupWarning.hidden = false;
    setupWarning.textContent =
      "stories.js が読み込めていません。GitHub に stories.js もアップロードしてください。";
    return;
  }

  if (stories.length === 0) {
    setupWarning.hidden = false;
    setupWarning.textContent = "作品データが空です。stories.js の内容を確認してください。";
    return;
  }

  setupWarning.hidden = true;
  setupWarning.textContent = "";
}

function renderToc() {
  libraryTitle.textContent = config.libraryTitle || "絵本庫";
  libraryLead.textContent = config.libraryLead || "";
  tocCount.textContent = `全${stories.length}話`;
  tocList.innerHTML = "";
  renderSetupWarnings();

  stories.forEach((story, i) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = withKey(`#/read/${story.id}`);
    a.innerHTML = `
      <span class="toc-num">${String(i + 1).padStart(2, "0")}</span>
      <span>
        <p class="toc-title"></p>
        <p class="toc-meta"></p>
      </span>
      <span class="toc-go">読む</span>
    `;
    a.querySelector(".toc-title").textContent = story.title;
    a.querySelector(".toc-meta").textContent = `${story.author} ／ ${story.summary}`;
    a.addEventListener("click", (event) => {
      event.preventDefault();
      openStory(story.id);
    });
    li.appendChild(a);
    tocList.appendChild(li);
  });
}

function appendParagraph(line) {
  if (typeof line !== "string" && line.heading) {
    const h = document.createElement("h2");
    h.className = "section-heading";
    h.textContent = line.text;
    bodyEl.appendChild(h);
    return;
  }

  const p = document.createElement("p");
  if (typeof line === "string") {
    p.textContent = line;
  } else {
    p.textContent = line.text;
    if (line.quote) p.className = "quote";
  }
  bodyEl.appendChild(p);
}

function renderStory() {
  if (!currentStory) return;

  progressEl.textContent = currentStory.number || "本文";
  kickerEl.textContent = currentStory.number || "";
  kickerEl.hidden = !currentStory.number;
  titleEl.textContent = currentStory.title;
  bylineEl.textContent = `作者　${currentStory.author}`;

  bodyEl.innerHTML = "";
  (currentStory.paragraphs || []).forEach(appendParagraph);

  document.title = `${currentStory.title} — ${currentStory.author}`;
  stage.scrollTop = 0;
}

function openStory(id) {
  const story = storyById(id);
  if (!story) {
    showLibrary();
    return;
  }
  currentStory = story;
  history.replaceState(null, "", withKey(`#/read/${story.id}`));
  showReader();
  renderStory();
}

function routeFromHash() {
  const hash = window.location.hash.replace(/^#/, "");
  const match = hash.match(/^\/read\/([^/?#]+)/);
  if (match) {
    openStory(match[1]);
    return;
  }
  currentStory = null;
  showLibrary();
}

function tryUnlockFromForm() {
  const value = gateInput.value;
  if (!expectedKey()) {
    gateError.hidden = true;
    showGate("合言葉の設定が見つかりません。index.html または config.js を確認してください。");
    return;
  }

  if (!unlock(value)) {
    gateError.hidden = false;
    return;
  }

  gateError.hidden = true;
  rememberUnlock();
  routeFromHash();
}

gateForm.addEventListener("submit", (event) => {
  event.preventDefault();
  tryUnlockFromForm();
});

toTocBtn.addEventListener("click", () => {
  showLibrary();
});

window.addEventListener("keydown", (event) => {
  if (readerEl.hidden) return;
  if (event.key === "Escape") {
    showLibrary();
  }
});

window.addEventListener("hashchange", () => {
  if (!isUnlocked()) return;
  routeFromHash();
});

renderToc();

if (!expectedKey()) {
  showGate("合言葉の設定が見つかりません。index.html または config.js を確認してください。");
} else if (isUnlocked()) {
  routeFromHash();
} else {
  showGate();
}
