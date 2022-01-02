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

    addServoCard(address, axisSelectCallback, pwmCallback, minCallback, maxCallback) {
        this.servoCards.push(this._createServoCard(address, axisSelectCallback, pwmCallback, minCallback, maxCallback));
    }

    _createServoCard(servoAddress, axisSelectCallback, pwmCallback, minCallback, maxCallback) {
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

        const sliderDiv = this._createPWMSlider(pwmCallback);
        const minMaxSliderDiv = this._createEndpointsSlider(minCallback, maxCallback);

        servoDiv.appendChild(sliderDiv);
        servoDiv.appendChild(minMaxSliderDiv);
        servoDiv.appendChild(this._createAxisSelector(axisSelectCallback));


        servoDiv.update = (servo) => {
            sliderDiv.update(servo);
            minMaxSliderDiv.update(servo);
        };

        return document.getElementById("servos").appendChild(servoDiv);
    }

    _createPWMSlider(pwmCallback) {
        const sliderDiv = document.createElement("div");
        sliderDiv.className = "sliderDiv servo-row";
        const sliderLabel = document.createElement("label");
        sliderLabel.textContent = "PWM:";
        sliderDiv.appendChild(sliderLabel);
        const pwmValue = document.createElement("label");
        sliderDiv.appendChild(pwmValue);
        const pwmSlider = document.createElement("input");
        pwmSlider.type = "range";
        pwmSlider.min = "0";
        pwmSlider.max = "255";
        pwmSlider.value = "127";
        pwmSlider.step = "1";
        sliderDiv.appendChild(pwmSlider);
        pwmSlider.oninput = () => pwmCallback(parseInt(pwmSlider.value));
        pwmValue.textContent = pwmSlider.value.toString();

        sliderDiv.update = function ({ pwm }) {
            pwmSlider.value = pwm;
            pwmValue.textContent = pwm;
        }
        return sliderDiv;
    }

    _createAxisSelector(axisSelectCallback) {
        const axisSelectorDiv = document.createElement("div");
        axisSelectorDiv.className = "servo-row";
        const axisSelectorLabel = document.createElement("label");
        axisSelectorLabel.textContent = "Axis:";
        axisSelectorDiv.appendChild(axisSelectorLabel);
        const axisSelectorInput = document.createElement("input");
        axisSelectorInput.className = "dropdown";
        axisSelectorInput.type = "number";
        axisSelectorInput.min = "0";
        axisSelectorInput.max = "7";
        axisSelectorInput.value = "0";
        axisSelectorInput.addEventListener('input', (event) => axisSelectCallback(event.target.value));
        axisSelectorDiv.appendChild(axisSelectorInput);
        return axisSelectorDiv;
    }

    _createEndpointsSlider(minCallback, maxCallback) {
        const endpointSliderDiv = document.createElement("div");

        const endpointLabel = document.createElement("label");
        endpointLabel.textContent = "Endpoint";
        endpointSliderDiv.appendChild(endpointLabel);
        const linebreak = document.createElement("br");
        endpointSliderDiv.appendChild(linebreak);

        const minDiv = document.createElement("div");
        minDiv.className = "sliderDiv servo-row";
        const minLabel = document.createElement("label");
        minLabel.textContent = "Min:";
        minDiv.appendChild(minLabel);
        const minValue = document.createElement("label");
        minDiv.appendChild(minValue);

        const minSlider = document.createElement("input");
        minSlider.type = "range";
        minSlider.min = "0";
        minSlider.max = "255";
        minSlider.value = "0";
        minSlider.step = "1";
        minSlider.oninput = () => minCallback(parseInt(minSlider.value));
        minDiv.appendChild(minSlider);
        endpointSliderDiv.appendChild(minDiv);
        
        const maxDiv = document.createElement("div");
        maxDiv.className = "sliderDiv servo-row";
        const maxLabel = document.createElement("label");
        maxLabel.textContent = "Max:";
        maxDiv.appendChild(maxLabel);
        const maxValue = document.createElement("label");
        maxDiv.appendChild(maxValue);

        const maxSlider = document.createElement("input");
        maxSlider.type = "range";
        maxSlider.min = "0";
        maxSlider.max = "255";
        maxSlider.value = "255";
        maxSlider.step = "1";
        maxSlider.oninput = () => maxCallback(parseInt(maxSlider.value));
        maxDiv.appendChild(maxSlider);
        endpointSliderDiv.appendChild(maxDiv);        

        maxValue.textContent = "255";
        minValue.textContent = "0";

        endpointSliderDiv.update = function ({ endpoints }) {
            minSlider.value = endpoints[0];
            minValue.textContent = endpoints[0];

            maxSlider.value = endpoints[1];
            maxValue.textContent = endpoints[1];
        }

        return endpointSliderDiv;
    }

    log(msg) {
        const logger = document.getElementById("logger");
        const log = document.createElement("p");
        log.textContent = msg;
        logger.appendChild(log);
        logger.scrollTo(0, logger.scrollHeight);
    }
}