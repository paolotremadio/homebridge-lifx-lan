
# Homebridge Lifx Lan 

## Intro
Simple control for Lifx Light over UDP / Lan

## Config
  
Example config.json:  
  
```json
{
  "accessories": [
    {
      "accessory": "LifxLan",
      "name": "Lifx bulb",
      "light": {
        "ip": "192.168.1.26",
        "mac": "d0:00:00:00:00:00"
      }
    }
  ]
}
```
