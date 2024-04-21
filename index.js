const {
    Client,
    GatewayIntentBits,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    EmbedBuilder,
    SlashCommandBuilder,
    REST,
    Routes,
    PermissionsBitField,
    Permissions,
    ChannelType,
    ContextMenuCommandBuilder,
    ApplicationCommandType,
    AttachmentBuilder,
} = require("discord.js");
const { createCanvas, loadImage } = require("canvas");
const {
    mongodb,
    token,
    clientid,
    errorchannelid,
    logchannelid,
    adminsid,
    githubtoken,
    repository,
    branch,
} = require("./config.json");
const si = require("systeminformation");
const os = require("os");
const packageJson = require("./package.json");
const fs = require("fs");
const mongoose = require("mongoose");
const moment = require("moment");
const startTime = moment();
const { exec } = require("child_process");
const axios = require("axios");
const rest = new REST({ version: "10" }).setToken(token);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMembers,
    ],
});

const commands = [
    new SlashCommandBuilder()
        .setName("info")
        .setDescription("info")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("server")
                .setDescription("Display server settings.")
        )
        .addSubcommand((subcommand) =>
            subcommand.setName("bot").setDescription("Display bot info.")
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("add-ons")
                .setDescription("Display server add-ons info.")
        ),

    new SlashCommandBuilder()
        .setName("management")
        .setDescription("Server management")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("checkuser")
                .setDescription("Check all member in server.")
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("setup")
                .setDescription(
                    "Add spam blocking functionality to the server."
                )
                .addChannelOption((option) =>
                    option
                        .setName("channel")
                        .setDescription("Select the channel to output logs.")
                        .setRequired(true)
                )
                .addIntegerOption((option) =>
                    option
                        .setName("months")
                        .setDescription("Enter the number of months to set.")
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName("type")
                        .setDescription(
                            "Select the action to take. (Kick or Ban)"
                        )
                        .addChoices({ name: "Kick", value: "action_type_kick" })
                        .addChoices({ name: "Ban", value: "action_type_ban" })
                        .addChoices({
                            name: "Mute (Recommended)",
                            value: "action_type_mute",
                        })

                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("addwhitelist")
                .setDescription("Add whitelist a user")
                .addUserOption((option) =>
                    option
                        .setName("user")
                        .setDescription("Select the whitelist to block")
                        .setRequired(true)
                )
        )

        .addSubcommand((subcommand) =>
            subcommand
                .setName("timeout")
                .setDescription("유저를 타임아웃시킵니다.")
                .addUserOption((option) =>
                    option
                        .setName("user")
                        .setDescription("타임아웃시킬 유저")
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName("duration")
                        .setDescription("타임아웃 시간")
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option.setName("reason").setDescription("타임아웃 이유")
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("kick")
                .setDescription("유저를 킥시킵니다.")
                .addUserOption((option) =>
                    option
                        .setName("user")
                        .setDescription("킥할 유저")
                        .setRequired(true)
                )

                .addStringOption((option) =>
                    option.setName("reason").setDescription("킥할 이유")
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("ban")
                .setDescription("유저를 차단시킵니다.")
                .addUserOption((option) =>
                    option
                        .setName("user")
                        .setDescription("차단할 유저")
                        .setRequired(true)
                )

                .addStringOption((option) =>
                    option.setName("reason").setDescription("차단할 이유")
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("removewhitelist")
                .setDescription("Remove whitelist a user")
                .addUserOption((option) =>
                    option
                        .setName("user")
                        .setDescription(
                            "Select the remove whitelist to unblock"
                        )
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("delete")
                .setDescription("Deletes specified number of messages")
                .addIntegerOption((option) =>
                    option
                        .setName("count")
                        .setDescription("Number of messages to delete")
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(100)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("whitelist")
                .setDescription("List all blocked users")
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("officialblacklist")
                .setDescription("List all blocked users")
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("report")
                .setDescription("Report a user.")
                .addUserOption((option) =>
                    option
                        .setName("user")
                        .setDescription("Select the user to report.")
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName("reason")
                        .setDescription("Specify the reason for the report.")
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("autoaction")
                .setDescription("Set whether to take automatic action.")
                .addStringOption((option) =>
                    option
                        .setName("status")
                        .setDescription("Select action status.")

                        .addChoices({
                            name: "Enable",
                            value: "action_status_on",
                        })
                        .addChoices({
                            name: "Disable",
                            value: "action_status_off",
                        })
                        .setRequired(true)
                )
        ),
    new SlashCommandBuilder()
        .setName("add-ons")
        .setDescription("Protection add-ons")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("spamming")
                .setDescription("Block user to spamming.(Developing)")
                .addStringOption((option) =>
                    option
                        .setName("status")
                        .setDescription("Select action status.")

                        .addChoices({
                            name: "Enable",
                            value: "spamming_status_on",
                        })
                        .addChoices({
                            name: "Disable",
                            value: "spamming_status_off",
                        })
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("postlink")
                .setDescription("Block user to post link")
                .addStringOption((option) =>
                    option
                        .setName("action")
                        .setDescription("Select action.")

                        .addChoices({
                            name: "All link",
                            value: "link_action_all",
                        })
                        .addChoices({
                            name: "Only discord invite link",
                            value: "link_action_discord",
                        })
                        .addChoices({
                            name: "Disable",
                            value: "link_action_disable",
                        })
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("deletehistory")
                .setDescription("Records message delete historys")
                .addStringOption((option) =>
                    option
                        .setName("status")
                        .setDescription("Select action status.")

                        .addChoices({
                            name: "Enable",
                            value: "delete_status_on",
                        })
                        .addChoices({
                            name: "Disable",
                            value: "delete_status_off",
                        })
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("changehistory")
                .setDescription("Records message change historys")
                .addStringOption((option) =>
                    option
                        .setName("status")
                        .setDescription("Select action status.")

                        .addChoices({
                            name: "Enable",
                            value: "change_status_on",
                        })
                        .addChoices({
                            name: "Disable",
                            value: "change_status_off",
                        })
                        .setRequired(true)
                )
        ),

    new SlashCommandBuilder()
        .setName("utility")
        .setDescription("Utility")

        .addSubcommand((subcommand) =>
            subcommand
                .setName("keyboard")
                .setDescription("keyboard")
                .addStringOption((option) =>
                    option
                        .setName("translate")
                        .setDescription("translate status.")

                        .addChoices({
                            name: "Korean->English",
                            value: "Korean->English",
                        })
                        .addChoices({
                            name: "English->Korean",
                            value: "English->Korean",
                        })
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName("text")
                        .setDescription("enter text")
                        .setRequired(true)
                )
        ),
    new ContextMenuCommandBuilder()
        .setName("Information")
        .setType(ApplicationCommandType.User),
    new ContextMenuCommandBuilder()
        .setName("Avatar")
        .setType(ApplicationCommandType.User),
    new ContextMenuCommandBuilder()
        .setName("Banner")
        .setType(ApplicationCommandType.User),
];
const admincommand = [
    new SlashCommandBuilder()
        .setName("admin")
        .setDescription("admin only")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("unblackserver")
                .setDescription("unblack server")

                .addStringOption((option) =>
                    option
                        .setName("id")
                        .setDescription("enter id")
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("unblackuser")
                .setDescription("unblack user")

                .addStringOption((option) =>
                    option
                        .setName("id")
                        .setDescription("enter id")
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("blackuser")
                .setDescription("unblack user")

                .addStringOption((option) =>
                    option
                        .setName("id")
                        .setDescription("enter id")
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName("risk")
                        .setDescription("Risk (1~3)")
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName("reason")
                        .setDescription("enter reason")
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("blackserver")
                .setDescription("unblack user")

                .addStringOption((option) =>
                    option
                        .setName("id")
                        .setDescription("enter id")
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("test")
                .setDescription("test command")

                .addStringOption((option) =>
                    option
                        .setName("command")
                        .setDescription("enter command")
                        .setRequired(true)
                )
        ),

    new SlashCommandBuilder()
        .setName("bot")
        .setDescription("management bot")
        .addSubcommand((subcommand) =>
            subcommand.setName("update").setDescription("update bot")
        )
        .addSubcommand((subcommand) =>
            subcommand.setName("restart").setDescription("restart bot")
        )
        .addSubcommand((subcommand) =>
            subcommand.setName("guildlist").setDescription("show guildlist")
        )
        .addSubcommand((subcommand) =>
            subcommand.setName("off").setDescription("power off")
        ),
];

client.once("ready", async () => {
    const endTime = moment();
    const loginTime = moment.duration(endTime.diff(startTime)).asSeconds();
    infochannel(`Login successful. Took ${loginTime} seconds.`);
    mongoose
        .connect(mongodb, {})
        .then(() => {
            infochannel("Connected Database");
        })
        .catch((error) => {
            errorlog("Connect Database fail", error.message);
        });
    let guild_counter = 0;
    client.guilds.cache.forEach(async (guild) => {
        guild_counter++;
    });
    infochannel(`Guild total : ${guild_counter}`);
    try {
        infochannel("Started refreshing application (/) commands.");

        await rest.put(Routes.applicationCommands(clientid), {
            body: commands,
        });
        infochannel("Successfully reloaded application (/) commands.");
    } catch (error) {
        console.error(error);
    }
    rest.put(Routes.applicationGuildCommands(clientid, "1146819689679425621"), {
        body: admincommand,
    });
    rest.put(Routes.applicationGuildCommands(clientid, "1198548840693895248"), {
        body: admincommand,
    });
});
function infochannel(content) {
    const channel = client.channels.cache.get(logchannelid);
    const endTime = moment();
    const currentTime = endTime.format("YYYY-MM-DD HH:mm:ss");
    channel.send(`[${currentTime}] INFO: ${content}`);
    console.log(`[${currentTime}] INFO: ${content}`);
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function toUnixTimestamp(uptimeSeconds) {
    const now = Math.floor(Date.now() / 1000);
    return now - uptimeSeconds;
}
function countLines(file, callback) {
    fs.readFile(file, "utf8", function (err, data) {
        if (err) {
            return;
        }
        const lines = data.split("\n").length;
        callback(lines);
    });
}
client.on("interactionCreate", async (interaction) => {
    const { commandName, options, customId, guild } = interaction;
    const language = interaction.locale;
    let commandoptionname;
    if (!interaction) {
        return;
    }
    if (interaction.isChatInputCommand()) {
        commandoptionname = interaction.options.getSubcommand();
    }

    if (interaction.isContextMenuCommand()) {
        if (interaction.commandName === "Avatar") {
            const user = interaction.targetUser;
            const avatarURL = user.displayAvatarURL({
                dynamic: true,
                size: 4096,
            });
            const avatarEmbed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle(`Avatar-${user.username}`)
                .setImage(avatarURL);
            interaction.reply({ embeds: [avatarEmbed] });
        }
        if (interaction.commandName === "Banner") {
            const user = interaction.targetUser;
            const userResponse = await fetch(
                `https://discord.com/api/v9/users/${user.id}`,
                {
                    headers: {
                        Authorization: `Bot ${token}`,
                    },
                }
            );
            const userData = await userResponse.json();

            let banner;
            if (userData.banner) {
                banner = `https://cdn.discordapp.com/banners/${user.id}/${userData.banner}?size=2048`;
                if (userData.banner.startsWith("a_")) {
                    banner = `https://cdn.discordapp.com/banners/${user.id}/${userData.banner}.gif?size=2048`;
                }

                const avatarEmbed = new EmbedBuilder()
                    .setColor(0x0099ff)
                    .setTitle(`Banner-${user.username}`)
                    .setImage(banner);

                interaction.reply({ embeds: [avatarEmbed] });
                return;
            } else {
                const canvas = createCanvas(1024, 410);
                const ctx = canvas.getContext("2d");
                ctx.fillStyle = userData.banner_color || "#ffffff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                const fileName = `banner_${user.id}.png`;
                const out = fs.createWriteStream(fileName);
                const stream = canvas.createPNGStream();
                stream.pipe(out);

                out.on("finish", () => {
                    const file = new AttachmentBuilder(fileName);
                    banner = `attachment://${fileName}`;
                    const avatarEmbed = new EmbedBuilder()
                        .setColor(0x0099ff)
                        .setTitle(`Banner-${user.username}`)
                        .setImage(banner);
                    interaction
                        .reply({ embeds: [avatarEmbed], files: [file] })
                        .then(() => {
                            fs.unlink(fileName, (err) => {
                                if (err) {
                                    console.error(err);
                                }
                            });
                        });
                });
            }
        }
        if (interaction.commandName === "Information") {
            const user = interaction.targetUser;

            const guildMember = await interaction.guild.members.fetch(user.id);
            const joinTimestamp = Math.floor(
                guildMember.joinedTimestamp / 1000
            );

            const userCreatedTimestamp = Math.floor(
                user.createdAt.getTime() / 1000
            );
            const avatarURL = user.displayAvatarURL({
                size: 256,
                dynamic: true,
            });
            let roleMentions = guildMember.roles.cache
                .filter((role) => role.name !== "@everyone")

                .map((role) => `<@&${role.id}>`)
                .join(", ");
            if (!roleMentions) {
                roleMentions = "None";
            }
            const blockEmbed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle(`User Info`)

                .addFields(
                    {
                        name: "User",
                        value: `<@${user.id}>`,
                        inline: true,
                    },
                    {
                        name: "Roles",
                        value: roleMentions,
                        inline: true,
                    },
                    {
                        name: "User Created At",
                        value: `<t:${userCreatedTimestamp}:F>(<t:${userCreatedTimestamp}:R>)`,
                        inline: false,
                    },
                    {
                        name: "Server Join At",
                        value: `<t:${joinTimestamp}:F>(<t:${joinTimestamp}:R>)`,
                        inline: false,
                    }
                )
                .setThumbnail(avatarURL)
                .setFooter({
                    text: `${user.username}-${user.id}`,
                })
                .setTimestamp();
            interaction.reply({ embeds: [blockEmbed] });
        }
        return;
    }
    if (commandoptionname === "spamming") {
        if (!checkPermissions(interaction)) {
            return;
        }
        const guildSettings = await getGuildSettings(guild.id);
        if (!guildSettings) {
            const errorMessage =
                language === "ko"
                    ? "서버 설정을 찾을 수 없습니다. 먼저 로그 채널을 설정하십시오.\n</setup:1217828757801533443>"
                    : "Server settings not found. Please set up the log channel first.\n</setup:1217828757801533443>";

            await interaction.reply({
                content: errorMessage,
                ephemeral: true,
            });
            return;
        }

        let status = options.getString("status").toLowerCase();
        if (status === "spamming_status_on") {
            interaction.reply("도배 방지가 활성화되었습니다");
            status = "on";
        } else if (status === "spamming_status비_off") {
            interaction.reply("도배 방지가 비활성화되었습니다.");
            status = "off";
        }
        await updateGuildSettings(
            guild.id,
            null,
            null,
            null,
            null,
            null,
            status,
            null,
            null
        );
    }
    if (commandoptionname === "deletehistory") {
        if (!checkPermissions(interaction)) {
            return;
        }
        const guildSettings = await getGuildSettings(guild.id);
        if (!guildSettings) {
            const errorMessage =
                language === "ko"
                    ? "서버 설정을 찾을 수 없습니다. 먼저 로그 채널을 설정하십시오.\n</setup:1217828757801533443>"
                    : "Server settings not found. Please set up the log channel first.\n</setup:1217828757801533443>";

            await interaction.reply({
                content: errorMessage,
                ephemeral: true,
            });
            return;
        }

        let status = options.getString("status").toLowerCase();
        if (status === "delete_status_on") {
            interaction.reply("삭제로그가 활성화되었습니다");
            status = "on";
        } else if (status === "delete_status_off") {
            interaction.reply("삭제로그가 비활성화되었습니다.");
            status = "off";
        }
        await updateGuildSettings(
            guild.id,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            status
        );
    }
    if (commandoptionname === "timeout") {
        if (!checkPermissions(interaction)) return;
        const user = interaction.options.getMember("user");
        const durationString = interaction.options.getString("duration");
        const timeoutDuration = parseDuration(durationString);
        const reason =
            interaction.options.getString("reason") || "No reason provide";
        try {
            await user.timeout(timeoutDuration, reason);
            interaction.reply(`Timeout ${user} ${durationString}`);
        } catch (err) {
            interaction.reply(err.message || "Something went wrong");
            return;
        }
    }
    if (commandoptionname === "kick") {
        if (!checkPermissions(interaction)) return;
        const user = interaction.options.getMember("user");
        const reason =
            interaction.options.getString("reason") || "No reason provide";
        try {
            await user.kick(reason);
            interaction.reply(`User ${user} kicked`);
        } catch (err) {
            interaction.reply(err.message || "Something went wrong");
            return;
        }
    }
    if (commandoptionname === "ban") {
        if (!checkPermissions(interaction)) return;
        const user = interaction.options.getMember("user");
        const reason =
            interaction.options.getString("reason") || "No reason provide";
        try {
            await user.ban(reason);
            interaction.reply(`User ${user} banned`);
        } catch (err) {
            interaction.reply(err.message || "Something went wrong");
            return;
        }
    }
    if (commandoptionname === "changehistory") {
        if (!checkPermissions(interaction)) {
            return;
        }
        const guildSettings = await getGuildSettings(guild.id);
        if (!guildSettings) {
            const errorMessage =
                language === "ko"
                    ? "서버 설정을 찾을 수 없습니다. 먼저 로그 채널을 설정하십시오.\n</setup:1217828757801533443>"
                    : "Server settings not found. Please set up the log channel first.\n</setup:1217828757801533443>";

            await interaction.reply({
                content: errorMessage,
                ephemeral: true,
            });
            return;
        }

        let status = options.getString("status").toLowerCase();
        if (status === "change_status_on") {
            interaction.reply("변경로그가 활성화되었습니다");
            status = "on";
        } else if (status === "change_status_off") {
            interaction.reply("변경로그가 비활성화되었습니다.");
            status = "off";
        }
        await updateGuildSettings(
            guild.id,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            status,
            null
        );
    }

    if (commandoptionname === "update") {
        if (!checkOwners(interaction)) return;
        interaction.reply("Updating bot from GitHub...");
        infochannel(
            `Updating bot at the request of the ${interaction.user.tag}(${interaction.user.id})`
        );
        updateBotFromGitHub();
    }
    if (commandoptionname === "off") {
        if (!checkOwners(interaction)) {
            return;
        }

        infochannel(
            `Power off has been requested by ${interaction.user.tag}(${interaction.user.id})`
        );
        interaction.reply("poweroff").then(async () => {
            await process.exit(0);
        });
    }
    if (commandoptionname === "restart") {
        if (!checkOwners(interaction)) return;
        try {
            interaction.reply("Restarting Bot...");
        } catch (error) {
            console.log(error);
        }
        infochannel(
            `Restarting at the request of the ${interaction.user.tag}(${interaction.user.id})`
        );
        restartBot();
    }
    if (commandoptionname === "guildlist") {
        if (!checkOwners(interaction)) return;
        const filePath = "./guild_list.txt";

        let guildList = "Guild List:\n\n";
        let c = 0;
        client.guilds.cache.forEach((guild) => {
            c++;
            guildList += `${c}. ${guild.name} - ${guild.id}\n`;
        });

        fs.writeFile(filePath, guildList, (err) => {
            if (err) {
                console.error("Error writing file:", err);
                return;
            }
            interaction
                .reply({ files: [filePath] })
                .then(() => {
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error("Error deleting file:", err);
                            return;
                        }
                    });
                })
                .catch(console.error);
        });
    }

    if (commandoptionname === "spamming") {
        if (!checkPermissions(interaction)) {
            return;
        }
        const guildSettings = await getGuildSettings(guild.id);
        if (!guildSettings) {
            const errorMessage =
                language === "ko"
                    ? "서버 설정을 찾을 수 없습니다. 먼저 로그 채널을 설정하십시오.\n</setup:1217828757801533443>"
                    : "Server settings not found. Please set up the log channel first.\n</setup:1217828757801533443>";

            await interaction.reply({
                content: errorMessage,
                ephemeral: true,
            });
            return;
        }

        let status = options.getString("status").toLowerCase();
        if (status === "spamming_status_on") {
            interaction.reply("도배 방지가 활성화되었습니다");
            status = "on";
        } else if (status === "spamming_status_off") {
            interaction.reply("도배 방지가 비활성화되었습니다.");
            status = "off";
        }
        await updateGuildSettings(
            guild.id,
            null,
            null,
            null,
            null,
            null,
            null,
            status,
            null
        );
    }

    if (commandoptionname === "postlink") {
        if (!checkPermissions(interaction)) {
            return;
        }
        const guildSettings = await getGuildSettings(guild.id);
        if (!guildSettings) {
            const errorMessage =
                language === "ko"
                    ? "서버 설정을 찾을 수 없습니다. 먼저 로그 채널을 설정하십시오.\n</setup:1217828757801533443>"
                    : "Server settings not found. Please set up the log channel first.\n</setup:1217828757801533443>";

            await interaction.reply({
                content: errorMessage,
                ephemeral: true,
            });
            return;
        }

        let action = options.getString("action").toLowerCase();
        if (action === "link_action_all") {
            interaction.reply("링크 보안이 모든링크로 설정되었습니다.");
            action = "all";
        } else if (action === "link_action_discord") {
            interaction.reply(
                "링크 보안이 디스코드 초대링크로 설정되었습니다."
            );
            action = "discord";
        } else if (action === "link_action_disable") {
            interaction.reply("링크 보안이 Disable로 설정되었습니다.");
            action = "disable";
        }

        await updateGuildSettings(
            guild.id,
            null,
            null,
            null,
            null,
            null,
            action,
            null
        );
    }
    if (commandoptionname === "bot") {
        try {
            const [memoryData, osData, cpuData, diskData, networkData] =
                await Promise.all([
                    si.mem(),
                    si.osInfo(),
                    si.currentLoad(),
                    si.fsSize(),
                    si.networkStats(),
                ]);
            let discordVersion = packageJson.dependencies["discord.js"];
            discordVersion = discordVersion.replace("^", "Discord.js ");

            const startTime = Date.now();
            const uptimeSeconds = os.uptime();
            const uptimeTimestamp = parseInt(toUnixTimestamp(uptimeSeconds));
            const totalMemoryMB = bytesToMB(memoryData.total);
            const usedMemoryMB = bytesToMB(memoryData.used);
            const memoryUsagePercentage = (usedMemoryMB / totalMemoryMB) * 100;
            const endTime = Date.now();
            const ping = interaction.client.ws.ping;
            let embed;
            let gun = false;

            const randomNumber = Math.floor(Math.random() * 100) + 1;
            if (randomNumber === 7) {
                gun = true;
            }
            let title = "시스템 정보";
            if (language === "ko") {
                if (gun) {
                    title = "시스템 정보)근";
                }
                embed = new EmbedBuilder()
                    .setColor("#0099ff")
                    .setTitle(title)
                    .addFields(
                        {
                            name: "핑",
                            value: `${ping}ms`,
                            inline: true,
                        },
                        {
                            name: `메모리`,
                            value: `${usedMemoryMB.toFixed(
                                2
                            )} MB/${totalMemoryMB.toFixed(
                                2
                            )} MB  (${memoryUsagePercentage.toFixed(2)}%)`,
                            inline: true,
                        },
                        {
                            name: "운영 체제",
                            value: `${osData.platform} ${osData.release}`,
                            inline: true,
                        },
                        {
                            name: "업타임",
                            value: `<t:${uptimeTimestamp}:F>(<t:${uptimeTimestamp}:R>)`,
                            inline: true,
                        },
                        {
                            name: "모듈",
                            value: `> ${discordVersion}`,
                            inline: true,
                        },
                        {
                            name: "서버",
                            value: `${client.guilds.cache.size}`,
                            inline: true,
                        },
                        {
                            name: "마지막 업데이트",
                            value: `<t:${getLastModifiedDate(
                                "index.js"
                            )}:F>(<t:${getLastModifiedDate("index.js")}:R>)`,
                            inline: true,
                        },
                        {
                            name: "라인",
                            value: `${await new Promise((resolve, reject) => {
                                countLines("index.js", function (lines) {
                                    resolve(lines.toLocaleString());
                                });
                            })}lines`,
                            inline: true,
                        }
                    )
                    .setTimestamp()
                    .setFooter({
                        text: `TeamSpam 개발\n알파 버전`,
                    });
            } else {
                embed = new EmbedBuilder()
                    .setColor("#0099ff")
                    .setTitle("System information")
                    .addFields(
                        {
                            name: "Ping",
                            value: `${ping}ms`,
                            inline: true,
                        },
                        {
                            name: `Memory`,
                            value: `${usedMemoryMB.toFixed(
                                2
                            )} MB/${totalMemoryMB.toFixed(
                                2
                            )} MB  (${memoryUsagePercentage.toFixed(2)}%)`,
                            inline: true,
                        },
                        {
                            name: "Operating system",
                            value: `${osData.platform} ${osData.release}`,
                            inline: true,
                        },
                        {
                            name: "Uptime",
                            value: `<t:${uptimeTimestamp}:F>(<t:${uptimeTimestamp}:R>)`,
                            inline: true,
                        },
                        {
                            name: "Modules",
                            value: `> ${discordVersion}`,
                            inline: true,
                        },
                        {
                            name: "Servers",
                            value: `${client.guilds.cache.size}`,
                            inline: true,
                        },
                        {
                            name: "Last Updated",
                            value: `<t:${getLastModifiedDate(
                                "index.js"
                            )}:F>(<t:${getLastModifiedDate("index.js")}:R>)`,
                            inline: true,
                        },
                        {
                            name: "Lines",
                            value: `${await new Promise((resolve, reject) => {
                                countLines("index.js", function (lines) {
                                    resolve(lines.toLocaleString());
                                });
                            })}lines`,
                            inline: true,
                        }
                    )
                    .setTimestamp()
                    .setFooter({
                        text: `Develop By TeamSpam\nAlpha Version`,
                    });
            }

            interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            if (language === "ko") {
                interaction.reply(
                    "메모리 정보를 가져오는 중 오류가 발생했습니다."
                );
            } else {
                interaction.reply(
                    "An error occurred while fetching memory information."
                );
            }
        }
    }
    if (commandoptionname === "check") {
        let newMembers = [];
        const messagedefer = await interaction.deferReply();

        const guildSettings = await getGuildSettings(guild.id);

        if (!guildSettings) {
            const errorMessage =
                language === "ko"
                    ? "서버 설정을 찾을 수 없습니다. 먼저 로그 채널을 설정하십시오.\n</setup:1217828757801533443>"
                    : "Server settings not found. Please set up the log channel first.\n</setup:1217828757801533443>";

            await messagedefer.edit({
                content: errorMessage,
                ephemeral: true,
            });
            return;
        }

        const configuredMonths = guildSettings.configuredMonths;

        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - configuredMonths);

        guild.members
            .fetch({ withPresences: true })
            .then(async (members) => {
                members.forEach((member) => {
                    if (member.user.createdAt > oneMonthAgo) {
                        newMembers.push(`<@${member.id}>`);
                    }
                });

                if (newMembers.length > 0) {
                    const message = newMembers.join("\n");
                    const joinMessage =
                        language === "ko"
                            ? `다음 멤버들의 계정 생성일이 ${configuredMonths}개월 미만입니다.\n${message}`
                            : `The following members' account creation dates are less than ${configuredMonths} month(s) ago:\n${message}`;
                    await messagedefer.edit(joinMessage);
                } else {
                    const noJoinMessage =
                        language === "ko"
                            ? `지난 ${configuredMonths}달 동안 가입한 멤버가 없습니다.`
                            : `No members joined in the last ${configuredMonths} month(s).`;

                    await messagedefer.edit(noJoinMessage);
                }
            })
            .catch(console.error);
    }
    if (commandoptionname === "test") {
        const command = options.getString("command");
        if (checkOwners(interaction)) {
            try {
                const result = await eval(command);
                const embed = new EmbedBuilder()
                    .setColor("#00ff00")
                    .setTitle("Evaluation Result")
                    .setDescription(`\`\`\`${result}\`\`\``)
                    .setTimestamp();

                interaction.reply({ embeds: [embed] });
            } catch (error) {
                const embed = new EmbedBuilder()
                    .setColor("#ff0000")
                    .setTitle("Evaluation Error")
                    .setDescription(`\`\`\`${error}\`\`\``)
                    .setTimestamp();
                interaction.reply({ embeds: [embed] });
            }
        }
    }
    if (commandoptionname === "adblackserver") {
        const id = options.getString("id");
        await addServerToBlacklist(id);
        await interaction.reply({
            content:
                language === "ko"
                    ? `서버 ${id}가 블랙리스트에 추가되었습니다.`
                    : `Server ${id} has been blacklisted.`,
        });
    }
    if (commandoptionname === "adblackuser") {
        const id = options.getString("id");
        const reason = options.getString("reason");
        const risk = options.getString("risk");

        await addUserToBlacklist(id, risk, interaction.user.id);
        await interaction.reply({
            content:
                language === "ko"
                    ? `사용자 ${id}가 블랙리스트에 추가되었습니다.\n위험도 : ${risk}\n사유 : \`\`\`${reason}\`\`\``
                    : `User ${id} has been blacklisted.\nRisk : ${risk}\nReason : \`\`\`${reason}\`\`\``,
        });
    }
    if (commandoptionname === "adunblackserver") {
        const id = options.getString("id");
        await removeServerFromBlacklist(id);
        await interaction.reply({
            content:
                language === "ko"
                    ? `서버 ${id}가 블랙리스트에서 제거되었습니다.`
                    : `Server ${id} has been unblacklisted.`,
        });
    }
    if (commandoptionname === "adunblackuser") {
        const id = options.getString("id");
        await removeUserFromBlacklist(id);
        await interaction.reply({
            content:
                language === "ko"
                    ? `사용자 ${id}가 블랙리스트에서 제거되었습니다.`
                    : `User ${id} has been unblacklisted.`,
        });
    }
    if (commandoptionname === "delete") {
        const count = options.getInteger("count");
        if (!checkPermissions(interaction)) {
            return;
        }
        try {
            const messages = await interaction.channel.messages.fetch({
                limit: count,
            });

            messages.forEach(async (message) => {
                if (message.deletable) {
                    await message.delete();
                }
            });

            interaction.reply({
                content: `Deleted ${messages.size} messages.`,
                ephemeral: true,
            });
        } catch (error) {
            console.error("Error deleting messages:", error);
            interaction.reply({
                content: "An error occurred while deleting messages.",
                ephemeral: true,
            });
        }
    }

    if (commandoptionname === "officialblacklist") {
        const blacklistedUsers = await BlacklistUser.find();
        const blacklistedServers = await BlacklistServer.find();

        let userList =
            language === "ko"
                ? "## 블랙리스트된 사용자:\n"
                : "## Blacklisted Users:\n";
        blacklistedUsers.forEach((user) => {
            userList += `<@${user.userId}>\n`;
        });

        let serverList =
            language === "ko"
                ? "## 블랙리스트된 서버:\n"
                : "## Blacklisted Servers:\n";
        blacklistedServers.forEach((server) => {
            serverList += `${server.serverId}\n`;
        });

        interaction.reply({
            content: userList + "\n" + serverList,
            ephemeral: true,
        });
    }
    if (commandoptionname === "report") {
        const user = options.getUser("user");
        const reason = options.getString("reason");

        if (!user || !reason) {
            await interaction.reply({
                content:
                    language === "ko"
                        ? "사용자와 이유를 모두 제공해주세요."
                        : "Please provide both user and reason.",
                ephemeral: true,
            });
            return;
        }
        let userper = interaction.member.permissions.has([
            PermissionsBitField.Flags.KickMembers,
            PermissionsBitField.Flags.BanMembers,
        ])
            ? "Admin"
            : "User";
        const reportReason =
            language === "ko"
                ? `사용자 ${user}이(가) ${reason}으로 신고되었습니다.`
                : `User ${user} was reported for ${reason}.`;

        await interaction.reply({ content: reportReason, ephemeral: true });
        const channel = client.channels.cache.get(errorchannelid);
        const time = Math.floor(Date.now() / 1000);
        const errorEmbed = new EmbedBuilder()
            .setTitle(language === "ko" ? "신고" : "Report")
            .setColor(0xeb0000)
            .addFields([
                {
                    name: language === "ko" ? "시간" : "Time",
                    value: `<t:${time}:F>`,
                },
                {
                    name: language === "ko" ? "신고 서버" : "Report Server",
                    value: `${interaction.guild.id}`,
                },
                {
                    name: language === "ko" ? "신고 유저" : "Report User",
                    value: `${interaction.user} ${userper}`,
                },
                { name: language === "ko" ? "유저" : "User", value: `${user}` },
                {
                    name: language === "ko" ? "이유" : "Reason",
                    value: `\`\`\`${reason}\`\`\``,
                },
            ]);

        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`add_${user.id}`)
                .setLabel(
                    language === "ko" ? "블랙리스트 추가" : "Add Blacked User"
                )
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId(`deny_${user.id}_${interaction.user}`)
                .setLabel(language === "ko" ? "거부" : "Deny")
                .setStyle(ButtonStyle.Primary)
        );
        channel.send({ embeds: [errorEmbed], components: [row1] });
    }
    if (commandoptionname === "whitelist") {
        try {
            const guildId = guild.id;
            const guildSettings = await getGuildSettings(guildId);
            if (
                !guildSettings ||
                !guildSettings.blockedUsers ||
                guildSettings.blockedUsers.length === 0
            ) {
                await interaction.reply({
                    content:
                        language === "ko"
                            ? "화이트리스트가 없습니다."
                            : "No Whitelist Users.",
                    ephemeral: true,
                });
                return;
            }
            const blockedUsers = guildSettings.blockedUsers
                .map((userId) => `<@${userId}>`)
                .join(", ");
            await interaction.reply({
                content:
                    language === "ko"
                        ? `Whitelist: ${blockedUsers}`
                        : `Whitelist: ${blockedUsers}`,
                ephemeral: true,
            });
        } catch (error) {
            console.error("Error listing Whitelist users:", error);
            await interaction.reply({
                content: language === "ko" ? "Error" : "An Error",
                ephemeral: true,
            });
        }
    }
    if (commandoptionname === "addwhitelist") {
        if (!checkPermissions(interaction)) {
            return;
        }
        const guildId = interaction.guildId;

        const guildSettings = await getGuildSettings(guildId);
        if (!guildSettings) {
            interaction.reply({
                content:
                    language === "ko"
                        ? "서버 설정을 찾을 수 없습니다. 먼저 로그 채널을 설정하십시오.\n</setup:1217828757801533443>"
                        : "Server settings not found. Please set up the log channel first.\n</setup:1217828757801533443>",
                ephemeral: true,
            });
            return;
        }

        const user = options.getUser("user");
        await addBlockedUser(guildId, user.id);
        interaction.reply({
            content:
                language === "ko"
                    ? `${user}님을 화이트 리스트에 등록했습니다..`
                    : `Add ${user}.`,
        });
    }
    if (commandoptionname === "removewhitelist") {
        if (!checkPermissions(interaction)) {
            return;
        }
        const guildId = interaction.guildId;

        const guildSettings = await getGuildSettings(guildId);
        if (!guildSettings) {
            interaction.reply({
                content:
                    language === "ko"
                        ? "서버 설정을 찾을 수 없습니다. 먼저 로그 채널을 설정하십시오.\n</setup:1217828757801533443>"
                        : "Server settings not found. Please set up the log channel first.\n</setup:1217828757801533443>",
                ephemeral: true,
            });
            return;
        }
        const user = options.getUser("user");
        await removeBlockedUser(guildId, user.id);
        interaction.reply({
            content:
                language === "ko"
                    ? `${user}님을 화이트리스트에서 제거 했습니다.`
                    : `Removewhitelist ${user}.`,
        });
    }
    if (commandoptionname === "autoaction") {
        if (!checkPermissions(interaction)) {
            return;
        }
        let status = options.getString("status").toLowerCase();
        const guildId = interaction.guildId;
        status = status === "action_status_on" ? "On" : "Off";

        const guildSettings = await getGuildSettings(guildId);
        if (!guildSettings) {
            interaction.reply({
                content:
                    language === "ko"
                        ? "서버 설정을 찾을 수 없습니다. 먼저 로그 채널을 설정하십시오.\n</setup:1217828757801533443>"
                        : "Server settings not found. Please set up the log channel first.\n</setup:1217828757801533443>",
                ephemeral: true,
            });
            return;
        }
        const logChannelId = guildSettings.logChannelId;

        if (!logChannelId) {
            interaction.reply({
                content:
                    language === "ko"
                        ? "자동 조치를 설정하기 전에 먼저 로그 채널을 설정하십시오.\n</setup:1217828757801533443>"
                        : "Before setting up automatic actions, please set up the log channel first.\n</setup:1217828757801533443>",
                ephemeral: true,
            });
            return;
        }

        try {
            await updateGuildSettings(
                guildId,
                null,
                status,
                null,
                null,
                null,
                null,
                null
            );
            interaction.reply({
                content:
                    language === "ko"
                        ? `자동 조치가 ${
                              status === "On"
                                  ? "활성화되었습니다."
                                  : "비활성화되었습니다."
                          }`
                        : `Automatic action is ${
                              status === "On" ? "enabled" : "disabled"
                          }.`,
            });
        } catch (error) {
            console.error("Error updating guild settings:", error);
            interaction.reply({
                content:
                    language === "ko"
                        ? "자동 조치 상태를 설정하는 중 오류가 발생했습니다."
                        : "An error occurred while setting the automatic action status.",
            });
        }
    }
    if (commandoptionname === "server") {
        const guildSettings = await getGuildSettings(interaction.guild.id);
        if (!guildSettings) {
            interaction.reply({
                content:
                    language === "ko"
                        ? "서버 설정을 찾을 수 없습니다. 먼저 로그 채널을 설정하십시오.\n</setup:1217828757801533443>"
                        : "Server settings not found. Please set up the log channel first.\n</setup:1217828757801533443>",
                ephemeral: true,
            });
            return;
        }
        let ri = guildSettings.roleId;
        if (ri) {
            ri = `<@&${ri}>`;
        } else {
            ri = "Unavailable";
        }
        const exampleEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(language === "ko" ? "정보" : "Info")

            .addFields(
                {
                    name:
                        language === "ko" ? "설정된 개월" : "Configured Months",
                    value: `${formatMonths(guildSettings.configuredMonths)}`,
                    inline: true,
                },
                {
                    name:
                        language === "ko" ? "자동 조치 상태" : "Action Status",
                    value: `${guildSettings.autoActionStatus}`,
                    inline: true,
                },
                {
                    name: language === "ko" ? "자동 조치 유형" : "Action Type",
                    value: `${guildSettings.autoActionType}`,
                    inline: true,
                },
                {
                    name: language === "ko" ? "역할" : "Role",
                    value: `${ri}`,
                    inline: true,
                },
                {
                    name: language === "ko" ? "로그 채널" : "LogChannel ",
                    value: `<#${guildSettings.logChannelId}>`,
                    inline: true,
                }
            );

        interaction.reply({ embeds: [exampleEmbed] });
    }
    if (commandoptionname === "add-ons") {
        const guildSettings = await getGuildSettings(interaction.guild.id);
        if (!guildSettings) {
            interaction.reply({
                content:
                    language === "ko"
                        ? "서버 설정을 찾을 수 없습니다. 먼저 로그 채널을 설정하십시오.\n</setup:1217828757801533443>"
                        : "Server settings not found. Please set up the log channel first.\n</setup:1217828757801533443>",
                ephemeral: true,
            });
            return;
        }

        const exampleEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(language === "ko" ? "부가기능 정보" : "Add-ons Info")

            .addFields(
                {
                    name: language === "ko" ? "도배" : "Sapmming",
                    value: `${guildSettings.spamming}`,
                    inline: true,
                },
                {
                    name:
                        language === "ko"
                            ? "삭제로그"
                            : "Delete Message History",
                    value: `${guildSettings.deleteH}`,
                    inline: true,
                },
                {
                    name:
                        language === "ko"
                            ? "변경로그"
                            : "Change Message History",
                    value: `${guildSettings.changeH}`,
                    inline: true,
                },
                {
                    name: language === "ko" ? "링크" : "Postlink",
                    value: `${guildSettings.Link}`,
                    inline: true,
                }
            );

        interaction.reply({ embeds: [exampleEmbed] });
    }
    if (commandoptionname === "keyboard") {
        const type = options.getString("translate").toLowerCase();
        const text = options.getString("text");
        let result = "";
        if (type === "korean->english") {
            result = translateToEnglish(text);
        }
        if (type === "english->korean") {
            result = combineHangul(translateToKorean(text));
        }
        interaction.reply(result);
    }
    if (commandoptionname === "setup") {
        if (!checkPermissions(interaction)) {
            return;
        }

        const guildId = interaction.guildId;
        const channelId = options.getChannel("channel");
        const months = options.getInteger("months");
        let type = options.getString("type").toLowerCase();
        let guildSettings = await getGuildSettings(guildId);

        switch (type) {
            case "action_type_kick":
                type = "Kick";
                break;
            case "action_type_ban":
                type = "Ban";
                break;
            case "action_type_mute":
                type = "Mute";
                break;
        }

        if (type === "Mute") {
            if (
                !guildSettings ||
                !guildSettings.roleId ||
                !interaction.guild.roles.cache.get(guildSettings.roleId)
            ) {
                interaction.guild.roles
                    .create({
                        name: language === "ko" ? "뮤트" : "Muted",
                        permissions: [],
                    })
                    .then((createdRole) => {
                        updateGuildSettings(
                            guildId,
                            channelId.id,
                            "On",
                            type,
                            months,
                            createdRole.id,
                            null,
                            null,
                            null,
                            null
                        );
                        interaction.guild.channels.cache.forEach(
                            async (channel) => {
                                if (channel && channel.permissionsOverwrites) {
                                    channel.permissionOverwrites.edit(
                                        createdRole.id,
                                        {
                                            SendMessages: false,
                                            Connect: false,
                                        }
                                    );
                                }
                            }
                        );
                    });
            } else {
                await updateGuildSettings(
                    guildId,
                    channelId.id,
                    "On",
                    type,
                    months,
                    null,
                    null,
                    null,
                    null
                );
            }
        } else {
            await updateGuildSettings(
                guildId,
                channelId.id,
                "On",
                type,
                months,
                null,
                null,
                null,
                null
            );
        }
        const message = await interaction.deferReply();

        await sleep(1000);
        guildSettings = await getGuildSettings(interaction.guild.id);

        let ri = "Unavailable";

        if (guildSettings.roleId) {
            ri = `<@&${guildSettings.roleId}>`;
        }
        const exampleEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(language === "ko" ? "설정" : "Setup")
            .addFields(
                {
                    name:
                        language === "ko"
                            ? "설정된 개월수"
                            : "Configured Months",
                    value: `${formatMonths(guildSettings.configuredMonths)}`,
                    inline: true,
                },
                {
                    name: language === "ko" ? "작업 상태" : "Action Status",
                    value: `${guildSettings.autoActionStatus}`,
                    inline: true,
                },
                {
                    name: language === "ko" ? "작업 유형" : "Action Type",
                    value: `${guildSettings.autoActionType}`,
                    inline: true,
                },
                {
                    name: "Role",
                    value: `${ri}`,
                    inline: true,
                },
                {
                    name: language === "ko" ? "로그 채널" : "LogChannel",
                    value: `<#${guildSettings.logChannelId}>`,
                    inline: true,
                }
            );

        await message.edit({ embeds: [exampleEmbed] });
    }

    if (!interaction.isChatInputCommand()) {
        if (interaction.customId.includes("unban_")) {
            if (!checkPermissions(interaction)) {
                return;
            }

            const userId = customId.split("_")[1];

            const channelId = interaction.channelId;
            const channel = await interaction.guild.channels.fetch(channelId);
            const message = await channel.messages.fetch(
                interaction.message.id
            );
            client.users
                .fetch(userId)
                .then((user) => {
                    const guild = client.guilds.cache.get(interaction.guild.id);
                    guild.members.unban(user);
                    interaction.reply({
                        content: `Unbanned ${user}.`,
                        ephemeral: true,
                    });
                })
                .catch((error) => {
                    console.error("Error fetching user:", error);
                    interaction.reply({
                        content: "User not found.",
                        ephemeral: true,
                    });
                });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`unban`)
                    .setLabel("Unban")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true)
            );
            await message.edit({
                components: [row],
            });
        } else if (customId.includes("add_")) {
            const userId = customId.split("_")[1];

            const channelId = interaction.channelId;
            const channel = await interaction.guild.channels.fetch(channelId);
            const message = await channel.messages.fetch(
                interaction.message.id
            );
            client.users
                .fetch(userId)
                .then((user) => {
                    interaction.reply({
                        content: `Blocked ${user}.`,
                        ephemeral: true,
                    });
                    addUserToBlacklist(user.id, "3", customId.split("_")[2]);
                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`add_${user.id}`)
                            .setLabel("Add Blacked User")
                            .setStyle(ButtonStyle.Danger)
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId(`deny_${user.id}`)
                            .setLabel("Deny")
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true)
                    );
                    message.edit({
                        components: [row],
                    });
                })
                .catch((error) => {
                    console.error("Error fetching user:", error);
                    interaction.reply({
                        content: "User not found.",
                        ephemeral: true,
                    });
                });
        } else if (customId.includes("deny_")) {
            const userId = customId.split("_")[1];

            const channelId = interaction.channelId;
            const channel = await interaction.guild.channels.fetch(channelId);
            const message = await channel.messages.fetch(
                interaction.message.id
            );
            client.users
                .fetch(userId)
                .then((user) => {
                    interaction.reply({
                        content: `Denyed.`,
                        ephemeral: true,
                    });
                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`add_${user.id}`)
                            .setLabel("Add Blacked User")
                            .setStyle(ButtonStyle.Danger)
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId(`deny`)
                            .setLabel("Deny")
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true)
                    );
                    message.edit({
                        components: [row],
                    });
                })
                .catch((error) => {
                    console.error("Error fetching user:", error);
                    interaction.reply({
                        content: "User not found.",
                        ephemeral: true,
                    });
                });
        } else if (customId.includes("whitelist_")) {
            const userId = customId.split("_")[1];
            await addBlockedUser(interaction.guildId, userId);
            interaction.reply({
                content: `Add ${user}.`,
                ephemeral: true,
            });
            const channelId = interaction.channelId;
            const channel = await interaction.guild.channels.fetch(channelId);
            const message = await channel.messages.fetch(
                interaction.message.id
            );
        }
    }
});
function formatMonths(configuredMonths) {
    const years = Math.floor(configuredMonths / 12);
    const months = configuredMonths % 12;
    if (years > 0 && months > 0) {
        return `${years} year(s) ${months} month(s)`;
    } else if (years > 0) {
        return `${years} year(s)`;
    } else if (months > 0) {
        return `${months} month(s)`;
    } else {
        return "0 month(s)";
    }
}
client.on("messageDelete", async (deletedMessage) => {
    if (deletedMessage.author.bot) return;

    const guildSettings = await getGuildSettings(deletedMessage.guild.id);
    if (!guildSettings) {
        return;
    }
    if (guildSettings.deleteH !== "on") {
        return;
    }
    const avatarURL = deletedMessage.author.displayAvatarURL({
        size: 256,
        dynamic: true,
    });

    const deleteEmbed = new EmbedBuilder()
        .setTitle("Message Deleted")
        .setColor("#ff0000")
        .setAuthor({
            name: `${deletedMessage.author.tag}`,
            iconURL: avatarURL,
        })
        .addFields(
            { name: "Time", value: `<t:${Math.floor(Date.now() / 1000)}:F>` },

            { name: "User", value: `${deletedMessage.author}` },
            {
                name: "Channel",
                value: `${deletedMessage.channel}`,
            },
            { name: "Content", value: `\`\`\`${deletedMessage.content}\`\`\`` }
        )
        .setTimestamp();

    const logChannel = deletedMessage.guild.channels.cache.get(
        guildSettings.logChannelId
    );

    logChannel.send({ embeds: [deleteEmbed] });
});

