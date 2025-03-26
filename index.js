require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { OpenAI } = require('openai');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  // グローバルコマンド登録
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

// 会話履歴保存用
let conversationHistory = [
  { role: 'system', content: 'あなたは関西弁で喋るゲームについて詳しい専門家です。難しい専門用語もわかりやすく説明してください。' }
];

// モード状態を保持
let mode = 'normal'; // normal or gpt4

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

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // !helloコマンドはそのまま残す
  if (message.content === '!hello') {
    message.channel.send('こんにちは！ChatGPTアシスタントです！');
  }

  // ChatGPT連携コマンド：!ask
  if (message.content.startsWith('!ask')) {
    const userPrompt = message.content.replace('!ask', '').trim();
    if (!userPrompt) {
      return message.reply('質問内容を入力してください！ 例: !ask ネザーゲートの作り方は？');
    }

    // 履歴に今回のユーザー発言を追加
    conversationHistory.push({ role: 'user', content: userPrompt });

    await message.channel.send('🤖 ChatGPTが考え中...');

    try {
      const completion = await openai.chat.completions.create({
        model: (mode === 'gpt4') ? 'gpt-4' : 'gpt-3.5-turbo',
        messages: conversationHistory,
        max_tokens: 2000
      });

      const reply = completion.choices[0].message.content;

      // 履歴にAIの返答も追加
      conversationHistory.push({ role: 'assistant', content: reply });

      message.reply(reply);
    } catch (error) {
      console.error(error);
      message.reply('⚠️ ChatGPTへの接続に失敗しました。');
    }
  }
});

// ※ 注意: Discord Developer Portal またはデプロイスクリプトで「/mode」コマンドを登録してください。
// オプション: type (choices: normal, gpt4)

client.login(process.env.DISCORD_TOKEN);
