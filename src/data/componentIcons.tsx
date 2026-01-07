import type { ReactElement } from 'react';
import type { FootprintDefinition } from '../types';

/** SVG icon components for component categories. */
export const CategoryIcons: Record<string, ReactElement> = {
  Passives: (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="6" y="9" width="12" height="6" rx="1" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
    </svg>
  ),
  Headers: (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="8" y="4" width="8" height="16" rx="1" />
      <circle cx="12" cy="7" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="17" r="1.5" fill="currentColor" />
    </svg>
  ),
  Buttons: (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="5" y="5" width="14" height="14" rx="2" />
      <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.3" />
    </svg>
  ),
  Switches: (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="4" y="8" width="16" height="8" rx="2" />
      <circle cx="15" cy="12" r="3" fill="currentColor" />
    </svg>
  ),
  Potentiometers: (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
      <line x1="12" y1="12" x2="12" y2="6" strokeWidth="2" />
    </svg>
  ),
  Encoders: (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 4 L14 8 L10 8 Z" fill="currentColor" />
    </svg>
  ),
  ICs: (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="6" y="4" width="12" height="16" rx="1" />
      <line x1="2" y1="7" x2="6" y2="7" />
      <line x1="2" y1="11" x2="6" y2="11" />
      <line x1="2" y1="15" x2="6" y2="15" />
      <line x1="18" y1="7" x2="22" y2="7" />
      <line x1="18" y1="11" x2="22" y2="11" />
      <line x1="18" y1="15" x2="22" y2="15" />
      <circle cx="9" cy="7" r="1" fill="currentColor" />
    </svg>
  ),
  MCUs: (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="5" y="3" width="14" height="18" rx="1" />
      <line x1="1" y1="6" x2="5" y2="6" />
      <line x1="1" y1="10" x2="5" y2="10" />
      <line x1="1" y1="14" x2="5" y2="14" />
      <line x1="1" y1="18" x2="5" y2="18" />
      <line x1="19" y1="6" x2="23" y2="6" />
      <line x1="19" y1="10" x2="23" y2="10" />
      <line x1="19" y1="14" x2="23" y2="14" />
      <line x1="19" y1="18" x2="23" y2="18" />
      <rect x="8" y="6" width="8" height="5" fill="currentColor" opacity="0.3" />
    </svg>
  ),
  Displays: (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="5" width="18" height="12" rx="1" />
      <rect x="5" y="7" width="14" height="8" fill="currentColor" opacity="0.2" />
      <line x1="8" y1="20" x2="16" y2="20" />
    </svg>
  ),
  'LED/Matrix': (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="4" y="4" width="16" height="16" rx="1" />
      <circle cx="8" cy="8" r="1.5" fill="#ff4444" />
      <circle cx="12" cy="8" r="1.5" fill="#44ff44" />
      <circle cx="16" cy="8" r="1.5" fill="#4444ff" />
      <circle cx="8" cy="12" r="1.5" fill="#ffff44" />
      <circle cx="12" cy="12" r="1.5" fill="#ff44ff" />
      <circle cx="16" cy="12" r="1.5" fill="#44ffff" />
      <circle cx="8" cy="16" r="1.5" fill="#ff8844" />
      <circle cx="12" cy="16" r="1.5" fill="#88ff44" />
      <circle cx="16" cy="16" r="1.5" fill="#4488ff" />
    </svg>
  ),
  'Audio Amps': (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="4" y="6" width="10" height="12" rx="1" />
      <path d="M14 10 L20 6 L20 18 L14 14 Z" fill="currentColor" opacity="0.3" />
      <circle cx="9" cy="12" r="2" />
    </svg>
  ),
  'Audio Jacks': (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="8" width="12" height="8" rx="2" />
      <circle cx="18" cy="12" r="3" />
      <line x1="15" y1="12" x2="21" y2="12" />
    </svg>
  ),
  MIDI: (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="8" cy="9" r="1.5" fill="currentColor" />
      <circle cx="16" cy="9" r="1.5" fill="currentColor" />
      <circle cx="6" cy="14" r="1.5" fill="currentColor" />
      <circle cx="12" cy="16" r="1.5" fill="currentColor" />
      <circle cx="18" cy="14" r="1.5" fill="currentColor" />
    </svg>
  ),
  Connectors: (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="4" y="7" width="16" height="10" rx="2" />
      <rect x="7" y="10" width="3" height="4" fill="currentColor" />
      <rect x="14" y="10" width="3" height="4" fill="currentColor" />
    </svg>
  ),
  Semiconductors: (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 4 L4 12 L12 20 L20 12 Z" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
  Joysticks: (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="16" r="6" />
      <circle cx="12" cy="16" r="2" fill="currentColor" />
      <line x1="12" y1="14" x2="12" y2="6" strokeWidth="3" />
      <circle cx="12" cy="5" r="2" fill="currentColor" />
    </svg>
  ),
  'Op-Amps': (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 4 L4 20 L20 12 Z" />
      <line x1="6" y1="8" x2="2" y2="8" />
      <line x1="6" y1="16" x2="2" y2="16" />
      <line x1="20" y1="12" x2="22" y2="12" />
    </svg>
  ),
  'Mux/Shift': (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="8" y="4" width="8" height="16" rx="1" />
      <line x1="2" y1="8" x2="8" y2="8" />
      <line x1="2" y1="12" x2="8" y2="12" />
      <line x1="2" y1="16" x2="8" y2="16" />
      <line x1="16" y1="12" x2="22" y2="12" />
    </svg>
  ),
  'Drum/Pads': (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  ),
  'Speaker/Buzzer': (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M6 9 L6 15 L10 15 L15 19 L15 5 L10 9 Z" fill="currentColor" opacity="0.3" />
      <path d="M6 9 L6 15 L10 15 L15 19 L15 5 L10 9 Z" />
      <path d="M18 9 Q21 12 18 15" />
    </svg>
  ),
  Power: (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 2 L12 12" />
      <path d="M5 6 A9 9 0 1 0 19 6" />
    </svg>
  ),
  'Timing/ADC': (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="5" y="8" width="14" height="8" rx="1" />
      <path d="M8 8 L8 4" />
      <path d="M16 8 L16 4" />
      <path d="M12 16 L12 20" />
    </svg>
  ),
  Sensors: (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.3" />
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4 L12 2" />
      <path d="M12 22 L12 20" />
      <path d="M4 12 L2 12" />
      <path d="M22 12 L20 12" />
    </svg>
  ),
  Motors: (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <line x1="12" y1="12" x2="12" y2="9" />
      <line x1="3" y1="10" x2="6" y2="10" />
      <line x1="3" y1="14" x2="6" y2="14" />
      <line x1="18" y1="10" x2="21" y2="10" />
      <line x1="18" y1="14" x2="21" y2="14" />
    </svg>
  ),
  Magnets: (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M6 4 L6 14 A6 6 0 0 0 18 14 L18 4" />
      <rect x="4" y="2" width="4" height="4" fill="#e53935" stroke="#e53935" />
      <rect x="16" y="2" width="4" height="4" fill="#1e88e5" stroke="#1e88e5" />
      <path d="M12 20 L12 16" strokeDasharray="2 2" />
      <path d="M8 18 L16 18" strokeDasharray="2 2" />
    </svg>
  ),
};

/** Get icon for specific component type. */
export const getComponentIcon = (type: string): ReactElement => {
  // LEDs
  if (type === 'led_th') {
    return (
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 3 L12 8" />
        <ellipse cx="12" cy="13" rx="5" ry="6" fill="#ff4444" opacity="0.5" />
        <ellipse cx="12" cy="13" rx="5" ry="6" />
        <line x1="9" y1="19" x2="9" y2="22" />
        <line x1="15" y1="19" x2="15" y2="22" />
      </svg>
    );
  }

  // Resistor
  if (type === 'resistor_th') {
    return (
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="2" y1="12" x2="6" y2="12" />
        <rect x="6" y="9" width="12" height="6" rx="1" fill="#c4a484" />
        <rect x="6" y="9" width="12" height="6" rx="1" />
        <line x1="8" y1="9" x2="8" y2="15" stroke="#a52a2a" />
        <line x1="10" y1="9" x2="10" y2="15" stroke="#000" />
        <line x1="12" y1="9" x2="12" y2="15" stroke="#ffa500" />
        <line x1="18" y1="12" x2="22" y2="12" />
      </svg>
    );
  }

  // Capacitor
  if (type === 'capacitor_th') {
    return (
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="12" y1="2" x2="12" y2="8" />
        <line x1="12" y1="16" x2="12" y2="22" />
        <line x1="6" y1="8" x2="18" y2="8" strokeWidth="3" />
        <path d="M6 16 Q12 12 18 16" strokeWidth="3" fill="none" />
      </svg>
    );
  }

  // Headers
  if (type.startsWith('header_')) {
    return (
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="8" y="4" width="8" height="16" rx="1" fill="#333" />
        <circle cx="12" cy="7" r="1" fill="#b87333" />
        <circle cx="12" cy="12" r="1" fill="#b87333" />
        <circle cx="12" cy="17" r="1" fill="#b87333" />
      </svg>
    );
  }

  // MCUs
  if (type.startsWith('mcu_')) {
    return (
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="5" y="3" width="14" height="18" rx="1" fill="#1a1a1a" />
        <rect x="5" y="3" width="14" height="18" rx="1" />
        <line x1="2" y1="6" x2="5" y2="6" />
        <line x1="2" y1="10" x2="5" y2="10" />
        <line x1="2" y1="14" x2="5" y2="14" />
        <line x1="2" y1="18" x2="5" y2="18" />
        <line x1="19" y1="6" x2="22" y2="6" />
        <line x1="19" y1="10" x2="22" y2="10" />
        <line x1="19" y1="14" x2="22" y2="14" />
        <line x1="19" y1="18" x2="22" y2="18" />
        <rect x="8" y="6" width="8" height="4" fill="#444" rx="0.5" />
      </svg>
    );
  }

  // ICs
  if (type.startsWith('ic_') || type.startsWith('amp_')) {
    return (
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="6" y="5" width="12" height="14" rx="1" fill="#2d2d2d" />
        <rect x="6" y="5" width="12" height="14" rx="1" />
        <line x1="2" y1="8" x2="6" y2="8" />
        <line x1="2" y1="12" x2="6" y2="12" />
        <line x1="2" y1="16" x2="6" y2="16" />
        <line x1="18" y1="8" x2="22" y2="8" />
        <line x1="18" y1="12" x2="22" y2="12" />
        <line x1="18" y1="16" x2="22" y2="16" />
        <circle cx="9" cy="8" r="1" fill="#888" />
      </svg>
    );
  }

  // Audio jacks
  if (type.startsWith('jack_')) {
    return (
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="8" width="11" height="8" rx="2" fill="#1a1a1a" />
        <circle cx="18" cy="12" r="4" fill="#333" />
        <circle cx="18" cy="12" r="2" fill="#666" />
      </svg>
    );
  }

  // MIDI
  if (type.startsWith('midi_')) {
    return (
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="8" fill="#4a4a4a" />
        <circle cx="12" cy="12" r="8" />
        <circle cx="8" cy="10" r="1" fill="#b87333" />
        <circle cx="16" cy="10" r="1" fill="#b87333" />
        <circle cx="7" cy="14" r="1" fill="#b87333" />
        <circle cx="12" cy="15" r="1" fill="#b87333" />
        <circle cx="17" cy="14" r="1" fill="#b87333" />
      </svg>
    );
  }

  // Buttons
  if (type.startsWith('button_')) {
    return (
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="5" y="5" width="14" height="14" rx="2" fill="#444" />
        <circle cx="12" cy="12" r="4" fill="#666" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    );
  }

  // Potentiometers
  if (type.startsWith('pot_')) {
    const isSlide = type.includes('slide');
    if (isSlide) {
      return (
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="10" y="3" width="4" height="18" rx="1" fill="#3d3d3d" />
          <rect x="8" y="10" width="8" height="4" rx="1" fill="#666" />
        </svg>
      );
    }
    return (
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="8" fill="#3d3d3d" />
        <circle cx="12" cy="12" r="3" fill="#666" />
        <line x1="12" y1="12" x2="12" y2="6" strokeWidth="2" />
      </svg>
    );
  }

  // Encoders
  if (type.startsWith('encoder_')) {
    return (
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="8" fill="#3a3a3a" />
        <circle cx="12" cy="12" r="4" fill="#555" />
        <path d="M12 4 L14 7 L10 7 Z" fill="currentColor" />
      </svg>
    );
  }

  // Displays
  if (type.startsWith('display_')) {
    return (
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="5" width="18" height="14" rx="1" fill="#0a0a2a" />
        <rect x="5" y="7" width="14" height="10" fill="#001133" />
        <text x="12" y="14" fontSize="6" fill="#00aaff" textAnchor="middle">
          OLED
        </text>
      </svg>
    );
  }

  // LED Matrix
  if (
    type.startsWith('led_matrix') ||
    type.startsWith('led_neopixel') ||
    type.startsWith('led_ws2812')
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="4" y="4" width="16" height="16" rx="1" fill="#1a1a1a" />
        <circle cx="8" cy="8" r="1.5" fill="#ff0000" />
        <circle cx="12" cy="8" r="1.5" fill="#00ff00" />
        <circle cx="16" cy="8" r="1.5" fill="#0000ff" />
        <circle cx="8" cy="12" r="1.5" fill="#ffff00" />
        <circle cx="12" cy="12" r="1.5" fill="#ff00ff" />
        <circle cx="16" cy="12" r="1.5" fill="#00ffff" />
        <circle cx="8" cy="16" r="1.5" fill="#ff8800" />
        <circle cx="12" cy="16" r="1.5" fill="#88ff00" />
        <circle cx="16" cy="16" r="1.5" fill="#0088ff" />
      </svg>
    );
  }

  // Switches
  if (type.startsWith('switch_')) {
    return (
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="4" y="8" width="16" height="8" rx="2" fill="#666" />
        <circle cx="15" cy="12" r="3" fill="#333" />
      </svg>
    );
  }

  // Magnets
  if (type.startsWith('magnet_')) {
    // Ring magnet
    if (type.includes('ring')) {
      return (
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="8" fill="#b0b0b0" />
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="3" fill="#fff" stroke="currentColor" />
        </svg>
      );
    }
    // Block magnet
    if (type.includes('block')) {
      return (
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="4" y="8" width="16" height="8" rx="1" fill="#b0b0b0" />
          <rect x="4" y="8" width="8" height="8" fill="#e53935" opacity="0.5" />
          <rect x="12" y="8" width="8" height="8" fill="#1e88e5" opacity="0.5" />
          <rect x="4" y="8" width="16" height="8" rx="1" />
        </svg>
      );
    }
    // Default round magnet
    return (
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="8" fill="#b0b0b0" />
        <circle cx="12" cy="12" r="8" />
        <path d="M12 4 L12 12" stroke="#e53935" strokeWidth="3" />
        <path d="M12 12 L12 20" stroke="#1e88e5" strokeWidth="3" />
      </svg>
    );
  }

  // Connectors
  if (type.startsWith('connector_')) {
    if (type === 'connector_barrel') {
      return (
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="4" y="7" width="12" height="10" rx="2" fill="#333" />
          <circle cx="20" cy="12" r="3" fill="#555" />
          <circle cx="20" cy="12" r="1.5" fill="#222" />
        </svg>
      );
    }
    return (
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="4" y="8" width="16" height="8" rx="1" fill="#333" />
        <rect x="7" y="10" width="3" height="4" fill="#a0a0a0" />
        <rect x="14" y="10" width="3" height="4" fill="#a0a0a0" />
      </svg>
    );
  }

  // Default fallback - generate from footprint outline
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.3" />
    </svg>
  );
};

