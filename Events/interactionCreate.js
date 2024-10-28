const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const moment = require("moment");
const config = require("../config");
const Discord = require("discord.js")
const fs = require('fs');
const path = require('path');


moment.locale('fr');

module.exports = async (bot, interaction, args) => {
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

        if(interaction.commandName === "hdv") {

          let choices = ["vente", "achat"]
          let sortie = choices.filter(c => c.includes(entry))
          await interaction.respond(entry === "" ? sortie.map(c => ({name: c, value: c})) : sortie.map(c => ({name: c, value: c})))
      }
    }
    
    if (interaction.type === Discord.InteractionType.ApplicationCommand) {

        try {
            const commandPath = `../Commandes/${interaction.commandName}`;
            let command;
    
            try {
                command = require(commandPath);
            } catch (error) {
                console.error(`Commande introuvable : ${interaction.commandName}`, error);
                return interaction.reply({
                    content: "Cette commande n'existe pas ou a rencontré une erreur.",
                    ephemeral: true,
                });
            }
    
            await command.run(bot, interaction, interaction.options, bot.db);
    
            const args = interaction.options.data
                .map(option => `${option.name}: ${option.value}`)
                .join(', ');
    
            const commandEmbed = new EmbedBuilder()
            .setColor("#FFEB00")
            .setTitle("Une commande a été éxecutée")
                .setDescription(`
    **Auteur**: <@${interaction.user.id}>
    **Commande**: \`${interaction.commandName}\`
    **Arguments**: ${args || 'Aucun'}
    **Date**: <t:${Math.floor(Date.now() / 1000)}:R>`);
    
            const channel = await bot.channels.fetch(config.logs_Channel);
            if (channel) {
                await channel.send({ embeds: [commandEmbed] });
            } else {
                console.error("Le canal de logs n'a pas été trouvé.");
            }
    
        } catch (error) {
            console.error("Erreur lors de l'exécution de la commande :", error);
            await interaction.reply({
                content: "Une erreur est survenue lors de l'exécution de la commande.",
                ephemeral: true,
            });
        }
    }


    //Role Menu

    if (interaction.customId === 'role_mention') {
        const roles = [
            { label: 'Rôle - 𝙰𝚗𝚗𝚘𝚗𝚌𝚎𝚜', value: '1297172663558475788', emoji: '📢' }, // Annonce
            { label: 'Rôle - 𝙼𝚒𝚜𝚎 𝚊 𝚓𝚘𝚞𝚛', value: '1297172534344548474', emoji: '📢' }, // Mise à jour
            { label: 'Rôle - 𝚂𝚘𝚗𝚍𝚊𝚐𝚎𝚜', value: '1297172629752647711', emoji: '📢' }, // Sondage
            { label: 'Rôle - 𝙴𝚟𝚎𝚗𝚎𝚖𝚎𝚗𝚝𝚜', value: '1297172694646652928', emoji: '📢' }, // Events
            { label: 'Rôle - 𝙱𝚘𝚜𝚜 - 𝙰𝚔𝚒𝚖𝚒𝚝𝚜𝚞', value: '1297319111298252854', emoji: '📢'}, // Boss
            { label: 'Rôle - 𝙶𝚒𝚟𝚎𝚊𝚠𝚊𝚢', value: '1297319163529789480', emoji: '<:Giveaway:1297948803055222876>'}, // Giveaway
        ];
    
const member = await interaction.guild.members.fetch(interaction.member.id);

const userRoles = member.roles.cache;

const rolesWithEmoji = roles.map(role => {
    const hasRole = userRoles.has(role.value); 
    return {
        label: `${hasRole ? '✅ ' : ''}${role.label}`, 
        value: role.value,
        emoji: hasRole ? '✅' : null, 
    };
});
    
        const selectedRoleValues = interaction.values; 
    
        const rolesToAdd = [];
        const rolesToRemove = [];
    
        selectedRoleValues.forEach(value => {
            const role = interaction.guild.roles.cache.get(value);
            if (role) rolesToAdd.push(role);
        });
    
        interaction.member.roles.cache.forEach(role => {
            if (roles.some(r => r.value === role.id) && !selectedRoleValues.includes(role.id) && role.editable) {
                rolesToRemove.push(role);
            }
        });
    
        try {
            if (rolesToRemove.length > 0) {
                await interaction.member.roles.remove(rolesToRemove); 
            }
            if (rolesToAdd.length > 0) {
                await interaction.member.roles.add(rolesToAdd); 
            }
    
            const addedRoles = rolesToAdd.map(role => `+ ${role.name}`).join('\n') || 'Aucun rôle ajouté';
            const removedRoles = rolesToRemove.map(role => `- ${role.name}`).join('\n') || 'Aucun rôle supprimé';
            

            const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`**Rôle(s) mis à jour :**`)
            .addFields(
                { name: '**Joueur :**', value: `<@${interaction.user.id}>` },
                { name: '**Rôle(s) ajouté(s)**', value: `${addedRoles}`},
                { name: '**Rôle(s) supprimé(s):**', value: `${removedRoles}`},)              
                .setTimestamp()
            .setFooter({ text: 'Deltaria - Semi-Rp / Semi-RPG', iconURL: `${bot.user.displayAvatarURL()}` });


            await interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour des rôles:', error);
            if (error.code === 50013) { 
                await interaction.reply({
                    content: `Je n'ai pas les permissions nécessaires pour modifier vos rôles.`,
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: `Une erreur s'est produite lors de la mise à jour des rôles.`,
                    ephemeral: true
                });
            }
        }
    }
    
