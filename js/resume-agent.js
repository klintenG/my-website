/* ============================================
   RESUME TAILORING AGENT
   Agentic AI — Autonomous multi-step analysis
   ============================================ */

const ResumeAgent = (() => {

    const GEMINI_API_KEY = 'AIzaSyBn3SZVSqFUOqapLAo7m9A_ysLeijPmZtQ';
    const GEMINI_MODEL = 'gemini-2.5-flash';
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    // ========== AGENT STEPS ==========
    const AGENT_STEPS = [
        { id: 'parse', icon: 'fa-file-alt', label: 'Parsing job description...', detail: 'Extracting requirements, skills, and qualifications' },
        { id: 'match', icon: 'fa-crosshairs', label: 'Matching skills & experience...', detail: 'Comparing JD requirements against profile' },
        { id: 'score', icon: 'fa-chart-bar', label: 'Calculating fit score...', detail: 'Scoring alignment across all dimensions' },
        { id: 'tailor', icon: 'fa-magic', label: 'Generating tailored summary...', detail: 'Creating customized pitch for this role' },
    ];

    // ========== SYSTEM PROMPT FOR TAILORING ==========
    function getTailoringPrompt() {
        return `You are a resume tailoring AI agent. You will be given a job description (JD) and a candidate's professional profile. Your job is to perform a multi-step autonomous analysis and return a structured JSON response.

CANDIDATE PROFILE:
${buildProfileContext()}

INSTRUCTIONS:
Analyze the job description against the candidate's profile and return a JSON response with this EXACT structure (no markdown, no code fences, pure JSON):

{
    "fitScore": <number 0-100>,
    "fitLevel": "<Excellent Fit|Strong Fit|Good Fit|Moderate Fit|Needs Development>",
    "roleSummary": "<1-2 sentence summary of what the role is looking for>",
    "matchedSkills": [
        { "skill": "<skill name>", "strength": "<strong|moderate|basic>", "evidence": "<brief evidence from profile>" }
    ],
    "matchedExperience": [
        { "requirement": "<JD requirement>", "match": "<how the candidate meets it>", "relevance": "<high|medium|low>" }
    ],
    "gaps": [
        { "requirement": "<missing skill/requirement from JD>", "suggestion": "<how candidate could address it>" }
    ],
    "tailoredSummary": "<3-4 sentence customized professional summary tailored specifically for this JD>",
    "talkingPoints": [
        "<specific talking point for interview>"
    ],
    "overallAnalysis": "<2-3 sentence overall assessment>"
}

IMPORTANT:
- Be honest about the fit score. Don't inflate.
- If something is not in the profile, mark it as a gap.
- The tailored summary should reframe existing experience to match the JD's language.
- Return ONLY valid JSON. No markdown, no explanation, no code fences.
- Keep all string values on a single line — NO newlines inside JSON string values.
- Limit matchedSkills to top 6, matchedExperience to top 4, gaps to top 4, talkingPoints to top 4.
- Keep evidence and match descriptions SHORT (under 15 words each).`;
    }

    // ========== CALL GEMINI ==========
    async function analyzeJD(jobDescription) {
        const requestBody = {
            system_instruction: {
                parts: [{ text: getTailoringPrompt() }]
            },
            contents: [{
                role: 'user',
                parts: [{ text: `Analyze this job description:\n\n${jobDescription}` }]
            }],
            generationConfig: {
                temperature: 0.3,
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

        // Clean up markdown fences and whitespace
        text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

        // Fix common JSON issues from LLM output
        // Remove any trailing commas before } or ]
        text = text.replace(/,\s*([}\]])/g, '$1');
        // Fix unescaped newlines inside string values
        text = text.replace(/(?<=:\s*"[^"]*)\n([^"]*")/g, '\\n$1');

        try {
            return JSON.parse(text);
        } catch (e) {
            // If direct parse fails, try to extract JSON object from the text
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                // Aggressively clean the extracted JSON
                let cleaned = jsonMatch[0];
                // Replace actual newlines inside strings with spaces
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
        AGENT_STEPS.forEach((step, i) => {
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
        const scoreColor = result.fitScore >= 80 ? '#22c55e' : result.fitScore >= 60 ? '#c9a84c' : result.fitScore >= 40 ? '#f59e0b' : '#ef4444';
        const scoreGradient = result.fitScore >= 80 ? 'linear-gradient(135deg, #22c55e, #16a34a)' : result.fitScore >= 60 ? 'linear-gradient(135deg, #c9a84c, #b8962f)' : result.fitScore >= 40 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #ef4444, #dc2626)';

        let html = '';

        // Score Card
        html += `
            <div class="agent-result-card score-card">
                <div class="score-circle" style="--score-color: ${scoreColor}; --score-gradient: ${scoreGradient}">
                    <svg viewBox="0 0 120 120">
                        <circle class="score-bg" cx="60" cy="60" r="54" />
                        <circle class="score-fill" cx="60" cy="60" r="54" style="stroke-dasharray: ${(result.fitScore / 100) * 339.292} 339.292; stroke: ${scoreColor}" />
                    </svg>
                    <div class="score-number">${result.fitScore}%</div>
                </div>
                <div class="score-info">
                    <h3 class="score-level" style="color: ${scoreColor}">${result.fitLevel}</h3>
                    <p class="score-summary">${result.roleSummary}</p>
                </div>
            </div>
        `;

        // Matched Skills
        if (result.matchedSkills && result.matchedSkills.length > 0) {
            html += `
                <div class="agent-result-card">
                    <h4><i class="fas fa-check-circle" style="color: #22c55e"></i> Matched Skills</h4>
                    <div class="matched-skills-list">
            `;
            result.matchedSkills.forEach(skill => {
                const strengthClass = skill.strength === 'strong' ? 'strength-strong' : skill.strength === 'moderate' ? 'strength-moderate' : 'strength-basic';
                html += `
                    <div class="matched-skill-item">
                        <div class="matched-skill-header">
                            <span class="matched-skill-name">${skill.skill}</span>
                            <span class="matched-skill-strength ${strengthClass}">${skill.strength}</span>
                        </div>
                        <p class="matched-skill-evidence">${skill.evidence}</p>
                    </div>
                `;
            });
            html += '</div></div>';
        }

        // Matched Experience
        if (result.matchedExperience && result.matchedExperience.length > 0) {
            html += `
                <div class="agent-result-card">
                    <h4><i class="fas fa-briefcase" style="color: var(--accent)"></i> Experience Match</h4>
                    <div class="experience-match-list">
            `;
            result.matchedExperience.forEach(item => {
                const relClass = item.relevance === 'high' ? 'rel-high' : item.relevance === 'medium' ? 'rel-medium' : 'rel-low';
                html += `
                    <div class="experience-match-item">
                        <div class="exp-requirement"><strong>Requires:</strong> ${item.requirement}</div>
                        <div class="exp-match"><strong>Match:</strong> ${item.match}</div>
                        <span class="exp-relevance ${relClass}">${item.relevance} relevance</span>
                    </div>
                `;
            });
            html += '</div></div>';
        }

        // Gaps
        if (result.gaps && result.gaps.length > 0) {
            html += `
                <div class="agent-result-card">
                    <h4><i class="fas fa-exclamation-triangle" style="color: #f59e0b"></i> Skill Gaps</h4>
                    <div class="gaps-list">
            `;
            result.gaps.forEach(gap => {
                html += `
                    <div class="gap-item">
                        <div class="gap-requirement"><i class="fas fa-times-circle"></i> ${gap.requirement}</div>
                        <div class="gap-suggestion"><i class="fas fa-lightbulb"></i> ${gap.suggestion}</div>
                    </div>
                `;
            });
            html += '</div></div>';
        }

        // Tailored Summary
        html += `
            <div class="agent-result-card tailored-card">
                <h4><i class="fas fa-magic" style="color: var(--accent)"></i> Tailored Summary for This Role</h4>
                <p class="tailored-summary">${result.tailoredSummary}</p>
                <button class="copy-summary-btn" onclick="ResumeAgent.copySummary(this)" data-summary="${result.tailoredSummary.replace(/"/g, '&quot;')}">
                    <i class="fas fa-copy"></i> Copy Summary
                </button>
            </div>
        `;

        // Talking Points
        if (result.talkingPoints && result.talkingPoints.length > 0) {
            html += `
                <div class="agent-result-card">
                    <h4><i class="fas fa-comments" style="color: var(--accent)"></i> Interview Talking Points</h4>
                    <ul class="talking-points">
            `;
            result.talkingPoints.forEach(point => {
                html += `<li>${point}</li>`;
            });
            html += '</ul></div>';
        }

        // Overall Analysis
        html += `
            <div class="agent-result-card overall-card">
                <h4><i class="fas fa-clipboard-check" style="color: var(--accent)"></i> Overall Analysis</h4>
                <p>${result.overallAnalysis}</p>
            </div>
        `;

        container.innerHTML = html;

        // Animate score circle
        setTimeout(() => {
            const scoreFill = container.querySelector('.score-fill');
            if (scoreFill) {
                const targetDash = (result.fitScore / 100) * 339.292;
                scoreFill.style.strokeDasharray = `${targetDash} 339.292`;
            }
        }, 100);
    }

    // ========== MAIN ANALYZE FUNCTION ==========
    async function analyze() {
        const textarea = document.getElementById('jdInput');
        const analyzeBtn = document.getElementById('analyzeBtn');
        const stepsContainer = document.getElementById('agentSteps');
        const resultsContainer = document.getElementById('agentResults');
        const outputSection = document.getElementById('agentOutput');

        if (!textarea || !textarea.value.trim()) {
            textarea?.classList.add('shake');
            setTimeout(() => textarea?.classList.remove('shake'), 500);
            return;
        }

        const jd = textarea.value.trim();

        // Show output section
        outputSection.style.display = 'block';
        resultsContainer.innerHTML = '';
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = '<i class="fas fa-cog fa-spin"></i> Agent Working...';

        try {
            // Animate through steps
            for (let i = 0; i < AGENT_STEPS.length; i++) {
                renderStepProgress(stepsContainer, i);
                await new Promise(r => setTimeout(r, i === 0 ? 500 : 800));
            }

            // Make the actual API call
            const result = await analyzeJD(jd);

            // Mark all steps complete
            renderStepProgress(stepsContainer, AGENT_STEPS.length);

            // Render results
            renderResults(resultsContainer, result);

        } catch (error) {
            console.error('Resume Agent error:', error);
            resultsContainer.innerHTML = `
                <div class="agent-result-card error-card">
                    <h4><i class="fas fa-exclamation-circle" style="color: #ef4444"></i> Analysis Error</h4>
                    <p>Sorry, I couldn't analyze this job description. Please make sure you've pasted a complete JD and try again.</p>
                    <p class="error-detail">${error.message}</p>
                </div>
            `;
        } finally {
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = '<i class="fas fa-rocket"></i> Analyze Fit';
        }
    }

    // ========== COPY SUMMARY ==========
    function copySummary(btn) {
        const summary = btn.getAttribute('data-summary');
        navigator.clipboard.writeText(summary).then(() => {
            btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-copy"></i> Copy Summary';
            }, 2000);
        });
    }

    // ========== CLEAR ==========
    function clearAll() {
        const textarea = document.getElementById('jdInput');
        const outputSection = document.getElementById('agentOutput');
        if (textarea) textarea.value = '';
        if (outputSection) outputSection.style.display = 'none';
    }

    return { analyze, copySummary, clearAll };
})();
