const { AuditLogEvent, EmbedBuilder } = require("discord.js");
const Discord = require("discord.js");
const config = require("../config");
const intents = new Discord.IntentsBitField(53608447);
const bot = new Discord.Client({ intents });

module.exports = async (bot, message) => {
    if (message.author.bot) return;

    const fetchedLogs = await message.guild.fetchAuditLogs({
        type: AuditLogEvent.MessageDelete,
        limit: 1,
    });

    const LatestMessageDeleted = fetchedLogs.entries.first();
    let executorMention = "Inconnu"; // Valeur par défaut
    let authorMention = "Inconnu"; // Valeur par défaut pour l'auteur du message
    let deletedMessageContent = "Inconnu"; // Valeur par défaut pour le message supprimé

    if (LatestMessageDeleted) {
        const { executor: logExecutor } = LatestMessageDeleted;
        executorMention = logExecutor ? `<@${logExecutor.id}>` : executorMention; // Mention de l'exécuteur
    }

    if (message) {
        authorMention = `<@${message.author.id}>`; // Mention de l'auteur du message
        deletedMessageContent = message.content || "Message vide"; // Contenu du message ou message vide
    }

    const messageDeleteEmbed = new EmbedBuilder()
        .setTitle("**Un message a été supprimé :**")
        .addFields(
            { name: "**Exécuteur :**", value: executorMention },
            { name: "**Auteur du message :**", value: authorMention },
            { name: "**Contenu du message :**", value: deletedMessageContent },
            { name: "**Date :**", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: false },)
            .setColor("#FFEB00")
            .setTimestamp()
        .setFooter({ text: 'Deltaria - Semi-Rp / Semi-RPG', iconURL: `${bot.user.displayAvatarURL()}` });

    const channel = await bot.channels.fetch(config.logs_Channel);
    if (channel) await channel.send({ embeds: [messageDeleteEmbed] });
};
