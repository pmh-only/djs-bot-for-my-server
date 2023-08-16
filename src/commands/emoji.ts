import { fetch } from 'undici'
import Command from '../interfaces/Command'
import jimp from 'jimp'
import { I } from '../aliases/discord.js.js'
import { Collection, SlashCommandBuilder } from 'discord.js'

export default class EmojiCommand implements Command {
  async run (interaction: I) {
    await interaction.deferReply({ ephemeral: false })
    await interaction.editReply('이미지를 받고 있습니다')

    const supportedTypes = [
      'image/png',
      'image/jpeg',
      'image/bmp'
    ]

    const name = interaction.options.getString('name', true)
    const image = interaction.options.getAttachment('image', true)
    if (!supportedTypes.includes(image.contentType ?? '')) {
      await interaction.editReply('지원하지 않는 이미지 포맷입니다 (.jp(e)g, .png, .bmp 지원)')
      return
    }

    const imageBinary =
      await fetch(image.url)
        .then((res) => res.arrayBuffer())
        .then((res) => Buffer.from(res))

    await interaction.editReply('사이즈 조정 후 업로드 중...')
    const imageProcessor = await jimp.read(imageBinary)

    imageProcessor.scaleToFit(128, 128)

    const emojiCache = interaction.guild?.emojis.cache ?? new Collection()

    const emojiDuplicated = emojiCache.find((v) => v.name === name)
    if (emojiDuplicated !== undefined && emojiDuplicated.deletable) {
      await emojiDuplicated.delete().catch(() => {})
    }

    if (emojiCache.size > 100) {
      const emojiToDelete = emojiCache
        .sorted((a, b) => a.createdTimestamp - b.createdTimestamp)
        .at(0)

      if (emojiToDelete?.deletable === true) {
        emojiToDelete?.delete()
      }
    }

    try {
      const createdEmoji = await interaction.guild?.emojis.create({
        name,
        attachment: await imageProcessor.getBufferAsync('image/png')
      })

      await interaction.editReply(`\`:${name}:\`으로 이모지를 등록하였습니다 <:${name}:${createdEmoji?.id}>`)
    } catch {
      await interaction.editReply('이미지 용량이 너무 큽니다.')
    }
  }

  public metadata =
    new SlashCommandBuilder()
      .setName('emoji')
      .setDescription('커스텀 이모지를 추가합니다')
      .addStringOption((option) => option
        .setRequired(true)
        .setName('name')
        .setDescription('커스텀 이모지를 전송할때 사용할 이모지 이름'))
      .addAttachmentOption((option) => option
        .setRequired(true)
        .setName('image')
        .setDescription('커스텀 이모지에 사용할 이미지 (.jp(e)g, .png, .bmp 지원)'))
}
