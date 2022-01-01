const controllers = {};
const buttons = [];
const sliders = [];

let nextServo = 0;

function addGamepad(gamepad) {
  controllers[gamepad.index] = gamepad;
  document.getElementById("gamepad-header").textContent = "Gamepad";

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

function addServoListener() {
  addServo();
}

function addServo() {
  const servoDiv = document.createElement("div");
  servoDiv.className = "servo card";

  const headerDiv = document.createElement("div");
  headerDiv.className = "card-header";

  const header = document.createElement("h1");
  header.textContent = `Servo ${nextServo++}`;
  headerDiv.appendChild(header);

  const enableDiv = document.createElement("div");
  const enableLabel = document.createElement("label");
  enableLabel.textContent= "Enable:";
  const enableCheckbox = document.createElement("input");
  enableCheckbox.type = "checkbox";
  enableDiv.appendChild(enableLabel);
  enableDiv.appendChild(enableCheckbox);
  headerDiv.appendChild(enableDiv);
  servoDiv.appendChild(headerDiv);

  const sliderDiv = document.createElement("div");
  sliderDiv.className = "sliderDiv servo-row";
  const sliderLabel= document.createElement("label");
  sliderLabel.textContent= "PWM:";
  sliderDiv.appendChild(sliderLabel);
  const pwmValue = document.createElement("label");
  sliderDiv.appendChild(pwmValue);
  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = "0";
  slider.max = "255";
  slider.value = "127";
  slider.step = "1";
  sliderDiv.appendChild(slider);
  slider.oninput = () => pwmValue.textContent = slider.value.toString();
  pwmValue.textContent = slider.value.toString();

  servoDiv.appendChild(sliderDiv);
  document.getElementById("servos").insertBefore(servoDiv, document.getElementById("tail"));
}