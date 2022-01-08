class Servo {
    address = 0;
    pwm = 127;
    endpoints = [0, 255];
    axisSpeed = 1;
    axis = null;
    buttonSpeed = 0.1;
    buttonAdd = null;
    buttonRemove = null;

    constructor(address, axis) {
        this.address = address
        this.axis = axis
    }

    static fromJSON({address, pwm, endpoints, speed, axis}) {
        let servo = new Servo(address, axis);
        servo.pwm = pwm;
        servo.endpoints = endpoints;
        servo.speed = speed;
        return servo;
    }

    move(val) {
        this.pwm += val;
        this.pwm = this.pwm > this.endpoints[1] ? this.endpoints[1] : this.pwm < this.endpoints[0] ? this.endpoints[0] : this.pwm;
    }

    set min(min){
        this.endpoints[0] = min;
        this.endpoints[0] = this.endpoints[0] > this.endpoints[1] ? this.endpoints[1] : this.endpoints[0] < this.endpoints[0] ? this.endpoints[0] : this.endpoints[0];
        this.endpoints[0] = Math.round(this.endpoints[0])
    }

    set max(max){
        this.endpoints[1] = max;
        this.endpoints[1] = this.endpoints[1] > this.endpoints[1] ? this.endpoints[1] : this.endpoints[1] < this.endpoints[0] ? this.endpoints[0] : this.endpoints[1];
        this.endpoints[1] = Math.round(this.endpoints[1])
    }
}

class Model {
    servos = [];
    socket = null;
    loggerCallback = console.log;

    addServo(servo) {
        this.servos.push(servo);
    }

    update(delta, gamepad) {
        this.servos.forEach((servo) => {
                if (!gamepad) {
                    return;
                }
                if(servo.axis != null && gamepad.axes[servo.axis] != null){
                    servo.move(gamepad.axes[servo.axis] * servo.axisSpeed * delta);
                }   
                if(servo.buttonAdd != null && gamepad.buttons[servo.buttonAdd] != null){
                    servo.move(gamepad.buttons[servo.buttonAdd].value * servo.buttonSpeed * delta);
                }  
                if(servo.buttonRemove != null && gamepad.buttons[servo.buttonRemove] != null){
                    servo.move(-gamepad.buttons[servo.buttonRemove].value * servo.buttonSpeed * delta);
                }               
            }
        );

        this.sendPWMs();
    }

    getServos() {
        return this.servos;
    }

    connect(address, port) {
        const socket = new WebSocket(`ws://${address}:${port}`);
        socket.addEventListener('open', _ => this.onSocketOpen(socket));
        socket.addEventListener('close', (_) => {this.socket = null; this.loggerCallback("Disconnected!")});
        socket.addEventListener('message', ({data}) => this.loggerCallback(data));
    }

    onSocketOpen(socket) {
        this.socket = socket;
        this.loggerCallback("Connected!");
    }

    sendPWMs() {
        if (this.socket !== null) {
            const data = {"servos": {}};
            this.servos.forEach(({address, pwm}) => data["servos"][address] = Math.round(pwm));
            this.socket.send(JSON.stringify(data));
        }
    }

    clearServos() {
        this.servos = [];
    }
}