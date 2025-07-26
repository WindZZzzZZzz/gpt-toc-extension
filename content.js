// ChatGPT Table of Contents Extension
class ChatGPTTOC {
  constructor() {
    this.sidebar = null;
    this.isVisible = false;
    this.headings = [];
    this.responseGroups = [];
    this.collapsedHeadings = new Set(); // Track collapsed headings by groupIndex-headingIndex
    this.collapsedGroups = new Set(); // Track collapsed groups by groupIndex
    this.rightArrowSVG = '<svg width="12" height="12" viewBox="0 0 12 12" style="vertical-align:middle"><polyline points="4,3 8,6 4,9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    this.downArrowSVG = '<svg width="12" height="12" viewBox="0 0 12 12" style="vertical-align:middle"><polyline points="3,4 6,8 9,4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    this.isDarkMode = false;
    this.init();
  }

  init() {
    // Wait for ChatGPT to load
    this.waitForChatGPT();
    
    // Create and inject sidebar
    this.createSidebar();
    
    // Add toggle button
    this.addToggleButton();
    
    // Start observing for content changes
    this.observeContentChanges();
    
    // Start observing for theme changes
    this.observeThemeChanges();
  }

  waitForChatGPT() {
    const checkInterval = setInterval(() => {
      const mainContent = document.querySelector('main');
      if (mainContent) {
        clearInterval(checkInterval);
        this.extractHeadings();
      }
    }, 1000);
  }

