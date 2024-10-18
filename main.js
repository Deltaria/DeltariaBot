const Discord = require("discord.js");
const intents = new Discord.IntentsBitField(53608447)
const bot = new Discord.Client({intents});
const loadEvents = require("./Loaders/loadEvents");
const loadCommands = require("./Loaders/loadCommands");
const config = require("./config");

bot.commands = new Discord.Collection()
loadCommands(bot)
loadEvents(bot)

bot.login(config.token)
