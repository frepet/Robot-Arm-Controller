import asyncio
import random
import sys
from time import time

import serial
import websockets
import json

com_port = None
com_rate = None
socket_port = None
ser = None


try:
	com_port = sys.argv[1]
	com_rate = sys.argv[2]
	socket_port = sys.argv[3]
except IndexError as ex:
	print("USAGE: {sys.argv[0]} COM_PORT BAUD_RATE SOCKET_PORT", file=sys.stderr)
	exit(1)


async def main():
	with serial.Serial(com_port, com_rate, write_timeout=0, timeout=0) as ser:
		async def read_serial_to_socket(websocket):
			if ser.in_waiting > 0:
				msg = ""
				b = ser.read().decode("ascii")
				while b != "\n":
					msg += b
					b = ser.read().decode("ascii")
				await websocket.send(msg)

		async def socket_handler(websocket):
			last_update = time()
			async for message in websocket:
				if time() < last_update + 0.02:
					continue
				last_update = time()

				message = json.loads(message)
				pwms = message["servos"].values()
				if len(pwms) < 1:
					continue

				buff = bytearray(3+len(pwms))
				buff[0] = 2  # STX
				buff[1] = len(pwms)  # Number of servos
				buff[2: -1] = bytearray(pwms)  # PWMs
				buff[-1] = sum(buff[2:-1]) % 256  # Checksum
				ser.write(buff)

				await read_serial_to_socket(websocket)

		async with websockets.serve(socket_handler, "localhost", socket_port):
			await asyncio.Future()

try:
	asyncio.run(main())
except KeyboardInterrupt:
	exit(0)
