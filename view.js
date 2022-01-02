class View {
    servoCards = [];

    update(servos) {
        servos.forEach((servo) => {
            this.servoCards[servo["address"]].update(servo);
        });
    }

    addGamepadCard(gamepad) {
        document.getElementById("gamepad-header").textContent = "Gamepad";

        for (let i = 0; i < gamepad.buttons.length; i++) {
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
    }

    addServoCard(address, axisSelectCallback, pwmCallback, minCallback, maxCallback, speedCallback) {
        this.servoCards.push(this._createServoCard(address, axisSelectCallback, pwmCallback, minCallback, maxCallback, speedCallback));
    }

    _createServoCard(servoAddress, axisSelectCallback, pwmCallback, minCallback, maxCallback, speedCallback) {
        const servoDiv = document.createElement("div");
        servoDiv.className = "servo card";
        servoDiv.servoAddress = servoAddress;

        const headerDiv = document.createElement("div");
        headerDiv.className = "card-header";
        const header = document.createElement("h1");
        header.textContent = `Servo ${servoDiv.servoAddress}`;
        headerDiv.appendChild(header);

        const pwmUpdate = (input, value, { pwm }) => {
            input.value = pwm;
            value.textContent = Math.round(pwm).toString();
        }
        const pwmDiv = this._createSliderRow("PWM", 0, 255, 127, 1, pwmCallback, pwmUpdate);

        const minUpdate = (input, value, { endpoints }) => {
            input.value = endpoints[0];
            value.textContent = endpoints[0];
        }
        const minDiv = this._createSliderRow("Min", 0, 255, 0, 1, minCallback, minUpdate);

        const maxUpdate = (input, value, { endpoints }) => {
            input.value = endpoints[1];
            value.textContent = endpoints[1];
        }
        const maxDiv = this._createSliderRow("Max", 0, 255, 255, 1, maxCallback, maxUpdate);

        const speedDiv = this._createDropdownRow("Speed", -5, 5, 1, 0.1, speedCallback);

        servoDiv.appendChild(headerDiv);
        servoDiv.appendChild(pwmDiv);
        servoDiv.appendChild(minDiv);
        servoDiv.appendChild(maxDiv);
        servoDiv.appendChild(speedDiv);
        servoDiv.appendChild(this._createDropdownRow("Axis", 0, 7, 0, 1, axisSelectCallback));

        servoDiv.update = (servo) => {
            pwmDiv.update(servo);
            minDiv.update(servo);
            maxDiv.update(servo);
        };

        return document.getElementById("servos").appendChild(servoDiv);
    }

    /**
     *  Creates a slider row for a servo card.
     * @param name Name of the slider
     * @param min Min value
     * @param max Max value
     * @param value Initial value
     * @param step Step size
     * @param callback Call this function when the slider is changed by user
     * @param update This function is called when model updates
     * @returns {HTMLDivElement} The slider row as a div-element.
     * @private
     */
    _createSliderRow(name, min, max, value, step, callback, update) {
        const div = document.createElement("div");
        div.className = "sliderDiv servo-row";
        const label = document.createElement("label");
        label.textContent = name + ": ";
        const val = document.createElement("label");
        const input = document.createElement("input");
        input.type = "range";
        input.min = min;
        input.max = max;
        input.value = val;
        input.step = step;
        input.oninput = () => callback(parseInt(input.value));
        val.textContent = input.value.toString();

        div.appendChild(label);
        div.appendChild(val);
        div.appendChild(input);
        div.update = (state) => update(input, val, state);
        return div;
    }

    _createDropdownRow(name, min, max, value, step, callback) {
        const div = document.createElement("div");
        div.className = "servo-row";
        const label = document.createElement("label");
        label.textContent = name;
        const input = document.createElement("input");
        input.className = "dropdown";
        input.type = "number";
        input.min = min;
        input.max = max;
        input.value = value;
        input.step = step
        input.addEventListener('input', (event) => callback(event.target.value));

        div.appendChild(label);
        div.appendChild(input);
        return div;
    }

    log(msg) {
        const logger = document.getElementById("logger");
        const log = document.createElement("p");
        log.textContent = msg;
        logger.appendChild(log);
        logger.scrollTo(0, logger.scrollHeight);
    }
}