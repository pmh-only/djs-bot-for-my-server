import { slash } from '..'
import { Interaction } from 'discord.js'

export default async function onInteractionCreate (interaction: Interaction) {
  if (!interaction.isCommand()) return

  await interaction.deferReply({ ephemeral: true }).catch(() => null)
  slash.runCommand(interaction)
}
