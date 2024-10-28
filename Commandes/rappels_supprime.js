const Discord = require("discord.js");
const createId = require("../Fonctions/createId");

module.exports = {
    name: "rappels_supprime",
    description: "Supprime un rappel via un ID",
    permission: "Aucune",
    category: "Information",
    dm: false,
    options: [
        {
            type: "string",
            name: "id",
            description: "ID du rappel à supprimer",
            required: true,
            autocomplete: false
        }
    ],

    async run(bot, message, args) {
        const reminderId = args.getString("id");
        const userId = message.user.id; // ID du joueur qui tente de supprimer

        // Rechercher le rappel dans le tableau
        const reminderIndex = reminders.findIndex(reminder => reminder.id === reminderId && reminder.userId === userId);

        if (reminderIndex === -1) {
            return message.reply("Vous ne pouvez pas supprimer ce rappel, soit il n'existe pas, soit vous n'êtes pas le propriétaire.");
        }

        // Supprimer le rappel
        reminders.splice(reminderIndex, 1);
        return message.reply(`Le rappel avec l'ID ${reminderId} a été supprimé avec succès.`);
    }
};
