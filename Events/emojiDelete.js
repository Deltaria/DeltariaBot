const { AuditLogEvent, EmbedBuilder } = require('discord.js');
const config = require('../config'); // Assure-toi que le chemin vers ton fichier config est correct

module.exports = async (bot, emoji) => { 
  try {
    console.log("emoji object:", emoji);

    if (emoji.guild) {
      const fetchedLogs = await emoji.guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.EmojiDelete,
      });
      const deletionLog = fetchedLogs.entries.first();

      if (deletionLog) {
        const { executor } = deletionLog;

        const embed = new EmbedBuilder()
        .setTitle("**Un emoji à été supprimé :**")
        .addFields(
          { name: "**Exécuteur :**", value: `<@${executor.id}>` },
          { name: "**Nom de l'emoji :**", value: emoji.name },
          { name: "**Date :**", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: false },)
          .setColor("#FFEB00")
          .setTimestamp()
          .setFooter({ text: 'Deltaria - Semi-Rp / Semi-RPG', iconURL: `${bot.user.displayAvatarURL()}` });

        const channel = await bot.channels.fetch(config.logs_Channel);
        if (channel) await channel.send({ embeds: [embed] });
      } else {
        console.log("Aucun log de suppression d'emoji trouvé.");
      }
    } else {
      console.log("L'emoji n'est pas associé à un serveur.");
    }
  } catch (error) {
    console.error("Erreur lors de la suppression d'un emoji :", error);
  }
};