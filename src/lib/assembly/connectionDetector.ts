import type { AssemblyComponent, ConnectionDef, ComponentPinout, PadRole } from '../../types';
import { getFootprint } from '../../data/footprints';

// =====================
// CONFIGURATION
// =====================

const VCC_VOLTAGE = 5;
const GND_VOLTAGE = 0;

// =====================
// PINOUT DATABASE
// =====================

/**
 * Known component pinouts for auto-detection.
 * Pin indices are 0-based to match footprint pad arrays.
 */
export const PINOUT_DATABASE: ComponentPinout[] = [
  // Basic components
  {
    type: 'resistor_th',
    pins: [
      { index: 0, role: 'signal', name: 'A' },
      { index: 1, role: 'signal', name: 'B' },
    ],
  },
  {
    type: 'capacitor_th',
    pins: [
      { index: 0, role: 'signal', name: '+', voltage: VCC_VOLTAGE },
      { index: 1, role: 'gnd', name: '-', voltage: GND_VOLTAGE },
    ],
  },
  {
    type: 'led_th',
    pins: [
      { index: 0, role: 'input', name: 'Cathode' },
      { index: 1, role: 'output', name: 'Anode' },
    ],
  },

  // Switches and buttons
  {
    type: 'switch_spst',
    pins: [
      { index: 0, role: 'signal', name: 'A' },
      { index: 1, role: 'signal', name: 'B' },
    ],
  },
  {
    type: 'switch_spdt',
    pins: [
      { index: 0, role: 'signal', name: 'NO' },
      { index: 1, role: 'signal', name: 'COM' },
      { index: 2, role: 'signal', name: 'NC' },
    ],
  },
  {
    type: 'button_tactile',
    pins: [
      { index: 0, role: 'signal', name: 'A1' },
      { index: 1, role: 'signal', name: 'A2' },
      { index: 2, role: 'signal', name: 'B1' },
      { index: 3, role: 'signal', name: 'B2' },
    ],
  },

  // Potentiometer
  {
    type: 'pot_10k',
    pins: [
      { index: 0, role: 'vcc', name: 'CW', voltage: VCC_VOLTAGE },
      { index: 1, role: 'output', name: 'Wiper' },
      { index: 2, role: 'gnd', name: 'CCW', voltage: GND_VOLTAGE },
    ],
  },
  {
    type: 'pot_100k',
    pins: [
      { index: 0, role: 'vcc', name: 'CW', voltage: VCC_VOLTAGE },
      { index: 1, role: 'output', name: 'Wiper' },
      { index: 2, role: 'gnd', name: 'CCW', voltage: GND_VOLTAGE },
    ],
  },

  // Rotary encoder
  {
    type: 'encoder_rotary',
    pins: [
      { index: 0, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 1, role: 'output', name: 'A' },
      { index: 2, role: 'output', name: 'B' },
      { index: 3, role: 'output', name: 'SW' },
      { index: 4, role: 'gnd', name: 'GND2', voltage: GND_VOLTAGE },
    ],
  },

  // DIP ICs - Generic 8-pin (555, opamps)
  {
    type: 'ic_dip8',
    pins: [
      { index: 0, role: 'signal', name: 'Pin1' },
      { index: 1, role: 'signal', name: 'Pin2' },
      { index: 2, role: 'signal', name: 'Pin3' },
      { index: 3, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 4, role: 'signal', name: 'Pin5' },
      { index: 5, role: 'signal', name: 'Pin6' },
      { index: 6, role: 'signal', name: 'Pin7' },
      { index: 7, role: 'vcc', name: 'VCC', voltage: VCC_VOLTAGE },
    ],
  },

  // ATtiny85
  {
    type: 'mcu_attiny85',
    pins: [
      { index: 0, role: 'input', name: 'RESET/PB5' },
      { index: 1, role: 'signal', name: 'PB3' },
      { index: 2, role: 'signal', name: 'PB4' },
      { index: 3, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 4, role: 'signal', name: 'PB0' },
      { index: 5, role: 'signal', name: 'PB1' },
      { index: 6, role: 'signal', name: 'PB2' },
      { index: 7, role: 'vcc', name: 'VCC', voltage: VCC_VOLTAGE },
    ],
  },

  // Arduino Nano
  {
    type: 'mcu_arduino_nano',
    pins: [
      { index: 0, role: 'signal', name: 'D1/TX' },
      { index: 1, role: 'signal', name: 'D0/RX' },
      { index: 2, role: 'input', name: 'RESET' },
      { index: 3, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 4, role: 'signal', name: 'D2' },
      { index: 5, role: 'signal', name: 'D3' },
      { index: 6, role: 'signal', name: 'D4' },
      { index: 7, role: 'signal', name: 'D5' },
      { index: 8, role: 'signal', name: 'D6' },
      { index: 9, role: 'signal', name: 'D7' },
      { index: 10, role: 'signal', name: 'D8' },
      { index: 11, role: 'signal', name: 'D9' },
      { index: 12, role: 'signal', name: 'D10' },
      { index: 13, role: 'signal', name: 'D11' },
      { index: 14, role: 'signal', name: 'D12' },
      { index: 15, role: 'signal', name: 'D13' },
      { index: 16, role: 'vcc', name: '3V3', voltage: 3.3 },
      { index: 17, role: 'signal', name: 'AREF' },
      { index: 18, role: 'signal', name: 'A0' },
      { index: 19, role: 'signal', name: 'A1' },
      { index: 20, role: 'signal', name: 'A2' },
      { index: 21, role: 'signal', name: 'A3' },
      { index: 22, role: 'signal', name: 'A4' },
      { index: 23, role: 'signal', name: 'A5' },
      { index: 24, role: 'signal', name: 'A6' },
      { index: 25, role: 'signal', name: 'A7' },
      { index: 26, role: 'vcc', name: '5V', voltage: VCC_VOLTAGE },
      { index: 27, role: 'input', name: 'RESET2' },
      { index: 28, role: 'gnd', name: 'GND2', voltage: GND_VOLTAGE },
      { index: 29, role: 'vcc', name: 'VIN' },
    ],
  },

  // ESP32 DevKit
  {
    type: 'mcu_esp32_devkit',
    pins: [
      { index: 0, role: 'vcc', name: '3V3', voltage: 3.3 },
      { index: 1, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 2, role: 'signal', name: 'GPIO15' },
      { index: 3, role: 'signal', name: 'GPIO2' },
      { index: 4, role: 'signal', name: 'GPIO4' },
      { index: 5, role: 'signal', name: 'GPIO16' },
      { index: 6, role: 'signal', name: 'GPIO17' },
      { index: 7, role: 'signal', name: 'GPIO5' },
      { index: 8, role: 'signal', name: 'GPIO18' },
      { index: 9, role: 'signal', name: 'GPIO19' },
      { index: 10, role: 'signal', name: 'GPIO21' },
      { index: 11, role: 'signal', name: 'GPIO3/RX' },
      { index: 12, role: 'signal', name: 'GPIO1/TX' },
      { index: 13, role: 'signal', name: 'GPIO22' },
      { index: 14, role: 'signal', name: 'GPIO23' },
      { index: 15, role: 'vcc', name: 'VIN' },
      { index: 16, role: 'gnd', name: 'GND2', voltage: GND_VOLTAGE },
      { index: 17, role: 'signal', name: 'GPIO13' },
      { index: 18, role: 'signal', name: 'GPIO12' },
      { index: 19, role: 'signal', name: 'GPIO14' },
      { index: 20, role: 'signal', name: 'GPIO27' },
      { index: 21, role: 'signal', name: 'GPIO26' },
      { index: 22, role: 'signal', name: 'GPIO25' },
      { index: 23, role: 'signal', name: 'GPIO33' },
      { index: 24, role: 'signal', name: 'GPIO32' },
      { index: 25, role: 'signal', name: 'GPIO35' },
      { index: 26, role: 'signal', name: 'GPIO34' },
      { index: 27, role: 'signal', name: 'GPIO39' },
      { index: 28, role: 'signal', name: 'GPIO36' },
      { index: 29, role: 'input', name: 'EN' },
    ],
  },

  // Raspberry Pi Pico
  {
    type: 'mcu_raspberry_pico',
    pins: [
      { index: 0, role: 'signal', name: 'GP0' },
      { index: 1, role: 'signal', name: 'GP1' },
      { index: 2, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 3, role: 'signal', name: 'GP2' },
      { index: 4, role: 'signal', name: 'GP3' },
      { index: 5, role: 'signal', name: 'GP4' },
      { index: 6, role: 'signal', name: 'GP5' },
      { index: 7, role: 'gnd', name: 'GND2', voltage: GND_VOLTAGE },
      { index: 8, role: 'signal', name: 'GP6' },
      { index: 9, role: 'signal', name: 'GP7' },
      { index: 10, role: 'signal', name: 'GP8' },
      { index: 11, role: 'signal', name: 'GP9' },
      { index: 12, role: 'gnd', name: 'GND3', voltage: GND_VOLTAGE },
      { index: 13, role: 'signal', name: 'GP10' },
      { index: 14, role: 'signal', name: 'GP11' },
      { index: 15, role: 'signal', name: 'GP12' },
      { index: 16, role: 'signal', name: 'GP13' },
      { index: 17, role: 'gnd', name: 'GND4', voltage: GND_VOLTAGE },
      { index: 18, role: 'signal', name: 'GP14' },
      { index: 19, role: 'signal', name: 'GP15' },
      { index: 20, role: 'signal', name: 'GP16' },
      { index: 21, role: 'signal', name: 'GP17' },
      { index: 22, role: 'gnd', name: 'GND5', voltage: GND_VOLTAGE },
      { index: 23, role: 'signal', name: 'GP18' },
      { index: 24, role: 'signal', name: 'GP19' },
      { index: 25, role: 'signal', name: 'GP20' },
      { index: 26, role: 'signal', name: 'GP21' },
      { index: 27, role: 'gnd', name: 'GND6', voltage: GND_VOLTAGE },
      { index: 28, role: 'signal', name: 'GP22' },
      { index: 29, role: 'input', name: 'RUN' },
      { index: 30, role: 'signal', name: 'GP26' },
      { index: 31, role: 'signal', name: 'GP27' },
      { index: 32, role: 'gnd', name: 'GND7', voltage: GND_VOLTAGE },
      { index: 33, role: 'signal', name: 'GP28' },
      { index: 34, role: 'signal', name: 'ADC_VREF' },
      { index: 35, role: 'vcc', name: '3V3', voltage: 3.3 },
      { index: 36, role: 'vcc', name: '3V3_EN' },
      { index: 37, role: 'gnd', name: 'GND8', voltage: GND_VOLTAGE },
      { index: 38, role: 'vcc', name: 'VSYS' },
      { index: 39, role: 'vcc', name: 'VBUS', voltage: VCC_VOLTAGE },
    ],
  },

  // Connectors
  {
    type: 'connector_barrel',
    pins: [
      { index: 0, role: 'gnd', name: 'Sleeve', voltage: GND_VOLTAGE },
      { index: 1, role: 'vcc', name: 'Center', voltage: VCC_VOLTAGE },
      { index: 2, role: 'nc', name: 'Switch' },
    ],
  },
  {
    type: 'connector_usb',
    pins: [
      { index: 0, role: 'vcc', name: 'VBUS', voltage: VCC_VOLTAGE },
      { index: 1, role: 'data', name: 'D-' },
      { index: 2, role: 'data', name: 'D+' },
      { index: 3, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
    ],
  },

  // Audio jacks
  {
    type: 'jack_35mm',
    pins: [
      { index: 0, role: 'signal', name: 'Tip' },
      { index: 1, role: 'signal', name: 'Ring' },
      { index: 2, role: 'gnd', name: 'Sleeve', voltage: GND_VOLTAGE },
    ],
  },
  {
    type: 'jack_635mm',
    pins: [
      { index: 0, role: 'signal', name: 'Tip' },
      { index: 1, role: 'signal', name: 'Ring' },
      { index: 2, role: 'gnd', name: 'Sleeve', voltage: GND_VOLTAGE },
      { index: 3, role: 'nc', name: 'Switch' },
    ],
  },

  // MIDI DIN
  {
    type: 'midi_din',
    pins: [
      { index: 0, role: 'nc', name: 'NC' },
      { index: 1, role: 'gnd', name: 'Shield', voltage: GND_VOLTAGE },
      { index: 2, role: 'nc', name: 'NC2' },
      { index: 3, role: 'signal', name: 'Source' },
      { index: 4, role: 'signal', name: 'Sink' },
    ],
  },

  // Headers (generic - assume alternating VCC/GND for power headers)
  {
    type: 'header_1x2',
    pins: [
      { index: 0, role: 'signal', name: 'Pin1' },
      { index: 1, role: 'signal', name: 'Pin2' },
    ],
  },

  // Daisy Seed (Electrosmith) - 40 pins
  {
    type: 'mcu_daisy_seed',
    pins: [
      // Left side (pins 0-19)
      { index: 0, role: 'signal', name: 'D0' },
      { index: 1, role: 'signal', name: 'D1' },
      { index: 2, role: 'signal', name: 'D2' },
      { index: 3, role: 'signal', name: 'D3' },
      { index: 4, role: 'signal', name: 'D4' },
      { index: 5, role: 'signal', name: 'D5' },
      { index: 6, role: 'signal', name: 'D6' },
      { index: 7, role: 'signal', name: 'D7' },
      { index: 8, role: 'signal', name: 'D8' },
      { index: 9, role: 'signal', name: 'D9' },
      { index: 10, role: 'signal', name: 'D10' },
      { index: 11, role: 'gnd', name: 'DGND', voltage: GND_VOLTAGE },
      { index: 12, role: 'vcc', name: '3V3D', voltage: 3.3 },
      { index: 13, role: 'signal', name: 'D11' },
      { index: 14, role: 'signal', name: 'D12' },
      { index: 15, role: 'signal', name: 'D13' },
      { index: 16, role: 'signal', name: 'D14' },
      { index: 17, role: 'signal', name: 'D15/A0' },
      { index: 18, role: 'signal', name: 'D16/A1' },
      { index: 19, role: 'signal', name: 'D17/A2' },
      // Right side (pins 20-39)
      { index: 20, role: 'signal', name: 'D18/A3' },
      { index: 21, role: 'signal', name: 'D19/A4' },
      { index: 22, role: 'signal', name: 'D20/A5' },
      { index: 23, role: 'signal', name: 'D21/A6' },
      { index: 24, role: 'signal', name: 'D22/A7' },
      { index: 25, role: 'signal', name: 'D23/A8' },
      { index: 26, role: 'signal', name: 'D24/A9' },
      { index: 27, role: 'signal', name: 'D25/A10' },
      { index: 28, role: 'signal', name: 'D26/A11' },
      { index: 29, role: 'signal', name: 'D27' },
      { index: 30, role: 'signal', name: 'D28' },
      { index: 31, role: 'signal', name: 'D29' },
      { index: 32, role: 'signal', name: 'D30' },
      { index: 33, role: 'gnd', name: 'AGND', voltage: GND_VOLTAGE },
      { index: 34, role: 'vcc', name: '3V3A', voltage: 3.3 },
      { index: 35, role: 'signal', name: 'AUDIO_OUT_L' },
      { index: 36, role: 'signal', name: 'AUDIO_OUT_R' },
      { index: 37, role: 'signal', name: 'AUDIO_IN_L' },
      { index: 38, role: 'signal', name: 'AUDIO_IN_R' },
      { index: 39, role: 'vcc', name: 'VIN', voltage: VCC_VOLTAGE },
    ],
  },

  // TRS 3.5mm Jack (Stereo audio)
  {
    type: 'jack_trs_35mm',
    pins: [
      { index: 0, role: 'signal', name: 'Tip' },
      { index: 1, role: 'signal', name: 'Ring' },
      { index: 2, role: 'gnd', name: 'Sleeve', voltage: GND_VOLTAGE },
    ],
  },

  // MIDI TRS Type-A (3.5mm MIDI)
  {
    type: 'midi_trs_type_a',
    pins: [
      { index: 0, role: 'signal', name: 'Sink' },
      { index: 1, role: 'vcc', name: 'Source', voltage: VCC_VOLTAGE },
      { index: 2, role: 'gnd', name: 'Shield', voltage: GND_VOLTAGE },
    ],
  },

  // LED Matrix 8x8 (MAX7219 module)
  {
    type: 'led_matrix_8x8',
    pins: [
      { index: 0, role: 'vcc', name: 'VCC', voltage: VCC_VOLTAGE },
      { index: 1, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 2, role: 'data', name: 'DIN' },
      { index: 3, role: 'clock', name: 'CLK' },
      { index: 4, role: 'enable', name: 'CS' },
    ],
  },

  // 6mm Tactile Button
  {
    type: 'button_6mm',
    pins: [
      { index: 0, role: 'signal', name: 'A1' },
      { index: 1, role: 'signal', name: 'A2' },
      { index: 2, role: 'signal', name: 'B1' },
      { index: 3, role: 'signal', name: 'B2' },
    ],
  },

  // 12mm Tactile Button
  {
    type: 'button_12mm',
    pins: [
      { index: 0, role: 'signal', name: 'A1' },
      { index: 1, role: 'signal', name: 'A2' },
      { index: 2, role: 'signal', name: 'B1' },
      { index: 3, role: 'signal', name: 'B2' },
    ],
  },

  // 6N138 Optocoupler (MIDI isolation)
  {
    type: 'opto_6n138',
    pins: [
      { index: 0, role: 'nc', name: 'NC' },
      { index: 1, role: 'input', name: 'Anode' },
      { index: 2, role: 'gnd', name: 'Cathode', voltage: GND_VOLTAGE },
      { index: 3, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 4, role: 'output', name: 'VO' },
      { index: 5, role: 'signal', name: 'VB' },
      { index: 6, role: 'vcc', name: 'VCC', voltage: VCC_VOLTAGE },
      { index: 7, role: 'nc', name: 'NC2' },
    ],
  },

  // Additional common components
  // 9mm Potentiometer (Alpha style)
  {
    type: 'pot_9mm',
    pins: [
      { index: 0, role: 'vcc', name: 'CW', voltage: VCC_VOLTAGE },
      { index: 1, role: 'output', name: 'Wiper' },
      { index: 2, role: 'gnd', name: 'CCW', voltage: GND_VOLTAGE },
    ],
  },

  // 16mm Potentiometer
  {
    type: 'pot_16mm',
    pins: [
      { index: 0, role: 'vcc', name: 'CW', voltage: VCC_VOLTAGE },
      { index: 1, role: 'output', name: 'Wiper' },
      { index: 2, role: 'gnd', name: 'CCW', voltage: GND_VOLTAGE },
    ],
  },

  // OLED I2C displays
  {
    type: 'display_oled_128x32',
    pins: [
      { index: 0, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 1, role: 'vcc', name: 'VCC', voltage: 3.3 },
      { index: 2, role: 'clock', name: 'SCL' },
      { index: 3, role: 'data', name: 'SDA' },
    ],
  },
  {
    type: 'display_oled_128x64',
    pins: [
      { index: 0, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 1, role: 'vcc', name: 'VCC', voltage: 3.3 },
      { index: 2, role: 'clock', name: 'SCL' },
      { index: 3, role: 'data', name: 'SDA' },
    ],
  },

  // WS2812 NeoPixel strip header
  {
    type: 'led_ws2812_strip',
    pins: [
      { index: 0, role: 'vcc', name: 'VCC', voltage: VCC_VOLTAGE },
      { index: 1, role: 'data', name: 'DIN' },
      { index: 2, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
    ],
  },

  // NeoPixel Ring
  {
    type: 'led_neopixel_ring_16',
    pins: [
      { index: 0, role: 'vcc', name: 'VCC', voltage: VCC_VOLTAGE },
      { index: 1, role: 'data', name: 'DIN' },
      { index: 2, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
    ],
  },

  // 74HC595 Shift Register
  {
    type: 'shift_74hc595',
    pins: [
      { index: 0, role: 'output', name: 'QB' },
      { index: 1, role: 'output', name: 'QC' },
      { index: 2, role: 'output', name: 'QD' },
      { index: 3, role: 'output', name: 'QE' },
      { index: 4, role: 'output', name: 'QF' },
      { index: 5, role: 'output', name: 'QG' },
      { index: 6, role: 'output', name: 'QH' },
      { index: 7, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 8, role: 'output', name: "QH'" },
      { index: 9, role: 'input', name: 'SRCLR' },
      { index: 10, role: 'clock', name: 'SRCLK' },
      { index: 11, role: 'clock', name: 'RCLK' },
      { index: 12, role: 'enable', name: 'OE' },
      { index: 13, role: 'data', name: 'SER' },
      { index: 14, role: 'output', name: 'QA' },
      { index: 15, role: 'vcc', name: 'VCC', voltage: VCC_VOLTAGE },
    ],
  },

  // CD4051 8-channel Analog Mux
  {
    type: 'mux_cd4051',
    pins: [
      { index: 0, role: 'signal', name: 'Y4' },
      { index: 1, role: 'signal', name: 'Y6' },
      { index: 2, role: 'signal', name: 'Z' },
      { index: 3, role: 'signal', name: 'Y7' },
      { index: 4, role: 'signal', name: 'Y5' },
      { index: 5, role: 'enable', name: 'INH' },
      { index: 6, role: 'gnd', name: 'VEE', voltage: GND_VOLTAGE },
      { index: 7, role: 'gnd', name: 'VSS', voltage: GND_VOLTAGE },
      { index: 8, role: 'signal', name: 'C' },
      { index: 9, role: 'signal', name: 'B' },
      { index: 10, role: 'signal', name: 'A' },
      { index: 11, role: 'signal', name: 'Y3' },
      { index: 12, role: 'signal', name: 'Y0' },
      { index: 13, role: 'signal', name: 'Y1' },
      { index: 14, role: 'signal', name: 'Y2' },
      { index: 15, role: 'vcc', name: 'VDD', voltage: VCC_VOLTAGE },
    ],
  },

  // MIDI DIN-5 connector
  {
    type: 'midi_din5',
    pins: [
      { index: 0, role: 'nc', name: 'NC' },
      { index: 1, role: 'gnd', name: 'Shield', voltage: GND_VOLTAGE },
      { index: 2, role: 'nc', name: 'NC2' },
      { index: 3, role: 'signal', name: 'Source' },
      { index: 4, role: 'signal', name: 'Sink' },
    ],
  },

  // TRS 6.35mm Jack (1/4" stereo)
  {
    type: 'jack_trs_635mm',
    pins: [
      { index: 0, role: 'signal', name: 'Tip' },
      { index: 1, role: 'signal', name: 'Ring' },
      { index: 2, role: 'gnd', name: 'Sleeve', voltage: GND_VOLTAGE },
    ],
  },

  // Arcade button (2-pin)
  {
    type: 'button_arcade',
    pins: [
      { index: 0, role: 'signal', name: 'NO' },
      { index: 1, role: 'signal', name: 'COM' },
    ],
  },

  // === REGULATORS ===
  {
    type: 'regulator_7805',
    pins: [
      { index: 0, role: 'vcc', name: 'IN', voltage: VCC_VOLTAGE },
      { index: 1, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 2, role: 'vcc', name: 'OUT', voltage: 5 },
    ],
  },
  {
    type: 'regulator_lm317',
    pins: [
      { index: 0, role: 'signal', name: 'ADJ' },
      { index: 1, role: 'vcc', name: 'OUT', voltage: VCC_VOLTAGE },
      { index: 2, role: 'vcc', name: 'IN', voltage: VCC_VOLTAGE },
    ],
  },
  {
    type: 'regulator_ams1117',
    pins: [
      { index: 0, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 1, role: 'vcc', name: 'VOUT', voltage: VCC_VOLTAGE },
      { index: 2, role: 'vcc', name: 'VIN', voltage: VCC_VOLTAGE },
    ],
  },

  // === OP-AMPS ===
  {
    type: 'opamp_tl072', // Dual op-amp
    pins: [
      { index: 0, role: 'signal', name: '1OUT' },
      { index: 1, role: 'signal', name: '1IN-' },
      { index: 2, role: 'signal', name: '1IN+' },
      { index: 3, role: 'gnd', name: 'V-', voltage: GND_VOLTAGE },
      { index: 4, role: 'signal', name: '2IN+' },
      { index: 5, role: 'signal', name: '2IN-' },
      { index: 6, role: 'signal', name: '2OUT' },
      { index: 7, role: 'vcc', name: 'V+', voltage: VCC_VOLTAGE },
    ],
  },
  {
    type: 'opamp_lm358', // Dual op-amp
    pins: [
      { index: 0, role: 'signal', name: 'OUT A' },
      { index: 1, role: 'signal', name: 'IN A-' },
      { index: 2, role: 'signal', name: 'IN A+' },
      { index: 3, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 4, role: 'signal', name: 'IN B+' },
      { index: 5, role: 'signal', name: 'IN B-' },
      { index: 6, role: 'signal', name: 'OUT B' },
      { index: 7, role: 'vcc', name: 'VCC', voltage: VCC_VOLTAGE },
    ],
  },
  {
    type: 'opamp_tl074', // Quad op-amp
    pins: [
      { index: 0, role: 'signal', name: '1OUT' },
      { index: 1, role: 'signal', name: '1IN-' },
      { index: 2, role: 'signal', name: '1IN+' },
      { index: 3, role: 'vcc', name: 'V+', voltage: VCC_VOLTAGE },
      { index: 4, role: 'signal', name: '2IN+' },
      { index: 5, role: 'signal', name: '2IN-' },
      { index: 6, role: 'signal', name: '2OUT' },
      { index: 7, role: 'signal', name: '3OUT' },
      { index: 8, role: 'signal', name: '3IN-' },
      { index: 9, role: 'signal', name: '3IN+' },
      { index: 10, role: 'gnd', name: 'V-', voltage: GND_VOLTAGE },
      { index: 11, role: 'signal', name: '4IN+' },
      { index: 12, role: 'signal', name: '4IN-' },
      { index: 13, role: 'signal', name: '4OUT' },
    ],
  },

  // === DIODES / TRANSISTORS ===
  {
    type: 'diode_1n4148',
    pins: [
      { index: 0, role: 'signal', name: 'A' },
      { index: 1, role: 'signal', name: 'C' },
    ],
  },
  {
    type: 'diode_1n4001',
    pins: [
      { index: 0, role: 'signal', name: 'A' },
      { index: 1, role: 'signal', name: 'C' },
    ],
  },
  {
    type: 'diode_zener',
    pins: [
      { index: 0, role: 'signal', name: 'A' },
      { index: 1, role: 'signal', name: 'C' },
    ],
  },
  {
    type: 'transistor_npn',
    pins: [
      { index: 0, role: 'signal', name: 'C' },
      { index: 1, role: 'signal', name: 'B' },
      { index: 2, role: 'signal', name: 'E' },
    ],
  },
  {
    type: 'transistor_pnp',
    pins: [
      { index: 0, role: 'signal', name: 'C' },
      { index: 1, role: 'signal', name: 'B' },
      { index: 2, role: 'signal', name: 'E' },
    ],
  },
  {
    type: 'mosfet_n_channel',
    pins: [
      { index: 0, role: 'signal', name: 'D' },
      { index: 1, role: 'signal', name: 'G' },
      { index: 2, role: 'signal', name: 'S' },
    ],
  },

  // === DISPLAYS ===
  {
    type: 'display_7seg_1digit',
    pins: [
      { index: 0, role: 'signal', name: 'E' },
      { index: 1, role: 'signal', name: 'D' },
      { index: 2, role: 'signal', name: 'DP' },
      { index: 3, role: 'signal', name: 'C' },
      { index: 4, role: 'signal', name: 'G' },
      { index: 5, role: 'signal', name: 'COM' },
      { index: 6, role: 'signal', name: 'B' },
      { index: 7, role: 'signal', name: 'F' },
      { index: 8, role: 'signal', name: 'A' },
      { index: 9, role: 'signal', name: 'COM' },
    ],
  },
  {
    type: 'display_7seg_4digit',
    pins: [
      { index: 0, role: 'signal', name: 'D1' },
      { index: 1, role: 'signal', name: 'D2' },
      { index: 2, role: 'signal', name: 'D3' },
      { index: 3, role: 'signal', name: 'D4' },
      { index: 4, role: 'signal', name: 'E' },
      { index: 5, role: 'signal', name: 'D' },
      { index: 6, role: 'signal', name: 'DP' },
      { index: 7, role: 'signal', name: 'C' },
      { index: 8, role: 'signal', name: 'G' },
      { index: 9, role: 'signal', name: 'B' },
      { index: 10, role: 'signal', name: 'F' },
      { index: 11, role: 'signal', name: 'A' },
    ],
  },
  {
    type: 'display_oled_spi',
    pins: [
      { index: 0, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 1, role: 'vcc', name: 'VCC', voltage: VCC_VOLTAGE },
      { index: 2, role: 'signal', name: 'SCL' },
      { index: 3, role: 'signal', name: 'SDA' },
      { index: 4, role: 'signal', name: 'RES' },
      { index: 5, role: 'signal', name: 'DC' },
      { index: 6, role: 'signal', name: 'CS' },
    ],
  },

  // === SENSORS ===
  {
    type: 'photoresistor_ldr',
    pins: [
      { index: 0, role: 'signal', name: 'P1' },
      { index: 1, role: 'signal', name: 'P2' },
    ],
  },
  {
    type: 'thermistor_ntc',
    pins: [
      { index: 0, role: 'signal', name: 'P1' },
      { index: 1, role: 'signal', name: 'P2' },
    ],
  },
  {
    type: 'fsr_round',
    pins: [
      { index: 0, role: 'signal', name: 'P1' },
      { index: 1, role: 'signal', name: 'P2' },
    ],
  },

  // === AUDIO ===
  {
    type: 'piezo_27mm',
    pins: [
      { index: 0, role: 'signal', name: 'POS' },
      { index: 1, role: 'gnd', name: 'NEG', voltage: GND_VOLTAGE },
    ],
  },
  {
    type: 'piezo_35mm',
    pins: [
      { index: 0, role: 'signal', name: 'POS' },
      { index: 1, role: 'gnd', name: 'NEG', voltage: GND_VOLTAGE },
    ],
  },
  {
    type: 'buzzer_12mm',
    pins: [
      { index: 0, role: 'vcc', name: '+', voltage: VCC_VOLTAGE },
      { index: 1, role: 'signal', name: 'I/O' },
    ],
  },
  {
    type: 'speaker_28mm',
    pins: [
      { index: 0, role: 'signal', name: '+' },
      { index: 1, role: 'signal', name: '-' },
    ],
  },
  {
    type: 'speaker_40mm',
    pins: [
      { index: 0, role: 'signal', name: '+' },
      { index: 1, role: 'signal', name: '-' },
    ],
  },

  // === MISC ===
  {
    type: 'terminal_2p',
    pins: [
      { index: 0, role: 'signal', name: '1' },
      { index: 1, role: 'signal', name: '2' },
    ],
  },
  {
    type: 'terminal_3p',
    pins: [
      { index: 0, role: 'signal', name: '1' },
      { index: 1, role: 'signal', name: '2' },
      { index: 2, role: 'signal', name: '3' },
    ],
  },
  {
    type: 'sd_card_slot',
    pins: [
      { index: 0, role: 'signal', name: 'DAT2' },
      { index: 1, role: 'signal', name: 'CD/DAT3' },
      { index: 2, role: 'signal', name: 'CMD' },
      { index: 3, role: 'vcc', name: 'VDD', voltage: VCC_VOLTAGE },
      { index: 4, role: 'signal', name: 'CLK' },
      { index: 5, role: 'gnd', name: 'VSS', voltage: GND_VOLTAGE },
      { index: 6, role: 'signal', name: 'DAT0' },
      { index: 7, role: 'signal', name: 'DAT1' },
    ],
  },
  {
    type: 'relay_5v',
    pins: [
      { index: 0, role: 'signal', name: 'NC' },
      { index: 1, role: 'signal', name: 'COM' },
      { index: 2, role: 'signal', name: 'NO' },
      { index: 3, role: 'vcc', name: 'COIL', voltage: VCC_VOLTAGE },
      { index: 4, role: 'gnd', name: 'COIL', voltage: GND_VOLTAGE },
    ],
  },
  {
    type: 'joystick_psp',
    pins: [
      { index: 0, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 1, role: 'vcc', name: 'VCC', voltage: VCC_VOLTAGE },
      { index: 2, role: 'signal', name: 'HOR' },
      { index: 3, role: 'signal', name: 'VER' },
    ],
  },
  {
    type: 'joystick_thumb',
    pins: [
      { index: 0, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 1, role: 'vcc', name: 'VCC', voltage: VCC_VOLTAGE },
      { index: 2, role: 'signal', name: 'VRx' },
      { index: 3, role: 'signal', name: 'VRy' },
      { index: 4, role: 'signal', name: 'SW' },
    ],
  },
  {
    type: 'dip_switch_4',
    pins: [
      { index: 0, role: 'signal', name: '1' },
      { index: 1, role: 'signal', name: '2' },
      { index: 2, role: 'signal', name: '3' },
      { index: 3, role: 'signal', name: '4' },
      { index: 4, role: 'signal', name: 'C' },
      { index: 5, role: 'signal', name: 'C' },
      { index: 6, role: 'signal', name: 'C' },
      { index: 7, role: 'signal', name: 'C' },
    ],
  },
  {
    type: 'rotary_switch_12pos',
    pins: [
      { index: 0, role: 'signal', name: 'C' },
      { index: 1, role: 'signal', name: '1' },
      { index: 2, role: 'signal', name: '2' },
      { index: 3, role: 'signal', name: '3' },
      { index: 4, role: 'signal', name: '4' },
      { index: 5, role: 'signal', name: '5' },
      { index: 6, role: 'signal', name: '6' },
      { index: 7, role: 'signal', name: '7' },
      { index: 8, role: 'signal', name: '8' },
      { index: 9, role: 'signal', name: '9' },
      { index: 10, role: 'signal', name: '10' },
      { index: 11, role: 'signal', name: '11' },
      { index: 12, role: 'signal', name: '12' },
    ],
  },
  {
    type: 'vactrol',
    pins: [
      { index: 0, role: 'signal', name: 'LED+' },
      { index: 1, role: 'signal', name: 'LED-' },
      { index: 2, role: 'signal', name: 'LDR1' },
      { index: 3, role: 'signal', name: 'LDR2' },
    ],
  },
  {
    type: 'cv_jack_35mm',
    pins: [
      { index: 0, role: 'signal', name: 'Tip' },
      { index: 1, role: 'gnd', name: 'Sleeve', voltage: GND_VOLTAGE },
    ],
  },
  {
    type: 'jack_expression',
    pins: [
      { index: 0, role: 'signal', name: 'Tip' },
      { index: 1, role: 'signal', name: 'Ring' },
      { index: 2, role: 'gnd', name: 'Sleeve', voltage: GND_VOLTAGE },
    ],
  },
  {
    type: 'jack_sustain',
    pins: [
      { index: 0, role: 'signal', name: 'Tip' },
      { index: 1, role: 'gnd', name: 'Sleeve', voltage: GND_VOLTAGE },
    ],
  },
  {
    type: 'mux_cd4067',
    pins: [
      { index: 0, role: 'signal', name: 'C10' },
      { index: 1, role: 'signal', name: 'C11' },
      { index: 2, role: 'signal', name: 'C12' },
      { index: 3, role: 'signal', name: 'C13' },
      { index: 4, role: 'signal', name: 'C14' },
      { index: 5, role: 'signal', name: 'C15' },
      { index: 6, role: 'signal', name: 'C8' },
      { index: 7, role: 'signal', name: 'C9' },
      { index: 8, role: 'gnd', name: 'VSS', voltage: GND_VOLTAGE },
      { index: 9, role: 'signal', name: 'S3' },
      { index: 10, role: 'signal', name: 'S2' },
      { index: 11, role: 'signal', name: 'S1' },
      { index: 12, role: 'signal', name: 'S0' },
      { index: 13, role: 'signal', name: 'EN' },
      { index: 14, role: 'signal', name: 'COM' },
      { index: 15, role: 'signal', name: 'C0' },
      { index: 16, role: 'signal', name: 'C1' },
      { index: 17, role: 'signal', name: 'C2' },
      { index: 18, role: 'signal', name: 'C3' },
      { index: 19, role: 'signal', name: 'C4' },
      { index: 20, role: 'signal', name: 'C5' },
      { index: 21, role: 'signal', name: 'C6' },
      { index: 22, role: 'signal', name: 'C7' },
      { index: 23, role: 'vcc', name: 'VDD', voltage: VCC_VOLTAGE },
    ],
  },
  {
    type: 'shift_74hc165',
    pins: [
      { index: 0, role: 'signal', name: 'PL' },
      { index: 1, role: 'signal', name: 'CP' },
      { index: 2, role: 'signal', name: 'D4' },
      { index: 3, role: 'signal', name: 'D5' },
      { index: 4, role: 'signal', name: 'D6' },
      { index: 5, role: 'signal', name: 'D7' },
      { index: 6, role: 'signal', name: 'Q7' },
      { index: 7, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 8, role: 'signal', name: 'Q7H' },
      { index: 9, role: 'signal', name: 'DS' },
      { index: 10, role: 'signal', name: 'D0' },
      { index: 11, role: 'signal', name: 'D1' },
      { index: 12, role: 'signal', name: 'D2' },
      { index: 13, role: 'signal', name: 'D3' },
      { index: 14, role: 'signal', name: 'CE' },
      { index: 15, role: 'vcc', name: 'VCC', voltage: VCC_VOLTAGE },
    ],
  },
  {
    type: 'opto_pc817',
    pins: [
      { index: 0, role: 'signal', name: 'Anode' },
      { index: 1, role: 'signal', name: 'Cathode' },
      { index: 2, role: 'signal', name: 'Collector' },
      { index: 3, role: 'signal', name: 'Emitter' },
    ],
  },
  {
    type: 'opto_4n35',
    pins: [
      { index: 0, role: 'signal', name: 'Anode' },
      { index: 1, role: 'signal', name: 'Cathode' },
      { index: 2, role: 'nc', name: 'NC' },
      { index: 3, role: 'signal', name: 'Emitter' },
      { index: 4, role: 'signal', name: 'Collector' },
      { index: 5, role: 'signal', name: 'Base' },
    ],
  },
  {
    type: 'adc_ads1115',
    pins: [
      { index: 0, role: 'vcc', name: 'VDD', voltage: VCC_VOLTAGE },
      { index: 1, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 2, role: 'signal', name: 'SCL' },
      { index: 3, role: 'signal', name: 'SDA' },
      { index: 4, role: 'signal', name: 'ADDR' },
      { index: 5, role: 'signal', name: 'ALRT' },
      { index: 6, role: 'signal', name: 'A0' },
      { index: 7, role: 'signal', name: 'A1' },
      { index: 8, role: 'signal', name: 'A2' },
      { index: 9, role: 'signal', name: 'A3' },
    ],
  },
  {
    type: 'dac_mcp4725',
    pins: [
      { index: 0, role: 'vcc', name: 'VDD', voltage: VCC_VOLTAGE },
      { index: 1, role: 'gnd', name: 'VSS', voltage: GND_VOLTAGE },
      { index: 2, role: 'signal', name: 'SCL' },
      { index: 3, role: 'signal', name: 'SDA' },
      { index: 4, role: 'signal', name: 'A0' },
      { index: 5, role: 'signal', name: 'VOUT' },
    ],
  },

  // Audio DAC/ADC modules (I2S)
  {
    type: 'audio_dac_pcm5102',
    pins: [
      { index: 0, role: 'vcc', name: 'VCC', voltage: VCC_VOLTAGE },
      { index: 1, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 2, role: 'signal', name: 'BCK' }, // Bit clock
      { index: 3, role: 'signal', name: 'DIN' }, // Data in
      { index: 4, role: 'signal', name: 'LCK' }, // Word clock (LRCK)
      { index: 5, role: 'signal', name: 'FMT' }, // Format select
    ],
  },
  {
    type: 'audio_dac_max98357',
    pins: [
      { index: 0, role: 'vcc', name: 'VIN', voltage: VCC_VOLTAGE },
      { index: 1, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 2, role: 'signal', name: 'SD' }, // Shutdown
      { index: 3, role: 'signal', name: 'GAIN' }, // Gain select
      { index: 4, role: 'signal', name: 'DIN' }, // Data in
      { index: 5, role: 'signal', name: 'BCLK' }, // Bit clock
      { index: 6, role: 'signal', name: 'LRC' }, // Word clock
    ],
  },
  {
    type: 'audio_adc_pcm1808',
    pins: [
      { index: 0, role: 'vcc', name: 'VCC', voltage: VCC_VOLTAGE },
      { index: 1, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 2, role: 'signal', name: 'BCK' }, // Bit clock
      { index: 3, role: 'signal', name: 'OUT' }, // Data out
      { index: 4, role: 'signal', name: 'LCK' }, // Word clock
      { index: 5, role: 'signal', name: 'SCK' }, // System clock
      { index: 6, role: 'signal', name: 'FMT' }, // Format select
      { index: 7, role: 'signal', name: 'MD' }, // Mode select
    ],
  },
  {
    type: 'audio_codec_es8388',
    pins: [
      { index: 0, role: 'vcc', name: 'VCC', voltage: VCC_VOLTAGE },
      { index: 1, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 2, role: 'signal', name: 'MCLK' },
      { index: 3, role: 'signal', name: 'SCLK' },
      { index: 4, role: 'signal', name: 'LRCK' },
      { index: 5, role: 'signal', name: 'DSDIN' },
      { index: 6, role: 'signal', name: 'ASDOUT' },
      { index: 7, role: 'signal', name: 'SDA' },
      { index: 8, role: 'signal', name: 'SCL' },
      { index: 9, role: 'gnd', name: 'GND2', voltage: GND_VOLTAGE },
    ],
  },
  {
    type: 'audio_codec_wm8960',
    pins: [
      { index: 0, role: 'vcc', name: 'VCC', voltage: VCC_VOLTAGE },
      { index: 1, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 2, role: 'signal', name: 'MCLK' },
      { index: 3, role: 'signal', name: 'BCLK' },
      { index: 4, role: 'signal', name: 'DACLRC' },
      { index: 5, role: 'signal', name: 'DACDAT' },
      { index: 6, role: 'signal', name: 'ADCDAT' },
      { index: 7, role: 'signal', name: 'SDA' },
      { index: 8, role: 'signal', name: 'SCL' },
      { index: 9, role: 'gnd', name: 'GND2', voltage: GND_VOLTAGE },
    ],
  },
  {
    type: 'pad_connector_8',
    pins: [
      { index: 0, role: 'signal', name: '1' },
      { index: 1, role: 'signal', name: '2' },
      { index: 2, role: 'signal', name: '3' },
      { index: 3, role: 'signal', name: '4' },
      { index: 4, role: 'signal', name: '5' },
      { index: 5, role: 'signal', name: '6' },
      { index: 6, role: 'signal', name: '7' },
      { index: 7, role: 'signal', name: '8' },
    ],
  },
  {
    type: 'mcu_atmega328',
    pins: [
      { index: 0, role: 'signal', name: 'PC6' }, // RESET
      { index: 1, role: 'signal', name: 'PD0' }, // RXD
      { index: 2, role: 'signal', name: 'PD1' }, // TXD
      { index: 3, role: 'signal', name: 'PD2' }, // INT0
      { index: 4, role: 'signal', name: 'PD3' }, // INT1
      { index: 5, role: 'signal', name: 'PD4' },
      { index: 6, role: 'vcc', name: 'VCC', voltage: VCC_VOLTAGE },
      { index: 7, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 8, role: 'signal', name: 'PB6' }, // XTAL1
      { index: 9, role: 'signal', name: 'PB7' }, // XTAL2
      { index: 10, role: 'signal', name: 'PD5' },
      { index: 11, role: 'signal', name: 'PD6' },
      { index: 12, role: 'signal', name: 'PD7' },
      { index: 13, role: 'signal', name: 'PB0' },
      { index: 14, role: 'signal', name: 'PB1' },
      { index: 15, role: 'signal', name: 'PB2' },
      { index: 16, role: 'signal', name: 'PB3' }, // MOSI
      { index: 17, role: 'signal', name: 'PB4' }, // MISO
      { index: 18, role: 'signal', name: 'PB5' }, // SCK
      { index: 19, role: 'vcc', name: 'AVCC', voltage: VCC_VOLTAGE },
      { index: 20, role: 'signal', name: 'AREF' },
      { index: 21, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 22, role: 'signal', name: 'PC0' },
      { index: 23, role: 'signal', name: 'PC1' },
      { index: 24, role: 'signal', name: 'PC2' },
      { index: 25, role: 'signal', name: 'PC3' },
      { index: 26, role: 'signal', name: 'PC4' }, // SDA
      { index: 27, role: 'signal', name: 'PC5' }, // SCL
    ],
  },
  {
    type: 'mcu_pro_micro',
    pins: [
      { index: 0, role: 'signal', name: 'TX' },
      { index: 1, role: 'signal', name: 'RX' },
      { index: 2, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 3, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 4, role: 'signal', name: 'SCL' },
      { index: 5, role: 'signal', name: 'SDA' },
      { index: 6, role: 'signal', name: 'D4' },
      { index: 7, role: 'signal', name: 'D5' },
      { index: 8, role: 'signal', name: 'D6' },
      { index: 9, role: 'signal', name: 'D7' },
      { index: 10, role: 'signal', name: 'D8' },
      { index: 11, role: 'signal', name: 'D9' },
      { index: 12, role: 'signal', name: 'D10' },
      { index: 13, role: 'signal', name: 'MOSI' },
      { index: 14, role: 'signal', name: 'MISO' },
      { index: 15, role: 'signal', name: 'SCK' },
      { index: 16, role: 'signal', name: 'A3' },
      { index: 17, role: 'signal', name: 'A2' },
      { index: 18, role: 'signal', name: 'A1' },
      { index: 19, role: 'signal', name: 'A0' },
      { index: 20, role: 'vcc', name: 'VCC', voltage: VCC_VOLTAGE },
      { index: 21, role: 'signal', name: 'RST' },
      { index: 22, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 23, role: 'vcc', name: 'RAW', voltage: VCC_VOLTAGE },
    ],
  },
  {
    type: 'mcu_teensy41',
    pins: [
      { index: 0, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 1, role: 'signal', name: 'D0' },
      { index: 2, role: 'signal', name: 'D1' },
      { index: 3, role: 'signal', name: 'D2' },
      { index: 4, role: 'signal', name: 'D3' },
      { index: 5, role: 'signal', name: 'D4' },
      { index: 6, role: 'signal', name: 'D5' },
      { index: 7, role: 'signal', name: 'D6' },
      { index: 8, role: 'signal', name: 'D7' },
      { index: 9, role: 'signal', name: 'D8' },
      { index: 10, role: 'signal', name: 'D9' },
      { index: 11, role: 'signal', name: 'D10' },
      { index: 12, role: 'signal', name: 'D11' },
      { index: 13, role: 'signal', name: 'D12' },
      { index: 14, role: 'signal', name: 'D13' },
      { index: 15, role: 'vcc', name: '3.3V', voltage: 3.3 },
      { index: 16, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 17, role: 'vcc', name: 'Vin', voltage: VCC_VOLTAGE },
      { index: 18, role: 'signal', name: 'A9' },
      { index: 19, role: 'signal', name: 'A8' },
      { index: 20, role: 'signal', name: 'A7' },
      { index: 21, role: 'signal', name: 'A6' },
      { index: 22, role: 'signal', name: 'A5' },
      { index: 23, role: 'signal', name: 'A4' },
      { index: 24, role: 'signal', name: 'A3' },
      { index: 25, role: 'signal', name: 'A2' },
      { index: 26, role: 'signal', name: 'A1' },
      { index: 27, role: 'signal', name: 'A0' },
      { index: 28, role: 'signal', name: 'D14' },
      { index: 29, role: 'signal', name: 'D15' },
      { index: 30, role: 'signal', name: 'D16' },
      { index: 31, role: 'signal', name: 'D17' },
      { index: 32, role: 'signal', name: 'D18' },
      { index: 33, role: 'signal', name: 'D19' },
      { index: 34, role: 'signal', name: 'D20' },
      { index: 35, role: 'signal', name: 'D21' },
      { index: 36, role: 'signal', name: 'D22' },
      { index: 37, role: 'signal', name: 'D23' },
    ],
  },
  {
    type: 'mcu_esp32_s3',
    pins: [
      { index: 0, role: 'vcc', name: '3V3', voltage: 3.3 },
      { index: 1, role: 'signal', name: 'IO4' },
      { index: 2, role: 'signal', name: 'IO5' },
      { index: 3, role: 'signal', name: 'IO6' },
      { index: 4, role: 'signal', name: 'IO7' },
      { index: 5, role: 'signal', name: 'IO15' },
      { index: 6, role: 'signal', name: 'IO16' },
      { index: 7, role: 'signal', name: 'IO17' },
      { index: 8, role: 'signal', name: 'IO18' },
      { index: 9, role: 'signal', name: 'IO8' },
      { index: 10, role: 'signal', name: 'IO3' },
      { index: 11, role: 'signal', name: 'IO46' },
      { index: 12, role: 'signal', name: 'IO9' },
      { index: 13, role: 'signal', name: 'IO10' },
      { index: 14, role: 'signal', name: 'IO11' },
      { index: 15, role: 'signal', name: 'IO12' },
      { index: 16, role: 'signal', name: 'IO13' },
      { index: 17, role: 'signal', name: 'IO14' },
      { index: 18, role: 'vcc', name: '5V', voltage: 5 },
      { index: 19, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 20, role: 'signal', name: 'IO42' }, // TX
      { index: 21, role: 'signal', name: 'IO41' }, // RX
      { index: 22, role: 'signal', name: 'IO40' },
      { index: 23, role: 'signal', name: 'IO39' },
      { index: 24, role: 'signal', name: 'IO38' },
      { index: 25, role: 'signal', name: 'IO37' },
      { index: 26, role: 'signal', name: 'IO36' },
      { index: 27, role: 'signal', name: 'IO35' },
      { index: 28, role: 'signal', name: 'IO0' },
      { index: 29, role: 'signal', name: 'IO45' },
      { index: 30, role: 'signal', name: 'IO48' },
      { index: 31, role: 'signal', name: 'IO47' },
      { index: 32, role: 'signal', name: 'IO21' },
      { index: 33, role: 'signal', name: 'IO20' },
      { index: 34, role: 'signal', name: 'IO19' },
      { index: 35, role: 'signal', name: 'IO2' },
      { index: 36, role: 'signal', name: 'IO1' },
      { index: 37, role: 'vcc', name: '3V3', voltage: 3.3 },
    ],
  },
  {
    type: 'amp_lm386',
    pins: [
      { index: 0, role: 'signal', name: 'G1' },
      { index: 1, role: 'signal', name: 'IN-' },
      { index: 2, role: 'signal', name: 'IN+' },
      { index: 3, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 4, role: 'signal', name: 'VOUT' },
      { index: 5, role: 'vcc', name: 'VS', voltage: VCC_VOLTAGE },
      { index: 6, role: 'signal', name: 'BYP' },
      { index: 7, role: 'signal', name: 'G8' },
    ],
  },
  {
    type: 'amp_pam8403',
    pins: [
      { index: 0, role: 'signal', name: 'ROUT+' },
      { index: 1, role: 'signal', name: 'ROUT-' },
      { index: 2, role: 'signal', name: 'LOUT+' },
      { index: 3, role: 'signal', name: 'LOUT-' },
      { index: 4, role: 'signal', name: 'RIN' },
      { index: 5, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 6, role: 'signal', name: 'LIN' },
      { index: 7, role: 'vcc', name: 'VCC', voltage: VCC_VOLTAGE },
    ],
  },
  {
    type: 'amp_tda2030',
    pins: [
      { index: 0, role: 'signal', name: 'IN+' },
      { index: 1, role: 'signal', name: 'IN-' },
      { index: 2, role: 'gnd', name: 'V-', voltage: GND_VOLTAGE },
      { index: 3, role: 'signal', name: 'OUT' },
      { index: 4, role: 'vcc', name: 'V+', voltage: VCC_VOLTAGE },
    ],
  },

  // === CRYSTALS/OSCILLATORS ===
  {
    type: 'crystal_hc49',
    pins: [
      { index: 0, role: 'signal', name: 'X1' },
      { index: 1, role: 'signal', name: 'X2' },
    ],
  },
  {
    type: 'oscillator_dip8',
    pins: [
      { index: 0, role: 'signal', name: 'EN' },
      { index: 1, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 2, role: 'signal', name: 'OUT' },
      { index: 3, role: 'vcc', name: 'VCC', voltage: VCC_VOLTAGE },
    ],
  },

  // === HEADERS ===
  {
    type: 'header_1x4',
    pins: [
      { index: 0, role: 'signal', name: '1' },
      { index: 1, role: 'signal', name: '2' },
      { index: 2, role: 'signal', name: '3' },
      { index: 3, role: 'signal', name: '4' },
    ],
  },
  {
    type: 'header_1x6',
    pins: [
      { index: 0, role: 'signal', name: '1' },
      { index: 1, role: 'signal', name: '2' },
      { index: 2, role: 'signal', name: '3' },
      { index: 3, role: 'signal', name: '4' },
      { index: 4, role: 'signal', name: '5' },
      { index: 5, role: 'signal', name: '6' },
    ],
  },
  {
    type: 'header_1x8',
    pins: [
      { index: 0, role: 'signal', name: '1' },
      { index: 1, role: 'signal', name: '2' },
      { index: 2, role: 'signal', name: '3' },
      { index: 3, role: 'signal', name: '4' },
      { index: 4, role: 'signal', name: '5' },
      { index: 5, role: 'signal', name: '6' },
      { index: 6, role: 'signal', name: '7' },
      { index: 7, role: 'signal', name: '8' },
    ],
  },
  {
    type: 'header_1x10',
    pins: [
      { index: 0, role: 'signal', name: '1' },
      { index: 1, role: 'signal', name: '2' },
      { index: 2, role: 'signal', name: '3' },
      { index: 3, role: 'signal', name: '4' },
      { index: 4, role: 'signal', name: '5' },
      { index: 5, role: 'signal', name: '6' },
      { index: 6, role: 'signal', name: '7' },
      { index: 7, role: 'signal', name: '8' },
      { index: 8, role: 'signal', name: '9' },
      { index: 9, role: 'signal', name: '10' },
    ],
  },
  {
    type: 'header_2x3',
    pins: [
      { index: 0, role: 'signal', name: '1' },
      { index: 1, role: 'signal', name: '2' },
      { index: 2, role: 'signal', name: '3' },
      { index: 3, role: 'signal', name: '4' },
      { index: 4, role: 'signal', name: '5' },
      { index: 5, role: 'signal', name: '6' },
    ],
  },
  {
    type: 'header_2x5',
    pins: [
      { index: 0, role: 'signal', name: '1' },
      { index: 1, role: 'signal', name: '2' },
      { index: 2, role: 'signal', name: '3' },
      { index: 3, role: 'signal', name: '4' },
      { index: 4, role: 'signal', name: '5' },
      { index: 5, role: 'signal', name: '6' },
      { index: 6, role: 'signal', name: '7' },
      { index: 7, role: 'signal', name: '8' },
      { index: 8, role: 'signal', name: '9' },
      { index: 9, role: 'signal', name: '10' },
    ],
  },
  {
    type: 'header_2x8',
    pins: [
      { index: 0, role: 'signal', name: '1' },
      { index: 1, role: 'signal', name: '2' },
      { index: 2, role: 'signal', name: '3' },
      { index: 3, role: 'signal', name: '4' },
      { index: 4, role: 'signal', name: '5' },
      { index: 5, role: 'signal', name: '6' },
      { index: 6, role: 'signal', name: '7' },
      { index: 7, role: 'signal', name: '8' },
      { index: 8, role: 'signal', name: '9' },
      { index: 9, role: 'signal', name: '10' },
      { index: 10, role: 'signal', name: '11' },
      { index: 11, role: 'signal', name: '12' },
      { index: 12, role: 'signal', name: '13' },
      { index: 13, role: 'signal', name: '14' },
      { index: 14, role: 'signal', name: '15' },
      { index: 15, role: 'signal', name: '16' },
    ],
  },

  // === MCU SOCKETS (same pinout as corresponding MCU) ===
  // Socket for Arduino Nano - 30 pins, 15.24mm row spacing
  {
    type: 'socket_arduino_nano',
    pins: [
      { index: 0, role: 'signal', name: 'D1/TX' },
      { index: 1, role: 'signal', name: 'D0/RX' },
      { index: 2, role: 'input', name: 'RESET' },
      { index: 3, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 4, role: 'signal', name: 'D2' },
      { index: 5, role: 'signal', name: 'D3' },
      { index: 6, role: 'signal', name: 'D4' },
      { index: 7, role: 'signal', name: 'D5' },
      { index: 8, role: 'signal', name: 'D6' },
      { index: 9, role: 'signal', name: 'D7' },
      { index: 10, role: 'signal', name: 'D8' },
      { index: 11, role: 'signal', name: 'D9' },
      { index: 12, role: 'signal', name: 'D10' },
      { index: 13, role: 'signal', name: 'D11' },
      { index: 14, role: 'signal', name: 'D12' },
      { index: 15, role: 'signal', name: 'D13' },
      { index: 16, role: 'vcc', name: '3V3', voltage: 3.3 },
      { index: 17, role: 'signal', name: 'AREF' },
      { index: 18, role: 'signal', name: 'A0' },
      { index: 19, role: 'signal', name: 'A1' },
      { index: 20, role: 'signal', name: 'A2' },
      { index: 21, role: 'signal', name: 'A3' },
      { index: 22, role: 'signal', name: 'A4' },
      { index: 23, role: 'signal', name: 'A5' },
      { index: 24, role: 'signal', name: 'A6' },
      { index: 25, role: 'signal', name: 'A7' },
      { index: 26, role: 'vcc', name: '5V', voltage: VCC_VOLTAGE },
      { index: 27, role: 'input', name: 'RESET2' },
      { index: 28, role: 'gnd', name: 'GND2', voltage: GND_VOLTAGE },
      { index: 29, role: 'vcc', name: 'VIN' },
    ],
  },
  // Socket for Pro Micro - 24 pins, 15.24mm row spacing
  {
    type: 'socket_pro_micro',
    pins: [
      { index: 0, role: 'signal', name: 'TX' },
      { index: 1, role: 'signal', name: 'RX' },
      { index: 2, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 3, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 4, role: 'signal', name: 'SCL' },
      { index: 5, role: 'signal', name: 'SDA' },
      { index: 6, role: 'signal', name: 'D4' },
      { index: 7, role: 'signal', name: 'D5' },
      { index: 8, role: 'signal', name: 'D6' },
      { index: 9, role: 'signal', name: 'D7' },
      { index: 10, role: 'signal', name: 'D8' },
      { index: 11, role: 'signal', name: 'D9' },
      { index: 12, role: 'signal', name: 'D10' },
      { index: 13, role: 'signal', name: 'MOSI' },
      { index: 14, role: 'signal', name: 'MISO' },
      { index: 15, role: 'signal', name: 'SCK' },
      { index: 16, role: 'signal', name: 'A3' },
      { index: 17, role: 'signal', name: 'A2' },
      { index: 18, role: 'signal', name: 'A1' },
      { index: 19, role: 'signal', name: 'A0' },
      { index: 20, role: 'vcc', name: 'VCC', voltage: VCC_VOLTAGE },
      { index: 21, role: 'signal', name: 'RST' },
      { index: 22, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 23, role: 'vcc', name: 'RAW', voltage: VCC_VOLTAGE },
    ],
  },
  // Socket for ESP32 DevKit - 30 pins, 25.4mm row spacing
  {
    type: 'socket_esp32_devkit',
    pins: [
      { index: 0, role: 'vcc', name: '3V3', voltage: 3.3 },
      { index: 1, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 2, role: 'signal', name: 'GPIO15' },
      { index: 3, role: 'signal', name: 'GPIO2' },
      { index: 4, role: 'signal', name: 'GPIO4' },
      { index: 5, role: 'signal', name: 'GPIO16' },
      { index: 6, role: 'signal', name: 'GPIO17' },
      { index: 7, role: 'signal', name: 'GPIO5' },
      { index: 8, role: 'signal', name: 'GPIO18' },
      { index: 9, role: 'signal', name: 'GPIO19' },
      { index: 10, role: 'signal', name: 'GPIO21' },
      { index: 11, role: 'signal', name: 'GPIO3/RX' },
      { index: 12, role: 'signal', name: 'GPIO1/TX' },
      { index: 13, role: 'signal', name: 'GPIO22' },
      { index: 14, role: 'signal', name: 'GPIO23' },
      { index: 15, role: 'vcc', name: 'VIN' },
      { index: 16, role: 'gnd', name: 'GND2', voltage: GND_VOLTAGE },
      { index: 17, role: 'signal', name: 'GPIO13' },
      { index: 18, role: 'signal', name: 'GPIO12' },
      { index: 19, role: 'signal', name: 'GPIO14' },
      { index: 20, role: 'signal', name: 'GPIO27' },
      { index: 21, role: 'signal', name: 'GPIO26' },
      { index: 22, role: 'signal', name: 'GPIO25' },
      { index: 23, role: 'signal', name: 'GPIO33' },
      { index: 24, role: 'signal', name: 'GPIO32' },
      { index: 25, role: 'signal', name: 'GPIO35' },
      { index: 26, role: 'signal', name: 'GPIO34' },
      { index: 27, role: 'signal', name: 'GPIO39' },
      { index: 28, role: 'signal', name: 'GPIO36' },
      { index: 29, role: 'input', name: 'EN' },
    ],
  },
  // Socket for Raspberry Pi Pico - 40 pins, 17.78mm row spacing
  {
    type: 'socket_raspberry_pico',
    pins: [
      { index: 0, role: 'signal', name: 'GP0' },
      { index: 1, role: 'signal', name: 'GP1' },
      { index: 2, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 3, role: 'signal', name: 'GP2' },
      { index: 4, role: 'signal', name: 'GP3' },
      { index: 5, role: 'signal', name: 'GP4' },
      { index: 6, role: 'signal', name: 'GP5' },
      { index: 7, role: 'gnd', name: 'GND2', voltage: GND_VOLTAGE },
      { index: 8, role: 'signal', name: 'GP6' },
      { index: 9, role: 'signal', name: 'GP7' },
      { index: 10, role: 'signal', name: 'GP8' },
      { index: 11, role: 'signal', name: 'GP9' },
      { index: 12, role: 'gnd', name: 'GND3', voltage: GND_VOLTAGE },
      { index: 13, role: 'signal', name: 'GP10' },
      { index: 14, role: 'signal', name: 'GP11' },
      { index: 15, role: 'signal', name: 'GP12' },
      { index: 16, role: 'signal', name: 'GP13' },
      { index: 17, role: 'gnd', name: 'GND4', voltage: GND_VOLTAGE },
      { index: 18, role: 'signal', name: 'GP14' },
      { index: 19, role: 'signal', name: 'GP15' },
      { index: 20, role: 'signal', name: 'GP16' },
      { index: 21, role: 'signal', name: 'GP17' },
      { index: 22, role: 'gnd', name: 'GND5', voltage: GND_VOLTAGE },
      { index: 23, role: 'signal', name: 'GP18' },
      { index: 24, role: 'signal', name: 'GP19' },
      { index: 25, role: 'signal', name: 'GP20' },
      { index: 26, role: 'signal', name: 'GP21' },
      { index: 27, role: 'gnd', name: 'GND6', voltage: GND_VOLTAGE },
      { index: 28, role: 'signal', name: 'GP22' },
      { index: 29, role: 'input', name: 'RUN' },
      { index: 30, role: 'signal', name: 'GP26' },
      { index: 31, role: 'signal', name: 'GP27' },
      { index: 32, role: 'gnd', name: 'GND7', voltage: GND_VOLTAGE },
      { index: 33, role: 'signal', name: 'GP28' },
      { index: 34, role: 'signal', name: 'ADC_VREF' },
      { index: 35, role: 'vcc', name: '3V3', voltage: 3.3 },
      { index: 36, role: 'vcc', name: '3V3_EN' },
      { index: 37, role: 'gnd', name: 'GND8', voltage: GND_VOLTAGE },
      { index: 38, role: 'vcc', name: 'VSYS' },
      { index: 39, role: 'vcc', name: 'VBUS', voltage: VCC_VOLTAGE },
    ],
  },
  // Socket for Daisy Seed - 40 pins, 15.24mm row spacing
  {
    type: 'socket_daisy_seed',
    pins: [
      { index: 0, role: 'signal', name: 'D0' },
      { index: 1, role: 'signal', name: 'D1' },
      { index: 2, role: 'signal', name: 'D2' },
      { index: 3, role: 'signal', name: 'D3' },
      { index: 4, role: 'signal', name: 'D4' },
      { index: 5, role: 'signal', name: 'D5' },
      { index: 6, role: 'signal', name: 'D6' },
      { index: 7, role: 'signal', name: 'D7' },
      { index: 8, role: 'signal', name: 'D8' },
      { index: 9, role: 'signal', name: 'D9' },
      { index: 10, role: 'signal', name: 'D10' },
      { index: 11, role: 'gnd', name: 'DGND', voltage: GND_VOLTAGE },
      { index: 12, role: 'vcc', name: '3V3D', voltage: 3.3 },
      { index: 13, role: 'signal', name: 'D11' },
      { index: 14, role: 'signal', name: 'D12' },
      { index: 15, role: 'signal', name: 'D13' },
      { index: 16, role: 'signal', name: 'D14' },
      { index: 17, role: 'signal', name: 'D15/A0' },
      { index: 18, role: 'signal', name: 'D16/A1' },
      { index: 19, role: 'signal', name: 'D17/A2' },
      { index: 20, role: 'signal', name: 'D18/A3' },
      { index: 21, role: 'signal', name: 'D19/A4' },
      { index: 22, role: 'signal', name: 'D20/A5' },
      { index: 23, role: 'signal', name: 'D21/A6' },
      { index: 24, role: 'signal', name: 'D22/A7' },
      { index: 25, role: 'signal', name: 'D23/A8' },
      { index: 26, role: 'signal', name: 'D24/A9' },
      { index: 27, role: 'signal', name: 'D25/A10' },
      { index: 28, role: 'signal', name: 'D26/A11' },
      { index: 29, role: 'signal', name: 'D27' },
      { index: 30, role: 'signal', name: 'D28' },
      { index: 31, role: 'signal', name: 'D29' },
      { index: 32, role: 'signal', name: 'D30' },
      { index: 33, role: 'gnd', name: 'AGND', voltage: GND_VOLTAGE },
      { index: 34, role: 'vcc', name: '3V3A', voltage: 3.3 },
      { index: 35, role: 'signal', name: 'AUDIO_OUT_L' },
      { index: 36, role: 'signal', name: 'AUDIO_OUT_R' },
      { index: 37, role: 'signal', name: 'AUDIO_IN_L' },
      { index: 38, role: 'signal', name: 'AUDIO_IN_R' },
      { index: 39, role: 'vcc', name: 'VIN', voltage: VCC_VOLTAGE },
    ],
  },
  // Socket for Teensy 4.1 - 48 pins (24 per side), 14mm row spacing
  {
    type: 'socket_teensy41',
    pins: [
      { index: 0, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 1, role: 'signal', name: 'D0' },
      { index: 2, role: 'signal', name: 'D1' },
      { index: 3, role: 'signal', name: 'D2' },
      { index: 4, role: 'signal', name: 'D3' },
      { index: 5, role: 'signal', name: 'D4' },
      { index: 6, role: 'signal', name: 'D5' },
      { index: 7, role: 'signal', name: 'D6' },
      { index: 8, role: 'signal', name: 'D7' },
      { index: 9, role: 'signal', name: 'D8' },
      { index: 10, role: 'signal', name: 'D9' },
      { index: 11, role: 'signal', name: 'D10' },
      { index: 12, role: 'signal', name: 'D11' },
      { index: 13, role: 'signal', name: 'D12' },
      { index: 14, role: 'signal', name: 'D13' },
      { index: 15, role: 'vcc', name: '3.3V', voltage: 3.3 },
      { index: 16, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 17, role: 'vcc', name: 'Vin', voltage: VCC_VOLTAGE },
      { index: 18, role: 'signal', name: 'A9' },
      { index: 19, role: 'signal', name: 'A8' },
      { index: 20, role: 'signal', name: 'A7' },
      { index: 21, role: 'signal', name: 'A6' },
      { index: 22, role: 'signal', name: 'A5' },
      { index: 23, role: 'signal', name: 'A4' },
      { index: 24, role: 'signal', name: 'A3' },
      { index: 25, role: 'signal', name: 'A2' },
      { index: 26, role: 'signal', name: 'A1' },
      { index: 27, role: 'signal', name: 'A0' },
      { index: 28, role: 'signal', name: 'D14' },
      { index: 29, role: 'signal', name: 'D15' },
      { index: 30, role: 'signal', name: 'D16' },
      { index: 31, role: 'signal', name: 'D17' },
      { index: 32, role: 'signal', name: 'D18' },
      { index: 33, role: 'signal', name: 'D19' },
      { index: 34, role: 'signal', name: 'D20' },
      { index: 35, role: 'signal', name: 'D21' },
      { index: 36, role: 'signal', name: 'D22' },
      { index: 37, role: 'signal', name: 'D23' },
      { index: 38, role: 'signal', name: 'D24' },
      { index: 39, role: 'signal', name: 'D25' },
      { index: 40, role: 'signal', name: 'D26' },
      { index: 41, role: 'signal', name: 'D27' },
      { index: 42, role: 'signal', name: 'D28' },
      { index: 43, role: 'signal', name: 'D29' },
      { index: 44, role: 'signal', name: 'D30' },
      { index: 45, role: 'signal', name: 'D31' },
      { index: 46, role: 'signal', name: 'D32' },
      { index: 47, role: 'signal', name: 'D33' },
    ],
  },

  // === ICs ===
  {
    type: 'ic_dip14',
    pins: Array.from({ length: 14 }, (_, i) => ({
      index: i,
      role: i === 6 ? 'gnd' : i === 13 ? 'vcc' : 'signal',
      name: `${i + 1}`,
      ...(i === 6 ? { voltage: GND_VOLTAGE } : i === 13 ? { voltage: VCC_VOLTAGE } : {}),
    })) as ComponentPinout['pins'],
  },
  {
    type: 'ic_dip16',
    pins: Array.from({ length: 16 }, (_, i) => ({
      index: i,
      role: i === 7 ? 'gnd' : i === 15 ? 'vcc' : 'signal',
      name: `${i + 1}`,
      ...(i === 7 ? { voltage: GND_VOLTAGE } : i === 15 ? { voltage: VCC_VOLTAGE } : {}),
    })) as ComponentPinout['pins'],
  },

  // === USB CONNECTORS ===
  {
    type: 'connector_usb_b',
    pins: [
      { index: 0, role: 'vcc', name: 'VBUS', voltage: VCC_VOLTAGE },
      { index: 1, role: 'signal', name: 'D-' },
      { index: 2, role: 'signal', name: 'D+' },
      { index: 3, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
    ],
  },
  {
    type: 'connector_usb_mini',
    pins: [
      { index: 0, role: 'vcc', name: 'VBUS', voltage: VCC_VOLTAGE },
      { index: 1, role: 'signal', name: 'D-' },
      { index: 2, role: 'signal', name: 'D+' },
      { index: 3, role: 'nc', name: 'ID' },
      { index: 4, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
    ],
  },
  // USB-C breakout: 4-pin simplified (VBUS, D-, D+, GND)
  {
    type: 'connector_usb_c',
    pins: [
      { index: 0, role: 'vcc', name: 'VBUS', voltage: VCC_VOLTAGE },
      { index: 1, role: 'signal', name: 'D-' },
      { index: 2, role: 'signal', name: 'D+' },
      { index: 3, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
    ],
  },

  // === SWITCHES ===
  {
    type: 'switch_dpdt',
    pins: [
      { index: 0, role: 'signal', name: 'A1' },
      { index: 1, role: 'signal', name: 'A' },
      { index: 2, role: 'signal', name: 'A2' },
      { index: 3, role: 'signal', name: 'B1' },
      { index: 4, role: 'signal', name: 'B' },
      { index: 5, role: 'signal', name: 'B2' },
    ],
  },
  {
    type: 'switch_toggle_spdt',
    pins: [
      { index: 0, role: 'signal', name: '1' },
      { index: 1, role: 'signal', name: 'C' },
      { index: 2, role: 'signal', name: '2' },
    ],
  },

  // === ENCODERS ===
  // EC11: 5 pads - A, GND, B (encoder) + 2 mounting tabs
  {
    type: 'encoder_ec11',
    pins: [
      { index: 0, role: 'signal', name: 'A' },
      { index: 1, role: 'gnd', name: 'C', voltage: GND_VOLTAGE },
      { index: 2, role: 'signal', name: 'B' },
      { index: 3, role: 'nc', name: 'Mount1' }, // Mounting tab
      { index: 4, role: 'nc', name: 'Mount2' }, // Mounting tab
    ],
  },
  // EC11 with switch: 7 pads - A, GND, B + 2 mounts + 2 switch
  {
    type: 'encoder_ec11_switch',
    pins: [
      { index: 0, role: 'signal', name: 'A' },
      { index: 1, role: 'gnd', name: 'C', voltage: GND_VOLTAGE },
      { index: 2, role: 'signal', name: 'B' },
      { index: 3, role: 'nc', name: 'Mount1' }, // Mounting tab
      { index: 4, role: 'nc', name: 'Mount2' }, // Mounting tab
      { index: 5, role: 'signal', name: 'SW1' },
      { index: 6, role: 'signal', name: 'SW2' },
    ],
  },

  // === LED / DISPLAY SPECIAL ===
  {
    type: 'led_rgb_th',
    pins: [
      { index: 0, role: 'signal', name: 'R' },
      { index: 1, role: 'signal', name: 'G' },
      { index: 2, role: 'signal', name: 'B' },
      { index: 3, role: 'gnd', name: 'C', voltage: GND_VOLTAGE },
    ],
  },
  {
    type: 'led_ring_encoder',
    pins: [
      { index: 0, role: 'vcc', name: 'VCC', voltage: VCC_VOLTAGE },
      { index: 1, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 2, role: 'signal', name: 'DI' },
      { index: 3, role: 'signal', name: 'DO' },
    ],
  },
  {
    type: 'led_matrix_4x4_btn',
    pins: [
      { index: 0, role: 'vcc', name: 'VCC', voltage: VCC_VOLTAGE },
      { index: 1, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 2, role: 'signal', name: 'DI' },
      { index: 3, role: 'signal', name: 'DO' },
      { index: 4, role: 'signal', name: 'ROW1' },
      { index: 5, role: 'signal', name: 'ROW2' },
      { index: 6, role: 'signal', name: 'ROW3' },
      { index: 7, role: 'signal', name: 'ROW4' },
      { index: 8, role: 'signal', name: 'COL1' },
      { index: 9, role: 'signal', name: 'COL2' },
      { index: 10, role: 'signal', name: 'COL3' },
      { index: 11, role: 'signal', name: 'COL4' },
    ],
  },

  // === AUDIO JACK ===
  {
    type: 'jack_trrs_35mm',
    pins: [
      { index: 0, role: 'signal', name: 'Tip' },
      { index: 1, role: 'signal', name: 'Ring1' },
      { index: 2, role: 'signal', name: 'Ring2' },
      { index: 3, role: 'gnd', name: 'Sleeve', voltage: GND_VOLTAGE },
    ],
  },

  // === POTENTIOMETERS ===
  {
    type: 'pot_slide_45mm',
    pins: [
      { index: 0, role: 'signal', name: '1' },
      { index: 1, role: 'signal', name: 'W' },
      { index: 2, role: 'signal', name: '2' },
    ],
  },
  {
    type: 'fader_motorized_100mm',
    pins: [
      { index: 0, role: 'signal', name: '1' },
      { index: 1, role: 'signal', name: 'W' },
      { index: 2, role: 'signal', name: '2' },
      { index: 3, role: 'signal', name: 'M+' },
      { index: 4, role: 'signal', name: 'M-' },
    ],
  },

  // === FUSE ===
  {
    type: 'fuse_5x20',
    pins: [
      { index: 0, role: 'signal', name: '1' },
      { index: 1, role: 'signal', name: '2' },
    ],
  },

  // === DIP SWITCH ===
  {
    type: 'dip_switch_8',
    pins: [
      { index: 0, role: 'signal', name: '1' },
      { index: 1, role: 'signal', name: '2' },
      { index: 2, role: 'signal', name: '3' },
      { index: 3, role: 'signal', name: '4' },
      { index: 4, role: 'signal', name: '5' },
      { index: 5, role: 'signal', name: '6' },
      { index: 6, role: 'signal', name: '7' },
      { index: 7, role: 'signal', name: '8' },
      { index: 8, role: 'signal', name: 'C' },
      { index: 9, role: 'signal', name: 'C' },
      { index: 10, role: 'signal', name: 'C' },
      { index: 11, role: 'signal', name: 'C' },
      { index: 12, role: 'signal', name: 'C' },
      { index: 13, role: 'signal', name: 'C' },
      { index: 14, role: 'signal', name: 'C' },
      { index: 15, role: 'signal', name: 'C' },
    ],
  },

  // === I2C MODULES ===
  {
    type: 'driver_tb6612',
    pins: [
      { index: 0, role: 'vcc', name: 'VM', voltage: VCC_VOLTAGE },
      { index: 1, role: 'vcc', name: 'VCC', voltage: VCC_VOLTAGE },
      { index: 2, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 3, role: 'signal', name: 'AO1' },
      { index: 4, role: 'signal', name: 'AO2' },
      { index: 5, role: 'signal', name: 'BO1' },
      { index: 6, role: 'signal', name: 'BO2' },
      { index: 7, role: 'signal', name: 'AIN1' },
      { index: 8, role: 'signal', name: 'AIN2' },
      { index: 9, role: 'signal', name: 'BIN1' },
      { index: 10, role: 'signal', name: 'BIN2' },
      { index: 11, role: 'signal', name: 'PWMA' },
      { index: 12, role: 'signal', name: 'PWMB' },
      { index: 13, role: 'signal', name: 'STBY' },
    ],
  },
  {
    type: 'eeprom_24c256',
    pins: [
      { index: 0, role: 'signal', name: 'A0' },
      { index: 1, role: 'signal', name: 'A1' },
      { index: 2, role: 'signal', name: 'A2' },
      { index: 3, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 4, role: 'signal', name: 'SDA' },
      { index: 5, role: 'signal', name: 'SCL' },
      { index: 6, role: 'signal', name: 'WP' },
      { index: 7, role: 'vcc', name: 'VCC', voltage: VCC_VOLTAGE },
    ],
  },
  {
    type: 'imu_mpu6050',
    pins: [
      { index: 0, role: 'vcc', name: 'VCC', voltage: VCC_VOLTAGE },
      { index: 1, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 2, role: 'signal', name: 'SCL' },
      { index: 3, role: 'signal', name: 'SDA' },
      { index: 4, role: 'signal', name: 'XDA' },
      { index: 5, role: 'signal', name: 'XCL' },
      { index: 6, role: 'signal', name: 'AD0' },
      { index: 7, role: 'signal', name: 'INT' },
    ],
  },
  {
    type: 'touch_mpr121',
    pins: [
      { index: 0, role: 'vcc', name: '3V3', voltage: 3.3 },
      { index: 1, role: 'signal', name: 'IRQ' },
      { index: 2, role: 'signal', name: 'SCL' },
      { index: 3, role: 'signal', name: 'SDA' },
      { index: 4, role: 'signal', name: 'ADDR' },
      { index: 5, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 6, role: 'signal', name: 'E0' },
      { index: 7, role: 'signal', name: 'E1' },
      { index: 8, role: 'signal', name: 'E2' },
      { index: 9, role: 'signal', name: 'E3' },
      { index: 10, role: 'signal', name: 'E4' },
      { index: 11, role: 'signal', name: 'E5' },
      { index: 12, role: 'signal', name: 'E6' },
      { index: 13, role: 'signal', name: 'E7' },
      { index: 14, role: 'signal', name: 'E8' },
      { index: 15, role: 'signal', name: 'E9' },
      { index: 16, role: 'signal', name: 'E10' },
      { index: 17, role: 'signal', name: 'E11' },
    ],
  },

  // === ARDUINO UNO ===
  {
    type: 'mcu_arduino_uno',
    pins: [
      // Power header (left side, top to bottom)
      { index: 0, role: 'input', name: 'RESET' },
      { index: 1, role: 'vcc', name: '3V3', voltage: 3.3 },
      { index: 2, role: 'vcc', name: '5V', voltage: VCC_VOLTAGE },
      { index: 3, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 4, role: 'gnd', name: 'GND2', voltage: GND_VOLTAGE },
      { index: 5, role: 'vcc', name: 'VIN' },
      // Analog header (left side, bottom)
      { index: 6, role: 'signal', name: 'A0' },
      { index: 7, role: 'signal', name: 'A1' },
      { index: 8, role: 'signal', name: 'A2' },
      { index: 9, role: 'signal', name: 'A3' },
      { index: 10, role: 'signal', name: 'A4/SDA' },
      { index: 11, role: 'signal', name: 'A5/SCL' },
      // Digital header (right side, top to bottom)
      { index: 12, role: 'signal', name: 'D0/RX' },
      { index: 13, role: 'signal', name: 'D1/TX' },
      { index: 14, role: 'signal', name: 'D2' },
      { index: 15, role: 'signal', name: 'D3/PWM' },
      { index: 16, role: 'signal', name: 'D4' },
      { index: 17, role: 'signal', name: 'D5/PWM' },
      { index: 18, role: 'signal', name: 'D6/PWM' },
      { index: 19, role: 'signal', name: 'D7' },
      { index: 20, role: 'signal', name: 'D8' },
      { index: 21, role: 'signal', name: 'D9/PWM' },
      { index: 22, role: 'signal', name: 'D10/PWM/SS' },
      { index: 23, role: 'signal', name: 'D11/PWM/MOSI' },
      { index: 24, role: 'signal', name: 'D12/MISO' },
      { index: 25, role: 'signal', name: 'D13/SCK' },
      { index: 26, role: 'gnd', name: 'GND3', voltage: GND_VOLTAGE },
      { index: 27, role: 'signal', name: 'AREF' },
    ],
  },

  // === BATTERY HOLDERS ===
  {
    type: 'battery_cr2032',
    pins: [
      { index: 0, role: 'vcc', name: '+', voltage: 3 },
      { index: 1, role: 'gnd', name: '-', voltage: GND_VOLTAGE },
    ],
  },
  {
    type: 'battery_aa_holder',
    pins: [
      { index: 0, role: 'vcc', name: '+', voltage: 1.5 },
      { index: 1, role: 'gnd', name: '-', voltage: GND_VOLTAGE },
    ],
  },
  {
    type: 'battery_aaa_holder',
    pins: [
      { index: 0, role: 'vcc', name: '+', voltage: 1.5 },
      { index: 1, role: 'gnd', name: '-', voltage: GND_VOLTAGE },
    ],
  },
  {
    type: 'battery_9v_holder',
    pins: [
      { index: 0, role: 'vcc', name: '+', voltage: 9 },
      { index: 1, role: 'gnd', name: '-', voltage: GND_VOLTAGE },
    ],
  },
  {
    type: 'battery_2xaa_holder',
    pins: [
      { index: 0, role: 'vcc', name: '+', voltage: 3 },
      { index: 1, role: 'gnd', name: '-', voltage: GND_VOLTAGE },
    ],
  },
  {
    type: 'battery_4xaa_holder',
    pins: [
      { index: 0, role: 'vcc', name: '+', voltage: 6 },
      { index: 1, role: 'gnd', name: '-', voltage: GND_VOLTAGE },
    ],
  },

  // === BLUETOOTH MODULES ===
  {
    type: 'bt_hc05',
    pins: [
      { index: 0, role: 'enable', name: 'EN/KEY' },
      { index: 1, role: 'vcc', name: 'VCC', voltage: VCC_VOLTAGE },
      { index: 2, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 3, role: 'data', name: 'TXD' },
      { index: 4, role: 'data', name: 'RXD' },
      { index: 5, role: 'signal', name: 'STATE' },
    ],
  },
  {
    type: 'bt_hc06',
    pins: [
      { index: 0, role: 'vcc', name: 'VCC', voltage: VCC_VOLTAGE },
      { index: 1, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 2, role: 'data', name: 'TXD' },
      { index: 3, role: 'data', name: 'RXD' },
    ],
  },
  {
    type: 'bt_hm10',
    pins: [
      { index: 0, role: 'vcc', name: 'VCC', voltage: 3.3 },
      { index: 1, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 2, role: 'data', name: 'TXD' },
      { index: 3, role: 'data', name: 'RXD' },
    ],
  },
  {
    type: 'bt_rn42',
    pins: [
      { index: 0, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 1, role: 'signal', name: 'CTS' },
      { index: 2, role: 'vcc', name: 'VCC', voltage: 3.3 },
      { index: 3, role: 'data', name: 'TX' },
      { index: 4, role: 'data', name: 'RX' },
      { index: 5, role: 'signal', name: 'RTS' },
      { index: 6, role: 'signal', name: 'PIO2' },
      { index: 7, role: 'signal', name: 'PIO3' },
      { index: 8, role: 'signal', name: 'PIO4' },
      { index: 9, role: 'signal', name: 'PIO5' },
      { index: 10, role: 'signal', name: 'PIO6' },
      { index: 11, role: 'input', name: 'RESET' },
    ],
  },
  {
    type: 'bt_nrf52840',
    pins: [
      { index: 0, role: 'vcc', name: 'VDD', voltage: 3.3 },
      { index: 1, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 2, role: 'signal', name: 'P0.02' },
      { index: 3, role: 'signal', name: 'P0.03' },
      { index: 4, role: 'signal', name: 'P0.04' },
      { index: 5, role: 'signal', name: 'P0.05' },
      { index: 6, role: 'signal', name: 'P0.06' },
      { index: 7, role: 'signal', name: 'P0.07' },
      { index: 8, role: 'signal', name: 'P0.08' },
      { index: 9, role: 'signal', name: 'P0.09' },
      { index: 10, role: 'signal', name: 'P0.10' },
      { index: 11, role: 'signal', name: 'P0.11' },
      { index: 12, role: 'signal', name: 'P0.12' },
      { index: 13, role: 'signal', name: 'P0.13' },
      { index: 14, role: 'signal', name: 'P0.14' },
      { index: 15, role: 'signal', name: 'P0.15' },
      { index: 16, role: 'signal', name: 'P0.16' },
      { index: 17, role: 'signal', name: 'P0.17' },
      { index: 18, role: 'signal', name: 'P0.18' },
      { index: 19, role: 'signal', name: 'P0.19' },
      { index: 20, role: 'signal', name: 'P0.20' },
      { index: 21, role: 'signal', name: 'P0.21' },
      { index: 22, role: 'input', name: 'RESET' },
      { index: 23, role: 'gnd', name: 'GND2', voltage: GND_VOLTAGE },
    ],
  },

  // === SD CARD MODULES ===
  {
    type: 'sdcard_module',
    pins: [
      { index: 0, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 1, role: 'vcc', name: 'VCC', voltage: VCC_VOLTAGE },
      { index: 2, role: 'data', name: 'MISO' },
      { index: 3, role: 'data', name: 'MOSI' },
      { index: 4, role: 'clock', name: 'SCK' },
      { index: 5, role: 'enable', name: 'CS' },
    ],
  },
  {
    type: 'sdcard_micro_module',
    pins: [
      { index: 0, role: 'gnd', name: 'GND', voltage: GND_VOLTAGE },
      { index: 1, role: 'vcc', name: 'VCC', voltage: VCC_VOLTAGE },
      { index: 2, role: 'data', name: 'MISO' },
      { index: 3, role: 'data', name: 'MOSI' },
      { index: 4, role: 'clock', name: 'SCK' },
      { index: 5, role: 'enable', name: 'CS' },
    ],
  },
];

// =====================
// HELPERS
// =====================

/** Get pinout for a component type, returns null if unknown. */
export const getPinout = (type: string): ComponentPinout | null => {
  return PINOUT_DATABASE.find((p) => p.type === type) || null;
};

/** Get pin info by index. */
export const getPinInfo = (
  type: string,
  padIndex: number
): { role: PadRole; name: string; voltage?: number } | null => {
  const pinout = getPinout(type);
  if (!pinout) return null;
  const pin = pinout.pins.find((p) => p.index === padIndex);
  return pin ? { role: pin.role, name: pin.name, voltage: pin.voltage } : null;
};

/** Check if a pad is a power pin. */
export const isPowerPin = (type: string, padIndex: number): boolean => {
  const info = getPinInfo(type, padIndex);
  return info?.role === 'vcc';
};

/** Check if a pad is a ground pin. */
export const isGroundPin = (type: string, padIndex: number): boolean => {
  const info = getPinInfo(type, padIndex);
  return info?.role === 'gnd';
};

/** Generate a readable net name. */
export const generateNetName = (
  fromType: string,
  fromPad: number,
  toType: string,
  toPad: number,
  isPower: boolean,
  isGround: boolean
): string => {
  if (isPower) return 'VCC';
  if (isGround) return 'GND';

  const fromInfo = getPinInfo(fromType, fromPad);
  const toInfo = getPinInfo(toType, toPad);

  // Use pin names if available
  if (fromInfo?.name && toInfo?.name) {
    return `${fromInfo.name}_${toInfo.name}`;
  }

  // Fallback to component-based naming
  const fromShort = fromType.split('_')[0].toUpperCase();
  const toShort = toType.split('_')[0].toUpperCase();
  return `${fromShort}${fromPad + 1}_${toShort}${toPad + 1}`;
};

// =====================
// EXPANDED COMPONENT HELPERS
// =====================

type ExpandedComponent = {
  type: string;
  originalIndex: number;
  instanceIndex: number;
  expandedIndex: number;
};

/** Expand assembly components to individual instances with indices. */
const expandAssemblyComponents = (components: AssemblyComponent[]): ExpandedComponent[] => {
  const expanded: ExpandedComponent[] = [];
  let expandedIdx = 0;

  components.forEach((ac, origIdx) => {
    for (let i = 0; i < ac.quantity; i++) {
      expanded.push({
        type: ac.type,
        originalIndex: origIdx,
        instanceIndex: i,
        expandedIndex: expandedIdx++,
      });
    }
  });

  return expanded;
};

// =====================
// AUTO-DETECTION
// =====================

type DetectionResult = {
  connections: ConnectionDef[];
  stats: {
    powerConnections: number;
    groundConnections: number;
    signalConnections: number;
    unknownComponents: string[];
  };
};

/** Auto-detect common connections between components. */
export const autoDetectConnections = (
  assemblyComponents: AssemblyComponent[],
  existingConnections: ConnectionDef[] = []
): DetectionResult => {
  const expanded = expandAssemblyComponents(assemblyComponents);
  const newConnections: ConnectionDef[] = [];
  const stats = {
    powerConnections: 0,
    groundConnections: 0,
    signalConnections: 0,
    unknownComponents: [] as string[],
  };

  // Track which pads already have connections
  const connectedPads = new Set<string>();
  existingConnections.forEach((conn) => {
    connectedPads.add(`${conn.from.componentIndex}-${conn.from.padIndex}`);
    connectedPads.add(`${conn.to.componentIndex}-${conn.to.padIndex}`);
  });

  // Find all VCC and GND pins
  const vccPins: { compIdx: number; padIdx: number; voltage: number }[] = [];
  const gndPins: { compIdx: number; padIdx: number }[] = [];

  expanded.forEach((comp) => {
    const pinout = getPinout(comp.type);
    if (!pinout) {
      if (!stats.unknownComponents.includes(comp.type)) {
        stats.unknownComponents.push(comp.type);
      }
      return;
    }

    pinout.pins.forEach((pin) => {
      if (pin.role === 'vcc') {
        vccPins.push({
          compIdx: comp.expandedIndex,
          padIdx: pin.index,
          voltage: pin.voltage || 5,
        });
      } else if (pin.role === 'gnd') {
        gndPins.push({
          compIdx: comp.expandedIndex,
          padIdx: pin.index,
        });
      }
    });
  });

  // Create VCC rail connections (connect all VCC pins together)
  for (let i = 1; i < vccPins.length; i++) {
    const from = vccPins[0];
    const to = vccPins[i];
    const fromKey = `${from.compIdx}-${from.padIdx}`;
    const toKey = `${to.compIdx}-${to.padIdx}`;

    // Skip if already connected
    if (connectedPads.has(fromKey) && connectedPads.has(toKey)) continue;

    // Only connect same voltage levels
    if (from.voltage !== to.voltage) continue;

    newConnections.push({
      id: `auto_vcc_${i}_${Date.now()}`,
      from: { componentIndex: from.compIdx, padIndex: from.padIdx },
      to: { componentIndex: to.compIdx, padIndex: to.padIdx },
      netName: from.voltage === 3.3 ? '3V3' : 'VCC',
      isPower: true,
      autoDetected: true,
    });
    stats.powerConnections++;

    connectedPads.add(fromKey);
    connectedPads.add(toKey);
  }

  // Create GND rail connections (connect all GND pins together)
  for (let i = 1; i < gndPins.length; i++) {
    const from = gndPins[0];
    const to = gndPins[i];
    const fromKey = `${from.compIdx}-${from.padIdx}`;
    const toKey = `${to.compIdx}-${to.padIdx}`;

    // Skip if already connected
    if (connectedPads.has(fromKey) && connectedPads.has(toKey)) continue;

    newConnections.push({
      id: `auto_gnd_${i}_${Date.now()}`,
      from: { componentIndex: from.compIdx, padIndex: from.padIdx },
      to: { componentIndex: to.compIdx, padIndex: to.padIdx },
      netName: 'GND',
      isGround: true,
      autoDetected: true,
    });
    stats.groundConnections++;

    connectedPads.add(fromKey);
    connectedPads.add(toKey);
  }

  // Detect input → output connections based on roles
  const outputs: { compIdx: number; padIdx: number; type: string }[] = [];
  const inputs: { compIdx: number; padIdx: number; type: string }[] = [];

  expanded.forEach((comp) => {
    const pinout = getPinout(comp.type);
    if (!pinout) return;

    pinout.pins.forEach((pin) => {
      if (pin.role === 'output') {
        outputs.push({ compIdx: comp.expandedIndex, padIdx: pin.index, type: comp.type });
      } else if (pin.role === 'input' && pin.name !== 'RESET' && pin.name !== 'EN') {
        inputs.push({ compIdx: comp.expandedIndex, padIdx: pin.index, type: comp.type });
      }
    });
  });

  // Auto-connect pots/encoders to MCU analog inputs
  outputs.forEach((out) => {
    if (out.type.includes('pot') || out.type.includes('encoder')) {
      // Find first available analog input on an MCU
      const mcu = expanded.find((c) => c.type.includes('mcu') || c.type.includes('arduino'));
      if (mcu) {
        const mcuPinout = getPinout(mcu.type);
        if (mcuPinout) {
          const analogPin = mcuPinout.pins.find(
            (p) => p.name.startsWith('A') && p.role === 'signal'
          );
          if (analogPin) {
            const fromKey = `${out.compIdx}-${out.padIdx}`;
            const toKey = `${mcu.expandedIndex}-${analogPin.index}`;

            if (!connectedPads.has(fromKey) && !connectedPads.has(toKey)) {
              const netName = generateNetName(
                out.type,
                out.padIdx,
                mcu.type,
                analogPin.index,
                false,
                false
              );

              newConnections.push({
                id: `auto_sig_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                from: { componentIndex: out.compIdx, padIndex: out.padIdx },
                to: { componentIndex: mcu.expandedIndex, padIndex: analogPin.index },
                netName,
                autoDetected: true,
              });
              stats.signalConnections++;

              connectedPads.add(fromKey);
              connectedPads.add(toKey);
            }
          }
        }
      }
    }
  });

  return { connections: newConnections, stats };
};

/** Infer component role from type. */
export const inferComponentRole = (
  type: string
): 'input' | 'output' | 'power' | 'signal' | 'connector' => {
  const lower = type.toLowerCase();

  if (
    lower.includes('button') ||
    lower.includes('pot') ||
    lower.includes('encoder') ||
    lower.includes('switch') ||
    lower.includes('sensor')
  ) {
    return 'input';
  }
  if (
    lower.includes('led') ||
    lower.includes('display') ||
    lower.includes('speaker') ||
    lower.includes('buzzer')
  ) {
    return 'output';
  }
  if (lower.includes('barrel') || lower.includes('regulator')) {
    return 'power';
  }
  if (
    lower.includes('usb') ||
    lower.includes('jack') ||
    lower.includes('midi') ||
    lower.includes('connector') ||
    lower.includes('header')
  ) {
    return 'connector';
  }

  return 'signal';
};

/** Get all VCC pad indices for a component type. */
export const getVccPads = (type: string): number[] => {
  const pinout = getPinout(type);
  if (!pinout) return [];
  return pinout.pins.filter((p) => p.role === 'vcc').map((p) => p.index);
};

/** Get all GND pad indices for a component type. */
export const getGndPads = (type: string): number[] => {
  const pinout = getPinout(type);
  if (!pinout) return [];
  return pinout.pins.filter((p) => p.role === 'gnd').map((p) => p.index);
};

/** Get human-readable pad label for display. */
export const getPadLabel = (type: string, padIndex: number): string => {
  const info = getPinInfo(type, padIndex);
  if (info) {
    const roleIcon = getRoleIcon(info.role);
    return `${roleIcon} ${info.name}`;
  }

  // Fallback
  const fp = getFootprint(type);
  if (fp && padIndex < fp.pads.length) {
    return `P${padIndex + 1}`;
  }

  return `?${padIndex + 1}`;
};

/** Get icon for pad role. */
const getRoleIcon = (role: PadRole): string => {
  switch (role) {
    case 'vcc':
      return '⚡';
    case 'gnd':
      return '⏚';
    case 'data':
      return '📊';
    case 'clock':
      return '🕐';
    case 'output':
      return '→';
    case 'input':
      return '←';
    case 'nc':
      return '○';
    default:
      return '•';
  }
};