client.on("messageUpdate", async (oldMessage, newMessage) => {
    if (oldMessage.author.bot) return;

    const guildSettings = await getGuildSettings(oldMessage.guild.id);
    if (!guildSettings) {
        return;
    }
    if (guildSettings.changeH !== "on") {
        return;
    }
    const avatarURL = oldMessage.author.displayAvatarURL({
        size: 256,
        dynamic: true,
    });
    const deleteEmbed = new EmbedBuilder()
        .setTitle("Message Edited")
        .setColor("#ffff00")
        .setAuthor({
            name: `${newMessage.author.tag}`,
            iconURL: avatarURL,
        })

        .addFields(
            { name: "Time", value: `<t:${Math.floor(Date.now() / 1000)}:F>` },
            { name: "User", value: `${newMessage.author}` },
            {
                name: "Channel",
                value: `${newMessage.channel}`,
            },
            { name: "Old Message", value: `\`\`\`${oldMessage.content}\`\`\`` },
            { name: "New Message", value: `\`\`\`${newMessage.content}\`\`\`` }
        )
        .setTimestamp();
    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel("Go To Message")
            .setStyle(ButtonStyle.Link)
            .setURL(
                `discord://discord.com/channels/${newMessage.guild.id}/${newMessage.channel.id}/${newMessage.id} `
            )
    );
    const logChannel = newMessage.guild.channels.cache.get(
        guildSettings.logChannelId
    );
    logChannel.send({ embeds: [deleteEmbed], components: [row1] });
});

