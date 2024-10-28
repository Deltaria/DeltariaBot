const Discord = require("discord.js");
const intents = new Discord.IntentsBitField(53608447);
const bot = new Discord.Client({ intents });
const { EmbedBuilder } = require('discord.js');
const config = require("../config");

module.exports = {
    name: "ticketadd",
    description: "Ajoute un joueur à un ticket",
    permission: Discord.PermissionFlagsBits.Administrator, // Restreint l'utilisation aux administrateurs
    category: "Information",
    dm: false,
    options: [
        {
            type: "user",
            name: "utilisateur",
            description: "Le membre à modérer",
            required: true,
            autocomplete: false,
        }
    ],

    async run(bot, message, args) {
        // Vérifier si un utilisateur est mentionné
        let user = await bot.users.fetch(args._hoistedOptions[0].value);
        if (!user) return message.reply({ content: "Il faut mentionner un membre du serveur.", ephemeral: true });
        let member = message.guild.members.cache.get(user.id);

        const channel = message.channel;

        // Vérifier si la commande est utilisée dans un canal de ticket
        if (!channel.name.startsWith('ticket-')) {
            return message.reply({ content: 'Cette commande doit être utilisée dans un canal de ticket.', ephemeral: true });
        }

        try {
            // Ajouter l'utilisateur au canal
            await channel.permissionOverwrites.edit(user, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true,
                AttachFiles: true,
                EmbedLinks: true,
                
            });

            message.reply({ content: `${user} a été ajouté au ticket.`, ephemeral: false });

        } catch (error) {
            console.error('Erreur lors de l\'ajout de l\'utilisateur au ticket :', error);
            message.reply({ content: `Une erreur est survenue lors de l'ajout de l'utilisateur au ticket.`, ephemeral: true });
        }
    }
};