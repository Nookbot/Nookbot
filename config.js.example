/* eslint-disable max-len */
const config = {
  token: '',

  // Twitter
  twitterAPIKey: '',
  twitterAPISecret: '',
  twitterAccessToken: '',
  twitterAccessTokenSecret: '',
  followedTwitterUsers: [],

  // Webhooks
  twitterHookID: '',
  twitterHookToken: '',

  // Raid Settings
  raidJoinsPerSecond: 10,
  raidJoinCount: 30,

  // Settings
  prefix: '.',
  mutedRole: 'roleID',
  tradeRole: 'roleID',
  voiceRole: 'roleID',
  copperBookerRole: 'roleID',
  reddRole: 'roleID',
  headReddRole: 'roleID',
  modRole: 'roleID',
  modTraineeRole: 'roleID',
  headModRole: 'roleID',
  adminRole: 'roleID',
  staffChat: 'channelID',
  modMail: 'channelID',
  reportMail: 'channelID',
  actionLog: 'channelID',
  joinLeaveLog: 'channelID',
  modLog: 'channelID',
  musicText: 'channelID',
  music: 'channelID',
  sesReqText: 'channelID',
  sesCategory: 'categoryID',
  calendar: 'channelID',
  mainGuild: 'guildID',
  modMailGuild: 'guildID',
  modMailCopperBookerRole: 'roleID',
  modMailReddRole: 'roleID',
  modMailHeadReddRole: 'roleID',
  modMailModRole: 'roleID',
  modMailModTraineeRole: 'roleID',
  modMailHeadModRole: 'roleID',
  modMailAdminRole: 'roleID',

  // Image-Only channels
  imageOnlyChannels: ['channelID'],

  imageAndTextOnlyChannels: ['channelID'],

  // Newline Limit and Char Settings
  newlineAndCharProtectedChannels: ['channelID'],
  newlineLimit: 10,
  charLimit: 1000,

  // Image and Link Settings
  imageAndLinkProtectedChannels: ['channelID'],
  imageLinkLimit: 3,

  // No-Mention channels
  noMentionChannels: ['channelID'],

  // Link blacklist channels
  linkBlacklistChannels: ['channelID'],

  // Link whitelist channels
  linkWhitelistChannels: ['channelID'],

  banAppealLink: 'LINK',

  // UserDB Settings
  userDBDefaults: {
    friendcode: '',
    island: {
      islandName: '',
      fruit: '',
      characterName: '',
      hemisphere: '',
      profileName: '',
      dreamAddress: '',
      creatorCode: '',
      hhpCode: '',
    },
    roles: [],
    nicknames: [],
    usernames: [],
    infractions: [],
    lastMessageTimestamp: 0,
    fastMessageCount: 0,
    joinedTimestamp: 0,
    headStaffNotes: [],
    optOutFeedback: false,
  },

  // Bot Perms and Stuff
  ownerID: 'userID',

  admins: ['userID'],

  ignoreMember: ['userID'],

  ignoreChannel: ['channelID'],

  support: ['userID'],

  // Team leads
  copperBookerLeads: ['userID'],

  // Guild Perms and Stuff
  permLevels: [
    {
      level: 0,
      name: 'User',
      check: async () => true,
    },
    {
      level: 2,
      name: 'Copper & Booker',
      check: async (client, message) => {
        const mainGuild = client.guilds.cache.get(config.mainGuild);
        const member = mainGuild.members.cache.get(message.author.id) || await mainGuild.members.fetch(message.author.id);

        if (member && member.roles.cache.has(config.copperBookerRole)) {
          return true;
        }

        return false;
      },
    },
    {
      level: 3,
      name: 'Redd',
      check: async (client, message) => {
        const mainGuild = client.guilds.cache.get(config.mainGuild);
        const member = mainGuild.members.cache.get(message.author.id) || await mainGuild.members.fetch(message.author.id);

        if (member && member.roles.cache.has(config.reddRole)) {
          return true;
        }

        return false;
      },
    },
    {
      level: 4,
      name: 'Head Redd',
      check: async (client, message) => {
        const mainGuild = client.guilds.cache.get(config.mainGuild);
        const member = mainGuild.members.cache.get(message.author.id) || await mainGuild.members.fetch(message.author.id);

        if (member && member.roles.cache.has(config.headReddRole)) {
          return true;
        }

        return false;
      },
    },
    {
      level: 5,
      name: 'Mod',
      check: async (client, message) => {
        const mainGuild = client.guilds.cache.get(config.mainGuild);
        const member = mainGuild.members.cache.get(message.author.id) || await mainGuild.members.fetch(message.author.id);

        if (member && (member.roles.cache.has(config.modRole) || member.roles.cache.has(config.modTraineeRole))) {
          return true;
        }

        return false;
      },
    },
    {
      level: 6,
      name: 'Head Mod',
      check: async (client, message) => {
        const mainGuild = client.guilds.cache.get(config.mainGuild);
        const member = mainGuild.members.cache.get(message.author.id) || await mainGuild.members.fetch(message.author.id);

        if (member && member.roles.cache.has(config.headModRole)) {
          return true;
        }

        return false;
      },
    },
    {
      level: 7,
      name: 'Admin',
      check: async (client, message) => {
        const mainGuild = client.guilds.cache.get(config.mainGuild);
        const member = mainGuild.members.cache.get(message.author.id) || await mainGuild.members.fetch(message.author.id);

        if (member && member.roles.cache.has(config.adminRole)) {
          return true;
        }

        return false;
      },
    },
    {
      level: 8,
      name: 'Server Owner',
      check: async (client, message) => {
        if (message.guild && message.author.id === message.guild.ownerId) {
          return true;
        }
        return false;
      },
    },
    {
      level: 9,
      name: 'Bot Admin',
      check: async (client, message) => config.admins.includes(message.author.id),
    },
    {
      level: 10,
      name: 'Bot Owner',
      check: async (client, message) => config.ownerID === message.author.id,
    },
  ],
};

module.exports = config;
