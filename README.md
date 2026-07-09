<p align="center">
  <a href="https://github.com/DenverCoder1/readme-typing-svg"><img src="https://readme-typing-svg.herokuapp.com/?lines=New+Extension+is+here.;Making+Your+Youtube+Simplier.;Stay+Tuned+for+more.&font=Fira+Code&center=true&width=440&height=45&color=f75c7e&vCenter=true&size=22"></a>
</p> 

# YouTube Tweak 🚀
#### version 1.0.0

A lightweight Chrome extension designed to declutter the YouTube user interface, restore sanity to your timeline, and eliminate addictive UI patterns. Built for developers and power users who value their time and focus.

## ✨ Features

### 🟢 Available Now

- **Feed Filtering:** Filter the Subscriptions page to show either Videos or Shorts.
- **Intentional Browsing:** Replace infinite scrolling with a Load More button to minimize distractions and encourage intentional browsing.
- **Absolute Timestamps:** Display the exact publication date instead of relative timestamps (e.g., "2 days ago").
- **Customization:** Choose your preferred date format.

### 🟡 Coming Soon

- **Granular Control:** Choose which pages should use the Load More button.
- **Content Filtering:** Hide videos based on keywords in their titles.

### 🔵 Planned

- **Smart Grouping:** Group videos on the Subscriptions page by publication date, with each day's uploads displayed in a separate section.

## 🛠️ Tech Stack

- **Framework:** [Plasmo](https://www.plasmo.com/) (The Browser Extension Framework)
- **Core:** TypeScript / React
- **Platform:** Chrome Extensions API (Manifest V3)
- **Storage:** [@plasmohq/storage](https://docs.plasmo.com/framework/storage)
- **Styling & DOM:** SASS / Native DOM Utilities

## 📦 Installation (Local/Developer Mode)

If you want to run or test this project locally from the source code:

1. Clone this repository to your local machine:

   ```bash
   git clone https://github.com/YOUR_USERNAME/youtube-tweak.git
   cd youtube-tweak
   ```

2. Install dependencies with [pnpm](https://pnpm.io/):

   ```bash
   pnpm install
   ```

3. Start the development build:

   ```bash
   pnpm dev
   ```

4. Load the extension into Chrome:
   - Open `chrome://extensions`
   - Enable **Developer mode** (top right)
   - Click **Load unpacked** and select the generated `build/chrome-mv3-dev` folder

## 🚀 Scripts

| Command        | Description                                           |
| -------------- | ----------------------------------------------------- |
| `pnpm dev`     | Run the extension in development mode with hot reload |
| `pnpm build`   | Create a production build                             |
| `pnpm package` | Package the production build into a distributable zip |
