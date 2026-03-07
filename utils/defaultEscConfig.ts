import type { EepromLayoutKeys } from '~/src/eeprom';

export const DEFAULT_ESC_CONFIG: Record<string, number> = {
  NO_POLLING_START: 0,
  STUCK_ROTOR_PROTECTION: 0,
  STALL_PROTECTION: 0,
  USE_HALL_SENSORS: 0,
  INTERVAL_TELEMETRY: 0,
  VARIABLE_PWM_FREQUENCY: 0,
  COMPLEMENTARY_PWM: 0,
  AUTO_ADVANCE: 0,
  TIMING_ADVANCE: 27, // 15° (raw = (15 - (-10)) / 0.9375 = 26.67 ≈ 27)
  STARTUP_POWER: 100,
  MOTOR_KV: 55, // 2220 (raw = (2220 - 20) / 40 = 55)
  MOTOR_POLES: 14,
  BEEP_VOLUME: 5,
  PWM_FREQUENCY: 24, // 24kHz - 48kHz
  MAX_RAMP: 16, // 16.0% duty cycle per ms
  MINIMUM_DUTY_CYCLE: 2, // 2%
  LOW_VOLTAGE_CUTOFF: 0, // Off
  TEMPERATURE_LIMIT: 0, // DISABLED
  CURRENT_LIMIT: 0, // DISABLED
  LOW_VOLTAGE_THRESHOLD: 300,
  ABSOLUTE_VOLTAGE_CUTOFF: 0,
  CURRENT_P: 100,
  CURRENT_I: 0,
  CURRENT_D: 50,
  SINUSOIDAL_STARTUP: 0,
  SINE_MODE_RANGE: 15,
  SINE_MODE_POWER: 6,
  BRAKE_ON_STOP: 0, // Off
  RC_CAR_REVERSING: 0,
  BRAKE_STRENGTH: 10,
  RUNNING_BRAKE_LEVEL: 10,
  ACTIVE_BRAKE_POWER: 2, // 2% duty cycle
  SERVO_LOW_THRESHOLD: 128, // (1006 - 750) / 2 = 128
  SERVO_HIGH_THRESHOLD: 128, // (2006 - 1750) / 2 = 128
  SERVO_NEUTRAL: 128, // (1502 - 1374) / 1 = 128
  SERVO_DEAD_BAND: 50
};

export function applyDefaultEscConfig(escList: any[]) {
  for (const esc of escList) {
    (Object.keys(DEFAULT_ESC_CONFIG) as Array<keyof typeof DEFAULT_ESC_CONFIG>).forEach((key) => {
      esc.settings[key] = DEFAULT_ESC_CONFIG[key];
    });
    esc.settingsDirty = true;
  }
}
