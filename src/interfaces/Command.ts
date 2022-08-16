import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'

export default interface Command {
  run: (args: ChatInputCommandInteraction) => any
  metadata: SlashCommandBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
}
