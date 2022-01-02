class Servo {
    address = 0;
    pwm = 127;
    endpoints = [0, 255];
    speed = 0.5;
    axis = null;

    constructor(address, axis) {
        this.address = address
        this.axis = axis
    }

    move(val) {
        this.pwm += val;
        this.pwm = this.pwm > this.endpoints[1] ? this.endpoints[1] : this.pwm < this.endpoints[0] ? this.endpoints[0] : this.pwm;
        this.pwm = Math.floor(this.pwm)
    }
    set pwm(pwm){
        this.pwm = pwm;
    }
    set min(min){
        this.endpoints[0] = min;
        this.endpoints[0] = this.endpoints[0] > this.endpoints[1] ? this.endpoints[1] : this.endpoints[0] < this.endpoints[0] ? this.endpoints[0] : this.endpoints[0];
        this.endpoints[0] = Math.floor(this.endpoints[0])
    }
    set max(max){
        this.endpoints[1] = max;
        this.endpoints[1] = this.endpoints[1] > this.endpoints[1] ? this.endpoints[1] : this.endpoints[1] < this.endpoints[0] ? this.endpoints[0] : this.endpoints[1];
        this.endpoints[1] = Math.floor(this.endpoints[1])
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
                if (servo.axis === null) {
                    console.log("No servo.axis");
                    return;
                }
                if (gamepad.axes[servo.axis] === null) {
                    console.log("No gamepad.axes");
                    return;
                }
                servo.move(gamepad.axes[servo.axis] * servo.speed * delta);
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
        socket.addEventListener('error', this.onSocketError);
        socket.addEventListener('close', this.onSocketClose);
        socket.addEventListener('message', this.onSocketMessage);
    }

    onSocketOpen(socket) {
        this.socket = socket;
        this.loggerCallback("Websocket connected!");
    }

    onSocketError(event) {
        this.loggerCallback("Websocket error: " + event.data);
    }

    onSocketClose(event) {
        this.socket = null;
        this.loggerCallback("Websocket disconnected!");
    }

    onSocketMessage(event) {
        this.loggerCallback(event.data)
    }

    sendPWMs() {
        if (this.socket !== null) {
            const data = {"servos": {}};
            this.servos.forEach(({address, pwm}) => data["servos"][address] = pwm);
            this.socket.send(JSON.stringify(data));
        }
    }
}