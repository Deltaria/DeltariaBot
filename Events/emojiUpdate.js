const { AuditLogEvent, EmbedBuilder } = require("discord.js");
const Discord = require("discord.js");
const config = require("../config");
const intents = new Discord.IntentsBitField(53608447);
const bot = new Discord.Client({ intents });

module.exports = async (bot, oldEmoji, newEmoji) => {
    // Récupérer les journaux d'audit pour l'événement EmojiUpdate
    const fetchedLogs = await oldEmoji.guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.EmojiUpdate,
    });

    const emojiUpdateLog = fetchedLogs.entries.first();
    let executorMention = "Inconnu"; // Valeur par défaut

    // Vérifier si le journal d'audit existe et obtenir l'exécuteur
    if (emojiUpdateLog) {
        const { executor: logExecutor } = emojiUpdateLog;
        executorMention = logExecutor ? `<@${logExecutor.id}>` : executorMention; // Mention de l'exécuteur
    }

    // Créer un embed pour afficher les détails des emojis
    const embed = new EmbedBuilder()
    .setTitle("**Un emoji à été mise à jour :**")
    .addFields(
        { name: "**Exécuteur :**", value: executorMention },
        { name: "**Ancien Nom de l'emoji :**", value: oldEmoji.name },
        { name: "**Nouveau Nom de l'emoji :**", value: newEmoji.name },
        { name: "**Emoji :**", value: newEmoji.toString() },
        { name: "**Date :**", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: false },)
        .setColor("#FFEB00")
        .setTimestamp()
        .setFooter({ text: 'Deltaria - Semi-Rp / Semi-RPG', iconURL: `${bot.user.displayAvatarURL()}` });

    // Envoyer l'embed dans le canal de log
    const channel = await bot.channels.fetch(config.logs_Channel);
    if (channel) await channel.send({ embeds: [embed] });

    // Optionnel : log dans la console
    console.log(`L'emoji a été mis à jour par ${executorMention}: ${oldEmoji.name} -> ${newEmoji.name}`);
};
