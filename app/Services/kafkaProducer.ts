import { Kafka } from 'kafkajs'

const kafka = new Kafka({
  clientId: 'loteria',
  brokers: ['localhost:9092'],
})

export const myLotteryProducer = async (userName) => {
  const producer = kafka.producer()
  await producer.connect()
  await producer.send({
    topic: 'test-topic',
    messages: [{ value: `A new user named ${userName} was stored!` }],
  })
  await producer.disconnect()
}
