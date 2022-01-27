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
        
        this.servoCards.forEach((servoCard) => {
            servoCard.addGamepadController(gamepad);
        });
    }

    addServoCard(servo, gamepad) {
        this.servoCards.set(servo.address.toString(), this._createServoCard(servo, gamepad));
    }

    _createServoCard(servo, gamepad) {
        const servoDiv = document.createElement("div");
        servoDiv.className = "servo card";
        servoDiv.servoAddress = servo.address;

        const headerDiv = document.createElement("div");
        headerDiv.className = "card-header";
        const header = document.createElement("h1");
        header.textContent = servo.servoName;
        headerDiv.appendChild(header);

        const nameinputdiv = this._createTextInputRow("Name:",servo.servoName, (name) => { 
            servo.name = name;
            header.textContent = servo.servoName;
        });

        const pwmUpdate = (input, value, {pwm}) => {
            input.value = pwm.toString();
            value.textContent = Math.round(pwm).toString();
        }
        const pwmDiv = this._createSliderRow("PWM", 0, 255, servo.pwm, 1, (pwm) => servo.pwm = pwm, pwmUpdate);

        const minUpdate = (input, value, {endpoints}) => {
            input.value = endpoints[0];
            value.textContent = endpoints[0];
        }
        const minDiv = this._createSliderRow("Min", 0, 255, servo.min, 1, (min) => servo.min = min, minUpdate);

        const maxUpdate = (input, value, {endpoints}) => {
            input.value = endpoints[1];
            value.textContent = endpoints[1];
        }
        const maxDiv = this._createSliderRow("Max", 0, 255, servo.max, 1, (max) => servo.max = max, maxUpdate);

        servoDiv.appendChild(headerDiv);
        servoDiv.appendChild(nameinputdiv);
        servoDiv.appendChild(pwmDiv);
        servoDiv.appendChild(minDiv);
        servoDiv.appendChild(maxDiv);


        servoDiv.addGamepadController = (gamepad) => {
            servoDiv.appendChild(this._addGamepadControllingPart(gamepad,servo));
        };

        if (gamepad) {
            servoDiv.addGamepadController(gamepad);
        }    

        servoDiv.update = (servo) => {
            pwmDiv.update(servo);
            minDiv.update(servo);
            maxDiv.update(servo);
        };

        return document.getElementById("servos").appendChild(servoDiv);
    }

    _addGamepadControllingPart(gamepad, servo){
        const gamepadcontrollerDiv = document.createElement("div");

        const axisSpeedDiv = this._createInputRow("Axis speed", -5, 5, servo.axisSpeed, 0.1, (axisSpeed) => servo.axisSpeed = axisSpeed);
        const buttonSpeedDiv = this._createInputRow("Button speed", -5, 5, servo.buttonSpeed, 0.1, (buttonSpeed) => servo.buttonSpeed = buttonSpeed);

        gamepadcontrollerDiv.appendChild(axisSpeedDiv);
        gamepadcontrollerDiv.appendChild(this._createDropdownRow("Axis", gamepad.axes, "Axis", parseInt(servo.axis), (axis) => {
            servo.axis = axis
        }));

        gamepadcontrollerDiv.appendChild(buttonSpeedDiv);
        gamepadcontrollerDiv.appendChild(this._createDropdownRow("Button +", gamepad.buttons, "Button", parseInt(servo.buttonAdd), (buttonAdd) => servo.buttonAdd = buttonAdd));
        gamepadcontrollerDiv.appendChild(this._createDropdownRow("Button -", gamepad.buttons, "Button", parseInt(servo.buttonRemove), (buttonRemove) => servo.buttonRemove = buttonRemove));
        return gamepadcontrollerDiv;
    }

    _createSliderRow(name, min, max, value, step, callback, update) {
        const div = document.createElement("div");
        div.className = "sliderDiv row";
        const label = document.createElement("label");
        label.textContent = name + ": ";
        const val = document.createElement("label");
        const input = document.createElement("input");
        input.type = "range";
        input.min = min.toString();
        input.max = max.toString();
        input.value = val.toString();
        input.step = step.toString();
        input.oninput = () => callback(parseInt(input.value));
        val.textContent = input.value.toString();

        div.appendChild(label);
        div.appendChild(val);
        div.appendChild(input);
        div.update = (state) => update(input, val, state);
        return div;
    }

    _createTextInputRow(name, servoName, callback) {
        const div = document.createElement("div");
        div.className = "sliderDiv row";
        const label = document.createElement("label");
        label.textContent = name;
        const val = document.createElement("label");
        const input = document.createElement("input");
        input.type = "input";
        input.placeholder = servoName;
        input.size = 16;
        input.maxLength = 16;
        input.oninput = () => callback(input.value);
        
        val.textContent = input.value.toString();

        div.appendChild(label);
        div.appendChild(val);
        div.appendChild(input);
        return div;
    }

    _createInputRow(name, min, max, value, step, callback) {
        const div = document.createElement("div");
        div.className = "row";
        const label = document.createElement("label");
        label.textContent = name;
        const input = document.createElement("input");
        input.className = "dropdown";
        input.type = "number";
        input.min = min.toString();
        input.max = max.toString();
        input.value = value.toString();
        input.step = step.toString();
        input.addEventListener('input', (event) => callback(event.target.value));

        div.appendChild(label);
        div.appendChild(input);
        return div;
    }

    _createDropdownRow(name, inputs, typeName, value, callback) {
        const div = document.createElement("div");
        div.className = "row";
        const label = document.createElement("label");
        label.textContent = name;
        const input = document.createElement("select");

        let option;
        option = document.createElement("option");

        option.value = null;
        option.text = "Unbound";
        option.selected = true;
        input.appendChild(option);

        for (let i = 0; i < inputs.length; i++) {
            option = document.createElement("option");
            option.value = i.toString();
            option.text = typeName + ": " + i;
            if (value === i) {
                option.selected = true;
            }
            input.appendChild(option);
        }

        input.onchange = (ev) => {
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

    clearMacros() {
        const macros = document.getElementById("macros").childNodes;
        while (macros.length > 0) {
            macros.item(0).remove();
        }
    }

    addMacro(macro, gamepad) {
        const macroCard = document.createElement("div");
        macroCard.className = "card";

        const header = document.createElement("div");
        header.className = "row";
        macroCard.appendChild(header);

        const title = document.createElement("h1");
        title.textContent = macro.name;
        header.appendChild(title);

        const playButton = document.createElement("button");
        playButton.textContent = "Play";
        playButton.addEventListener("click", (_) => macro.run());
        header.appendChild(playButton);

        macroCard.appendChild(this._createDropdownRow("Button:", gamepad.buttons, "Button", macro.button, button => macro.button = button));

        const actions = document.createElement("div");
        actions.className = "actions";
        const actionsRef = macroCard.appendChild(actions);

        const addButton = document.createElement("button");
        addButton.textContent = "+";
        addButton.addEventListener("click", (_) => actionsRef.appendChild(this._addActionRow(macro)));
        macroCard.appendChild(addButton);

        macro.actions.forEach(action => {
            actionsRef.appendChild(this._addActionRow(macro, action))
        });

        document.getElementById("macros").appendChild(macroCard);
    }

    _createLabel(text) {
        const label = document.createElement("label");
        label.textContent = text;
        return label;
    }

    _addActionRow(macro, loadedAction = null) {
        let action;
        if (loadedAction === null) {
            action = new Action(0, 0, 0);
            macro.add(action);
        } else {
            action = loadedAction;
        }

        const row = document.createElement("div");
        row.className = "action-row";

        row.appendChild(this._createLabel("Address: "));
        const address = document.createElement("input");
        address.type = "number";
        address.placeholder = "Address";
        address.min = "0";
        address.value = action.address.toString();
        address.addEventListener('input', (event) => action.address = event.target.value)
        row.appendChild(address);

        row.appendChild(this._createLabel("Value: "));
        const pwm = document.createElement("input");
        pwm.type = "number";
        pwm.placeholder = "Value (0-255)";
        pwm.min = "0";
        pwm.max = "255";
        pwm.value = action.pwm.toString();
        pwm.addEventListener('input', (event) => action.pwm = event.target.value)
        row.appendChild(pwm);

        row.appendChild(this._createLabel("Delay (s): "));
        const delay = document.createElement("input");
        delay.type = "number";
        delay.placeholder = "Delay (s)";
        delay.min = "0";
        delay.step = "0.1";
        delay.value = action.delay.toString();
        delay.addEventListener('input', (event) => action.delay = event.target.value)
        row.appendChild(delay);

        return row;
    }
}
