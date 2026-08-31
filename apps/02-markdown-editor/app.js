const storageKey = 'superone-markdown';
const historyKey = 'superone-note-history';

const source = document.getElementById('source');
const preview = document.getElementById('preview');
const sampleButton = document.getElementById('sampleButton');
const downloadButton = document.getElementById('downloadButton');
const editorStatus = document.getElementById('editorStatus');
const previewStatus = document.getElementById('previewStatus');
const historyList = document.getElementById('historyList');
const clearHistoryButton = document.getElementById('clearHistoryButton');

const example =
  '# Welcome\n\n' +
  'Write **beautiful notes** with _live preview_.\n\n' +
  '## Getting Started\n\n' +
  '- It saves automatically\n' +
  '- Export when ready\n' +
  '- Make your ideas shine\n\n' +
  'Small steps create big things.';

source.value = localStorage.getItem(storageKey) || example;

let history = JSON.parse(
  localStorage.getItem(historyKey) || '[]'
);

let historyTimer = null;

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function markdown(text) {
  let html = escapeHtml(text);

  html = html
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>');

  html = html
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/_(.*?)_/g, '<em>$1</em>');

  html = html
    .replace(/^[-*] (.*)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  html = html.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');

  return (
    '<p>' +
    html +
    '</p>'
  )
    .replace(/<p><h/g, '<h')
    .replace(/<\/h([1-3])><\/p>/g, '</h$1>')
    .replace(/<p><ul>/g, '<ul>')
    .replace(/<\/ul><\/p>/g, '</ul>');
}

function render() {
  preview.innerHTML = markdown(source.value);

  localStorage.setItem(storageKey, source.value);

  editorStatus.textContent = '✓ Draft saved';
  previewStatus.textContent = '✓ Live preview';
}

function getTitle(text) {
  const firstLine = text.split('\n').find(line => line.trim());

  return (firstLine || 'Untitled note')
    .replace(/^#+\s*/, '')
    .slice(0, 28);
}

function saveHistory() {
  const content = source.value.trim();

  if (!content) return;

  if (history[0] && history[0].content === content) {
    return;
  }

  history.unshift({
    id: Date.now(),
    title: getTitle(content),
    content: content,
    savedAt: new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  });

  history = history.slice(0, 8);

  localStorage.setItem(historyKey, JSON.stringify(history));

  renderHistory();
}

function renderHistory() {
  if (history.length === 0) {
    historyList.innerHTML =
      '<span class="history-empty">Your saved notes will appear here.</span>';
    return;
  }

  historyList.innerHTML = history
    .map(
      item =>
        '<button class="history-item" data-id="' +
        item.id +
        '">' +
        '<b>' +
        escapeHtml(item.title) +
        '</b>' +
        '<small>' +
        item.savedAt +
        '</small>' +
        '</button>'
    )
    .join('');

  document.querySelectorAll('.history-item').forEach(button => {
    button.onclick = () => {
      const oldNote = history.find(
        item => String(item.id) === button.dataset.id
      );

      if (!oldNote) return;

      source.value = oldNote.content;
      render();
      source.focus();
    };
  });
}

source.addEventListener('input', () => {
  editorStatus.textContent = 'Saving...';

  render();

  clearTimeout(historyTimer);

  historyTimer = setTimeout(() => {
    saveHistory();
  }, 900);
});

sampleButton.onclick = () => {
  source.value = example;
  render();
  saveHistory();
  source.focus();
};

downloadButton.onclick = () => {
  const file = new Blob([source.value], {
    type: 'text/markdown'
  });

  const url = URL.createObjectURL(file);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'superone-note.md';

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
};

clearHistoryButton.onclick = () => {
  history = [];
  localStorage.removeItem(historyKey);
  renderHistory();
};

render();
renderHistory();
