const STORAGE_KEY = 'code-city-snippets-v1';

const $ = (id) => document.getElementById(id);

const examples = {
  HTML: {
    title: 'My rainbow heading',
    code: `<h1>Hello, world! 🌈</h1>
<p>I am learning HTML.</p>`
  },
  CSS: {
    title: 'Rainbow button style',
    code: `button {
  background: linear-gradient(90deg, purple, pink);
  color: white;
  padding: 12px 18px;
  border: 0;
  border-radius: 10px;
}`
  },
  JavaScript: {
    title: 'Happy message button',
    code: `const button = document.querySelector("button");

button.addEventListener("click", () => {
  alert("You did it! 🎉");
});`
  },
  Python: {
    title: 'Friendly Python hello',
    code: `name = input("What is your name? ")

print("Hello " + name + "!")
print("Keep learning code! 🚀")`
  }
};

function createSnippet(title, language, code) {
  return {
    id: `snippet-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title,
    language,
    code,
    opened: false
  };
}

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (saved && Array.isArray(saved.snippets)) {
      return {
        snippets: saved.snippets,
        recent: Array.isArray(saved.recent) ? saved.recent : []
      };
    }
  } catch (error) {
    console.warn('Could not load snippets.', error);
  }

  return {
    snippets: [
      createSnippet(
        'My first HTML page',
        'HTML',
        examples.HTML.code
      ),
      createSnippet(
        'Cool button style',
        'CSS',
        examples.CSS.code
      )
    ],
    recent: []
  };
}

let data = loadData();

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function escapeHtml(text) {
  return String(text).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  })[character]);
}

function renderSnippets() {
  const search = $('search').value.trim().toLowerCase();

  const shown = data.snippets.filter((snippet) => {
    const allText =
      `${snippet.title} ${snippet.language} ${snippet.code}`.toLowerCase();

    return allText.includes(search);
  });

  $('snippetCount').textContent =
    `${shown.length} saved`;

  $('snippetList').innerHTML = shown.length
    ? shown
        .map(
          (snippet) => `
            <article class="snippet">
              <div class="snippet-top">
                <div>
                  <h3>${escapeHtml(snippet.title)}</h3>
                  <span class="language">${escapeHtml(snippet.language)}</span>
                </div>
              </div>

              <pre><code>${escapeHtml(snippet.code)}</code></pre>

              <div class="snippet-actions">
                <button data-copy="${snippet.id}">Copy</button>
                <button class="soft-button" data-open="${snippet.id}">
                  Open
                </button>
                <button class="delete" data-delete="${snippet.id}">
                  Delete
                </button>
              </div>
            </article>
          `
        )
        .join('')
    : '<p class="empty">No code idea found. Try a different search.</p>';
}

function renderRecent() {
  const recentSnippets = data.recent
    .map((id) => data.snippets.find((snippet) => snippet.id === id))
    .filter(Boolean);

  $('recentList').innerHTML = recentSnippets.length
    ? recentSnippets
        .map(
          (snippet) => `
            <button class="recent-button" data-open="${snippet.id}">
              ${escapeHtml(snippet.title)}
              <small>${escapeHtml(snippet.language)}</small>
            </button>
          `
        )
        .join('')
    : '<p class="empty">Open a code idea to see it here.</p>';
}

function openSnippet(id) {
  const snippet = data.snippets.find((item) => item.id === id);
  if (!snippet) return;

  $('title').value = snippet.title;
  $('language').value = snippet.language;
  $('code').value = snippet.code;

  data.recent = [
    id,
    ...data.recent.filter((recentId) => recentId !== id)
  ].slice(0, 4);

  save();
  renderRecent();

  $('addSnippet').scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}

function deleteSnippet(id) {
  const snippet = data.snippets.find((item) => item.id === id);
  if (!snippet) return;

  const answer = confirm(`Delete "${snippet.title}"?`);
  if (!answer) return;

  data.snippets = data.snippets.filter((item) => item.id !== id);
  data.recent = data.recent.filter((recentId) => recentId !== id);

  save();
  renderSnippets();
  renderRecent();
}

async function copySnippet(id) {
  const snippet = data.snippets.find((item) => item.id === id);
  if (!snippet) return;

  try {
    await navigator.clipboard.writeText(snippet.code);
    alert('Code copied! Now paste it wherever you are coding.');
  } catch (error) {
    $('code').value = snippet.code;
    $('code').select();
    document.execCommand('copy');
    alert('Code copied!');
  }
}

$('snippetForm').addEventListener('submit', (event) => {
  event.preventDefault();

  const title = $('title').value.trim();
  const language = $('language').value;
  const code = $('code').value.trim();

  if (!title || !code) return;

  data.snippets.unshift(createSnippet(title, language, code));

  $('title').value = '';
  $('code').value = '';

  save();
  renderSnippets();
});

$('loadExample').addEventListener('click', () => {
  const example = examples[$('language').value];

  $('title').value = example.title;
  $('code').value = example.code;
});

$('showStarter').addEventListener('click', () => {
  $('title').value = examples.HTML.title;
  $('language').value = 'HTML';
  $('code').value = examples.HTML.code;

  $('addSnippet').scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
});

$('search').addEventListener('input', renderSnippets);

$('snippetList').addEventListener('click', (event) => {
  const copyButton = event.target.closest('[data-copy]');
  const openButton = event.target.closest('[data-open]');
  const deleteButton = event.target.closest('[data-delete]');

  if (copyButton) copySnippet(copyButton.dataset.copy);
  if (openButton) openSnippet(openButton.dataset.open);
  if (deleteButton) deleteSnippet(deleteButton.dataset.delete);
});

$('recentList').addEventListener('click', (event) => {
  const button = event.target.closest('[data-open]');

  if (button) {
    openSnippet(button.dataset.open);
  }
});

renderSnippets();
renderRecent();
