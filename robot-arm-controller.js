const controllers = {};
const sliders = [];

function addGamepad(gamepad) {
  controllers[gamepad.index] = gamepad;
  document.getElementById("start").remove();

  let prototype =
  `<div class="axis-slider">
    <label>X</label>
    <input type="range" min="-1" max="1" value="0" step="0.01">
  </div>`

  for (let i = 0; i < gamepad.axes.length; i++) {
    const node = document.createElement("div");
    node.className = "axis-slider";
    const label = document.createElement("label");
    label.textContent = i.toString();
    node.appendChild(label);
    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "-1";
    slider.max = "1";
    slider.value = "0";
    slider.step = "0.01";
    sliders.push(node.appendChild(slider));
    document.getElementById("axes").appendChild(node);
  }

  window.requestAnimationFrame(updateStatus);
}

function removeGamepad(gamepad) {
  const d = document.getElementById("controller" + gamepad.index);
  document.body.removeChild(d);
  delete controllers[gamepad.index];
}

function updateStatus() {
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);

  for (let j in controllers) {
    const controller = controllers[j];
    for (let i=0; i<controller.buttons.length; i++) {
      let val = controller.buttons[i];
      context.fillStyle = val.pressed ? "red" : "gray";
      context.fillRect(24*i, 0, 16, 16);

      context.fillStyle = "black";
      context.font = "14px sans";
      context.textAlign = "center";
      context.fillText(i.toString(), 24*i + 8, 14, 36);
    }

    for (let i=0; i<controller.axes.length; i++) {
      sliders[i].value = controller.axes[i];
    }
  }
  window.requestAnimationFrame(updateStatus);
}

window.addEventListener("gamepadconnected", ({gamepad}) => addGamepad(gamepad));
window.addEventListener("gamepaddisconnected", ({gamepad}) => removeGamepad(gamepad));
