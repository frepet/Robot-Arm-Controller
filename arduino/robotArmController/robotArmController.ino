/*
 * Robot Arm Controller for Arduino
 * 
 * Reads n-amount of servo values from serial and
 * sets the servos accordingly.
 * 
 *
 * Signal:
 *    BYTE | VALUE | NOTE
 *    -----------------------
 *      0  |   2   | Start
 *      1  | 0-255 | Number of servos
 *  2:end-1| 0-255 | PWM-value
 *     end | 0-255 | Checksum = sum(PWM-values) % 256
 */

#include <Servo.h>

const int SERVO_START_PIN = 8;
const int SERVOS = 6;
const int BAUD_RATE = 19200;
const byte STX = 2;
const int BAD_CHECKSUM_LED_PIN = 2;

long last_bad_checksum = millis();
byte pwms[SERVOS] = {127};
Servo servo[SERVOS];

void setup() {
	pinMode(BAD_CHECKSUM_LED_PIN, OUTPUT);
	for (int i = 0; i < SERVOS; i++) {
		servo[i].attach(SERVO_START_PIN + i);
	}
	Serial.begin(BAUD_RATE);
}

byte nextByte() {
	byte b = Serial.read();
	while (b == -1) {
		b = Serial.read();
		delay(10);
	}
	return b;
}

void clearMessage() {
	memset(pwms, 0, SERVOS);
}

void waitForSTX() {
	byte temp = nextByte();
	while (temp != STX) {
		temp = nextByte();
		delay(10);
	}
}

bool readSerial(byte *pwms) {
	byte n = nextByte();

	byte temp[n] = {0};
	byte checksum = 0;
	for (int i = 0; i < n; i++) {
		temp[i] = nextByte();
		checksum += temp[i];
	}

	byte received_checksum = nextByte();
	if (received_checksum != checksum) {
		Serial.print("Bad checksum, received: ");
		Serial.print(received_checksum);
		Serial.print(", calculated: ");
		Serial.println(checksum);
		last_bad_checksum = millis();
		return false;
	}

	memcpy(pwms, temp, constrain(n, 0, SERVOS));
	return true;
}

void updateServos(byte *pwms) {
	for (int i = 0; i < SERVOS; i++) {
		servo[i].writeMicroseconds(map(pwms[i], 0, 255, 500, 2500));
	}
}

void loop() {
	clearMessage();
	waitForSTX();
	if (readSerial(pwms)) {
		updateServos(pwms);
	}

	digitalWrite(BAD_CHECKSUM_LED_PIN, last_bad_checksum + 100 <= millis() ? LOW : HIGH);
}