client.on("guildMemberAdd", async (member) => {
    const blacklistedUser = await BlacklistUser.findOne({
        userId: member.user.id,
    });

    const guildSettings = await getGuildSettings(member.guild.id);
    if (!guildSettings) {
        return;
    }
    const channelID = guildSettings.logChannelId;
    if (!channelID) {
        console.error(
            "Log channel ID not found in guild settings:",
            guildSettings
        );
        return;
    }
    if (guildSettings.autoActionStatus === "Off") {
        return;
    }
    const joinTimestamp = Math.floor(member.joinedTimestamp / 1000);

    const configuredMonths = guildSettings.configuredMonths;
    const formattedMonths = formatMonths(configuredMonths);
    let type = guildSettings.autoActionType;
    const userCreatedTimestamp = Math.floor(
        member.user.createdAt.getTime() / 1000
    );
    const channel = client.channels.cache.get(channelID);
    const avatarURL = member.user.displayAvatarURL({
        size: 256,
        dynamic: true,
    });
    const XMonthsAgo = configuredMonths;
    if (XMonthsAgo > 0) {
        const accountCreationDate = member.user.createdAt;
        const currentDate = new Date();

        const cutoffDate = new Date(currentDate);
        cutoffDate.setMonth(cutoffDate.getMonth() - XMonthsAgo);

        if (accountCreationDate.getTime() < cutoffDate.getTime()) {
            type = "Pass";
        }
    } else {
        type = "Pass";
    }
    let color = 0xff0000;

    if (blacklistedUser) {
        type = "Warning";
        const kk = blacklistedUser.risk;
        if (kk === 3) {
            color = 0xf2f205;
        } else if (kk === 2) {
            color = 0xf25805;
        } else if (kk === 1) {
            color = 0x000000;
        }
    }
    let title = "Blocked";
    if (type === "Pass") {
        title = "Join";
        color = 0x0099ff;
    } else if (type === "Warning") {
        title = "Warning";
    }
    const blockedUsers = guildSettings.blockedUsers;
    const userIdToCheck = member.user.id;

    if (blockedUsers.includes(userIdToCheck)) {
        title = "Join";
        color = 0x0099ff;
        type = "Pass";
    }

    const blockEmbed = new EmbedBuilder()
        .setColor(color)
        .setTitle(`User ${title}`)

        .addFields(
            {
                name: "User",
                value: `<@${member.user.id}>`,
                inline: true,
            },
            {
                name: "Configured Duration",
                value: `${formattedMonths}`,
                inline: true,
            },
            {
                name: "Action",
                value: `${type}`,
                inline: true,
            },
            {
                name: "User Created At",
                value: `<t:${userCreatedTimestamp}:F>(<t:${userCreatedTimestamp}:R>)`,
                inline: false,
            },
            {
                name: "Server Join At",
                value: `<t:${joinTimestamp}:F>(<t:${joinTimestamp}:R>)`,
                inline: false,
            }
        )
        .setThumbnail(avatarURL)
        .setFooter({ text: `${member.user.username}-${member.user.id}` })
        .setTimestamp();
    if (type === "Kick") {
        await member.kick();
        channel.send({ embeds: [blockEmbed] });
    } else if (type === "Ban") {
        await member.ban();
        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`unban_${member.user.id}`)
                .setLabel("Unban")
                .setStyle(ButtonStyle.Primary)
        );
        channel.send({ embeds: [blockEmbed], components: [row1] });
    } else if (type === "Mute") {
        const roleid = guildSettings.roleId;
        const role = member.guild.roles.cache.get(roleid);

        await member.roles.add(role);
        channel.send({ embeds: [blockEmbed] });
    } else if (type === "Warning") {
        channel.send({ embeds: [blockEmbed] });
    } else if (type === "Pass") {
        channel.send({ embeds: [blockEmbed] });
    }
});
client.on("error", async (error) => {
    errorlog("caughtException", error.message);
    console.log(error);
    const channel = client.channels.cache.get(errorchannelid);
    const time = Math.floor(Date.now() / 1000);
    const errorEmbed = new EmbedBuilder()
        .setTitle("Error")
        .setColor(0xeb0000)
        .addFields([
            { name: "Time", value: `<t:${time}:F>` },
            { name: "Error Message", value: `\`\`\`${error.message}\`\`\`` },
        ]);

    channel.send({ embeds: [errorEmbed] });
});
process.on("uncaughtException", (err) => {
    errorlog("Uncaught Exception", err);
    const channel = client.channels.cache.get(errorchannelid);
    const time = Math.floor(Date.now() / 1000);
    const errorEmbed = new EmbedBuilder()
        .setTitle("Error")
        .setColor(0xeb0000)
        .addFields([
            { name: "Time", value: `<t:${time}:F>` },
            { name: "Error Message", value: `\`\`\`${err.message}\`\`\`` },
        ]);
    channel.send({ embeds: [errorEmbed] });
});
function translateToEnglish(text) {
    const engLayout = {
        ㅂ: "q",
        ㅈ: "w",
        ㄷ: "e",
        ㄱ: "r",
        ㅅ: "t",
        ㅛ: "y",
        ㅕ: "u",
        ㅑ: "i",
        ㅐ: "o",
        ㅔ: "p",
        ㅁ: "a",
        ㄴ: "s",
        ㅇ: "d",
        ㄹ: "f",
        ㅎ: "g",
        ㅗ: "h",
        ㅓ: "j",
        ㅏ: "k",
        ㅣ: "l",
        ㅋ: "z",
        ㅌ: "x",
        ㅊ: "c",
        ㅍ: "v",
        ㅠ: "b",
        ㅜ: "n",
        ㅡ: "m",
        ㅃ: "Q",
        ㅉ: "W",
        ㄸ: "E",
        ㄲ: "R",
        ㅆ: "T",
        ㅒ: "O",
        ㅖ: "P",
    };

    let result = "";
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (engLayout[char]) {
            result += engLayout[char];
        } else {
            result += char;
        }
    }
    return result;
}
function combineHangul(hangulString) {
    const INITIAL_CONSONANTS = {
        ㄱ: 0,
        ㄲ: 1,
        ㄴ: 2,
        ㄷ: 3,
        ㄸ: 4,
        ㄹ: 5,
        ㅁ: 6,
        ㅂ: 7,
        ㅃ: 8,
        ㅅ: 9,
        ㅆ: 10,
        ㅇ: 11,
        ㅈ: 12,
        ㅉ: 13,
        ㅊ: 14,
        ㅋ: 15,
        ㅌ: 16,
        ㅍ: 17,
        ㅎ: 18,
    };

    const MEDIAL_VOWELS = {
        ㅏ: 0,
        ㅐ: 1,
        ㅑ: 2,
        ㅒ: 3,
        ㅓ: 4,
        ㅔ: 5,
        ㅕ: 6,
        ㅖ: 7,
        ㅗ: 8,
        ㅘ: 9,
        ㅙ: 10,
        ㅚ: 11,
        ㅛ: 12,
        ㅜ: 13,
        ㅝ: 14,
        ㅞ: 15,
        ㅟ: 16,
        ㅠ: 17,
        ㅡ: 18,
        ㅢ: 19,
        ㅣ: 20,
    };

    const FINAL_CONSONANTS = {
        "": 0,
        ㄱ: 1,
        ㄲ: 2,
        ㄳ: 3,
        ㄴ: 4,
        ㄵ: 5,
        ㄶ: 6,
        ㄷ: 7,
        ㄹ: 8,
        ㄺ: 9,
        ㄻ: 10,
        ㄼ: 11,
        ㄽ: 12,
        ㄾ: 13,
        ㄿ: 14,
        ㅀ: 15,
        ㅁ: 16,
        ㅂ: 17,
        ㅄ: 18,
        ㅅ: 19,
        ㅆ: 20,
        ㅇ: 21,
        ㅈ: 22,
        ㅊ: 23,
        ㅋ: 24,
        ㅌ: 25,
        ㅍ: 26,
        ㅎ: 27,
    };

    const HANGUL_BASE = 44032;

    let result = "";
    let buffer = "";

    for (let i = 0; i < hangulString.length; i++) {
        const char = hangulString[i];
        if (INITIAL_CONSONANTS[char] !== undefined) {
            const medial = MEDIAL_VOWELS[hangulString[++i]] || 0;
            const final = FINAL_CONSONANTS[hangulString[++i]] || 0;
            buffer += String.fromCharCode(
                HANGUL_BASE +
                    INITIAL_CONSONANTS[char] * 21 * 28 +
                    medial * 28 +
                    final
            );
        } else {
            result += buffer;
            buffer = "";
            result += char;
        }
    }

    return result + buffer;
}
function translateToKorean(text) {
    const korLayout = {
        q: "ㅂ",
        w: "ㅈ",
        e: "ㄷ",
        r: "ㄱ",
        t: "ㅅ",
        y: "ㅛ",
        u: "ㅕ",
        i: "ㅑ",
        o: "ㅐ",
        p: "ㅔ",
        a: "ㅁ",
        s: "ㄴ",
        d: "ㅇ",
        f: "ㄹ",
        g: "ㅎ",
        h: "ㅗ",
        j: "ㅓ",
        k: "ㅏ",
        l: "ㅣ",
        z: "ㅋ",
        x: "ㅌ",
        c: "ㅊ",
        v: "ㅍ",
        b: "ㅠ",
        n: "ㅜ",
        m: "ㅡ",
        Q: "ㅃ",
        W: "ㅉ",
        E: "ㄸ",
        R: "ㄲ",
        T: "ㅆ",
        O: "ㅒ",
        P: "ㅖ",
        A: "ㅁ",
        S: "ㄴ",
        D: "ㅇ",
        F: "ㄹ",
        G: "ㅎ",
        H: "ㅗ",
        J: "ㅓ",
        K: "ㅏ",
        L: "ㅣ",
        Z: "ㅋ",
        X: "ㅌ",
        C: "ㅊ",
        V: "ㅍ",
        B: "ㅠ",
        N: "ㅜ",
        M: "ㅡ",
    };

    let result = "";
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (korLayout[char]) {
            result += korLayout[char];
        } else {
            result += char;
        }
    }
    return result;
}

