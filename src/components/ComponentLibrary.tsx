import { useState } from 'react';
import { getAllFootprints } from '../data/footprints';
import { CategoryIcons, getComponentIcon } from '../data/componentIcons';
import type { FootprintDefinition } from '../types';

// Category map - categories will be sorted alphabetically when rendered
const CATEGORY_MAP: Record<string, string[]> = {
  'Audio Amps': ['amp_lm386', 'amp_pam8403', 'amp_tda2030'],
  'Audio Jacks': [
    'jack_trs_35mm',
    'jack_trrs_35mm',
    'jack_trs_635mm',
    'cv_jack_35mm',
    'jack_expression',
    'jack_sustain',
  ],
  Buttons: ['button_6mm', 'button_12mm', 'button_arcade'],
  Connectors: [
    'connector_barrel',
    'connector_usb',
    'connector_usb_b',
    'connector_usb_mini',
    'connector_usb_c',
    'terminal_2p',
    'terminal_3p',
    'sd_card_slot',
  ],
  Displays: [
    'display_oled_128x32',
    'display_oled_128x64',
    'display_oled_spi',
    'display_7seg_1digit',
    'display_7seg_4digit',
  ],
  'Drum/Pads': ['piezo_27mm', 'piezo_35mm', 'fsr_round', 'pad_connector_8'],
  Encoders: ['encoder_ec11', 'encoder_ec11_switch'],
  Headers: [
    'header_1x2',
    'header_1x4',
    'header_1x6',
    'header_1x8',
    'header_1x10',
    'header_2x3',
    'header_2x5',
    'header_2x8',
  ],
  ICs: ['ic_dip8', 'ic_dip14', 'ic_dip16'],
  Joysticks: ['joystick_psp', 'joystick_thumb'],
  'LED/Matrix': [
    'led_matrix_8x8',
    'led_matrix_4x4_btn',
    'led_neopixel_ring_16',
    'led_ws2812_strip',
    'led_ring_encoder',
    'led_rgb_th',
  ],
  Magnets: [
    'magnet_10x2',
    'magnet_10x3',
    'magnet_12x3',
    'magnet_3x1',
    'magnet_4x2',
    'magnet_5x2',
    'magnet_6x2',
    'magnet_6x3',
    'magnet_8x2',
    'magnet_8x3',
    'magnet_block_10x5x2',
    'magnet_block_20x10x3',
    'magnet_countersunk_10x3',
    'magnet_countersunk_12x4',
    'magnet_ring_10x5x2',
    'magnet_ring_12x6x3',
  ],
  MCUs: [
    'mcu_attiny85',
    'mcu_atmega328',
    'mcu_arduino_nano',
    'mcu_pro_micro',
    'mcu_esp32_devkit',
    'mcu_esp32_s3',
    'mcu_raspberry_pico',
    'mcu_daisy_seed',
    'mcu_teensy41',
  ],
  MIDI: ['midi_din5', 'midi_trs_type_a'],
  Motors: ['driver_tb6612'],
  'Mux/Shift': ['mux_cd4051', 'mux_cd4067', 'shift_74hc595', 'shift_74hc165'],
  'Op-Amps': ['opamp_tl072', 'opamp_lm358', 'opamp_tl074'],
  Passives: [
    'resistor_th',
    'capacitor_th',
    'led_th',
    'diode_1n4148',
    'diode_1n4001',
    'diode_zener',
  ],
  Potentiometers: ['pot_9mm', 'pot_16mm', 'pot_slide_45mm', 'fader_motorized_100mm'],
  Power: ['regulator_7805', 'regulator_lm317', 'regulator_ams1117', 'fuse_5x20', 'relay_5v'],
  Semiconductors: [
    'transistor_npn',
    'transistor_pnp',
    'mosfet_n_channel',
    'vactrol',
    'opto_6n138',
    'opto_pc817',
    'opto_4n35',
  ],
  Sensors: ['photoresistor_ldr', 'thermistor_ntc', 'touch_mpr121', 'imu_mpu6050'],
  'Speaker/Buzzer': ['buzzer_12mm', 'speaker_28mm', 'speaker_40mm'],
  Switches: [
    'switch_spst',
    'switch_spdt',
    'switch_dpdt',
    'switch_toggle_spdt',
    'dip_switch_4',
    'dip_switch_8',
    'rotary_switch_12pos',
  ],
  'Timing/ADC': ['crystal_hc49', 'oscillator_dip8', 'dac_mcp4725', 'adc_ads1115', 'eeprom_24c256'],
  'Audio DAC/ADC': [
    'audio_dac_pcm5102',
    'audio_dac_max98357',
    'audio_adc_pcm1808',
    'audio_codec_es8388',
    'audio_codec_wm8960',
  ],
};

