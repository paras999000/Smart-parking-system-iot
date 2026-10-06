from machine import Pin, UART
import time

ir = Pin(15, Pin.IN)
buzzer = Pin(18, Pin.OUT)
red = Pin(17, Pin.OUT)
green = Pin(16, Pin.OUT)
reset_btn = Pin(14, Pin.IN, Pin.PULL_UP)

uart = UART(0, baudrate=9600)

counter = 0
max_slots = 10
last_state = 0

def update_led():
    global counter
    
    if counter >= max_slots:
        red.value(1)
        green.value(0)
        buzzer.value(1)
    else:
        red.value(0)
        green.value(1)
        buzzer.value(0)

update_led()

while True:

    # IR detection
    if ir.value() == 1 and last_state == 0:
        
        if counter < max_slots:
            counter += 1
        
        uart.write(str(counter) + "\n")
        print("Count:", counter)

        update_led()
        time.sleep(1)

    last_state = ir.value()

    # Reset button
    if reset_btn.value() == 0:
        
        counter = 0
        uart.write("0\n")

        red.value(0)
        green.value(1)
        buzzer.value(0)

        print("Reset Counter")

        time.sleep(1)

    time.sleep(0.1)