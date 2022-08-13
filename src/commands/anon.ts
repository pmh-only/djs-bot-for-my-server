import Command from '../interfaces/Command'
import { I, D } from '../aliases/discord.js.js'
import { WebhookClient } from 'discord.js'

/** 핑 명령어 */
export default class PingCommand implements Command {
  /** 실행되는 부분입니다. */
  async run (interaction: I) {
    const webhook = new WebhookClient({
      id: process.env.ANON_WEBHOOK_ID!,
      token: process.env.ANON_WEBHOOK_TOKEN!
    })
    const message = interaction.options.getString('message', true)

    await interaction.editReply('완료!')
    await webhook.send(message)
  }

  /** 해당 명령어의 대한 설정입니다. */
  metadata = <D>{
    name: 'anon',
    description: '익명으로 메시지를 전송합니다.',
    options: [{
      name: 'message',
      type: 'STRING',
      required: true
    }]
  }
}
