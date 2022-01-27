function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
}

let nextServoAddress = 0;

class Servo {
    address = nextServoAddress++;
    servoName = `Servo ${this.address}`;
    _pwm = 127;
    endpoints = [0, 255];
    axisSpeed = 1;
    axis = null;
    buttonSpeed = 0.1;
    buttonAdd = null;
    buttonRemove = null;

    constructor(address) {
        this.address = address
    }

    static fromJSON({address, _pwm, endpoints, axisSpeed, axis, buttonSpeed, buttonAdd, buttonRemove}) {
        let servo = new Servo(address);
        servo._pwm = _pwm;
        servo.endpoints = endpoints;
        servo.axisSpeed = axisSpeed;
        servo.axis = axis;
        servo.buttonSpeed = buttonSpeed;
        servo.buttonAdd = buttonAdd;
        servo.buttonRemove = buttonRemove;
        return servo;
    }

    move(val) {
        this.pwm += val;
    }

    set name(newName){
        if(newName.length == 0){
            this.servoName = `Servo ${this.address}`;
        }else {
            this.servoName = newName;
        }
    }

    set pwm(pwm) {
        this._pwm = clamp(pwm, this.endpoints[0], this.endpoints[1]);
    }

    get pwm() {
        return this._pwm;
    }

    set min(min) {
        this.endpoints[0] = Math.min(min, this.endpoints[1]);
        this.pwm += 0; // Will clamp the pwm value
    }

    set max(max) {
        this.endpoints[1] = Math.max(max, this.endpoints[0]);
        this.pwm += 0; // Will clamp the pwm value
    }
}

class Action {
    address;
    pwm;
    delay;

    constructor(address, pwm, delay) {
        this.address = address;
        this.pwm = pwm;
        this.delay = delay;
    }

    static fromJSON({address, pwm, delay}) {
        return new Action(address, pwm, delay);
    }
}

class Macro {
    name = "";
    actions = [];
    running = false;
    button = null;

    constructor(name) {
        this.name = name;
    }

    static fromJSON({name, actions, button}) {
        let macro = new Macro(name);
        macro.actions = actions;
        macro.button = parseInt(button);
        return macro;
    }

    play(i) {
        if (i > this.actions.length - 1) {
            this.running = false;
            return;
        }
        model.setServo(this.actions[i].address, this.actions[i].pwm);
        setTimeout(() => {
            this.play(i + 1)
        }, this.actions[i].delay * 1000);
    }

    run() {
        if (this.running) {
            return;
        }
        this.running = true;
        this.play(0);
    }

    add(action) {
        this.actions.push(action);
    }
}

class Model {
    servos = [];
    macros = [];
    socket = null;
    loggerCallback = console.log;
    deadzone = 0.2;

    addServo(servo) {
        this.servos.push(servo);
    }

    clearServos() {
        this.servos = [];
    }

    setServo(address, pwm) {
        this.servos[address].pwm = pwm;
    }

    addMacro(macro) {
        this.macros.push(macro);
    }

    clearMacros() {
        this.macros = [];
    }

    update(delta, gamepad) {
        this.servos.forEach(servo => {
                if (!gamepad) {
                    return;
                }
                if (servo.axis != null && gamepad.axes[servo.axis] != null) {
                    const input = gamepad.axes[servo.axis];
                    if (Math.abs(input) > this.deadzone) {
                        servo.move(input * servo.axisSpeed * delta);
                    }
                }
                if (servo.buttonAdd != null && gamepad.buttons[servo.buttonAdd] != null) {
                    servo.move(gamepad.buttons[servo.buttonAdd].value * servo.buttonSpeed * delta);
                }
                if (servo.buttonRemove != null && gamepad.buttons[servo.buttonRemove] != null) {
                    servo.move(-gamepad.buttons[servo.buttonRemove].value * servo.buttonSpeed * delta);
                }
            }
        );

        this.macros.forEach(macro => {
           if (!gamepad) {
               return;
           }
           if (macro.button != null && gamepad.buttons[macro.button] != null) {
               if (gamepad.buttons[macro.button].pressed) {
                   macro.run();
               }
           }
        });

        this.sendPWMs();
    }

    connect(address, port) {
        const socket = new WebSocket(`ws://${address}:${port}`);
        socket.addEventListener('open', _ => this.onSocketOpen(socket));
        socket.addEventListener('close', (_) => {
            this.socket = null;
            this.loggerCallback("Disconnected!")
        });
        socket.addEventListener('message', ({data}) => this.loggerCallback(data));
    }

    onSocketOpen(socket) {
        this.socket = socket;
        this.loggerCallback("Connected!");
    }

    sendPWMs() {
        if (this.socket != null) {
            const data = {"servos": {}};
            this.servos.forEach(({address, pwm}) => data["servos"][address] = Math.round(pwm));
            this.socket.send(JSON.stringify(data));
        }
    }
}