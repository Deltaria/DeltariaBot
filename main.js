const Discord = require("discord.js");
const intents = new Discord.IntentsBitField(53608447)
const bot = new Discord.Client({intents});
const loadEvents = require("./Loaders/loadEvents");
const loadCommands = require("./Loaders/loadCommands");
const config = require("./config");

bot.commands = new Discord.Collection()
loadCommands(bot)
loadEvents(bot)

bot.invites = new Map();


bot.function = {
    createId: require("./Fonctions/createId"),
}

process.on('unhandledRejection', (error) => {
    console.error('Une promesse a été rejetée :', error);
});
bot.login(config.token)
