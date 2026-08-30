const key = 'markdown.content';
const source = document.getElementById('source');
const preview = document.getElementById('preview');
const sampleButton = document.getElementById('sample');
const downloadButton = document.getElementById('export');

const example = '# Welcome\n\nWrite **beautiful notes** with _live preview_.\n\n- It saves automatically\n- Export when ready';

source.value = localStorage.getItem(key) || example;

function md(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/^- (.*)$/gm, '<li>$1</li>')
    .replace(/\n/g, '<br>');
}

function render() {
  preview.innerHTML = md(source.value);
  localStorage.setItem(key, source.value);
}

source.oninput = render;

sampleButton.onclick = () => {
  source.value = example;
  render();
};

downloadButton.onclick = () => {
  const file = new Blob([source.value], { type: 'text/markdown' });
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'note.md';

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

render();
