const Discord = require("discord.js");
const { EmbedBuilder } = require('discord.js');
const createId = require("../Fonctions/createId");

let reminders = []; // Stockage des rappels

module.exports = {
    name: "rappels",
    description: "Prévois un rappel",
    permission: "Aucune",
    category: "Information",
    dm: false,
    options: [
        {
            type: "string",
            name: "temps",
            description: "Combien de temps pour le rappel ? (par exemple: 1d30m1s, max 28j)",
            required: true,
            autocomplete: false
        },
        {
            type: "string",
            name: "raison",
            description: "Pour quelle raison vous voulez un rappel ?",
            required: true,
            autocomplete: false
        }
    ],

    async run(bot, message, args) {
        const temps = args.getString("temps");
        const raison = args.getString("raison");
        const userId = message.user.id; // ID du joueur qui crée le rappel

        // Regex pour extraire les jours, heures, minutes et secondes
        const timeRegex = /(?:(\d+)d)?(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/;
        const matches = timeRegex.exec(temps);

        if (!matches) {
            return message.reply("Format invalide ! Utilisez par exemple : `1d30m1s`.");
        }

        const days = parseInt(matches[1]) || 0;
        const hours = parseInt(matches[2]) || 0;
        const minutes = parseInt(matches[3]) || 0;
        const seconds = parseInt(matches[4]) || 0;

        const totalDays = days + (hours / 24) + (minutes / 1440) + (seconds / 86400);
        if (totalDays > 28) {
            return message.reply("La durée maximale est de 28 jours !");
        }

        const totalTime = 
            (days * 24 * 60 * 60 * 1000) + 
            (hours * 60 * 60 * 1000) + 
            (minutes * 60 * 1000) + 
            (seconds * 1000);

        // Récupérer l'ID de rappel avec un préfixe
        const reminderId = await createId("RAPPEL");

        // Stocker le rappel
        reminders.push({ id: reminderId, userId: userId, raison: raison });

        const embed = new EmbedBuilder()
            .setColor("#0099ff")
            .setTitle("Rappel prévu")
            .setDescription(`Je vous rappellerai dans ${days}j ${hours}h ${minutes}m ${seconds}s pour la raison suivante : ${raison}`)
            .setFooter({ text: `ID de rappel : ${reminderId}` });

        await message.reply({ embeds: [embed] });

        setTimeout(() => {
            message.user.send(`Voici votre rappel pour l'ID : ${reminderId}\nRaison : ${raison}`);
        }, totalTime);
    }
};
