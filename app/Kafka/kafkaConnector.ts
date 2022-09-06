import { Kafka } from 'kafkajs'

const myBroker = process.env.KAFKA_BROKER_IP || 'localhost:9091'

const kafka = new Kafka({
  clientId: 'lottery-api',
  brokers: [myBroker],
})

export { kafka }
