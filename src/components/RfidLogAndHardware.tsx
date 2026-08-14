import React, { useState } from 'react';
import { RfidScanLog, ReaderStatus, Settings } from '../types';
import { Radio, Cpu, Code, Copy, Check, Sliders, Activity, Terminal } from 'lucide-react';

interface RfidLogAndHardwareProps {
  logs: RfidScanLog[];
  readerStatus: ReaderStatus;
  settings: Settings;
  onUpdateSettings: (debounce_seconds: number) => Promise<void>;
}

export const RfidLogAndHardware: React.FC<RfidLogAndHardwareProps> = ({
  logs,
  readerStatus,
  settings,
  onUpdateSettings,
}) => {
  const [debounceInput, setDebounceInput] = useState(String(settings.debounce_seconds || 3));
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const esp32CodeSnippet = `// ESP32 Microcontroller + MFRC522 RFID Reader Integration Code
// Supermarket Project: Pasi Supermarket – RFID Smart Shopping Cart

#include <WiFi.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>

#define SS_PIN  5
#define RST_PIN 22

MFRC522 rfid(SS_PIN, RST_PIN);

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "http://YOUR_SERVER_IP:3001/api/rfid/scan";

void setup() {
  Serial.begin(115200);
  SPI.begin();
  rfid.PCD_Init();
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWiFi Connected! RFID Smart Cart Ready.");
}

void loop() {
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) return;

  String rfidTag = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    rfidTag += String(rfid.uid.uidByte[i] < 0x10 ? "0" : "");
    rfidTag += String(rfid.uid.uidByte[i], HEX);
  }
  rfidTag.toUpperCase();

  Serial.println("Scanned Tag: " + rfidTag);
  sendRfidToServer(rfidTag);

  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
  delay(1000);
}

void sendRfidToServer(String tagId) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    String jsonPayload = "{\\"rfid_tag_id\\": \\"" + tagId + "\\", \\"cart_id\\": \\"CART-7892\\"}";
    int httpResponseCode = http.POST(jsonPayload);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Server Response: " + response);
    } else {
      Serial.println("HTTP POST Failed: " + String(httpResponseCode));
    }
    http.end();
  }
}`;

  const curlSnippet = `curl -X POST http://localhost:3001/api/rfid/scan \\
  -H "Content-Type: application/json" \\
  -d '{"rfid_tag_id": "RFID001"}'`;

  const handleCopyCode = (text: string, setCopiedFn: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopiedFn(true);
    setTimeout(() => setCopiedFn(false), 3000);
  };

  const handleSaveDebounce = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateSettings(Number(debounceInput));
  };

  return (
    <div className="space-y-6">
      
      {/* Top Status & Debounce Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Connection Status Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Reader Status</h3>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              readerStatus.connected
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}>
              {readerStatus.connected ? '🟢 ONLINE' : '🔴 OFFLINE'}
            </span>
          </div>
          <div className="text-xs space-y-1 text-slate-300">
            <div>Last Tag: <span className="font-mono text-emerald-400 font-bold">{readerStatus.last_scanned_id || 'None'}</span></div>
            <div>Detected: <span className="text-white font-medium">{readerStatus.last_detected_product || 'N/A'}</span></div>
            <div className="text-slate-400">Time: {readerStatus.last_scan_time || 'N/A'}</div>
          </div>
        </div>

        {/* Debounce / Cooldown Settings */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 md:col-span-2">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Smart RFID Anti-Duplicate Cooldown</h3>
          </div>
          <form onSubmit={handleSaveDebounce} className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0"
                max="15"
                value={debounceInput}
                onChange={(e) => setDebounceInput(e.target.value)}
                className="w-20 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-bold text-white text-center focus:outline-none focus:border-emerald-500"
              />
              <span className="text-xs text-slate-300">seconds buffer window</span>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              Update Cooldown
            </button>
          </form>
          <p className="text-xs text-slate-400">
            Prevents rapid accidental duplicate scans of the exact same tag within this buffer period.
          </p>
        </div>
      </div>

      {/* RFID Live Activity Logs */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 shadow-xl space-y-4">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
            <h3 className="text-base font-bold text-white">Live RFID Scan Activity Log ({logs.length})</h3>
          </div>
        </div>

        <div className="overflow-x-auto max-h-80">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800 sticky top-0">
              <tr>
                <th className="px-6 py-3">Scan Time</th>
                <th className="px-4 py-3">Tag ID</th>
                <th className="px-4 py-3">Detected Product</th>
                <th className="px-4 py-3">Action Taken</th>
                <th className="px-6 py-3">Status Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No RFID scan events logged yet. Scan tags using simulator or ESP32 API to record events.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.scan_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-3 font-mono text-slate-400">{log.scan_time}</td>
                    <td className="px-4 py-3 font-mono text-emerald-400 font-bold">{log.rfid_tag_id}</td>
                    <td className="px-4 py-3 font-semibold text-white">{log.product_name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        log.action.includes('Qty Increased') || log.action.includes('Item Added')
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : log.action.includes('IGNORED')
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ESP32 & Microcontroller Integration Guide */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 shadow-2xl">
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">ESP32 / Arduino Hardware Integration</h3>
            <p className="text-xs text-slate-400">
              Connect physical MFRC522 RFID readers via Wi-Fi to this web application
            </p>
          </div>
        </div>

        {/* Integration Workflow Diagram */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
          <div className="font-bold text-slate-300 uppercase tracking-wider">Hardware System Workflow:</div>
          <div className="flex flex-wrap items-center gap-2 text-emerald-400 font-semibold">
            <span>🏷️ RFID Tag</span>
            <span>➔</span>
            <span>📻 RC522 Reader</span>
            <span>➔</span>
            <span>⚡ ESP32 Microcontroller</span>
            <span>➔</span>
            <span>🌐 HTTP POST /api/rfid/scan</span>
            <span>➔</span>
            <span>🛒 Live Cart UI</span>
          </div>
        </div>

        {/* cURL Command Example */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center space-x-1">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>cURL Test Terminal Command</span>
            </span>
            <button
              onClick={() => handleCopyCode(curlSnippet, setCopiedCurl)}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
            >
              {copiedCurl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCurl ? 'Copied!' : 'Copy cURL'}</span>
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto">
            {curlSnippet}
          </pre>
        </div>

        {/* C++ Code Snippet */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center space-x-1">
              <Code className="w-4 h-4 text-indigo-400" />
              <span>ESP32 Arduino C++ Firmware Code</span>
            </span>
            <button
              onClick={() => handleCopyCode(esp32CodeSnippet, setCopiedCode)}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied Code!' : 'Copy C++ Code'}</span>
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-96">
            {esp32CodeSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
};
