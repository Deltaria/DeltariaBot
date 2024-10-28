const Discord = require("discord.js");
const loadSlashCommands = require("../Loaders/loadSlashCommands");
const loadDatabase = require("../Loaders/loadDatabase");
const config = require("../config"); // Importe le fichier config
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const ms = require('ms');

 
module.exports = async bot => {

    bot.on('guildMemberUpdate', (oldMember, newMember) => {
        console.log(`Le membre ${oldMember.user.tag} a été mis à jour.`);
    });
    

    await loadSlashCommands(bot);
    bot.db = await loadDatabase();
    bot.db.connect(async function () {
        console.log("Base de données connectée");



        // Requête SQL pour récupérer l'ID du message pour chaque serveur
        const query = `SELECT guild_id, role_message_id FROM saved_messages`; 

        bot.db.query(query, async (err, results) => { 
            if (err) throw err;

            if (results.length > 0) {
                for (const result of results) {
                    const guildId = result.guild_id;
                    const messageId = result.role_message_id;

                    // Récupérer la guild
                    const guild = bot.guilds.cache.get(guildId); 
                    if (guild) {
                        // Récupérer le canal où le message a été envoyé
                        const channel = guild.channels.cache.get(config.roleChannelId, { force: true }); 
                        if (channel) {
                            try {
                                // Récupérer l'objet message
                                const message = await channel.messages.fetch(messageId); 

                                // (Optionnel) Mettre à jour le message ici si besoin
                                // ... 
                            } catch (error) {
                                if (error.code === 10008) { // Code d'erreur pour "Unknown Message"
                                    console.log(`Message ${messageId} non trouvé, renvoi du message...`);

                                    // *** Code pour renvoyer le message de rôles ***
                                    const roles = [
                                        { label: 'Rôle - 𝙰𝚗𝚗𝚘𝚗𝚌𝚎𝚜', value: '1297172663558475788' }, 
                                        { label: 'Rôle - 𝙼𝚒𝚜𝚎 𝚊 𝚓𝚘𝚞𝚛', value: '1297172534344548474' }, 
                                        { label: 'Rôle - 𝚂𝚘𝚗𝚍𝚊𝚐𝚎𝚜', value: '1297172629752647711' }, 
                                        { label: 'Rôle - 𝙴𝚟𝚎𝚗𝚎𝚖𝚎𝚗𝚝𝚜', value: '1297172694646652928' },
                                        { label: 'Rôle - 𝙱𝚘𝚜𝚜 - 𝙰𝚔𝚒𝚖𝚒𝚝𝚜𝚞', value: '1297319111298252854' }, 
                                        { label: 'Rôle - 𝙶𝚒𝚟𝚎𝚊𝚠𝚊𝚢', value: '1297319163529789480' }, 
                                    ];

                                    const roleOptions = roles.map(role => ({
                                        label: role.label,
                                        value: role.value
                                    }));

                                    const roleMenu = new StringSelectMenuBuilder()
                                        .setCustomId('role_mention')
                                        .setPlaceholder('Choisissez vos rôles pour être notifiés.')
                                        .setMinValues(0) 
                                        .setMaxValues(roles.length)
                                        .addOptions(roleOptions); 

                                    const row = new ActionRowBuilder().addComponents(roleMenu);

                                    const embed = new EmbedBuilder()
                                        .setColor('#0099ff')
                                        .setTitle(`**🎭►rôles**`)
                                        .setDescription(`Choisissez quels salons vous intéressent pour obtenir les notifications.`)
                                        .setTimestamp()
                                        .setFooter({ text: 'Deltaria - Semi-Rp / Semi-RPG', iconURL: `${bot.user.displayAvatarURL()}` });

                                    const sentMessage = await channel.send({ embeds: [embed], components: [row], ephemeral: false });

                                    // *** Code pour mettre à jour l'ID du message dans la base de données ***
                                    const updateQuery = `UPDATE saved_messages SET role_message_id = ? WHERE guild_id = ?`;
                                    bot.db.query(updateQuery, [sentMessage.id, guildId], (err) => {
                                        if (err) {
                                            console.error('Erreur lors de la mise à jour du message dans la base de données :', err);
                                        } else {
                                            console.log('Message mis à jour avec succès dans la base de données.');
                                        }
                                    });

                                } else {
                                    console.error(`Erreur lors de la récupération du message ${messageId} :`, error);
                                }
                            }
                        } else {
                            console.log(`Canal non trouvé dans la guild ${guildId}.`);
                        }
                    } else {
                        console.log(`Guild ${guildId} non trouvée.`);
                    }
                }
            } else {
                console.log("Aucun message trouvé dans la base de données.");
            }
        });
    });


    


    const query = 'SELECT guild_id, giveaway_message_id, time_giveaway, channel_giveaway_id, user_id FROM saved_message_giveaway';

    bot.db.query(query, async (err, results) => {
        if (err) throw err;
    
        if (results.length > 0) {
            // Grouper les résultats par giveaway_message_id
            const giveaways = {};
            for (const result of results) {
                if (!giveaways[result.giveaway_message_id]) {
                    giveaways[result.giveaway_message_id] = {
                        guildId: result.guild_id,
                        messageId: result.giveaway_message_id,
                        endTime: new Date(result.time_giveaway * 1000).getTime(),
                        channelId: result.channel_giveaway_id,
                        participants: [], // Initialiser la liste des participants
                    };
                }
                giveaways[result.giveaway_message_id].participants.push(result.user_id);
            }
    
            // Traiter chaque giveaway
            for (const giveawayId in giveaways) {
                const giveaway = giveaways[giveawayId];
                const { guildId, messageId, endTime, channelId, participants } = giveaway;
    
    
                const guild = bot.guilds.cache.get(guildId);
                if (guild) {
                    console.log(`Canal configuré pour la guilde ${guildId} : ${channelId}`);
    
                    const channel = await guild.channels.fetch(channelId).catch(() => null);
                    if (channel) {
                        try {
                            const giveawayMessage = await channel.messages.fetch(messageId).catch(() => null);
    
                            if (giveawayMessage) {
                                const currentTime = Date.now();
                                const timeLeft = endTime - currentTime;
    
                                console.log(`Giveaway ${messageId} - Current Time: ${currentTime}, End Time: ${endTime}, Time Left: ${timeLeft}`);
    
                                if (timeLeft > 0) {
                                    setTimeout(async () => {
                                        console.log(`Le giveaway ${messageId} est terminé !`);
    
                                        try {
                                            // Modifier l'embed du message pour annoncer le gagnant
                                            const winner = participants[Math.floor(Math.random() * participants.length)];
                                            const winnerEmbed = new EmbedBuilder()
                                                .setTitle("🎉 **Giveaway Terminé !** 🎉")
                                                .setDescription(`Félicitations <@${winner}>, tu as gagné le giveaway !`)
                                                .setColor("#ffcc00")
                                                .setTimestamp();
    
                                            await giveawayMessage.edit({ embeds: [winnerEmbed], components: [] }); // Supprimer les boutons
                                        } catch (error) {
                                            console.error(`Erreur lors de la modification du message du giveaway ${messageId} :`, error);
                                            if (participants.length > 0) {
                                                const winner = participants[Math.floor(Math.random() * participants.length)];
                                                channel.send(`Félicitations <@${winner}>, tu as gagné le giveaway !`); // Envoyer un message si l'édition échoue
                                            } else {
                                                channel.send(`Pas de gagnant pour ce giveaway.`); // Envoyer un message si l'édition échoue
                                            }
                                        }
    
                                        // Supprimer le giveaway de la base de données
                                        const deleteQuery = 'DELETE FROM saved_message_giveaway WHERE giveaway_message_id = ?';
                                        bot.db.query(deleteQuery, [messageId], (err, result) => {
                                            if (err) {
                                                console.error('Erreur lors de la suppression du giveaway de la base de données :', err);
                                            } else {
                                                console.log('Giveaway supprimé avec succès.');
                                            }
                                        });
                                    }, timeLeft);
                                } else {
                                    console.log(`Le giveaway ${messageId} est déjà terminé. Suppression de la base de données.`);
    
                                    // Supprimer le giveaway de la base de données
                                    const deleteQuery = 'DELETE FROM saved_message_giveaway WHERE giveaway_message_id = ?';
                                    bot.db.query(deleteQuery, [messageId], (err, result) => {
                                        if (err) {
                                            console.error('Erreur lors de la suppression du giveaway de la base de données :', err);
                                        } else {
                                            console.log('Giveaway supprimé avec succès.');
                                        }
                                    });
                                }
                            } else {
                                console.log(`Message ${messageId} non trouvé, peut-être supprimé.`);
                            }
                        } catch (error) {
                            if (error.code === 10008) {
                                console.log(`Message ${messageId} non trouvé, peut-être supprimé.`);
                            } else {
                                console.error(`Erreur lors de la récupération du message ${messageId} :`, error);
                            }
                        }
                    } else {
                        console.log(`Canal non trouvé dans la guilde ${guildId}.`);
                    }
                } else {
                    console.log(`Guilde ${guildId} non trouvée.`);
                }
            }
        } else {
            console.log("Aucun giveaway actif trouvé dans la base de données.");
        }
    });
    



    var currentdate = new Date().toLocaleString('fr-FR');
    bot.user.setActivity("être en cours de développement ...");
    console.log(`${bot.user.tag} s'est bien connecté le ${currentdate}`);

    process.on('unhandledRejection', (error) => {
        console.error('Une promesse a été rejetée :', error);
    });
};