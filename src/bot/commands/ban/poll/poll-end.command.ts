import { SlashCommandPipe } from "@discord-nestjs/common";
import { Handler, IA, InjectDiscordClient, SubCommand } from "@discord-nestjs/core";
import { InteractionReplyOptions, EmbedBuilder, Colors, Client, CommandInteraction } from "discord.js";
import { ThreadDto } from 'src/bot/dto';
import { FoundersService } from 'src/founders/founders.service';
import { addPollButton, getChannelAndThreadDiscussion } from 'src/utils/utils';

@SubCommand({ name: 'poll-end', description: 'Termina la votazione per la blacklist' })
export class BanPollEndCommand {
  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly founders: FoundersService
  ) { }

  @Handler()
  async onCommand(@IA(SlashCommandPipe) dto: ThreadDto, @IA() interaction: CommandInteraction): Promise<InteractionReplyOptions> {
    const { thread } = getChannelAndThreadDiscussion(dto.nickname, this.client);

    if (!thread)
      return {
        content: 'Devi prima creare un thread di discussione.',
        ephemeral: true
      };

    let pollMessage = (await thread.messages.fetchPinned()).last();

    if (!pollMessage)
      return {
        content: 'Devi prima aprire il sondaggio!',
        ephemeral: true
      };

    await interaction.deferReply();

    pollMessage = await (pollMessage.fetch());

    const votes = { '🟢': 0, '🟡': 0, '🟠': 0, '🔴': 0 }
    const referentVotes: { [key: string]: number } = {};

    for (const emoji of ['🟢', '🟡', '🟠', '🔴']) {
      const reaction = pollMessage.reactions.resolve(emoji);
      if (!reaction)
        continue;
      const foundersId = (await reaction.users.fetch()).map(user => user.id);
      let lawfulVotes = foundersId.length;
      for (const id of foundersId) {
        if (!await this.founders.canVote(id)) {
          await pollMessage.reactions.resolve(emoji).users.remove(id);
          lawfulVotes--;
        } else
          this.addReferentVote(id, referentVotes);
      }
      votes[emoji] = lawfulVotes;
    }

    const duplicatedVotes = this.searchDuplicatedVotes(referentVotes);

    if (duplicatedVotes.length > 0) {
      await interaction.editReply({
        content: `Ho riscontrato i seguenti voti duplicati: ${this.mentionUsers(duplicatedVotes)}`,
      });
      return;
    }

    const blackListVotes = votes['🔴'] + votes['🟠'] + votes['🟡'];

    const message = {
      embeds: [
        new EmbedBuilder()
          .setTitle('Esito sondaggio')
          .setDescription(`La segnalazione si è conclusa con: `)
          .addFields([
            { name: 'Contrari alla blacklist', value: `${votes['🟢']}`, inline: true },
            { name: 'Favorevoli alla blacklist', value: `${blackListVotes}`, inline: true }
          ])
          .setColor(0xff7264)
          .setFooter({ text: 'FounderConnessi', iconURL: 'https://i.imgur.com/EayOzNt.png' })
      ]
    };
    const embed = message.embeds[0];

    if (votes['🟢'] > blackListVotes)
      embed.setColor(Colors.Green)
    else if (votes['🟢'] == blackListVotes)
      embed.setColor(Colors.White)

    await pollMessage.edit(message);
    pollMessage.unpin();
    thread.setArchived(true);

    embed
      .setTitle('Fine sondaggio')
      .setDescription(`Si è concluso il sondaggio su **${dto.nickname}**.`)
      .setFields()
      .setFooter({ text: 'FounderConnessi', iconURL: 'https://i.imgur.com/EayOzNt.png' })
      .setTimestamp();

    await interaction.editReply(addPollButton(pollMessage.url, message));
  }

  addReferentVote(username: string, data: { [key: string]: number }) {
    if (data[username] == undefined)
      data[username] = 1;
    else
      data[username]++;
  }

  searchDuplicatedVotes(data: { [key: string]: number }) {
    return Object.keys(data).filter(key => data[key] > 1);
  }

  mentionUsers(ids: string[]) {
    return ids.map(id => `<@${id}>`).join(' ');
  }
}