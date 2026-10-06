/*
 * Smart Parking System - ESP8266 Cloud Gateway Sketch
 * Author: Group 7 (CS23070, CS23105, CS23026)
 * Hardware: ESP8266 NodeMCU / WeMos D1 Mini
 * Course: IoT and Network Protocols (N-MDMIT601T)
 *
 * Description:
 * Receives vehicle count from Raspberry Pi Pico over UART Serial (9600 baud),
 * connects to Wi-Fi network, and updates real-time parking data to Supabase / REST backend.
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>

// Wi-Fi Configuration
const char* ssid     = "YOUR_WIFI_SSID";       // e.g. "realme"
const char* password = "YOUR_WIFI_PASSWORD";   // e.g. "user@12345"

// Supabase REST Endpoint & Authentication API Key
const char* supabaseUrl = "https://czggojwcsasptljblzfe.supabase.co/rest/v1/parking?id=eq.1";
const char* apiKey      = "sb_publishable_M8_LLmMGaeCzsXOzUFar-w_aDPgMrXo";

// Parking Parameters
int count = 0;
const int capacity = 10;
int lastSentCount = -1;

void setup() {
  // Serial baud rate must match Pico UART (9600 baud)
  Serial.begin(9600);
  delay(100);

  Serial.println("\n[ESP8266] Initializing Smart Parking Gateway...");

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.print("[WiFi] Connecting to network");

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] Connected successfully!");
    Serial.print("[WiFi] IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[WiFi] Connection failed. Running in offline fallback mode.");
  }
}

void loop() {
  // Read incoming count data from Pico via UART Serial
  if (Serial.available()) {
    String data = Serial.readStringUntil('\n');
    data.trim();
    if (data.length() > 0) {
      count = data.toInt();
      Serial.println("[UART] Received count from Pico: " + String(count));
      sendToCloud(count);
    }
  }

  delay(200);
}

void sendToCloud(int currentCount) {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClientSecure client;
    client.setInsecure(); // Disable SSL fingerprint verification for IoT test board

    HTTPClient http;
    if (http.begin(client, supabaseUrl)) {
      http.addHeader("Content-Type", "application/json");
      http.addHeader("apikey", apiKey);
      http.addHeader("Authorization", String("Bearer ") + apiKey);
      http.addHeader("Prefer", "return=minimal");

      String status = (currentCount >= capacity) ? "full" : "available";
      String json = "{\"count\":" + String(currentCount) + ",\"status\":\"" + status + "\"}";

      int httpResponseCode = http.PATCH(json);
      Serial.print("[Cloud] Supabase PATCH Response code: ");
      Serial.println(httpResponseCode);

      http.end();
      lastSentCount = currentCount;
    } else {
      Serial.println("[Cloud] Unable to establish connection to Supabase endpoint.");
    }
  } else {
    Serial.println("[WiFi] Cannot sync to cloud: WiFi not connected.");
  }
}
