let gamepad;
const buttons = [];
const sliders = [];

const model = new Model();
model.loggerCallback = msg => view.log(msg);
const view = new View();

let nextServo = 0;
let lastUpdate = Date.now();

function addGamepad(gamepad_) {
    gamepad = gamepad_;
    view.addGamepadCard(gamepad);

    window.requestAnimationFrame(updateStatus);
}

function updateStatus() {
    model.update(Date.now() - lastUpdate, gamepad);
    view.update(model.getServos());
    lastUpdate = Date.now();

    for (let i = 0; i < gamepad.buttons.length; i++) {
        let val = gamepad.buttons[i];
        buttons[i].className = "gamepad-button" + (val.pressed ? " pressed" : "");
    }

    for (let i = 0; i < gamepad.axes.length; i++) {
        sliders[i].value = gamepad.axes[i];
    }

    window.requestAnimationFrame(updateStatus);
}

window.addEventListener("gamepadconnected", ({gamepad}) => addGamepad(gamepad));

function addServoListener() {
    const servo = new Servo(nextServo++, 0);

    function axisSelectCallback(newAxis) {
        servo.axis = newAxis
    }

    function pwmCallback(pwm) {
        servo.pwm = pwm;
    }

    function minCallback(min) {
        servo.min = min;
    }

    function maxCallback(max) {
        servo.max = max;
    }

    function speedCallback(speed) {
        servo.speed = speed;
    }

    view.addServoCard(servo.address,
        axisSelectCallback,
        pwmCallback,
        minCallback,
        maxCallback,
        speedCallback);
    model.addServo(servo);
}

function connectListener() {
    model.connect("localhost", "8765")
}

function loadListener() {
    console.log("Load not implemented!");
}

function saveListener() {
    console.log("Save not implemented!");
}