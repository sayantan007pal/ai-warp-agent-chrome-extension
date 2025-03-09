
# Warp Browser Extension
<img width="1352" alt="Screenshot 2025-03-10 at 1 14 18 AM" src="https://github.com/user-attachments/assets/c3cee0d5-47aa-4e35-83ca-d475a3479f3b" />
 

A context-aware browser extension that uses the Warp API to provide intelligent assistance based on webpage content. The extension extracts context from webpages, allows users to interact with AI agents, and provides task automation capabilities.

## Features

- **Context Extraction**: Analyzes webpage content and captures user selections
- **Agent Interaction**: Communicates with Warp API to provide intelligent responses
- **Task Automation**: Creates and executes automated tasks based on triggers
- **Domain-Specific Adaptations**: Provides specialized handlers for common websites
- **User Interface**: Popup interface and sidebar for extended interactions

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Chrome browser (v88 or higher)

### Setup and Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/warp-browser-extension.git
   cd warp-browser-extension
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure your Warp API key:
   - Open `background.js`
   - Replace `YOUR_WARP_API_KEY` with your actual Warp API key


4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in the top-right corner)
   - Click "Load unpacked" and select the `dist` directory from your project

## Development

### Project Structure

```
warp-browser-extension/
├── background.js       # Service worker for the extension
├── content.js          # Content script injected into webpages
├── popup.html          # Popup UI HTML
├── popup.js            # Popup UI logic
├── sidebar.html        # Sidebar UI HTML
├── sidebar.js          # Sidebar UI logic
├── images/             # Extension icons
├── utils/              # Helper utilities
└── manifest.json       # Extension manifest
```



### Popup Interface

1. Click the extension icon in your browser toolbar
2. Select an agent from the dropdown
3. Type your query about the current page
4. View the agent's response in the popup window

### Context Menu

1. Select text on any webpage
2. Right-click the selection
3. Choose "Ask Warp about this" from the context menu
4. The popup will open with your selection as context

### Sidebar Interface

1. Click the sidebar toggle button that appears on the right side of the page
2. Use quick actions like "Summarize Page" or "Extract Key Points"
3. View and run your saved automation tasks
4. Create new automation tasks

### Task Automation

1. Open the sidebar
2. Scroll to the "Create New Task" section
3. Enter a name for your task
4. Select a trigger type (manual, pageLoad, scheduled)
5. Enter the action (query to be executed)
6. Click "Create Task"

## Extending Functionality

### Adding Domain-Specific Handlers

To add support for a new website domain:

1. Open `background.js`
2. Add a new entry to the `domainHandlers` object:
   ```javascript
   'example.com': {
     extractContext: async (tab) => {
       const baseContext = await ContextExtractor.extractFromPage(tab);
       
       // Add domain-specific extraction logic
       const customData = await chrome.scripting.executeScript({
         target: { tabId: tab.id },
         function: () => {
           // Custom extraction code here
           return { customField: 'custom value' };
         }
       });
       
       return {
         ...baseContext,
         customData: customData[0].result
       };
     }
   }
   ```

## Testing Strategy

The extension is tested at multiple levels:

1. **Unit Testing**: Tests individual components like ContextExtractor, AgentManager, and TaskAutomation
2. **Integration Testing**: Tests communication between components
3. **End-to-End Testing**: Tests full extension functionality on various websites

## License

MIT
