const controllers = {};

function addGamepad(gamepad) {
  controllers[gamepad.index] = gamepad;
  document.getElementById("start").remove();
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
      context.fillRect(24*i, 0, 16, 16)

      context.fillStyle = "black"
      context.fillText(i.toString(), 24*i + 4, 12, 16)
    }

    for (let i=0; i<controller.axes.length; i++) {
      context.fillText(controller.axes[i].toFixed(2), 10, 32 + 16*i, 500);
    }
  }
  window.requestAnimationFrame(updateStatus);
}

window.addEventListener("gamepadconnected", ({gamepad}) => addGamepad(gamepad));
window.addEventListener("gamepaddisconnected", ({gamepad}) => removeGamepad(gamepad));
