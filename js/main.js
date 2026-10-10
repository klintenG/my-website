/* ============================================
   KLINTEN GUDURU — RESUME WEBSITE
   JavaScript — Enhanced Interactions & Animations
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ========== SCROLL PROGRESS BAR ==========
    const scrollProgress = document.getElementById('scrollProgress');

    function updateScrollProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        if (scrollProgress) scrollProgress.style.width = (Number.isFinite(scrollPercent) ? scrollPercent : 0) + '%';
    }

    // ========== THEME TOGGLE ==========
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (themeToggle) updateThemeIcon(savedTheme);

    themeToggle?.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        updateThemeIcon(next);
    });

    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    // ========== NAVBAR SCROLL ==========
    const navbar = document.getElementById('navbar');
    const backToTop = document.getElementById('backToTop');
    const sections = document.querySelectorAll('.section[id], .portfolio-section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function handleScroll() {
        const scrollY = window.scrollY;

        // Navbar background
        navbar?.classList.toggle('scrolled', scrollY > 50);

        // Back to top
        backToTop?.classList.toggle('visible', scrollY > 500);

        // Active nav link
        let currentSection = '';
        sections.forEach(section => {
            const top = section.offsetTop - 100;
            const bottom = top + section.offsetHeight;
            if (scrollY >= top && scrollY < bottom) {
                currentSection = section.getAttribute('id');
            }
        });

        // On pages with dedicated routes, only update active state if section anchors exist
        const hasSectionAnchors = Array.from(navLinks).some(link => (link.getAttribute('href') || '').startsWith('#'));
        if (hasSectionAnchors && currentSection) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSection}`) {
                    link.classList.add('active');
                }
            });
        }

        // Update scroll progress
        updateScrollProgress();
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Back to top click
    backToTop?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ========== MOBILE MENU ==========
    const hamburger = document.getElementById('hamburger');
    const navLinksContainer = document.getElementById('navLinks');

    if (hamburger && navLinksContainer) {
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-controls', 'navLinks');

        function toggleMenu(open) {
            const shouldOpen = open !== undefined ? open : !navLinksContainer.classList.contains('active');
            hamburger.classList.toggle('active', shouldOpen);
            navLinksContainer.classList.toggle('active', shouldOpen);
            hamburger.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
            document.body.style.overflow = shouldOpen ? 'hidden' : '';
        }

        hamburger.addEventListener('click', () => toggleMenu());

        // Close mobile menu on link click
        navLinksContainer.querySelectorAll('.nav-link, a').forEach(link => {
            link.addEventListener('click', () => {
                toggleMenu(false);
            });
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinksContainer.classList.contains('active')) {
                toggleMenu(false);
                hamburger.focus();
            }
        });
    }

    // ========== SCROLL ANIMATIONS (Enhanced with stagger) ==========
    const observerOptions = {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Animate stat counters
                const statNumbers = entry.target.querySelectorAll('.stat-number');
                statNumbers.forEach(animateCounter);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });

    // ========== COUNTER ANIMATION ==========
    const animatedCounters = new Set();

    function animateCounter(element) {
        if (animatedCounters.has(element)) return;
        animatedCounters.add(element);

        const target = parseInt(element.getAttribute('data-count'), 10);
        const duration = 1800;
        const start = performance.now();

        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out quart for smoother feel
            const eased = 1 - Math.pow(1 - progress, 4);
            element.textContent = Math.round(target * eased);

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    // ========== AI SHOWCASE TABS ==========
    const showcaseTabs = document.querySelectorAll('.showcase-tab');
    const showcasePanels = document.querySelectorAll('.showcase-panel');

    showcaseTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');

            // Update active tab
            showcaseTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update active panel
            showcasePanels.forEach(p => p.classList.remove('active'));
            const panel = document.getElementById('tab-' + target);
            if (panel) panel.classList.add('active');
        });
    });

    // ========== PROJECT FILTERS ==========
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            projectCards.forEach((card, index) => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || (category || '').split(',').includes(filter)) {
                    card.classList.remove('hidden');
                    card.style.animation = 'none';
                    card.offsetHeight; // Trigger reflow
                    card.style.animation = `fadeInUp 0.5s ease ${index * 0.08}s forwards`;
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // Direct email is available in HTML even when JavaScript is disabled.
    const copyEmail = document.getElementById('copyEmail');
    copyEmail?.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText('klintenguduru@gmail.com');
            copyEmail.textContent = 'Email copied';
        } catch {
            copyEmail.textContent = 'Select the email address above to copy it';
        }
    });

    // Do not invite visitors to enter text when the public AI proxy is absent.
    const labAvailability = document.getElementById('labAvailability');
    if (labAvailability && typeof AIClient !== 'undefined') {
        const controls = ['sectionChatInput', 'sectionChatSend', 'jdInput', 'analyzeBtn', 'codeInput', 'reviewBtn'];
        controls.forEach(id => {
            const control = document.getElementById(id);
            if (control) control.disabled = true;
        });
        if (AIClient.isConfigured()) {
            // Only the local proxy exposes this read-only check. It never calls Gemini.
            const healthUrl = new URL('/health', SITE_CONFIG.api.apiUrl);
            fetch(healthUrl, { signal: AbortSignal.timeout(3000) })
                .then(response => response.ok ? response.json() : null)
                .then(health => {
                    if (health?.hasApiKey) {
                        controls.forEach(id => {
                            const control = document.getElementById(id);
                            if (control) control.disabled = false;
                        });
                        labAvailability.hidden = true;
                    }
                })
                .catch(() => {});
        }
    }

    // ========== SMOOTH SCROLL FOR ALL ANCHOR LINKS ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ========== CURSOR GLOW EFFECT (Hero Only) ==========
    const cursorGlow = document.getElementById('cursorGlow');
    const heroSection = document.getElementById('hero');

    if (cursorGlow && heroSection) {
        document.addEventListener('mousemove', (e) => {
            const heroRect = heroSection.getBoundingClientRect();
            const isInHero = (
                e.clientY >= heroRect.top &&
                e.clientY <= heroRect.bottom
            );

            if (isInHero) {
                cursorGlow.classList.add('active');
                cursorGlow.style.left = e.clientX + 'px';
                cursorGlow.style.top = e.clientY + 'px';
            } else {
                cursorGlow.classList.remove('active');
            }
        });
    }

    // ========== CENTRALIZED CONFIG INJECTION ==========
    if (window.SITE_CONFIG) {
        // Sync stats into any data-stat elements
        document.querySelectorAll('[data-stat]').forEach(el => {
            const key = el.getAttribute('data-stat');
            if (window.SITE_CONFIG.stats && window.SITE_CONFIG.stats[key]) {
                const countVal = parseInt(window.SITE_CONFIG.stats[key], 10);
                if (!isNaN(countVal)) {
                    el.setAttribute('data-count', countVal);
                }
            }
        });

        // Sync links
        document.querySelectorAll('[data-link]').forEach(el => {
            const linkKey = el.getAttribute('data-link');
            if (window.SITE_CONFIG.links && window.SITE_CONFIG.links[linkKey]) {
                el.setAttribute('href', window.SITE_CONFIG.links[linkKey]);
            }
        });

        // Sync resume download buttons
        document.querySelectorAll('[data-resume]').forEach(el => {
            if (window.SITE_CONFIG.links && window.SITE_CONFIG.links.resume) {
                el.setAttribute('href', window.SITE_CONFIG.links.resume);
            }
        });

        // A reachability probe cannot verify that video generation works.
        const herStatusEl = document.getElementById('projectHerStatus');
        if (herStatusEl) {
            herStatusEl.className = 'flagship-status checking';
            herStatusEl.textContent = 'External demo · availability varies';
        }

        // Refresh frame button
        const refreshFrameBtn = document.getElementById('refreshHerFrame');
        if (refreshFrameBtn) {
            refreshFrameBtn.addEventListener('click', () => {
                const frame = document.getElementById('projectHerFrame');
                if (frame) {
                    const originalSrc = frame.src;
                    frame.src = 'about:blank';
                    setTimeout(() => { frame.src = originalSrc; }, 100);
                }
            });
        }
    }

    // ========== ACCORDION TOGGLES ==========
    document.querySelectorAll('.accordion-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const targetBody = document.getElementById(targetId);
            if (targetBody) {
                const isOpen = targetBody.classList.contains('open');
                targetBody.classList.toggle('open', !isOpen);
                btn.classList.toggle('active', !isOpen);
                const textSpan = btn.querySelector('.toggle-text');
                if (textSpan) {
                    textSpan.textContent = isOpen ? 'View Architecture & Engineering Challenges' : 'Hide Architecture & Engineering Challenges';
                }
            }
        });
    });

    // ========== PROJECT HER NATIVE STUDIO CONTROLLER ==========
    const herPromptInput = document.getElementById('herPromptInput');
    const herCharCount = document.getElementById('herCharCount');
    const herBtnGenerate = document.getElementById('herBtnGenerate');
    const herBtnReset = document.getElementById('herBtnReset');
    const herStateIdle = document.getElementById('herStateIdle');
    const herStateProgress = document.getElementById('herStateProgress');
    const herStateCompleted = document.getElementById('herStateCompleted');
    const herProgressBar = document.getElementById('herPipelineProgressBar');
    const herStatusText = document.getElementById('herPipelineStatusText');
    const herElapsedTime = document.getElementById('herElapsedTime');
    const herLiveMessage = document.getElementById('herLiveStageMessage');
    const herVideoContainer = document.getElementById('herVideoFrameContainer');
    const herToastContainer = document.getElementById('herToastContainer');

    // Prompt character & word counter
    if (herPromptInput && herCharCount) {
        herPromptInput.addEventListener('input', function() {
            const text = this.value.trim();
            const words = text ? text.split(/\s+/).length : 0;
            herCharCount.textContent = `${words} words`;
        });
    }

    // Inspiration prompt chips
    const samplePrompts = {
        ai: "How Autonomous AI Agents and Reasoning Models Are Revolutionizing Software Engineering and Scientific Discovery in 2026",
        story: "Barnaby the little rabbit was not ready to go to sleep. He hopped through the quiet meadow asking the flowers, the fireflies, and the sleepy stream why the day had to end. The gentle moon smiled down through the silver clouds and whispered, 'The night is when the world rests, little one, so tomorrow can be full of brand new adventures.' Barnaby curled his long ears around his paws, listened to the soft lullaby of the breeze, and closed his eyes, drifting happily into dreamland.",
        link: "https://blog.google/technology/ai/google-gemini-next-generation-model-february-2024/"
    };

    document.querySelectorAll('.her-prompt-chip').forEach(chip => {
        chip.addEventListener('click', function() {
            const promptKey = this.getAttribute('data-her-prompt');
            if (samplePrompts[promptKey] && herPromptInput) {
                herPromptInput.value = samplePrompts[promptKey];
                herPromptInput.dispatchEvent(new Event('input'));
                herPromptInput.focus();
            }
        });
    });

    // Toast helper
    function showHerToast(msg, type = 'info') {
        if (!herToastContainer) return;
        const toast = document.createElement('div');
        toast.className = `her-toast ${type}`;
        const icon = type === 'success' ? 'fa-check-circle text-success' :
                     type === 'error' ? 'fa-exclamation-triangle text-danger' :
                     'fa-info-circle text-warning';
        toast.innerHTML = `<i class="fas ${icon}"></i> <span>${msg}</span>`;
        herToastContainer.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // Reset studio state
    function resetHerStudio() {
        if (herStateIdle) herStateIdle.style.display = 'block';
        if (herStateProgress) herStateProgress.style.display = 'none';
        if (herStateCompleted) herStateCompleted.style.display = 'none';
        if (herBtnGenerate) herBtnGenerate.disabled = false;
        
        const activePlayer = document.getElementById('herVideoPlayer');
        if (activePlayer) {
            activePlayer.pause();
            activePlayer.removeAttribute('src');
            activePlayer.load();
        }
        if (herVideoContainer) {
            herVideoContainer.innerHTML = '';
        }

        ['Scrape', 'Analyze', 'Visuals', 'Narrate', 'Compose'].forEach(stage => {
            const el = document.getElementById(`herStage${stage}`);
            if (el) {
                el.className = 'stage-item pending';
                const st = el.querySelector('.stage-status');
                if (st) st.innerHTML = 'Waiting';
            }
        });
    }

    if (herBtnReset) {
        herBtnReset.addEventListener('click', resetHerStudio);
    }

    // Video generation execution
    let herTimerInterval = null;
    let herStartTime = 0;

    function setStageStatus(stageId, status, label) {
        const el = document.getElementById(stageId);
        if (!el) return;
        el.className = `stage-item ${status}`;
        const st = el.querySelector('.stage-status');
        if (!st) return;
        if (status === 'running') {
            st.innerHTML = `<i class="fas fa-spinner fa-spin text-warning"></i> Running`;
        } else if (status === 'completed') {
            st.innerHTML = `<i class="fas fa-check text-success"></i> Done`;
        } else if (status === 'failed') {
            st.innerHTML = `<i class="fas fa-times text-danger"></i> Failed`;
        } else {
            st.innerHTML = label || 'Waiting';
        }
    }

    // Backend API discovery helper (Cloud Run deployed URL or local port 7860)
    async function getProjectHerBackendUrl() {
        const deployedUrl = (window.SITE_CONFIG && window.SITE_CONFIG.projectHer && window.SITE_CONFIG.projectHer.liveUrl) || 'https://project-her-svnnlerw4q-uc.a.run.app';
        const isLocalHost = ['localhost', '127.0.0.1'].includes(window.location.hostname);

        // When testing on localhost, prioritize local port 7860 first, then deployed cloud backend.
        // When visited on production web domain, use deployed cloud backend directly.
        const candidates = isLocalHost 
            ? ['http://localhost:7860', 'http://127.0.0.1:7860', deployedUrl]
            : [deployedUrl];

        for (const base of candidates) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 2000);
                const res = await fetch(`${base}/`, {
                    method: 'HEAD',
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                if (res.ok || res.status === 200 || res.status === 204 || res.status === 405) {
                    return base;
                }
            } catch (e) {
                try {
                    const controller2 = new AbortController();
                    const timeoutId2 = setTimeout(() => controller2.abort(), 1500);
                    const res2 = await fetch(`${base}/api/preview`, {
                        method: 'OPTIONS',
                        signal: controller2.signal
                    });
                    clearTimeout(timeoutId2);
                    if (res2.ok || res2.status === 200 || res2.status === 204) {
                        return base;
                    }
                } catch (err2) {}
            }
        }
        return deployedUrl;
    }

    if (herBtnGenerate && !herBtnGenerate.disabled) {
        herBtnGenerate.addEventListener('click', async function() {
            const inputVal = herPromptInput ? herPromptInput.value.trim() : '';
            if (!inputVal) {
                showHerToast('Please enter a topic, bedtime story, or article URL.', 'error');
                if (herPromptInput) herPromptInput.focus();
                return;
            }

            // Switch to progress state
            if (herStateIdle) herStateIdle.style.display = 'none';
            if (herStateCompleted) herStateCompleted.style.display = 'none';
            if (herStateProgress) herStateProgress.style.display = 'flex';
            herBtnGenerate.disabled = true;

            if (herProgressBar) herProgressBar.style.width = '0%';
            if (herStatusText) herStatusText.textContent = 'Connecting to Project HER orchestrator...';
            if (herLiveMessage) herLiveMessage.textContent = 'Contacting AI video engine...';

            // Start timer
            herStartTime = Date.now();
            if (herTimerInterval) clearInterval(herTimerInterval);
            herTimerInterval = setInterval(() => {
                const sec = ((Date.now() - herStartTime) / 1000).toFixed(1);
                if (herElapsedTime) herElapsedTime.textContent = `${sec}s elapsed`;
            }, 200);

            // Determine if input is kids story or article
            const isUrl = /^https?:\/\//i.test(inputVal);

            // Probe backend (local:7860 or deployed Cloud Run)
            let backendBase = null;
            try {
                backendBase = await getProjectHerBackendUrl();
            } catch (e) {
                backendBase = (window.SITE_CONFIG && window.SITE_CONFIG.projectHer && window.SITE_CONFIG.projectHer.liveUrl) || 'https://project-her-svnnlerw4q-uc.a.run.app';
            }

            if (!backendBase) {
                backendBase = 'https://project-her-svnnlerw4q-uc.a.run.app';
            }

            if (herStatusText) herStatusText.textContent = 'Connected to Project HER Backend';
            if (herLiveMessage) herLiveMessage.textContent = `Active session established. Dispatching video pipeline...`;

            try {
                const payload = {
                    url: isUrl ? inputVal : '',
                    text: isUrl ? '' : inputVal,
                    tone: herSelTone ? herSelTone.value : 'informative',
                    format: herSelFormat ? herSelFormat.value : 'vertical',
                    visual_style: herSelVisualStyle ? herSelVisualStyle.value : 'claymorphism',
                    target_duration: herSelDuration ? (parseInt(herSelDuration.value) || 0) : 0,
                    renderer: 'remotion',       // Remotion by default
                    ai_images: true,            // AI images enabled by default
                    content_mode: 'article',    // Article mode matches reliable generation
                    theme: 'claymorphism',      // claymorphism theme
                    captions: 'karaoke',        // karaoke highlight
                    transition: 'fade',         // fade transition
                    subtitles: true,
                    voice: 'aria',              // en-US-AriaNeural
                    platform: '',
                    quality: 'standard',
                    watermark: '',
                    points: 0,
                    color_grade: 'none',        // natural raw vibrance
                    language: 'english',
                    speed: '+0%',
                    brand_text: '',
                    question: '',
                    character_name: '',
                    modern_topic: '',
                    voice_pair: 'default',
                    deep_dive_sources: [],
                    deep_dive_text: '',
                    series_id: '',
                    episode_number: 0,
                    tts_provider: 'google_tts',
                    llm_provider: '',
                    llm_model: ''
                };

                const resp = await fetch(`${backendBase}/api/generate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!resp.ok) {
                    let errMsg = `Generation failed (${resp.status})`;
                    try {
                        const errData = await resp.json();
                        if (errData && errData.error) errMsg = errData.error;
                    } catch (_) {}
                    clearInterval(herTimerInterval);
                    showHerToast(errMsg, 'error');
                    resetHerStudio();
                    return;
                }

                const data = await resp.json();
                if (data.error) {
                    clearInterval(herTimerInterval);
                    showHerToast(`Pipeline error: ${data.error}`, 'error');
                    resetHerStudio();
                    return;
                }

                const jobId = data.job_id;
                let evtSource = null;
                try {
                    evtSource = new EventSource(`${backendBase}/api/progress/${jobId}`);
                } catch (e) {
                    console.warn('SSE initialization failed, using polling:', e);
                }

                const stageMap = {
                    scrape: 'herStageScrape',
                    analyze: 'herStageAnalyze',
                    visuals: 'herStageVisuals',
                    narrate: 'herStageNarrate',
                    compose: 'herStageCompose'
                };

                if (evtSource) {
                    evtSource.addEventListener('progress', function(e) {
                        try {
                            const stage = JSON.parse(e.data);
                            if (herStatusText) herStatusText.textContent = stage.label || 'Generating...';
                            if (herLiveMessage) herLiveMessage.textContent = stage.message || stage.label;

                            const pct = Math.min(95, Math.max(5, ((stage.index - 1 + (stage.progress_pct || 0)) / (stage.total || 5)) * 100));
                            if (herProgressBar) herProgressBar.style.width = `${pct}%`;

                            const domId = stageMap[stage.stage];
                            if (domId) {
                                setStageStatus(domId, stage.status);
                            }
                        } catch (err) {}
                    });

                    evtSource.addEventListener('done', function(e) {
                        if (evtSource) evtSource.close();
                        try {
                            const res = JSON.parse(e.data);
                            if (res.error) {
                                clearInterval(herTimerInterval);
                                showHerToast(`Generation error: ${res.error}`, 'error');
                                resetHerStudio();
                                return;
                            }
                            finishWithResult(res);
                        } catch (err) {}
                    });

                    evtSource.onerror = function() {
                        if (evtSource) evtSource.close();
                        pollBackend(jobId);
                    };
                } else {
                    pollBackend(jobId);
                }

                function finishWithResult(res) {
                    if (evtSource) {
                        try { evtSource.close(); } catch (_) {}
                    }
                    clearInterval(herTimerInterval);
                    if (herProgressBar) herProgressBar.style.width = '100%';

                    // Ensure all stages show complete
                    ['herStageScrape', 'herStageAnalyze', 'herStageVisuals', 'herStageNarrate', 'herStageCompose'].forEach(s => {
                        setStageStatus(s, 'completed');
                    });

                    const actualVideoUrl = res.video_url.startsWith('http') ? res.video_url : `${backendBase}${res.video_url}`;
                    const actualDownloadUrl = res.download_url ? (res.download_url.startsWith('http') ? res.download_url : `${backendBase}${res.download_url}`) : actualVideoUrl;
                    const thumbUrl = res.thumbnail_url ? (res.thumbnail_url.startsWith('http') ? res.thumbnail_url : `${backendBase}${res.thumbnail_url}`) : '';

                    const resTitle = document.getElementById('herResultTitle');
                    const resHook = document.getElementById('herResultHook');
                    if (resTitle) resTitle.textContent = res.title || inputVal.slice(0, 42);
                    if (resHook) resHook.textContent = res.hook || 'Generated AI Video rendered and ready.';

                    const mDur = document.getElementById('herMetricDuration');
                    const mRes = document.getElementById('herMetricResolution');
                    const mTime = document.getElementById('herMetricRenderTime');
                    if (mDur) mDur.textContent = `${res.duration || 0}s`;
                    if (mRes) mRes.textContent = res.resolution || '1080x1920';
                    if (mTime) mTime.textContent = `${res.processing_time || 0}s render`;

                    if (herVideoContainer) {
                        herVideoContainer.innerHTML = `
                            <div style="position:relative; width:100%; border-radius:var(--radius-md); overflow:hidden; background:#050811; border:1px solid rgba(246, 173, 85, 0.2); box-shadow:0 12px 36px rgba(0,0,0,0.6);">
                                <video id="herVideoPlayer" controls autoplay playsinline preload="auto" poster="${thumbUrl}" src="${actualVideoUrl}" style="width:100%; max-height:420px; display:block; object-fit:contain; background:#000;">
                                    Your browser does not support HTML5 video playback.
                                </video>
                                <div style="position:absolute; top:12px; left:12px; display:flex; gap:6px; z-index:3; pointer-events:none;">
                                    <span class="her-spec-badge" style="background:rgba(10,15,29,0.85); backdrop-filter:blur(8px); border-color:var(--accent);">
                                        <i class="fas fa-circle text-success" style="font-size:0.55rem;"></i> LIVE RENDER
                                    </span>
                                    <span class="her-spec-badge" style="background:rgba(10,15,29,0.85); backdrop-filter:blur(8px);">
                                        ${res.resolution || '1080x1920'}
                                    </span>
                                </div>
                            </div>
                        `;
                        const vPlayer = document.getElementById('herVideoPlayer');
                        if (vPlayer) {
                            vPlayer.load();
                            vPlayer.play().catch(() => {
                                vPlayer.muted = true;
                                vPlayer.play().catch(() => {});
                            });
                        }
                    }

                    const btnDownload = document.getElementById('herBtnDownloadMp4');
                    if (btnDownload) {
                        btnDownload.href = actualDownloadUrl;
                        const safeFileName = ((res.title || 'project_her_video').replace(/[^a-z0-9_-]/gi, '_').toLowerCase()) + '.mp4';
                        btnDownload.setAttribute('download', safeFileName);
                    }

                    if (herStateProgress) herStateProgress.style.display = 'none';
                    if (herStateCompleted) herStateCompleted.style.display = 'flex';
                    herBtnGenerate.disabled = false;
                    showHerToast('Custom AI Video rendered successfully!', 'success');
                }

                function pollBackend(jobId, attempts = 0) {
                    if (attempts > 180) {
                        clearInterval(herTimerInterval);
                        showHerToast('Generation timed out on server.', 'error');
                        resetHerStudio();
                        return;
                    }
                    fetch(`${backendBase}/api/result/${jobId}`)
                        .then(r => r.ok ? r.json() : null)
                        .then(res => {
                            if (res && res.video_url) {
                                finishWithResult(res);
                            } else if (res && res.error) {
                                clearInterval(herTimerInterval);
                                showHerToast(`Pipeline error: ${res.error}`, 'error');
                                resetHerStudio();
                            } else {
                                const curW = parseFloat(herProgressBar?.style?.width || '15');
                                if (curW < 90 && herProgressBar) {
                                    herProgressBar.style.width = `${Math.min(90, curW + 1.5)}%`;
                                }
                                if (herStatusText) herStatusText.textContent = 'Rendering video composition...';
                                if (herLiveMessage) herLiveMessage.textContent = 'Compositor rendering frames and synchronizing audio...';
                                setStageStatus('herStageCompose', 'running');
                                setTimeout(() => pollBackend(jobId, attempts + 1), 3000);
                            }
                        })
                        .catch(() => {
                            setTimeout(() => pollBackend(jobId, attempts + 1), 3000);
                        });
                }

                return; // Live generation handled!

            } catch (err) {
                console.warn('Backend call encountered issue:', err);
                clearInterval(herTimerInterval);
                showHerToast(`Generation error: ${err.message || 'Unable to connect to AI engine'}`, 'error');
                resetHerStudio();
                return;
            }
        });
    }


    // Initialize initial download button state
    const initialBtnDownload = document.getElementById('herBtnDownloadMp4');
    if (initialBtnDownload) {
        initialBtnDownload.removeAttribute('href');
        initialBtnDownload.removeAttribute('download');
    }

});
