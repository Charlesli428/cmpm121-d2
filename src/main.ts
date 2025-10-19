import "./style.css";

document.title = "Sticker Sketchpad";
document.body.innerHTML = "";
const app = document.createElement("div");
app.id = "app";
document.body.appendChild(app);

const h1 = document.createElement("h1");
h1.textContent = "Sticker Sketchpad";
app.appendChild(h1);

const canvas = document.createElement("canvas");
canvas.id = "stage";
canvas.width = 256;
canvas.height = 256;
app.appendChild(canvas);

//Step 2
const ctx = (canvas as HTMLCanvasElement).getContext("2d")!;
type Point = { x: number; y: number };
type Stroke = Point[];
const displayList: Stroke[] = [];
let currentStroke: Stroke | null = null;
const redoStack: Stroke[] = [];

function dispatchDrawingChanged() {
  canvas.dispatchEvent(new Event("drawing-changed"));
}

canvas.addEventListener("drawing-changed", () => {
  // clear and redraw everything
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;

  for (const stroke of displayList) {
    if (stroke.length < 2) continue;
    ctx.beginPath();
    ctx.moveTo(stroke[0].x, stroke[0].y);
    for (let i = 1; i < stroke.length; i++) {
      ctx.lineTo(stroke[i].x, stroke[i].y);
    }
    ctx.stroke();
  }
});

canvas.addEventListener("mousedown", (e) => {
  currentStroke = [{ x: e.offsetX, y: e.offsetY }];
  displayList.push(currentStroke);
  dispatchDrawingChanged();
});

canvas.addEventListener("mousemove", (e) => {
  if (!currentStroke) return;
  currentStroke.push({ x: e.offsetX, y: e.offsetY });
  dispatchDrawingChanged();
});

canvas.addEventListener("mouseup", () => {
  currentStroke = null;
});

canvas.addEventListener("mouseleave", () => {
  currentStroke = null;
});

const clearBtn = document.createElement("button");
clearBtn.textContent = "Clear";
app.appendChild(clearBtn);
//Comment
const undoBtn = document.createElement("button");
undoBtn.textContent = "Undo";
app.appendChild(undoBtn);

const redoBtn = document.createElement("button");
redoBtn.textContent = "Redo";
app.appendChild(redoBtn);

clearBtn.addEventListener("click", () => {
  displayList.length = 0;
  dispatchDrawingChanged();
});

undoBtn.addEventListener("click", () => {
  if (displayList.length === 0) return;
  const popped = displayList.pop()!;
  redoStack.push(popped);
  dispatchDrawingChanged();
});

redoBtn.addEventListener("click", () => {
  if (redoStack.length === 0) return;
  const restored = redoStack.pop()!;
  displayList.push(restored);
  dispatchDrawingChanged();
});
