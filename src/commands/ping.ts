import { client } from '..'
import Command from '../interfaces/Command'
import { I } from '../aliases/discord.js'
import { SlashCommandBuilder } from 'discord.js'

export default class PingCommand implements Command {
  async run (interaction: I) {
    await interaction.deferReply({ ephemeral: false })
    await interaction.editReply(`${client.ws.ping}ms`)
  }

  public metadata =
    new SlashCommandBuilder()
      .setName('ping')
      .setDescription('응답 레이턴시를 출력합니다.')
}
