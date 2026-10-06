"""
Smart Parking System - MicroPython Pico Firmware
Author: Group 7 (CS23070, CS23105, CS23026)
Hardware: Raspberry Pi Pico / Pico W
Course: IoT and Network Protocols (N-MDMIT601T)
"""

from machine import Pin, UART
import time

# --- GPIO Pin Configuration ---
IR_PIN = 15          # IR Sensor Digital Output (falling edge indicates obstacle / car)
GREEN_LED_PIN = 16   # Green LED (Indicates space available)
RED_LED_PIN = 17     # Red LED (Indicates parking full)
BUZZER_PIN = 18      # Active Buzzer (Alert on full capacity)
RESET_BTN_PIN = 14   # Reset Button (PULL_UP, active LOW)

# Initialize Hardware Pins
ir = Pin(IR_PIN, Pin.IN)
buzzer = Pin(BUZZER_PIN, Pin.OUT)
red = Pin(RED_LED_PIN, Pin.OUT)
green = Pin(GREEN_LED_PIN, Pin.OUT)
reset_btn = Pin(RESET_BTN_PIN, Pin.IN, Pin.PULL_UP)

# UART Initialization for Inter-Board Communication with ESP8266
# Pico UART0: TX=Pin 0 (GP0), RX=Pin 1 (GP1), Baud Rate: 9600
uart = UART(0, baudrate=9600, tx=Pin(0), rx=Pin(1))

# Parking Configuration
counter = 0
max_slots = 10
last_state = 1

def update_indicators():
    """Updates the status LEDs and Buzzer according to occupancy count."""
    global counter, max_slots
    if counter >= max_slots:
        red.value(1)       # Turn ON Red LED
        green.value(0)     # Turn OFF Green LED
        buzzer.value(1)    # Turn ON Buzzer alert
        print(f"Status: FULL ({counter}/{max_slots})")
    else:
        red.value(0)       # Turn OFF Red LED
        green.value(1)     # Turn ON Green LED
        buzzer.value(0)    # Turn OFF Buzzer
        print(f"Status: AVAILABLE ({counter}/{max_slots})")

# Initial indicator state
update_indicators()
print("Smart Parking Pico Controller initialized. Listening for vehicles...")

while True:
    current_state = ir.value()

    # IR Vehicle Detection (Falling Edge: 1 -> 0 transition when beam breaks)
    if last_state == 1 and current_state == 0:
        if counter < max_slots:
            counter += 1
            print(f"[EVENT] Car Entered: Count = {counter}")
        else:
            print("[EVENT] Parking Full - Entry blocked!")

        # Transmit updated count over UART to ESP8266 Cloud Gateway
        uart.write(f"{counter}\n")
        update_indicators()
        time.sleep(1)  # Debounce delay

    last_state = current_state

    # Manual Hardware Reset Button
    if reset_btn.value() == 0:
        counter = 0
        uart.write("0\n")
        update_indicators()
        print("[EVENT] Manual System Reset Triggered")
        time.sleep(1)

    time.sleep(0.05)
