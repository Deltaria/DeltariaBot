const { AuditLogEvent, EmbedBuilder } = require("discord.js");
const Discord = require("discord.js");
const config = require("../config");
const intents = new Discord.IntentsBitField(53608447);
const bot = new Discord.Client({ intents });

module.exports = async (bot, oldMember, newMember, message) => {

    if (oldMember.roles.cache.size !== newMember.roles.cache.size) {
        // Vérifie si le rôle boost a été ajouté
        if (!oldMember.roles.cache.has('1299298532850667624') && newMember.roles.cache.has('1299298532850667624')) {
            const boostEmbed = new EmbedBuilder()
                .setTitle(`**<:boost_emoji:1299297044158091326> Nouveau boost :**`)
                .setDescription(`${newMember} vient de boost Deltaria. Merci à lui !
                Deltaria a désormais ${newMember.guild.premiumSubscriptionCount} boosts.
                Le serveur est au niveau ${newMember.guild.premiumTier}.`)
                .setColor("#FFEB00")
                .setTimestamp()
                .setFooter({ text: 'Deltaria - Semi-Rp / Semi-RPG', iconURL: bot.user.displayAvatarURL() });

            // Envoie l'embed dans le canal de boost spécifié dans la config
            bot.channels.cache.get(config.boost_Channel).send({ embeds: [boostEmbed] });
        }
    }

    let currentNickname = newMember.nickname || newMember.user.username;
    let clickablePseudo = `<@${newMember.user.id}>`;

    let oldNickname = oldMember.nickname || oldMember.user.username;
    let newNickname = newMember.nickname || newMember.user.username;

    // Changement de pseudo
    let nicknameMessage = oldNickname !== newNickname 
        ? `Ancien pseudo : **${oldNickname}**\nNouveau pseudo : **${newNickname}**`
        : "Aucun changement de pseudo n'a été effectué.";

    // Récupération des rôles avant et après
    const oldRoles = oldMember.roles.cache.map(role => role.id);
    const newRoles = newMember.roles.cache.map(role => role.id);


    // Gestion des rôles ajoutés et supprimés
    let addedRolesMessage = "Aucun rôle n'a été ajouté.";
    let removedRolesMessage = "Aucun rôle n'a été supprimé.";

    const addedRoles = newRoles.filter(roleId => !oldRoles.includes(roleId));
    const removedRoles = oldRoles.filter(roleId => !newRoles.includes(roleId));

    if (addedRoles.length > 0) {
        addedRolesMessage = addedRoles.map(roleId => `<@&${roleId}>`).join(', ');
    }
    if (removedRoles.length > 0) {
        removedRolesMessage = removedRoles.map(roleId => `<@&${roleId}>`).join(', ');
    }

    // Récupération des journaux d'audit pour trouver l'exécuteur
    let executorMessage = "L'exécuteur n'a pas été trouvé.";
    try {
        const fetchedLogs = await newMember.guild.fetchAuditLogs({
            type: AuditLogEvent.MemberRoleUpdate,
            limit: 1,
        });
        const auditLog = fetchedLogs.entries.first();
        if (auditLog && auditLog.executor) {
            executorMessage = `<@${auditLog.executor.id}>`;
        }
    } catch (error) {
    }


    // Gestion de la photo de profil
    let ppMessage = "";
    if (oldMember.displayAvatarURL() !== newMember.displayAvatarURL()) {
        ppMessage = `Le joueur a changé sa photo de profil.\nAncienne PP: ${oldMember.displayAvatarURL()}\nNouvelle PP: ${newMember.displayAvatarURL()}`;
    }

    // Gestion de la bannière
    let bannerMessage = "";
    if (oldMember.user.bannerURL() !== newMember.user.bannerURL()) {
        bannerMessage = `Le joueur a changé sa bannière.\nAncienne bannière: ${oldMember.user.bannerURL()}\nNouvelle bannière: ${newMember.user.bannerURL()}`;
    }

    // Gestion du statut
    let statusMessage = "";
    if (oldMember.presence && newMember.presence && oldMember.presence.status !== newMember.presence.status) {
        statusMessage = `Le joueur a changé son statut : **${newMember.presence.status}**`;
    }

    // Gestion des activités
    let activitiesMessage = "";
    if (newMember.presence && newMember.presence.activities.length > 0) {
        activitiesMessage = newMember.presence.activities
            .map(activity => `${activity.name}: ${activity.state || 'Aucun statut'}`)
            .join('\n');
    }

    // Création de l'embed
    const embed = new EmbedBuilder()
        .setTitle(`**Mise à jour d'un membre :**`)
        .addFields(
            { name: '**Pseudo du joueur :**', value: clickablePseudo },
            { name: '**Changement de pseudo :**', value: nicknameMessage },
            { name: '**Exécuteur :**', value: executorMessage },
            { name: '**Rôle(s) ajouté(s) :**', value: addedRolesMessage },
            { name: '**Rôle(s) supprimé(s) :**', value: removedRolesMessage }
        )
        .setColor("#FFEB00")
        .setTimestamp()
        .setFooter({ text: 'Deltaria - Semi-Rp / Semi-RPG', iconURL: bot.user.displayAvatarURL() });

    // Ajout des champs conditionnels si les messages ne sont pas vides
    if (ppMessage) embed.addFields({ name: '**Photo de profil :**', value: ppMessage });
    if (bannerMessage) embed.addFields({ name: '**Bannière :**', value: bannerMessage });
    if (statusMessage) embed.addFields({ name: '**Statut :**', value: statusMessage });
    if (activitiesMessage) embed.addFields({ name: '**Activités :**', value: activitiesMessage });

    // Envoi de l'embed dans le canal de logs
    const logChannel = bot.channels.cache.get(config.logs_Channel);
    if (logChannel) {
        logChannel.send({ embeds: [embed] });
    } else {
        console.error("Le canal de logs n'a pas été trouvé.");
    }
};
