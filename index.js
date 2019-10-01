const pkginfo = require('./package');

const LifxDevice = require('./lifx-device');

let Service;
let Characteristic;

class LifxLan {
  constructor(log, config) {
    this.log = log;

    const {
      light,
      name,
    } = config;

    this.name = name;

    this.lifxDevice = new LifxDevice({
      light,
      logger: log,
    });
    this.createServices();
  }

  createServices() {
    this.accessoryInformationService = new Service.AccessoryInformation()
      .setCharacteristic(Characteristic.Name, this.name)
      .setCharacteristic(Characteristic.Manufacturer, pkginfo.author.name || pkginfo.author)
      .setCharacteristic(Characteristic.Model, 'LIFX Z')
      .setCharacteristic(Characteristic.SerialNumber, 'n/a')
      .setCharacteristic(Characteristic.FirmwareRevision, pkginfo.version)
      .setCharacteristic(Characteristic.HardwareRevision, pkginfo.version);

    this.bulb = new Service.Lightbulb(this.name);
    this.bulb
      .getCharacteristic(Characteristic.On)
      .on('get', async (callback) => {
        try {
          const status = await this.lifxDevice.getLightStatus();
          callback(null, status ? 1 : 0);
        } catch (e) {
          callback(e);
        }
      })
      .on('set', async (on, callback) => {
        try {
          await this.lifxDevice.setLightStatus(on);
          callback();
        } catch (e) {
          this.log(`Failed setting status - ${e}`);
          callback(e);
        }
      });

    setInterval(async () => {
      const status = await this.lifxDevice.getLightStatus();
      this.bulb
        .getCharacteristic(Characteristic.On)
        .updateValue(status ? 1 : 0);
    }, 1000);
  }

  getServices() {
    return [
      this.bulb,
      this.accessoryInformationService,
    ];
  }
}

module.exports = (homebridge) => {
  Service = homebridge.hap.Service; // eslint-disable-line
  Characteristic = homebridge.hap.Characteristic; // eslint-disable-line

  homebridge.registerAccessory('homebridge-lifx-lan', 'LifxLan', LifxLan);
};
