document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const contentArea = document.getElementById('contentArea');
    const messagesContainer = document.getElementById('messagesContainer');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const closeButton = document.getElementById('closeButton');
    const minimizeButton = document.getElementById('minimizeButton');
    const settingsButton = document.getElementById('settingsButton');
    const tabButtons = document.querySelectorAll('.tab-button');
    const agentOptions = document.querySelectorAll('.agent-option');
    const summarizeButton = document.getElementById('summarizeButton');
    const explainButton = document.getElementById('explainButton');
    const translateButton = document.getElementById('translateButton');
    const pageContext = document.getElementById('pageContext');
    
    // State
    let activeAgent = 'general';
    let isProcessing = false;
    let pageContextData = null;
    
    // Initialize
    initialize();
    
    // Event Listeners
    userInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
    
    sendButton.addEventListener('click', sendMessage);
    
    closeButton.addEventListener('click', function() {
      window.parent.postMessage({ action: 'closeSidebar' }, '*');
    });
    
    minimizeButton.addEventListener('click', function() {
      window.parent.postMessage({ action: 'minimizeSidebar' }, '*');
    });
    
    settingsButton.addEventListener('click', function() {
      window.parent.postMessage({ action: 'openSettings' }, '*');
    });
    
    tabButtons.forEach(button => {
      button.addEventListener('click', function() {
        const tabName = this.dataset.tab;
        
        // Update active tab button
        tabButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        // Show corresponding tab content
        document.querySelectorAll('.tab-content').forEach(tab => {
          tab.style.display = 'none';
        });
        
        const activeTab = document.getElementById(tabName + 'Tab');
        if (activeTab) {
          activeTab.style.display = 'block';
        }
        
        // Load page context if needed
        if (tabName === 'context' && !pageContextData) {
          loadPageContext();
        }
      });
    });
    
    agentOptions.forEach(option => {
      option.addEventListener('click', function() {
        agentOptions.forEach(opt => opt.classList.remove('active'));
        this.classList.add('active');
        activeAgent = this.dataset.agent;
        
        appendMessage('agent', `I've switched to the ${getAgentName(activeAgent)} mode. How can I help you?`);
      });
    });
    
    summarizeButton.addEventListener('click', function() {
      const prompt = "Please summarize this page concisely.";
      userInput.value = prompt;
      sendMessage();
    });
    
    explainButton.addEventListener('click', function() {
      const prompt = "Please explain what this page is about in simple terms.";
      userInput.value = prompt;
      sendMessage();
    });
    
    translateButton.addEventListener('click', function() {
      const prompt = "Please translate the main content of this page to ";
      userInput.value = prompt;
      userInput.focus();
      userInput.setSelectionRange(prompt.length, prompt.length);
    });
    
    // Listen for messages from parent window
    window.addEventListener('message', function(event) {
      const message = event.data;
      
      if (message.action === 'appendMessage') {
        appendMessage(message.type, message.content);
      } else if (message.action === 'setPageContext') {
        pageContextData = message.data;
        updatePageContextView();
      } else if (message.action === 'showTypingIndicator') {
        showTypingIndicator();
      } else if (message.action === 'hideTypingIndicator') {
        hideTypingIndicator();
      }
    });
    
    // Functions
    function initialize() {
      // Request page context from parent
      window.parent.postMessage({ action: 'getPageContext' }, '*');
      
      // Focus input field
      userInput.focus();
    }
    
    function sendMessage() {
      const text = userInput.value.trim();
      if (!text || isProcessing) return;
      
      appendMessage('user', text);
      userInput.value = '';
      
      isProcessing = true;
      showTypingIndicator();
      
      // Send message to parent window
      window.parent.postMessage({
        action: 'sendQuery',
        text: text,
        agent: activeAgent
      }, '*');
    }
    
    function appendMessage(type, content) {
      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${type}`;
      
      // Process markdown-like content
      content = processContent(content);
      
      messageDiv.innerHTML = content;
      messagesContainer.appendChild(messageDiv);
      
      // Scroll to bottom
      contentArea.scrollTop = contentArea.scrollHeight;
    }
    
    function processContent(content) {
      // Convert code blocks
      content = content.replace(/```([\s\S]*?)```/g, function(match, code) {
        return `<pre><code>${escapeHTML(code)}</code></pre>`;
      });
      
      // Convert inline code
      content = content.replace(/`([^`]+)`/g, function(match, code) {
        return `<code>${escapeHTML(code)}</code>`;
      });
      
      // Convert links
      content = content.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
      
      // Convert line breaks
      content = content.replace(/\n/g, '<br>');
      
      return content;
    }
    
    function escapeHTML(unsafe) {
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
    
    function showTypingIndicator() {
      const indicatorDiv = document.createElement('div');
      indicatorDiv.className = 'typing-indicator';
      indicatorDiv.id = 'typingIndicator';
      
      for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'typing-dot';
        indicatorDiv.appendChild(dot);
      }
      
      messagesContainer.appendChild(indicatorDiv);
      contentArea.scrollTop = contentArea.scrollHeight;
    }
    
    function hideTypingIndicator() {
      const indicator = document.getElementById('typingIndicator');
      if (indicator) {
        indicator.remove();
      }
      isProcessing = false;
    }
    
    function loadPageContext() {
      if (pageContextData) {
        updatePageContextView();
      } else {
        pageContext.innerHTML = '<p>Loading page context...</p>';
        window.parent.postMessage({ action: 'getPageContext' }, '*');
      }
    }
    
    function updatePageContextView() {
      if (!pageContextData) {
        pageContext.innerHTML = '<p>No context available for this page.</p>';
        return;
      }
      
      let html = `
        <div class="context-item">
          <strong>Title:</strong> ${escapeHTML(pageContextData.title)}
        </div>
        <div class="context-item">
          <strong>URL:</strong> ${escapeHTML(pageContextData.url)}
        </div>
      `;
      
      if (pageContextData.meta.description) {
        html += `
          <div class="context-item">
            <strong>Description:</strong> ${escapeHTML(pageContextData.meta.description)}
          </div>
        `;
      }
      
      if (pageContextData.meta.author) {
        html += `
          <div class="context-item">
            <strong>Author:</strong> ${escapeHTML(pageContextData.meta.author)}
          </div>
        `;
      }
      
      if (pageContextData.headings.length > 0) {
        html += `
          <div class="context-item">
            <strong>Headings:</strong>
            <ul>
              ${pageContextData.headings.map(h => `<li>${escapeHTML(h)}</li>`).join('')}
            </ul>
          </div>
        `;
      }
      
      html += `
        <div class="context-item">
          <strong>Content Preview:</strong>
          <div class="content-preview">${escapeHTML(pageContextData.text.substring(0, 300))}...</div>
        </div>
      `;
      
      pageContext.innerHTML = html;
    }
    
    function getAgentName(agentId) {
      const names = {
        'general': 'General Assistant',
        'research': 'Research Helper',
        'coder': 'Code Assistant',
        'writer': 'Content Writer'
      };
      
      return names[agentId] || 'Assistant';
    }
  });