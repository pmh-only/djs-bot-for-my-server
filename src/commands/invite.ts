import Command from '../interfaces/Command'
import { I } from '../aliases/discord.js'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, Guild, GuildMember, SlashCommandBuilder, TextChannel } from 'discord.js'

const cooltimeQueue = [] as string[]

export default class PingCommand implements Command {
  async run (interaction: I) {
    await interaction.deferReply({ ephemeral: true })

    if (cooltimeQueue.includes(interaction.user.id)) {
      interaction.editReply('초대링크는 1인당 하루에 한번만 생성 가능합니다.')
      return
    }

    const embed =
      new EmbedBuilder()
        .setTitle('1회용 초대링크 생성')
        .addFields({
          name: '안내/경고',
          value:
            '초대링크는 12시간의 유효기간을 가지며 1인당 하루에 한번만 생성 가능합니다. (00시 초기화)\n\n' +
            '생성하시겠습니까?'
        })

    const button =
      new ButtonBuilder()
        .setCustomId(interaction.id)
        .setStyle(ButtonStyle.Success)
        .setDisabled(true)
        .setLabel('네! (경고글을 읽어주세요, 5초 대기)')

    const actionRow =
      new ActionRowBuilder<ButtonBuilder>()
        .addComponents(button)

    setInterval(() => {
      button
        .setDisabled(false)
        .setLabel('네!')
      actionRow.setComponents(button)

      interaction.editReply({
        components: [actionRow]
      })
    }, 5000)

    await interaction.editReply({
      embeds: [embed],
      components: [actionRow]
    })

    const i = await interaction.channel?.awaitMessageComponent({
      filter: (i) => i.customId === interaction.id && i.user.id === interaction.user.id,
      componentType: ComponentType.Button
    })

    cooltimeQueue.push(interaction.user.id)
    setInterval(() => {
      const index = cooltimeQueue.findIndex((v) => v === interaction.user.id)
      cooltimeQueue.splice(index, 1)
    }, 24 * 60 * 60 * 1000)

    if (!i) return
    await i.deferReply({ ephemeral: true })

    const member = interaction.member as GuildMember
    const channel = interaction.channel as TextChannel
    const guild = interaction.guild as Guild
    const memberName = member.nickname ? `${member.nickname} (${member.user.tag})` : member.user.tag

    interaction.channel?.send(`\`${memberName}\`가 1회용 초대 링크를 생성했어요!`)

    const invite = await guild.invites.create(channel, {
      maxUses: 1,
      maxAge: 12 * 60 * 60,
      unique: true
    })

    i.editReply('초대 링크를 생성했어요!\n' + invite.url)
  }

  public metadata =
    new SlashCommandBuilder()
      .setName('invite')
      .setDescription('초대 링크를 생성합니다. (이 명령어는 하루에 한번만 입력 가능합니다. 00시 초기화)')
}
