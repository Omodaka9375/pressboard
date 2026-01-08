import type { FootprintDefinition, Vec2 } from '../types';

/**
 * Component footprint library
 * All dimensions in mm, standard through-hole spacing
 * Heights are in mm, measured from board surface to top of component
 */

/**
 * Default component heights by type pattern (in mm).
 * Used when explicit height not specified.
 */
export const DEFAULT_HEIGHTS: Record<string, number> = {
  resistor: 2.5,
  capacitor: 8,
  led: 8.5,
  diode: 3,
  transistor: 5,
  mosfet: 5,
  header: 8.5,
  ic_dip: 3.5,
  opamp: 3.5,
  mux: 3.5,
  shift: 3.5,
  mcu: 12,
  switch: 6,
  button: 4.5,
  pot: 10,
  encoder: 12,
  joystick: 25,
  display: 12,
  led_matrix: 8,
  jack: 12,
  midi: 15,
  connector: 10,
  buzzer: 10,
  speaker: 15,
  regulator: 10,
  relay: 15,
  crystal: 5,
  sensor: 8,
  magnet: 0, // Magnets are flush/recessed
  default: 5,
};

/** Get default height for a component type. */
export const getDefaultHeight = (type: string): number => {
  for (const [pattern, height] of Object.entries(DEFAULT_HEIGHTS)) {
    if (type.includes(pattern)) return height;
  }
  return DEFAULT_HEIGHTS.default;
};

