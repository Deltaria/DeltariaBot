const Discord = require("discord.js");
const intents = new Discord.IntentsBitField(53608447);
const bot = new Discord.Client({ intents });
const { EmbedBuilder } = require('discord.js');
const config = require("../config");

module.exports = {
    name: "staff",
    description: "Envoie la liste du staff",
    permission: "Aucune",
    permission: Discord.PermissionFlagsBits.Administrator,
    category: "Information",
    dm: false,



    async run(bot, message, args) 
    {
        let staffEmbed = new EmbedBuilder()
        .setTitle(`**Staff de Deltaria**`)
        .addFields(
            { name: '**𝙰𝚍𝚖𝚒𝚗𝚒𝚜𝚝𝚛𝚊𝚝𝚎𝚞𝚛 :**', value: `
            - BxAlpha | <@493797881342590976> <:BxFouco:1296961990589157428>
- Tennosei | <@980913787047657513> <:tennosei:1296961991721750598>`},
            
            { name: '**𝚁𝚎𝚜𝚙𝚘𝚗𝚜𝚊𝚋𝚕𝚎 :**', value: `
            - Aucun`},

            { name: '**𝙼𝚘𝚍𝚎𝚛𝚊𝚝𝚎𝚞𝚛 +:**', value: `
            - Aucun`},

            { name: '**𝙼𝚘𝚍𝚎𝚛𝚊𝚝𝚎𝚞𝚛 :**', value: `
            - Machoire | <@1094529084647821312> <:machoire:1296967979006689331>
- Livai | <@646021370706264064> <:YlannBloo:1297212441284968509>`},

            { name: '**𝙷𝚎𝚕𝚙𝚎𝚞𝚛 :**', value: `
            - Aucun`},

            { name: '**𝙰𝚗𝚒𝚖𝚊𝚝𝚎𝚞𝚛 :**', value: `
            - Aucun`},

            { name: '**Architecte :**', value: `
            - Dante_5356 | <@398869792481869833> <:dante_5356:1296967977861644328>
- Zxqn_ | <@376111544733270016> <:zx:1296967979980034162>`},

            { name: '**𝙶𝚛𝚊𝚙𝚑𝚒𝚜𝚝𝚎 :**', value: `
            - Machoire | <@1094529084647821312> <:machoire:1296967979006689331>
- Zxqn_ | <@376111544733270016> <:zx:1296967979980034162>
- Livai | <@646021370706264064> <:YlannBloo:1297212441284968509> `},

            { name: '**𝙳𝚎𝚟𝚎𝚕𝚘𝚙𝚙𝚎𝚞𝚛 :**', value: `
            - Livai | <@646021370706264064> <:YlannBloo:1297212441284968509> `},

            { name: '**𝚂𝚌𝚎𝚗𝚊𝚛𝚒𝚜𝚝𝚎 :**', value: `
            - Aucun`},)            
        .setColor("#AE00F4")
        .setTimestamp()
        .setFooter({ text: 'Deltaria - Semi-Rp / Semi-RPG', iconURL: `${bot.user.displayAvatarURL()}`});

        message.reply({ content: 'La liste du staff a bien été envoyée.', ephemeral: true })
        const channel = await bot.channels.fetch(config.staff_Channel);
        if (channel) await channel.send({ embeds: [staffEmbed] });
    }
}