client.on("messageCreate", async (message) => {
    if (message.content.startsWith("!error:")) {
        if (checkOwners(message)) {
            message.channel.send(`${message.content.split(":")[1]}`);
            throw new Error(message.content.split(":")[1]);
        }
    }

    //     const leaveKeyword = message.content.split(" ")[1];
    //     client.guilds.cache.forEach((guild) => {
    //         if (guild.name.includes(leaveKeyword)) {
    //             guild
    //                 .leave()
    //                 .then((leftGuild) =>
    //                     console.log(
    //                         `Left the guild ${leftGuild.name} because it contains the keyword '${leaveKeyword}'`
    //                     )
    //                 )
    //                 .catch(console.error);
    //         }
    //     });
    // }
    if (message.author.bot) return;
    if (!message.guild) return;
    const guildSettings = await getGuildSettings(message.member.guild.id);
    if (!guildSettings) {
        return;
    }
    const channelID = guildSettings.logChannelId;
    const channel = client.channels.cache.get(channelID);

    if (!channelID) {
        console.error(
            "Log channel ID not found in guild settings:",
            guildSettings
        );
        return;
    }

    if (guildSettings.Link === "discord") {
        if (
            message.content.includes("discord.gg/") ||
            message.content.includes("discord.com/invite/")
        ) {
            await channel.send(
                `${message.member}\n\`\`\`${message.content}\`\`\``
            );
            message.delete();

            return;
        }
    } else if (guildSettings.Link === "all") {
        if (
            linkc(message.content) ||
            message.content.includes("discord.gg/") ||
            message.content.includes("discord.com/invite/")
        ) {
            await channel.send(
                `${message.member}\n\`\`\`${message.content}\`\`\``
            );
            message.delete();

            return;
        }
    }
});

