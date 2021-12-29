/*
 * Arduino code for Robot Arm Controller
 * 
 * Reads a 4 byte serial signal and sets servos.
 * Servos should be connected to port 10-13.
 *
 * Signal:
 *  BYTE | VALUE | NOTE
 *  -----------------------
 *    0  |   2   | Start
 *    1  |'a'-'z'| Address
 *    2  | 0-255 | Value
 *    3  |   3   | End
 */

#include <Servo.h>

const int MSG_SIZE = 2;
const int SERVO_START_PIN = 10;
const int SERVOS = 4;
const int BAUD_RATE = 115200;
const byte STX = 2;
const byte ETX = 3;

byte msg[MSG_SIZE];
Servo servo[SERVOS];

void setup() {
	for (int i = 0; i < SERVOS; i++) {
		servo[i].attach(SERVO_START_PIN + i);
	}
	Serial.begin(BAUD_RATE);
}

void clearMessage() {
	memset(msg, 0, MSG_SIZE);
}

void waitForSTX() {
	byte temp = Serial.read();
	while (temp != STX) {
		temp = Serial.read();
		delay(10);
	}
}

void readSerial(byte *msg) {
	byte temp[MSG_SIZE];
	for (int i = 0; i < MSG_SIZE; i++) {
		temp[i] = Serial.read();
	}
	if (Serial.read() == ETX) {
		memcpy(msg, temp, MSG_SIZE);
	}
}

void loop() {
	clearMessage();
	waitForSTX();
	readSerial(msg);

	byte servo_idx = msg[0] - 'a';
	if (servo_idx < 0 || servo_idx >= SERVOS)
		return;

	byte pwm = msg[1];

	servo[SERVO_START_PIN + servo_idx].writeMicroseconds(map(pwm, 0, 255, 500, 2500));
}