import { ApplicationCommandData, ChatInputCommandInteraction } from 'discord.js'
import { readdirSync } from 'fs'
import _ from '../consts'
import BotClient from './BotClient'
import Command from '../interfaces/Command'

const { ENVIROMENT_DEV_GUILD } = process.env

export default class SlashHandler {
  public commands: Map<string, Command>

  constructor () {
    this.commands = new Map()

    const commandPath = _.COMMANDS_PATH
    const commandFiles = readdirSync(commandPath)

    for (const commandFile of commandFiles) {
      // eslint-disable-next-line new-cap
      const command = new (require(_.COMMAND_PATH(commandFile)).default)() as Command

      this.commands.set(command.metadata.name, command)
    }
  }

  public runCommand (interaction: ChatInputCommandInteraction) {
    const commandName = interaction.commandName
    const command = this.commands.get(commandName)

    if (!command) return
    command.run(interaction)
  }

  public async registCachedCommands (client: BotClient): Promise<void> {
    if (!client.application) return console.warn('WARNING: registCachedCommands() called before application is ready.')

    const metadatas = [] as ApplicationCommandData[]
    for (const { metadata } of this.commands.values()) {
      if (!metadata) continue

      metadatas.push(
        metadata
          .setDMPermission(false)
          .toJSON()
      )
    }

    await client.application.commands.set([], ENVIROMENT_DEV_GUILD!)
    await client.application.commands.set(metadatas, ENVIROMENT_DEV_GUILD!)

    console.log('Registered commands for guild:', ENVIROMENT_DEV_GUILD!)
  }

  public async deregistCachedDevCommands (client: BotClient): Promise<void> {
    if (!client.application) return console.warn('WARNING: deregistCachedDevCommands() called before application is ready.')

    if (ENVIROMENT_DEV_GUILD) {
      await client.application.commands.set([], ENVIROMENT_DEV_GUILD!)
      console.log('Deregisted Dev Commands.')
    }
  }
}