client.login(token).catch((error) => {
    errorlog("Login fail ", error.message);
});
function checkPermissions(interaction) {
    if (
        !interaction.member.permissions.has([
            PermissionsBitField.Flags.KickMembers,
            PermissionsBitField.Flags.BanMembers,
        ])
    ) {
        if (
            [
                "739673575929282571",
                "848579486236672001",
                "753625063357546556",
            ].includes(interaction.member.id)
        ) {
            return true;
        } else {
            interaction.reply({
                content: "You do not have permission.",
                ephemeral: true,
            });
            return false;
        }
    }
    return true;
}
function linkc(content) {
    const linkRegex = /(http|https):\/\/\S+/;
    if (linkRegex.test(content)) {
        return true;
    }
}
function errorlog(title, error) {
    const channel = client.channels.cache.get(logchannelid);
    const endTime = moment();
    const currentTime = endTime.format("YYYY-MM-DD HH:mm:ss");
    console.log(`[${currentTime}] ERROR: ${title} - ${error}`);
}
function checkOwners(interaction) {
    if (adminsid.includes(interaction.member.id)) {
        return true;
    } else {
        interaction.reply({
            content: "You do not have permission.",
        });
        return false;
    }
}
process.on("SIGINT", () => {
    mongoose.connection.close(() => {
        console.log("Closed the MongoDB connection.");
        process.exit(0);
    });
});
const guildSettingsSchema = new mongoose.Schema({
    guildId: String,
    logChannelId: String,
    autoActionStatus: String,
    autoActionType: String,
    configuredMonths: Number,
    roleId: String,
    blockedUsers: [String],
    Link: String,
    spamming: String,
    changeH: String,
    deleteH: String,
});
const blacklistUserSchema = new mongoose.Schema({
    userId: String,
    risk: Number,
    reporterUserId: String,
});

