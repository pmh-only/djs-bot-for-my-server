import Command from '../interfaces/Command'
import { I, D } from '../aliases/discord.js.js'
import { GuildMember, MessageActionRow, MessageButton } from 'discord.js'

/** 핑 명령어 */
export default class BanvoteCommand implements Command {
  /** 실행되는 부분입니다. */
  async run (interaction: I) {
    const banMember = interaction.options.getMember('user', true) as GuildMember
    const banReason = interaction.options.getString('reason', true)
    const banMemberName = banMember.nickname ? `${banMember.nickname} (${banMember.user.tag})` : banMember.user.tag

    if (!banMember.bannable) {
      await interaction.editReply('ㅠㅠ 관리자는 추방할 수 없어요...')
      return
    }

    if (interaction.channel?.id !== '708923881632825354') {
      await interaction.editReply('추방 투표 명령어는 공론화를 위해 <#708923881632825354>에서만 해주세요!')
      return
    }

    await interaction.editReply('추방 투표를 시작했어요!')
    const message = await interaction.channel?.send({
      content: `누군가가 \`${banMemberName}\`님의 대한 추방 투표를 시작했습니다!`,
      embeds: [{
        title: `\`${banMemberName}\`님의 대한 추방투표`,
        fields: [

          {
            name: '추방 투표 규칙',
            value:
              '1. 추방 찬성이 총합 5표 이상 모일경우 자동 추방됩니다.\n' +
              '2. 투표가 시작되거나 앞 사람이 투표한 시간으로부터 30분이 지난경우 투표는 무효로 자동 종료됩니다.\n' +
              '3. 추방을 찬성한 후에는 찬성을 취소할 수 없습니다.\n' +
              '4. 관리자 재량에 따라 추방 요청이 취소될 수 있습니다. (이 메시지를 삭제하는 것으로 처리)'
          },
          {
            name: '추방 사유',
            value: '```' + banReason + '```'
          }
        ]
      }],
      components: [
        new MessageActionRow({
          components: [
            new MessageButton({
              customId: interaction.id,
              label: '찬성합니다! (현재 0표, 추방까지 5표 남음)',
              style: 'SUCCESS'
            })
          ]
        })
      ]
    })

    if (!message) return
    const agreeUserIds = [] as string[]

    for (;;) {
      const i = await message.channel.awaitMessageComponent({
        filter: (i) => i.customId === interaction.id && !agreeUserIds.includes(i.user.id),
        time: 30 * 60 * 1000,
        componentType: 'BUTTON'
      }).catch(() => undefined)

      if (!i) {
        message.reply(`아쉽게도 추방까지 \`${5 - agreeUserIds.length}\`표를 남기고 시간 초과로 인해 \`${banMemberName}\`님의 대한 추방투표가 무효/취소되었습니다ㅠㅠ`).catch(() => {})
        return
      }

      agreeUserIds.push(i.user.id)
      i.reply({ ephemeral: true, content: '찬성표를 던졌습니다!' })
      await message.reply(`누군가가 \`${banMemberName}\`님의 대한 추방투표 찬성표를 던졌습니다!\n(현재 ${agreeUserIds.length}표, 추방까지 ${5 - agreeUserIds.length}표 남음)`)

      await message.edit({
        components: [
          new MessageActionRow({
            components: [
              new MessageButton({
                customId: interaction.id,
                label: `찬성합니다! (현재 ${agreeUserIds.length}표, 추방까지 ${5 - agreeUserIds.length}표 남음)`,
                style: 'SUCCESS'
              })
            ]
          })
        ]
      })

      if (agreeUserIds.length > 4) {
        await message.reply(`추방 찬성이 5표 이상임으로 5초 후 추방을 진행합니다.\n잘 가세요 ${banMember.id}님! :wave:`)
        setTimeout(async () => {
          await banMember.ban()
        }, 5 * 1000)
      }
    }
  }

  /** 해당 명령어의 대한 설정입니다. */
  metadata = <D>{
    name: 'banvote',
    description: '유저 추방 투표를 시작합니다. (30분내 5표 이상일시 추방)',
    options: [
      {
        name: 'user',
        type: 'USER',
        description: '추방 대상자',
        required: true
      },
      {
        name: 'reason',
        type: 'STRING',
        description: '추방 사유',
        required: true
      }
    ]
  }
}
