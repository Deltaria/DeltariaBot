const Discord = require("discord.js");
const intents = new Discord.IntentsBitField(53608447);
const bot = new Discord.Client({ intents });
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const config = require("../config");

module.exports = {

    name: "role",
    description: "Envoie le message de rôle",
    permission: "Aucune",
    permission: Discord.PermissionFlagsBits.Administrator,
    category: "Administration",
    dm: false,

    async run(bot, message, args, db) 
    {
        const roles = [
            { label: 'Rôle - 𝙰𝚗𝚗𝚘𝚗𝚌𝚎𝚜', value: '1297172663558475788', emoji: '📢' }, // Annonce
            { label: 'Rôle - 𝙼𝚒𝚜𝚎 𝚊 𝚓𝚘𝚞𝚛', value: '1297172534344548474', emoji: '📢' }, // Mise à jour
            { label: 'Rôle - 𝚂𝚘𝚗𝚍𝚊𝚐𝚎𝚜', value: '1297172629752647711', emoji: '📢' }, // Sondage
            { label: 'Rôle - 𝙴𝚟𝚎𝚗𝚎𝚖𝚎𝚗𝚝𝚜', value: '1297172694646652928', emoji: '📢' }, // Events
            { label: 'Rôle - 𝙱𝚘𝚜𝚜 - 𝙰𝚔𝚒𝚖𝚒𝚝𝚜𝚞', value: '1297319111298252854', emoji: '📢'}, // Boss
            { label: 'Rôle - 𝙶𝚒𝚟𝚎𝚊𝚠𝚊𝚢', value: '1297319163529789480', emoji: '<:Giveaway:1297948803055222876>'}, // Giveaway
        ];

        // Vérifie quels rôles l'utilisateur possède
        const userRoles = message.member.roles.cache
            .filter(role => roles.some(r => r.value === role.id))
            .map(role => `- ${role.name}`) 
            .join('\n') || 'Aucun rôle';  

        // Crée les options du menu déroulant avec les rôles (sans emoji ni état par défaut)
        const roleOptions = roles.map(role => ({
            label: role.label,
            value: role.value
        }));

        // Créer le menu déroulant des rôles avec les options
        const roleMenu = new StringSelectMenuBuilder()
            .setCustomId('role_mention')
            .setPlaceholder('Choisissez vos rôles pour être notifiés.')
            .setMinValues(0) 
            .setMaxValues(roles.length)
            .addOptions(
                roles.map(role => ({
                    label: role.label,
                    value: role.value,
                    emoji: role.emoji,  // Ajoute l'emoji à l'option
                    default: message.member.roles.cache.has(role.value),
                }))
            );

        const row = new ActionRowBuilder().addComponents(roleMenu);

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`**🎭►rôles**`)
            .setDescription(`Choisissez quels salons vous intéressent pour obtenir les notifications.`)
            .addFields(
                { name: '**Rôle - 𝙰𝚗𝚗𝚘𝚗𝚌𝚎𝚜 :**', value: `Vous serez notifiés des annonces,` },
                { name: '**Rôle - 𝙼𝚒𝚜𝚎 𝚊 𝚓𝚘𝚞𝚛**', value: `Vous serez notifiés des mise à jour,`},
                { name: '**Rôle - 𝚂𝚘𝚗𝚍𝚊𝚐𝚎𝚜**', value: `Vous serez notifiés des sondages,`},
                { label: 'Rôle - 𝙴𝚟𝚎𝚗𝚎𝚖𝚎𝚗𝚝𝚜', value: '1297172694646652928', emoji: '📢' }, // Events
                { name: '**𝙱𝚘𝚜𝚜 - 𝙰𝚔𝚒𝚖𝚒𝚝𝚜𝚞 :**', value: `Vous serez notifiés pour les lancements des boss d'Akimitsu,`},
                { name: '**<:Giveaway:1297948803055222876> Rôle - 𝙶𝚒𝚟𝚎𝚊𝚠𝚊𝚢**', value: `Vous serez notifiés pour les lancements des GiveAways.`},
                )  
            .setTimestamp()
            .setFooter({ text: 'Deltaria - Semi-Rp / Semi-RPG', iconURL: `${bot.user.displayAvatarURL()}` });

        // Envoie le message et stocke l'ID
         const sentMessage = await bot.channels.fetch(config.role_Channel);
        if (sentMessage) await sentMessage.send({ embeds: [embed], components: [row], ephemeral: false });
        // Requête SQL pour vérifier l'existence d'une entrée
        const checkQuery = `SELECT * FROM saved_messages WHERE guild_id = ?`;
        const updateQuery = `UPDATE saved_messages SET role_message_id = ? WHERE guild_id = ?`;
        const insertQuery = `INSERT INTO saved_messages (guild_id, role_message_id) VALUES (?, ?)`;

        const guildId = message.guild.id;
        const messageId = sentMessage.id;

        // Vérification de l'existence de l'entrée dans la base de données
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
                        console.log('Message mis à jour avec succès dans la base de données.');
                    }
                });
            } else {
                // Sinon, insérer une nouvelle entrée
                bot.db.query(insertQuery, [guildId, messageId], (err) => {
                    if (err) {
                        console.error('Erreur lors de l\'insertion du message dans la base de données :', err);
                    } else {
                        console.log('Message inséré avec succès dans la base de données.');
                    }
                });
            }
        });
    }
};