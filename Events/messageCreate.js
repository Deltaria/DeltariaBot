const Discord = require("discord.js")
const intents = new Discord.IntentsBitField(53608447)
const bot = new Discord.Client({intents});
const { EmbedBuilder, ApplicationCommandOptionType } = require('discord.js');

module.exports = async(bot, message, guild) => {

    if(message.author.bot || message.channel.type === Discord.ChannelType.DM) return;
    if(message.channel.id === "1276181040414593125") return; 


}