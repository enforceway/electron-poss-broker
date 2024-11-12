import aedes from 'aedes';  // 创建 Aedes 实例
import net from 'net';  // TCP 服务器
// import http from 'http';  // HTTP 服务器
// import ws = require('websocket-stream');  // WebSocket 支持
// 配置 TCP 和 WebSocket 端口
const MQTT_PORT = 1883;
// const WS_PORT = 3000;

const aedesInstance = aedes();
// 创建一个 TCP 服务器用于处理 MQTT 连接
const mqttServer = net.createServer(aedesInstance.handle);

// 启动 MQTT 服务器
mqttServer.listen(MQTT_PORT, () => {
  console.log(`[MQTT Broker Service] Aedes MQTT broker is running on port ${MQTT_PORT}`);
});

// 创建 HTTP 服务器用于处理 WebSocket 连接
// const webSocketServer = http.createServer();
// ws.createServer({ server: webSocketServer }, aedesInstance.handle);

// 启动 WebSocket 服务器
// webSocketServer.listen(WS_PORT, () => {
//   console.log(`WebSocket broker is running on ws://localhost:${WS_PORT}`);
// });

// 监听连接事件
aedesInstance.on('client', (client, name1, name2, name4) => {
  console.log(`[MQTT Broker Service] Client connected: ${client.id}, ${client.name}, ${name1}, ${name2}, ${name4}`);
});

// 监听消息发布事件
aedesInstance.on('publish', (packet, client) => {
  if (client) {
    console.log(`[MQTT Broker Service] Message published by ${client.id}: ${packet.topic} -> ${packet.payload.toString()}`);
  } else {
    console.log(`[MQTT Broker Service] Message published by broker: ${packet.topic} -> ${packet.payload.toString()}`);
  }
});

// 监听客户端断开事件
aedesInstance.on('clientDisconnect', (client) => {
  console.log(`[MQTT Broker Service] Client disconnected: ${client.id}`);
});
