import Command from '../interfaces/Command'
import { I } from '../aliases/discord.js.js'
import { SlashCommandBuilder, TextChannel } from 'discord.js'

/** 익명 메시지 전송 명령어 */
export default class AnonCommand implements Command {
  /** 실행되는 부분입니다. */
  async run (interaction: I) {
    interaction.deferReply({ ephemeral: true })
    const channel = interaction.channel as TextChannel
    const webhook = await channel.createWebhook({ name: '???' })
    const message = interaction.options.getString('message', true)

    await interaction.editReply('완료!')
    await webhook.send(message)
    await webhook.delete()
  }

  public metadata =
    new SlashCommandBuilder()
      .setName('anon')
      .setDescription('익명으로 메시지를 전송합니다.')
      .addStringOption((option) => option
        .setName('message')
        .setDescription('보낼 메시지')
        .setRequired(true))
}