/** Generate icon from footprint definition. */
export const generateIconFromFootprint = (footprint: FootprintDefinition): ReactElement => {
  // Calculate bounds
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;

  if (footprint.outline && footprint.outline.length > 0) {
    footprint.outline.forEach(([x, y]) => {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    });
  } else {
    footprint.pads.forEach((pad) => {
      minX = Math.min(minX, pad.pos[0] - 2);
      maxX = Math.max(maxX, pad.pos[0] + 2);
      minY = Math.min(minY, pad.pos[1] - 2);
      maxY = Math.max(maxY, pad.pos[1] + 2);
    });
  }

  const width = maxX - minX;
  const height = maxY - minY;
  const scale = Math.min(20 / width, 20 / height);
  const offsetX = 12 - ((minX + maxX) / 2) * scale;
  const offsetY = 12 - ((minY + maxY) / 2) * scale;

  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      {/* Outline */}
      {footprint.outline && footprint.outline.length > 0 && (
        <path
          d={`M ${footprint.outline
            .map(
              ([x, y], i) => `${i === 0 ? '' : 'L '}${x * scale + offsetX} ${y * scale + offsetY}`
            )
            .join(' ')} Z`}
          fill="currentColor"
          opacity="0.2"
        />
      )}
      {/* Pads */}
      {footprint.pads.slice(0, 8).map((pad, i) => (
        <circle
          key={i}
          cx={pad.pos[0] * scale + offsetX}
          cy={pad.pos[1] * scale + offsetY}
          r={Math.max(1, (pad.dia || 1.5) * scale * 0.3)}
          fill="#b87333"
        />
      ))}
    </svg>
  );
};
