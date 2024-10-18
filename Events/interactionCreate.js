const { EmbedBuilder } = require("discord.js");
const moment = require("moment");
const config = require("../config");
const Discord = require("discord.js")

moment.locale('fr');

module.exports = async (bot, interaction) => {
    if (interaction.type === Discord.InteractionType.ApplicationCommandAutocomplete) {
        let entry = interaction.options.getFocused();

        if (interaction.commandName === "help") {
            let choices = bot.commands.filter(cmd => cmd.name.includes(entry));
            await interaction.respond(
                entry === "" 
                ? bot.commands.map(cmd => ({ name: cmd.name, value: cmd.name })) 
                : choices.map(choice => ({ name: choice.name, value: choice.name }))
            );
        }
    }
    
    if (interaction.type === Discord.InteractionType.ApplicationCommand) {

        let command = require(`../Commandes/${interaction.commandName}`);
        await command.run(bot, interaction, interaction.options, bot.db);

        // Récupérer les arguments sous forme de chaîne de caractères
        const args = interaction.options.data.map(option => `${option.name}: ${option.value}`).join(', ');

        const commandEmbed = new EmbedBuilder()
            .setColor("#5900FF")
            .setTitle("Commande exécutée")
            .setDescription(`
Auteur de l'exécution de la commande : <@${interaction.user.id}>
Commande : \`${interaction.commandName}\`
Date : <t:${Math.floor(Date.now() / 1000)}:R>`)

        await bot.channels.cache.get(config.logsSalon).send({ embeds: [commandEmbed] });
    }
};