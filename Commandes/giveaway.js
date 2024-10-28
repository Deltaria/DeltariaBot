const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const config = require("../config");
const ms = require('ms');

module.exports = {
    name: "giveaway",
    description: "Crée un giveaway",
    permission: "Aucune",
    category: "Information",
    dm: false,
    options: [
        {
            type: "string",
            name: "winner",
            description: "Défini le nombre de gagnants",
            required: true,
            autocomplete: false,
        },
        {
            type: "string",
            name: "gain",
            description: "Défini le gain",
            required: true,
            autocomplete: false,
        },
        {
            type: "string",
            name: "temps",
            description: "Défini la durée du giveaway (ex: 1h, 30m, 10s)",
            required: true,
            autocomplete: false,
        },
    ],

    async run(bot, interaction) {
        const winnerCount = parseInt(interaction.options.getString('winner'));
        const gain = interaction.options.getString('gain');
        const temps = interaction.options.getString('temps');

        const giveawayEmbed = new EmbedBuilder()
            .setTitle("🎉 **Nouveau Giveaway !** 🎉")
            .addFields(
                { name: "Nombre de gagnants", value: `${winnerCount}` },
                { name: "Gain", value: gain },
                { name: "Durée", value: temps }
            )
            .setColor("#ffcc00")
            .setTimestamp()
            .setFooter({ text: 'Bonne chance à tous !', iconURL: bot.user.displayAvatarURL() });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('giveaway_participate')
                    .setLabel('🎉 Participer')
                    .setStyle(ButtonStyle.Primary)
            );

        const giveawayChannel = await bot.channels.fetch(config.giveaway_Channel);
        if (!giveawayChannel) {
            return interaction.reply({ content: "Le canal de giveaway n'a pas été trouvé dans la configuration.", ephemeral: true });
        }

        const giveawayMessage = await giveawayChannel.send({
            embeds: [giveawayEmbed],
            components: [row]
        });

        // Enregistrer le message dans la base de données
        const guildId = interaction.guild.id;
        const messageId = giveawayMessage.id;
        const endTimeInSeconds = Math.floor(Date.now() / 1000) + ms(temps) / 1000; // Calculer l'heure de fin en secondes

        const insertQuery = 'INSERT INTO saved_message_giveaway (guild_id, giveaway_message_id, channel_giveaway_id, time_giveaway, user_id) VALUES (?, ?, ?, ?, ?)';

        await interaction.reply({ content: "🎉 Le giveaway a été créé avec succès !", ephemeral: true });

        const collector = giveawayMessage.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: ms(temps)
        });

        collector.on('collect', async i => {
            if (i.customId === 'giveaway_participate') {
                // Vérifier si l'utilisateur participe déjà
                const checkParticipantQuery = 'SELECT * FROM saved_message_giveaway WHERE giveaway_message_id = ? AND user_id = ?';
                bot.db.query(checkParticipantQuery, [messageId, i.user.id], (err, results) => {
                    if (err) {
                        console.error('Erreur lors de la vérification de la participation dans la base de données :', err);
                        return i.reply({ content: 'Une erreur est survenue.', ephemeral: true });
                    }

                    if (results.length > 0) {
                        return i.reply({ content: `❌ ${i.user}, vous êtes déjà inscrit au giveaway !`, ephemeral: true });
                    } else {
                        // Insérer l'utilisateur dans la base de données
                        bot.db.query(insertQuery, [guildId, messageId, config.giveaway_Channel, endTimeInSeconds, i.user.id], (err) => {
                            if (err) {
                                console.error('Erreur lors de l\'insertion du participant dans la base de données :', err);
                                return i.reply({ content: 'Une erreur est survenue.', ephemeral: true });
                            } else {
                                console.log('Participant inséré avec succès dans la base de données.');
                                i.reply({ content: `🎉 ${i.user}, vous avez rejoint le giveaway !`, ephemeral: true });
                            }
                        });
                    }
                });
            }
        });

        collector.on('end', async () => {
            // Récupérer tous les participants du giveaway
            const getParticipantsQuery = 'SELECT user_id FROM saved_message_giveaway WHERE giveaway_message_id = ?';
            bot.db.query(getParticipantsQuery, [messageId], async (err, results) => {
                if (err) {
                    console.error('Erreur lors de la récupération des participants dans la base de données :', err);
                    return giveawayChannel.send('Une erreur est survenue lors de la récupération des participants.');
                }

                if (results.length === 0) {
                    return giveawayChannel.send("Personne n'a participé au giveaway.");
                }

                const participants = results.map(result => result.user_id);
                const winners = participants.sort(() => 0.5 - Math.random()).slice(0, winnerCount);

                try {
                    // Récupérer le canal du giveaway
                    const channel = await bot.channels.fetch(config.giveaway_Channel);

                    // Récupérer le message du giveaway
                    const giveawayMessage = await channel.messages.fetch(messageId);

                    // Modifier l'embed du message pour annoncer le gagnant et ajouter le bouton de reroll
                    const winnerEmbed = new EmbedBuilder()
                        .setTitle("🎉 **Giveaway Terminé !** 🎉")
                        .setDescription(`Félicitations ${winners.map(w => `<@${w}>`).join(', ')}, vous avez gagné le giveaway !`)
                        .setColor("#ffcc00")
                        .setTimestamp();

                    const rerollRow = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('giveaway_reroll')
                                .setLabel('🔄 Re-Roll')
                                .setStyle(ButtonStyle.Secondary)
                        );

                    await giveawayMessage.edit({ embeds: [winnerEmbed], components: [rerollRow] });

                    // Créer un nouveau collecteur pour le bouton de reroll
                    const rerollCollector = giveawayMessage.createMessageComponentCollector({
                        componentType: ComponentType.Button,
                        time: ms('1h') // Durée pendant laquelle le bouton de reroll est actif
                    });

                    rerollCollector.on('collect', async i => {
                        if (i.customId === 'giveaway_reroll') {
                            const newWinners = participants.sort(() => 0.5 - Math.random()).slice(0, winnerCount);
                            await giveawayChannel.send(`🔄 Nouveau tirage : Félicitations aux nouveaux gagnants : ${newWinners.map(w => `<@${w}>`).join(', ')} !`);
                            await i.reply({ content: '🔄 Nouveau tirage effectué avec succès !', ephemeral: true });
                        }
                    });

                    rerollCollector.on('end', async () => {
                        // Supprimer le bouton de reroll après la durée spécifiée
                        try {
                            await giveawayMessage.edit({ components: [] });
                        } catch (error) {
                            console.error("Erreur lors de la suppression du bouton de reroll :", error);
                        }
                    });

                } catch (error) {
                    console.error(`Erreur lors de la modification du message du giveaway ${messageId} :`, error);
                    giveawayChannel.send(`🎉 Félicitations aux gagnants : ${winners.map(w => `<@${w}>`).join(', ')} !`); // Envoyer un message si l'édition échoue

                    // ... (code pour le reroll dans un nouveau message si l'édition échoue) ...
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
            });
        });
    }
};