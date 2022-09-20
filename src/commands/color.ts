import Command from '../interfaces/Command'
import { I } from '../aliases/discord.js'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, GuildMemberRoleManager, RoleManager, SlashCommandBuilder } from 'discord.js'

/** 색상 변경 명령어 */
export default class ColorCommand implements Command {
  /** 실행되는 부분입니다. */
  async run (interaction: I) {
    await interaction.deferReply({ ephemeral: false })
    if (!interaction.member) return
    if (!interaction.guild) return

    const hex = interaction.options.getString('hex', true)
    const id = interaction.user.id

    if (!hex.match(/^#(?:[0-9a-fA-F]{3}){1,2}$/)) {
      interaction.editReply('이런! 이 봇은 아직 #rrggbb 포맷만 지원해요!')
      return
    }

    const button =
      new ButtonBuilder()
        .setStyle(ButtonStyle.Success)
        .setLabel('네!')
        .setCustomId(interaction.id)

    const actionRow =
      new ActionRowBuilder<ButtonBuilder>()
        .addComponents(button)

    const embed =
      new EmbedBuilder()
        .setColor(parseInt(hex.replace('#', ''), 16))
        .setTitle('이 색상으로 할까요?')

    await interaction.editReply({
      embeds: [embed],
      components: [actionRow]
    })

    const i = await interaction.channel?.awaitMessageComponent({
      filter: (i) => i.customId === interaction.id && i.user.id === interaction.user.id,
      componentType: ComponentType.Button
    })

    if (!i) return
    await i.deferReply()

    const guildRoles = interaction.guild.roles as RoleManager
    const memberRoles = interaction.member.roles as GuildMemberRoleManager
    const roleCreated = guildRoles.cache.find((r) => r.name === `color-${id}`)
    const isRoleAssigned = memberRoles.cache.find((r) => r.name === `color-${id}`)

    if (!roleCreated) {
      const role = await guildRoles.create({
        color: parseInt(hex.replace('#', ''), 16),
        name: `color-${id}`,
        permissions: []
      })

      memberRoles.add(role)
      await i.editReply('적용했어요!')
      return
    }

    roleCreated.setColor(parseInt(hex.replace('#', ''), 16))

    if (!isRoleAssigned) {
      memberRoles.add(roleCreated)
    }

    await i.editReply('적용했어요!')
  }

  /** 해당 명령어의 대한 설정입니다. */
  public metadata =
    new SlashCommandBuilder()
      .setName('color')
      .setDescription('닉네임 색상을 변경합니다')
      .addStringOption((option) => option
        .setName('hex')
        .setRequired(true)
        .setDescription('16진수 rgb색상 코드 (ex: #fafafa)'))
}
