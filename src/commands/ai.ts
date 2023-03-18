import Command from '../interfaces/Command.js'
import { I } from '../aliases/discord.js.js'
import { SlashCommandBuilder } from 'discord.js'
import { Configuration, OpenAIApi } from 'openai'

const MODEL_TYPE = {
  GPT3_5: 'gpt-3.5-turbo',
  GPT4: 'gpt-4'
} as const

const COOLDOWN_TIME = {
  [MODEL_TYPE.GPT3_5]: 60 * 1000,
  [MODEL_TYPE.GPT4]: 30 * 60 * 1000
}

const { OPENAI_API_KEY } = process.env

/** OpenAI GPT 명령어 */
export default class AICommand implements Command {
  private cooldown = {
    [MODEL_TYPE.GPT3_5]: [] as string[],
    [MODEL_TYPE.GPT4]: [] as string[]
  }

  private readonly openai = new OpenAIApi(
    new Configuration({
      apiKey: OPENAI_API_KEY
    })
  )

  /** 실행되는 부분입니다. */
  async run (interaction: I) {
    const content = interaction.options.getString('content', true)
    const model = MODEL_TYPE[interaction.options.getString('model') as keyof typeof MODEL_TYPE ?? 'GPT3_5'] ?? MODEL_TYPE.GPT3_5

    if (this.cooldown[model].includes(interaction.user.id)) {
      interaction.reply({
        content: '워워 진정하세요. 프흠의 통장 잔고를 위해 쿨타임을 만들었습니다. (GPT3.5: 1분, GPT4: 30분)',
        ephemeral: true
      })
      return
    }

    await interaction.deferReply({ ephemeral: false })

    this.cooldown[model].push(interaction.user.id)
    setTimeout(() => {
      this.cooldown[model] = this.cooldown[model].filter((v) => v !== interaction.user.id)
    }, COOLDOWN_TIME[model])

    try {
      const completion = await this.openai.createChatCompletion({
        model,
        messages: [{
          role: 'user',
          content
        }],
        max_tokens: 1000
      })

      interaction.editReply(completion.data.choices[0].message ?? 'ERROR!')
    } catch (error: any) {
      interaction.editReply(`ERROR! \`${error.message}\``)
    }
  }

  public metadata =
    new SlashCommandBuilder()
      .setName('ai')
      .setDescription('OpenAI GPT 모델과 대화합니다')
      .addStringOption((builder) => builder
        .setName('content')
        .setRequired(true)
        .setDescription('내용'))
      .addStringOption((builder) => builder
        .setName('model')
        .setDescription('GPT 모델을 선택해주세요')
        .addChoices(
          { name: 'GPT3.5', value: 'GPT3_5' },
          { name: 'GPT4', value: 'GPT4' }
        )
        .setRequired(false))
}
