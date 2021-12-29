import sys
import time
from abc import ABC
from typing import BinaryIO, AnyStr
from serial import Serial, SerialException
import os

os.environ['PYGAME_HIDE_SUPPORT_PROMPT'] = "hide"

import pygame

from text_print import TextPrint

# Load config file
from config import *


def draw_joystick(text_print, screen, joystick):
	""" Print information about connected joysticks. """
	joystick_count = pygame.joystick.get_count()
	text_print.print(screen, "Number of joysticks: {}".format(joystick_count))

	text_print.print(screen, "Joystick {}".format(1))
	text_print.indent()

	name = joystick.get_name()
	text_print.print(screen, "Joystick name: {}".format(name))

	axes = joystick.get_numaxes()
	text_print.print(screen, "Number of axes: {}".format(axes))
	text_print.indent()
	for j in range(axes):
		axis = joystick.get_axis(j)
		text_print.print(screen, "Axis {} value: {:>6.3f}".format(j, axis))
	text_print.unindent()

	buttons = joystick.get_numbuttons()
	text_print.print(screen, "Number of buttons: {}".format(buttons))
	text_print.indent()
	for j in range(buttons):
		button = joystick.get_button(j)
		text_print.print(screen, "Button {:>2} value: {}".format(j, button))
	text_print.unindent()

	hats = joystick.get_numhats()
	text_print.print(screen, "Number of hats: {}".format(hats))
	text_print.indent()
	for j in range(hats):
		hat = joystick.get_hat(j)
		text_print.print(screen, "Hat {} value: {}".format(j, str(hat)))
	text_print.unindent()

	text_print.unindent()


def clamp(x, lower_lim, upper_lim):
	""" Clamps the value between a min and a max value. """
	if x > upper_lim:
		x = upper_lim
	elif x < lower_lim:
		x = lower_lim
	return x


class RobotController:
	def __init__(self, serial: Serial = None):
		pygame.init()
		pygame.joystick.init()
		self.screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
		pygame.display.set_caption("Robot Controller")
		self.clock = pygame.time.Clock()

		if pygame.joystick.get_count() > 0:
			self.joystick = pygame.joystick.Joystick(0)
		else:
			self.joystick = None

		self.textPrint = TextPrint()
		self.serial = serial

	def set_servo(self, address, value):
		""" Sets a servo to a specified value."""
		robot[address] = clamp(value, *endpoint[address])
		if self.serial:
			ser.write(b"%c%c%c%c" % (2, ord(address), int(robot[address]), 3))

	def play_macro(self, moves):
		"""
		Play a macro consisting of tuples of moves.
		Each move should be (address, value) or a float for delay.
		"""
		for move in moves:
			if type(move) == tuple:
				self.set_servo(move[0], move[1])
			else:
				time.sleep(move)

	@staticmethod
	def draw_pwms(text_print: TextPrint, screen: {}, pwms: [(str, int)]):
		""" Draw various debug information."""
		text_print.print(screen, "PWM's:")
		text_print.indent()
		for address, val in pwms:
			text_print.print(screen, f"{address}: {val}")
		text_print.unindent()

	def draw(self):
		""" All drawing for the GUI. """
		self.screen.fill("gray14")
		self.textPrint.reset()

		if self.joystick:
			draw_joystick(self.textPrint, self.screen, self.joystick)

		self.draw_pwms(self.textPrint, self.screen, robot.items())
		pygame.display.flip()
		self.clock.tick(TARGET_FPS)

	def update_robot(self):
		""" Update and send servo locations to the robot. """
		for key in robot:
			robot[key] += controller[key] / (slowmode[key] if controller['aButton'] else 1)
			self.set_servo(key, robot[key])

	def run(self):
		""" Main Program Loop """
		done = False
		while not done:
			for event in pygame.event.get():
				if event.type == pygame.QUIT:
					done = True
					continue

				elif event.type == pygame.JOYBUTTONDOWN:
					if event.button == 4:
						controller['d'] = gripperSpeed
					elif event.button == 5:
						controller['d'] = -gripperSpeed

				elif event.type == pygame.JOYBUTTONUP:
					if event.button == 8:
						done = True
					elif event.button == 0:
						controller['aButton'] = not controller['aButton']
					elif event.button == 7:
						print("Controller:", controller)
						print("Robot:", robot)
					elif event.button == 4 or event.button == 5:
						controller['d'] = 0

				elif event.type == pygame.JOYHATMOTION:
					hat = self.joystick.get_hat(0)
					if hat[0] == -1:
						self.play_macro(moveToButton)
					elif hat[0] == 1:
						self.play_macro(moveToBox)
					elif hat[1] == -1:
						pass
					elif hat[1] == 1:
						self.play_macro(moveToTower)

				elif event.type == pygame.JOYAXISMOTION:
					if event.axis in axisMapping:
						key = axisMapping[event.axis]
						if abs(event.value) >= deadzone[key]:
							controller[key] = abs(event.value ** expo[key]) * speed[key]
							if event.value < 0:
								controller[key] = -controller[key]
						else:
							controller[key] = 0

				elif event.type == pygame.KEYDOWN:
					if event.key == pygame.K_LEFT:
						controller['c'] = -(1 ** expo['c'] * speed['c'])
					if event.key == pygame.K_RIGHT:
						controller['c'] = 1 ** expo['c'] * speed['c']
					if event.key == pygame.K_w:
						controller['a'] = -(1 ** expo['a'] * speed['a'])
					if event.key == pygame.K_s:
						controller['a'] = 1 ** expo['a'] * speed['a']
					if event.key == pygame.K_UP:
						controller['b'] = -(1 ** expo['b'] * speed['b'])
					if event.key == pygame.K_DOWN:
						controller['b'] = 1 ** expo['b'] * speed['b']
					if event.key == pygame.K_a:
						controller['d'] = -(1 ** expo['d'] * speed['d'])
					if event.key == pygame.K_d:
						controller['d'] = 1 ** expo['d'] * speed['d']

				elif event.type == pygame.KEYUP:
					if event.key in [pygame.K_LEFT, pygame.K_RIGHT]:
						controller['c'] = 0
					if event.key in [pygame.K_w, pygame.K_s]:
						controller['a'] = 0
					if event.key in [pygame.K_UP, pygame.K_DOWN]:
						controller['b'] = 0
					if event.key in [pygame.K_a, pygame.K_d]:
						controller['d'] = 0

			self.update_robot()
			self.draw()


class SerialPrinter(BinaryIO, ABC):
	def write(self, s: AnyStr) -> int:
		if chr(s[1]) == 'a':
			print(chr(27) + "[2J")
		print(chr(s[1]), s[2])
		return len(s)


class NoSerial(BinaryIO, ABC):
	def write(self, s: AnyStr) -> int:
		return len(s)


if __name__ == "__main__":
	ser = None
	if "--stdout" in sys.argv:
		print("Redirecting serial to stdout.", file=sys.stderr)
		ser = SerialPrinter()

	if "--noSerial" in sys.argv:
		print("Running without serial output!", file=sys.stderr)
		ser = NoSerial()

	if not ser:
		try:
			ser = Serial(sys.argv[1], COM_RATE, write_timeout=0, timeout=0)
		except IndexError as ex:
			print("Missing COM PORT as first argument", file=sys.stderr)
			exit(1)
		except SerialException as ex:
			print(f"Could not open serial port: {COM_PORT}", file=sys.stderr)
			exit(1)

	robot_controller = RobotController(ser)
	robot_controller.run()
	pygame.quit()

	if ser:
		ser.close()
