const { AuditLogEvent, EmbedBuilder } = require("discord.js");
const Discord = require("discord.js");
const config = require("../config");
const intents = new Discord.IntentsBitField(53608447);
const bot = new Discord.Client({ intents });

module.exports = async (bot, channel) => {
  try {
    const fetchedLogs = await channel.guild.fetchAuditLogs({
      type: AuditLogEvent.ChannelDelete, // Changement ici : on utilise ChannelDelete
      limit: 1,
    });

    const channelDeleteLog = fetchedLogs.entries.first();

    if (channelDeleteLog) {
      const { executor } = channelDeleteLog;
      const nomSalon = channel.name;
      const categorie = channel.parent ? channel.parent.name : "Aucune";

      const typeSalon = channel.type === Discord.ChannelType.GuildText
        ? "Texte"
        : channel.type === Discord.ChannelType.GuildVoice
          ? "Vocal"
          : channel.type === Discord.ChannelType.GuildCategory
            ? "Catégorie"
            : "Inconnu";

      const embed = new EmbedBuilder()
        .setTitle("**Un salon a été supprimé :**") // Changement ici : titre adapté
        .setColor("#FFEB00")
        .addFields(
          { name: "**Exécuteur :**", value: executorMention, inline: false },
          { name: "**Catégorie du salon :**", value: categorie, inline: false },
          { name: "**Nom du salon : **", value: nomSalon, inline: false },
          { name: "**Type du salon :**", value: typeSalon, inline: false },
          { name: "**Date :**", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: false },)
        .setTimestamp()
        .setFooter({ text: 'Deltaria - Semi-Rp / Semi-RPG', iconURL: bot.user.displayAvatarURL() });

      const salonLogs = bot.channels.cache.get(config.logs_Channel);

      if (salonLogs) {
        await salonLogs.send({ embeds: [embed] });
      }
    }
  } catch (error) {
    console.error("Erreur lors du traitement de l'événement channelDelete :", error);
  }
};