// Gestion de l'événement lorsque l'utilisateur sélectionne un type de ticket
if (!interaction.isStringSelectMenu() && !interaction.isButton()) return;

const ticketOptions = [
    {
        label: 'Administration',
        value: 'administration',
        emoji: '🏛️',
        roleIds: [config.administrationRoleId, config.responsableRoleId],
        categoryId: config.category_Ticket,
        logChannelId: config.logs_Ticket
    },
    {
        label: 'Modération',
        value: 'moderation',
        emoji: '🛡️',
        roleIds: [config.moderationRoleId, config.helpeurRoleId, config.responsableRoleId, config.moderationPlusId],
        categoryId: config.category_Ticket,
        logChannelId: config.logs_Ticket
    },
    {
        label: 'Animation',
        value: 'animation',
        emoji: '🎉',
        roleIds: [config.animationRoleId, config.responsableRoleId],
        categoryId: config.category_Ticket,
        logChannelId: config.logs_Ticket
    },
    {
        label: 'Scénario',
        value: 'scenario',
        emoji: '📜',
        roleIds: [config.scenarioRoleId, config.responsableRoleId],
        categoryId: config.category_Ticket,
        logChannelId: config.logs_Ticket
    },
    {
        label: 'Développement',
        value: 'developpement',
        emoji: '💻',
        roleIds: [config.developpementRoleId, config.responsableRoleId],
        categoryId: config.category_Ticket,
        logChannelId: config.logs_Ticket
    }
];

