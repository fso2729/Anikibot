require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { OpenAI } = require('openai');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// モード状態を保持
let mode = 'normal'; // normal or gpt4

// 会話履歴を保持（システムプロンプト含む）
let conversationHistory = [
  { role: 'system', content: 'あなたは関西弁で話す親切なゲームに詳しいアシスタントです。' }
];

client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  // グローバルコマンド「/mode」を登録
  await client.application.commands.create({
    name: 'mode',
    description: 'GPTのモードを切り替えます (normal / gpt4)',
    options: [
      {
        name: 'type',
        description: 'GPTモードを選んでください',
        type: 3, // STRING型
        required: true,
        choices: [
          { name: 'normal', value: 'normal' },
          { name: 'gpt4', value: 'gpt4' }
        ]
      }
    ]
  });
  console.log('✅ グローバル /mode コマンドを登録しました');
});

// interaction (slash command)
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'mode') {
    const selectedMode = interaction.options.getString('type');
    if (selectedMode === 'normal' || selectedMode === 'gpt4') {
      mode = selectedMode;
      await interaction.reply(`✅ モードを「${mode}」に切り替えました。`);
    } else {
      await interaction.reply('⚠️ モードは「normal」または「gpt4」から選んでください。');
    }
  }
});

// !ask メッセージコマンド
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith('!ask')) {
    const userPrompt = message.content.replace('!ask', '').trim();
    if (!userPrompt) {
      return message.reply('❗ 質問内容を入力してください（例：!ask マイクラの始め方）');
    }

    await message.channel.send('🤖 ChatGPTが考え中...');

    // 会話履歴にユーザーのメッセージを追加
    conversationHistory.push({ role: 'user', content: userPrompt });

    try {
      const completion = await openai.chat.completions.create({
        model: (mode === 'gpt4') ? 'gpt-4' : 'gpt-3.5-turbo',
        max_tokens: 3000,
        messages: conversationHistory
      });

      const reply = completion.choices[0].message.content;

      // 会話履歴にアシスタントの返信を追加
      conversationHistory.push({ role: 'assistant', content: reply });

      message.reply(reply);
    } catch (error) {
      console.error('OpenAIエラー:', error);
      message.reply('⚠️ ChatGPTへの接続に失敗しました。');
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
