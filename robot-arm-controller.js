let gamepad;
const buttons = [];
const sliders = [];

const model = new Model();
const view = new View();
model.loggerCallback = view.log;

let nextServo = 0;
let nextMacro = 0;
let lastUpdate = Date.now();

window.addEventListener("gamepadconnected", ({gamepad}) => addGamepad(gamepad));
document.getElementById("file-selector").addEventListener('change', onLoadListener);
window.requestAnimationFrame(updateStatus);

function addGamepad(gamepad_) {
    gamepad = gamepad_;
    view.addGamepadCard(gamepad);
}

function updateStatus() {
    model.update(Date.now() - lastUpdate, gamepad);
    view.update(model.servos);
    lastUpdate = Date.now();

    if (gamepad) {
        for (let i = 0; i < gamepad.buttons.length; i++) {
            let val = gamepad.buttons[i];
            buttons[i].className = "gamepad-button" + (val.pressed ? " pressed" : "");
        }

        for (let i = 0; i < gamepad.axes.length; i++) {
            sliders[i].value = gamepad.axes[i];
        }
    }

    window.requestAnimationFrame(updateStatus);
}

function addServoListener(savedData = null) {
    let servo;
    if (savedData === null) {
        servo = new Servo(nextServo, 0);
    } else {
        servo = Servo.fromJSON(savedData);
    }
    view.addServoCard(servo, gamepad);
    model.addServo(servo);
    nextServo++;
}

function connectListener() {
    model.connect("localhost", "8765");
}

function onLoadListener(event) {
    model.clearServos();
    model.clearMacros();
    view.clearServos();
    view.clearMacros();
    nextServo = 0;
    nextMacro = 0;

    const file = event.target.files[0];
    if (file.type !== "application/json") {
        alert("Must be a .json savefile!");
        return;
    }
    const reader = new FileReader();
    reader.addEventListener('loadend', _ => load(reader.result));
    reader.readAsText(file);
}

function load(data) {
    let json = JSON.parse(data);
    json.servos.forEach(servo => addServoListener(servo));
    json.macros.forEach(macro => addMacro(macro));
}

function saveListener() {
    download(JSON.stringify({"servos": model.servos, "macros": model.macros}, null, 4), "save.json", "application/json");
}

function download(data, filename, type) {
    const file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        const a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}

function addMacro(savedData = null) {
    let macro;
    if (savedData === null) {
        macro = new Macro(`Macro ${nextMacro++}`);
    } else {
        macro = Macro.fromJSON(savedData);
        nextMacro++;
    }
    model.addMacro(macro);
    view.addMacro(macro);
}