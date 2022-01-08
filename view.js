class View {
    servoCards = new Map();

    update(servos) {
        servos.forEach((servo) => {
            this.servoCards.get(servo["address"].toString()).update(servo);
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

    addServoCard(servo, gamepad) {
        this.servoCards.set(servo.address.toString(),this._createServoCard(servo, gamepad));
    }

    _createServoCard(servo,gamepad) {
        const servoDiv = document.createElement("div");
        servoDiv.className = "servo card";
        servoDiv.servoAddress = servo.address;

        const headerDiv = document.createElement("div");
        headerDiv.className = "card-header";
        const header = document.createElement("h1");
        header.textContent = `Servo ${servoDiv.servoAddress}`;
        headerDiv.appendChild(header);

        const pwmUpdate = (input, value, { pwm }) => {
            input.value = pwm;
            value.textContent = Math.round(pwm).toString();
        }
        const pwmDiv = this._createSliderRow("PWM", 0, 255, servo.pwm, 1, (pwm) => servo.pwm = pwm, pwmUpdate);

        const minUpdate = (input, value, { endpoints }) => {
            input.value = endpoints[0];
            value.textContent = endpoints[0];
        }
        const minDiv = this._createSliderRow("Min", 0, 255, servo.min, 1, (min) => servo.min = min, minUpdate);

        const maxUpdate = (input, value, { endpoints }) => {
            input.value = endpoints[1];
            value.textContent = endpoints[1];
        }
        const maxDiv = this._createSliderRow("Max", 0, 255, servo.max, 1, (max) => servo.max = max, maxUpdate);

        const axisSpeedDiv = this._createInputRow("Axis speed", -5, 5, servo.axisSpeed, 0.1, (axisSpeed) => servo.axisSpeed = axisSpeed);
        const buttonSpeedDiv = this._createInputRow("Button speed", -5, 5, servo.buttonSpeed, 0.1, (buttonSpeed) => servo.buttonSpeed = buttonSpeed);

        servoDiv.appendChild(headerDiv);
        servoDiv.appendChild(pwmDiv);
        servoDiv.appendChild(minDiv);
        servoDiv.appendChild(maxDiv);

        servoDiv.appendChild(axisSpeedDiv);
        servoDiv.appendChild(this._createDropdownRow("Axis", gamepad.axes, "Axis", servo.axis, (axis) => {servo.axis = axis}));

        servoDiv.appendChild(buttonSpeedDiv);
        servoDiv.appendChild(this._createDropdownRow("Button +", gamepad.buttons, "Button", servo.buttonAdd, (buttonAdd) => servo.buttonAdd = buttonAdd));
        servoDiv.appendChild(this._createDropdownRow("Button -", gamepad.buttons, "Button", servo.buttonRemove, (buttonRemove) => servo.buttonRemove = buttonRemove));

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

    _createInputRow(name, min, max, value, step, callback){
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

    _createDropdownRow(name,inputs, typeName, value, callback) {
        const div = document.createElement("div");
        div.className = "servo-row";
        const label = document.createElement("label");
        label.textContent = name;
        const input = document.createElement("select");

        var option;  
        option = document.createElement("option");

        option.value = null;
        option.text = "No selected";
        option.selected = true;
        input.appendChild(option);

        for (let i = 0; i < inputs.length; i++) {
            option = document.createElement("option");
            option.value = i;
            option.text = typeName + ": " + i;
            if(value == i){
                option.selected = true;
            }
            input.appendChild(option);
        }

        input.onchange = (ev)=>{
            const value = ev.target.options[ev.target.selectedIndex].value;
            callback(value);
        }
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

    clearServos() {
        this.servoCards.forEach((val, key) => {
            val.remove();
            this.servoCards.delete(key);
        });
    }

    addMacro(macro) {
        const macroCard = document.createElement("div");
        macroCard.className = "card";

        const header = document.createElement("h1");
        header.textContent = macro.name;
        macroCard.appendChild(header);

        const playButton = document.createElement("button");
        playButton.textContent = "Play";
        playButton.addEventListener("click", (_) => macro.run());
        macroCard.appendChild(playButton);

        document.getElementById("macros").appendChild(macroCard);
    }
}