require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { OpenAI } = require('openai');
const axios = require('axios');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 会話履歴を保持（システムプロンプト含む）
let conversationHistories = {};

client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  // 不要なグローバルコマンド「/mode」を削除
  try {
    const commands = await client.application.commands.fetch();
    const modeCommand = commands.find(cmd => cmd.name === 'mode');
    if (modeCommand) {
      await client.application.commands.delete(modeCommand.id);
      console.log('🗑️ グローバル /mode コマンドを削除しました');
    }
  } catch (err) {
    console.error('❌ /mode コマンドの削除に失敗:', err);
  }
});

// !ask メッセージコマンド
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith('!ask')) {
    const guildId = message.guild.id;
    if (!conversationHistories[guildId]) {
      conversationHistories[guildId] = [
        { role: 'system', content: 'あんたは大阪出身の優しいお兄ちゃんみたいな存在で、ユーザーの質問にバリバリの関西弁で、丁寧かつおもろく、詳し〜く答えるAIやで。' }
      ];
    }
    const conversationHistory = conversationHistories[guildId];

    const userPrompt = message.content.replace('!ask', '').trim();
    if (!userPrompt) {
      return message.reply('❗ 質問内容を入力してください（例：!ask マイクラの始め方）');
    }

    await message.channel.send('🤖 ChatGPTが考え中...');

    // 会話履歴にユーザーのメッセージを追加
    conversationHistories[guildId].push({ role: 'user', content: userPrompt });

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        max_tokens: 3000,
        messages: conversationHistories[guildId]
      });

      const reply = completion.choices[0].message.content;

      // 会話履歴にアシスタントの返信を追加
      conversationHistories[guildId].push({ role: 'assistant', content: reply });

      message.reply(reply);
      message.react('🤖');

    } catch (error) {
      console.error('OpenAIエラー:', error);
      message.reply('⚠️ ChatGPTへの接続に失敗しました。');
    }
  }
  // !search メッセージコマンド（検索付き質問）
  else if (message.content.startsWith('!search')) {
    const guildId = message.guild.id;
    if (!conversationHistories[guildId]) {
      conversationHistories[guildId] = [
        { role: 'system', content: 'あんたは大阪出身の優しいお兄ちゃんみたいな存在で、ユーザーの質問にバリバリの関西弁で、丁寧かつおもろく、詳し〜く答えるAIやで。' }
      ];
    }
    const conversationHistory = conversationHistories[guildId];

    const query = message.content.replace('!search', '').trim();
    if (!query) {
      return message.reply('❗ 検索ワードを入力してください（例：!search 2025年の花粉予測）');
    }

    await message.channel.send(`🔍 検索中：「${query}」...`);

    try {
      // SerpAPIで検索
      const serpRes = await axios.get('https://serpapi.com/search', {
        params: {
          engine: 'google',
          q: query,
          api_key: process.env.SERPAPI_KEY,
          hl: 'ja'
        }
      });

      const organicResults = serpRes.data.organic_results || [];
      if (organicResults.length === 0) {
        return message.reply('検索結果が見つかりませんでした。');
      }

      const summaryText = organicResults
        .slice(0, 5)
        .map((r, i) => `${i + 1}. ${r.title} - ${r.snippet}`)
        .join('\n\n');

      const sourceLinks = organicResults
        .slice(0, 3)
        .map((r, i) => `${i + 1}. [${r.title}](${r.link})`)
        .join('\n');

      // ChatGPTに要約依頼
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'あんたは大阪出身の優しいお兄ちゃんみたいな存在で、ユーザーの質問にバリバリの関西弁で、丁寧かつおもろく、詳し〜く答えるAIやで。以下の検索結果をもとにして、相手が「へぇ〜なるほどなぁ」って思えるような説明を、わかりやすく親しみやすく伝えてな。'
          },
          {
            role: 'user',
            content: `検索ワード: ${query}\n\n検索結果:\n${summaryText}`
          }
        ],
        max_tokens: 3000,
        temperature: 0.7
      });

      const answer = response.choices[0].message.content;

      // !searchの応答を会話履歴に追加
      conversationHistories[guildId].push({ role: 'user', content: query });
      conversationHistories[guildId].push({ role: 'assistant', content: answer });

      const formattedAnswer = `**🔍 検索ワード:** ${query}\n\n${answer.replace(/\n{1,}/g, '\n\n')}\n\n**🔗 参考リンク：**\n${sourceLinks}`;
      message.channel.send({ content: formattedAnswer });
      message.react('🔍');
    } catch (error) {
      console.error('検索エラー:', error);
      message.reply('⚠️ 検索中にエラーが発生しました。');
    }
  }
  // !help メッセージコマンド（ヘルプ表示）
  else if (message.content.startsWith('!help')) {
    const helpMessage = `
  📘 **使えるコマンド一覧**

  🧠 **!ask [質問]**
  兄貴に質問できます。関西弁でまじめに教えてくれます。
  例：\`!ask 犬について教えて\`

  😄 **!chat [メッセージ]**
  雑談モード。ノリのいい兄貴がフレンドリーにしゃべってくれます。
  例：\`!chat 最近どう？\`

  🔍 **!search [キーワード]**
  インターネットで検索して、要約して関西弁で答えてくれます。
  例：\`!search 2025年の花粉予測\`

  🔄 **!reset**
  会話履歴をリセットします。
  `;
    return message.reply(helpMessage);
    message.react('📘');
  }
  // !reset メッセージコマンド（会話履歴リセット）
  else if (message.content.startsWith('!reset')) {
    conversationHistories[message.guild.id] = [
      { role: 'system', content: 'あんたは大阪出身の優しいお兄ちゃんみたいな存在で、ユーザーの質問にバリバリの関西弁で、丁寧かつおもろく、詳し〜く答えるAIやで。' }
    ];
    message.reply('🔄 会話履歴をリセットしましたで！またなんでも聞いてや〜！');
    message.react('♻️');
  }
}); 

client.login(process.env.DISCORD_TOKEN);
