const STORAGE_KEY = 'creative-studio-canvas-v1';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const $ = (id) => document.getElementById(id);

let drawing = false;
let lastPoint = null;
let colour = '#6f4daa';
let tool = 'pencil';
let brushSize = 10;
let opacity = 1;

let history = [];
let redoStack = [];

function fillCanvasWhite() {
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#fffefa';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

function saveCanvas() {
  localStorage.setItem(STORAGE_KEY, canvas.toDataURL('image/png'));

  $('saveStatus').textContent = '● Saved automatically';
  $('saveStatus').style.color = '#278859';

  setTimeout(() => {
    $('saveStatus').textContent = '● Ready to draw';
    $('saveStatus').style.color = '#278859';
  }, 1200);
}

function loadCanvas() {
  const savedImage = localStorage.getItem(STORAGE_KEY);

  if (!savedImage) {
    fillCanvasWhite();
    history = [canvas.toDataURL()];
    return;
  }

  const image = new Image();

  image.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    history = [canvas.toDataURL()];
    hideHint();
  };

  image.src = savedImage;
}

function saveHistory() {
  history.push(canvas.toDataURL('image/png'));

  if (history.length > 30) {
    history.shift();
  }

  redoStack = [];
  updateUndoButtons();
  saveCanvas();
}

function restoreImage(imageData) {
  const image = new Image();

  image.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    saveCanvas();
    updateUndoButtons();
  };

  image.src = imageData;
}

function updateUndoButtons() {
  $('undo').disabled = history.length <= 1;
  $('redo').disabled = redoStack.length === 0;
}

function getCanvasPoint(event) {
  const rect = canvas.getBoundingClientRect();

  return {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height)
  };
}

function getBrushSettings() {
  if (tool === 'eraser') {
    return {
      color: '#fffefa',
      size: brushSize * 2,
      alpha: 1
    };
  }

  if (tool === 'marker') {
    return {
      color: colour,
      size: brushSize * 1.8,
      alpha: opacity * 0.35
    };
  }

  if (tool === 'brush') {
    return {
      color: colour,
      size: brushSize * 1.3,
      alpha: opacity * 0.8
    };
  }

  return {
    color: colour,
    size: brushSize,
    alpha: opacity
  };
}

function drawLine(from, to) {
  const settings = getBrushSettings();

  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);

  ctx.strokeStyle = settings.color;
  ctx.lineWidth = settings.size;
  ctx.globalAlpha = settings.alpha;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.stroke();
  ctx.globalAlpha = 1;
}

function hideHint() {
  $('canvasHint').style.display = 'none';
}

canvas.addEventListener('pointerdown', (event) => {
  event.preventDefault();

  drawing = true;
  lastPoint = getCanvasPoint(event);

  canvas.setPointerCapture(event.pointerId);
  hideHint();

  // Makes one small dot when the user only clicks once.
  drawLine(lastPoint, {
    x: lastPoint.x + 0.1,
    y: lastPoint.y + 0.1
  });
});

canvas.addEventListener('pointermove', (event) => {
  if (!drawing) return;

  const point = getCanvasPoint(event);

  drawLine(lastPoint, point);
  lastPoint = point;
});

function stopDrawing() {
  if (!drawing) return;

  drawing = false;
  lastPoint = null;

  saveHistory();
}

canvas.addEventListener('pointerup', stopDrawing);
canvas.addEventListener('pointercancel', stopDrawing);
canvas.addEventListener('pointerleave', stopDrawing);

document.querySelectorAll('.color').forEach((button) => {
  button.addEventListener('click', () => {
    colour = button.dataset.color;

    document.querySelectorAll('.color').forEach((item) => {
      item.classList.remove('active');
    });

    button.classList.add('active');

    if (tool === 'eraser') {
      tool = 'pencil';

      document.querySelectorAll('.tool').forEach((item) => {
        item.classList.remove('active');
      });

      document.querySelector('[data-tool="pencil"]').classList.add('active');
    }
  });
});

document.querySelectorAll('.tool').forEach((button) => {
  button.addEventListener('click', () => {
    tool = button.dataset.tool;

    document.querySelectorAll('.tool').forEach((item) => {
      item.classList.remove('active');
    });

    button.classList.add('active');

    canvas.style.cursor = tool === 'eraser' ? 'cell' : 'crosshair';
  });
});

$('size').addEventListener('input', () => {
  brushSize = Number($('size').value);
  $('sizeValue').textContent = `${brushSize} px`;
});

$('opacity').addEventListener('input', () => {
  opacity = Number($('opacity').value) / 100;
  $('opacityValue').textContent = `${Math.round(opacity * 100)}%`;
});

$('undo').addEventListener('click', () => {
  if (history.length <= 1) return;

  const latest = history.pop();
  redoStack.push(latest);

  restoreImage(history[history.length - 1]);
});

$('redo').addEventListener('click', () => {
  if (!redoStack.length) return;

  const image = redoStack.pop();
  history.push(image);

  restoreImage(image);
});

$('clear').addEventListener('click', () => {
  const answer = confirm('Clear your whole drawing?');

  if (!answer) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  fillCanvasWhite();

  history = [canvas.toDataURL('image/png')];
  redoStack = [];

  $('canvasHint').style.display = 'grid';

  saveCanvas();
  updateUndoButtons();
});

$('download').addEventListener('click', () => {
  const link = document.createElement('a');

  link.download = 'my-creative-drawing.png';
  link.href = canvas.toDataURL('image/png');

  link.click();
});

loadCanvas();
updateUndoButtons();
