# Robot Arm Controller
USAGE: python . COM_PORT [OPTIONS]

## Options
`--stdout` - Prints Serial to stdout.  
`--noserial` - Removes Serial output.  

## Hardware
An Arduino, should be connected to the computer using the USB cable.
SERVOS amount of servos should be connected starting at pin SERVO_START_PIN.

## Configuration
The file `config.py` specifies all the values needed to set up the program for your specific robot arm.


## Example Setup
1. Upload Arduino software to Romeo board:
	1. Connect Romeo to computer using the USB cable.
	1. Open Arduino sketch `arduino/robotArmController.ino` using Arduino IDE.
	1. Make sure the correct COM port is selected under Tools-\>Port. 
	1. Make sure the correct Board is selected under Tools-\>Board-\>Arduino Uno.
	1. Upload sketch to Romeo using Sketch-\>Upload.
1. Create a virtual environment for Python3:
    - Windows: `python.exe -m venv venv`.
    - Linux: `python -m venv venv`.
1. Activate the virtual environment:
	- Windows: `venv/Scripts/activate.bat`.
	- Linux: `. venv/bin/activate`.
1. Install required Python modules using `pip install -r requirements.txt`.
1. Start Python program with the COM port where the Arduino is connected:
    - Windows: `python.exe . COM1`. (Substitute COM1 with correct COM port)
    - Linux: `python . /dev/ttyACM0`. (Substitute ttyACM0 with correct COM port)
