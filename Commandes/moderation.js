const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const Discord = require("discord.js");
const config = require("../config");

module.exports = {
    name: "moderation",
    description: "Modérer un joueur",
    permission: "Aucune",
    category: "Modération",
    dm: false,
    options: [
        {
            type: "user",
            name: "utilisateur",
            description: "Le membre à modérer",
            required: true,
            autocomplete: false,
        }, 
        {
            type: "string",
            name: "raison",
            description: "Raison de la modération",
            required: true,
            autocomplete: false,
        }
    ],

    async run(bot, message, args) {


        let user = args.getUser("utilisateur").id;
        if(!user) return message.reply("Pas d'utilisateur !")

        let reason = args.getString("raison")
        if(!reason) reason = "Pas de raison fournie.";

        
        const embed = new EmbedBuilder()
            .setTitle("Panneau de modération")
            .setDescription(`Que souhaitez-vous faire avec **<@${user}>** ?`) // Mention de l'ID
            .setColor('#ff0000')
            .addFields({ name: "Raison", value: reason })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('moderation_panel')
                    .setPlaceholder('Choisissez une action')
                    .setMinValues(0) 
                    .setMaxValues(1)
                    .addOptions([
                        {
                            label: 'Bannir',
                            description: 'Bannir ce membre',
                            value: 'ban',
                        },
                        {
                            label: 'Debannir',
                            description: 'Débannir ce membre',
                            value: 'unban',
                        },
                        {
                            label: 'Kick',
                            description: 'Expulser ce membre',
                            value: 'kick',
                        },
                        {
                            label: 'Kick du vocal',
                            description: 'Kick un membre du vocal',
                            value: 'voiceKick',
                        },
                        {
                            label: 'Mute 1h',
                            description: 'Muter ce membre',
                            value: 'mute1H',
                        },
                        {
                            label: 'Mute 12h',
                            description: 'Muter ce membre',
                            value: 'mute12H',
                        },
                        {
                            label: 'Mute 1D',
                            description: 'Muter ce membre',
                            value: 'mute1D',
                        },
                        {
                            label: 'Mute 7D',
                            description: 'Muter ce membre',
                            value: 'mute7D',
                        },
                        {
                            label: 'Mute 28D',
                            description: 'Muter ce membre',
                            value: 'mute28D',
                        },
                        {
                            label: 'Demute',
                            description: 'Demuter ce membre',
                            value: 'unmute',
                        },
                    ])
            );

        await message.reply({ embeds: [embed], components: [row], ephemeral: false });
    }
};