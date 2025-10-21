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
canvas.height = 257;
app.appendChild(canvas);

//Step 2
const ctx = (canvas as HTMLCanvasElement).getContext("2d")!;
interface DisplayCommand {
  display(ctx: CanvasRenderingContext2D): void;
}
function makeLineCommand(): DisplayCommand & { points: Point[] } {
  const points: Point[] = [];
  const lineWidth = currentLineWidth;

  return {
    points,
    display(ctx) {
      if (points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.strokeStyle = "#000";
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    },
  };
}
function makePreviewCommand(x: number, y: number): DisplayCommand {
  const radius = currentLineWidth / 2;
  return {
    display(ctx) {
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = "#666";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    },
  };
}
function makeStickerCommand(x: number, y: number, emoji: string): DisplayCommand {
  return {
    display(ctx) {
      ctx.save();
      ctx.font = "24px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(emoji, x, y);
      ctx.restore();
    },
  };
}
type Point = { x: number; y: number };
const displayList: DisplayCommand[] = [];
let currentCommand: ReturnType<typeof makeLineCommand> | null = null;
let previewCommand: DisplayCommand | null = null;

const redoStack: DisplayCommand[] = [];
let currentLineWidth = 2;
let currentTool: "marker" | "sticker" = "marker";
let currentSticker = "⭐";

function dispatchDrawingChanged() {
  canvas.dispatchEvent(new Event("drawing-changed"));
}

canvas.addEventListener("drawing-changed", () => {
  // clear and redraw everything
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = currentLineWidth;

  for (const cmd of displayList) {
    cmd.display(ctx);
  }
  if (previewCommand && !currentCommand) {
    previewCommand.display(ctx);
  }
});

canvas.addEventListener("mousedown", (e) => {
  if (currentTool === "marker") {
    currentCommand = makeLineCommand();
    currentCommand.points.push({ x: e.offsetX, y: e.offsetY });
    displayList.push(currentCommand);
  } else if (currentTool === "sticker") {
    const cmd = makeStickerCommand(e.offsetX, e.offsetY, currentSticker);
    displayList.push(cmd);
  }
  dispatchDrawingChanged();
});

canvas.addEventListener("mousemove", (e) => {
  if (currentCommand) {
    currentCommand.points.push({ x: e.offsetX, y: e.offsetY });
  } else if (currentTool === "sticker") {
    previewCommand = makeStickerCommand(e.offsetX, e.offsetY, currentSticker);
  } else {
    previewCommand = makePreviewCommand(e.offsetX, e.offsetY);
  }
  dispatchDrawingChanged();
});

canvas.addEventListener("mouseup", () => {
  currentCommand = null;
});

canvas.addEventListener("mouseleave", () => {
  currentCommand = null;
  previewCommand = null;
  dispatchDrawingChanged();
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

const thinBtn = document.createElement("button");
thinBtn.textContent = "Thin";
app.appendChild(thinBtn);

const thickBtn = document.createElement("button");
thickBtn.textContent = "Thick";
app.appendChild(thickBtn);

thinBtn.addEventListener("click", () => {
  currentLineWidth = 2;
  thinBtn.classList.add("selectedTool");
  thickBtn.classList.remove("selectedTool");
});

thickBtn.addEventListener("click", () => {
  currentLineWidth = 8;
  thickBtn.classList.add("selectedTool");
  thinBtn.classList.remove("selectedTool");
});

const stickers = ["⭐", "❤️", "😎"];
stickers.forEach((emoji) => {
  const btn = document.createElement("button");
  btn.textContent = emoji;
  app.appendChild(btn);

  btn.addEventListener("click", () => {
    currentTool = "sticker";
    currentSticker = emoji;
    // clear highlights
    thinBtn.classList.remove("selectedTool");
    thickBtn.classList.remove("selectedTool");
  });
});

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
//Committed Change