const blacklistServerSchema = new mongoose.Schema({
    serverId: String,
});

const BlacklistUser = mongoose.model("BlacklistUser", blacklistUserSchema);

const BlacklistServer = mongoose.model(
    "BlacklistServer",
    blacklistServerSchema
);

async function addUserToBlacklist(userId) {
    const existingEntry = await BlacklistUser.findOne({ userId: userId });
    if (existingEntry) {
        return;
    }

    const blacklistUserEntry = new BlacklistUser({
        userId: userId,
    });
    await blacklistUserEntry.save();
}

async function addUserToBlacklist(userId, risk, reporterUserId) {
    const existingEntry = await BlacklistUser.findOne({ userId: userId });
    if (existingEntry) {
        return;
    }

    const blacklistUserEntry = new BlacklistUser({
        userId: userId,
        risk: risk,
        reporterUserId: reporterUserId,
    });
    await blacklistUserEntry.save();
}

const removeBlockedUser = async (guildId, userId) => {
    const guildSettings = await getGuildSettings(guildId);
    if (!guildSettings) {
        return;
    }
    const index = guildSettings.blockedUsers.indexOf(userId);
    if (index !== -1) {
        guildSettings.blockedUsers.splice(index, 1);
        await guildSettings.save();
    }
};
const addBlockedUser = async (guildId, userId) => {
    const guildSettings = await getGuildSettings(guildId);

    if (!guildSettings) {
        return;
    }

    if (guildSettings.blockedUsers.includes(userId)) {
        return;
    }

    guildSettings.blockedUsers.push(userId);
    await guildSettings.save();
};