  createSidebar() {
    // Create sidebar container
    this.sidebar = document.createElement('div');
    this.sidebar.id = 'chatgpt-toc-sidebar';
    this.sidebar.setAttribute('role', 'dialog');
    this.sidebar.setAttribute('aria-labelledby', 'toc-title');
    this.sidebar.setAttribute('aria-describedby', 'toc-content');
    this.sidebar.innerHTML = `
      <div class="toc-header">
        <h3 id="toc-title" class="toc-title">Table of Contents</h3>
        <button class="toc-close" id="toc-close" aria-label="Close table of contents">×</button>
      </div>
      <div class="toc-content" id="toc-content" role="region" aria-label="Table of contents navigation">
        <div class="toc-loading">Loading...</div>
      </div>
    `;
    
    document.body.appendChild(this.sidebar);
    
    // Initialize theme
    this.updateTheme();
    
    // Add close button functionality
    const closeButton = document.getElementById('toc-close');
    closeButton.addEventListener('click', () => {
      this.toggleSidebar();
    });
    
    // Add keyboard support for close button
    closeButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleSidebar();
      }
    });


    // Attach event delegation for collapse/expand and scroll only once
    const tocContent = document.getElementById('toc-content');
    tocContent.addEventListener('click', (e) => {
      const collapseIcon = e.target.closest('.toc-collapse-icon');
      if (collapseIcon) {
        const tocItem = collapseIcon.closest('.toc-item');
        if (!tocItem) return;
        const groupIndex = parseInt(tocItem.getAttribute('data-group'));
        const headingIndex = parseInt(tocItem.getAttribute('data-heading'));
        const collapseKey = `${groupIndex}-${headingIndex}`;
        if (this.collapsedHeadings.has(collapseKey)) {
          this.collapsedHeadings.delete(collapseKey);
        } else {
          this.collapsedHeadings.add(collapseKey);
        }
        tocItem.classList.toggle('collapsed');
        this.toggleSubheadings(tocItem, groupIndex, headingIndex);
        // Update the icon
        const icon = tocItem.querySelector('.toc-collapse-icon');
        if (icon) {
          icon.innerHTML = tocItem.classList.contains('collapsed') ? this.rightArrowSVG : this.downArrowSVG;
        }
        return;
      }
      // If not collapse icon, check for toc-item (scroll)
      const tocItem = e.target.closest('.toc-item');
      if (tocItem) {
        const groupIndex = parseInt(tocItem.getAttribute('data-group'));
        const headingIndex = parseInt(tocItem.getAttribute('data-heading'));
        this.scrollToHeading(groupIndex, headingIndex);
      }
    });
  }
  addToggleButton() {
    // Create toggle button
    const toggleButton = document.createElement('button');
    toggleButton.id = 'chatgpt-toc-toggle';
    toggleButton.innerHTML = '📋 TOC';
    toggleButton.title = 'Open Table of Contents';
    toggleButton.setAttribute('aria-label', 'Toggle table of contents sidebar');
    toggleButton.setAttribute('aria-expanded', 'false');
    toggleButton.setAttribute('aria-controls', 'chatgpt-toc-sidebar');
    
    // Position the button in the top-right corner
    toggleButton.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 10000;
      background: #10a37f;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      transition: all 0.2s ease;
    `;
    
    toggleButton.addEventListener('click', () => {
      this.toggleSidebar();
      // If sidebar is opening, refresh the TOC
      if (!this.isVisible) {
        setTimeout(() => {
          this.extractHeadings();
        }, 500);
      }
    });
    
    toggleButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleSidebar();
      }
    });
    
    toggleButton.addEventListener('mouseenter', () => {
      toggleButton.style.background = '#0d8a6f';
    });
    
    toggleButton.addEventListener('mouseleave', () => {
      toggleButton.style.background = '#10a37f';
    });
    
    document.body.appendChild(toggleButton);
    // Ensure button is visible if sidebar is hidden
    toggleButton.style.display = this.isVisible ? 'none' : '';
  }

  toggleSidebar() {
    this.isVisible = !this.isVisible;
    this.sidebar.style.transform = this.isVisible ? 'translateX(0)' : 'translateX(100%)';
    
    // Update accessibility attributes
    const toggleButton = document.getElementById('chatgpt-toc-toggle');
    if (toggleButton) {
      toggleButton.setAttribute('aria-expanded', this.isVisible.toString());
      // Show/hide the button based on sidebar visibility
      toggleButton.style.display = this.isVisible ? 'none' : '';
    }
    
    // Focus management for accessibility
    if (this.isVisible) {
      // Focus the close button when opening
      const closeButton = document.getElementById('toc-close');
      if (closeButton) {
        closeButton.focus();
      }
    }
  }

  extractHeadings() {
    // Find all assistant message containers
    const assistantMessages = document.querySelectorAll('[data-message-author-role="assistant"]');
    this.responseGroups = [];
    
    assistantMessages.forEach((message, messageIndex) => {
      // Find headings within this specific message
      const headings = message.querySelectorAll('h1, h2, h3, h4, h5, h6');
      // Get a preview of the message content for the group title
      const messageText = message.textContent.trim();
      const preview = messageText.length > 50 ? messageText.substring(0, 50) + '...' : messageText;
      this.responseGroups.push({
        messageIndex: messageIndex,
        messageElement: message,
        headings: Array.from(headings),
        preview: preview
      });
    });
    // Flatten all headings for backward compatibility
    this.headings = this.responseGroups.flatMap(group => group.headings);
    this.updateTOC();
  }

  isInAssistantMessage(element) {
    // Check if the element is within an assistant message
    let parent = element.parentElement;
    while (parent) {
      if (parent.getAttribute('data-message-author-role') === 'assistant' ||
          parent.classList.contains('markdown') ||
          parent.classList.contains('prose')) {
        return true;
      }
      parent = parent.parentElement;
    }
    return false;
  }

  updateTOC() {
    const tocContent = document.getElementById('toc-content');
    if (this.responseGroups.length === 0) {
      tocContent.innerHTML = '<div class="toc-empty">No responses found</div>';
      return;
    }
    let tocHTML = '';
    this.responseGroups.forEach((group, groupIndex) => {
      const isGroupCollapsed = this.collapsedGroups.has(groupIndex);
      tocHTML += `
        <div class="toc-group-header toc-group-header-clickable" data-group="${groupIndex}">
          <div class="toc-group-text">
            <span class="toc-group-title">Response ${groupIndex + 1}</span>
            <span class="toc-group-preview">${group.preview}</span>
          </div>
          <span class="toc-group-collapse-icon">${isGroupCollapsed ? this.rightArrowSVG : this.downArrowSVG}</span>
        </div>
      `;
      // Render headings as a nested tree
      tocHTML += `<div class="toc-group-content" data-group="${groupIndex}" style="display:${isGroupCollapsed ? 'none' : 'block'};">${this.renderHeadingsTree(group.headings, groupIndex)}</div>`;
      if (groupIndex < this.responseGroups.length - 1) {
        tocHTML += '<div class="toc-group-separator"></div>';
      }
    });
    tocContent.innerHTML = tocHTML;
    // Group header click toggles collapse and scrolls to response
    const groupHeaders = tocContent.querySelectorAll('.toc-group-header-clickable');
    groupHeaders.forEach((header) => {
      header.addEventListener('click', (e) => {
        // Don't trigger if clicking on the collapse icon
        if (e.target.closest('.toc-group-collapse-icon')) {
          return;
        }
        const groupIndex = parseInt(header.getAttribute('data-group'));
        this.scrollToResponse(groupIndex);
      });
    });
    
    // Add collapse icon functionality
    const collapseIcons = tocContent.querySelectorAll('.toc-group-collapse-icon');
    collapseIcons.forEach((icon) => {
      icon.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent triggering the header click
        const groupHeader = icon.closest('.toc-group-header');
        const groupIndex = parseInt(groupHeader.getAttribute('data-group'));
        this.toggleGroupCollapse(groupIndex);
      });
    });
  }

  renderHeadingsTree(headings, groupIndex) {
    // Build a tree structure from flat headings array
    const tree = [];
    const stack = [];
    headings.forEach((heading, i) => {
      const node = {
        index: i,
        level: parseInt(heading.tagName.charAt(1)),
        text: heading.textContent.trim(),
        children: [],
        heading
      };
      while (stack.length && stack[stack.length - 1].level >= node.level) {
        stack.pop();
      }
      if (stack.length) {
        stack[stack.length - 1].children.push(node);
      } else {
        tree.push(node);
      }
      stack.push(node);
    });
    // Recursively render tree
    const renderNodes = (nodes, parentIndex = null) => {
      let html = '';
      nodes.forEach((node) => {
        const collapseKey = `${groupIndex}-${node.index}`;
        const isCollapsed = this.collapsedHeadings.has(collapseKey);
        const hasSub = node.children.length > 0;
        html += `<div class="toc-item toc-h${node.level}${isCollapsed ? ' collapsed' : ''}" data-group="${groupIndex}" data-heading="${node.index}" style="padding-left: ${(node.level - 1) * 16}px;">
          <span class="toc-text">${node.text}</span>
          ${hasSub ? `<span class="toc-collapse-icon">${isCollapsed ? this.rightArrowSVG : this.downArrowSVG}</span>` : ''}
        </div>`;
        if (hasSub) {
          html += `<div class="toc-children" style="display:${isCollapsed ? 'none' : 'block'};">${renderNodes(node.children, node.index)}</div>`;
        }
      });
      return html;
    };
    return renderNodes(tree);
  }

  toggleSubheadings(tocItem, groupIndex, headingIndex) {
    // Find the next sibling .toc-children and toggle its display
    const children = tocItem.nextElementSibling;
    if (children && children.classList.contains('toc-children')) {
      children.style.display = children.style.display === 'none' ? 'block' : 'none';
    }
  }

  scrollToResponse(groupIndex) {
    if (this.responseGroups[groupIndex] && this.responseGroups[groupIndex].messageElement) {
      const message = this.responseGroups[groupIndex].messageElement;
      message.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      // Optionally highlight the message
      message.style.backgroundColor = '#e3f2fd';
      message.style.transition = 'background-color 0.3s ease';
      setTimeout(() => {
        message.style.backgroundColor = '';
      }, 2000);
    }
  }

  toggleGroupCollapse(groupIndex) {
    if (this.collapsedGroups.has(groupIndex)) {
      this.collapsedGroups.delete(groupIndex);
    } else {
      this.collapsedGroups.add(groupIndex);
    }
    
    // Update the UI
    const groupHeader = document.querySelector(`[data-group="${groupIndex}"].toc-group-header`);
    const groupContent = document.querySelector(`.toc-group-content[data-group="${groupIndex}"]`);
    const collapseIcon = groupHeader?.querySelector('.toc-group-collapse-icon');
    
    if (groupContent && collapseIcon) {
      const isCollapsed = this.collapsedGroups.has(groupIndex);
      groupContent.style.display = isCollapsed ? 'none' : 'block';
      collapseIcon.innerHTML = isCollapsed ? this.rightArrowSVG : this.downArrowSVG;
    }
  }

  scrollToHeading(groupIndex, headingIndex) {
    if (this.responseGroups[groupIndex] && this.responseGroups[groupIndex].headings[headingIndex]) {
      const heading = this.responseGroups[groupIndex].headings[headingIndex];
      
      // Smooth scroll to the heading
      heading.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      
      // Highlight the heading briefly
      heading.style.backgroundColor = '#ffeb3b';
      heading.style.transition = 'background-color 0.3s ease';
      
      setTimeout(() => {
        heading.style.backgroundColor = '';
      }, 2000);
    }
  }

  observeContentChanges() {
    // Poll every 2 seconds to check for content changes
    let lastContentHash = '';
    setInterval(() => {
      // Only check the last assistant message
      const assistantMessages = document.querySelectorAll('[data-message-author-role="assistant"]');
      if (assistantMessages.length === 0) {
        // No assistant messages, do not update TOC
        return;
      }
      const lastMsg = assistantMessages[assistantMessages.length - 1];
      let lastText = lastMsg ? lastMsg.textContent : '';
      if (lastText !== lastContentHash) {
        lastContentHash = lastText;
        this.extractHeadings();
      }
    }, 2000);
  }

  detectDarkMode() {
    // Check if the system/browser prefers dark color scheme
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  updateTheme() {
    const wasDarkMode = this.isDarkMode;
    this.isDarkMode = this.detectDarkMode();
    
    if (wasDarkMode !== this.isDarkMode && this.sidebar) {
      if (this.isDarkMode) {
        this.sidebar.classList.add('dark-mode');
      } else {
        this.sidebar.classList.remove('dark-mode');
      }
    }
  }

  observeThemeChanges() {
    // Initial theme detection
    this.updateTheme();
    
    // Listen for system theme changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', () => {
        this.updateTheme();
      });
    }
  }
}

// Initialize the extension when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ChatGPTTOC();
  });
} else {
  new ChatGPTTOC();
} 
