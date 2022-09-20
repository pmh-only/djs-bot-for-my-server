import Command from '../interfaces/Command'
import { I } from '../aliases/discord.js'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } from 'discord.js'
import * as math from 'mathjs'

/** 계산기 명령어 */
export default class MathCommand implements Command {
  /** 실행되는 부분입니다. */
  async run (interaction: I) {
    await interaction.deferReply({ ephemeral: false })

    const expr = interaction.options.getString('expr', true)
    const result = this.evaluate(expr)

    const button =
      new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setURL('https://mathjs.org/docs/reference/functions.html')
        .setEmoji({ name: '📖' })
        .setLabel('함수 목록')

    const actionsRow =
      new ActionRowBuilder<ButtonBuilder>()
        .addComponents(button)

    interaction.editReply({
      content: `\`\`\`json\n${JSON.stringify(result, null, 2)}\`\`\``,
      components: [actionsRow]
    })
  }

  /** 해당 명령어의 대한 설정입니다. */
  public metadata =
    new SlashCommandBuilder()
      .setName('math')
      .setDescription('계산기 타닥타닥...')
      .addStringOption((option) => option
        .setName('expr')
        .setDescription('math.js 계산식을 작성해주세요')
        .setRequired(true)
      )

  // ---

  private math: typeof math

  constructor () {
    const limitedMath = math.create(math.all)
    const blocked = ['import']
    const blockedFn = blocked.map((v) => ({ [v]: () => 0 }))

    limitedMath.import({ ...blockedFn }, { override: true })

    this.math = limitedMath
  }

  private evaluate (expr: string) {
    try {
      return this.math.evaluate(expr)
    } catch (error) {
      return error instanceof Error ? error.message : 'wtf'
    }
  }
}