export const FOOTPRINTS: Record<string, FootprintDefinition> = {
  resistor_th: {
    type: 'resistor_th',
    name: 'Resistor (Through-Hole)',
    height: 2.5,
    pads: [
      { pos: [-5, 0], dia: 1.2 },
      { pos: [5, 0], dia: 1.2 },
    ],
    holes: [
      { pos: [-5, 0], dia: 0.8 },
      { pos: [5, 0], dia: 0.8 },
    ],
    outline: [
      [-4, -1],
      [4, -1],
      [4, 1],
      [-4, 1],
    ],
  },

  capacitor_th: {
    type: 'capacitor_th',
    name: 'Capacitor (Through-Hole)',
    height: 11, // Electrolytic capacitor
    contactHeight: 10, // Top of can
    pads: [
      { pos: [-2.5, 0], dia: 1.5 },
      { pos: [2.5, 0], dia: 1.5 },
    ],
    holes: [
      { pos: [-2.5, 0], dia: 0.9 },
      { pos: [2.5, 0], dia: 0.9 },
    ],
    outline: [
      [-3, -3],
      [3, -3],
      [3, 3],
      [-3, 3],
    ],
  },

  led_th: {
    type: 'led_th',
    name: 'LED 5mm (Through-Hole)',
    height: 8.5,
    contactHeight: 7, // Dome top
    pads: [
      { pos: [-1.27, 0], dia: 1.5 },
      { pos: [1.27, 0], dia: 1.5 },
    ],
    holes: [
      { pos: [-1.27, 0], dia: 0.9 },
      { pos: [1.27, 0], dia: 0.9 },
    ],
  },

  header_1x2: {
    type: 'header_1x2',
    name: 'Header 1x2 (2.54mm pitch)',
    height: 8.5,
    pads: [
      { pos: [0, 0], dia: 1.7, width: 1.7, height: 1.7 },
      { pos: [0, 2.54], dia: 1.7, width: 1.7, height: 1.7 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [0, 2.54], dia: 1.0 },
    ],
  },

  header_1x4: {
    type: 'header_1x4',
    name: 'Header 1x4 (2.54mm pitch)',
    pads: [
      { pos: [0, 0], dia: 1.7, width: 1.7, height: 1.7 },
      { pos: [0, 2.54], dia: 1.7, width: 1.7, height: 1.7 },
      { pos: [0, 5.08], dia: 1.7, width: 1.7, height: 1.7 },
      { pos: [0, 7.62], dia: 1.7, width: 1.7, height: 1.7 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [0, 2.54], dia: 1.0 },
      { pos: [0, 5.08], dia: 1.0 },
      { pos: [0, 7.62], dia: 1.0 },
    ],
  },

  header_1x6: {
    type: 'header_1x6',
    name: 'Header 1x6 (2.54mm pitch)',
    pads: [
      { pos: [0, 0], dia: 1.7, width: 1.7, height: 1.7 },
      { pos: [0, 2.54], dia: 1.7, width: 1.7, height: 1.7 },
      { pos: [0, 5.08], dia: 1.7, width: 1.7, height: 1.7 },
      { pos: [0, 7.62], dia: 1.7, width: 1.7, height: 1.7 },
      { pos: [0, 10.16], dia: 1.7, width: 1.7, height: 1.7 },
      { pos: [0, 12.7], dia: 1.7, width: 1.7, height: 1.7 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [0, 2.54], dia: 1.0 },
      { pos: [0, 5.08], dia: 1.0 },
      { pos: [0, 7.62], dia: 1.0 },
      { pos: [0, 10.16], dia: 1.0 },
      { pos: [0, 12.7], dia: 1.0 },
    ],
  },

  header_2x3: {
    type: 'header_2x3',
    name: 'Header 2x3 (2.54mm pitch)',
    pads: [
      { pos: [0, 0], dia: 1.7, width: 1.7, height: 1.7 },
      { pos: [2.54, 0], dia: 1.7, width: 1.7, height: 1.7 },
      { pos: [0, 2.54], dia: 1.7, width: 1.7, height: 1.7 },
      { pos: [2.54, 2.54], dia: 1.7, width: 1.7, height: 1.7 },
      { pos: [0, 5.08], dia: 1.7, width: 1.7, height: 1.7 },
      { pos: [2.54, 5.08], dia: 1.7, width: 1.7, height: 1.7 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [2.54, 0], dia: 1.0 },
      { pos: [0, 2.54], dia: 1.0 },
      { pos: [2.54, 2.54], dia: 1.0 },
      { pos: [0, 5.08], dia: 1.0 },
      { pos: [2.54, 5.08], dia: 1.0 },
    ],
  },

  header_2x5: {
    type: 'header_2x5',
    name: 'Header 2x5 (2.54mm pitch)',
    pads: Array.from({ length: 10 }, (_, i) => ({
      pos: [(i % 2) * 2.54, Math.floor(i / 2) * 2.54] as Vec2,
      dia: 1.7,
      width: 1.7,
      height: 1.7,
    })),
    holes: Array.from({ length: 10 }, (_, i) => ({
      pos: [(i % 2) * 2.54, Math.floor(i / 2) * 2.54] as Vec2,
      dia: 1.0,
    })),
  },

  switch_spst: {
    type: 'switch_spst',
    name: 'Switch SPST (Through-Hole)',
    pads: [
      { pos: [-2.5, 0], dia: 2.0 },
      { pos: [2.5, 0], dia: 2.0 },
    ],
    holes: [
      { pos: [-2.5, 0], dia: 1.2 },
      { pos: [2.5, 0], dia: 1.2 },
    ],
    outline: [
      [-3, -3],
      [3, -3],
      [3, 3],
      [-3, 3],
    ],
  },

  switch_spdt: {
    type: 'switch_spdt',
    name: 'Switch SPDT (Through-Hole)',
    pads: [
      { pos: [-2.54, 0], dia: 2.0 },
      { pos: [0, 0], dia: 2.0 },
      { pos: [2.54, 0], dia: 2.0 },
    ],
    holes: [
      { pos: [-2.54, 0], dia: 1.2 },
      { pos: [0, 0], dia: 1.2 },
      { pos: [2.54, 0], dia: 1.2 },
    ],
    outline: [
      [-4, -3],
      [4, -3],
      [4, 3],
      [-4, 3],
    ],
  },

  ic_dip8: {
    type: 'ic_dip8',
    name: 'IC DIP-8 (2.54mm pitch, 7.62mm row)',
    height: 3.5,
    contactHeight: 3, // Top of IC body
    pads: Array.from({ length: 8 }, (_, i) => ({
      pos: [i < 4 ? 0 : 7.62, (i % 4) * 2.54] as Vec2,
      dia: 1.7,
      width: 1.7,
      height: 1.7,
    })),
    holes: Array.from({ length: 8 }, (_, i) => ({
      pos: [i < 4 ? 0 : 7.62, (i % 4) * 2.54] as Vec2,
      dia: 0.9,
    })),
    outline: [
      [-1, -1],
      [8.62, -1],
      [8.62, 8.62],
      [-1, 8.62],
    ],
  },

  ic_dip14: {
    type: 'ic_dip14',
    name: 'IC DIP-14 (2.54mm pitch, 7.62mm row)',
    pads: Array.from({ length: 14 }, (_, i) => ({
      pos: [i < 7 ? 0 : 7.62, (i % 7) * 2.54] as Vec2,
      dia: 1.7,
      width: 1.7,
      height: 1.7,
    })),
    holes: Array.from({ length: 14 }, (_, i) => ({
      pos: [i < 7 ? 0 : 7.62, (i % 7) * 2.54] as Vec2,
      dia: 0.9,
    })),
    outline: [
      [-1, -1],
      [8.62, -1],
      [8.62, 16.78],
      [-1, 16.78],
    ],
  },

  ic_dip16: {
    type: 'ic_dip16',
    name: 'IC DIP-16 (2.54mm pitch, 7.62mm row)',
    pads: Array.from({ length: 16 }, (_, i) => ({
      pos: [i < 8 ? 0 : 7.62, (i % 8) * 2.54] as Vec2,
      dia: 1.7,
      width: 1.7,
      height: 1.7,
    })),
    holes: Array.from({ length: 16 }, (_, i) => ({
      pos: [i < 8 ? 0 : 7.62, (i % 8) * 2.54] as Vec2,
      dia: 0.9,
    })),
    outline: [
      [-1, -1],
      [8.62, -1],
      [8.62, 19.32],
      [-1, 19.32],
    ],
  },

  connector_barrel: {
    type: 'connector_barrel',
    name: 'Barrel Jack Connector',
    pads: [
      { pos: [0, 0], dia: 3.0 },
      { pos: [6, 0], dia: 3.0 },
      { pos: [3, 4.8], dia: 3.0 },
    ],
    holes: [
      { pos: [0, 0], dia: 2.0 },
      { pos: [6, 0], dia: 2.0 },
      { pos: [3, 4.8], dia: 2.0 },
    ],
    outline: [
      [-3, -3],
      [9, -3],
      [9, 7],
      [-3, 7],
    ],
  },

  connector_usb: {
    type: 'connector_usb',
    name: 'USB Type-A Connector',
    pads: [
      { pos: [0, 0], dia: 1.5 },
      { pos: [2.5, 0], dia: 1.5 },
      { pos: [5, 0], dia: 1.5 },
      { pos: [7.5, 0], dia: 1.5 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [2.5, 0], dia: 1.0 },
      { pos: [5, 0], dia: 1.0 },
      { pos: [7.5, 0], dia: 1.0 },
    ],
    outline: [
      [-2, -2],
      [9.5, -2],
      [9.5, 6],
      [-2, 6],
    ],
  },

  // MCUs
  mcu_attiny85: {
    type: 'mcu_attiny85',
    name: 'ATtiny85 DIP-8',
    pads: Array.from({ length: 8 }, (_, i) => ({
      pos: [i < 4 ? 0 : 7.62, (i % 4) * 2.54] as Vec2,
      dia: 1.7,
      width: 1.7,
      height: 1.7,
    })),
    holes: Array.from({ length: 8 }, (_, i) => ({
      pos: [i < 4 ? 0 : 7.62, (i % 4) * 2.54] as Vec2,
      dia: 0.9,
    })),
    outline: [
      [-1, -1],
      [8.62, -1],
      [8.62, 8.62],
      [-1, 8.62],
    ],
  },

  mcu_atmega328: {
    type: 'mcu_atmega328',
    name: 'ATmega328P DIP-28',
    pads: Array.from({ length: 28 }, (_, i) => ({
      pos: [i < 14 ? 0 : 7.62, (i % 14) * 2.54] as Vec2,
      dia: 1.7,
      width: 1.7,
      height: 1.7,
    })),
    holes: Array.from({ length: 28 }, (_, i) => ({
      pos: [i < 14 ? 0 : 7.62, (i % 14) * 2.54] as Vec2,
      dia: 0.9,
    })),
    outline: [
      [-1, -1],
      [8.62, -1],
      [8.62, 34.54],
      [-1, 34.54],
    ],
  },

  mcu_esp32_devkit: {
    type: 'mcu_esp32_devkit',
    name: 'ESP32 DevKit (30-pin)',
    pads: Array.from({ length: 30 }, (_, i) => ({
      pos: [i < 15 ? 0 : 22.86, (i % 15) * 2.54] as Vec2,
      dia: 1.7,
      width: 1.7,
      height: 1.7,
    })),
    holes: Array.from({ length: 30 }, (_, i) => ({
      pos: [i < 15 ? 0 : 22.86, (i % 15) * 2.54] as Vec2,
      dia: 1.0,
    })),
    outline: [
      [-2, -3],
      [24.86, -3],
      [24.86, 38.1],
      [-2, 38.1],
    ],
  },

  mcu_arduino_uno: {
    type: 'mcu_arduino_uno',
    name: 'Arduino Uno R3',
    height: 15,
    pads: [
      // Power header (8 pins)
      ...Array.from({ length: 8 }, (_, i) => ({
        pos: [0, i * 2.54] as Vec2,
        dia: 1.7,
        width: 1.7,
        height: 1.7,
      })),
      // Analog header (6 pins)
      ...Array.from({ length: 6 }, (_, i) => ({
        pos: [0, 20.32 + i * 2.54] as Vec2,
        dia: 1.7,
        width: 1.7,
        height: 1.7,
      })),
      // Digital header 0-7 (8 pins)
      ...Array.from({ length: 8 }, (_, i) => ({
        pos: [50.8, i * 2.54] as Vec2,
        dia: 1.7,
        width: 1.7,
        height: 1.7,
      })),
      // Digital header 8-13 (6 pins)
      ...Array.from({ length: 6 }, (_, i) => ({
        pos: [50.8, 20.32 + i * 2.54] as Vec2,
        dia: 1.7,
        width: 1.7,
        height: 1.7,
      })),
    ],
    holes: [
      // Mounting holes
      { pos: [2.54, 2.54], dia: 3.2 },
      { pos: [2.54, 50.8], dia: 3.2 },
      { pos: [48.26, 2.54], dia: 3.2 },
      { pos: [48.26, 35.56], dia: 3.2 },
    ],
    outline: [
      [-2, -5],
      [53.34, -5],
      [53.34, 68.58],
      [-2, 68.58],
    ],
  },

  mcu_arduino_nano: {
    type: 'mcu_arduino_nano',
    name: 'Arduino Nano (30-pin)',
    pads: Array.from({ length: 30 }, (_, i) => ({
      pos: [i < 15 ? 0 : 15.24, (i % 15) * 2.54] as Vec2,
      dia: 1.7,
      width: 1.7,
      height: 1.7,
    })),
    holes: Array.from({ length: 30 }, (_, i) => ({
      pos: [i < 15 ? 0 : 15.24, (i % 15) * 2.54] as Vec2,
      dia: 1.0,
    })),
    outline: [
      [-2, -3],
      [17.24, -3],
      [17.24, 38.1],
      [-2, 38.1],
    ],
  },

  mcu_raspberry_pico: {
    type: 'mcu_raspberry_pico',
    name: 'Raspberry Pi Pico (40-pin)',
    pads: Array.from({ length: 40 }, (_, i) => ({
      pos: [i < 20 ? 0 : 17.78, (i % 20) * 2.54] as Vec2,
      dia: 1.7,
      width: 1.7,
      height: 1.7,
    })),
    holes: Array.from({ length: 40 }, (_, i) => ({
      pos: [i < 20 ? 0 : 17.78, (i % 20) * 2.54] as Vec2,
      dia: 1.0,
    })),
    outline: [
      [-2, -3],
      [19.78, -3],
      [19.78, 51.56],
      [-2, 51.56],
    ],
  },

  mcu_daisy_seed: {
    type: 'mcu_daisy_seed',
    name: 'Electrosmith Daisy Seed (40-pin)',
    pads: Array.from({ length: 40 }, (_, i) => ({
      pos: [i < 20 ? 0 : 15.24, (i % 20) * 2.54] as Vec2,
      dia: 1.7,
      width: 1.7,
      height: 1.7,
    })),
    holes: Array.from({ length: 40 }, (_, i) => ({
      pos: [i < 20 ? 0 : 15.24, (i % 20) * 2.54] as Vec2,
      dia: 1.0,
    })),
    outline: [
      [-2, -3],
      [17.24, -3],
      [17.24, 51.56],
      [-2, 51.56],
    ],
  },

  mcu_teensy41: {
    type: 'mcu_teensy41',
    name: 'Teensy 4.1 (48-pin)',
    pads: Array.from({ length: 48 }, (_, i) => ({
      pos: [i < 24 ? 0 : 15.24, (i % 24) * 2.54] as Vec2,
      dia: 1.7,
      width: 1.7,
      height: 1.7,
    })),
    holes: Array.from({ length: 48 }, (_, i) => ({
      pos: [i < 24 ? 0 : 15.24, (i % 24) * 2.54] as Vec2,
      dia: 1.0,
    })),
    outline: [
      [-2, -3],
      [17.24, -3],
      [17.24, 62.5],
      [-2, 62.5],
    ],
  },

  mcu_pro_micro: {
    type: 'mcu_pro_micro',
    name: 'Arduino Pro Micro (24-pin)',
    pads: Array.from({ length: 24 }, (_, i) => ({
      pos: [i < 12 ? 0 : 15.24, (i % 12) * 2.54] as Vec2,
      dia: 1.7,
      width: 1.7,
      height: 1.7,
    })),
    holes: Array.from({ length: 24 }, (_, i) => ({
      pos: [i < 12 ? 0 : 15.24, (i % 12) * 2.54] as Vec2,
      dia: 1.0,
    })),
    outline: [
      [-2, -3],
      [17.24, -3],
      [17.24, 30.48],
      [-2, 30.48],
    ],
  },

  mcu_esp32_s3: {
    type: 'mcu_esp32_s3',
    name: 'ESP32-S3 DevKit (44-pin)',
    pads: Array.from({ length: 44 }, (_, i) => ({
      pos: [i < 22 ? 0 : 22.86, (i % 22) * 2.54] as Vec2,
      dia: 1.7,
      width: 1.7,
      height: 1.7,
    })),
    holes: Array.from({ length: 44 }, (_, i) => ({
      pos: [i < 22 ? 0 : 22.86, (i % 22) * 2.54] as Vec2,
      dia: 1.0,
    })),
    outline: [
      [-2, -3],
      [24.86, -3],
      [24.86, 56.4],
      [-2, 56.4],
    ],
  },

  // Bluetooth Modules
  bt_hc05: {
    type: 'bt_hc05',
    name: 'HC-05 Bluetooth Module',
    height: 5,
    pads: [
      { pos: [0, 0], dia: 1.7 },
      { pos: [0, 2.54], dia: 1.7 },
      { pos: [0, 5.08], dia: 1.7 },
      { pos: [0, 7.62], dia: 1.7 },
      { pos: [0, 10.16], dia: 1.7 },
      { pos: [0, 12.7], dia: 1.7 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [0, 2.54], dia: 1.0 },
      { pos: [0, 5.08], dia: 1.0 },
      { pos: [0, 7.62], dia: 1.0 },
      { pos: [0, 10.16], dia: 1.0 },
      { pos: [0, 12.7], dia: 1.0 },
    ],
    outline: [
      [-2, -3],
      [15, -3],
      [15, 36],
      [-2, 36],
    ],
  },

  bt_hc06: {
    type: 'bt_hc06',
    name: 'HC-06 Bluetooth Module',
    height: 5,
    pads: [
      { pos: [0, 0], dia: 1.7 },
      { pos: [0, 2.54], dia: 1.7 },
      { pos: [0, 5.08], dia: 1.7 },
      { pos: [0, 7.62], dia: 1.7 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [0, 2.54], dia: 1.0 },
      { pos: [0, 5.08], dia: 1.0 },
      { pos: [0, 7.62], dia: 1.0 },
    ],
    outline: [
      [-2, -3],
      [15, -3],
      [15, 36],
      [-2, 36],
    ],
  },

  bt_hm10: {
    type: 'bt_hm10',
    name: 'HM-10 BLE Module',
    height: 4,
    pads: [
      { pos: [0, 0], dia: 1.7 },
      { pos: [0, 2.54], dia: 1.7 },
      { pos: [0, 5.08], dia: 1.7 },
      { pos: [0, 7.62], dia: 1.7 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [0, 2.54], dia: 1.0 },
      { pos: [0, 5.08], dia: 1.0 },
      { pos: [0, 7.62], dia: 1.0 },
    ],
    outline: [
      [-2, -3],
      [15, -3],
      [15, 28],
      [-2, 28],
    ],
  },

  bt_rn42: {
    type: 'bt_rn42',
    name: 'RN-42 Bluetooth Module',
    height: 3,
    pads: Array.from({ length: 12 }, (_, i) => ({
      pos: [i < 6 ? 0 : 13.5, (i % 6) * 2.54] as Vec2,
      dia: 1.5,
      width: 1.5,
      height: 1.5,
    })),
    holes: Array.from({ length: 12 }, (_, i) => ({
      pos: [i < 6 ? 0 : 13.5, (i % 6) * 2.54] as Vec2,
      dia: 0.9,
    })),
    outline: [
      [-2, -2],
      [15.5, -2],
      [15.5, 26],
      [-2, 26],
    ],
  },

  bt_nrf52840: {
    type: 'bt_nrf52840',
    name: 'nRF52840 BLE Module',
    height: 4,
    pads: Array.from({ length: 24 }, (_, i) => ({
      pos: [i < 12 ? 0 : 15.24, (i % 12) * 2.54] as Vec2,
      dia: 1.7,
      width: 1.7,
      height: 1.7,
    })),
    holes: Array.from({ length: 24 }, (_, i) => ({
      pos: [i < 12 ? 0 : 15.24, (i % 12) * 2.54] as Vec2,
      dia: 1.0,
    })),
    outline: [
      [-2, -3],
      [17.24, -3],
      [17.24, 30.48],
      [-2, 30.48],
    ],
  },

  // SD Card Modules
  sdcard_module: {
    type: 'sdcard_module',
    name: 'SD Card Module (SPI)',
    height: 5,
    pads: [
      { pos: [0, 0], dia: 1.7 },
      { pos: [0, 2.54], dia: 1.7 },
      { pos: [0, 5.08], dia: 1.7 },
      { pos: [0, 7.62], dia: 1.7 },
      { pos: [0, 10.16], dia: 1.7 },
      { pos: [0, 12.7], dia: 1.7 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [0, 2.54], dia: 1.0 },
      { pos: [0, 5.08], dia: 1.0 },
      { pos: [0, 7.62], dia: 1.0 },
      { pos: [0, 10.16], dia: 1.0 },
      { pos: [0, 12.7], dia: 1.0 },
    ],
    outline: [
      [-2, -3],
      [24, -3],
      [24, 32],
      [-2, 32],
    ],
  },

  sdcard_micro_module: {
    type: 'sdcard_micro_module',
    name: 'MicroSD Card Module (SPI)',
    height: 4,
    pads: [
      { pos: [0, 0], dia: 1.7 },
      { pos: [0, 2.54], dia: 1.7 },
      { pos: [0, 5.08], dia: 1.7 },
      { pos: [0, 7.62], dia: 1.7 },
      { pos: [0, 10.16], dia: 1.7 },
      { pos: [0, 12.7], dia: 1.7 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [0, 2.54], dia: 1.0 },
      { pos: [0, 5.08], dia: 1.0 },
      { pos: [0, 7.62], dia: 1.0 },
      { pos: [0, 10.16], dia: 1.0 },
      { pos: [0, 12.7], dia: 1.0 },
    ],
    outline: [
      [-2, -3],
      [18, -3],
      [18, 22],
      [-2, 22],
    ],
  },

  // Audio Amplifiers
  amp_lm386: {
    type: 'amp_lm386',
    name: 'LM386 Audio Amp DIP-8',
    pads: Array.from({ length: 8 }, (_, i) => ({
      pos: [i < 4 ? 0 : 7.62, (i % 4) * 2.54] as Vec2,
      dia: 1.7,
      width: 1.7,
      height: 1.7,
    })),
    holes: Array.from({ length: 8 }, (_, i) => ({
      pos: [i < 4 ? 0 : 7.62, (i % 4) * 2.54] as Vec2,
      dia: 0.9,
    })),
    outline: [
      [-1, -1],
      [8.62, -1],
      [8.62, 8.62],
      [-1, 8.62],
    ],
  },

  amp_pam8403: {
    type: 'amp_pam8403',
    name: 'PAM8403 Module (3W Stereo)',
    pads: [
      { pos: [0, 0], dia: 1.7 },
      { pos: [0, 2.54], dia: 1.7 },
      { pos: [0, 5.08], dia: 1.7 },
      { pos: [0, 7.62], dia: 1.7 },
      { pos: [15, 0], dia: 1.7 },
      { pos: [15, 2.54], dia: 1.7 },
      { pos: [15, 5.08], dia: 1.7 },
      { pos: [15, 7.62], dia: 1.7 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [0, 2.54], dia: 1.0 },
      { pos: [0, 5.08], dia: 1.0 },
      { pos: [0, 7.62], dia: 1.0 },
      { pos: [15, 0], dia: 1.0 },
      { pos: [15, 2.54], dia: 1.0 },
      { pos: [15, 5.08], dia: 1.0 },
      { pos: [15, 7.62], dia: 1.0 },
    ],
    outline: [
      [-2, -2],
      [17, -2],
      [17, 10],
      [-2, 10],
    ],
  },

  amp_tda2030: {
    type: 'amp_tda2030',
    name: 'TDA2030 Audio Amp (TO-220)',
    pads: [
      { pos: [0, 0], dia: 1.7 },
      { pos: [1.77, 0], dia: 1.7 },
      { pos: [3.54, 0], dia: 1.7 },
      { pos: [5.31, 0], dia: 1.7 },
      { pos: [7.08, 0], dia: 1.7 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [1.77, 0], dia: 1.0 },
      { pos: [3.54, 0], dia: 1.0 },
      { pos: [5.31, 0], dia: 1.0 },
      { pos: [7.08, 0], dia: 1.0 },
    ],
    outline: [
      [-2, -2],
      [9, -2],
      [9, 8],
      [-2, 8],
    ],
  },

  // Audio Jacks
  jack_trs_35mm: {
    type: 'jack_trs_35mm',
    name: '3.5mm TRS Jack (Stereo)',
    pads: [
      { pos: [0, 0], dia: 2.0 },
      { pos: [5, 0], dia: 2.0 },
      { pos: [10, 0], dia: 2.0 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.2 },
      { pos: [5, 0], dia: 1.2 },
      { pos: [10, 0], dia: 1.2 },
    ],
    outline: [
      [-2, -3],
      [12, -3],
      [12, 6],
      [-2, 6],
    ],
  },

  jack_trrs_35mm: {
    type: 'jack_trrs_35mm',
    name: '3.5mm TRRS Jack (4-pole)',
    pads: [
      { pos: [0, 0], dia: 2.0 },
      { pos: [4, 0], dia: 2.0 },
      { pos: [8, 0], dia: 2.0 },
      { pos: [12, 0], dia: 2.0 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.2 },
      { pos: [4, 0], dia: 1.2 },
      { pos: [8, 0], dia: 1.2 },
      { pos: [12, 0], dia: 1.2 },
    ],
    outline: [
      [-2, -3],
      [14, -3],
      [14, 6],
      [-2, 6],
    ],
  },

  jack_trs_635mm: {
    type: 'jack_trs_635mm',
    name: '6.35mm TRS Jack (1/4" Stereo)',
    pads: [
      { pos: [0, 0], dia: 2.5 },
      { pos: [6, 0], dia: 2.5 },
      { pos: [12, 0], dia: 2.5 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.5 },
      { pos: [6, 0], dia: 1.5 },
      { pos: [12, 0], dia: 1.5 },
    ],
    outline: [
      [-3, -5],
      [15, -5],
      [15, 10],
      [-3, 10],
    ],
  },

  // MIDI Connectors
  midi_din5: {
    type: 'midi_din5',
    name: 'MIDI DIN-5 Connector',
    pads: [
      { pos: [0, 0], dia: 1.7 },
      { pos: [2.54, 2.54], dia: 1.7 },
      { pos: [5.08, 0], dia: 1.7 },
      { pos: [0, 5.08], dia: 1.7 },
      { pos: [5.08, 5.08], dia: 1.7 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [2.54, 2.54], dia: 1.0 },
      { pos: [5.08, 0], dia: 1.0 },
      { pos: [0, 5.08], dia: 1.0 },
      { pos: [5.08, 5.08], dia: 1.0 },
    ],
    outline: [
      [-3, -3],
      [8, -3],
      [8, 8],
      [-3, 8],
    ],
  },

  midi_trs_type_a: {
    type: 'midi_trs_type_a',
    name: 'MIDI TRS Type-A (3.5mm)',
    pads: [
      { pos: [0, 0], dia: 2.0 },
      { pos: [5, 0], dia: 2.0 },
      { pos: [10, 0], dia: 2.0 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.2 },
      { pos: [5, 0], dia: 1.2 },
      { pos: [10, 0], dia: 1.2 },
    ],
    outline: [
      [-2, -3],
      [12, -3],
      [12, 6],
      [-2, 6],
    ],
  },

  // Buttons
  button_6mm: {
    type: 'button_6mm',
    name: 'Tactile Button 6x6mm',
    pads: [
      { pos: [0, 0], dia: 1.5 },
      { pos: [6.5, 0], dia: 1.5 },
      { pos: [0, 4.5], dia: 1.5 },
      { pos: [6.5, 4.5], dia: 1.5 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [6.5, 0], dia: 1.0 },
      { pos: [0, 4.5], dia: 1.0 },
      { pos: [6.5, 4.5], dia: 1.0 },
    ],
    outline: [
      [-1, -1],
      [7.5, -1],
      [7.5, 5.5],
      [-1, 5.5],
    ],
  },

  button_12mm: {
    type: 'button_12mm',
    name: 'Tactile Button 12x12mm',
    pads: [
      { pos: [0, 0], dia: 1.5 },
      { pos: [6.5, 0], dia: 1.5 },
      { pos: [0, 8.5], dia: 1.5 },
      { pos: [6.5, 8.5], dia: 1.5 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [6.5, 0], dia: 1.0 },
      { pos: [0, 8.5], dia: 1.0 },
      { pos: [6.5, 8.5], dia: 1.0 },
    ],
    outline: [
      [-3, -2],
      [9.5, -2],
      [9.5, 10.5],
      [-3, 10.5],
    ],
  },

  button_arcade: {
    type: 'button_arcade',
    name: 'Arcade Button 24mm',
    pads: [
      { pos: [0, 0], dia: 2.0 },
      { pos: [4.8, 0], dia: 2.0 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.2 },
      { pos: [4.8, 0], dia: 1.2 },
    ],
    outline: [
      [-12, -12],
      [16.8, -12],
      [16.8, 12],
      [-12, 12],
    ],
  },

  // Potentiometers
  pot_9mm: {
    type: 'pot_9mm',
    name: 'Potentiometer 9mm (Alpha)',
    pads: [
      { pos: [0, 0], dia: 1.5 },
      { pos: [2.5, 0], dia: 1.5 },
      { pos: [5, 0], dia: 1.5 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [2.5, 0], dia: 1.0 },
      { pos: [5, 0], dia: 1.0 },
    ],
    outline: [
      [-2, -2],
      [7, -2],
      [7, 7],
      [-2, 7],
    ],
  },

  pot_16mm: {
    type: 'pot_16mm',
    name: 'Potentiometer 16mm',
    pads: [
      { pos: [0, 0], dia: 1.7 },
      { pos: [5, 0], dia: 1.7 },
      { pos: [10, 0], dia: 1.7 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.2 },
      { pos: [5, 0], dia: 1.2 },
      { pos: [10, 0], dia: 1.2 },
    ],
    outline: [
      [-3, -3],
      [13, -3],
      [13, 13],
      [-3, 13],
    ],
  },

  pot_slide_45mm: {
    type: 'pot_slide_45mm',
    name: 'Slide Potentiometer 45mm',
    pads: [
      { pos: [0, 0], dia: 1.5 },
      { pos: [2.5, 0], dia: 1.5 },
      { pos: [5, 0], dia: 1.5 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [2.5, 0], dia: 1.0 },
      { pos: [5, 0], dia: 1.0 },
    ],
    outline: [
      [-5, -3],
      [10, -3],
      [10, 42],
      [-5, 42],
    ],
  },

  // Encoders
  encoder_ec11: {
    type: 'encoder_ec11',
    name: 'Rotary Encoder EC11',
    pads: [
      { pos: [0, 0], dia: 1.5 },
      { pos: [2.5, 0], dia: 1.5 },
      { pos: [5, 0], dia: 1.5 },
      { pos: [0, 7], dia: 1.5 },
      { pos: [5, 7], dia: 1.5 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [2.5, 0], dia: 1.0 },
      { pos: [5, 0], dia: 1.0 },
      { pos: [0, 7], dia: 1.0 },
      { pos: [5, 7], dia: 1.0 },
    ],
    outline: [
      [-3, -2],
      [8, -2],
      [8, 9],
      [-3, 9],
    ],
  },

  encoder_ec11_switch: {
    type: 'encoder_ec11_switch',
    name: 'Rotary Encoder EC11 w/ Switch',
    pads: [
      { pos: [0, 0], dia: 1.5 },
      { pos: [2.5, 0], dia: 1.5 },
      { pos: [5, 0], dia: 1.5 },
      { pos: [0, 7], dia: 1.5 },
      { pos: [5, 7], dia: 1.5 },
      { pos: [-2.5, 3.5], dia: 1.5 },
      { pos: [7.5, 3.5], dia: 1.5 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [2.5, 0], dia: 1.0 },
      { pos: [5, 0], dia: 1.0 },
      { pos: [0, 7], dia: 1.0 },
      { pos: [5, 7], dia: 1.0 },
      { pos: [-2.5, 3.5], dia: 1.0 },
      { pos: [7.5, 3.5], dia: 1.0 },
    ],
    outline: [
      [-5, -2],
      [10, -2],
      [10, 9],
      [-5, 9],
    ],
  },

  // Displays
  display_oled_128x32: {
    type: 'display_oled_128x32',
    name: 'OLED Display 0.91" 128x32 I2C',
    pads: [
      { pos: [0, 0], dia: 1.7 },
      { pos: [2.54, 0], dia: 1.7 },
      { pos: [5.08, 0], dia: 1.7 },
      { pos: [7.62, 0], dia: 1.7 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [2.54, 0], dia: 1.0 },
      { pos: [5.08, 0], dia: 1.0 },
      { pos: [7.62, 0], dia: 1.0 },
    ],
    outline: [
      [-3, -2],
      [10.62, -2],
      [10.62, 12],
      [-3, 12],
    ],
  },

  display_oled_128x64: {
    type: 'display_oled_128x64',
    name: 'OLED Display 0.96" 128x64 I2C',
    pads: [
      { pos: [0, 0], dia: 1.7 },
      { pos: [2.54, 0], dia: 1.7 },
      { pos: [5.08, 0], dia: 1.7 },
      { pos: [7.62, 0], dia: 1.7 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [2.54, 0], dia: 1.0 },
      { pos: [5.08, 0], dia: 1.0 },
      { pos: [7.62, 0], dia: 1.0 },
    ],
    outline: [
      [-5, -2],
      [12.62, -2],
      [12.62, 25],
      [-5, 25],
    ],
  },

  display_oled_spi: {
    type: 'display_oled_spi',
    name: 'OLED Display 1.3" 128x64 SPI',
    pads: [
      { pos: [0, 0], dia: 1.7 },
      { pos: [2.54, 0], dia: 1.7 },
      { pos: [5.08, 0], dia: 1.7 },
      { pos: [7.62, 0], dia: 1.7 },
      { pos: [10.16, 0], dia: 1.7 },
      { pos: [12.7, 0], dia: 1.7 },
      { pos: [15.24, 0], dia: 1.7 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [2.54, 0], dia: 1.0 },
      { pos: [5.08, 0], dia: 1.0 },
      { pos: [7.62, 0], dia: 1.0 },
      { pos: [10.16, 0], dia: 1.0 },
      { pos: [12.7, 0], dia: 1.0 },
      { pos: [15.24, 0], dia: 1.0 },
    ],
    outline: [
      [-5, -2],
      [20.24, -2],
      [20.24, 30],
      [-5, 30],
    ],
  },

  // LED Matrix
  led_matrix_8x8: {
    type: 'led_matrix_8x8',
    name: 'LED Matrix 8x8 (MAX7219)',
    pads: [
      { pos: [0, 0], dia: 1.7 },
      { pos: [2.54, 0], dia: 1.7 },
      { pos: [5.08, 0], dia: 1.7 },
      { pos: [7.62, 0], dia: 1.7 },
      { pos: [10.16, 0], dia: 1.7 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [2.54, 0], dia: 1.0 },
      { pos: [5.08, 0], dia: 1.0 },
      { pos: [7.62, 0], dia: 1.0 },
      { pos: [10.16, 0], dia: 1.0 },
    ],
    outline: [
      [-2, -2],
      [34, -2],
      [34, 34],
      [-2, 34],
    ],
  },

  led_matrix_4x4_btn: {
    type: 'led_matrix_4x4_btn',
    name: 'LED Button Matrix 4x4 (16 buttons)',
    pads: Array.from({ length: 8 }, (_, i) => ({
      pos: [i * 2.54, 0] as Vec2,
      dia: 1.7,
    })),
    holes: Array.from({ length: 8 }, (_, i) => ({
      pos: [i * 2.54, 0] as Vec2,
      dia: 1.0,
    })),
    outline: [
      [-5, -5],
      [75, -5],
      [75, 75],
      [-5, 75],
    ],
  },

  led_neopixel_ring_16: {
    type: 'led_neopixel_ring_16',
    name: 'NeoPixel Ring 16 LED',
    pads: [
      { pos: [0, 0], dia: 1.7 },
      { pos: [2.54, 0], dia: 1.7 },
      { pos: [5.08, 0], dia: 1.7 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [2.54, 0], dia: 1.0 },
      { pos: [5.08, 0], dia: 1.0 },
    ],
    outline: [
      [-22, -22],
      [27, -22],
      [27, 22],
      [-22, 22],
    ],
  },

  led_ws2812_strip: {
    type: 'led_ws2812_strip',
    name: 'WS2812 LED Strip Header (3-pin)',
    pads: [
      { pos: [0, 0], dia: 1.7 },
      { pos: [2.54, 0], dia: 1.7 },
      { pos: [5.08, 0], dia: 1.7 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [2.54, 0], dia: 1.0 },
      { pos: [5.08, 0], dia: 1.0 },
    ],
    outline: [
      [-2, -2],
      [7.08, -2],
      [7.08, 4],
      [-2, 4],
    ],
  },

  // Additional Headers
  header_1x8: {
    type: 'header_1x8',
    name: 'Header 1x8 (2.54mm pitch)',
    pads: Array.from({ length: 8 }, (_, i) => ({
      pos: [0, i * 2.54] as Vec2,
      dia: 1.7,
    })),
    holes: Array.from({ length: 8 }, (_, i) => ({
      pos: [0, i * 2.54] as Vec2,
      dia: 1.0,
    })),
  },

  header_1x10: {
    type: 'header_1x10',
    name: 'Header 1x10 (2.54mm pitch)',
    pads: Array.from({ length: 10 }, (_, i) => ({
      pos: [0, i * 2.54] as Vec2,
      dia: 1.7,
    })),
    holes: Array.from({ length: 10 }, (_, i) => ({
      pos: [0, i * 2.54] as Vec2,
      dia: 1.0,
    })),
  },

  header_2x8: {
    type: 'header_2x8',
    name: 'Header 2x8 (2.54mm pitch)',
    pads: Array.from({ length: 16 }, (_, i) => ({
      pos: [(i % 2) * 2.54, Math.floor(i / 2) * 2.54] as Vec2,
      dia: 1.7,
    })),
    holes: Array.from({ length: 16 }, (_, i) => ({
      pos: [(i % 2) * 2.54, Math.floor(i / 2) * 2.54] as Vec2,
      dia: 1.0,
    })),
  },

  // Crystals & Oscillators
  crystal_hc49: {
    type: 'crystal_hc49',
    name: 'Crystal HC49 (8/16/20MHz)',
    pads: [
      { pos: [0, 0], dia: 1.5 },
      { pos: [4.88, 0], dia: 1.5 },
    ],
    holes: [
      { pos: [0, 0], dia: 0.8 },
      { pos: [4.88, 0], dia: 0.8 },
    ],
    outline: [
      [-2, -2.5],
      [6.88, -2.5],
      [6.88, 2.5],
      [-2, 2.5],
    ],
  },

  oscillator_dip8: {
    type: 'oscillator_dip8',
    name: 'Crystal Oscillator DIP-8',
    pads: Array.from({ length: 4 }, (_, i) => ({
      pos: [(i % 2) * 7.62, Math.floor(i / 2) * 5.08] as Vec2,
      dia: 1.7,
    })),
    holes: Array.from({ length: 4 }, (_, i) => ({
      pos: [(i % 2) * 7.62, Math.floor(i / 2) * 5.08] as Vec2,
      dia: 0.9,
    })),
    outline: [
      [-1, -1],
      [8.62, -1],
      [8.62, 6.08],
      [-1, 6.08],
    ],
  },

  // Voltage Regulators
  regulator_7805: {
    type: 'regulator_7805',
    name: '7805 Voltage Regulator (TO-220)',
    pads: [
      { pos: [0, 0], dia: 1.7 },
      { pos: [2.54, 0], dia: 1.7 },
      { pos: [5.08, 0], dia: 1.7 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [2.54, 0], dia: 1.0 },
      { pos: [5.08, 0], dia: 1.0 },
    ],
    outline: [
      [-2, -2],
      [7.08, -2],
      [7.08, 8],
      [-2, 8],
    ],
  },

  regulator_lm317: {
    type: 'regulator_lm317',
    name: 'LM317 Adjustable Regulator (TO-220)',
    pads: [
      { pos: [0, 0], dia: 1.7 },
      { pos: [2.54, 0], dia: 1.7 },
      { pos: [5.08, 0], dia: 1.7 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [2.54, 0], dia: 1.0 },
      { pos: [5.08, 0], dia: 1.0 },
    ],
    outline: [
      [-2, -2],
      [7.08, -2],
      [7.08, 8],
      [-2, 8],
    ],
  },

  regulator_ams1117: {
    type: 'regulator_ams1117',
    name: 'AMS1117 3.3V LDO (SOT-223 breakout)',
    pads: [
      { pos: [0, 0], dia: 1.7 },
      { pos: [2.54, 0], dia: 1.7 },
      { pos: [5.08, 0], dia: 1.7 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [2.54, 0], dia: 1.0 },
      { pos: [5.08, 0], dia: 1.0 },
    ],
    outline: [
      [-2, -2],
      [7.08, -2],
      [7.08, 5],
      [-2, 5],
    ],
  },

  // Op-Amps
  opamp_tl072: {
    type: 'opamp_tl072',
    name: 'TL072 Dual Op-Amp DIP-8',
    pads: Array.from({ length: 8 }, (_, i) => ({
      pos: [i < 4 ? 0 : 7.62, (i % 4) * 2.54] as Vec2,
      dia: 1.7,
    })),
    holes: Array.from({ length: 8 }, (_, i) => ({
      pos: [i < 4 ? 0 : 7.62, (i % 4) * 2.54] as Vec2,
      dia: 0.9,
    })),
    outline: [
      [-1, -1],
      [8.62, -1],
      [8.62, 8.62],
      [-1, 8.62],
    ],
  },

  opamp_lm358: {
    type: 'opamp_lm358',
    name: 'LM358 Dual Op-Amp DIP-8',
    pads: Array.from({ length: 8 }, (_, i) => ({
      pos: [i < 4 ? 0 : 7.62, (i % 4) * 2.54] as Vec2,
      dia: 1.7,
    })),
    holes: Array.from({ length: 8 }, (_, i) => ({
      pos: [i < 4 ? 0 : 7.62, (i % 4) * 2.54] as Vec2,
      dia: 0.9,
    })),
    outline: [
      [-1, -1],
      [8.62, -1],
      [8.62, 8.62],
      [-1, 8.62],
    ],
  },

  opamp_tl074: {
    type: 'opamp_tl074',
    name: 'TL074 Quad Op-Amp DIP-14',
    pads: Array.from({ length: 14 }, (_, i) => ({
      pos: [i < 7 ? 0 : 7.62, (i % 7) * 2.54] as Vec2,
      dia: 1.7,
    })),
    holes: Array.from({ length: 14 }, (_, i) => ({
      pos: [i < 7 ? 0 : 7.62, (i % 7) * 2.54] as Vec2,
      dia: 0.9,
    })),
    outline: [
      [-1, -1],
      [8.62, -1],
      [8.62, 16.78],
      [-1, 16.78],
    ],
  },

  // Diodes
  diode_1n4148: {
    type: 'diode_1n4148',
    name: 'Diode 1N4148 Signal',
    pads: [
      { pos: [0, 0], dia: 1.5 },
      { pos: [7.62, 0], dia: 1.5 },
    ],
    holes: [
      { pos: [0, 0], dia: 0.8 },
      { pos: [7.62, 0], dia: 0.8 },
    ],
    outline: [
      [1.5, -1],
      [6, -1],
      [6, 1],
      [1.5, 1],
    ],
  },

  diode_1n4001: {
    type: 'diode_1n4001',
    name: 'Diode 1N4001 Rectifier',
    pads: [
      { pos: [0, 0], dia: 1.8 },
      { pos: [10.16, 0], dia: 1.8 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [10.16, 0], dia: 1.0 },
    ],
    outline: [
      [2, -1.5],
      [8, -1.5],
      [8, 1.5],
      [2, 1.5],
    ],
  },

  diode_zener: {
    type: 'diode_zener',
    name: 'Zener Diode (5.1V)',
    pads: [
      { pos: [0, 0], dia: 1.5 },
      { pos: [7.62, 0], dia: 1.5 },
    ],
    holes: [
      { pos: [0, 0], dia: 0.8 },
      { pos: [7.62, 0], dia: 0.8 },
    ],
    outline: [
      [1.5, -1],
      [6, -1],
      [6, 1],
      [1.5, 1],
    ],
  },

  // Transistors
  transistor_npn: {
    type: 'transistor_npn',
    name: 'NPN Transistor (2N2222/BC547)',
    pads: [
      { pos: [0, 0], dia: 1.5 },
      { pos: [2.54, 0], dia: 1.5 },
      { pos: [5.08, 0], dia: 1.5 },
    ],
    holes: [
      { pos: [0, 0], dia: 0.8 },
      { pos: [2.54, 0], dia: 0.8 },
      { pos: [5.08, 0], dia: 0.8 },
    ],
    outline: [
      [-1, -2],
      [6.08, -2],
      [6.08, 3],
      [-1, 3],
    ],
  },

  transistor_pnp: {
    type: 'transistor_pnp',
    name: 'PNP Transistor (2N2907/BC557)',
    pads: [
      { pos: [0, 0], dia: 1.5 },
      { pos: [2.54, 0], dia: 1.5 },
      { pos: [5.08, 0], dia: 1.5 },
    ],
    holes: [
      { pos: [0, 0], dia: 0.8 },
      { pos: [2.54, 0], dia: 0.8 },
      { pos: [5.08, 0], dia: 0.8 },
    ],
    outline: [
      [-1, -2],
      [6.08, -2],
      [6.08, 3],
      [-1, 3],
    ],
  },

  mosfet_n_channel: {
    type: 'mosfet_n_channel',
    name: 'N-Channel MOSFET (IRF520/2N7000)',
    pads: [
      { pos: [0, 0], dia: 1.7 },
      { pos: [2.54, 0], dia: 1.7 },
      { pos: [5.08, 0], dia: 1.7 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [2.54, 0], dia: 1.0 },
      { pos: [5.08, 0], dia: 1.0 },
    ],
    outline: [
      [-2, -2],
      [7.08, -2],
      [7.08, 8],
      [-2, 8],
    ],
  },

  // Piezo & Audio
  piezo_27mm: {
    type: 'piezo_27mm',
    name: 'Piezo Disc 27mm (Drum Trigger)',
    pads: [
      { pos: [0, 0], dia: 2.0 },
      { pos: [5, 0], dia: 2.0 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [5, 0], dia: 1.0 },
    ],
    outline: [
      [-13.5, -13.5],
      [18.5, -13.5],
      [18.5, 13.5],
      [-13.5, 13.5],
    ],
  },

  piezo_35mm: {
    type: 'piezo_35mm',
    name: 'Piezo Disc 35mm (Drum Trigger)',
    pads: [
      { pos: [0, 0], dia: 2.0 },
      { pos: [5, 0], dia: 2.0 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [5, 0], dia: 1.0 },
    ],
    outline: [
      [-17.5, -17.5],
      [22.5, -17.5],
      [22.5, 17.5],
      [-17.5, 17.5],
    ],
  },

  buzzer_12mm: {
    type: 'buzzer_12mm',
    name: 'Piezo Buzzer 12mm',
    pads: [
      { pos: [0, 0], dia: 1.5 },
      { pos: [7.62, 0], dia: 1.5 },
    ],
    holes: [
      { pos: [0, 0], dia: 0.8 },
      { pos: [7.62, 0], dia: 0.8 },
    ],
    outline: [
      [-2, -6],
      [10, -6],
      [10, 6],
      [-2, 6],
    ],
  },

  speaker_28mm: {
    type: 'speaker_28mm',
    name: 'Speaker 28mm 8Ω',
    pads: [
      { pos: [0, 0], dia: 2.0 },
      { pos: [20, 0], dia: 2.0 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.2 },
      { pos: [20, 0], dia: 1.2 },
    ],
    outline: [
      [-4, -14],
      [24, -14],
      [24, 14],
      [-4, 14],
    ],
  },

  speaker_40mm: {
    type: 'speaker_40mm',
    name: 'Speaker 40mm 8Ω',
    pads: [
      { pos: [0, 0], dia: 2.0 },
      { pos: [30, 0], dia: 2.0 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.2 },
      { pos: [30, 0], dia: 1.2 },
    ],
    outline: [
      [-5, -20],
      [35, -20],
      [35, 20],
      [-5, 20],
    ],
  },

  // USB Connectors
  connector_usb_b: {
    type: 'connector_usb_b',
    name: 'USB Type-B Connector',
    pads: [
      { pos: [0, 0], dia: 1.5 },
      { pos: [2.5, 0], dia: 1.5 },
      { pos: [5, 0], dia: 1.5 },
      { pos: [7.5, 0], dia: 1.5 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [2.5, 0], dia: 1.0 },
      { pos: [5, 0], dia: 1.0 },
      { pos: [7.5, 0], dia: 1.0 },
    ],
    outline: [
      [-3, -2],
      [10.5, -2],
      [10.5, 14],
      [-3, 14],
    ],
  },

  connector_usb_mini: {
    type: 'connector_usb_mini',
    name: 'USB Mini-B Connector',
    pads: [
      { pos: [0, 0], dia: 1.2 },
      { pos: [1.6, 0], dia: 1.2 },
      { pos: [3.2, 0], dia: 1.2 },
      { pos: [4.8, 0], dia: 1.2 },
      { pos: [6.4, 0], dia: 1.2 },
    ],
    holes: [
      { pos: [0, 0], dia: 0.7 },
      { pos: [1.6, 0], dia: 0.7 },
      { pos: [3.2, 0], dia: 0.7 },
      { pos: [4.8, 0], dia: 0.7 },
      { pos: [6.4, 0], dia: 0.7 },
    ],
    outline: [
      [-2, -2],
      [8.4, -2],
      [8.4, 6],
      [-2, 6],
    ],
  },

  connector_usb_c: {
    type: 'connector_usb_c',
    name: 'USB Type-C Breakout',
    pads: [
      { pos: [0, 0], dia: 1.5 },
      { pos: [2.54, 0], dia: 1.5 },
      { pos: [5.08, 0], dia: 1.5 },
      { pos: [7.62, 0], dia: 1.5 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [2.54, 0], dia: 1.0 },
      { pos: [5.08, 0], dia: 1.0 },
      { pos: [7.62, 0], dia: 1.0 },
    ],
    outline: [
      [-2, -2],
      [9.62, -2],
      [9.62, 8],
      [-2, 8],
    ],
  },

  // SD Card
  sd_card_slot: {
    type: 'sd_card_slot',
    name: 'MicroSD Card Module',
    pads: [
      { pos: [0, 0], dia: 1.7 },
      { pos: [2.54, 0], dia: 1.7 },
      { pos: [5.08, 0], dia: 1.7 },
      { pos: [7.62, 0], dia: 1.7 },
      { pos: [10.16, 0], dia: 1.7 },
      { pos: [12.7, 0], dia: 1.7 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [2.54, 0], dia: 1.0 },
      { pos: [5.08, 0], dia: 1.0 },
      { pos: [7.62, 0], dia: 1.0 },
      { pos: [10.16, 0], dia: 1.0 },
      { pos: [12.7, 0], dia: 1.0 },
    ],
    outline: [
      [-3, -2],
      [15.7, -2],
      [15.7, 20],
      [-3, 20],
    ],
  },

  // Screw Terminals
  terminal_2p: {
    type: 'terminal_2p',
    name: 'Screw Terminal 2-pin (5mm)',
    pads: [
      { pos: [0, 0], dia: 2.0 },
      { pos: [5, 0], dia: 2.0 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.3 },
      { pos: [5, 0], dia: 1.3 },
    ],
    outline: [
      [-2.5, -4],
      [7.5, -4],
      [7.5, 6],
      [-2.5, 6],
    ],
  },

  terminal_3p: {
    type: 'terminal_3p',
    name: 'Screw Terminal 3-pin (5mm)',
    pads: [
      { pos: [0, 0], dia: 2.0 },
      { pos: [5, 0], dia: 2.0 },
      { pos: [10, 0], dia: 2.0 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.3 },
      { pos: [5, 0], dia: 1.3 },
      { pos: [10, 0], dia: 1.3 },
    ],
    outline: [
      [-2.5, -4],
      [12.5, -4],
      [12.5, 6],
      [-2.5, 6],
    ],
  },

  // Switches
  switch_dpdt: {
    type: 'switch_dpdt',
    name: 'Toggle Switch DPDT',
    pads: [
      { pos: [0, 0], dia: 1.8 },
      { pos: [0, 4.7], dia: 1.8 },
      { pos: [0, 9.4], dia: 1.8 },
      { pos: [4.7, 0], dia: 1.8 },
      { pos: [4.7, 4.7], dia: 1.8 },
      { pos: [4.7, 9.4], dia: 1.8 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [0, 4.7], dia: 1.0 },
      { pos: [0, 9.4], dia: 1.0 },
      { pos: [4.7, 0], dia: 1.0 },
      { pos: [4.7, 4.7], dia: 1.0 },
      { pos: [4.7, 9.4], dia: 1.0 },
    ],
    outline: [
      [-3, -3],
      [7.7, -3],
      [7.7, 12.4],
      [-3, 12.4],
    ],
  },

  switch_toggle_spdt: {
    type: 'switch_toggle_spdt',
    name: 'Toggle Switch SPDT (mini)',
    pads: [
      { pos: [0, 0], dia: 1.5 },
      { pos: [0, 2.54], dia: 1.5 },
      { pos: [0, 5.08], dia: 1.5 },
    ],
    holes: [
      { pos: [0, 0], dia: 0.9 },
      { pos: [0, 2.54], dia: 0.9 },
      { pos: [0, 5.08], dia: 0.9 },
    ],
    outline: [
      [-3, -2],
      [3, -2],
      [3, 7.08],
      [-3, 7.08],
    ],
  },

  // Joystick
  joystick_psp: {
    type: 'joystick_psp',
    name: 'Joystick Module (PSP style)',
    pads: [
      { pos: [0, 0], dia: 1.7 },
      { pos: [2.54, 0], dia: 1.7 },
      { pos: [5.08, 0], dia: 1.7 },
      { pos: [7.62, 0], dia: 1.7 },
      { pos: [10.16, 0], dia: 1.7 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [2.54, 0], dia: 1.0 },
      { pos: [5.08, 0], dia: 1.0 },
      { pos: [7.62, 0], dia: 1.0 },
      { pos: [10.16, 0], dia: 1.0 },
    ],
    outline: [
      [-5, -5],
      [15.16, -5],
      [15.16, 25],
      [-5, 25],
    ],
  },

  joystick_thumb: {
    type: 'joystick_thumb',
    name: 'Thumb Joystick (PS2 style)',
    pads: [
      { pos: [0, 0], dia: 1.7 },
      { pos: [2.54, 0], dia: 1.7 },
      { pos: [5.08, 0], dia: 1.7 },
      { pos: [7.62, 0], dia: 1.7 },
      { pos: [10.16, 0], dia: 1.7 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [2.54, 0], dia: 1.0 },
      { pos: [5.08, 0], dia: 1.0 },
      { pos: [7.62, 0], dia: 1.0 },
      { pos: [10.16, 0], dia: 1.0 },
    ],
    outline: [
      [-10, -15],
      [20.16, -15],
      [20.16, 25],
      [-10, 25],
    ],
  },

  // 7-Segment Display
  display_7seg_1digit: {
    type: 'display_7seg_1digit',
    name: '7-Segment Display 1-digit',
    pads: Array.from({ length: 10 }, (_, i) => ({
      pos: [(i % 5) * 2.54, Math.floor(i / 5) * 12.7] as Vec2,
      dia: 1.5,
    })),
    holes: Array.from({ length: 10 }, (_, i) => ({
      pos: [(i % 5) * 2.54, Math.floor(i / 5) * 12.7] as Vec2,
      dia: 0.8,
    })),
    outline: [
      [-2, -2],
      [12.16, -2],
      [12.16, 19],
      [-2, 19],
    ],
  },

  display_7seg_4digit: {
    type: 'display_7seg_4digit',
    name: '7-Segment Display 4-digit',
    pads: Array.from({ length: 12 }, (_, i) => ({
      pos: [i * 2.54, 0] as Vec2,
      dia: 1.5,
    })),
    holes: Array.from({ length: 12 }, (_, i) => ({
      pos: [i * 2.54, 0] as Vec2,
      dia: 0.8,
    })),
    outline: [
      [-2, -2],
      [30, -2],
      [30, 20],
      [-2, 20],
    ],
  },

  // Sensors
  photoresistor_ldr: {
    type: 'photoresistor_ldr',
    name: 'Photoresistor LDR',
    pads: [
      { pos: [0, 0], dia: 1.5 },
      { pos: [5, 0], dia: 1.5 },
    ],
    holes: [
      { pos: [0, 0], dia: 0.8 },
      { pos: [5, 0], dia: 0.8 },
    ],
    outline: [
      [-2.5, -5],
      [7.5, -5],
      [7.5, 5],
      [-2.5, 5],
    ],
  },

  thermistor_ntc: {
    type: 'thermistor_ntc',
    name: 'NTC Thermistor 10K',
    pads: [
      { pos: [0, 0], dia: 1.5 },
      { pos: [5.08, 0], dia: 1.5 },
    ],
    holes: [
      { pos: [0, 0], dia: 0.8 },
      { pos: [5.08, 0], dia: 0.8 },
    ],
    outline: [
      [0.5, -2],
      [4.58, -2],
      [4.58, 2],
      [0.5, 2],
    ],
  },

  // Fuse
  fuse_5x20: {
    type: 'fuse_5x20',
    name: 'Fuse Holder 5x20mm',
    pads: [
      { pos: [0, 0], dia: 2.0 },
      { pos: [22, 0], dia: 2.0 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.2 },
      { pos: [22, 0], dia: 1.2 },
    ],
    outline: [
      [-3, -4],
      [25, -4],
      [25, 4],
      [-3, 4],
    ],
  },

  // Relay
  relay_5v: {
    type: 'relay_5v',
    name: 'Relay Module 5V',
    pads: [
      { pos: [0, 0], dia: 1.7 },
      { pos: [2.54, 0], dia: 1.7 },
      { pos: [5.08, 0], dia: 1.7 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [2.54, 0], dia: 1.0 },
      { pos: [5.08, 0], dia: 1.0 },
    ],
    outline: [
      [-5, -5],
      [10.08, -5],
      [10.08, 25],
      [-5, 25],
    ],
  },

  // DAC/ADC chips
  dac_mcp4725: {
    type: 'dac_mcp4725',
    name: 'MCP4725 DAC Module (I2C)',
    pads: [
      { pos: [0, 0], dia: 1.7 },
      { pos: [2.54, 0], dia: 1.7 },
      { pos: [5.08, 0], dia: 1.7 },
      { pos: [7.62, 0], dia: 1.7 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [2.54, 0], dia: 1.0 },
      { pos: [5.08, 0], dia: 1.0 },
      { pos: [7.62, 0], dia: 1.0 },
    ],
    outline: [
      [-2, -2],
      [9.62, -2],
      [9.62, 12],
      [-2, 12],
    ],
  },

  adc_ads1115: {
    type: 'adc_ads1115',
    name: 'ADS1115 16-bit ADC Module',
    pads: [
      { pos: [0, 0], dia: 1.7 },
      { pos: [2.54, 0], dia: 1.7 },
      { pos: [5.08, 0], dia: 1.7 },
      { pos: [7.62, 0], dia: 1.7 },
      { pos: [10.16, 0], dia: 1.7 },
      { pos: [12.7, 0], dia: 1.7 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [2.54, 0], dia: 1.0 },
      { pos: [5.08, 0], dia: 1.0 },
      { pos: [7.62, 0], dia: 1.0 },
      { pos: [10.16, 0], dia: 1.0 },
      { pos: [12.7, 0], dia: 1.0 },
    ],
    outline: [
      [-2, -2],
      [14.7, -2],
      [14.7, 15],
      [-2, 15],
    ],
  },

  // Synth-specific
  vactrol: {
    type: 'vactrol',
    name: 'Vactrol/Optocoupler VTL5C',
    pads: [
      { pos: [0, 0], dia: 1.5 },
      { pos: [7.62, 0], dia: 1.5 },
      { pos: [0, 5.08], dia: 1.5 },
      { pos: [7.62, 5.08], dia: 1.5 },
    ],
    holes: [
      { pos: [0, 0], dia: 0.8 },
      { pos: [7.62, 0], dia: 0.8 },
      { pos: [0, 5.08], dia: 0.8 },
      { pos: [7.62, 5.08], dia: 0.8 },
    ],
    outline: [
      [-1, -1],
      [8.62, -1],
      [8.62, 6.08],
      [-1, 6.08],
    ],
  },

  cv_jack_35mm: {
    type: 'cv_jack_35mm',
    name: 'CV/Gate 3.5mm Jack (Eurorack)',
    pads: [
      { pos: [0, 0], dia: 2.0 },
      { pos: [5, 0], dia: 2.0 },
      { pos: [10, 0], dia: 2.0 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.2 },
      { pos: [5, 0], dia: 1.2 },
      { pos: [10, 0], dia: 1.2 },
    ],
    outline: [
      [-2, -3],
      [12, -3],
      [12, 6],
      [-2, 6],
    ],
  },

  // Multiplexer
  mux_cd4051: {
    type: 'mux_cd4051',
    name: 'CD4051 8-ch Analog Mux DIP-16',
    pads: Array.from({ length: 16 }, (_, i) => ({
      pos: [i < 8 ? 0 : 7.62, (i % 8) * 2.54] as Vec2,
      dia: 1.7,
    })),
    holes: Array.from({ length: 16 }, (_, i) => ({
      pos: [i < 8 ? 0 : 7.62, (i % 8) * 2.54] as Vec2,
      dia: 0.9,
    })),
    outline: [
      [-1, -1],
      [8.62, -1],
      [8.62, 19.32],
      [-1, 19.32],
    ],
  },

  mux_cd4067: {
    type: 'mux_cd4067',
    name: 'CD4067 16-ch Analog Mux DIP-24',
    pads: Array.from({ length: 24 }, (_, i) => ({
      pos: [i < 12 ? 0 : 7.62, (i % 12) * 2.54] as Vec2,
      dia: 1.7,
    })),
    holes: Array.from({ length: 24 }, (_, i) => ({
      pos: [i < 12 ? 0 : 7.62, (i % 12) * 2.54] as Vec2,
      dia: 0.9,
    })),
    outline: [
      [-1, -1],
      [8.62, -1],
      [8.62, 29.4],
      [-1, 29.4],
    ],
  },

  // Shift Register
  shift_74hc595: {
    type: 'shift_74hc595',
    name: '74HC595 Shift Register DIP-16',
    pads: Array.from({ length: 16 }, (_, i) => ({
      pos: [i < 8 ? 0 : 7.62, (i % 8) * 2.54] as Vec2,
      dia: 1.7,
    })),
    holes: Array.from({ length: 16 }, (_, i) => ({
      pos: [i < 8 ? 0 : 7.62, (i % 8) * 2.54] as Vec2,
      dia: 0.9,
    })),
    outline: [
      [-1, -1],
      [8.62, -1],
      [8.62, 19.32],
      [-1, 19.32],
    ],
  },

  shift_74hc165: {
    type: 'shift_74hc165',
    name: '74HC165 Shift Register (Input) DIP-16',
    pads: Array.from({ length: 16 }, (_, i) => ({
      pos: [i < 8 ? 0 : 7.62, (i % 8) * 2.54] as Vec2,
      dia: 1.7,
    })),
    holes: Array.from({ length: 16 }, (_, i) => ({
      pos: [i < 8 ? 0 : 7.62, (i % 8) * 2.54] as Vec2,
      dia: 0.9,
    })),
    outline: [
      [-1, -1],
      [8.62, -1],
      [8.62, 19.32],
      [-1, 19.32],
    ],
  },

  // Optocouplers (MIDI isolation)
  opto_6n138: {
    type: 'opto_6n138',
    name: '6N138 Optocoupler DIP-8 (MIDI)',
    pads: Array.from({ length: 8 }, (_, i) => ({
      pos: [i < 4 ? 0 : 7.62, (i % 4) * 2.54] as Vec2,
      dia: 1.7,
    })),
    holes: Array.from({ length: 8 }, (_, i) => ({
      pos: [i < 4 ? 0 : 7.62, (i % 4) * 2.54] as Vec2,
      dia: 0.9,
    })),
    outline: [
      [-1, -1],
      [8.62, -1],
      [8.62, 8.62],
      [-1, 8.62],
    ],
  },

  opto_pc817: {
    type: 'opto_pc817',
    name: 'PC817 Optocoupler DIP-4',
    pads: [
      { pos: [0, 0], dia: 1.5 },
      { pos: [0, 2.54], dia: 1.5 },
      { pos: [7.62, 0], dia: 1.5 },
      { pos: [7.62, 2.54], dia: 1.5 },
    ],
    holes: [
      { pos: [0, 0], dia: 0.9 },
      { pos: [0, 2.54], dia: 0.9 },
      { pos: [7.62, 0], dia: 0.9 },
      { pos: [7.62, 2.54], dia: 0.9 },
    ],
    outline: [
      [-1, -1],
      [8.62, -1],
      [8.62, 3.54],
      [-1, 3.54],
    ],
  },

  opto_4n35: {
    type: 'opto_4n35',
    name: '4N35 Optocoupler DIP-6',
    pads: Array.from({ length: 6 }, (_, i) => ({
      pos: [i < 3 ? 0 : 7.62, (i % 3) * 2.54] as Vec2,
      dia: 1.7,
    })),
    holes: Array.from({ length: 6 }, (_, i) => ({
      pos: [i < 3 ? 0 : 7.62, (i % 3) * 2.54] as Vec2,
      dia: 0.9,
    })),
    outline: [
      [-1, -1],
      [8.62, -1],
      [8.62, 6.08],
      [-1, 6.08],
    ],
  },

  // Drum pad specific
  fsr_round: {
    type: 'fsr_round',
    name: 'FSR Force Sensitive Resistor',
    pads: [
      { pos: [0, 0], dia: 1.7 },
      { pos: [5.08, 0], dia: 1.7 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [5.08, 0], dia: 1.0 },
    ],
    outline: [
      [-10, -20],
      [15, -20],
      [15, 5],
      [-10, 5],
    ],
  },

  // Velocity sensitive pad connector
  pad_connector_8: {
    type: 'pad_connector_8',
    name: 'Drum Pad Connector 8-pin',
    pads: Array.from({ length: 8 }, (_, i) => ({
      pos: [i * 2.54, 0] as Vec2,
      dia: 1.7,
    })),
    holes: Array.from({ length: 8 }, (_, i) => ({
      pos: [i * 2.54, 0] as Vec2,
      dia: 1.0,
    })),
    outline: [
      [-2, -3],
      [19.78, -3],
      [19.78, 5],
      [-2, 5],
    ],
  },

  // Expression pedal jack
  jack_expression: {
    type: 'jack_expression',
    name: 'Expression Pedal Jack (TRS)',
    pads: [
      { pos: [0, 0], dia: 2.0 },
      { pos: [5, 0], dia: 2.0 },
      { pos: [10, 0], dia: 2.0 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.2 },
      { pos: [5, 0], dia: 1.2 },
      { pos: [10, 0], dia: 1.2 },
    ],
    outline: [
      [-2, -3],
      [12, -3],
      [12, 6],
      [-2, 6],
    ],
  },

  // Sustain pedal jack
  jack_sustain: {
    type: 'jack_sustain',
    name: 'Sustain Pedal Jack (TS)',
    pads: [
      { pos: [0, 0], dia: 2.0 },
      { pos: [5, 0], dia: 2.0 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.2 },
      { pos: [5, 0], dia: 1.2 },
    ],
    outline: [
      [-2, -3],
      [7, -3],
      [7, 6],
      [-2, 6],
    ],
  },

  // Rotary switch (for program/bank select)
  rotary_switch_12pos: {
    type: 'rotary_switch_12pos',
    name: 'Rotary Switch 12-position',
    pads: Array.from({ length: 13 }, (_, i) => {
      if (i === 0) return { pos: [0, 0] as Vec2, dia: 2.0 }; // Common
      const angle = ((i - 1) / 12) * Math.PI * 2 - Math.PI / 2;
      return {
        pos: [8 + Math.cos(angle) * 6, 8 + Math.sin(angle) * 6] as Vec2,
        dia: 1.5,
      };
    }),
    holes: Array.from({ length: 13 }, (_, i) => {
      if (i === 0) return { pos: [0, 0] as Vec2, dia: 1.2 };
      const angle = ((i - 1) / 12) * Math.PI * 2 - Math.PI / 2;
      return {
        pos: [8 + Math.cos(angle) * 6, 8 + Math.sin(angle) * 6] as Vec2,
        dia: 0.9,
      };
    }),
    outline: [
      [-3, -3],
      [19, -3],
      [19, 19],
      [-3, 19],
    ],
  },

  // LED ring for encoder feedback
  led_ring_encoder: {
    type: 'led_ring_encoder',
    name: 'LED Ring for Encoder (11 LED)',
    pads: Array.from({ length: 12 }, (_, i) => ({
      pos: [i * 2.54, 0] as Vec2,
      dia: 1.5,
    })),
    holes: Array.from({ length: 12 }, (_, i) => ({
      pos: [i * 2.54, 0] as Vec2,
      dia: 0.8,
    })),
    outline: [
      [-2, -10],
      [30, -10],
      [30, 10],
      [-2, 10],
    ],
  },

  // RGB LED common cathode
  led_rgb_th: {
    type: 'led_rgb_th',
    name: 'RGB LED 5mm Common Cathode',
    pads: [
      { pos: [0, 0], dia: 1.5 },
      { pos: [2.54, 0], dia: 1.5 },
      { pos: [5.08, 0], dia: 1.5 },
      { pos: [7.62, 0], dia: 1.5 },
    ],
    holes: [
      { pos: [0, 0], dia: 0.9 },
      { pos: [2.54, 0], dia: 0.9 },
      { pos: [5.08, 0], dia: 0.9 },
      { pos: [7.62, 0], dia: 0.9 },
    ],
    outline: [
      [1, -2.5],
      [6.62, -2.5],
      [6.62, 2.5],
      [1, 2.5],
    ],
  },

  // DIP switch for configuration
  dip_switch_4: {
    type: 'dip_switch_4',
    name: 'DIP Switch 4-position',
    pads: Array.from({ length: 8 }, (_, i) => ({
      pos: [i < 4 ? 0 : 7.62, (i % 4) * 2.54] as Vec2,
      dia: 1.5,
    })),
    holes: Array.from({ length: 8 }, (_, i) => ({
      pos: [i < 4 ? 0 : 7.62, (i % 4) * 2.54] as Vec2,
      dia: 0.8,
    })),
    outline: [
      [-1, -1],
      [8.62, -1],
      [8.62, 8.62],
      [-1, 8.62],
    ],
  },

  dip_switch_8: {
    type: 'dip_switch_8',
    name: 'DIP Switch 8-position',
    pads: Array.from({ length: 16 }, (_, i) => ({
      pos: [i < 8 ? 0 : 7.62, (i % 8) * 2.54] as Vec2,
      dia: 1.5,
    })),
    holes: Array.from({ length: 16 }, (_, i) => ({
      pos: [i < 8 ? 0 : 7.62, (i % 8) * 2.54] as Vec2,
      dia: 0.8,
    })),
    outline: [
      [-1, -1],
      [8.62, -1],
      [8.62, 19.32],
      [-1, 19.32],
    ],
  },

  // I2C EEPROM for storing presets
  eeprom_24c256: {
    type: 'eeprom_24c256',
    name: '24C256 EEPROM DIP-8 (I2C)',
    pads: Array.from({ length: 8 }, (_, i) => ({
      pos: [i < 4 ? 0 : 7.62, (i % 4) * 2.54] as Vec2,
      dia: 1.7,
    })),
    holes: Array.from({ length: 8 }, (_, i) => ({
      pos: [i < 4 ? 0 : 7.62, (i % 4) * 2.54] as Vec2,
      dia: 0.9,
    })),
    outline: [
      [-1, -1],
      [8.62, -1],
      [8.62, 8.62],
      [-1, 8.62],
    ],
  },

  // Motor driver (for motorized faders)
  driver_tb6612: {
    type: 'driver_tb6612',
    name: 'TB6612 Motor Driver Module',
    pads: Array.from({ length: 16 }, (_, i) => ({
      pos: [(i % 8) * 2.54, Math.floor(i / 8) * 15.24] as Vec2,
      dia: 1.7,
    })),
    holes: Array.from({ length: 16 }, (_, i) => ({
      pos: [(i % 8) * 2.54, Math.floor(i / 8) * 15.24] as Vec2,
      dia: 1.0,
    })),
    outline: [
      [-2, -2],
      [20, -2],
      [20, 18],
      [-2, 18],
    ],
  },

  // Motorized fader
  fader_motorized_100mm: {
    type: 'fader_motorized_100mm',
    name: 'Motorized Fader 100mm',
    pads: [
      { pos: [0, 0], dia: 1.7 },
      { pos: [2.54, 0], dia: 1.7 },
      { pos: [5.08, 0], dia: 1.7 },
      { pos: [10, 0], dia: 1.7 },
      { pos: [12.54, 0], dia: 1.7 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.0 },
      { pos: [2.54, 0], dia: 1.0 },
      { pos: [5.08, 0], dia: 1.0 },
      { pos: [10, 0], dia: 1.0 },
      { pos: [12.54, 0], dia: 1.0 },
    ],
    outline: [
      [-5, -5],
      [18, -5],
      [18, 105],
      [-5, 105],
    ],
  },

  // Touch sensor
  touch_mpr121: {
    type: 'touch_mpr121',
    name: 'MPR121 Touch Sensor Module',
    pads: Array.from({ length: 8 }, (_, i) => ({
      pos: [i * 2.54, 0] as Vec2,
      dia: 1.7,
    })),
    holes: Array.from({ length: 8 }, (_, i) => ({
      pos: [i * 2.54, 0] as Vec2,
      dia: 1.0,
    })),
    outline: [
      [-2, -2],
      [20, -2],
      [20, 15],
      [-2, 15],
    ],
  },

  // Accelerometer/Gyro for motion control
  imu_mpu6050: {
    type: 'imu_mpu6050',
    name: 'MPU6050 IMU Module (I2C)',
    pads: Array.from({ length: 8 }, (_, i) => ({
      pos: [i * 2.54, 0] as Vec2,
      dia: 1.7,
    })),
    holes: Array.from({ length: 8 }, (_, i) => ({
      pos: [i * 2.54, 0] as Vec2,
      dia: 1.0,
    })),
    outline: [
      [-2, -2],
      [20, -2],
      [20, 16],
      [-2, 16],
    ],
  },

  // =====================
  // MAGNETS (for press-fit enclosures)
  // =====================

  // Round neodymium magnets - various sizes
  magnet_3x1: {
    type: 'magnet_3x1',
    name: 'Magnet 3mm × 1mm (Round)',
    pads: [],
    holes: [{ pos: [0, 0], dia: 3.1 }], // Slightly larger for press-fit
    outline: [
      [-2, -2],
      [2, -2],
      [2, 2],
      [-2, 2],
    ],
  },

  magnet_4x2: {
    type: 'magnet_4x2',
    name: 'Magnet 4mm × 2mm (Round)',
    pads: [],
    holes: [{ pos: [0, 0], dia: 4.1 }],
    outline: [
      [-2.5, -2.5],
      [2.5, -2.5],
      [2.5, 2.5],
      [-2.5, 2.5],
    ],
  },

  magnet_5x2: {
    type: 'magnet_5x2',
    name: 'Magnet 5mm × 2mm (Round)',
    pads: [],
    holes: [{ pos: [0, 0], dia: 5.1 }],
    outline: [
      [-3, -3],
      [3, -3],
      [3, 3],
      [-3, 3],
    ],
  },

  magnet_6x2: {
    type: 'magnet_6x2',
    name: 'Magnet 6mm × 2mm (Round)',
    pads: [],
    holes: [{ pos: [0, 0], dia: 6.1 }],
    outline: [
      [-3.5, -3.5],
      [3.5, -3.5],
      [3.5, 3.5],
      [-3.5, 3.5],
    ],
  },

  magnet_6x3: {
    type: 'magnet_6x3',
    name: 'Magnet 6mm × 3mm (Round)',
    pads: [],
    holes: [{ pos: [0, 0], dia: 6.1 }],
    outline: [
      [-3.5, -3.5],
      [3.5, -3.5],
      [3.5, 3.5],
      [-3.5, 3.5],
    ],
  },

  magnet_8x2: {
    type: 'magnet_8x2',
    name: 'Magnet 8mm × 2mm (Round)',
    pads: [],
    holes: [{ pos: [0, 0], dia: 8.1 }],
    outline: [
      [-4.5, -4.5],
      [4.5, -4.5],
      [4.5, 4.5],
      [-4.5, 4.5],
    ],
  },

  magnet_8x3: {
    type: 'magnet_8x3',
    name: 'Magnet 8mm × 3mm (Round)',
    pads: [],
    holes: [{ pos: [0, 0], dia: 8.1 }],
    outline: [
      [-4.5, -4.5],
      [4.5, -4.5],
      [4.5, 4.5],
      [-4.5, 4.5],
    ],
  },

  magnet_10x2: {
    type: 'magnet_10x2',
    name: 'Magnet 10mm × 2mm (Round)',
    pads: [],
    holes: [{ pos: [0, 0], dia: 10.1 }],
    outline: [
      [-5.5, -5.5],
      [5.5, -5.5],
      [5.5, 5.5],
      [-5.5, 5.5],
    ],
  },

  magnet_10x3: {
    type: 'magnet_10x3',
    name: 'Magnet 10mm × 3mm (Round)',
    pads: [],
    holes: [{ pos: [0, 0], dia: 10.1 }],
    outline: [
      [-5.5, -5.5],
      [5.5, -5.5],
      [5.5, 5.5],
      [-5.5, 5.5],
    ],
  },

  magnet_12x3: {
    type: 'magnet_12x3',
    name: 'Magnet 12mm × 3mm (Round)',
    pads: [],
    holes: [{ pos: [0, 0], dia: 12.1 }],
    outline: [
      [-6.5, -6.5],
      [6.5, -6.5],
      [6.5, 6.5],
      [-6.5, 6.5],
    ],
  },

  // Rectangular/Block magnets
  magnet_block_10x5x2: {
    type: 'magnet_block_10x5x2',
    name: 'Magnet Block 10×5×2mm',
    pads: [],
    holes: [{ pos: [0, 0], dia: 5.1 }], // Center hole for alignment
    outline: [
      [-5.1, -2.6],
      [5.1, -2.6],
      [5.1, 2.6],
      [-5.1, 2.6],
    ],
  },

  magnet_block_20x10x3: {
    type: 'magnet_block_20x10x3',
    name: 'Magnet Block 20×10×3mm',
    pads: [],
    holes: [{ pos: [0, 0], dia: 6.0 }],
    outline: [
      [-10.1, -5.1],
      [10.1, -5.1],
      [10.1, 5.1],
      [-10.1, 5.1],
    ],
  },

  // Ring magnets (with center hole)
  magnet_ring_10x5x2: {
    type: 'magnet_ring_10x5x2',
    name: 'Magnet Ring 10mm OD × 5mm ID × 2mm',
    pads: [],
    holes: [{ pos: [0, 0], dia: 10.1 }], // Outer recess
    outline: [
      [-5.5, -5.5],
      [5.5, -5.5],
      [5.5, 5.5],
      [-5.5, 5.5],
    ],
  },

  magnet_ring_12x6x3: {
    type: 'magnet_ring_12x6x3',
    name: 'Magnet Ring 12mm OD × 6mm ID × 3mm',
    pads: [],
    holes: [{ pos: [0, 0], dia: 12.1 }],
    outline: [
      [-6.5, -6.5],
      [6.5, -6.5],
      [6.5, 6.5],
      [-6.5, 6.5],
    ],
  },

  // Countersunk magnets (for screw mounting)
  magnet_countersunk_10x3: {
    type: 'magnet_countersunk_10x3',
    name: 'Magnet Countersunk 10mm × 3mm (M3)',
    pads: [],
    holes: [
      { pos: [0, 0], dia: 10.1 }, // Magnet recess
    ],
    outline: [
      [-5.5, -5.5],
      [5.5, -5.5],
      [5.5, 5.5],
      [-5.5, 5.5],
    ],
  },

  magnet_countersunk_12x4: {
    type: 'magnet_countersunk_12x4',
    name: 'Magnet Countersunk 12mm × 4mm (M4)',
    pads: [],
    holes: [{ pos: [0, 0], dia: 12.1 }],
    outline: [
      [-6.5, -6.5],
      [6.5, -6.5],
      [6.5, 6.5],
      [-6.5, 6.5],
    ],
  },

  // Battery Holders
  battery_cr2032: {
    type: 'battery_cr2032',
    name: 'CR2032 Coin Cell Holder',
    height: 5,
    pads: [
      { pos: [0, 10], dia: 2.5 },
      { pos: [20, 10], dia: 2.5 },
    ],
    holes: [
      { pos: [0, 10], dia: 1.5 },
      { pos: [20, 10], dia: 1.5 },
    ],
    outline: [
      [-2, -2],
      [22, -2],
      [22, 22],
      [-2, 22],
    ],
  },

  battery_aa_holder: {
    type: 'battery_aa_holder',
    name: 'AA Battery Holder (Single)',
    height: 15,
    pads: [
      { pos: [0, 0], dia: 2.5 },
      { pos: [0, 52], dia: 2.5 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.5 },
      { pos: [0, 52], dia: 1.5 },
    ],
    outline: [
      [-10, -3],
      [10, -3],
      [10, 55],
      [-10, 55],
    ],
  },

  battery_aaa_holder: {
    type: 'battery_aaa_holder',
    name: 'AAA Battery Holder (Single)',
    height: 12,
    pads: [
      { pos: [0, 0], dia: 2.0 },
      { pos: [0, 46], dia: 2.0 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.2 },
      { pos: [0, 46], dia: 1.2 },
    ],
    outline: [
      [-7, -3],
      [7, -3],
      [7, 49],
      [-7, 49],
    ],
  },

  battery_9v_holder: {
    type: 'battery_9v_holder',
    name: '9V Battery Holder (Snap)',
    height: 25,
    pads: [
      { pos: [0, 0], dia: 2.5 },
      { pos: [13, 0], dia: 2.5 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.5 },
      { pos: [13, 0], dia: 1.5 },
    ],
    outline: [
      [-3, -5],
      [29, -5],
      [29, 50],
      [-3, 50],
    ],
  },

  battery_2xaa_holder: {
    type: 'battery_2xaa_holder',
    name: 'AA Battery Holder (2x Series)',
    height: 15,
    pads: [
      { pos: [0, 0], dia: 2.5 },
      { pos: [30, 0], dia: 2.5 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.5 },
      { pos: [30, 0], dia: 1.5 },
    ],
    outline: [
      [-10, -3],
      [40, -3],
      [40, 55],
      [-10, 55],
    ],
  },

  battery_4xaa_holder: {
    type: 'battery_4xaa_holder',
    name: 'AA Battery Holder (4x, 6V)',
    height: 15,
    pads: [
      { pos: [0, 0], dia: 2.5 },
      { pos: [60, 0], dia: 2.5 },
    ],
    holes: [
      { pos: [0, 0], dia: 1.5 },
      { pos: [60, 0], dia: 1.5 },
    ],
    outline: [
      [-10, -3],
      [70, -3],
      [70, 55],
      [-10, 55],
    ],
  },
};

export const getFootprint = (type: string): FootprintDefinition | undefined => {
  return FOOTPRINTS[type];
};

export const getAllFootprints = (): FootprintDefinition[] => {
  return Object.values(FOOTPRINTS);
};

/** Get component height with fallback to default. */
export const getComponentHeight = (type: string): number => {
  const fp = FOOTPRINTS[type];
  if (fp?.height !== undefined) return fp.height;
  return getDefaultHeight(type);
};

/** Get contact height (where pressure pad touches). */
export const getContactHeight = (type: string): number => {
  const fp = FOOTPRINTS[type];
  if (fp?.contactHeight !== undefined) return fp.contactHeight;
  // Default to component height
  return getComponentHeight(type);
};
