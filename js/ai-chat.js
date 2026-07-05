/* ============================================
   AI CHAT — Powered by Google Gemini
   Function Calling + Tool Use Architecture
   API key secured on backend (port 8001)
   ============================================ */

const AIChat = (() => {

    // ========== CONFIGURATION ==========
    // API key is kept server-side via proxy. See /server/server.js
    // Local dev: run "cd server && npm start" → http://localhost:3001
    // Production: replace with your deployed proxy URL
    const API_URL = 'http://localhost:3001/api/chat';

    // ========== TOOL DEFINITIONS (Gemini Function Calling) ==========
    const TOOL_DECLARATIONS = [
        {
            name: 'showLocationImage',
            description: 'Show an image of a city or location when the conversation involves where Klinten lives, works, was born, or any geographic location relevant to his profile. Call this whenever a city, state, or country is mentioned in your response.',
            parameters: {
                type: 'OBJECT',
                properties: {
                    city: {
                        type: 'STRING',
                        description: 'The city name, e.g. "Bengaluru", "Hyderabad", "Gudur"'
                    },
                    context: {
                        type: 'STRING',
                        description: 'Brief context like "current_location", "birthplace", "relocation_preference"'
                    }
                },
                required: ['city']
            }
        },
        {
            name: 'showTechLogo',
            description: 'Show technology/framework logos when discussing Klinten\'s technical skills or tech stack. Call this when listing or discussing specific technologies.',
            parameters: {
                type: 'OBJECT',
                properties: {
                    technologies: {
                        type: 'ARRAY',
                        items: { type: 'STRING' },
                        description: 'Array of technology names, e.g. ["React", "Spring Boot", "Node.js"]'
                    }
                },
                required: ['technologies']
            }
        },
        {
            name: 'highlightSection',
            description: 'Scroll to and highlight a section of the resume website when the user asks about something that has a dedicated section. Use this to direct users to relevant content on the page.',
            parameters: {
                type: 'OBJECT',
                properties: {
                    sectionId: {
                        type: 'STRING',
                        description: 'The HTML section ID to scroll to: "about", "experience", "skills", "projects", "education", "contact"'
                    },
                    reason: {
                        type: 'STRING',
                        description: 'Brief reason for highlighting, e.g. "Showing experience section"'
                    }
                },
                required: ['sectionId']
            }
        },
        {
            name: 'showProjectDetails',
            description: 'Display a rich project information card when the user asks about a specific project. Shows project name, description, and tech stack in a visual card.',
            parameters: {
                type: 'OBJECT',
                properties: {
                    projectName: {
                        type: 'STRING',
                        description: 'The project name, e.g. "Cash Management", "Error Handling AI Agent"'
                    }
                },
                required: ['projectName']
            }
        }
    ];

    // ========== LOCATION IMAGE MAP ==========
    const LOCATION_IMAGES = {
        'bengaluru': {
            url: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400&h=200&fit=crop',
            landmark: 'Vidhana Soudha, Bengaluru',
            fallbackEmoji: '🏙️'
        },
        'bangalore': {
            url: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400&h=200&fit=crop',
            landmark: 'Vidhana Soudha, Bengaluru',
            fallbackEmoji: '🏙️'
        },
        'hyderabad': {
            url: 'https://images.unsplash.com/photo-1572638021265-d69e4e234a75?w=400&h=200&fit=crop',
            landmark: 'Charminar, Hyderabad',
            fallbackEmoji: '🕌'
        },
        'delhi': {
            url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=200&fit=crop',
            landmark: 'India Gate, New Delhi',
            fallbackEmoji: '🏛️'
        },
        'new delhi': {
            url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=200&fit=crop',
            landmark: 'India Gate, New Delhi',
            fallbackEmoji: '🏛️'
        },
        'mumbai': {
            url: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=200&fit=crop',
            landmark: 'Gateway of India, Mumbai',
            fallbackEmoji: '🌊'
        },
        'chennai': {
            url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&h=200&fit=crop',
            landmark: 'Marina Beach, Chennai',
            fallbackEmoji: '🏖️'
        },
        'kolkata': {
            url: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=400&h=200&fit=crop',
            landmark: 'Victoria Memorial, Kolkata',
            fallbackEmoji: '🏰'
        },
        'pune': {
            url: 'https://images.unsplash.com/photo-1609947017136-9daf32a76e94?w=400&h=200&fit=crop',
            landmark: 'Shaniwar Wada, Pune',
            fallbackEmoji: '🏰'
        },
        'gudur': {
            url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&h=200&fit=crop',
            landmark: 'Gudur, Andhra Pradesh',
            fallbackEmoji: '🌾'
        },
        'nellore': {
            url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&h=200&fit=crop',
            landmark: 'Nellore, Andhra Pradesh',
            fallbackEmoji: '🌾'
        },
        'andhra pradesh': {
            url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&h=200&fit=crop',
            landmark: 'Andhra Pradesh, India',
            fallbackEmoji: '🇮🇳'
        },
        'india': {
            url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&h=200&fit=crop',
            landmark: 'Taj Mahal, India',
            fallbackEmoji: '🇮🇳'
        }
    };

    // ========== TECH LOGO MAP (using devicon CDN) ==========
    const TECH_LOGOS = {
        'react': { icon: 'devicon-react-original colored', label: 'React' },
        'react.js': { icon: 'devicon-react-original colored', label: 'React' },
        'reactjs': { icon: 'devicon-react-original colored', label: 'React' },
        'angular': { icon: 'devicon-angularjs-plain colored', label: 'Angular' },
        'angularjs': { icon: 'devicon-angularjs-plain colored', label: 'Angular' },
        'node.js': { icon: 'devicon-nodejs-plain colored', label: 'Node.js' },
        'nodejs': { icon: 'devicon-nodejs-plain colored', label: 'Node.js' },
        'node': { icon: 'devicon-nodejs-plain colored', label: 'Node.js' },
        'spring boot': { icon: 'devicon-spring-plain colored', label: 'Spring Boot' },
        'spring': { icon: 'devicon-spring-plain colored', label: 'Spring Boot' },
        'java': { icon: 'devicon-java-plain colored', label: 'Java' },
        'javascript': { icon: 'devicon-javascript-plain colored', label: 'JavaScript' },
        'js': { icon: 'devicon-javascript-plain colored', label: 'JavaScript' },
        'typescript': { icon: 'devicon-typescript-plain colored', label: 'TypeScript' },
        'python': { icon: 'devicon-python-plain colored', label: 'Python' },
        'mongodb': { icon: 'devicon-mongodb-plain colored', label: 'MongoDB' },
        'html': { icon: 'devicon-html5-plain colored', label: 'HTML5' },
        'html5': { icon: 'devicon-html5-plain colored', label: 'HTML5' },
        'css': { icon: 'devicon-css3-plain colored', label: 'CSS3' },
        'css3': { icon: 'devicon-css3-plain colored', label: 'CSS3' },
        'git': { icon: 'devicon-git-plain colored', label: 'Git' },
        'github': { icon: 'devicon-github-original', label: 'GitHub' },
        'docker': { icon: 'devicon-docker-plain colored', label: 'Docker' },
        'express': { icon: 'devicon-express-original', label: 'Express.js' },
        'express.js': { icon: 'devicon-express-original', label: 'Express.js' },
        'polymer': { icon: 'devicon-polymer-original colored', label: 'Polymer' },
        'polymer.js': { icon: 'devicon-polymer-original colored', label: 'Polymer' },
        'aws': { icon: 'devicon-amazonwebservices-plain-wordmark colored', label: 'AWS' },
        'jenkins': { icon: 'devicon-jenkins-line colored', label: 'Jenkins' },
        'jira': { icon: 'devicon-jira-plain colored', label: 'JIRA' },
        'bitbucket': { icon: 'devicon-bitbucket-original colored', label: 'Bitbucket' },
    };

    const TECH_FALLBACKS = {
        'wavemaker': { emoji: '🌊', label: 'WaveMaker' },
        'loopback': { emoji: '🔄', label: 'LoopBack' },
        'loopback.io': { emoji: '🔄', label: 'LoopBack' },
        'rest apis': { emoji: '🔗', label: 'REST APIs' },
        'rest api': { emoji: '🔗', label: 'REST APIs' },
        'microservices': { emoji: '🧩', label: 'Microservices' },
        'agile': { emoji: '🔄', label: 'Agile' },
        'prompt engineering': { emoji: '🧠', label: 'Prompt Eng.' },
        'ai agents': { emoji: '🤖', label: 'AI Agents' },
        'ai/ml': { emoji: '🧠', label: 'AI/ML' },
        'llm': { emoji: '🤖', label: 'LLM' },
        'nlp': { emoji: '💬', label: 'NLP' },
        'websocket': { emoji: '🔌', label: 'WebSocket' },
        'dbms': { emoji: '🗄️', label: 'DBMS' },
    };

    // ========== SYSTEM PROMPT ==========
    const SYSTEM_PROMPT = `You are an AI assistant embedded on Klinten Guduru's personal resume website (klinteng.com). You have access to tools (via Gemini function calling) that you can use to enhance your responses. Your role is to help visitors — especially recruiters and hiring managers — learn about Klinten's professional background.

IMPORTANT GUIDELINES:
- Answer ONLY questions related to Klinten Guduru's resume, career, skills, projects, education, and professional background.
- If someone asks something unrelated, politely redirect them to ask about Klinten's professional profile.
- Be professional, concise, and friendly.
- IMPORTANT: Always refer to him as "Klinten" (not "Bill"). His full legal name is Bill Klinten Guduru, but he prefers Klinten.

TOOL USAGE GUIDELINES:
- Use your tools to enhance responses. Don't just give text — use the right tool alongside your answer.
- When mentioning a LOCATION (city, state, country): Call showLocationImage with the city name.
- When mentioning TECHNOLOGIES or SKILLS: Call showTechLogo with an array of technology names.
- When the user asks about a topic with a DEDICATED SECTION on the website: Call highlightSection to scroll there.
- When discussing a SPECIFIC PROJECT: Call showProjectDetails with the project name.
- You can call MULTIPLE TOOLS in a single response. For example, if someone asks about Klinten's current role, you might call showLocationImage("Bengaluru") AND showTechLogo(["React", "Node.js"]) AND highlightSection("experience").
- Use tools when they add value to the response.

BILL KLINTEN GUDURU — PROFESSIONAL PROFILE:
` + buildProfileContext();

    // ========== CONVERSATION HISTORY ==========
    const conversations = { section: [], floating: [] };

    // ========== QUICK SUGGESTION QUESTIONS ==========
    const SUGGESTIONS = [
        { icon: 'fas fa-briefcase', text: "What's Klinten's work experience?" },
        { icon: 'fas fa-robot', text: 'Tell me about his AI projects' },
        { icon: 'fas fa-code', text: 'What are his top technical skills?' },
        { icon: 'fas fa-map-marker-alt', text: 'Where does Klinten live?' },
        { icon: 'fas fa-graduation-cap', text: "What's his educational background?" },
        { icon: 'fas fa-cogs', text: 'How does this AI chatbot work?' }
    ];

    // ========== API CALL (with Function Calling) ==========
    async function sendToGemini(userMessage, chatType) {
        const history = conversations[chatType];

        // Build history in {role, content} format for the backend
        const historyPayload = [];
        history.forEach(msg => {
            historyPayload.push({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.text
            });
        });

        const requestBody = {
            message: userMessage,
            history: historyPayload,
            system_prompt: SYSTEM_PROMPT
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                if (response.status === 429) {
                    return { text: "I'm getting a lot of questions right now! Please wait a moment and try again.", toolCalls: [] };
                }
                return { text: "I'm having trouble connecting right now. Please try again in a moment.", toolCalls: [] };
            }

            const data = await response.json();

            history.push({ role: 'user', text: userMessage });
            history.push({ role: 'assistant', text: data.text });
            if (history.length > 20) history.splice(0, 2);

            return { text: data.text, toolCalls: data.tool_calls || [] };

        } catch (error) {
            console.error('Network error:', error);
            return { text: "I'm having trouble connecting. Please check your internet connection and try again.", toolCalls: [] };
        }
    }

    // ========== TOOL EXECUTION ==========
    function executeToolCall(toolCall, container) {
        switch (toolCall.name) {
            case 'showLocationImage': renderLocationImage(toolCall.args, container); break;
            case 'showTechLogo': renderTechLogos(toolCall.args, container); break;
            case 'highlightSection': renderSectionHighlight(toolCall.args, container); break;
            case 'showProjectDetails': renderProjectCard(toolCall.args, container); break;
        }
    }

    function renderLocationImage(args, container) {
        const city = (args.city || '').toLowerCase().trim();
        const locationData = LOCATION_IMAGES[city];
        const card = document.createElement('div');
        card.className = 'chat-message bot tool-output';
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'chat-avatar';
        avatarDiv.innerHTML = '<i class="fas fa-map-marker-alt"></i>';
        const contentDiv = document.createElement('div');
        contentDiv.className = 'chat-bubble tool-card location-card';

        if (locationData) {
            contentDiv.innerHTML = '<div class="tool-badge"><i class="fas fa-map-marker-alt"></i> Location Agent</div>' +
                '<div class="location-image-wrapper">' +
                '<img src="' + locationData.url + '" alt="' + locationData.landmark + '" class="location-image" onerror="this.parentElement.innerHTML=\'<div class=location-fallback>' + locationData.fallbackEmoji + '</div>\'" loading="lazy">' +
                '</div>' +
                '<div class="location-info"><span class="location-name">' + locationData.landmark + '</span></div>';
        } else {
            contentDiv.innerHTML = '<div class="tool-badge"><i class="fas fa-map-marker-alt"></i> Location Agent</div>' +
                '<div class="location-image-wrapper"><div class="location-fallback">📍</div></div>' +
                '<div class="location-info"><span class="location-name">' + (args.city || 'Location') + '</span></div>';
        }

        card.appendChild(avatarDiv);
        card.appendChild(contentDiv);
        container.appendChild(card);
        requestAnimationFrame(function() { container.scrollTop = container.scrollHeight; });
    }

    function renderTechLogos(args, container) {
        var techs = args.technologies || [];
        if (techs.length === 0) return;

        var card = document.createElement('div');
        card.className = 'chat-message bot tool-output';
        var avatarDiv = document.createElement('div');
        avatarDiv.className = 'chat-avatar';
        avatarDiv.innerHTML = '<i class="fas fa-code"></i>';
        var contentDiv = document.createElement('div');
        contentDiv.className = 'chat-bubble tool-card tech-card';

        var logosHTML = '<div class="tool-badge"><i class="fas fa-code"></i> Tech Stack Agent</div><div class="tech-logos-grid">';

        techs.forEach(function(tech) {
            var key = tech.toLowerCase().trim();
            var deviconData = TECH_LOGOS[key];
            var fallbackData = TECH_FALLBACKS[key];

            if (deviconData) {
                logosHTML += '<div class="tech-logo-item"><i class="' + deviconData.icon + '" title="' + deviconData.label + '"></i><span>' + deviconData.label + '</span></div>';
            } else if (fallbackData) {
                logosHTML += '<div class="tech-logo-item"><span class="tech-emoji">' + fallbackData.emoji + '</span><span>' + fallbackData.label + '</span></div>';
            } else {
                logosHTML += '<div class="tech-logo-item"><span class="tech-emoji">⚙️</span><span>' + tech + '</span></div>';
            }
        });

        logosHTML += '</div>';
        contentDiv.innerHTML = logosHTML;
        card.appendChild(avatarDiv);
        card.appendChild(contentDiv);
        container.appendChild(card);
        requestAnimationFrame(function() { container.scrollTop = container.scrollHeight; });
    }

    function renderSectionHighlight(args, container) {
        var sectionId = args.sectionId;
        var reason = args.reason || 'Navigating to section';

        var card = document.createElement('div');
        card.className = 'chat-message bot tool-output';
        var avatarDiv = document.createElement('div');
        avatarDiv.className = 'chat-avatar';
        avatarDiv.innerHTML = '<i class="fas fa-compass"></i>';
        var contentDiv = document.createElement('div');
        contentDiv.className = 'chat-bubble tool-card navigate-card';
        contentDiv.innerHTML = '<div class="tool-badge"><i class="fas fa-compass"></i> Navigation Agent</div>' +
            '<button class="navigate-btn" onclick="document.getElementById(\'' + sectionId + '\')?.scrollIntoView({behavior:\'smooth\',block:\'start\'})">' +
            '<i class="fas fa-arrow-right"></i> Go to ' + sectionId.charAt(0).toUpperCase() + sectionId.slice(1) + ' Section</button>' +
            '<span class="navigate-hint">' + reason + '</span>';

        card.appendChild(avatarDiv);
        card.appendChild(contentDiv);
        container.appendChild(card);
        requestAnimationFrame(function() { container.scrollTop = container.scrollHeight; });
    }

    function renderProjectCard(args, container) {
        var projectName = args.projectName || '';
        var allProjects = (PROFILE_DATA.enterpriseProjects || []).concat(PROFILE_DATA.aiProjects || []);
        var project = allProjects.find(function(p) { return p.name.toLowerCase() === projectName.toLowerCase(); });

        var card = document.createElement('div');
        card.className = 'chat-message bot tool-output';
        var avatarDiv = document.createElement('div');
        avatarDiv.className = 'chat-avatar';
        avatarDiv.innerHTML = '<i class="fas fa-project-diagram"></i>';
        var contentDiv = document.createElement('div');
        contentDiv.className = 'chat-bubble tool-card project-detail-card';

        if (project) {
            var isAI = (PROFILE_DATA.aiProjects || []).indexOf(project) !== -1;
            var techBadges = project.tech.map(function(t) { return '<span class="project-tech-badge">' + t + '</span>'; }).join('');
            contentDiv.innerHTML = '<div class="tool-badge"><i class="fas fa-project-diagram"></i> Project Agent</div>' +
                '<div class="project-detail-header"><span class="project-type-badge ' + (isAI ? 'ai' : 'enterprise') + '">' + (isAI ? '🤖 AI Project' : '🏢 Enterprise') + '</span><h4>' + project.name + '</h4></div>' +
                '<p class="project-detail-desc">' + project.description + '</p>' +
                '<div class="project-tech-badges">' + techBadges + '</div>';
        } else {
            contentDiv.innerHTML = '<div class="tool-badge"><i class="fas fa-project-diagram"></i> Project Agent</div>' +
                '<div class="project-detail-header"><h4>' + projectName + '</h4></div>' +
                '<p class="project-detail-desc">Project details available upon request.</p>';
        }

        card.appendChild(avatarDiv);
        card.appendChild(contentDiv);
        container.appendChild(card);
        requestAnimationFrame(function() { container.scrollTop = container.scrollHeight; });
    }

    // ========== FORMAT RESPONSE ==========
    function formatResponse(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>')
            .replace(/^[-•]\s/gm, '&#8226; ');
    }

    function createMessage(text, sender, container) {
        var msgDiv = document.createElement('div');
        msgDiv.className = 'chat-message ' + sender;
        var avatarDiv = document.createElement('div');
        avatarDiv.className = 'chat-avatar';
        avatarDiv.innerHTML = sender === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
        var contentDiv = document.createElement('div');
        contentDiv.className = 'chat-bubble';
        if (sender === 'bot') { contentDiv.innerHTML = formatResponse(text); }
        else { contentDiv.textContent = text; }
        msgDiv.appendChild(avatarDiv);
        msgDiv.appendChild(contentDiv);
        container.appendChild(msgDiv);
        requestAnimationFrame(function() { container.scrollTop = container.scrollHeight; });
        return msgDiv;
    }

    function showTyping(container) {
        var typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message bot typing-indicator';
        typingDiv.innerHTML = '<div class="chat-avatar"><i class="fas fa-robot"></i></div><div class="chat-bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>';
        container.appendChild(typingDiv);
        container.scrollTop = container.scrollHeight;
        return typingDiv;
    }

    function showToolThinking(toolName, container) {
        var thinkDiv = document.createElement('div');
        thinkDiv.className = 'chat-message bot tool-thinking';
        var iconMap = {
            'showLocationImage': 'fa-map-marker-alt',
            'showTechLogo': 'fa-code',
            'highlightSection': 'fa-compass',
            'showProjectDetails': 'fa-project-diagram'
        };
        var labelMap = {
            'showLocationImage': 'Fetching location...',
            'showTechLogo': 'Loading tech stack...',
            'highlightSection': 'Finding section...',
            'showProjectDetails': 'Loading project...'
        };
        thinkDiv.innerHTML = '<div class="chat-avatar"><i class="fas fa-cog fa-spin"></i></div>' +
            '<div class="chat-bubble tool-thinking-bubble"><i class="fas ' + (iconMap[toolName] || 'fa-cog') + '"></i> <span>' + (labelMap[toolName] || 'Processing...') + '</span></div>';
        container.appendChild(thinkDiv);
        container.scrollTop = container.scrollHeight;
        return thinkDiv;
    }

    // ========== HANDLE SEND ==========
    async function handleSend(input, messagesContainer, chatType, suggestionsEl) {
        var text = input.value.trim();
        if (!text) return;
        if (suggestionsEl) suggestionsEl.style.display = 'none';
        createMessage(text, 'user', messagesContainer);
        input.value = '';
        // AIAvatar references removed (was unused)
        var typingEl = showTyping(messagesContainer);

        var response = await sendToBackend(text, chatType);
        typingEl.remove();

        // Execute tool calls first (visual cards before text)
        if (response.toolCalls && response.toolCalls.length > 0) {
            // Show persistent tool-call transparency log
            var logDiv = createToolLog(response.toolCalls, messagesContainer);

            for (var i = 0; i < response.toolCalls.length; i++) {
                var thinkEl = showToolThinking(response.toolCalls[i].name, messagesContainer);
                await new Promise(function(r) { setTimeout(r, 400); });
                thinkEl.remove();
                executeToolCall(response.toolCalls[i], messagesContainer);
            }
        }

        createMessage(response.text, 'bot', messagesContainer);
        // AIAvatar references removed (was unused)
    }

    // ========== TOOL TRANSPARENCY LOG ==========
    function createToolLog(toolCalls, container) {
        var logDiv = document.createElement('div');
        logDiv.className = 'chat-message bot tool-log';
        var avatarDiv = document.createElement('div');
        avatarDiv.className = 'chat-avatar';
        avatarDiv.innerHTML = '<i class="fas fa-terminal"></i>';
        var contentDiv = document.createElement('div');
        contentDiv.className = 'chat-bubble tool-log-bubble';

        var header = '<div class="tool-log-header"><i class="fas fa-project-diagram"></i> Function Calls <span class="tool-log-count">' + toolCalls.length + ' tool' + (toolCalls.length > 1 ? 's' : '') + '</span></div>';
        var entries = '<div class="tool-log-entries">';

        toolCalls.forEach(function(tc) {
            var argsStr = '';
            if (tc.args) {
                var keys = Object.keys(tc.args);
                argsStr = keys.map(function(k) {
                    var val = tc.args[k];
                    if (Array.isArray(val)) return k + ': [' + val.join(', ') + ']';
                    return k + ': "' + val + '"';
                }).join(', ');
            }
            entries += '<div class="tool-log-entry"><code>' + tc.name + '</code>(<span class="tool-log-args">' + argsStr + '</span>)</div>';
        });

        entries += '</div>';
        contentDiv.innerHTML = header + entries;
        logDiv.appendChild(avatarDiv);
        logDiv.appendChild(contentDiv);
        container.appendChild(logDiv);
        requestAnimationFrame(function() { container.scrollTop = container.scrollHeight; });
        return logDiv;
    }

    // ========== INIT SECTION CHAT ==========
    function initSectionChat() {
        var input = document.getElementById('sectionChatInput');
        var sendBtn = document.getElementById('sectionChatSend');
        var messages = document.getElementById('sectionChatMessages');
        var suggestions = document.getElementById('sectionChatSuggestions');
        if (!input || !sendBtn || !messages) return;

        if (suggestions) {
            SUGGESTIONS.forEach(function(s) {
                var chip = document.createElement('button');
                chip.className = 'suggestion-chip';
                chip.innerHTML = '<i class="' + s.icon + '"></i> ' + s.text;
                chip.addEventListener('click', function() {
                    input.value = s.text;
                    handleSend(input, messages, 'section', suggestions);
                });
                suggestions.appendChild(chip);
            });
        }

        sendBtn.addEventListener('click', function() { handleSend(input, messages, 'section', suggestions); });
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(input, messages, 'section', suggestions); }
        });

        setTimeout(function() {
            createMessage("Hi there! 👋 I'm Klinten's AI assistant, powered by Gemini with function calling. I can show you location images, tech logos, navigate to sections, and pull up project details. Try asking me something!", 'bot', messages);
        }, 500);
    }

    // ========== INIT FLOATING CHAT ==========
    function initFloatingChat() {
        var fab = document.getElementById('aiChatFab');
        var widget = document.getElementById('floatingChatWidget');
        var close = document.getElementById('floatingChatClose');
        var input = document.getElementById('floatingChatInput');
        var sendBtn = document.getElementById('floatingChatSend');
        var messages = document.getElementById('floatingChatMessages');
        var suggestions = document.getElementById('floatingChatSuggestions');
        if (!fab || !widget) return;

        var chatOpen = false;
        var initialized = false;

        // Toggle chat on FAB click
        fab.addEventListener('click', function() {
            chatOpen = !chatOpen;
            widget.classList.toggle('open', chatOpen);
            fab.classList.toggle('active', chatOpen);
            if (chatOpen && !initialized) { initialized = true; initFloatingChatContent(); }
            if (chatOpen && input) setTimeout(function() { input.focus(); }, 300);
        });

        if (close) {
            close.addEventListener('click', function() {
                chatOpen = false;
                widget.classList.remove('open');
                fab.classList.remove('active');
            });
        }

        function initFloatingChatContent() {
            if (suggestions) {
                SUGGESTIONS.slice(0, 4).forEach(function(s) {
                    var chip = document.createElement('button');
                    chip.className = 'suggestion-chip';
                    chip.innerHTML = '<i class="' + s.icon + '"></i> ' + s.text;
                    chip.addEventListener('click', function() {
                        input.value = s.text;
                        handleSend(input, messages, 'floating', suggestions);
                    });
                    suggestions.appendChild(chip);
                });
            }

            sendBtn.addEventListener('click', function() { handleSend(input, messages, 'floating', suggestions); });
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(input, messages, 'floating', suggestions); }
            });

            createMessage("Hi! 👋 I'm Klinten's AI assistant — ask me anything about his work!", 'bot', messages);
        }
    }

    function init() { initSectionChat(); initFloatingChat(); }
    return { init };
})();

document.addEventListener('DOMContentLoaded', function() { AIChat.init(); });
