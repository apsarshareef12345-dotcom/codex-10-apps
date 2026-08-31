const storageKey = 'superone-markdown';

const source = document.getElementById('source');
const preview = document.getElementById('preview');
const sampleButton = document.getElementById('sampleButton');
const downloadButton = document.getElementById('downloadButton');
const editorStatus = document.getElementById('editorStatus');
const previewStatus = document.getElementById('previewStatus');

const example =
  '# Welcome\n\n' +
  'Write **beautiful notes** with _live preview_.\n\n' +
  '## Getting Started\n\n' +
  '- It saves automatically\n' +
  '- Export when ready\n' +
  '- Make your ideas shine\n\n' +
  'Small steps create big things.';

source.value = localStorage.getItem(storageKey) || example;

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

source.addEventListener('input', () => {
  editorStatus.textContent = 'Saving...';
  render();
});

sampleButton.onclick = () => {
  source.value = example;
  render();
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

render();
