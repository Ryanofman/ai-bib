/**
 * Conversation Fetcher
 * Handles fetching and parsing shared conversations from various AI platforms
 */

class ConversationFetcher {
    constructor() {
        // Platform configurations
        this.platforms = {
            chatgpt: {
                pattern: /chat\.openai\.com\/share\/([a-zA-Z0-9-]+)/,
                apiEndpoint: 'https://chat.openai.com/backend-api/share/',
                parser: this.parseChatGPT.bind(this)
            },
            claude: {
                pattern: /claude\.ai\/share\/([a-zA-Z0-9-]+)/,
                apiEndpoint: 'https://claude.ai/api/share/',
                parser: this.parseClaude.bind(this)
            },
            gemini: {
                pattern: /g\.co\/gemini\/share\/([a-zA-Z0-9-]+)/,
                apiEndpoint: 'https://gemini.google.com/share/',
                parser: this.parseGemini.bind(this)
            },
            perplexity: {
                pattern: /perplexity\.ai\/share\/([a-zA-Z0-9-]+)/,
                apiEndpoint: 'https://www.perplexity.ai/api/share/',
                parser: this.parsePerplexity.bind(this)
            }
        };

        // Proxy server for CORS bypass (you'll need to set this up)
        this.proxyUrl = 'https://api.allorigins.win/raw?url=';
        
        // Alternative: Use a custom proxy server
        // this.proxyUrl = 'https://your-proxy-server.com/fetch?url=';
    }

    /**
     * Main fetch method - detects platform and fetches conversation
     * @param {string} url - The shared conversation URL
     * @returns {Promise<object>} Parsed conversation data
     */
    async fetchConversation(url) {
        try {
            // Detect platform
            const platform = this.detectPlatform(url);
            if (!platform) {
                throw new Error('Unsupported platform or invalid URL');
            }

            // Extract conversation ID
            const conversationId = this.extractConversationId(url, platform);
            if (!conversationId) {
                throw new Error('Could not extract conversation ID from URL');
            }

            // Attempt different fetching strategies
            let conversationData = null;

            // Strategy 1: Try direct API endpoint (might fail due to CORS)
            try {
                conversationData = await this.fetchDirectAPI(platform, conversationId);
            } catch (error) {
                console.log('Direct API failed, trying web scraping...');
            }

            // Strategy 2: Try web scraping through proxy
            if (!conversationData) {
                conversationData = await this.fetchViaWebScraping(url, platform);
            }

            // Strategy 3: Try browser extension messaging (if available)
            if (!conversationData && window.chrome && window.chrome.runtime) {
                conversationData = await this.fetchViaExtension(url);
            }

            if (!conversationData) {
                throw new Error('Unable to fetch conversation. Please try copying and pasting instead.');
            }

            // Parse and format the conversation
            return this.parseConversation(conversationData, platform);

        } catch (error) {
            console.error('Fetch error:', error);
            return {
                success: false,
                error: error.message,
                suggestion: 'Please copy and paste the conversation directly, or check if the share link is public.'
            };
        }
    }

    /**
     * Detect which platform the URL is from
     */
    detectPlatform(url) {
        for (const [platform, config] of Object.entries(this.platforms)) {
            if (config.pattern.test(url)) {
                return platform;
            }
        }
        return null;
    }

    /**
     * Extract conversation ID from URL
     */
    extractConversationId(url, platform) {
        const match = url.match(this.platforms[platform].pattern);
        return match ? match[1] : null;
    }

    /**
     * Strategy 1: Direct API fetch
     */
    async fetchDirectAPI(platform, conversationId) {
        const config = this.platforms[platform];
        const apiUrl = config.apiEndpoint + conversationId;

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
        }

