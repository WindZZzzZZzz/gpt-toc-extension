# ChatGPT Table of Contents Extension

A Chrome extension that automatically generates and displays a table of contents for ChatGPT conversations in a convenient right sidebar.

## Features

- 🎯 **Automatic TOC Generation**: Automatically detects headings (H1-H6) in ChatGPT responses
- 📍 **Smart Navigation**: Click any TOC item to jump directly to that section
- 🎨 **Modern UI**: Clean, responsive design that works in both light and dark modes
- ⚡ **Real-time Updates**: TOC updates automatically as new content is generated
- 🔍 **Visual Feedback**: Highlights the target section when navigating
- 📱 **Mobile Friendly**: Responsive design that works on different screen sizes

## Installation

### Method 1: Load as Unpacked Extension (Recommended for Development)

1. **Download or Clone** this repository to your local machine
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer Mode** by toggling the switch in the top-right corner
4. **Click "Load unpacked"** and select the folder containing this extension
5. **Navigate to ChatGPT** at `https://chat.openai.com/`
6. **Look for the "📋 TOC" button** in the top-right corner of the page

### Method 2: Install from Chrome Web Store (When Available)

*Coming soon - the extension will be available on the Chrome Web Store*

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

## File Structure

```
gpt-toc/
├── manifest.json          # Extension configuration
├── content.js            # Main extension logic
├── styles.css            # Styling for sidebar and UI
├── README.md             # This file
└── icons/                # Extension icons
    ├── icon16.png        # 16x16 icon
    ├── icon48.png        # 48x48 icon
    └── icon128.png       # 128x128 icon
```

## Customization

### Styling
You can customize the appearance by modifying `styles.css`:
- Change colors in the CSS variables
- Adjust sidebar width and positioning
- Modify animations and transitions

### Functionality
You can extend the functionality by modifying `content.js`:
- Add support for different heading detection patterns
- Implement additional navigation features
- Add keyboard shortcuts

## Troubleshooting

### Extension Not Working?
1. **Check if it's enabled** in `chrome://extensions/`
2. **Refresh the ChatGPT page** after installing
3. **Check the console** for any error messages
4. **Ensure you're on the correct domain** (`https://chat.openai.com/`)

### TOC Not Updating?
1. **Wait for the response to complete** - the extension waits for content to finish loading
2. **Check if headings exist** - the extension only shows content with actual headings
3. **Try refreshing the page** if the conversation is very long

### Sidebar Not Visible?
1. **Click the "📋 TOC" button** in the top-right corner
2. **Check if the button is visible** - it should appear on ChatGPT pages
3. **Try scrolling** - the button might be hidden behind other elements

## Development

### Prerequisites
- Basic knowledge of JavaScript, HTML, and CSS
- Chrome browser for testing

### Local Development
1. **Make changes** to the source files
2. **Go to `chrome://extensions/`**
3. **Click the refresh icon** on your extension
4. **Test on ChatGPT**

### Building for Production
1. **Replace placeholder icons** with actual PNG files
2. **Update version number** in `manifest.json`
3. **Test thoroughly** on different ChatGPT pages
4. **Package for Chrome Web Store** (when ready)

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Open an issue on GitHub
3. Check the browser console for error messages

---

**Note**: This extension is not affiliated with OpenAI or ChatGPT. It's an independent tool designed to enhance the user experience on the ChatGPT platform. 