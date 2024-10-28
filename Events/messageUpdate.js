const { AuditLogEvent, EmbedBuilder } = require("discord.js");
const Discord = require("discord.js")
const config = require("../config")
const intents = new Discord.IntentsBitField(3276799)
const bot = new Discord.Client({intents});

module.exports = async (bot, oldMessage, newMessage) => 
{

    if (oldMessage.author.bot || oldMessage.content === newMessage.content) return;

    // Récupérer l'ancien et le nouveau contenu
    const oldMessageContent = oldMessage.content || "Message vide";
    const newMessageContent = newMessage.content || "Message vide";

    const messageUpdateEmbed = new EmbedBuilder()
        .setTitle("**Un message a été modifié :**")
        .addFields(
            { name: "**Auteur du message :**", value: `<@${oldMessage.author.id}>` }, // Mention de l'auteur
            { name: "**Ancien message :**", value: oldMessageContent }, // Ancien contenu du message
            { name: "**Nouveau message :**", value: newMessageContent }, // Nouveau contenu du message
            { name: "**Date :**", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: false },)
        .setColor("#FFEB00")
        .setTimestamp()
        .setFooter({ text: 'Deltaria - Semi-Rp / Semi-RPG', iconURL: `${bot.user.displayAvatarURL()}` });

    const channel = await bot.channels.fetch(config.logs_Channel);
    if (channel) await channel.send({ embeds: [messageUpdateEmbed] });
};

