import { Kafka } from 'kafkajs'

const kafka = new Kafka({
  clientId: 'lottery-api',
  brokers: ['localhost:9092'],
})

export { kafka }
