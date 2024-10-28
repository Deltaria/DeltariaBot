const { AuditLogEvent, EmbedBuilder } = require("discord.js");
const Discord = require("discord.js");
const config = require("../config");
const intents = new Discord.IntentsBitField(53608447);
const bot = new Discord.Client({ intents });

// Remplacez les IDs par les IDs des salons vocaux correspondants
const salonCreationDuoId = '1296565285389865063';
const salonCreationTrioId = '1297164087372808272';
const salonCreationQuartoId = '1297164187742638121';
const salonCreationIllimiteId = '1297164274812321792';

module.exports = async (bot, oldState, newState) => {
  // Fonction pour créer un salon vocal personnalisé
  const creerSalonVocal = async (member, nomSalon, parentId, limite) => {
    try {
      const newChannel = await newState.guild.channels.create({
        name: nomSalon,
        type: Discord.ChannelType.GuildVoice,
        parent: parentId,
        userLimit: limite, // Définir la limite d'utilisateurs
        permissionOverwrites: [
          {
            id: member.id,
            allow: ['ViewChannel', 'Connect', 'Speak', 'ManageChannels', 'UseVAD'],
          },
          {
            id: newState.guild.roles.everyone.id,
            allow: ['ViewChannel', 'Connect', 'Speak', 'UseVAD'], // Permissions pour tous
            deny: [], // Retirer les restrictions
          },
        ],
      });


      // Déplacer l'utilisateur dans le nouveau salon
      await member.voice.setChannel(newChannel);

      return newChannel; // Retourner le nouveau salon créé
    } catch (error) {
      console.error("Erreur lors de la création du salon:", error);
      return null; // Retourner null en cas d'erreur
    }
  };

  // Fonction pour supprimer l'ancien salon vocal de l'utilisateur
  const supprimerAncienSalon = async (member) => {
    const ancienSalon = member.guild.channels.cache.find(
      (channel) =>
        channel.type === Discord.ChannelType.GuildVoice &&
        channel.name.startsWith("Duo de ") &&
        channel.members.has(member.id)
    );

    if (ancienSalon) {
      try {
        await ancienSalon.delete();
      } catch (error) {
      }
    }
  };

  // Fonction pour vérifier et supprimer les salons vides
  const verifierSalonsVides = async (guild) => {
    guild.channels.cache.forEach(async (channel) => {
      if (
        channel.type === Discord.ChannelType.GuildVoice &&
        channel.members.size === 0 &&
        (channel.name.startsWith("Duo de") ||
          channel.name.startsWith("Trio de") ||
          channel.name.startsWith("Quarto de") ||
          channel.name.startsWith("Salon de"))
      ) {
        try {
          await channel.delete();
        } catch (error) {
        }
      }
    });
  };

  // Appeler verifierSalonsVides() régulièrement (par exemple, toutes les minutes)
  setInterval(() => {
    verifierSalonsVides(newState.guild);
  }, 60000);

  // Vérifier si l'utilisateur a rejoint un des salons de création
  if (!oldState.channel && newState.channel) {
    if (newState.channel.id === salonCreationDuoId) {
      await supprimerAncienSalon(newState.member); // Supprimer l'ancien salon si existant
      await creerSalonVocal(newState.member, `Duo de ${newState.member.user.username}`, newState.channel.parent, 2);
    } else if (newState.channel.id === salonCreationTrioId) {
      await supprimerAncienSalon(newState.member);
      await creerSalonVocal(newState.member, `Trio de ${newState.member.user.username}`, newState.channel.parent, 3);
    } else if (newState.channel.id === salonCreationQuartoId) {
      await supprimerAncienSalon(newState.member);
      await creerSalonVocal(newState.member, `Quarto de ${newState.member.user.username}`, newState.channel.parent, 4);
    } else if (newState.channel.id === salonCreationIllimiteId) {
      await supprimerAncienSalon(newState.member);
      await creerSalonVocal(newState.member, `Salon de ${newState.member.user.username}`, newState.channel.parent, 99);
    }
  }

  // Vérifier si un utilisateur a changé de salon vocal
  if (oldState.channel !== newState.channel) {
    // Appeler verifierSalonsVides() après chaque changement de salon
    verifierSalonsVides(newState.guild);
  }
};