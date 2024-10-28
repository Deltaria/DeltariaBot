const { EmbedBuilder } = require('discord.js');
const config = require("../config");

module.exports = async (bot, member) => {
    console.log(`Un nouveau membre a rejoint : ${member.user.tag}`);

    try {
        // Récupérer les invitations actuelles et les mettre à jour dans le cache avant de faire la comparaison
        const newInvites = await member.guild.invites.fetch();
        const cachedInvites = bot.invites.get(member.guild.id) || new Map(); // Si aucun cache n'existe, créer une nouvelle Map.
    
        // Mettre à jour le cache des invitations pour le serveur
        bot.invites.set(member.guild.id, new Map(newInvites.map((invite) => [invite.code, invite.uses])));
    
        // Trouver l'invitation qui a été utilisée
        const usedInvite = newInvites.find(invite => {
            const previousUses = cachedInvites.get(invite.code) || 0;
            return invite.uses > previousUses;
        });
    
        // Initialiser les variables pour l'auteur de l'invitation et le lien
        let inviter = "Inconnu";
        let inviteLink = "un lien d'invitation permanent";
    
        if (usedInvite) {
            inviter = usedInvite.inviter ? `<@${usedInvite.inviter.id}>` : "Inconnu";
            inviteLink = `https://discord.gg/${usedInvite.code}`;
            console.log(`L'invitation utilisée par ${member.user.tag} a été créée par : ${inviter} avec le lien ${inviteLink}`);
        } else {
            console.log(`Aucune invitation spécifique trouvée pour l'arrivée de ${member.user.tag}.`);
        }
    
        // Ajouter un rôle au nouveau membre
        member.roles.add("1296590843918155807");
    
        // Embed pour l'arrivée d'un nouveau membre
        const arriveeEmbed = new EmbedBuilder()
            .setTitle("🚀 ➤ Nouvelle arrivée")
            .setDescription(`**Bienvenue à <@${member.user.id}> qui a rejoint le discord de Deltaria.**`)
            .setColor("#F2BD07")
            .setTimestamp()
            .setFooter({ text: 'Deltaria - Semi-Rp / Semi-RPG', iconURL: `${bot.user.displayAvatarURL()}` });
    
        // Envoyer le message d'arrivée dans le canal général
        const generalChannel = bot.channels.cache.get(config.general_Channel);
        if (generalChannel) {
            await generalChannel.send({ embeds: [arriveeEmbed] });
        } else {
            console.error(`Le canal général (${config.general_Channel}) est introuvable.`);
        }
    
        // Embed pour les logs d'arrivée
        const logsArriveeEmbed = new EmbedBuilder()
            .setTitle("**Un nouveau joueur est arrivé :**")
            .setDescription(`
                **Pseudo:** <@${member.user.id}>
                **Invité par:** ${inviter}
                **Lien d'invitation:** ${inviteLink}
                **Date:** <t:${Math.floor(Date.now() / 1000)}:R>`)
                .setColor("#FFEB00")
                .setTimestamp()
            .setFooter({ text: 'Deltaria - Semi-Rp / Semi-RPG', iconURL: `${bot.user.displayAvatarURL()}` });
    
        // Envoyer les logs dans le canal de logs
        const logsChannel = bot.channels.cache.get(config.logs_Channel);
        if (logsChannel) {
            await logsChannel.send({ embeds: [logsArriveeEmbed] });
        } else {
            console.error(`Le canal de logs (${config.logs_Channel}) est introuvable.`);
        }
    } catch (error) {
        console.error(`Erreur lors de la récupération des nouvelles invitations pour ${member.guild.name}:`, error);
    }
};    