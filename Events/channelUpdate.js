const { AuditLogEvent, EmbedBuilder } = require("discord.js");
const Discord = require("discord.js");
const config = require("../config");
const intents = new Discord.IntentsBitField(53608447);
const bot = new Discord.Client({ intents });

module.exports = async (bot, oldChannel, newChannel) => {
  // Vérifier si le salon a été renommé ou a changé de catégorie
  if (oldChannel.name !== newChannel.name || oldChannel.parentId !== newChannel.parentId) {
    try {
      const fetchedLogs = await newChannel.guild.fetchAuditLogs({
        type: AuditLogEvent.ChannelUpdate,
        limit: 1,
      });

      const channelUpdateLog = fetchedLogs.entries.first();

      if (channelUpdateLog) {
        const { executor } = channelUpdateLog;

        const embed = new EmbedBuilder()
        .setTitle("**Un(e) salon/catégorie à été(e) mis(e) à jour :**")
        .setColor("#FFEB00")
          .addFields(
            { name: "Exécuteur", value: executor ? `<@${executor.id}>` : "Inconnu", inline: false },
            { name: "**Ancien nom du salon / catégorie :**", value: oldChannel.name, inline: false },
            { name: "**Nouveau nom du salon / catégorie :**", value: newChannel.name, inline: false },
            { name: "**Ancienne catégorie :**", value: oldChannel.parent ? oldChannel.parent.name : "Aucune"},
            { name: "**Nouvelle catégorie :**", value: newChannel.parent ? newChannel.parent.name : "Aucune", inline: false,},
            { name: "**Date :**", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: false })
          .setTimestamp()
          .setFooter({
            text: 'Deltaria - Semi-Rp / Semi-RPG',
            iconURL: bot.user.displayAvatarURL(),
          });

        const salonLogs = bot.channels.cache.get(config.logs_Channel);

        if (salonLogs) {
          await salonLogs.send({ embeds: [embed] });
        }
      }
    } catch (error) {
      console.error("Erreur lors du traitement de l'événement channelUpdate :", error);
    }
  }
};