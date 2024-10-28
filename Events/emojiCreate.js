const { AuditLogEvent, EmbedBuilder } = require("discord.js");
const Discord = require("discord.js");
const config = require("../config");
const intents = new Discord.IntentsBitField(53608447);
const bot = new Discord.Client({ intents });

module.exports = async (bot, message) => {

    const fetchedLogs = await message.guild.fetchAuditLogs({
        type: AuditLogEvent.EmojiCreate,
        limit: 1,
    });

    const emojiCreateLog = fetchedLogs.entries.first();
    let executorMention = "Inconnu"; // Valeur par défaut

    if (emojiCreateLog) {
        const { executor: logExecutor } = emojiCreateLog;
        executorMention = logExecutor ? `<@${logExecutor.id}>` : executorMention; // Mention de l'exécuteur
    }

    // Récupérer l'emoji créé
    const newEmoji = emojiCreateLog.target;

    // Créer un embed pour afficher les détails de l'emoji
    const embed = new EmbedBuilder()
    .setTitle("**Un emoji a été ajouté :**")
    .addFields(
        { name: "**Exécuteur :**", value: executorMention, inline: false },
        { name: "**Nom de l'emoji :**", value: newEmoji.name, inline: false },
        { name: "**Emoji :**", value: newEmoji.toString(), inline: false },
        { name: "**Date :**", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: false },)
        .setColor("#FFEB00")
        .setTimestamp()
        .setFooter({ text: 'Deltaria - Semi-Rp / Semi-RPG', iconURL: `${bot.user.displayAvatarURL()}` });

    // Envoyer l'embed dans un canal spécifique (à définir dans config)
    const channel = await bot.channels.fetch(config.logs_Channel);
    if (channel) await channel.send({ embeds: [embed] });

    // Log dans la console
};
