import Command from '../interfaces/Command'
import { I, D } from '../aliases/discord.js.js'
import { TextChannel } from 'discord.js'

/** 익명 메시지 전송 명령어 */
export default class AnonCommand implements Command {
  /** 실행되는 부분입니다. */
  async run (interaction: I) {
    const channel = interaction.channel as TextChannel
    const webhook = await channel.createWebhook('???')
    const message = interaction.options.getString('message', true)

    await interaction.editReply('완료!')
    await webhook.send(message)
    await webhook.delete()
  }

  /** 해당 명령어의 대한 설정입니다. */
  metadata = <D>{
    name: 'anon',
    description: '익명으로 메시지를 전송합니다.',
    options: [{
      name: 'message',
      type: 'STRING',
      description: '보낼 메시지',
      required: true
    }]
  }
}
