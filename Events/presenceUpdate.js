const { EmbedBuilder } = require("discord.js");
const Discord = require("discord.js");
const config = require("../config");
const intents = new Discord.IntentsBitField(3276799);
const bot = new Discord.Client({ intents });

const customStatusNames = {
    online: "Actif",
    idle: "Inactif",
    dnd: "Ne pas déranger",
    offline: "Déconnecté"
};

module.exports = async (bot, oldPresence, newPresence) => {
    // Vérifie si l'ancienne ou la nouvelle présence est définie
    if (!oldPresence || !newPresence) return;

    const member = newPresence.member;

    // Ignore les mises à jour de présence pour les bots
    if (member.user.bot) return;

    // Crée des tableaux pour les changements
    let activityChange = "Aucun changement d'activité";
    let statusChange = "Aucun changement de statut";

    // Détection des changements d'activité
    const oldActivities = oldPresence.activities || [];
    const newActivities = newPresence.activities || [];

    // Vérification des activités (sans le statut personnalisé)
    const activityWithoutCustomStatus = newActivities.filter(activity => activity.type !== 'CUSTOM_STATUS');
    const oldActivityWithoutCustomStatus = oldActivities.filter(activity => activity.type !== 'CUSTOM_STATUS');

    if (oldActivityWithoutCustomStatus.length !== activityWithoutCustomStatus.length) {
        activityChange = `L'utilisateur ${member} a changé d'activité.`; // Mentionne l'utilisateur
    } else {
        activityWithoutCustomStatus.forEach((newActivity, index) => {
            const oldActivity = oldActivityWithoutCustomStatus[index];

            if (!oldActivity || newActivity.name !== oldActivity.name || newActivity.state !== oldActivity.state) {
                activityChange = `L'utilisateur ${member} a changé d'activité : **${newActivity.name}** (${newActivity.state || 'aucun état'})`; // Mentionne l'utilisateur
            }
        });
    }

    // Détection des changements de statut
    if (oldPresence.status !== newPresence.status) {
        const oldStatusName = customStatusNames[oldPresence.status] || oldPresence.status;
        const newStatusName = customStatusNames[newPresence.status] || newPresence.status;
        statusChange = `L'utilisateur ${member} a changé de statut : **${oldStatusName}** -> **${newStatusName}**`; // Mentionne l'utilisateur
    }

    // Création de l'embed
    const embed = new EmbedBuilder()
        .setTitle("Mise à jour de la présence")
        .addFields(
            { name: "Changement d'activité", value: activityChange, inline: false },
            { name: "Changement de statut", value: statusChange, inline: false }
        )
        .setTimestamp();

    // Envoi des logs dans le canal de logs
    const logChannel = bot.channels.cache.get(config.logs_Channel);
    if (logChannel) {
        await logChannel.send({ embeds: [embed] });
    } else {
        console.error("Le canal de logs n'a pas été trouvé.");
    }
};
