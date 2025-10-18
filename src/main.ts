import "./style.css";

document.title = "Sticker SKetchpad";
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
let drawing = false;
let lastX = 0;
let lastY = 0;

function drawLine(x1: number, y1: number, x2: number, y2: number) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.stroke();
}

canvas.addEventListener("mousedown", (e) => {
  drawing = true;
  lastX = e.offsetX;
  lastY = e.offsetY;
});

canvas.addEventListener("mousemove", (e) => {
  if (!drawing) return;
  drawLine(lastX, lastY, e.offsetX, e.offsetY);
  lastX = e.offsetX;
  lastY = e.offsetY;
});

canvas.addEventListener("mouseup", () => {
  drawing = false;
});

canvas.addEventListener("mouseleave", () => {
  drawing = false;
});

const clearBtn = document.createElement("button");
clearBtn.textContent = "Clear";
app.appendChild(clearBtn);

clearBtn.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});
