class View {
  servoCards = [];
}

let gamepad;
const buttons = [];
const sliders = [];

const model = new Model();
const view = new View();

let nextServo = 0;
let lastUpdate = Date.now();

function addGamepad(gamepad_) {
  gamepad = gamepad_;
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

function updateStatus() {
  model.update(Date.now() - lastUpdate, gamepad);
  lastUpdate = Date.now();

  model.getServos().forEach(([address, pwm]) => {
    document.getElementById(`pwmValue${address}`).textContent = pwm;
    document.getElementById(`pwmSlider${address}`).value = pwm;
  });

  for (let i=0; i<gamepad.buttons.length; i++) {
    let val = gamepad.buttons[i];
    buttons[i].className = "gamepad-button" + (val.pressed ? " pressed" : "");
  }

  for (let i=0; i<gamepad.axes.length; i++) {
    sliders[i].value = gamepad.axes[i];
  }

  window.requestAnimationFrame(updateStatus);
}

window.addEventListener("gamepadconnected", ({gamepad}) => addGamepad(gamepad));
window.addEventListener("gamepaddisconnected", ({gamepad}) => removeGamepad(gamepad));

function addServoListener() {
  view.servoCards.push(addServoCard());
  const servo = new Servo();
  servo.axis = 0;
  model.addServo(servo);
}

function addServoCard() {
  const servoDiv = document.createElement("div");
  servoDiv.className = "servo card";
  servoDiv.servoAddress = nextServo++;

  const headerDiv = document.createElement("div");
  headerDiv.className = "card-header";

  const header = document.createElement("h1");
  header.textContent = `Servo ${servoDiv.servoAddress}`;
  headerDiv.appendChild(header);

  const enableDiv = document.createElement("div");
  const enableLabel = document.createElement("label");
  enableLabel.textContent = "Enable:";
  const enableCheckbox = document.createElement("input");
  enableCheckbox.type = "checkbox";
  enableDiv.appendChild(enableLabel);
  enableDiv.appendChild(enableCheckbox);
  headerDiv.appendChild(enableDiv);
  servoDiv.appendChild(headerDiv);

  const sliderDiv = document.createElement("div");
  sliderDiv.className = "sliderDiv servo-row";
  const sliderLabel = document.createElement("label");
  sliderLabel.textContent = "PWM:";
  sliderDiv.appendChild(sliderLabel);
  const pwmValue = document.createElement("label");
  pwmValue.id = `pwmValue${servoDiv.servoAddress}`;
  sliderDiv.appendChild(pwmValue);
  const pwmSlider = document.createElement("input");
  pwmSlider.id = `pwmSlider${servoDiv.servoAddress}`;
  pwmSlider.type = "range";
  pwmSlider.min = "0";
  pwmSlider.max = "255";
  pwmSlider.value = "127";
  pwmSlider.step = "1";
  sliderDiv.appendChild(pwmSlider);
  pwmSlider.oninput = () => pwmValue.textContent = pwmSlider.value.toString();
  pwmValue.textContent = pwmSlider.value.toString();
  servoDiv.appendChild(sliderDiv);

  return document.getElementById("cards").appendChild(servoDiv);
}

function connectListener() {
  console.log("Connect not implemented!");
}

function loadListener() {
  console.log("Load not implemented!");
}

function saveListener() {
  console.log("Save not implemented!");
}