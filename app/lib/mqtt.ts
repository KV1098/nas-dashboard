import mqtt from 'mqtt';

// We use the same UUID topic we set in the ESP32 code!
const MQTT_BROKER = 'mqtt://broker.hivemq.com:1883';
const COMMAND_TOPIC = 'nas-control/f9e8a7c2-1b3d-4c5f-8a9b-0c1d2e3f4a5b/command';
const STATUS_TOPIC = 'nas-control/f9e8a7c2-1b3d-4c5f-8a9b-0c1d2e3f4a5b/status';

export async function publishCommand(action: string, secret: string) {
  return new Promise((resolve, reject) => {
    const client = mqtt.connect(MQTT_BROKER);
    
    client.on('connect', () => {
      client.publish(COMMAND_TOPIC, JSON.stringify({ action, secret }), (err) => {
        client.end();
        if (err) reject(err);
        else resolve(true);
      });
    });

    client.on('error', (err) => {
      client.end();
      reject(err);
    });
  });
}

export async function getStatus() {
  return new Promise((resolve, reject) => {
    const client = mqtt.connect(MQTT_BROKER);
    
    // Timeout if the broker is unreachable or no retained message exists
    const timeout = setTimeout(() => {
      client.end();
      resolve({ status: "offline" });
    }, 3000);

    client.on('connect', () => {
      // Subscribe to fetch the latest retained status message
      client.subscribe(STATUS_TOPIC);
    });

    client.on('message', (topic, message) => {
      if (topic === STATUS_TOPIC) {
        clearTimeout(timeout);
        client.end();
        try {
          resolve(JSON.parse(message.toString()));
        } catch (e) {
          resolve({ status: "error" });
        }
      }
    });

    client.on('error', (err) => {
      clearTimeout(timeout);
      client.end();
      reject(err);
    });
  });
}
