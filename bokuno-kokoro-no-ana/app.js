const STORAGE_KEY = "akashio-shelf-unlocked";

const gateEl = document.getElementById("gate");
const libraryEl = document.getElementById("library");
const readerEl = document.getElementById("reader");
const gateForm = document.getElementById("gate-form");
const gateInput = document.getElementById("gate-input");
const gateError = document.getElementById("gate-error");
const tocList = document.getElementById("toc-list");
const tocCount = document.getElementById("toc-count");
const libraryTitle = document.getElementById("library-title");
const libraryLead = document.getElementById("library-lead");
const pageEl = document.getElementById("page");
const kickerEl = document.getElementById("kicker");
const titleEl = document.getElementById("title");
const bodyEl = document.getElementById("body");
const hintEl = document.getElementById("hint");
const progressEl = document.getElementById("progress");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const restartBtn = document.getElementById("restart");
const toTocBtn = document.getElementById("to-toc");
const stage = document.getElementById("stage");

const config = window.SITE_CONFIG || {};
const stories = Array.isArray(window.STORIES) ? window.STORIES : [];

let currentStory = null;
let index = 0;

function expectedKey() {
  return String(config.accessKey || "").trim();
}

function isUnlocked() {
  const key = expectedKey();
  if (!key) return true;
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get("k");
  if (fromQuery && fromQuery === key) {
    sessionStorage.setItem(STORAGE_KEY, key);
    return true;
  }
  return sessionStorage.getItem(STORAGE_KEY) === key;
}

function unlock(candidate) {
  if (candidate === expectedKey()) {
    sessionStorage.setItem(STORAGE_KEY, candidate);
    return true;
  }
  return false;
}

function showGate() {
  gateEl.hidden = false;
  libraryEl.hidden = true;
  readerEl.hidden = true;
}

function showLibrary() {
  gateEl.hidden = true;
  libraryEl.hidden = false;
  readerEl.hidden = true;
  document.title = config.libraryTitle || "絵本庫";
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

function renderToc() {
  libraryTitle.textContent = config.libraryTitle || "絵本庫";
  libraryLead.textContent = config.libraryLead || "";
  tocCount.textContent = `全${stories.length}話`;
  tocList.innerHTML = "";

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

function renderPage() {
  if (!currentStory) return;
  const pages = currentStory.pages;
  const page = pages[index];
  const bodyCount = pages.filter((p) => p.kind !== "cover" && p.kind !== "end").length;

  if (page.kind === "cover") {
    progressEl.textContent = "表紙";
  } else if (page.kind === "end") {
    progressEl.textContent = "おわり";
  } else {
    progressEl.textContent = `${index} / ${bodyCount}`;
  }

  kickerEl.textContent = page.kicker || "";
  kickerEl.hidden = !page.kicker;

  if (page.title) {
    titleEl.hidden = false;
    titleEl.textContent = page.title;
  } else {
    titleEl.hidden = true;
    titleEl.textContent = "";
  }

  bodyEl.innerHTML = "";
  (page.lines || []).forEach((line) => {
    const p = document.createElement("p");
    if (typeof line === "string") {
      p.textContent = line;
      if (page.kind === "cover" || page.kind === "end") p.className = "meta";
    } else {
      p.textContent = line.text;
      if (line.quote) p.className = "quote";
    }
    bodyEl.appendChild(p);
  });

  if (page.hint) {
    hintEl.hidden = false;
    hintEl.textContent = page.hint;
  } else {
    hintEl.hidden = true;
    hintEl.textContent = "";
  }

  prevBtn.disabled = index === 0;
  nextBtn.textContent = page.kind === "end" ? "目次へ" : "次へ";
  restartBtn.hidden = index === 0;
  document.title = `${currentStory.title} — ${currentStory.author}`;
}

function openStory(id) {
  const story = storyById(id);
  if (!story) {
    showLibrary();
    return;
  }
  currentStory = story;
  index = 0;
  history.replaceState(null, "", withKey(`#/read/${story.id}`));
  showReader();
  renderPage();
}

function goTo(nextIndex) {
  if (!currentStory) return;
  if (nextIndex < 0 || nextIndex >= currentStory.pages.length) return;
  index = nextIndex;
  renderPage();
}

function nextPage() {
  if (!currentStory) return;
  const page = currentStory.pages[index];
  if (page.kind === "end" || index >= currentStory.pages.length - 1) {
    showLibrary();
    return;
  }
  goTo(index + 1);
}

function prevPage() {
  goTo(index - 1);
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

gateForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = gateInput.value.trim();
  if (unlock(value)) {
    gateError.hidden = true;
    routeFromHash();
    return;
  }
  gateError.hidden = false;
});

toTocBtn.addEventListener("click", () => {
  showLibrary();
});

restartBtn.addEventListener("click", () => {
  goTo(0);
});

prevBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  prevPage();
});

nextBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  nextPage();
});

stage.addEventListener("click", (event) => {
  if (event.target.closest("button")) return;
  nextPage();
});

window.addEventListener("keydown", (event) => {
  if (readerEl.hidden) return;
  if (event.key === "ArrowRight" || event.key === " " || event.key === "Enter") {
    event.preventDefault();
    nextPage();
  }
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    prevPage();
  }
  if (event.key === "Escape") {
    showLibrary();
  }
});

let touchStartX = null;
stage.addEventListener(
  "touchstart",
  (event) => {
    touchStartX = event.changedTouches[0].clientX;
  },
  { passive: true }
);
stage.addEventListener(
  "touchend",
  (event) => {
    if (touchStartX == null || readerEl.hidden) return;
    const delta = event.changedTouches[0].clientX - touchStartX;
    touchStartX = null;
    if (Math.abs(delta) < 48) return;
    if (delta < 0) nextPage();
    else prevPage();
  },
  { passive: true }
);

window.addEventListener("hashchange", () => {
  if (!isUnlocked()) return;
  routeFromHash();
});

renderToc();

if (isUnlocked()) {
  routeFromHash();
} else {
  showGate();
}
