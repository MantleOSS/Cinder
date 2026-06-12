<h1 align="center">🔥 Cinder</h1>

<p align="center">
  <strong>by Mantle</strong>
</p>

<p align="center">
  <em>Your personal cinematic universe — stream movies & TV shows for free, beautifully and semi-locally.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/License-AGPL--3.0-orange?style=for-the-badge" alt="License: AGPL-3.0" />
  <img src="https://img.shields.io/badge/Runtime-Bun-f9f?style=for-the-badge" alt="Bun" />
  <img src="https://img.shields.io/badge/Framework-Next.js%2016-black?style=for-the-badge" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/Language-TypeScript-3178c6?style=for-the-badge" alt="TypeScript" />
</p>

---

## ✨ Features

- 🎬 **Browse Movies & TV Shows** — Discover trending, top-rated, and upcoming content
- 📺 **Stream for free** — One-click streaming with a powerful embedded player
- 📋 **Watchlist** — Save movies and shows to watch later
- 📊 **Watch Progress Tracking** — Pick up right where you left off
- 🌑 **Beautiful Dark Cinematic UI** — Ember & amber themed, designed for the living room
- 🔍 **TMDB-Powered Content** — Rich metadata, posters, ratings, and search
- 🎨 **Ember/Amber Theme** — A warm, cinematic aesthetic that feels right at home

---

## 🚀 Quick Start

Get up and running in three easy steps:

### 1️⃣ Clone or Download

```bash
git clone https://github.com/MantleOSS/Cinder.git
cd Cinder
```

### 2️⃣ Run the Setup Script

The setup script will guide you through everything — including your TMDB API key.

**Mac / Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

**Windows:**
```bat
setup.bat
```

### 3️⃣ Enjoy 🍿

Open [http://localhost:3000](http://localhost:3000) and start streaming!

---

## 🔑 Getting a TMDB API Key

Cinder uses [The Movie Database (TMDB)](https://www.themoviedb.org/) for all movie and TV show metadata. You'll need a free API key to use the app. Here's how to get one:

1. **Go to** [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
2. **Create a free account** — Sign up with your email or log in if you already have one
3. **Request an API key** — Click "Request an API Key" and choose **"Developer"**
4. **Fill in the details** — You can put "Cinder" as the app name and "Personal use" as the description
5. **Copy the API Key (v3 auth)** — Once approved (usually instant), copy the **API Key (v3 auth)** value
6. **Enter it when prompted** — The setup script will ask for it, or add it manually to `.env.local`

> 💡 The API key is completely free and approval is typically instant. TMDB only requires it so they can track usage and prevent abuse.

---

## 🔧 Manual Setup

Prefer to do things by hand? No problem.

### Prerequisites

- [Bun](https://bun.sh/) installed on your system

### Steps

```bash
# 1. Install Bun (if you haven't already)
curl -fsSL https://bun.sh/install | bash

# 2. Clone the repository
git clone https://github.com/mantle/cinder.git
cd cinder

# 3. Create your environment file
echo "TMDB_API_KEY=your_api_key_here" > .env.local

# 4. Install dependencies
bun install

# 5. Start the development server
bun run dev
```

---

## 🔄 Updating

Stay up to date with the latest features and fixes:

**Mac / Linux:**
```bash
chmod +x update.sh
./update.sh
```

**Windows:**
```bat
update.bat
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| [Next.js 16](https://nextjs.org/) | React framework with App Router |
| [React 19](https://react.dev/) | UI library |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling |
| [Framer Motion](https://www.framer.com/motion/) | Smooth animations |
| [Zustand](https://zustand-demo.pmnd.rs/) | Lightweight state management |
| [TanStack Query](https://tanstack.com/query/) | Data fetching & caching |

---

## ⚠️ Important Notes

- 🏠 **Local use only** — The middleware enforces that Cinder only responds to `localhost` requests. It is not designed to be hosted publicly.
- 🔑 **You need a TMDB account** — It's free and takes seconds to set up.
- 📡 **Content availability** — Streaming availability depends on Vidking's sources. Not every title may be available at all times.

---

## 📄 License

Cinder is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

| What it means | Detail |
|---|---|
| ✅ **Free to use** | Use Cinder personally however you like |
| ✅ **Open source** | All source code is available and modifiable |
| 🔄 **Copyleft** | Any modifications must also be open-sourced under AGPL-3.0 |
| 🌐 **Network copyleft** | Even hosting as a network service requires sharing your source code if you've modified it |
| 🚫 **No warranty** | Provided as-is, with no liability |

See the [LICENSE](./LICENSE) file for the full license text.

---

## 🛡️ Disclaimer

**Cinder does not host any content.** All streaming is provided by third-party sources. The developers of Cinder are not responsible for the content available through these sources. Use Cinder responsibly and in accordance with your local laws and regulations.

---

<p align="center">
  Made with 🔥 by <strong>Mantle</strong>
</p>
