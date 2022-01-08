# Robot Arm Controller
The Robot Arm Controller consists of two parts. The user interface is written as a webpage frontend and
a small websocket to serial backend.

## Usage
Running the Robot Arm Controller is usually done by starting the backend and then connecting to the backend from
a browser using the frontend.

### Backend
Start the backend by running the Python 3 script called `__main__.py`. The script has some dependencies on other
modules, and they can be installed using the supplied `requirements.txt` file. It is recommended that the user
creates a virtual environment before installing the dependencies.

#### Installing dependencies:  
>pip install -r requirements.txt

#### Running the backend:  
>python3 . COM_PORT BAUD_RATE SOCKET_PORT

### Frontend
Open `index.htm` in Firefox (could work in other browsers).
Press `Connect` in the GUI.


## Hardware
An Arduino, should be connected to the computer using the USB cable.
SERVOS amount of servos should be connected starting at pin SERVO_START_PIN.

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
    - Windows: `python.exe . COM1 8765`. (Substitute COM1 with correct COM port)
    - Linux: `python . /dev/ttyACM0 8765`. (Substitute ttyACM0 with correct COM port)
