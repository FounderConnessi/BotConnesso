import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, TextChannel, ThreadChannel } from "discord.js";

export function addDiscussionButton(client: Client, nickname: string, label: string, message: any) {
    const threadChannel = client.channels.cache.get(process.env.CHANNEL_THREAD_ID) as TextChannel;
    const thread = threadChannel.threads.cache.find(x => x.name === 'Segnalazione su ' + nickname.toLowerCase());

    if (thread) {
        message.components = [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel(label)
                    .setEmoji("📰")
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://discord.com/channels/${process.env.GUILD_ID}/${thread.id}`)
            )
        ];
    }
    return message;
};

export function addPollButton(url: string, message: any) {
    message.components = [
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel("Vai al sondaggio")
                .setEmoji("🗳️")
                .setStyle(ButtonStyle.Link)
                .setURL(url)
        )
    ];
    return message;
};

export function getChannelAndThreadDiscussion(nickname: string, client: Client): { channel: TextChannel, thread: ThreadChannel } {
    const channel = client.channels.cache.get(process.env.CHANNEL_THREAD_ID) as TextChannel;
    const thread = channel.threads.cache.find(x => x.name === `Segnalazione su ${nickname.toLowerCase()}`) as ThreadChannel;
    return { channel, thread };
}