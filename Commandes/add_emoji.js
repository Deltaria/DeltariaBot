const Discord = require("discord.js");
const intents = new Discord.IntentsBitField(53608447);
const bot = new Discord.Client({ intents });
const { EmbedBuilder, ApplicationCommandOptionType } = require('discord.js');
const config = require("../config");

module.exports = {
    name: "add_emoji",
    description: "Ajoute un Emoji au serveur",
    permission: "Aucune",
    permission: Discord.PermissionFlagsBits.MANAGE_EMOJIS_AND_STICKERS,
    category: "Information",
    dm: false,
    options: 
    [
        {
            type: 'attachment',
            name: "emoji",
            description: "Ajoute l'image de l'Emoji que tu veux ajouter.",  
            required: true,
            autocomplete: true
        },
        {
            type: 'string',
            name: "nameemoji",
            description: "Ajoute le nom de l'Emoji. ",  
            required: true,
            autocomplete: false
        }      
    ],


    async run(bot, message, args) 
    {
        let upload = args.getAttachment("emoji")
        if(!upload) emoji = `**❌ ➤ Merci de mettre un fichier PNG ou JPEG**`;

        let nom = args.getString("nameemoji")
        if(!nom) nom = `**❌ ➤ Merci de mettre un nom à l'emoji**`;

        await message.reply({content: "Chargement de l'emoji en cours ..."})

        const emoji = await message.guild.emojis.create({attachment: `${upload.attachment}`, name: `${nom}`})

        setTimeout(() => {
            if(!emoji) return;

            let addEmoji = new EmbedBuilder()
            .addFields(
                { name: '**Emoji ajouté par :**', value: `<@${message.user.id}>` },
                { name: `**Nom de l'emoji :**`, value: `${nom}`},
                { name: '**Emoji :**', value: `${emoji}`},
                )            
            .setColor("#AE00F4")
            .setTimestamp()
            .setFooter({ text: 'Deltaria - Semi-Rp / Semi-RPG', iconURL: `${bot.user.displayAvatarURL()}`});

            message.editReply({content: ``, embeds: [addEmoji]})
        
        })
    }
};