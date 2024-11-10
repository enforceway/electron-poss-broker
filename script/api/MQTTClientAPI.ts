/**
 * @description 该文件会生成electron中的MQTT客户端，用于连接到 Aedes MQTT 代理服务器并订阅/发布消息，对ORDER状态的变化实时同步到其他ORDER相关联终端
 */
import mqtt from 'mqtt';
import { LocalLogger } from '../core/AppLogger';
import { OrderModel } from '../models/dtos/OrderModel';

let client: mqtt.MqttClient;

function onConnected() {
  LocalLogger.Index.log('Electrion Pos App Connected to the MQTT broker');
}
function messageIncoming(topic, message) {
  LocalLogger.Index.log(`Received message on topic ${topic}: ${message.toString()}`);
}
export function connect() {
  // 连接到 Aedes MQTT 代理服务器
  client = mqtt.connect('mqtt://localhost:1883', {
    servername: 'POSS Application'
  });
  // 连接成功后执行的操作
  client.on('connect', onConnected);
  // 监听收到的消息
  client.on('message', messageIncoming);
}

export function disconnect() {
  client.off('connect', onConnected);
  client.off('message', messageIncoming);
  client.end();
}

export function orderCreated(orderDetail: OrderModel) {
  client.publish('topic/cooking/created', JSON.stringify(orderDetail));
}

export function startCooking(orderDetail: OrderModel) {
  client.publish('topic/cooking/start', JSON.stringify(orderDetail));
}

export function restartCooking(orderDetail: OrderModel) {
  client.publish('topic/cooking/restart', JSON.stringify(orderDetail));
}

export function completeCooking(orderDetail: OrderModel) {
  client.publish('topic/cooking/complete', JSON.stringify(orderDetail));
}
