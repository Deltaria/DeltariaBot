const Discord = require("discord.js");
const intents = new Discord.IntentsBitField(53608447);
const bot = new Discord.Client({ intents });
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const config = require("../config");

module.exports = {

    name: "ticket",
    description: "Envoie le menu de ticket",
    permission: Discord.PermissionFlagsBits.Administrator,
    category: "Administration",
    dm: false,

    async run(bot, message, args, db) {

        // Définition des options de tickets
        const ticketOptions = [
            {
                label: "Administration",
                value: "administration",
                description: "Discuter en privé avec les administrateurs de Deltaria,",
                emoji: "🏛️" 
            },
            {
                label: "Modération",
                value: "moderation",
                description: "Discuter en privé avec les modérateurs de Deltaria,",
                emoji: "🛡️" 
            },
            {
                label: "Animation",
                value: "animation",
                description: "Discuter en privé avec les animateurs de Deltaria,",
                emoji: "🎉" 
            },
            {
                label: "Scénario",
                value: "scenario",
                description: "Discuter en privé avec les scénaristes de Deltaria,",
                emoji: "📜" 
            },
            {
                label: "Développement",
                value: "developpement",
                description: "Discuter en privé avec les développeurs de Deltaria,",
                emoji: "💻" 
            },
        ];

        // Création du menu déroulant
        const ticketMenu = new StringSelectMenuBuilder()
            .setCustomId('ticket_select') // Important : cet ID doit être unique
            .setPlaceholder('Choisissez un type de ticket')
            .addOptions(ticketOptions);

        const row = new ActionRowBuilder().addComponents(ticketMenu);

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setDescription(`Vous ne savez pas dans quelle catégorie créez votre ticket ? N'hésitez pas à demander à un membre du staff.`)
            .addFields(
                { name: '**Ticket Administration :**', value: `Vous souhaitez discutez avec l'équipe d'Administrateurs ?` },
                { name: '**Ticket Modération :**', value: `Vous souhaitez discutez avec l'équipe de Modérateurs ?` },
                { name: '**Ticket Animation :**', value: `Vous souhaitez discutez avec l'équipe d'Animation ?`},
                { name: '**Ticket Scénario :**', value: `Vous souhaitez discutez avec l'équipe de Scénariste ?`},
                { name: '**Ticket Développement :**', value: `Vous souhaitez discutez avec l'équipe de Développeurs ?` },
)            .setTimestamp()
            .setFooter({ text: 'Deltaria - Semi-Rp / Semi-RPG', iconURL: `${bot.user.displayAvatarURL()}` });

        // Envoi du message et stockage de l'ID
        const sentMessage = await bot.channels.fetch(config.ticket_Channel);
        if (sentMessage) await sentMessage.send({ embeds: [embed], components: [row], ephemeral: false });

        // Requête SQL pour enregistrer l'ID du message dans la base de données
        const checkQuery = `SELECT * FROM saved_messages WHERE guild_id = ?`;
        const updateQuery = `UPDATE saved_messages SET ticket_message_id = ? WHERE guild_id = ?`;
        const insertQuery = `INSERT INTO saved_messages (guild_id, ticket_message_id) VALUES (?, ?)`;

        const guildId = message.guild.id;
        const messageId = sentMessage.id;

        bot.db.query(checkQuery, [guildId], (error, results) => {
            if (error) {
                console.error('Erreur lors de la vérification du message dans la base de données :', error);
                return;
            }

            if (results.length > 0) {
                // Si un message existe déjà, le mettre à jour
                bot.db.query(updateQuery, [messageId, guildId], (err) => {
                    if (err) {
                        console.error('Erreur lors de la mise à jour du message dans la base de données :', err);
                    } else {
                        console.log('ID du message mis à jour avec succès dans la base de données.');
                    }
                });
            } else {
                // Sinon, insérer une nouvelle entrée
                bot.db.query(insertQuery, [guildId, messageId], (err) => {
                    if (err) {
                        console.error('Erreur lors de l\'insertion du message dans la base de données :', err);
                    } else {
                        console.log('ID du message inséré avec succès dans la base de données.');
                    }
                });
            }
        });
    }
};