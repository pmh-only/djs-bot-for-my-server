import Command from '../interfaces/Command'
import { I, D } from '../aliases/discord.js'
import * as math from 'mathjs'
import { MessageActionRow, MessageButton } from 'discord.js'

/** 계산기 명령어 */
export default class MathCommand implements Command {
  /** 실행되는 부분입니다. */
  async run (interaction: I) {
    const expr = interaction.options.getString('expr', true)
    const limitedMath = math.create(math.all)
    const limitedEvaluate = limitedMath.evaluate

    const oops = new Error('삐빅. 지금 해킹하려고 한건가요?')

    limitedMath.import({
      import: () => { throw oops },
      createUnit: () => { throw oops },
      evaluate: () => { throw oops },
      parse: () => { throw oops },
      simplify: () => { throw oops },
      derivative: () => { throw oops }
    }, { override: true })

    const result = () => {
      try {
        return limitedEvaluate(expr)
      } catch (error) {
        return error instanceof Error ? error.message : 'wtf'
      }
    }

    interaction.editReply({
      content: JSON.stringify(result, null, 2),
      components: [new MessageActionRow({
        components: [new MessageButton({
          style: 'LINK',
          url: 'https://mathjs.org/docs/reference/functions.html',
          emoji: '📖',
          label: '함수 목록'
        })]
      })]
    })
  }

  /** 해당 명령어의 대한 설정입니다. */
  metadata = <D>{
    name: 'math',
    description: '계산기 타닥타닥..',
    options: [{
      name: 'expr',
      type: 'STRING',
      description: 'math.js 계산식을 작성해주세요.',
      required: true
    }]
  }
}
