const controllers = {};
const buttons = [];
const sliders = [];

function addGamepad(gamepad) {
  controllers[gamepad.index] = gamepad;
  document.getElementById("start").remove();

  for (let i=0; i<gamepad.buttons.length; i++) {
    const div = document.createElement("div");
    div.className = "gamepad-button";
    const label = document.createElement("p");
    label.textContent = i.toString();
    div.appendChild(label);
    buttons.push(document.getElementById("gamepad-buttons").appendChild(div));
  }

  for (let i = 0; i < gamepad.axes.length; i++) {
    const div = document.createElement("div");
    div.className = "gamepad-axis";
    const label = document.createElement("label");
    label.textContent = i.toString();
    div.appendChild(label);
    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "-1";
    slider.max = "1";
    slider.value = "0";
    slider.step = "0.01";
    sliders.push(div.appendChild(slider));
    document.getElementById("gamepad-axes").appendChild(div);
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
      buttons[i].className = "gamepad-button" + (val.pressed ? " pressed" : "");
    }

    for (let i=0; i<controller.axes.length; i++) {
      sliders[i].value = controller.axes[i];
    }
  }
  window.requestAnimationFrame(updateStatus);
}

window.addEventListener("gamepadconnected", ({gamepad}) => addGamepad(gamepad));
window.addEventListener("gamepaddisconnected", ({gamepad}) => removeGamepad(gamepad));
