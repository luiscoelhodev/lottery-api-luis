import { kafka } from './kafkaConnector'
import { MessageFromProducer, TopicEnum } from './kafkaTypes'

export const myLotteryProducer = async (producerObject: MessageFromProducer) => {
  const producer = kafka.producer()
  await producer.connect()
  await producer.send({
    topic: TopicEnum.emails,
    messages: [
      {
        value: JSON.stringify(producerObject),
      },
    ],
  })
  await producer.disconnect()
}