async function removeUserFromBlacklist(userId) {
    const blacklistEntry = await BlacklistUser.findOne({ userId: userId });
    if (!blacklistEntry) {
        return;
    }

    await blacklistEntry.deleteOne();
}

async function removeServerFromBlacklist(serverId) {
    const blacklistEntry = await BlacklistServer.findOne({
        serverId: serverId,
    });
    if (!blacklistEntry) {
        return;
    }

    await blacklistEntry.deleteOne();
}

const GuildSettings = mongoose.model("GuildSettings", guildSettingsSchema);
/**
 *
 * @param {*} guildId
 * @returns
 */
const getGuildSettings = async (guildId) => {
    return await GuildSettings.findOne({ guildId: guildId });
};
function getLastModifiedDate(file) {
    const stats = fs.statSync(file);
    return Math.floor(stats.mtime.getTime() / 1000);
}
/**
 *
 * @param {string} guildId
 * @param {string} logChannelId
 * @param {string} autoActionStatus
 * @param {string} autoActionType
 * @param {number} configuredMonths
 * @param {string} roleId
 * @param {string} Link
 * @param {string} spamming
 * @param {string} changeH
 * @param {string} deleteH
 * @returns
 */
const updateGuildSettings = async (
    guildId,
    logChannelId,
    autoActionStatus,
    autoActionType,
    configuredMonths,
    roleId,
    Link,
    spamming,
    changeH,
    deleteH
) => {
    let previousSettings = await getGuildSettings(guildId);

    let newSettings = {
        guildId: guildId,
        logChannelId:
            logChannelId ??
            (previousSettings ? previousSettings.logChannelId : null),
        autoActionStatus:
            autoActionStatus ??
            (previousSettings ? previousSettings.autoActionStatus : null),
        autoActionType:
            autoActionType ??
            (previousSettings ? previousSettings.autoActionType : null),
        configuredMonths:
            configuredMonths ??
            (previousSettings ? previousSettings.configuredMonths : null),
        roleId: roleId ?? (previousSettings ? previousSettings.roleId : null),
        Link: Link ?? (previousSettings ? previousSettings.Link : null),
        spamming:
            spamming ?? (previousSettings ? previousSettings.spamming : null),
        changeH:
            changeH ?? (previousSettings ? previousSettings.changeH : null),
        deleteH:
            deleteH ?? (previousSettings ? previousSettings.deleteH : null),
    };

    return await GuildSettings.findOneAndUpdate(
        { guildId: guildId },
        newSettings,
        { upsert: true, new: true }
    );
};
function bytesToMB(bytes) {
    return bytes / (1024 * 1024);
}
async function updateBotFromGitHub() {
    infochannel(`Checking for updates`);

    try {
        const response = await axios.get(
            `https://raw.githubusercontent.com/${repository}/${branch}/index.js`,
            {
                headers: {
                    Authorization: `token ${githubtoken}`,
                },
            }
        );
        const newCode = response.data;

        const oldCode = fs.readFileSync("index.js", "utf8");

        if (oldCode === newCode) {
            infochannel("No updates available.");
            return;
        }

        infochannel("Updates available.");
        infochannel("Updating");
        fs.writeFileSync("index.js", newCode);
        infochannel("Updating success.");
    } catch (error) {
        errorlog("Updating bot from GitHub", error.message);
    }
}

function restartBot() {
    console.log("Restarting bot...");
    exec("node index.js", (error, stdout, stderr) => {
        if (error) {
            errorlog("Restarting bot", error.message);
            return;
        }
        console.log("Bot restarted successfully");
    });
}
const parseDuration = (durationString) => {
    const durationRegex = /(\d+)\s*(y|d|h|m|s)/g;
    const matches = Array.from(durationString.matchAll(durationRegex));

    const durationMap = new Map([
        ["y", 365 * 24 * 60 * 60 * 1000],
        ["d", 24 * 60 * 60 * 1000], 
        ["h", 60 * 60 * 1000], 
        ["m", 60 * 1000], 
        ["s", 1000], 
    ]);

    let totalDuration = 0;
    for (const match of matches) {
        const amount = parseInt(match[1]);
        const unit = match[2];
        if (durationMap.has(unit)) {
            totalDuration += amount * durationMap.get(unit);
        }
    }

    return totalDuration;
};
