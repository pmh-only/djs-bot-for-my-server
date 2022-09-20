import Command from '../interfaces/Command'
import { I } from '../aliases/discord.js.js'
import { GuildMember, SlashCommandBuilder } from 'discord.js'

/** 익명 메시지 전송 명령어 */
export default class AnonCommand implements Command {
  /** 실행되는 부분입니다. */
  async run (interaction: I) {
    await interaction.deferReply({ ephemeral: false })
    const chosenMember = interaction.options.getMember('member') as GuildMember | null
    const member = chosenMember || interaction.member as GuildMember
    const memberName = member.nickname ? `${member.nickname} (${member.user.tag})` : member.user.tag

    await interaction.editReply(`\`${memberName}\`님은 <t:${Math.floor(member.joinedTimestamp! / 1000)}:R>에 가입했습니다.`)
  }

  public metadata =
    new SlashCommandBuilder()
      .setName('date')
      .setDescription('자신이 이 서버에서 얼마나 오래 있었는지 계산합니다.')
      .addUserOption((builder) => builder
        .setName('member')
        .setDescription('계산할 멤버'))
}