type ComponentItemProps = {
  footprint: FootprintDefinition;
};

const ComponentItem = ({ footprint }: ComponentItemProps) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ type: footprint.type }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      style={{
        padding: '8px 10px',
        margin: '4px 0',
        background: 'var(--btn-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '4px',
        cursor: 'grab',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: 'var(--text-primary)',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center' }}>
        {getComponentIcon(footprint.type)}
      </span>
      <span>{footprint.name}</span>
    </div>
  );
};

const ComponentLibrary = () => {
  const footprints = getAllFootprints();
  const footprintMap = Object.fromEntries(footprints.map((f) => [f.type, f]));
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(
    Object.fromEntries(Object.keys(CATEGORY_MAP).map((k) => [k, true]))
  );
  const [searchQuery, setSearchQuery] = useState('');

  const toggleCategory = (category: string) => {
    setCollapsed((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  // Filter footprints by search query and sort categories alphabetically
  const normalizedQuery = searchQuery.toLowerCase().trim();
  const sortedCategories = Object.entries(CATEGORY_MAP).sort(([a], [b]) => a.localeCompare(b));
  const filteredCategories = sortedCategories
    .map(([category, types]) => {
      let filteredTypes = types;
      if (normalizedQuery) {
        filteredTypes = types.filter((type) => {
          const fp = footprintMap[type];
          if (!fp) return false;
          return (
            fp.name.toLowerCase().includes(normalizedQuery) ||
            fp.type.toLowerCase().includes(normalizedQuery) ||
            category.toLowerCase().includes(normalizedQuery)
          );
        });
      }
      // Sort alphabetically by component name
      const sortedTypes = [...filteredTypes].sort((a, b) => {
        const nameA = footprintMap[a]?.name || a;
        const nameB = footprintMap[b]?.name || b;
        return nameA.localeCompare(nameB);
      });
      return { category, types: sortedTypes };
    })
    .filter(({ types }) => types.length > 0);

  return (
    <div style={{ padding: '10px' }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--text-primary)' }}>
        Components
      </h3>
      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 10px 0' }}>
        Drag components onto canvas
      </p>

      {/* Search bar */}
      <div style={{ marginBottom: '12px' }}>
        <input
          type="text"
          placeholder="🔍 Search components..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 10px',
            fontSize: '12px',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            background: 'var(--btn-bg)',
            color: 'var(--text-primary)',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {filteredCategories.length === 0 && (
        <p
          style={{
            fontSize: '11px',
            color: 'var(--text-secondary)',
            textAlign: 'center',
            padding: '20px 0',
          }}
        >
          No components found for "{searchQuery}"
        </p>
      )}

      {filteredCategories.map(({ category, types }) => (
        <div key={category} style={{ marginBottom: '10px' }}>
          <h4
            onClick={() => toggleCategory(category)}
            style={{
              margin: '0 0 6px 0',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              userSelect: 'none',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                transition: 'transform 0.2s',
                transform:
                  collapsed[category] && !normalizedQuery ? 'rotate(-90deg)' : 'rotate(0deg)',
                fontSize: '10px',
              }}
            >
              ▼
            </span>
            <span style={{ display: 'flex', alignItems: 'center' }}>{CategoryIcons[category]}</span>
            {category}
            <span style={{ marginLeft: 'auto', fontSize: '10px', opacity: 0.6 }}>
              {types.length}
            </span>
          </h4>
          {(!collapsed[category] || normalizedQuery) &&
            types.map((type) => {
              const fp = footprintMap[type];
              return fp ? <ComponentItem key={type} footprint={fp} /> : null;
            })}
        </div>
      ))}
    </div>
  );
};

export default ComponentLibrary;
