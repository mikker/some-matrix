document.addEventListener("DOMContentLoaded", init);

let canvas = null
let ctx = null
let services = ['facebook']

const images = {
  facebook: 'data:image/svg+xml;base64,PHN2ZyBhcmlhLWxhYmVsbGVkYnk9InNpbXBsZWljb25zLWZhY2Vib29rLWljb24iIHJvbGU9ImltZyIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0aXRsZSBpZD0ic2ltcGxlaWNvbnMtZmFjZWJvb2staWNvbiI+RmFjZWJvb2sgaWNvbjwvdGl0bGU+PHBhdGggZD0iTTIyLjY3NiAwSDEuMzI0Qy41OTMgMCAwIC41OTMgMCAxLjMyNHYyMS4zNTJDMCAyMy40MDguNTkzIDI0IDEuMzI0IDI0aDExLjQ5NHYtOS4yOTRIOS42ODl2LTMuNjIxaDMuMTI5VjguNDFjMC0zLjA5OSAxLjg5NC00Ljc4NSA0LjY1OS00Ljc4NSAxLjMyNSAwIDIuNDY0LjA5NyAyLjc5Ni4xNDF2My4yNGgtMS45MjFjLTEuNSAwLTEuNzkyLjcyMS0xLjc5MiAxLjc3MXYyLjMxMWgzLjU4NGwtLjQ2NSAzLjYzSDE2LjU2VjI0aDYuMTE1Yy43MzMgMCAxLjMyNS0uNTkyIDEuMzI1LTEuMzI0VjEuMzI0QzI0IC41OTMgMjMuNDA4IDAgMjIuNjc2IDAiLz48L3N2Zz4='
}

function init() {
  canvas = document.getElementById("canvas");
  canvas.style.height = "500px";
  canvas.style.width = "500px";
  ctx = canvas.getContext("2d");

  // Retina
  if (window.devicePixelRatio == 2) {
    canvas.setAttribute("width", 1000);
    canvas.setAttribute("height", 1000);
    ctx.scale(2, 2);
  }

  drawAxes();
  drawServices();
}

function drawAxes() {
  ctx.beginPath();
  ctx.moveTo(250, 0);
  ctx.lineTo(250, 500);
  ctx.moveTo(0, 250);
  ctx.lineTo(500, 250);
  ctx.stroke();
}

function drawServices () {
  services.forEach(service => {
    const image = new Image()
    image.onload = () => { ctx.drawImage(image, 250, 250) }
    image.src = images[service]
  })
}
