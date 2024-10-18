const Discord = require("discord.js");
const loadSlashCommands = require("../Loaders/loadSlashCommands");
const loadDatabase = require("../Loaders/loadDatabase");
module.exports = async bot => {

    await loadSlashCommands(bot)

    var currentdate = new Date().toLocaleString('fr-FR');

    bot.user.setActivity("être en cours de développement");
    
    console.log(`${bot.user.tag} s'est bien connecté le ${currentdate}`)
    

}