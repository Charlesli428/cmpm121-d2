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
