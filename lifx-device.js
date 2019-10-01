const Lifx = require('node-lifx-lan');
const debug = require('debug')('pt-lifx-device');

class LifxDevice {
  constructor({ light, logger }) {
    this.log = logger;

    this.device = null;

    this.lightConfig = {
      ip: light.ip,
      mac: light.mac,
    };

    this.detectDevice();
  }

  async detectDevice() {
    if (!this.device) {
      debug('Detecting device...');
      this.device = await Lifx.createDevice(this.lightConfig);
      debug('Device detected');
    } else {
      debug('Device already detected');
    }
  }

  async getLightStatus() {
    try {
      const { power } = await this.device.lightGet();
      return power === 1;
    } catch (e) {
      return 0;
    }
  }

  async setLightStatus(on) {
    if (!on) {
      return this.device.turnOff({ duration: 500 });
    }
    return this.device.turnOn({
      color: {
        hue: 0, saturation: 0, brightness: 1, kelvin: 3500,
      },
      duration: 500,
    });
  }
}

module.exports = LifxDevice;
