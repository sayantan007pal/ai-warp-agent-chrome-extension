// Initialize extension when installed
chrome.runtime.onInstalled.addListener(() => {
    console.log('AI Agent Assistant installed');
    
    // Set default settings
    chrome.storage.sync.set({
      'apiKey': '',
      'activeAgents': ['general', 'research'],
      'privacyLevel': 'medium',
      'uiPosition': 'right',
      'defaultPrompt': 'Analyze this page and provide insights'
    });
    
    // Create context menu items
    chrome.contextMenus.create({
      id: 'analyzeText',
      title: 'Analyze with AI Agent',
      contexts: ['selection']
    });
    
    chrome.contextMenus.create({
      id: 'summarizePage',
      title: 'Summarize this page',
      contexts: ['page']
    });
  });
  
  // Handle context menu clicks
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'analyzeText' && info.selectionText) {
      analyzeWithAgent(info.selectionText, tab.id);
    } else if (info.menuItemId === 'summarizePage') {
      sendMessageToContentScript(tab.id, {
        action: 'summarizePage'
      });
    }
  });
  
  // Handle messages from content script or popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'queryAgent') {
      // Handle API call to Warps
      queryWarpsAPI(request.prompt, request.context, request.agent)
        .then(response => {
          sendResponse({success: true, data: response});
        })
        .catch(error => {
          sendResponse({success: false, error: error.message});
        });
      return true; // Required for async sendResponse
    } else if (request.action === 'toggleSidebar') {
      sendMessageToContentScript(sender.tab.id, {
        action: 'toggleSidebar'
      });
    } else if (request.action === 'saveSettings') {
      chrome.storage.sync.set(request.settings, () => {
        sendResponse({success: true});
      });
      return true;
    } else if (request.action === 'getSettings') {
      chrome.storage.sync.get(null, (settings) => {
        sendResponse({success: true, settings});
      });
      return true;
    }
  });
  
  // Helper functions
  function sendMessageToContentScript(tabId, message) {
    chrome.tabs.sendMessage(tabId, message);
  }
  
  async function analyzeWithAgent(text, tabId) {
    try {
      const settings = await chrome.storage.sync.get(['apiKey', 'activeAgents']);
      if (!settings.apiKey) {
        sendMessageToContentScript(tabId, {
          action: 'showNotification',
          data: {
            type: 'error',
            message: 'API key not set. Please configure in extension settings.'
          }
        });
        return;
      }
      
      sendMessageToContentScript(tabId, {
        action: 'showLoader'
      });
      
      const agent = settings.activeAgents[0] || 'general';
      const response = await queryWarpsAPI(
        'Analyze the following text: ', 
        text, 
        agent
      );
      
      sendMessageToContentScript(tabId, {
        action: 'displayResult',
        data: {
          query: text,
          response: response,
          agent: agent
        }
      });
    } catch (error) {
      sendMessageToContentScript(tabId, {
        action: 'showNotification',
        data: {
          type: 'error',
          message: 'Error analyzing text: ' + error.message
        }
      });
    }
  }
  
  async function queryWarpsAPI(prompt, context, agent) {
    try {
      const settings = await chrome.storage.sync.get(['apiKey']);
      
      const response = await fetch('https://api.warps-api.example.com/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`
        },
        body: JSON.stringify({
          prompt: prompt,
          context: context,
          agent: agent,
          options: {
            temperature: 0.7,
            max_tokens: 1000
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API request failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Warps API error:', error);
      throw error;
    }
  }