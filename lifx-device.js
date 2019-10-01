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

    this.autoDetectDevice();
    setInterval(() => this.autoDetectDevice(), 10 * 60 * 1000);
  }

  async autoDetectDevice() {
    try {
      debug('Re-discovering devices');
      await this.destroyDevice();
      await this.detectDevice();
    } catch (e) {
      this.log(`Error in discovering device: ${e}`);
    }
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

  async destroyDevice() {
    if (this.device) {
      debug('Destroying device...');
      await Lifx.destroy();
      this.device = null;
      debug('Device destroyed');
    }
  }

  async getLightStatus() {
    try {
      await this.detectDevice();
    } catch (e) {
      this.log(`Cannot detect device -- ${e.toString()}`);
    }

    try {
      const { power } = await this.device.lightGet();
      return power === 1;
    } catch (e) {
      return 0;
    }
  }

  async setLightStatus(on) {
    try {
      await this.detectDevice();
    } catch (e) {
      this.log(`Cannot detect device -- ${e.toString()}`);
    }

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
