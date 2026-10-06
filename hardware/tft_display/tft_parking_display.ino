/*
 * Smart Parking System - Animated TFT Status Display
 * Author: Group 7 (CS23070, CS23105, CS23026)
 * Hardware: ESP32 / Arduino + TFT Display (ST7789 / ILI9341 via TFT_eSPI)
 */

#include <TFT_eSPI.h>

TFT_eSPI tft = TFT_eSPI();

void drawFace() {
  // Background
  tft.fillScreen(TFT_BLACK);

  // Left Eye
  tft.fillCircle(38, 55, 22, TFT_WHITE);
  tft.fillCircle(38, 55, 18, TFT_BLUE);
  tft.fillCircle(38, 55, 10, TFT_NAVY);

  tft.fillCircle(31, 47, 5, TFT_WHITE);
  tft.fillCircle(42, 61, 2, TFT_WHITE);

  // Right Eye
  tft.fillCircle(90, 55, 22, TFT_WHITE);
  tft.fillCircle(90, 55, 18, TFT_BLUE);
  tft.fillCircle(90, 55, 10, TFT_NAVY);

  tft.fillCircle(83, 47, 5, TFT_WHITE);
  tft.fillCircle(94, 61, 2, TFT_WHITE);

  // Pink Cheeks
  tft.fillCircle(20, 90, 8, TFT_MAGENTA);
  tft.fillCircle(108, 90, 8, TFT_MAGENTA);

  // Mouth
  tft.fillRoundRect(49, 98, 30, 14, 7, TFT_RED);
  tft.fillCircle(64, 110, 8, TFT_PINK);

  // Eyebrows
  tft.drawArc(38, 30, 18, 16, 200, 340, TFT_CYAN, TFT_BLACK, true);
  tft.drawArc(90, 30, 18, 16, 200, 340, TFT_CYAN, TFT_BLACK, true);

  // Sparkles
  tft.fillCircle(18, 18, 2, TFT_YELLOW);
  tft.fillCircle(110, 18, 2, TFT_YELLOW);

  tft.drawFastVLine(18, 13, 10, TFT_YELLOW);
  tft.drawFastHLine(13, 18, 10, TFT_YELLOW);

  tft.drawFastVLine(110, 13, 10, TFT_YELLOW);
  tft.drawFastHLine(105, 18, 10, TFT_YELLOW);

  // Heart Indicator
  tft.fillCircle(100, 15, 4, TFT_RED);
  tft.fillCircle(106, 15, 4, TFT_RED);
  tft.fillTriangle(96, 18, 110, 18, 103, 28, TFT_RED);
}

void blink() {
  // Close Eyes
  tft.fillCircle(38, 55, 23, TFT_BLACK);
  tft.fillCircle(90, 55, 23, TFT_BLACK);

  tft.drawFastHLine(20, 55, 36, TFT_CYAN);
  tft.drawFastHLine(72, 55, 36, TFT_CYAN);

  delay(170);
  drawFace();
}

void setup() {
  tft.init();
  tft.setRotation(0);
  drawFace();
}

void loop() {
  delay(3000);
  blink();
}