if (interaction.customId === 'ticket_select') {
    const selectedTicketValue = interaction.values[0];
    const selectedTicketOption = ticketOptions.find(t => t.value === selectedTicketValue);

    try {
        const newTicketChannel = await interaction.guild.channels.create({
            name: `ticket-${interaction.member.user.username}`,
            type: 0,
            parent: selectedTicketOption.categoryId,
            topic: `Ticket ouvert par ${interaction.member.user.tag} | Type: ${selectedTicketOption.value}`,
            permissionOverwrites: [
                {
                    id: interaction.guild.roles.everyone.id,
                    deny: ['ViewChannel'],
                },
                {
                    id: interaction.member.id,
                    allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', "AttachFiles", "UseExternalEmojis", "EmbedLinks"],
                },
                ...selectedTicketOption.roleIds.map(roleId => ({
                    id: roleId,
                    allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', "AttachFiles", "UseExternalEmojis", "EmbedLinks"],
                }))
            ]
        });

        const closeButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('Fermer le ticket')
                    .setStyle(ButtonStyle.Danger)   

            );

        const ticketEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle(`**Ticket de Support - ${selectedTicketOption.label}**`)
            .setDescription(`Un membre de notre staff vous répondra bientôt.
            En attendant l'arrivée d'un membre du staff, décrivez votre problème afin de vous aider.`)
            .addFields(
                { name: 'Type de support :', value: `${selectedTicketOption.label}` },
                { name: 'Utilisateur :', value: `<@${interaction.member.user.id}>` }
            )
            .setTimestamp()
            .setFooter({ text: 'Deltaria - Semi-Rp / Semi-RPG', iconURL: `${bot.user.displayAvatarURL()}` });

        await newTicketChannel.send({
            embeds: [ticketEmbed],
            content: `<@${interaction.member.id}> votre ticket a été créé.`,
            components: [closeButton]
        });

        await interaction.reply({
            content: `Votre ticket a été créé : <#${newTicketChannel.id}>`,
            ephemeral: true
        });

    } catch (error) {
        console.error('Erreur lors de la création du canal de ticket:', error);
        await interaction.reply({
            content: `Une erreur est survenue lors de la création du ticket.`,
            ephemeral: true
        });
    }
} else if (interaction.customId === 'close_ticket') { // Gérer la fermeture du ticket
    const ticketChannel = interaction.channel;

    const ticketTopic = ticketChannel.topic;
    const ticketTypeMatch = ticketTopic.match(/Type: (\w+)/);
    const ticketType = ticketTypeMatch ? ticketTypeMatch[1] : null;

    if (!ticketType) {
        await interaction.reply({ content: `Impossible de déterminer le type de ticket.`, ephemeral: true });
        return;
    }

    const selectedTicketOption = ticketOptions.find(t => t.value === ticketType);

    try {
        const messages = await ticketChannel.messages.fetch({ limit: 100 });
        let logData = `Ticket Archivé - ${ticketChannel.name}\n\n`;
        messages.reverse().forEach(msg => {
            logData += `${msg.author.tag} [${msg.createdAt}]: ${msg.content}\n`;
        });

        const logDir = path.join(__dirname, 'logs');
        const logFilePath = path.join(logDir, `ticket-${ticketChannel.name}.txt`);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        fs.writeFileSync(logFilePath, logData);

        const logAttachment = new AttachmentBuilder(logFilePath);
        const logChannel = await interaction.guild.channels.fetch(selectedTicketOption.logChannelId);
        if (logChannel) {
            await logChannel.send({
                content: `Archivage du ticket ${ticketChannel.name} :`,
                files: [logAttachment]
            });
        }

        await interaction.reply({ content: `Le ticket est en cours de fermeture. Les messages ont été archivés.`, ephemeral: true });
        setTimeout(async () => {
            await ticketChannel.delete();
        }, 5000);

    } catch (error) {
        console.error('Erreur lors de la fermeture du ticket :', error);
        await interaction.reply({ content: `Une erreur est survenue lors de la fermeture du ticket.`, ephemeral: true });
    }
}
    
    //ModerationPanel

    if (interaction.customId !== 'moderation_panel') return;

    const action = interaction.values[0];
    
    // Charger le salon de logs depuis la configuration
    const logsChannel = interaction.guild.channels.cache.get(config.sanctions_Channel);
    
    switch (action) 
    {
        case 'ban':
        {
            const userId = interaction.message.embeds[0]?.description.match(/<@(\d+)>/)?.[1];
            if (!userId) {
                return interaction.reply({ content: "L'utilisateur à bannir n'a pas été trouvé.", ephemeral: true });
            }
    
            try {
                const bans = await interaction.guild.bans.fetch();
                const isBanned = bans.has(userId);
    
                if (isBanned) {
                    return interaction.reply({ content: `L'utilisateur avec l'ID ${userId} est déjà banni.`, ephemeral: true });
                }
    
                const reason = interaction.message.embeds[0]?.fields.find(field => field.name === "Raison")?.value || "Aucune raison spécifiée";
                await interaction.guild.members.ban(userId, { reason });
    
                // Envoyer le message de bannissement dans le canal de logs
                if (logsChannel) {
                    logsChannel.send(`🔨 L'utilisateur <@${userId}> a été banni pour la raison suivante : ${reason}`);
                }
    
                return interaction.reply({ content: `L'utilisateur <@${userId}> a été banni avec succès pour la raison suivante : ${reason}`, ephemeral: true });
            } catch (error) {
                console.error('Erreur lors de la tentative de ban :', error);
                return interaction.reply({ content: "Une erreur est survenue lors de la tentative de bannissement. Veuillez réessayer.", ephemeral: true });
            }
        }
        break;
    
        case 'unban':
        {
            const userId = interaction.message.embeds[0]?.description.match(/<@(\d+)>/)?.[1];
            if (!userId) {
                return interaction.reply({ content: "L'utilisateur à débannir n'a pas été trouvé.", ephemeral: true });
            }
    
            try {
                const bans = await interaction.guild.bans.fetch();
                const bannedUser = bans.get(userId);
    
                if (!bannedUser) {
                    return interaction.reply({ content: `L'utilisateur avec l'ID ${userId} n'est pas banni.`, ephemeral: true });
                }
    
                await interaction.guild.members.unban(userId);
    
                // Envoyer le message de débannissement dans le canal de logs
                if (logsChannel) {
                    logsChannel.send(`✅ L'utilisateur <@${userId}> a été débanni avec succès.`);
                }
    
                return interaction.reply({ content: `L'utilisateur <@${userId}> a été débanni avec succès !`, ephemeral: true });
            } catch (error) {
                console.error('Erreur lors de la tentative de déban :', error);
                return interaction.reply({ content: "Une erreur est survenue lors de la tentative de débanissement. Veuillez réessayer.", ephemeral: true });
            }
        }
        break;
    
        // Les autres actions restent inchangées
        case 'kick':
            {
                const userId = interaction.message.embeds[0]?.description.match(/<@(\d+)>/)?.[1];
                if (!userId) {
                    return interaction.reply({ content: "L'utilisateur à expulser n'a pas été trouvé.", ephemeral: true });
                }
            
                try {
                    const member = await interaction.guild.members.fetch(userId);
                    if (!member) {
                        return interaction.reply({ content: `L'utilisateur avec l'ID ${userId} n'a pas été trouvé sur le serveur.`, ephemeral: true });
                    }
            
                    const reason = interaction.message.embeds[0]?.fields.find(field => field.name === "Raison")?.value || "Aucune raison spécifiée";
                    await member.kick(reason);
            
                    // Envoyer le message d'expulsion dans le canal de logs
                    if (logsChannel) {
                        logsChannel.send(`👢 L'utilisateur <@${userId}> a été expulsé pour la raison suivante : ${reason}`);
                    }
                    await interaction.message.delete(); // Supprimer le message

                    return interaction.reply({ content: `L'utilisateur <@${userId}> a été expulsé avec succès pour la raison suivante : ${reason}`, ephemeral: true });
                } catch (error) {
                    console.error('Erreur lors de la tentative d\'expulsion :', error);
                    return interaction.reply({ content: "Une erreur est survenue lors de la tentative d'expulsion. Veuillez réessayer.", ephemeral: true });
                }
            }        break;
    
        case 'mute1H':
            {
                const userId = interaction.message.embeds[0]?.description.match(/<@(\d+)>/)?.[1];
                if (!userId) {
                    return interaction.reply({ content: "L'utilisateur à mute n'a pas été trouvé.", ephemeral: true });
                }
            
                try {
                    const member = await interaction.guild.members.fetch(userId);
                    if (!member) {
                        return interaction.reply({ content: `L'utilisateur avec l'ID ${userId} n'a pas été trouvé sur le serveur.`, ephemeral: true });
                    }
            
                    // Vérifier si le membre est déjà mute
                    if (member.communicationDisabledUntilTimestamp && member.communicationDisabledUntilTimestamp > Date.now()) {
                        return interaction.reply({ content: `L'utilisateur <@${userId}> est déjà mute.`, ephemeral: true });
                    }
            
                    const reason = interaction.message.embeds[0]?.fields.find(field => field.name === "Raison")?.value || "Aucune raison spécifiée";
            
                    // Mettre l'utilisateur en mute pour 1 heure
                    await member.timeout(60 * 60 * 1000, reason); // 1 heure en millisecondes
            
                    // Envoyer le message de mute dans le canal de logs
                    if (logsChannel) {
                        logsChannel.send(`🔇 L'utilisateur <@${userId}> a été mute pendant 1 heure pour la raison suivante : ${reason}`);
                    }
                    await interaction.message.delete(); // Supprimer le message

                    return interaction.reply({ content: `L'utilisateur <@${userId}> a été mute avec succès pendant 1 heure pour la raison suivante : ${reason}`, ephemeral: true });
                } catch (error) {
                    console.error('Erreur lors de la tentative de mute :', error);
                    return interaction.reply({ content: "Une erreur est survenue lors de la tentative de mute. Veuillez réessayer.", ephemeral: true });
                }
            }        break;
    
        case 'mute12H':
            {
                const userId = interaction.message.embeds[0]?.description.match(/<@(\d+)>/)?.[1];
                if (!userId) {
                    return interaction.reply({ content: "L'utilisateur à mute n'a pas été trouvé.", ephemeral: true });
                }
            
                try {
                    const member = await interaction.guild.members.fetch(userId);
                    if (!member) {
                        return interaction.reply({ content: `L'utilisateur avec l'ID ${userId} n'a pas été trouvé sur le serveur.`, ephemeral: true });
                    }
            
                    // Vérifier si le membre est déjà mute
                    if (member.communicationDisabledUntilTimestamp && member.communicationDisabledUntilTimestamp > Date.now()) {
                        return interaction.reply({ content: `L'utilisateur <@${userId}> est déjà mute.`, ephemeral: true });
                    }
            
                    const reason = interaction.message.embeds[0]?.fields.find(field => field.name === "Raison")?.value || "Aucune raison spécifiée";
            
                    // Mettre l'utilisateur en mute pour 1 heure
                    await member.timeout(12 * 60 * 60 * 1000, reason); // 1 heure en millisecondes
            
                    // Envoyer le message de mute dans le canal de logs
                    if (logsChannel) {
                        logsChannel.send(`🔇 L'utilisateur <@${userId}> a été mute pendant 1 heure pour la raison suivante : ${reason}`);
                    }
                    await interaction.message.delete(); // Supprimer le message

                    return interaction.reply({ content: `L'utilisateur <@${userId}> a été mute avec succès pendant 1 heure pour la raison suivante : ${reason}`, ephemeral: true });
                } catch (error) {
                    console.error('Erreur lors de la tentative de mute :', error);
                    return interaction.reply({ content: "Une erreur est survenue lors de la tentative de mute. Veuillez réessayer.", ephemeral: true });
                }
            }       
            break;
    
        case 'mute1D':
            {
                const userId = interaction.message.embeds[0]?.description.match(/<@(\d+)>/)?.[1];
                if (!userId) {
                    return interaction.reply({ content: "L'utilisateur à mute n'a pas été trouvé.", ephemeral: true });
                }
            
                try {
                    const member = await interaction.guild.members.fetch(userId);
                    if (!member) {
                        return interaction.reply({ content: `L'utilisateur avec l'ID ${userId} n'a pas été trouvé sur le serveur.`, ephemeral: true });
                    }
            
                    // Vérifier si le membre est déjà mute
                    if (member.communicationDisabledUntilTimestamp && member.communicationDisabledUntilTimestamp > Date.now()) {
                        return interaction.reply({ content: `L'utilisateur <@${userId}> est déjà mute.`, ephemeral: true });
                    }
            
                    const reason = interaction.message.embeds[0]?.fields.find(field => field.name === "Raison")?.value || "Aucune raison spécifiée";
            
                    // Mettre l'utilisateur en mute pour 1 heure
                    await member.timeout(24 * 60 * 60 * 1000, reason); // 1 heure en millisecondes
            
                    // Envoyer le message de mute dans le canal de logs
                    if (logsChannel) {
                        logsChannel.send(`🔇 L'utilisateur <@${userId}> a été mute pendant 1 heure pour la raison suivante : ${reason}`);
                    }
                    await interaction.message.delete(); // Supprimer le message

                    return interaction.reply({ content: `L'utilisateur <@${userId}> a été mute avec succès pendant 1 heure pour la raison suivante : ${reason}`, ephemeral: true });
                } catch (error) {
                    console.error('Erreur lors de la tentative de mute :', error);
                    return interaction.reply({ content: "Une erreur est survenue lors de la tentative de mute. Veuillez réessayer.", ephemeral: true });
                }
            }       
            break;
        case 'mute7D':
            {
                const userId = interaction.message.embeds[0]?.description.match(/<@(\d+)>/)?.[1];
                if (!userId) {
                    return interaction.reply({ content: "L'utilisateur à mute n'a pas été trouvé.", ephemeral: true });
                }
            
                try {
                    const member = await interaction.guild.members.fetch(userId);
                    if (!member) {
                        return interaction.reply({ content: `L'utilisateur avec l'ID ${userId} n'a pas été trouvé sur le serveur.`, ephemeral: true });
                    }
            
                    // Vérifier si le membre est déjà mute
                    if (member.communicationDisabledUntilTimestamp && member.communicationDisabledUntilTimestamp > Date.now()) {
                        return interaction.reply({ content: `L'utilisateur <@${userId}> est déjà mute.`, ephemeral: true });
                    }
            
                    const reason = interaction.message.embeds[0]?.fields.find(field => field.name === "Raison")?.value || "Aucune raison spécifiée";
            
                    // Mettre l'utilisateur en mute pour 1 heure
                    await member.timeout(7 * 24 * 60 * 60 * 1000, reason); // 1 heure en millisecondes
            
                    // Envoyer le message de mute dans le canal de logs
                    if (logsChannel) {
                        logsChannel.send(`🔇 L'utilisateur <@${userId}> a été mute pendant 1 heure pour la raison suivante : ${reason}`);
                    }
                    await interaction.message.delete(); // Supprimer le message

                    return interaction.reply({ content: `L'utilisateur <@${userId}> a été mute avec succès pendant 1 heure pour la raison suivante : ${reason}`, ephemeral: true });
                } catch (error) {
                    console.error('Erreur lors de la tentative de mute :', error);
                    return interaction.reply({ content: "Une erreur est survenue lors de la tentative de mute. Veuillez réessayer.", ephemeral: true });
                }
            }       
            break;
            case 'mute28D':
                {
                    const userId = interaction.message.embeds[0]?.description.match(/<@(\d+)>/)?.[1];
                    if (!userId) {
                        return interaction.reply({ content: "L'utilisateur à mute n'a pas été trouvé.", ephemeral: true });
                    }
                
                    try {
                        const member = await interaction.guild.members.fetch(userId);
                        if (!member) {
                            return interaction.reply({ content: `L'utilisateur avec l'ID ${userId} n'a pas été trouvé sur le serveur.`, ephemeral: true });
                        }
                
                        // Vérifier si le membre est déjà mute
                        if (member.communicationDisabledUntilTimestamp && member.communicationDisabledUntilTimestamp > Date.now()) {
                            return interaction.reply({ content: `L'utilisateur <@${userId}> est déjà mute.`, ephemeral: true });
                        }
                
                        const reason = interaction.message.embeds[0]?.fields.find(field => field.name === "Raison")?.value || "Aucune raison spécifiée";
                
                        // Mettre l'utilisateur en mute pour 1 heure
                        await member.timeout(28 * 24 * 60 * 60 * 1000, reason); // 1 heure en millisecondes
                
                        // Envoyer le message de mute dans le canal de logs
                        if (logsChannel) {
                            logsChannel.send(`🔇 L'utilisateur <@${userId}> a été mute pendant 1 heure pour la raison suivante : ${reason}`);
                        }
                        await interaction.message.delete(); // Supprimer le message

                        return interaction.reply({ content: `L'utilisateur <@${userId}> a été mute avec succès pendant 1 heure pour la raison suivante : ${reason}`, ephemeral: true });
                    } catch (error) {
                        console.error('Erreur lors de la tentative de mute :', error);
                        return interaction.reply({ content: "Une erreur est survenue lors de la tentative de mute. Veuillez réessayer.", ephemeral: true });
                    }
                }       
                break;
        case 'voiceKick':
            {
                const userId = interaction.message.embeds[0]?.description.match(/<@(\d+)>/)?.[1];
                if (!userId) {
                    return interaction.reply({ content: "L'utilisateur à expulser du salon vocal n'a pas été trouvé.", ephemeral: true });
                }
            
                try {
                    const member = await interaction.guild.members.fetch(userId);
                    if (!member) {
                        return interaction.reply({ content: `L'utilisateur avec l'ID ${userId} n'a pas été trouvé sur le serveur.`, ephemeral: true });
                    }
            
                    // Vérifier si le membre est dans un salon vocal
                    if (!member.voice.channel) {
                        return interaction.reply({ content: `L'utilisateur <@${userId}> n'est pas connecté à un salon vocal.`, ephemeral: true });
                    }
            
                    const reason = interaction.message.embeds[0]?.fields.find(field => field.name === "Raison")?.value || "Aucune raison spécifiée";
                    await member.voice.disconnect(reason);
            
                    // Envoyer le message d'expulsion vocale dans le canal de logs
                    if (logsChannel) {
                        logsChannel.send(`🔊 L'utilisateur <@${userId}> a été déconnecté du salon vocal pour la raison suivante : ${reason}`);
                    }
                    await interaction.message.delete(); // Supprimer le message

                    return interaction.reply({ content: `L'utilisateur <@${userId}> a été déconnecté du salon vocal avec succès pour la raison suivante : ${reason}`, ephemeral: true });
                } catch (error) {
                    console.error('Erreur lors de la tentative de déconnexion vocale :', error);
                    return interaction.reply({ content: "Une erreur est survenue lors de la tentative de déconnexion vocale. Veuillez réessayer.", ephemeral: true });
                }
            }
        break;
        case 'unmute':
{
    const userId = interaction.message.embeds[0]?.description.match(/<@(\d+)>/)?.[1];
    if (!userId) {
        return interaction.reply({ content: "L'utilisateur à unmute n'a pas été trouvé.", ephemeral: true });
    }

    try {
        const member = await interaction.guild.members.fetch(userId);
        if (!member) {
            return interaction.reply({ content: `L'utilisateur avec l'ID ${userId} n'a pas été trouvé sur le serveur.`, ephemeral: true });
        }

        // Vérifier si le membre est mute
        if (!member.communicationDisabledUntilTimestamp || member.communicationDisabledUntilTimestamp < Date.now()) {
            return interaction.reply({ content: `L'utilisateur <@${userId}> n'est pas actuellement mute.`, ephemeral: true });
        }

        // Enlever le mute de l'utilisateur
        await member.timeout(null);

        // Envoyer le message de unmute dans le canal de logs
        if (logsChannel) {
            logsChannel.send(`🔊 L'utilisateur <@${userId}> a été unmute.`);
        }
        await interaction.message.delete(); // Supprimer le message

        return interaction.reply({ content: `L'utilisateur <@${userId}> a été unmute avec succès.`, ephemeral: true });
    } catch (error) {
        console.error('Erreur lors de la tentative de unmute :', error);
        return interaction.reply({ content: "Une erreur est survenue lors de la tentative de unmute. Veuillez réessayer.", ephemeral: true });
    }
}
break;
    
        default:
            return interaction.reply({ content: "Unknown action.", ephemeral: true });
    }
}






