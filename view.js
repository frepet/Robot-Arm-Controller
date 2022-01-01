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

    addServoCard(address, axisSelectCallback, pwmCallback) {
        this.servoCards.push(this._createServoCard(address, axisSelectCallback, pwmCallback));
    }

    _createServoCard(servoAddress, axisSelectCallback, pwmCallback) {
        const servoDiv = document.createElement("div");
        servoDiv.className = "servo card";
        servoDiv.servoAddress = servoAddress;

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

        const sliderDiv = this._createPWMSlider(servoDiv.servoAddress, pwmCallback);

        servoDiv.appendChild(sliderDiv);
        servoDiv.appendChild(this._createAxisSelector(servoDiv.servoAddress, axisSelectCallback));


        servoDiv.update = (servo) => sliderDiv.update(servo);

        return document.getElementById("cards").appendChild(servoDiv);
    }

    _createPWMSlider(servoAddress, pwmCallback) {
        const sliderDiv = document.createElement("div");
        sliderDiv.className = "sliderDiv servo-row";
        const sliderLabel = document.createElement("label");
        sliderLabel.textContent = "PWM:";
        sliderDiv.appendChild(sliderLabel);
        const pwmValue = document.createElement("label");
        pwmValue.id = `pwmValue${servoAddress}`;
        sliderDiv.appendChild(pwmValue);
        const pwmSlider = document.createElement("input");
        pwmSlider.id = `pwmSlider${servoAddress}`;
        pwmSlider.type = "range";
        pwmSlider.min = "0";
        pwmSlider.max = "255";
        pwmSlider.value = "127";
        pwmSlider.step = "1";
        sliderDiv.appendChild(pwmSlider);
        pwmSlider.oninput = () => pwmCallback(parseInt(pwmSlider.value));
        pwmValue.textContent = pwmSlider.value.toString();

        sliderDiv.update = function ({pwm}) {
            pwmSlider.value = pwm;
            pwmValue.textContent = pwm;
        }
        return sliderDiv;
    }

    _createAxisSelector(servoAddress, axisSelectCallback) {
        const axisSelectorDiv = document.createElement("div");
        axisSelectorDiv.className = "servo-row";
        const axisSelectorLabel = document.createElement("label");
        axisSelectorLabel.textContent = "Axis:";
        axisSelectorDiv.appendChild(axisSelectorLabel);
        const axisSelectorInput = document.createElement("input");
        axisSelectorInput.className = "dropdown";
        axisSelectorInput.id = `axisSelector${servoAddress}`;
        axisSelectorInput.type = "number";
        axisSelectorInput.min = "0";
        axisSelectorInput.max = "7";
        axisSelectorInput.value = "0";
        axisSelectorInput.addEventListener('input', (event) => axisSelectCallback(event.target.value));
        axisSelectorDiv.appendChild(axisSelectorInput);
        return axisSelectorDiv;
    }
}