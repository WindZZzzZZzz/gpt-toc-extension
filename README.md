# ChatGPT Table of Contents Extension

A Chrome extension that automatically generates and displays a table of contents for ChatGPT conversations in a convenient right sidebar.

## Features

- **Automatic TOC Generation**: Automatically detects headings (H1-H6) in ChatGPT responses
- **Smart Navigation**: Click any TOC item to jump directly to that section
- **Real-time Updates**: TOC updates automatically as new content is generated
- **Visual Feedback**: Highlights the target section when navigating
- **Operation Friendly**: Allow users to collapse sections in TOC

## Installation

### Method 1: Load as Unpacked Extension (Recommended for Development)

1. **Download or Clone** this repository to your local machine
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer Mode** by toggling the switch in the top-right corner
4. **Click "Load unpacked"** and select the folder containing this extension
5. **Navigate to ChatGPT** at `https://chat.openai.com/`
6. **Look for the "📋 TOC" button** in the top-right corner of the page

### Method 2: Install from Chrome Web Store (When Available)

- **Navigate to [Chrome Web Store](https://chromewebstore.google.com/detail/jjpmfdjghngpncajeffgdpfcedlpkdmg?utm_source=item-share-cb)**
- **Install the Extension** by clicking "Add to Chrome" button
- **Navigate to ChatGPT** at `https://chat.openai.com/`
- **Look for the "📋 TOC" button** in the top-right corner of the page

## Usage

1. **Open ChatGPT** and start a conversation
2. **Wait for the response** to be generated
3. **Click the "📋 TOC" button** in the top-right corner to open the sidebar
4. **Browse the table of contents** - headings are automatically detected and organized
5. **Click any TOC item** to jump to that section in the conversation
6. **Close the sidebar** by clicking the "×" button or the toggle button again

## How It Works

The extension:

1. **Monitors the page** for new content using MutationObserver
2. **Scans for headings** in ChatGPT assistant responses using multiple selectors
3. **Filters content** to only include headings from assistant messages
4. **Organizes headings** by their hierarchy (H1-H6) with proper indentation
5. **Provides navigation** with smooth scrolling and visual highlighting

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions:
1. Open an issue on GitHub
2. Check the browser console for error messages