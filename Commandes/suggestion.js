const Discord = require("discord.js");
const intents = new Discord.IntentsBitField(53608447);
const bot = new Discord.Client({ intents });
const { EmbedBuilder } = require('discord.js');
const config = require("../config");

module.exports = {
    name: "suggestion",
    description: "Envoie une suggestion",
    permission: "Aucune",
    category: "Information",
    dm: false,
    options: 
    [
        {
            type: "string",
            name: "description",
            description: "La description de la suggestion",
            required: true,
            autocomplete: false,
        }
    
    ],


    async run(bot, message, args) 
    {

        let suggest = args.getString("description")
        if(!suggest) description = `**❌ ➤ Merci de préciser votre suggestion.**`;

        let suggestEmbed = new EmbedBuilder()
            .setTitle(`**💡► Nouvelle suggestion **`)
            .setThumbnail(message.user.displayAvatarURL({dynamic: true}))
            .addFields(
                { name: '**Joueur :**', value: `<@${message.user.id}>` },
                { name: '**Suggestions :**', value: `${suggest}`},
                )            
            .setColor("#AE00F4")
            .setTimestamp()
            .setFooter({ text: 'Deltaria - Semi-Rp / Semi-RPG', iconURL: `${bot.user.displayAvatarURL()}`});

            message.reply({ content: 'Ta suggestion a bien été envoyée.', ephemeral: true })

            let suggestion = await bot.channels.fetch(config.suggestion_Channel);
            if (channel) await channel.send({ embeds: [suggestEmbed] });
            suggestion.react(`<:pour:1296896729559466084>`);
            suggestion.react(`<:neutre:1296896690992713770>`);
            suggestion.react(`<:contre:1296896751134965862>`);
            message.reply({ content: 'Ta suggestion a été envoyée avec succès.', ephemeral: true })
            suggestion.startThread({
              name: `Sugestion : ${suggest}`,
              type: 'GUILD_PUBLIC_THREAD'});
    }
}
