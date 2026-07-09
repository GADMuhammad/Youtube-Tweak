# Privacy Policy for YouTube Tweak

**Last Updated:** July 2026

## 1. Introduction
Thank you for using **YouTube Tweak**. Your privacy is of utmost importance to us. This Privacy Policy explains how the extension operates and outlines our strict commitment to data protection. Because this extension is designed to run entirely locally on your device, we do not collect your personal information.

## 2. Information Collection and Use
- **No Personal Data Collection:** YouTube Tweak does not collect, capture, store, or transmit any personally identifiable information, browsing history, user credentials, or analytical data.
- **Local Data Storage:** The extension utilizes the browser's local storage API (`chrome.storage`) solely to save your UI configuration preferences (such as toggling feature options or saving your preferred date format). This data remains strictly on your local machine and is never synced or uploaded to external servers.
- **No Third-Party Analytics:** We do not integrate any tracking scripts, advertisements, or third-party analytical tools. 

## 3. Remote Code Execution
In compliance with Google Chrome Web Store policies (Manifest V3), YouTube Tweak contains **no remote code**. All scripts, stylesheets, and logic required for the extension to function are bundled locally within the extension package. No code is fetched or executed from remote servers.

## 4. Permissions Breakdown
To perform its core functionalities, the extension requires the following permissions:
- `storage`: Necessary to persist user-selected UI settings across browser sessions.
- `host permissions` (`*://*.youtube.com/*`): Necessary to inject content scripts into YouTube to alter layout elements (such as blocking infinite scroll) and reformat relative timestamps into absolute dates.

## 5. Changes to This Privacy Policy
We may update our Privacy Policy from time to time to reflect changes in the extension's features or store regulations. Any changes will be updated directly in this file.

## 6. Contact Us
If you have any questions or feedback regarding this Privacy Policy or the extension's codebase, feel free to open an issue or reach out through this GitHub repository.
