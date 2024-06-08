# 🚫 Discord Spam Blocker Bot

![License](https://img.shields.io/github/license/aleu0091/discord-spam-blocker-bot-public) ![Stars](https://img.shields.io/github/stars/aleu0091/discord-spam-blocker-bot-public)

Welcome to **Discord Spam Blocker Bot** - a powerful bot designed to keep your Discord server free from spam. Updates are released slowly.

## 📋 Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Support](#support)
- [Contributing](#contributing)
- [License](#license)

## 🚀 Features

- Automatic spam detection and blocking
- Customizable spam filters
- Real-time alerts for spam activity
- User-friendly commands

## 💻 Installation

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js v16.6.0 or higher
- npm (Node Package Manager)

### Clone the repository

```sh
git clone https://github.com/yourusername/discord-spam-blocker-bot-public.git
cd discord-spam-blocker-bot-public
```

### Install dependencies

```sh
npm install
```

### Setting up configuration

Create a `config.json` file in the root directory and add your bot token and other necessary configuration:

```json
{
    "mongodb": "your_mongodb_url",
    "token": "your_bot_token",
    "clientid": "your_client_id",
    "botId": "your_bot_id",
    "errorchannelid": "your_errorlogchannel_id",
    "logchannelid": "your_logchannel_id",
    "version": "1.0.0",
    "adminsid": [
        "admin1_Id",
        "admin2_Id",
        "admin3_Id"
    ],
    "githubtoken": "your_github_token",
    "repository": "TeamSPAM/Discord_Spam_Bot",
    "branch": "main",
    "debugmode": false,
    "SafeBrowsingAPI_Key": "your_SafeBrowsingAPI_key",
    "since": "2024/01/05",
}

```

## 🛠 Usage

To start the bot, simply run:

```sh
node index.js
```

Your bot should now be online and running!

## 🌐 Invite & Support

- **Invite the bot to your server:** [Invite Link](https://discord.com/api/oauth2/authorize?client_id=1195649127489478676&permissions=8&scope=bot)
- **Join our support server:** [Support Server](https://discord.gg/HwyX7rxjKE)
- **Korea Discord List:** [Korean Bots](https://koreanbots.dev/bots/1195649127489478676)

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

