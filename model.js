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
}

class Model {
    servos = [];

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
    }

    getServos() {
        return this.servos;
    }
}