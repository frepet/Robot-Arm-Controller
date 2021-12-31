import sys
import time
from abc import ABC
from typing import BinaryIO, AnyStr

from serial import Serial, SerialException
import os

os.environ['PYGAME_HIDE_SUPPORT_PROMPT'] = "hide"

import pygame
import pygame.gfxdraw

from text_print import TextPrint

# Load config file
from config import *


def clamp(x, lower_lim, upper_lim):
	""" Clamps the value between a min and a max value. """
	if x > upper_lim:
		x = upper_lim
	elif x < lower_lim:
		x = lower_lim
	return x


def remap(x: float, in_min: float, in_max: float, out_min: float, out_max: float) -> float:
	""" Linear remap of value x from range in to range out. """
	return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min


def draw_polygon(surface, points, color):
	pygame.gfxdraw.aapolygon(surface, points, color)
	pygame.gfxdraw.filled_polygon(surface, points, color)


def draw_circle(surface, center, radius, color):
	pygame.gfxdraw.circle(surface, *(int(x) for x in center), radius, color)
	pygame.gfxdraw.filled_circle(surface, *(int(x) for x in center), radius, color)


def draw_joystick(screen, joystick):
	""" Print information about connected joysticks. """
	text_print = TextPrint((10, 500))

	text_print.print(screen, f"{joystick.get_name()}:")
	text_print.indent()

	text_print.print(screen, "Axes:")
	text_print.indent()
	for j in range(joystick.get_numaxes()):
		text_print.print(screen, f"{j}: {joystick.get_axis(j):>6.3f}")
	text_print.unindent()

	text_print.print(screen, "Buttons:")
	text_print.indent()
	for j in range(joystick.get_numbuttons()):
		text_print.print(screen, f"{j:>2}: {joystick.get_button(j)}")
	text_print.unindent()

	text_print.print(screen, "Hats:")
	text_print.indent()
	for j in range(joystick.get_numhats()):
		text_print.print(screen, f"{j}: {joystick.get_hat(j)}")
	text_print.unindent()

	text_print.unindent()



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
	def draw_servo(screen: {}, pos: (int, int), pwm: int, name="Servo"):
		""" Draw a servo."""
		horn_color = (200, 200, 200)
		hole_color = (0xff, 0x45, 0)
		center_color = (255, 255, 255)

		# Calculate servo horn polygon
		length = 40
		width = 5
		points = [(width,  -length),
		          (width,   length),
		          (-width,  length),
		          (-width, -length),
				  (0, -length),
				  (0, length)]

		center = pygame.Vector2(pos[0] + 32, pos[1] + 32)
		points = [pygame.Vector2(p).rotate(remap(pwm, 0, 255, -90, 90)) + center for p in points]

		# Servo body
		pygame.draw.rect(screen, "black", pygame.Rect(pos, (180, 64)), border_radius=6)

		# Servo horn
		draw_polygon(screen, points[0:4], horn_color)
		draw_circle(screen, points[4], width, horn_color)
		draw_circle(screen, points[5], width, horn_color)

		# End and center indicators
		draw_circle(screen, points[4], 3, hole_color)
		draw_circle(screen, points[5], 3, hole_color)
		draw_circle(screen, center, 3, center_color)

		# Servo pwm value as text
		text_bitmap = pygame.font.Font(None, 30).render(f"{name}: {int(pwm)}", True, "white")
		screen.blit(text_bitmap, [pos[0] + 95, pos[1] + 20])

	def draw(self):
		""" All drawing for the GUI. """
		self.screen.fill("gray14")

		for i, (address, pwm) in enumerate(robot.items()):
			self.draw_servo(self.screen, (32 + 196*i, 32), name=address, pwm=pwm)

		if self.joystick:
			draw_joystick(self.screen, self.joystick)

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
