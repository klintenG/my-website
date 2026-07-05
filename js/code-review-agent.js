/* ============================================
   CODE REVIEW AGENT
   AI-Powered structured code review using
   Gemini with enforced JSON output schema.
   
   Architecture:
   User pastes code → Agent detects language →
   Sends to Gemini with constraint prompt →
   Enforces JSON schema → Renders visual results
   
   This demonstrates:
   - Structured output enforcement
   - Constraint-bounded AI (only reviews code)
   - Multi-dimensional analysis (not just "looks good")
   - Production-grade error handling
   ============================================ */

const CodeReviewAgent = (() => {

    // API key is kept server-side via proxy. See /server/server.js
    // Local dev: run "cd server && npm start" → http://localhost:3001
    const API_URL = 'http://localhost:3001/api/chat';

    // ========== LANGUAGE DETECTION (heuristic) ==========
    const LANGUAGE_PATTERNS = [
        { lang: 'JavaScript', patterns: [/\bconst\b.*=/, /\blet\b.*=/, /=>\s*{/, /function\s+\w+/, /console\.log/, /document\.\w+/, /require\(/, /import\s+.*from/, /\.addEventListener/] },
        { lang: 'TypeScript', patterns: [/:\s*(string|number|boolean|void|any)\b/, /interface\s+\w+/, /type\s+\w+\s*=/, /<\w+>/, /as\s+\w+/] },
        { lang: 'Python', patterns: [/def\s+\w+\(/, /class\s+\w+:/, /import\s+\w+/, /from\s+\w+\s+import/, /print\(/, /self\./, /__init__/, /if\s+__name__/] },
        { lang: 'Java', patterns: [/public\s+(static\s+)?void\s+main/, /System\.out\.print/, /class\s+\w+\s*{/, /private\s+\w+/, /public\s+\w+/, /@Override/, /new\s+\w+\(/, /import\s+java\./] },
        { lang: 'HTML', patterns: [/<html/, /<div/, /<\/\w+>/, /class="/, /<!DOCTYPE/] },
        { lang: 'CSS', patterns: [/\{[\s\S]*?:[\s\S]*?;[\s\S]*?\}/, /@media/, /\.[\w-]+\s*\{/, /#[\w-]+\s*\{/] },
        { lang: 'SQL', patterns: [/SELECT\s+/i, /FROM\s+/i, /WHERE\s+/i, /INSERT\s+INTO/i, /CREATE\s+TABLE/i] },
    ];

    function detectLanguage(code) {
        let best = { lang: 'Unknown', score: 0 };
        LANGUAGE_PATTERNS.forEach(({ lang, patterns }) => {
            let score = 0;
            patterns.forEach(p => { if (p.test(code)) score++; });
            if (score > best.score) best = { lang, score };
        });
        return best.score >= 2 ? best.lang : 'Unknown';
    }

    // ========== REVIEW STAGES ==========
    const REVIEW_STEPS = [
        { id: 'detect', icon: 'fa-search', label: 'Detecting language...', detail: 'Analyzing code structure to identify language' },
        { id: 'analyze', icon: 'fa-brain', label: 'AI reviewing code...', detail: 'Gemini is analyzing code quality, patterns, and potential issues' },
        { id: 'render', icon: 'fa-chart-bar', label: 'Rendering review...', detail: 'Parsing structured JSON response and building visual output' },
    ];

    // ========== SYSTEM PROMPT ==========
    function getReviewPrompt(language) {
        return `You are a strict, senior code reviewer. You will be given a code snippet (language: ${language}). Analyze it and return a JSON response.

CONSTRAINT: You ONLY review code. If the input is not code, return:
{"error": "This doesn't appear to be code. Please paste a code snippet."}

INSTRUCTIONS:
Analyze the code across multiple dimensions and return this EXACT JSON structure (no markdown, no code fences, pure JSON):

{
    "language": "<detected language>",
    "overallScore": <number 0-100>,
    "verdict": "<Excellent|Good|Needs Improvement|Poor>",
    "summary": "<1-2 sentence overall assessment>",
    "dimensions": [
        {
            "name": "<dimension name>",
            "score": <number 0-100>,
            "assessment": "<1 sentence assessment>"
        }
    ],
    "issues": [
        {
            "severity": "<critical|warning|suggestion>",
            "line": "<approximate line reference or 'general'>",
            "issue": "<what's wrong>",
            "fix": "<how to fix it>"
        }
    ],
    "strengths": [
        "<specific thing done well>"
    ],
    "refactoredSnippet": "<if there's a clear improvement, show a short refactored version (max 10 lines). Otherwise empty string.>"
}

DIMENSIONS to evaluate (always include all 5):
1. Readability — naming, formatting, clarity
2. Correctness — logic errors, edge cases, bugs
3. Performance — inefficiencies, unnecessary complexity
4. Security — vulnerabilities, unsafe patterns
5. Best Practices — patterns, conventions, modern idioms

RULES:
- Be specific. Don't say "code looks good" — name what's good/bad.
- Score honestly. Most code is 40-75. Reserve 80+ for genuinely clean code.
- Limit issues to top 5 most important.
- Limit strengths to top 3.
- Return ONLY valid JSON. No markdown, no explanation.
- Keep all string values on a single line.
- If code is very short (under 5 lines), still analyze what you can but note the limited scope.`;
    }

    // ========== CALL GEMINI ==========
    async function reviewCode(code, language) {
        const requestBody = {
            system_instruction: {
                parts: [{ text: getReviewPrompt(language) }]
            },
            contents: [{
                role: 'user',
                parts: [{ text: `Review this ${language} code:\n\n${code}` }]
            }],
            generationConfig: {
                temperature: 0.2,
                topP: 0.8,
                topK: 30,
                maxOutputTokens: 4096
            }
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Clean up LLM output
        text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
        text = text.replace(/,\s*([}\]])/g, '$1');

        try {
            return JSON.parse(text);
        } catch (e) {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                let cleaned = jsonMatch[0];
                cleaned = cleaned.replace(/"([^"]*?)"/g, (match) => {
                    return match.replace(/\n/g, ' ').replace(/\r/g, '');
                });
                cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');
                return JSON.parse(cleaned);
            }
            throw new Error('Could not parse AI response as JSON');
        }
    }

    // ========== RENDER FUNCTIONS ==========

    function renderStepProgress(container, activeStep) {
        let html = '<div class="agent-steps">';
        REVIEW_STEPS.forEach((step, i) => {
            let status = 'pending';
            if (i < activeStep) status = 'completed';
            else if (i === activeStep) status = 'active';

            html += `
                <div class="agent-step ${status}">
                    <div class="agent-step-icon">
                        ${status === 'completed' ? '<i class="fas fa-check"></i>' : status === 'active' ? '<i class="fas fa-' + step.icon + ' fa-spin"></i>' : '<i class="fas fa-' + step.icon + '"></i>'}
                    </div>
                    <div class="agent-step-info">
                        <span class="agent-step-label">${step.label}</span>
                        <span class="agent-step-detail">${step.detail}</span>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    }

    function renderResults(container, result) {
        // Handle non-code error
        if (result.error) {
            container.innerHTML = `
                <div class="agent-result-card error-card">
                    <h4><i class="fas fa-exclamation-circle" style="color: #ef4444"></i> Not Code</h4>
                    <p>${result.error}</p>
                </div>
            `;
            return;
        }

        const score = result.overallScore || 0;
        const scoreColor = score >= 80 ? '#22c55e' : score >= 60 ? '#c9a84c' : score >= 40 ? '#f59e0b' : '#ef4444';

        let html = '';

        // Score Card
        html += `
            <div class="agent-result-card score-card">
                <div class="score-circle" style="--score-color: ${scoreColor}">
                    <svg viewBox="0 0 120 120">
                        <circle class="score-bg" cx="60" cy="60" r="54" />
                        <circle class="score-fill" cx="60" cy="60" r="54" style="stroke-dasharray: ${(score / 100) * 339.292} 339.292; stroke: ${scoreColor}" />
                    </svg>
                    <div class="score-number">${score}%</div>
                </div>
                <div class="score-info">
                    <h3 class="score-level" style="color: ${scoreColor}">${result.verdict}</h3>
                    <p class="score-summary">${result.summary}</p>
                    <span class="review-lang-badge"><i class="fas fa-code"></i> ${result.language}</span>
                </div>
            </div>
        `;

        // Dimension Scores
        if (result.dimensions && result.dimensions.length > 0) {
            html += '<div class="agent-result-card"><h4><i class="fas fa-chart-bar" style="color: var(--primary)"></i> Quality Dimensions</h4><div class="review-dimensions">';
            result.dimensions.forEach(dim => {
                const dimColor = dim.score >= 80 ? '#22c55e' : dim.score >= 60 ? '#c9a84c' : dim.score >= 40 ? '#f59e0b' : '#ef4444';
                html += `
                    <div class="review-dimension">
                        <div class="dim-header">
                            <span class="dim-name">${dim.name}</span>
                            <span class="dim-score" style="color: ${dimColor}">${dim.score}/100</span>
                        </div>
                        <div class="dim-bar">
                            <div class="dim-fill" style="width: ${dim.score}%; background: ${dimColor}"></div>
                        </div>
                        <p class="dim-assessment">${dim.assessment}</p>
                    </div>
                `;
            });
            html += '</div></div>';
        }

        // Issues
        if (result.issues && result.issues.length > 0) {
            html += '<div class="agent-result-card"><h4><i class="fas fa-bug" style="color: #f59e0b"></i> Issues Found</h4><div class="review-issues">';
            result.issues.forEach(issue => {
                const sevClass = issue.severity === 'critical' ? 'sev-critical' : issue.severity === 'warning' ? 'sev-warning' : 'sev-suggestion';
                const sevIcon = issue.severity === 'critical' ? 'fa-times-circle' : issue.severity === 'warning' ? 'fa-exclamation-triangle' : 'fa-lightbulb';
                html += `
                    <div class="review-issue ${sevClass}">
                        <div class="issue-header">
                            <span class="issue-severity"><i class="fas ${sevIcon}"></i> ${issue.severity}</span>
                            <span class="issue-line">${issue.line !== 'general' ? 'Line ' + issue.line : 'General'}</span>
                        </div>
                        <p class="issue-desc">${issue.issue}</p>
                        <p class="issue-fix"><i class="fas fa-wrench"></i> ${issue.fix}</p>
                    </div>
                `;
            });
            html += '</div></div>';
        }

        // Strengths
        if (result.strengths && result.strengths.length > 0) {
            html += '<div class="agent-result-card"><h4><i class="fas fa-thumbs-up" style="color: #22c55e"></i> Strengths</h4><ul class="review-strengths">';
            result.strengths.forEach(s => {
                html += `<li><i class="fas fa-check"></i> ${s}</li>`;
            });
            html += '</ul></div>';
        }

        // Refactored snippet
        if (result.refactoredSnippet && result.refactoredSnippet.trim()) {
            html += `
                <div class="agent-result-card">
                    <h4><i class="fas fa-magic" style="color: var(--primary)"></i> Suggested Refactor</h4>
                    <pre class="review-refactored"><code>${escapeHtml(result.refactoredSnippet)}</code></pre>
                </div>
            `;
        }

        container.innerHTML = html;

        // Animate score circle
        setTimeout(() => {
            const scoreFill = container.querySelector('.score-fill');
            if (scoreFill) {
                const targetDash = (score / 100) * 339.292;
                scoreFill.style.strokeDasharray = `${targetDash} 339.292`;
            }
        }, 100);

        // Animate dimension bars
        setTimeout(() => {
            container.querySelectorAll('.dim-fill').forEach(bar => {
                bar.style.transition = 'width 0.8s ease-out';
            });
        }, 200);
    }

    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // ========== MAIN REVIEW FUNCTION ==========
    async function review() {
        const textarea = document.getElementById('codeInput');
        const reviewBtn = document.getElementById('reviewBtn');
        const stepsContainer = document.getElementById('reviewSteps');
        const resultsContainer = document.getElementById('reviewResults');
        const outputSection = document.getElementById('reviewOutput');
        const langBadge = document.getElementById('detectedLang');

        if (!textarea || !textarea.value.trim()) {
            textarea?.classList.add('shake');
            setTimeout(() => textarea?.classList.remove('shake'), 500);
            return;
        }

        const code = textarea.value.trim();

        // Show output section
        outputSection.style.display = 'block';
        resultsContainer.innerHTML = '';
        reviewBtn.disabled = true;
        reviewBtn.innerHTML = '<i class="fas fa-cog fa-spin"></i> Reviewing...';

        try {
            // Step 1: Detect language
            renderStepProgress(stepsContainer, 0);
            await new Promise(r => setTimeout(r, 300));
            const language = detectLanguage(code);
            if (langBadge) {
                langBadge.textContent = language;
                langBadge.style.display = 'inline-block';
            }

            // Step 2: AI review
            renderStepProgress(stepsContainer, 1);
            const result = await reviewCode(code, language);

            // Step 3: Render
            renderStepProgress(stepsContainer, 2);
            await new Promise(r => setTimeout(r, 200));

            // Mark all steps complete
            renderStepProgress(stepsContainer, REVIEW_STEPS.length);

            // Render results
            renderResults(resultsContainer, result);

        } catch (error) {
            console.error('Code Review Agent error:', error);
            resultsContainer.innerHTML = `
                <div class="agent-result-card error-card">
                    <h4><i class="fas fa-exclamation-circle" style="color: #ef4444"></i> Review Error</h4>
                    <p>Sorry, I couldn't review this code. Please try again.</p>
                    <p class="error-detail">${error.message}</p>
                </div>
            `;
        } finally {
            reviewBtn.disabled = false;
            reviewBtn.innerHTML = '<i class="fas fa-search"></i> Review Code';
        }
    }

    // ========== LOAD SAMPLE ==========
    function loadSample() {
        const textarea = document.getElementById('codeInput');
        if (!textarea) return;
        textarea.value = `function fetchUserData(id) {
  var data = null;
  fetch('/api/users/' + id)
    .then(function(res) { return res.json(); })
    .then(function(json) {
      data = json;
      document.getElementById('user-name').innerHTML = data.name;
      document.getElementById('user-email').innerHTML = data.email;
      if (data.role == 'admin') {
        document.getElementById('admin-panel').style.display = 'block';
      }
    });
  return data;
}`;
    }

    // ========== CLEAR ==========
    function clearAll() {
        const textarea = document.getElementById('codeInput');
        const outputSection = document.getElementById('reviewOutput');
        const langBadge = document.getElementById('detectedLang');
        if (textarea) textarea.value = '';
        if (outputSection) outputSection.style.display = 'none';
        if (langBadge) langBadge.style.display = 'none';
    }

    return { review, loadSample, clearAll };
})();
