import Command from '../interfaces/Command'
import { I, D } from '../aliases/discord.js'
import { GuildMemberRoleManager, MessageActionRow, MessageButton } from 'discord.js'

export default class PingCommand implements Command {
  /** 실행되는 부분입니다. */
  async run (interaction: I) {
    if (!interaction.member) return

    const hex = interaction.options.getString('hex', true)
    const id = interaction.user.id

    if (!hex.match(/^#(?:[0-9a-fA-F]{3}){1,2}$/)) {
      interaction.editReply('이런! 이 봇은 아직 #rrggbb 포맷만 지원해요!')
      return
    }

    await interaction.editReply({
      embeds: [{
        color: parseInt(hex.replace('#', ''), 16),
        title: '이 색상으로 할까요?'
      }],
      components: [
        new MessageActionRow({
          components: [
            new MessageButton({
              custom_id: interaction.id,
              label: '네!',
              style: 'SUCCESS'
            } as any)
          ]
        })
      ]
    })
    const i = await interaction.channel?.awaitMessageComponent({
      filter: (i) => i.customId === interaction.id && i.user.id === interaction.user.id,
      componentType: 'BUTTON'
    })

    if (!i) return
    await i.deferReply()

    const roles = interaction.member.roles as GuildMemberRoleManager
    const previous = roles.cache.find((r) => r.name === `color-${id}`)

    if (previous) await previous?.setColor(parseInt(hex.replace('#', ''), 16))
    else {
      const role = await interaction.guild?.roles.create({
        color: parseInt(hex.replace('#', ''), 16),
        name: `color-${id}`,
        permissions: []
      })!

      await roles.add(role)
    }

    await interaction.deleteReply()
    await i.editReply('적용했어요!')
  }

  /** 해당 명령어의 대한 설정입니다. */
  metadata = <D>{
    name: 'color',
    description: 'Set name color',
    options: [{
      name: 'hex',
      type: 'STRING',
      required: true,
      description: 'hex code (ex: #fafafa)'
    }]
  }
}
