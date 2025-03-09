// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const analyzePageBtn = document.getElementById('analyzePage');
    const toggleSidebarBtn = document.getElementById('toggleSidebar');
    const askQuestionBtn = document.getElementById('askQuestion');
    const saveSettingsBtn = document.getElementById('saveSettings');
    const apiKeyInput = document.getElementById('apiKey');
    const primaryAgentSelect = document.getElementById('primaryAgent');
    const uiPositionSelect = document.getElementById('uiPosition');
    const privacyLevelSelect = document.getElementById('privacyLevel');
    const autoSummarizeCheckbox = document.getElementById('autoSummarize');
    const statusDiv = document.getElementById('status');
    
    // Load saved settings
    loadSettings();
    
    // Analyze current page
    analyzePageBtn.addEventListener('click', function() {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'summarizePage'});
        window.close();
      });
    });
    
    // Toggle sidebar
    toggleSidebarBtn.addEventListener('click', function() {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'toggleSidebar'});
        window.close();
      });
    });
    
    // Ask AI Agent a question
    askQuestionBtn.addEventListener('click', function() {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'toggleSidebar'});
        window.close();
      });
    });
    
    // Save settings
    saveSettingsBtn.addEventListener('click', function() {
      const settings = {
        apiKey: apiKeyInput.value,
        activeAgents: [primaryAgentSelect.value, 'general'],
        uiPosition: uiPositionSelect.value,
        privacyLevel: privacyLevelSelect.value,
        autoSummarize: autoSummarizeCheckbox.checked
      };
      
      chrome.runtime.sendMessage({
        action: 'saveSettings',
        settings: settings
      }, function(response) {
        if (response.success) {
          showStatus('Settings saved successfully!', 'success');
        } else {
          showStatus('Failed to save settings', 'error');
        }
      });
    });
    
    // Load saved settings from storage
    function loadSettings() {
      chrome.runtime.sendMessage({
        action: 'getSettings'
      }, function(response) {
        if (response.success) {
          const settings = response.settings;
          
          if (settings.apiKey) {
            apiKeyInput.value = settings.apiKey;
          }
          
          if (settings.activeAgents && settings.activeAgents.length > 0) {
            primaryAgentSelect.value = settings.activeAgents[0];
          }
          
          if (settings.uiPosition) {
            uiPositionSelect.value = settings.uiPosition;
          }
          
          if (settings.privacyLevel) {
            privacyLevelSelect.value = settings.privacyLevel;
          }
          
          if (settings.autoSummarize !== undefined) {
            autoSummarizeCheckbox.checked = settings.autoSummarize;
          }
        }
      });
    }
    
    // Show status message
    function showStatus(message, type) {
      statusDiv.textContent = message;
      statusDiv.className = `status ${type}`;
      statusDiv.style.display = 'block';
      
      // Hide after 3 seconds
      setTimeout(function() {
        statusDiv.style.display = 'none';
      }, 3000);
    }
  });