        return await response.json();
    }

    /**
     * Strategy 2: Web scraping through proxy
     */
    async fetchViaWebScraping(url, platform) {
        // Use proxy to bypass CORS
        const proxyUrl = this.proxyUrl + encodeURIComponent(url);
        
        const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
                'Accept': 'text/html,application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Proxy fetch failed: ${response.status}`);
        }

        const html = await response.text();
        
        // Extract conversation data from HTML
        return this.extractDataFromHTML(html, platform);
    }

    /**
     * Strategy 3: Browser extension messaging
     */
    async fetchViaExtension(url) {
        return new Promise((resolve, reject) => {
            // Send message to browser extension if available
            if (window.chrome && window.chrome.runtime && window.chrome.runtime.sendMessage) {
                chrome.runtime.sendMessage(
                    { action: 'fetchConversation', url: url },
                    (response) => {
                        if (response && response.success) {
                            resolve(response.data);
                        } else {
                            reject(new Error('Extension fetch failed'));
                        }
                    }
                );
            } else {
                reject(new Error('No browser extension available'));
            }
        });
    }

    /**
     * Extract conversation data from HTML
     */
    extractDataFromHTML(html, platform) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Platform-specific extractors
        switch (platform) {
            case 'chatgpt':
                return this.extractChatGPTData(doc);
            case 'claude':
                return this.extractClaudeData(doc);
            case 'gemini':
                return this.extractGeminiData(doc);
            case 'perplexity':
                return this.extractPerplexityData(doc);
            default:
                return null;
        }
    }

    /**
     * Extract ChatGPT conversation from HTML
     */
    extractChatGPTData(doc) {
        const data = {
            messages: [],
            title: '',
            model: 'unknown'
        };

        // Try to find conversation data in script tags
        const scriptTags = doc.querySelectorAll('script');
        for (const script of scriptTags) {
            if (script.textContent.includes('__NEXT_DATA__')) {
                try {
                    const jsonMatch = script.textContent.match(/{.*}/);
                    if (jsonMatch) {
                        const parsed = JSON.parse(jsonMatch[0]);
                        // Navigate through Next.js data structure
                        const pageProps = parsed?.props?.pageProps;
                        if (pageProps?.sharedConversation) {
                            return pageProps.sharedConversation;
                        }
                    }
                } catch (e) {
                    console.error('Failed to parse __NEXT_DATA__:', e);
                }
            }
        }

        // Fallback: Try to extract from visible elements
        const messageElements = doc.querySelectorAll('[data-message-author], .text-base');
        messageElements.forEach(element => {
            const role = element.getAttribute('data-message-author') || 
                        (element.textContent.startsWith('You:') ? 'user' : 'assistant');
            const content = element.textContent.trim();
            
            if (content) {
                data.messages.push({ role, content });
            }
        });

        return data.messages.length > 0 ? data : null;
    }

    /**
     * Extract Claude conversation from HTML
     */
    extractClaudeData(doc) {
        const data = {
            messages: [],
            title: '',
            model: 'unknown'
        };

        // Look for Claude-specific elements
        const conversationElements = doc.querySelectorAll('.conversation-turn');
        conversationElements.forEach(element => {
            const roleElement = element.querySelector('.speaker-label');
            const contentElement = element.querySelector('.message-content');
            
            if (roleElement && contentElement) {
                const role = roleElement.textContent.toLowerCase().includes('human') ? 'user' : 'assistant';
                const content = contentElement.textContent.trim();
                data.messages.push({ role, content });
            }
        });

        return data.messages.length > 0 ? data : null;
    }

    /**
     * Extract Gemini conversation from HTML
     */
    extractGeminiData(doc) {
        // Similar extraction logic for Gemini
        const data = {
            messages: [],
            title: '',
            model: 'gemini'
        };

        // Gemini-specific selectors would go here
        const messageElements = doc.querySelectorAll('.message-content, [class*="conversation"]');
        // ... extraction logic ...

        return data;
    }

    /**
     * Extract Perplexity conversation from HTML
     */
    extractPerplexityData(doc) {
        // Similar extraction logic for Perplexity
        const data = {
            messages: [],
            title: '',
            model: 'perplexity'
        };

        // Perplexity-specific selectors would go here
        return data;
    }

    /**
     * Parse conversation data into standard format
     */
    parseConversation(data, platform) {
        const conversation = {
            platform: platform,
            title: data.title || 'Untitled Conversation',
            model: data.model || 'Unknown Model',
            messages: [],
            metadata: {
                fetchedAt: new Date().toISOString(),
                messageCount: 0,
                platform: platform
            }
        };

        // Standardize message format
        if (data.messages && Array.isArray(data.messages)) {
            conversation.messages = data.messages.map((msg, index) => ({
                index: index,
                role: this.standardizeRole(msg.role || msg.author),
                content: this.cleanContent(msg.content || msg.text || msg.message),
                timestamp: msg.timestamp || null
            }));
        }

        conversation.metadata.messageCount = conversation.messages.length;

        // Convert to text format for the analyzer
        conversation.text = this.convertToText(conversation);

        return {
            success: true,
            data: conversation
        };
    }

    /**
     * Platform-specific parsers
     */
    parseChatGPT(data) {
        // ChatGPT-specific parsing logic
        return this.parseConversation(data, 'chatgpt');
    }

    parseClaude(data) {
        // Claude-specific parsing logic
        return this.parseConversation(data, 'claude');
    }

    parseGemini(data) {
        // Gemini-specific parsing logic
        return this.parseConversation(data, 'gemini');
    }

    parsePerplexity(data) {
        // Perplexity-specific parsing logic
        return this.parseConversation(data, 'perplexity');
    }

    /**
     * Standardize role names across platforms
     */
    standardizeRole(role) {
        const roleMap = {
            'user': 'user',
            'human': 'user',
            'you': 'user',
            'assistant': 'assistant',
            'ai': 'assistant',
            'chatgpt': 'assistant',
            'claude': 'assistant',
            'gemini': 'assistant',
            'gpt': 'assistant'
        };

        return roleMap[role.toLowerCase()] || role;
    }

    /**
     * Clean content text
     */
    cleanContent(content) {
        if (!content) return '';
        
        // Remove excessive whitespace
        return content
            .replace(/\n{3,}/g, '\n\n')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Convert conversation to text format for analyzer
     */
    convertToText(conversation) {
        let text = '';
        
        conversation.messages.forEach(msg => {
            const prefix = msg.role === 'user' ? 'User: ' : 'Assistant: ';
            text += prefix + msg.content + '\n\n';
        });

        return text.trim();
    }

    /**
     * Fallback parser for unknown formats
     */
    parseFallback(text) {
        const lines = text.split('\n');
        const messages = [];
        let currentMessage = null;

        for (const line of lines) {
            const userMatch = line.match(/^(User|You|Human):\s*(.+)/i);
            const assistantMatch = line.match(/^(Assistant|AI|ChatGPT|Claude|Gemini):\s*(.+)/i);

            if (userMatch) {
                if (currentMessage) messages.push(currentMessage);
                currentMessage = { role: 'user', content: userMatch[2] };
            } else if (assistantMatch) {
                if (currentMessage) messages.push(currentMessage);
                currentMessage = { role: 'assistant', content: assistantMatch[2] };
            } else if (currentMessage && line.trim()) {
                currentMessage.content += '\n' + line;
            }
        }

        if (currentMessage) messages.push(currentMessage);

        return {
            platform: 'unknown',
            messages: messages,
            text: text
        };
    }
}

// Export for use in other scripts
window.ConversationFetcher = ConversationFetcher;