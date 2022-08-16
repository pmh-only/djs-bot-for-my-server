import { slash } from '..'
import { Interaction } from 'discord.js'

export default async function onInteractionCreate (interaction: Interaction) {
  if (!interaction.isChatInputCommand()) return

  slash.runCommand(interaction)
}
