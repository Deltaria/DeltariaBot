const Discord = require("discord.js");
const intents = new Discord.IntentsBitField(53608447);
const bot = new Discord.Client({ intents });
const { EmbedBuilder, ApplicationCommandOptionType } = require('discord.js');
const config = require("../config");

module.exports = {
    name: "hdv",
    description: "Envoie une annonce dans l'Hôtel de vente",
    permission: "Aucune",
    category: "Information",
    dm: false,
    options: 
    [
        {
            type: 'string',
            name: "action",
            description: "Achat ou Vente",  
            required: true,
            autocomplete: true
        },
        {
            type: 'string',
            name: "item",
            description: "Qu'est ce que tu veux vendre ou acheter ?",  
            required: true,
            autocomplete: false
        },
        {
            type: 'string',
            name: "prix",
            description: "A quel prix ?",  
            required: true,
            autocomplete: false
        },
        {
            type: 'string',
            name: "precision",
            description: "Veux-tu ajoutés des précisions ?",  
            required: false,
            autocomplete: false
        }      
        
    
    ],


    async run(bot, message, args) 
    {
        let acte = args.getString("action")
        if(acte !== "achat" && acte !== "vente") return message.reply("Indique Achat ou Vente")
        
        let objet = args.getString("item")
        if(!objet) item = `**❌ ➤ Merci de préciser l'objet.**`;

        let price = args.getString("prix")
        if(!price) price = `**❌ ➤ Merci de préciser le prix.**`;

        let description = args.getString("precision");
        if (!description) description = "Aucune raison n'a été fournie.";

        let hdvEmbed = new EmbedBuilder()
            .setTitle(`**💰► Nouvelle annonce **`)
            .setThumbnail(message.user.displayAvatarURL({dynamic: true}))
            .addFields(
                { name: '**Joueur :**', value: `<@${message.user.id}>` },
                { name: '**Achat / Vente :**', value: `${acte}`},
                { name: '**Objets / Blocs :**', value: `${objet}`},
                { name: '**Prix :**', value: `${objet}`},
                { name: '**Précision(s)**', value: `${description}`},
                )            
            .setColor("#AE00F4")
            .setTimestamp()
            .setFooter({ text: 'Deltaria - Semi-Rp / Semi-RPG', iconURL: `${bot.user.displayAvatarURL()}`});

            message.reply({ content: 'Ton annonce a bien été envoyée.', ephemeral: true })
            const channel = await bot.channels.fetch(config.hdv_Channel);
            if (channel) await channel.send({ embeds: [hdvEmbed] });
        

    }
}
