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
    Collection,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} = require("discord.js");
const Discord = require("discord.js");
const { CaptchaGenerator } = require("captcha-canvas"); //require package here
const { createCanvas } = require("canvas");
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
    SafeBrowsingAPI_Key,
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
const { verify } = require("crypto");
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
                .setName("verifiy")
                .setDescription("Display verifiy settings.")
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
                .setName("verification_setup")
                .setDescription(
                    "Add spam blocking functionality to the server."
                )
                .addChannelOption((option) =>
                    option
                        .setName("verificationlocation")
                        .setDescription("Select the channel to output logs.")
                        .setRequired(true)
                )
                .addIntegerOption((option) =>
                    option
                        .setName("timelimit")
                        .setDescription("Enter the number of min to set.")
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName("action")
                        .setDescription(
                            "Select the action to take. (Kick or Ban)"
                        )
                        .addChoices({
                            name: "Kick",
                            value: "Verification_kick",
                        })
                        .addChoices({ name: "Ban", value: "Verification_ban" })
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName("type")
                        .setDescription(
                            "Select the action to take. (Kick or Ban)"
                        )
                        .addChoices({
                            name: "Web(Developing)",
                            value: "Verification_web",
                        })
                        .addChoices({
                            name: "Discord CAPTCHA",
                            value: "Verification_discord",
                        })
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("verification_disable")
                .setDescription("Verification disable")
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
                .setDescription("Timeout the user.")
                .addUserOption((option) =>
                    option
                        .setName("user")
                        .setDescription("User to timeout")
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName("duration")
                        .setDescription("Timeout duration")
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option.setName("reason").setDescription("Timeout reason")
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("kick")
                .setDescription("Kick the user.")
                .addUserOption((option) =>
                    option
                        .setName("user")
                        .setDescription("User to kick")
                        .setRequired(true)
                )

                .addStringOption((option) =>
                    option.setName("reason").setDescription("Kick reason")
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("ban")
                .setDescription("Ban the user.")
                .addUserOption((option) =>
                    option
                        .setName("user")
                        .setDescription("User to ban")
                        .setRequired(true)
                )

                .addStringOption((option) =>
                    option.setName("reason").setDescription("Ban reason")
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
                .setDescription(
                    "Block user to spamming.When spamming is detected, a 5-minute timeout is automatically given."
                )
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
                            name: "Scan",
                            value: "link_action_scan",
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

    new SlashCommandBuilder().setName("utility").setDescription("Utility"),

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
                .setName("eval")
                .setDescription("eval code")

                .addStringOption((option) =>
                    option
                        .setName("code")
                        .setDescription("enter code")
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
    infochannel(`Bot is ready. Took ${loginTime} seconds.`);
    await mongoose
        .connect(mongodb, {})
        .then(() => {
            infochannel("Connected Database");
        })
        .catch((error) => {
            errorlog("Connect Database fail", error.message);
        });
    let guild_counter = 0;
    client.guilds.cache.forEach(() => {
        guild_counter++;
    });
    infochannel(`Discord.js Version : ${Discord.version}`);
    infochannel(`Guild total : ${guild_counter}`);
    try {
        infochannel("Started refreshing application (/) commands.");

        rest.put(Routes.applicationCommands(clientid), {
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
    const endTime = moment();
    const currentTime = endTime.format("YYYY-MM-DD HH:mm:ss");
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
            const guildMember = await interaction.guild.members.fetch(user.id);
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
    if (commandoptionname === "deletehistory") {
        if (!checkPermissions(interaction)) {
            return;
        }
        const guildSettings = await getGuildSettings(guild.id);
        if (!guildSettings) {
            guildnull(interaction);
            return;
        }

        let status = options.getString("status").toLowerCase();
        if (status === "delete_status_on") {
            const embed = new EmbedBuilder()
                .setColor(0x128afa)
                .setTitle(
                    language === "ko"
                        ? "메세지 삭제로그가 활성화 되었습니다."
                        : `Message deletion log has been activated`
                );
            interaction.reply({
                embeds: [embed],
            });
            status = "on";
        } else if (status === "delete_status_off") {
            const embed = new EmbedBuilder()
                .setColor(0x128afa)
                .setTitle(
                    language === "ko"
                        ? "메세지 삭제로그가 비활성화되었습니다."
                        : `Message deletion log has been disabled`
                );
            interaction.reply({
                embeds: [embed],
            });
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
            const embed = new EmbedBuilder()
                .setColor(0x128afa)
                .setTitle(`User timeouted`)
                .setFields(
                    { name: `User`, value: `${user}`, inline: true },
                    { name: `Reason`, value: `${reason}`, inline: true },
                    {
                        name: `Duration`,
                        value: `${durationString}`,
                        inline: true,
                    }
                );
            interaction.reply({ embeds: [embed] });
        } catch (err) {
            const embed = new EmbedBuilder()
                .setTitle("Error")
                .setColor(0xff0000)
                .setDescription(`${err.message || "Something went wrong"}`);
            return interaction.reply({ embeds: [embed] });
        }
    }
    if (commandoptionname === "kick") {
        if (!checkPermissions(interaction)) return;
        const user = interaction.options.getMember("user");
        const reason =
            interaction.options.getString("reason") || "No reason provide";
        try {
            await user.kick(reason);
            const embed = new EmbedBuilder()
                .setColor(0x128afa)
                .setTitle(`User kicked`)
                .setFields(
                    { name: `User`, value: `${user}`, inline: true },
                    { name: `Reason`, value: `${reason}`, inline: true }
                );
            interaction.reply({ embeds: [embed] });
        } catch (err) {
            const embed = new EmbedBuilder()
                .setTitle("Error")
                .setColor(0xff0000)
                .setDescription(`${err.message || "Something went wrong"}`);
            return interaction.reply({ embeds: [embed] });
        }
    }
    if (commandoptionname === "ban") {
        if (!checkPermissions(interaction)) return;
        const user = interaction.options.getMember("user");
        const reason =
            interaction.options.getString("reason") || "No reason provide";
        try {
            await user.ban(reason);
            const embed = new EmbedBuilder()
                .setColor(0x128afa)
                .setTitle(`User banned`)
                .setFields(
                    { name: `User`, value: `${user}`, inline: true },
                    { name: `Reason`, value: `${reason}`, inline: true }
                );
            interaction.reply({ embeds: [embed] });
        } catch (err) {
            const embed = new EmbedBuilder()
                .setTitle("Error")
                .setColor(0xff0000)
                .setDescription(`${err.message || "Something went wrong"}`);
            return interaction.reply({ embeds: [embed] });
        }
    }
    if (commandoptionname === "changehistory") {
        if (!checkPermissions(interaction)) {
            return;
        }
        const guildSettings = await getGuildSettings(guild.id);
        if (!guildSettings) {
            guildnull(interaction);
            return;
        }

        let status = options.getString("status").toLowerCase();
        if (status === "change_status_on") {
            const embed = new EmbedBuilder()
                .setColor(0x128afa)
                .setTitle(
                    language === "ko"
                        ? "메세지 변경로그가 활성화되었습니다."
                        : `Message change log has been activated`
                );
            interaction.reply({
                embeds: [embed],
            });
            status = "on";
        } else if (status === "change_status_off") {
            const embed = new EmbedBuilder()
                .setColor(0x128afa)
                .setTitle(
                    language === "ko"
                        ? "메세지 변경로그가 비활성화되었습니다."
                        : `Message change log has been disabled`
                );
            interaction.reply({
                embeds: [embed],
            });
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
            guildnull(interaction);
            return;
        }

        let status = options.getString("status").toLowerCase();
        if (status === "spamming_status_on") {
            status = "on";
            const embed = new EmbedBuilder()
                .setColor(0x128afa)
                .setTitle(
                    language === "ko"
                        ? "도배방지 기능이 활성화되었습니다."
                        : `Anti-spam is activated`
                );
            interaction.reply({
                embeds: [embed],
            });
        } else if (status === "spamming_status_off") {
            status = "off";
            const embed = new EmbedBuilder()
                .setColor(0x128afa)
                .setTitle(
                    language === "ko"
                        ? "도배방지 기능이 비활성화되었습니다."
                        : `Anti-spam is disabled`
                );
            interaction.reply({
                embeds: [embed],
            });
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
            guildnull(interaction);
            return;
        }

        let action = options.getString("action").toLowerCase();
        if (action === "link_action_all") {
            const embed = new EmbedBuilder()
                .setColor(0x128afa)
                .setTitle(
                    language === "ko"
                        ? "링크보안이 모든링크로 설정되었습니다."
                        : `Link security is set to All Links.`
                );
            interaction.reply({
                embeds: [embed],
            });
            action = "all";
        } else if (action === "link_action_discord") {
            const embed = new EmbedBuilder()
                .setColor(0x128afa)
                .setTitle(
                    language === "ko"
                        ? "링크보안이 디스코드 초대링크로 설정되었습니다."
                        : `Link security is set to Discord invitation link.`
                );
            interaction.reply({
                embeds: [embed],
            });
            action = "discord";
        } else if (action === "link_action_scan") {
            const embed = new EmbedBuilder()
                .setColor(0x128afa)
                .setTitle(
                    language === "ko"
                        ? "링크보안이 스캔으로 설정되었습니다."
                        : `Link security is set to scan link.`
                );
            interaction.reply({
                embeds: [embed],
            });
            action = "scan";
        } else if (action === "link_action_disable") {
            const embed = new EmbedBuilder()
                .setColor(0x128afa)
                .setTitle(
                    language === "ko"
                        ? "링크보안이 꺼졌습니다."
                        : `Link security is turned off.`
                );
            interaction.reply({
                embeds: [embed],
            });
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
        }
    }
    if (commandoptionname === "checkuser") {
        let newMembers = [];
        const messagedefer = await interaction.deferReply();

        const guildSettings = await getGuildSettings(guild.id);

        if (!guildSettings) {
            const embed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle(`Server settings not found`)
                .setDescription(
                    language === "ko"
                        ? "서버 설정을 찾을 수 없습니다. 먼저 로그 채널을 설정하십시오.\n</management setup:1224629739877306430>"
                        : "Server settings not found. Please set up the log channel first.\n</management setup:1224629739877306430>"
                );
            await messagedefer.edit({
                embeds: [embed],
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
                    const embed = new EmbedBuilder()
                        .setColor(0x128afa)
                        .setTitle(`Result`)
                        .setDescription(
                            language === "ko"
                                ? `다음 멤버들의 계정 생성일이 ${configuredMonths}개월 미만입니다.\n${message}`
                                : `The following members' account creation dates are less than ${configuredMonths} month(s) ago:\n${message}`
                        );

                    await messagedefer.edit({ embeds: [embed] });
                } else {
                    const embed = new EmbedBuilder()
                        .setColor(0x128afa)
                        .setTitle(`Result`)
                        .setDescription(
                            language === "ko"
                                ? `지난 ${configuredMonths}달 동안 가입한 멤버가 없습니다.`
                                : `No members joined in the last ${configuredMonths} month(s).`
                        );

                    await messagedefer.edit({ embeds: [embed] });
                }
            })
            .catch(console.error);
    }
    if (commandoptionname === "eval") {
        const command = options.getString("code");
        if (checkOwners(interaction)) {
            try {
                const result = await eval(command);
                const embed = new EmbedBuilder()
                    .setColor("#128AFA")
                    .setTitle("Evaluation Result")
                    .addFields(
                        {
                            name: "Input",
                            value: `\`\`\`javascript\n${command}\`\`\``,
                        },
                        {
                            name: "Output",
                            value: `\`\`\`javascript\n${result}\`\`\``,
                        }
                    )

                    .setTimestamp();

                interaction.reply({ embeds: [embed] });
            } catch (error) {
                const embed = new EmbedBuilder()
                    .setColor("#ff0000")
                    .setTitle("Evaluation Error")
                    .addFields(
                        {
                            name: "Input",
                            value: `\`\`\`javascript\n${command}\`\`\``,
                        },
                        {
                            name: "Output",
                            value: `\`\`\`javascript\n${error}\`\`\``,
                        }
                    )
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

            const embed = new EmbedBuilder()
                .setColor(0x128afa)
                .setTitle(
                    language === "ko"
                        ? `${messages.size}개의 메세지를 삭제하였습니다.`
                        : `Deleted ${messages.size} messages.`
                );
            interaction.reply({
                embeds: [embed],
            });
        } catch (error) {
            console.error("Error deleting messages:", error);
            const embed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle(`An error occurred while deleting messages.`);
            interaction.reply({
                embeds: [embed],
            });
        }
    }

    if (commandoptionname === "officialblacklist") {
        const blacklistedUsers = await BlacklistUser.find();
        const blacklistedServers = await BlacklistServer.find();
        if (interaction.user.id.includes(adminsid)) {
            const embed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle("You don't have permission.");
            interaction.reply({
                embeds: [embed],
                ephemeral: true,
            });
            return;
        }
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
            const embed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle(`Report`)
                .setDescription(
                    language === "ko"
                        ? "사용자와 이유를 모두 제공해주세요."
                        : "Please provide both user and reason."
                );
            await interaction.reply({
                embeds: [embed],
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
        const embed = new EmbedBuilder()
            .setColor(0x128afa)
            .setTitle(`Report`)
            .setDescription(
                language === "ko"
                    ? `사용자 ${user}이(가) ${reason}으로 신고되었습니다.`
                    : `User ${user} was reported for ${reason}.`
            );
        await interaction.reply({
            embeds: [embed],
            ephemeral: true,
        });
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
                const embed = new EmbedBuilder()
                    .setColor(0x128afa)
                    .setTitle(`whitelist`)
                    .setDescription(
                        language === "ko"
                            ? "화이트리스트가 없습니다."
                            : "No Whitelist Users."
                    );
                interaction.reply({
                    embeds: [embed],
                });
                return;
            }
            const blockedUsers = guildSettings.blockedUsers
                .map((userId) => `<@${userId}>`)
                .join(", ");

            const embed = new EmbedBuilder()
                .setColor(0x128afa)
                .setTitle(`whitelist`)
                .setDescription(
                    language === "ko"
                        ? `화이트리스트: ${blockedUsers}`
                        : `Whitelist: ${blockedUsers}`
                );
            interaction.reply({
                embeds: [embed],
            });
        } catch (error) {
            console.error("Error listing Whitelist users:", error);
        }
    }
    if (commandoptionname === "addwhitelist") {
        if (!checkPermissions(interaction)) {
            return;
        }
        const guildId = interaction.guildId;

        const guildSettings = await getGuildSettings(guildId);
        if (!guildSettings) {
            guildnull(interaction);
            return;
        }

        const user = options.getUser("user");
        await addBlockedUser(guildId, user.id);
        const embed = new EmbedBuilder()
            .setColor(0x128afa)
            .setTitle(`Add to whitelist`)
            .setDescription(
                language === "ko"
                    ? `${user}가 화이트리스트로 등록되었습니다.`
                    : `${user}has been added to the white list.`
            );
        interaction.reply({
            embeds: [embed],
        });
    }
    if (commandoptionname === "removewhitelist") {
        if (!checkPermissions(interaction)) {
            return;
        }
        const guildId = interaction.guildId;

        const guildSettings = await getGuildSettings(guildId);
        if (!guildSettings) {
            guildnull(interaction);
            return;
        }
        const user = options.getUser("user");
        await removeBlockedUser(guildId, user.id);

        const embed = new EmbedBuilder()
            .setColor(0x128afa)
            .setTitle("Remove from whitelist")
            .setDescription(
                language === "ko"
                    ? `${user}님을 화이트리스트에서 제거 했습니다.`
                    : `${user}has been removed from the whitelist.`
            );
        interaction.reply({
            embeds: [embed],
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
            guildnull(interaction);
            return;
        }
        const logChannelId = guildSettings.logChannelId;

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

            const embed = new EmbedBuilder()
                .setColor(0x128afa)
                .setTitle(
                    language === "ko"
                        ? `자동 조치가 ${
                              status === "On"
                                  ? "활성화되었습니다."
                                  : "비활성화되었습니다."
                          }`
                        : `Automatic action is ${
                              status === "On" ? "enabled" : "disabled"
                          }.`
                );
            interaction.reply({
                embeds: [embed],
            });
        } catch (error) {
            console.error("Error updating guild settings:", error);
            const embed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle(`Error`)
                .setDescription(
                    language === "ko"
                        ? "자동 조치 상태를 설정하는 중 오류가 발생했습니다."
                        : "An error occurred while setting the automatic action status."
                );
            interaction.reply({
                embeds: [embed],
                ephemeral: true,
            });
        }
    }
    if (commandoptionname === "server") {
        const guildSettings = await getGuildSettings(interaction.guild.id);
        if (!guildSettings) {
            guildnull(interaction);
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
    if (commandoptionname === "verifiy") {
        const guildSettings = await getGuildSettings(interaction.guild.id);
        if (!guildSettings) {
            guildnull(interaction);
            return;
        }
        const exampleEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(language === "ko" ? "정보" : "Info")

            .addFields(
                {
                    name: language === "ko" ? "인증 상태" : "Verifiy Status",
                    value: `${guildSettings.verify}`,
                    inline: true,
                },
                {
                    name: language === "ko" ? "시간제한" : "Time limit",
                    value: `${guildSettings.verifylimit}min`,
                    inline: true,
                },
                {
                    name: language === "ko" ? "인증 유형" : "Verifiy Type",
                    value: `${guildSettings.verifytype}`,
                    inline: true,
                },
                {
                    name:
                        language === "ko" ? "자동 조치 유형" : "Verifiy Action",
                    value: `${guildSettings.verifyaction}`,
                    inline: true,
                },
                {
                    name: language === "ko" ? "역할" : "Role",
                    value: `<@&${guildSettings.verifyrole}>`,
                    inline: true,
                }
            );

        interaction.reply({ embeds: [exampleEmbed] });
    }
    if (commandoptionname === "add-ons") {
        const guildSettings = await getGuildSettings(interaction.guild.id);
        if (!guildSettings) {
            guildnull(interaction);
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

    if (commandoptionname === "verification_disable") {
        if (!checkPermissions(interaction)) {
            return;
        }
        const guildId = interaction.guildId;
        const guildSettings = await getGuildSettings(guildId);
        if (!guildSettings) {
            guildnull(interaction);
            return;
        }
        await updateGuildSettings(
            guildId,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            "off",
            null,
            null,
            null,
            null
        );
        const embed = new EmbedBuilder()
            .setColor(0x128afa)
            .setTitle(
                language === "ko"
                    ? "인증을 비활성화했습니다."
                    : "Verification has been disabled."
            );
        interaction.reply({
            embeds: [embed],
        });
    }
    if (commandoptionname === "verification_setup") {
        if (!checkPermissions(interaction)) {
            return;
        }
        const messagedefer = await interaction.deferReply();
        const guildId = interaction.guildId;
        const location = options.getChannel("verificationlocation");
        const min = options.getInteger("timelimit");
        let action = options.getString("action").toLowerCase();
        let type = options.getString("type").toLowerCase();
        let guildSettings = await getGuildSettings(guildId);
        if (!guildSettings) return guildnull(interaction);
        switch (action) {
            case "verification_kick":
                action = "Kick";
                break;
            case "verification_kick":
                action = "Ban";
                break;
        }
        switch (type) {
            case "verification_web":
                type = "Web";
                break;
            case "verification_discord":
                type = "Discord";
                break;
        }
        if (type === "Web") {
            const embeda = new EmbedBuilder()
                .setColor(0x128afa)
                .setTitle("Comming Soon!");
            await messagedefer.edit({
                embeds: [embeda],
            });
            return;
        }
        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle("Verification required")
            .setDescription(
                `To gain access to \`${interaction.guild.name}\` you need to prove you are a human by completing a captcha. Click the button below to get started!`
            );
        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel("Verify")
                .setStyle(ButtonStyle.Primary)
                .setCustomId(`verification`)
        );
        location.send({ embeds: [embed], components: [row1] });
        if (
            !guildSettings.verifyrole ||
            !interaction.guild.roles.cache.get(guildSettings.verifyrole)
        ) {
            await interaction.guild.roles
                .create({
                    name: "unverified",
                    permissions: [],
                })
                .then((createdRole) => {
                    updateGuildSettings(
                        guildId,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        createdRole.id,
                        null,
                        null
                    );
                    interaction.guild.channels.cache.forEach(
                        async (channel) => {
                            if (
                                channel.id !== location.id &&
                                channel.type !== 4
                            ) {
                                if (channel.permissionOverwrites) {
                                    channel.permissionOverwrites.edit(
                                        createdRole.id,
                                        {
                                            ViewChannel: false,
                                        }
                                    );
                                }
                            }
                        }
                    );
                });
        }
        updateGuildSettings(
            guildId,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            "on",
            min,
            null,
            action,
            type
        );
        await sleep(1000);
        guildSettings = await getGuildSettings(guildId);
        const embeda = new EmbedBuilder()
            .setColor(0x128afa)
            .setTitle("Verify")
            .addFields(
                {
                    name: language === "ko" ? "채널" : `Channel`,
                    value: `${location}`,
                    inline: true,
                },
                {
                    name: language === "ko" ? "시간 제한" : `Time limit`,
                    value: `${guildSettings.verifylimit}min`,
                    inline: true,
                    한,
                },
                {
                    name: language === "ko" ? "인증 액션" : `Action`,
                    value: `${guildSettings.verifyaction}`,
                    inline: true,
                },
                {
                    name: language === "ko" ? "인증 유형" : `Type`,
                    value: `${guildSettings.verifytype}`,
                    inline: true,
                },
                {
                    name: language === "ko" ? "인증 역할" : `Role`,
                    value: `<@&${guildSettings.verifyrole}>`,
                    inline: true,
                }
            );
        await messagedefer.edit({
            embeds: [embeda],
        });
    }

    if (commandoptionname === "setup") {
        if (!checkPermissions(interaction)) return;

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
                        name: "Muted",
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
                    const embed = new EmbedBuilder()
                        .setColor(0xff0000)
                        .setTitle(`Unbanned`)
                        .addFields({ name: "User", value: user });
                    interaction.reply({
                        embeds: [embed],
                        ephemeral: true,
                    });
                })
                .catch((error) => {
                    console.error("Error fetching user:", error);
                    const embed = new EmbedBuilder()
                        .setColor(0xff0000)
                        .setTitle(`User not found.`);
                    interaction.reply({
                        embeds: [embed],
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
                    const embed = new EmbedBuilder()
                        .setColor(0xff0000)
                        .setTitle(`User blocked`)
                        .addFields({ name: "User", value: user });
                    interaction.reply({
                        embeds: [embed],
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
                    const embed = new EmbedBuilder()
                        .setColor(0xff0000)
                        .setTitle(`User not found.`);
                    interaction.reply({
                        embeds: [embed],
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
                    const embed = new EmbedBuilder()
                        .setColor(0xff0000)
                        .setTitle(`Denyed`);
                    interaction.reply({
                        embeds: [embed],
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
                    const embed = new EmbedBuilder()
                        .setColor(0xff0000)
                        .setTitle(`User not found.`);
                    interaction.reply({
                        embeds: [embed],
                        ephemeral: true,
                    });
                });
        } else if (customId.includes("whitelist_")) {
            const userId = customId.split("_")[1];
            await addBlockedUser(interaction.guildId, userId);
            const embed = new EmbedBuilder()
                .setColor(0x128afa)
                .setTitle(`Add to whitelist`)
                .setDescription(`${user}has been added to the white list.`);
            interaction.reply({
                embeds: [embed],
            });
        } else if (customId === "verification") {
            const guildSettings = await getGuildSettings(interaction.guild.id);

            if (!interaction.member.roles.cache.has(guildSettings.verifyrole)) {
                const embed = new EmbedBuilder()

                    .setTitle(
                        language === "ko"
                            ? "이미 인증되었습니다."
                            : "You are already verified."
                    )
                    .setColor(0x128afa);
                return interaction.reply({
                    embeds: [embed],
                    ephemeral: true,
                });
            }

            const image = captchagenerat();
            const file = new AttachmentBuilder(image);
            const embed = new EmbedBuilder()
                .setTitle("Captcha")
                .setColor(0x128afa)
                .setImage(`attachment://${image}`);
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`verificationmodal_${image}`)
                    .setLabel("verification")
                    .setStyle(ButtonStyle.Primary)
            );

            interaction
                .reply({
                    embeds: [embed],
                    files: [file],
                    components: [row],
                    ephemeral: true,
                })
                .then(() => {
                    fs.unlink(image, async (err) => {
                        if (err) {
                            return console.error(
                                "Error while deleting file",
                                err
                            );
                        }
                    });
                });
        } else if (customId.startsWith("verificationmodal_")) {
            const filename = customId.split("_")[1];
            const code = filename.split(".")[0];
            const modal = new ModalBuilder()
                .setCustomId(`verificationmodalopen_${code}`)
                .setTitle("Captcha");
            const codei = new TextInputBuilder()
                .setCustomId("codeinput")
                .setLabel("Code")
                .setStyle(TextInputStyle.Short);

            const firstActionRow = new ActionRowBuilder().addComponents(codei);
            modal.addComponents(firstActionRow);
            await interaction.showModal(modal);
        } else if (customId.startsWith("verificationmodalopen_")) {
            const guildSettings = await getGuildSettings(interaction.guild.id);

            const currrentcode = customId.split("_")[1];
            const code = interaction.fields.getTextInputValue("codeinput");
            const channelID = guildSettings.logChannelId;
            const channel = client.channels.cache.get(channelID);
            if (currrentcode === code) {
                const embed = new EmbedBuilder()
                    .setColor(0x128afa)
                    .setTitle(`Verification`)
                    .setDescription(`Verification Success`);
                interaction.reply({
                    embeds: [embed],
                    ephemeral: true,
                });

                const role = guild.roles.cache.get(guildSettings.verifyrole);
                await interaction.member.roles.remove(role);
                const avatarURL = interaction.user.displayAvatarURL({
                    size: 256,
                    dynamic: true,
                });
                const embeda = new EmbedBuilder()
                    .setTitle("Captcha Success")
                    .setColor(0x0099ff)
                    .addFields(
                        {
                            name: "User",
                            value: `<@${interaction.user.id}>`,
                            inline: true,
                        },

                        {
                            name: "Type",
                            value: `${guildSettings.verifytype}`,
                            inline: true,
                        }
                    )
                    .setFooter({
                        text: `ID:${interaction.user.id}`,
                        iconURL: avatarURL,
                    });
                channel.send({ embeds: [embeda] });
            } else {
                const embed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle(`Verification`)
                    .setDescription(`Verification Failed`);
                interaction.reply({
                    embeds: [embed],
                    ephemeral: true,
                });
                const avatarURL = interaction.user.displayAvatarURL({
                    size: 256,
                    dynamic: true,
                });
                const embeda = new EmbedBuilder()
                    .setTitle("Captcha Fail")
                    .setColor(0xff0000)
                    .addFields(
                        {
                            name: "User",
                            value: `<@${interaction.user.id}>`,
                            inline: true,
                        },
                        {
                            name: "Reason",
                            value: `The captcha code does not match.`,
                            inline: true,
                        }
                    )
                    .setFooter({
                        text: `ID:${interaction.user.id}`,
                        iconURL: avatarURL,
                    });
                channel.send({ embeds: [embeda] });
            }
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
    if (oldMessage === newMessage) return;
    if (oldMessage == newMessage) return;

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
    if (member.user.bot) return;

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
    if (!guildSettings.verify === null || guildSettings.verify !== "off") {
        const guild = await client.guilds.fetch(member.guild.id);
        const rolemember = await guild.members.fetch(member.id);
        const role = guild.roles.cache.get(guildSettings.verifyrole);
        if (role) {
            await rolemember.roles.add(role).then(async () => {
                const avatarURL = member.user.displayAvatarURL({
                    size: 256,
                    dynamic: true,
                });
                const embed = new EmbedBuilder()
                    .setTitle("Captcha Sent")
                    .setColor(0x0099ff)
                    .addFields(
                        {
                            name: "User",
                            value: `<@${member.user.id}>`,
                            inline: true,
                        },
                        {
                            name: "Type",
                            value: `${guildSettings.verifytype}`,
                            inline: true,
                        }
                    )
                    .setFooter({
                        text: `ID:${member.user.id}`,
                        iconURL: avatarURL,
                    });
                channel.send({ embeds: [embed] });
            });
        }
    }
    setTimeout(async () => {
        const guild = await client.guilds.fetch(member.guild.id);
        const rolemember = await guild.members.fetch(member.id);

        if (!rolemember) {
            return;
        }

        // 특정 역할을 확인합니다.
        const role = guild.roles.cache.get(guildSettings.verifyrole);

        if (!role) return;

        // 특정 역할을 가지고 있는지 확인합니다.
        if (rolemember.roles.cache.has(role.id)) {
            if (guildSettings.verifyaction === "Kick") {
                await rolemember.kick();
            } else if (guildSettings.verifyaction === "Ban") {
                await rolemember.ban();
            }
            const avatarURL = member.user.displayAvatarURL({
                size: 256,
                dynamic: true,
            });
            const embed = new EmbedBuilder()
                .setTitle("Time limit reached")
                .setColor(0xeb0000)
                .addFields(
                    { name: "User", value: `<@${member.user.id}>` },
                    { name: "Action", value: `${guildSettings.verifyaction}` }
                )
                .setFooter({
                    text: `ID:${member.user.id}`,
                    iconURL: avatarURL,
                });
            channel.send({ embeds: [embed] });
        }
    }, guildSettings.verifylimit * 60 * 1000); // 분을 밀리초로 변환합니다.
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
    try {
        channel.send({ embeds: [errorEmbed] });
    } catch {
        console.log(err);
    }
});
const spamUsers = new Map();
const SPAM_INTERVAL = 2000;
const SPAM_THRESHOLD = 5;
const MUTE_DURATION = 300_000;

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    if (!message.guild) return;
    const guildSettings = await getGuildSettings(message.member.guild.id);
    if (!guildSettings) {
        return;
    }

    const channelID = guildSettings.logChannelId;
    const channel = client.channels.cache.get(channelID);
    if (guildSettings.Link === "scan") {
        if (!linkc(message.content)) return;
        if (!checkLinkSafety(findLinks(message.content))) {
            message.delete();
            const embed = new EmbedBuilder()
                .setTitle("Phishing link detected")
                .setColor(0x128afa)
                .addFields(
                    { name: "User", value: `${message.member}` },
                    {
                        name: "Time",
                        value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
                    },
                    { name: "Channel", value: `${message.channel}` },
                    { name: "Content", value: `\`\`\`${message.content}\`\`\`` }
                )
                .setFooter({ text: "Powerd By Google Safe Browsing API" });
            await channel.send({ embeds: [embed] });
        }
    }
    if (guildSettings.Link === "discord") {
        if (
            message.content.includes("discord.gg/") ||
            message.content.includes("discord.com/invite/")
        ) {
            if (message.content.length >= 1000) {
                const embed = createEmbedWithLinks(message);
                if (embed) {
                    await channel.send({ embeds: [embed] });
                    message.delete();
                    return;
                }
            }
            const embed = new EmbedBuilder()
                .setColor(0x128afa)
                .setTitle(`Link posting has been blocked`)
                .addFields(
                    { name: "User", value: `${message.member}` },
                    {
                        name: "Time",
                        value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
                    },
                    { name: "Channel", value: `${message.channel}` },
                    { name: "Content", value: `\`\`\`${message.content}\`\`\`` }
                )
                .setTimestamp();

            await channel.send({ embeds: [embed] });
            message.delete();

            return;
        }
    } else if (guildSettings.Link === "all") {
        if (
            linkc(message.content) ||
            message.content.includes("discord.gg/") ||
            message.content.includes("discord.com/invite/")
        ) {
            if (message.content.length >= 1000) {
                const embed = createEmbedWithLinks(message);
                if (embed) {
                    await channel.send({ embeds: [embed] });
                    message.delete();
                    return;
                }
            }
            const embed = new EmbedBuilder()
                .setColor(0x128afa)
                .setTitle(`Link posting has been blocked`)
                .addFields(
                    { name: "User", value: `${message.member}` },
                    {
                        name: "Time",
                        value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
                    },
                    { name: "Channel", value: `${message.channel}` },
                    { name: "Content", value: `\`\`\`${message.content}\`\`\`` }
                );
            await channel.send({ embeds: [embed] });
            message.delete();

            return;
        }
    }
    if (guildSettings.spamming === "on") {
        const userId = message.author.id;

        // 사용자의 도배 상태 확인
        if (spamUsers.has(userId)) {
            const userData = spamUsers.get(userId);

            // 이전 도배 메시지와 현재 메시지의 간격 확인
            const timeDiff =
                message.createdTimestamp - userData.lastMessageTimestamp;

            if (timeDiff < SPAM_INTERVAL) {
                // 도배로 판단되면 카운트 증가
                userData.spamCount++;
            } else {
                // 일정 시간이 지나면 카운트 초기화
                userData.spamCount = 1;
            }

            if (userData.spamCount >= SPAM_THRESHOLD) {
                spamUsers.set(userId, {
                    spamCount: 1,
                    lastMessageTimestamp: message.createdTimestamp,
                });
                message.guild.members.fetch(userId).then((user) => {
                    user.timeout(MUTE_DURATION, "Spamming")
                        .then(() => {
                            const embed = new EmbedBuilder()
                                .setColor(0x128afa)
                                .setTitle(
                                    `Chat will be blocked for a certain period of time due to spamming.`
                                );
                            message.channel.send({
                                content: `${message.author}`,
                                embeds: [embed],
                            });
                        })
                        .catch(console.error);
                });

                const channelID = guildSettings.logChannelId;
                const channel = client.channels.cache.get(channelID);
                const embed = new EmbedBuilder()
                    .setColor(0x128afa)
                    .setTitle(`Spamming has been blocked`)
                    .addFields(
                        { name: "User", value: `${message.member}` },
                        {
                            name: "Time",
                            value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
                        },
                        { name: "Channel", value: `${message.channel}` }
                    );
                await channel.send({ embeds: [embed] });
            }
        } else {
            // 사용자의 도배 상태가 없으면 초기화
            spamUsers.set(userId, {
                spamCount: 1,
                lastMessageTimestamp: message.createdTimestamp,
            });
        }
    }
});

client
    .login(token)
    .catch((error) => {
        errorlog("Login fail ", error.message);
    })
    .then(() => {
        const endTime = moment();
        const loginTime = moment.duration(endTime.diff(startTime)).asSeconds();
        infochannel(`Login successful. Took ${loginTime} seconds.`);
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
            const language = interaction.locale;
            const embed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle(
                    language === "ko"
                        ? "이 명령어를 실행할 권한이 부족합니다"
                        : "You don't have permission."
                );
            interaction.reply({
                embeds: [embed],
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
        const language = interaction.locale;
        const embed = new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle(
                language === "ko"
                    ? "이 명령어를 실행할 권한이 부족합니다"
                    : "You don't have permission."
            );
        interaction.reply({
            embeds: [embed],
            ephemeral: true,
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
    verify: String,
    verifylimit: Number,
    verifyrole: String,
    verifyaction: String,
    verifytype: String,
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
 * @param {string} verify: String,
 * @param {number} verifylimit: Number,
 * @param {string} verifyrole: String,
 * @param {string} verifyaction: String,
 * @param {string} verifytype: String,
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
    deleteH,
    verify,
    verifylimit,
    verifyrole,
    verifyaction,
    verifytype
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
        verify: verify ?? (previousSettings ? previousSettings.verify : null),
        verifylimit:
            verifylimit ??
            (previousSettings ? previousSettings.verifylimit : null),
        verifyrole:
            verifyrole ??
            (previousSettings ? previousSettings.verifyrole : null),
        verifyaction:
            verifyaction ??
            (previousSettings ? previousSettings.verifyaction : null),
        verifytype:
            verifytype ??
            (previousSettings ? previousSettings.verifytype : null),
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
async function guildnull(interaction) {
    const language = interaction.locale;
    const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle(`Server settings not found`)
        .setDescription(
            language === "ko"
                ? "서버 설정을 찾을 수 없습니다. 먼저 로그 채널을 설정하십시오.\n</management setup:1224629739877306430>"
                : "Server settings not found. Please set up the log channel first.\n</management setup:1224629739877306430>"
        );
    await interaction.reply({ embeds: [embed] });
}

async function guildnull1(interaction) {
    const language = interaction.locale;
    const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle(`Server settings not found`)
        .setDescription(
            language === "ko"
                ? "서버 설정을 찾을 수 없습니다. 먼저 로그 채널을 설정하십시오.\n</management verification_setup:1224629739877306430>"
                : "Server settings not found. Please set up the log channel first.\n</management verification_setup:1224629739877306430>"
        );
    await interaction.reply({
        embeds: [embed],
    });
}
function getSurroundingText(content, position, length) {
    const start = Math.max(position - 5, 0);
    const end = Math.min(position + length + 5, content.length);
    return content.substring(start, end);
}
function createEmbedWithLinks(message) {
    const content = message.content;
    const links = findLinks(content);
    if (!links) return;

    const embed = new EmbedBuilder()
        .setColor(0x128afa)
        .setTitle(`Link posting has been blocked`)
        .addFields(
            { name: "User", value: `${message.member}` },
            {
                name: "Time",
                value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
            }, //
            { name: "Channel", value: `${message.channel}` }
        );
    links.forEach((link) => {
        embed.addFields({
            name: "Content",
            value: `\`\`\`${link}\`\`\``,
        });
    });
    embed.setTimestamp();
    return embed;
}
function findLinks(text) {
    const regex = /https?:\/\/\S+/gi;
    return text.match(regex);
}

async function checkLinkSafety(urlToCheck) {
    try {
        const response = await fetch(
            `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${SafeBrowsingAPI_Key}`,
            {
                method: "POST",
                body: JSON.stringify({
                    client: {
                        clientId: "teamspamblocker",
                        clientVersion: "1.0.0",
                    },
                    threatInfo: {
                        threatTypes: [
                            "MALWARE",
                            "SOCIAL_ENGINEERING",
                            "UNWANTED_SOFTWARE",
                            "POTENTIALLY_HARMFUL_APPLICATION",
                        ],
                        platformTypes: ["ANY_PLATFORM"],
                        threatEntryTypes: ["URL"],
                        threatEntries: [{ url: urlToCheck }],
                    },
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        const data = await response.json();
        if (data.matches && data.matches.length > 0) {
            console.log("Unsafe link detected:", data.matches);
            return false;
        } else {
            return true;
        }
    } catch (error) {
        return false;
    }
}
function captchagenerat() {
    const options = { height: 200, width: 600 };
    const text = generateRandomString(6);
    const captcha = new CaptchaGenerator(options)
        .setDimension(150, 450)
        .setCaptcha({ text: text, size: 60, color: "deeppink" })
        .setDecoy({ opacity: 0.5 })
        .setTrace({ color: "deeppink" });
    const buffer = captcha.generateSync();
    fs.writeFileSync(`${text}.png`, buffer);
    return `${text}.png`;
}
function generateRandomString(length) {
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * characters.length)
        );
    }
    return result;
}
