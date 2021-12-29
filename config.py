# Window size
WINDOW_WIDTH = 1000
WINDOW_HEIGHT = 1000
TARGET_FPS = 60

# Define com-port
COM_PORT = "/dev/ttyACM0"
COM_RATE = 19200

axisMapping = {
    0: 'a',
    1: 'b',
    2: 'c',
    3: 'd',
}

# Slow mode
slowmode = {
    'a': 2.0,
    'b': 2.0,
    'c': 2.0,
    'd': 2.0,
}

# Speed, Positive => Forward, negative => Reversed
speed = {
    'a': 1.0,
    'b': 1.0,
    'c': 1.0,
    'd': 1.0,
}

# Axis deadzone
deadzone = {
    'a': 0.1,
    'b': 0.1,
    'c': 0.1,
    'd': 0.1,
}

# Axis exponential, 1 = none, >1 => less sensitive around 0.
expo = {
    'a': 4,
    'b': 4,
    'c': 4,
    'd': 4,
    'm': 4,
    'n': 4,
}

# Maximum range of the servos
endpoint = {
    'a': (0, 255),
    'b': (0, 255),
    'c': (0, 255),
    'd': (0, 255),
}

# Controller status
controller = {
    'a': 0,
    'b': 0,
    'c': 0,
    'd': 0,
    'e': 0,
    'm': 0,
    'M': 0,
    'n': 128,
    'aButton': 0,
}

gripperSpeed = 5

# Robot status, also starting values
robot = {
    'a': 127,
    'b': 127,
    'c': 127,
    'd': 127,
}

delay = 0.5
moveToButton = [('d', 215), ('c', 77), delay]
moveToTower = [('c', 140), delay]
moveToBox = [('d', 160), ('c', 185), delay]

