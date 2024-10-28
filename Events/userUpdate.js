const { EmbedBuilder } = require("discord.js");
const config = require("../config");
const Discord = require("discord.js");
const intents = new Discord.IntentsBitField(3276799);
const bot = new Discord.Client({ intents });

module.exports = async (client, oldUser, newUser) => {
    // Crée un tableau pour les changements
    let avatarChange = "Aucun changement d'avatar";
    let bannerChange = "Aucun changement de bannière";

    // Vérifie si l'avatar a changé
    if (oldUser.avatar !== newUser.avatar) {
        avatarChange = `L'utilisateur ${newUser} a changé d'avatar.`; // Mentionne l'utilisateur
    }

    // Vérifie si la bannière a changé
    if (oldUser.banner !== newUser.banner) {
        bannerChange = `L'utilisateur ${newUser} a changé de bannière.`; // Mentionne l'utilisateur
    }

    // Création de l'embed
    const embed = new EmbedBuilder()
        .setTitle("Mise à jour de l'utilisateur")
        .addFields(
            { name: "Changement d'avatar", value: avatarChange, inline: false },
            { name: "Changement de bannière", value: bannerChange, inline: false }
        )
        .setTimestamp();

    // Affiche le nouvel avatar en tant que miniature
    if (newUser.avatar) {
        embed.setThumbnail(newUser.displayAvatarURL({ dynamic: true, size: 1024 })); // Affiche l'avatar en miniature
    }

    // Vérifie si la nouvelle bannière existe et l'affiche
    if (newUser.banner) {
        // Vérifie que la bannière est bien récupérée
        const bannerURL = newUser.bannerURL({ dynamic: true, size: 1024 });
        if (bannerURL) {
            embed.setImage(bannerURL); // Affiche la bannière sous forme d'image
        } else {
            console.error("Erreur lors de la récupération de la nouvelle bannière.");
        }
    }

    // Envoi des logs dans le canal de logs
    const logChannel = client.channels.cache.get(config.logs_Channel);
    if (logChannel) {
        await logChannel.send({ embeds: [embed] });
    } else {
        console.error("Le canal de logs n'a pas été trouvé.");
    }
};
