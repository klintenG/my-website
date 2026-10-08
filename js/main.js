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
        scrollProgress.style.width = scrollPercent + '%';
    }

    // ========== THEME TOGGLE ==========
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
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
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');

    function handleScroll() {
        const scrollY = window.scrollY;

        // Navbar background
        navbar.classList.toggle('scrolled', scrollY > 50);

        // Back to top
        backToTop.classList.toggle('visible', scrollY > 500);

        // Active nav link
        let currentSection = '';
        sections.forEach(section => {
            const top = section.offsetTop - 100;
            const bottom = top + section.offsetHeight;
            if (scrollY >= top && scrollY < bottom) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });

        // Update scroll progress
        updateScrollProgress();
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Back to top click
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ========== MOBILE MENU ==========
    const hamburger = document.getElementById('hamburger');
    const navLinksContainer = document.getElementById('navLinks');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinksContainer.classList.toggle('active');
    });

    // Close mobile menu on link click
    navLinksContainer.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinksContainer.classList.remove('active');
        });
    });

    // ========== TYPING ANIMATION ==========
    const titles = [
        'AI Agent Engineer',
        'AI Integration Engineer',
        'Multi-Agent System Builder',
        'RAG Pipeline Architect',
        'Enterprise Software Engineer',
    ];
    let titleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingElement = document.getElementById('typingText');

    function typeWriter() {
        const current = titles[titleIndex];

        if (isDeleting) {
            typingElement.textContent = current.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingElement.textContent = current.substring(0, charIndex + 1);
            charIndex++;
        }

        let speed = isDeleting ? 35 : 70;

        if (!isDeleting && charIndex === current.length) {
            speed = 2200;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            titleIndex = (titleIndex + 1) % titles.length;
            speed = 500;
        }

        setTimeout(typeWriter, speed);
    }

    typeWriter();

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
                if (filter === 'all' || category === filter) {
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

    // ========== CONTACT FORM ==========
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const subject = formData.get('subject');
            const message = formData.get('message');

            const mailtoLink = `mailto:klintenguduru@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Hi Klinten,\n\nMy name is ${name} (${email}).\n\n${message}`)}`;

            window.location.href = mailtoLink;

            const btn = contactForm.querySelector('button[type="submit"]');
            if (btn) {
                const originalHTML = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check"></i> Opening Email Client...';
                btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';

                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.style.background = '';
                    contactForm.reset();
                }, 3000);
            }
        });
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

    // ========== PARALLAX-LIKE EFFECT ON SHAPES ==========
    let ticking = false;
    window.addEventListener('mousemove', (e) => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const shapes = document.querySelectorAll('.shape');
                const x = (e.clientX / window.innerWidth - 0.5) * 2;
                const y = (e.clientY / window.innerHeight - 0.5) * 2;

                shapes.forEach((shape, i) => {
                    const speed = (i + 1) * 4;
                    shape.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
                });

                ticking = false;
            });
            ticking = true;
        }
    });

    // ========== PROFILE CARD TILT EFFECT ==========
    const profileCard = document.querySelector('.profile-card');
    if (profileCard) {
        profileCard.addEventListener('mousemove', (e) => {
            const rect = profileCard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -6;
            const rotateY = ((x - centerX) / centerX) * 6;

            profileCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });

        profileCard.addEventListener('mouseleave', () => {
            profileCard.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    }

    // ========== MAGNETIC HOVER EFFECT ON BUTTONS ==========
    const magneticBtns = document.querySelectorAll('.btn-primary, .btn-outline, .nav-cta');

    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });

    // ========== KEYBOARD NAVIGATION ==========
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hamburger.classList.remove('active');
            navLinksContainer.classList.remove('active');
        }
    });

    // ========== WAVE DIVIDER DYNAMIC COLOR (for theme changes) ==========
    function updateWaveDividers() {
        const theme = document.documentElement.getAttribute('data-theme');
        const wavePaths = document.querySelectorAll('.wave-divider path');
        // CSS custom properties handle this through var() in SVG
    }

    // ========== NAVBAR LINK HOVER SOUND-LIKE FEEDBACK ==========
    // Subtle focus ring for accessibility
    document.querySelectorAll('.nav-link, .filter-btn, .social-link, .contact-card').forEach(el => {
        el.addEventListener('focus', () => {
            el.style.outline = `2px solid var(--accent)`;
            el.style.outlineOffset = '2px';
        });
        el.addEventListener('blur', () => {
            el.style.outline = '';
            el.style.outlineOffset = '';
        });
    });

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

        // Project HER live status probe
        const herStatusEl = document.getElementById('projectHerStatus');
        if (herStatusEl && window.SITE_CONFIG.projectHer) {
            const cfg = window.SITE_CONFIG.projectHer;
            if (cfg.status === 'live') {
                herStatusEl.className = 'flagship-status live';
                herStatusEl.innerHTML = '<span class="va-status-dot"></span> Live — Try it';
            } else if (cfg.status === 'deploying') {
                herStatusEl.className = 'flagship-status deploying';
                herStatusEl.innerHTML = '<span class="va-status-dot" style="background:#f59e0b"></span> Deploying — Watch Demo';
            } else if (cfg.status === 'offline') {
                herStatusEl.className = 'flagship-status offline';
                herStatusEl.innerHTML = '<span class="va-status-dot" style="background:#888"></span> Demo temporarily unavailable';
            } else if (cfg.status === 'auto') {
                // Test reachability
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), cfg.probeTimeoutMs || 8000);
                fetch(cfg.liveUrl, { method: 'HEAD', mode: 'no-cors', signal: controller.signal })
                    .then(() => {
                        clearTimeout(timeoutId);
                        herStatusEl.className = 'flagship-status live';
                        herStatusEl.innerHTML = '<span class="va-status-dot"></span> Live — Try it';
                    })
                    .catch(() => {
                        clearTimeout(timeoutId);
                        herStatusEl.className = 'flagship-status deploying';
                        herStatusEl.innerHTML = '<span class="va-status-dot" style="background:#f59e0b"></span> Deploying / Starting up';
                    });
            }
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

    // Backend API discovery helper (Port 7860)
    async function getProjectHerBackendUrl() {
        const candidates = ['http://localhost:7860', 'http://127.0.0.1:7860'];
        for (const base of candidates) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 1500);
                const res = await fetch(`${base}/api/preview`, {
                    method: 'OPTIONS',
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                if (res.ok || res.status === 200 || res.status === 204) {
                    return base;
                }
            } catch (e) {
                // Try next candidate
            }
        }
        return null;
    }

    if (herBtnGenerate) {
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
            if (herLiveMessage) herLiveMessage.textContent = 'Checking local AI backend on port 7860...';

            // Start timer
            herStartTime = Date.now();
            if (herTimerInterval) clearInterval(herTimerInterval);
            herTimerInterval = setInterval(() => {
                const sec = ((Date.now() - herStartTime) / 1000).toFixed(1);
                if (herElapsedTime) herElapsedTime.textContent = `${sec}s elapsed`;
            }, 200);

            // Determine if input is kids story or article
            const isUrl = /^https?:\/\//i.test(inputVal);
            const isKidsStory = /Barnaby|rabbit|bedtime|story|once upon a time|little dreamer|bear|moon/i.test(inputVal);
            const contentMode = isKidsStory ? 'kids_story' : 'article';

            // Probe backend on localhost:7860
            let backendBase = null;
            try {
                backendBase = await getProjectHerBackendUrl();
            } catch (e) {
                backendBase = null;
            }

            // ── SCENARIO A: LIVE BACKEND ENGINE DETECTED ──
            if (backendBase) {
                if (herStatusText) herStatusText.textContent = 'Connected to Project HER Backend';
                if (herLiveMessage) herLiveMessage.textContent = `Active agent session established on ${backendBase}. Sending payload...`;

                try {
                    const resp = await fetch(`${backendBase}/api/generate`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            url: isUrl ? inputVal : '',
                            text: isUrl ? '' : inputVal,
                            tone: herSelTone ? herSelTone.value : 'explainer',
                            format: herSelFormat ? herSelFormat.value : 'vertical',
                            visual_style: herSelVisualStyle ? herSelVisualStyle.value : 'claymorphism',
                            target_duration: herSelDuration ? parseInt(herSelDuration.value) : 60,
                            renderer: 'remotion',
                            ai_images: true,
                            content_mode: contentMode,
                        })
                    });

                    const data = await resp.json();
                    if (data.error) {
                        clearInterval(herTimerInterval);
                        showHerToast(`Pipeline error: ${data.error}`, 'error');
                        resetHerStudio();
                        return;
                    }

                    const jobId = data.job_id;
                    const evtSource = new EventSource(`${backendBase}/api/progress/${jobId}`);

                    const stageMap = {
                        scrape: 'herStageScrape',
                        analyze: 'herStageAnalyze',
                        visuals: 'herStageVisuals',
                        narrate: 'herStageNarrate',
                        compose: 'herStageCompose'
                    };

                    evtSource.addEventListener('progress', function(e) {
                        const stage = JSON.parse(e.data);
                        if (herStatusText) herStatusText.textContent = stage.label || 'Generating...';
                        if (herLiveMessage) herLiveMessage.textContent = stage.message || stage.label;

                        const pct = Math.min(100, Math.max(5, ((stage.index - 1 + (stage.progress_pct || 0)) / (stage.total || 5)) * 100));
                        if (herProgressBar) herProgressBar.style.width = `${pct}%`;

                        const domId = stageMap[stage.stage];
                        if (domId) {
                            setStageStatus(domId, stage.status);
                        }
                    });

                    function finishWithResult(res) {
                        evtSource.close();
                        clearInterval(herTimerInterval);
                        if (herProgressBar) herProgressBar.style.width = '100%';

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

                    evtSource.addEventListener('done', function(e) {
                        const res = JSON.parse(e.data);
                        if (res.error) {
                            evtSource.close();
                            clearInterval(herTimerInterval);
                            showHerToast(`Generation error: ${res.error}`, 'error');
                            resetHerStudio();
                            return;
                        }
                        finishWithResult(res);
                    });

                    function pollBackend(jobId, attempts = 0) {
                        if (attempts > 120) {
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
                                    setTimeout(() => pollBackend(jobId, attempts + 1), 3000);
                                }
                            })
                            .catch(() => {
                                setTimeout(() => pollBackend(jobId, attempts + 1), 3000);
                            });
                    }

                    evtSource.onerror = function() {
                        evtSource.close();
                        pollBackend(jobId);
                    };

                    return; // Live generation handled!

                } catch (err) {
                    console.warn('Backend call encountered issue:', err);
                }
            }

            // ── SCENARIO B: STANDALONE PORTFOLIO SIMULATION (Backend on 7860 not started) ──
            showHerToast("Notice: Local Project HER server on port 7860 not running. Run 'python web_ui.py' to generate full custom videos.", "info");

            setTimeout(() => {
                setStageStatus('herStageScrape', 'running');
                if (herProgressBar) herProgressBar.style.width = '12%';
                if (herLiveMessage) herLiveMessage.textContent = 'Ingesting prompt and structuring storyboard scenes...';
            }, 600);

            setTimeout(() => {
                setStageStatus('herStageScrape', 'completed');
                setStageStatus('herStageAnalyze', 'running');
                if (herProgressBar) herProgressBar.style.width = '32%';
                if (herLiveMessage) herLiveMessage.textContent = 'Analyzing context: ' + inputVal.slice(0, 48) + '...';
            }, 1600);

            setTimeout(() => {
                setStageStatus('herStageAnalyze', 'completed');
                setStageStatus('herStageVisuals', 'running');
                if (herProgressBar) herProgressBar.style.width = '55%';
                if (herLiveMessage) herLiveMessage.textContent = 'Synthesizing visual assets and vertical 9:16 layout composition...';
            }, 2900);

            setTimeout(() => {
                setStageStatus('herStageVisuals', 'completed');
                setStageStatus('herStageNarrate', 'running');
                if (herProgressBar) herProgressBar.style.width = '78%';
                if (herLiveMessage) herLiveMessage.textContent = 'Generating neural voiceover and aligning word-level subtitle timestamps...';
            }, 4200);

            setTimeout(() => {
                setStageStatus('herStageNarrate', 'completed');
                setStageStatus('herStageCompose', 'running');
                if (herProgressBar) herProgressBar.style.width = '92%';
                if (herLiveMessage) herLiveMessage.textContent = 'Rendering Remotion React 4.0 composition...';
            }, 5300);

            setTimeout(() => {
                setStageStatus('herStageCompose', 'completed');
                if (herProgressBar) herProgressBar.style.width = '100%';
                if (herTimerInterval) clearInterval(herTimerInterval);

                // Dynamically format title from user input
                let title = inputVal.split(/[\n.]/)[0].trim();
                if (title.length > 48) title = title.slice(0, 48) + '…';
                let hook = 'Rendered via Remotion React Compositor · 1080x1920 Vertical Explainer';
                if (isKidsStory) {
                    title = "Barnaby's Moonlit Adventure";
                    hook = "Why the quiet night was made for little dreamers to rest for tomorrow's journey.";
                } else if (/AI|Agent|Software|Engineering|Model/i.test(inputVal)) {
                    title = "The Autonomous Developer 2026";
                    hook = "How agentic reasoning swarms and automated pipelines are rewriting software architecture.";
                } else if (/Quantum|Encryption|Crypt/i.test(inputVal)) {
                    title = "Quantum Cryptography Frontiers";
                    hook = "How post-quantum lattice cryptography protects global networks from Shor's algorithm.";
                }

                const resTitle = document.getElementById('herResultTitle');
                const resHook = document.getElementById('herResultHook');
                if (resTitle) resTitle.textContent = title;
                if (resHook) resHook.textContent = hook;

                // Render video player
                if (herVideoContainer) {
                    herVideoContainer.innerHTML = `
                        <div style="position:relative; width:100%; border-radius:var(--radius-md); overflow:hidden; background:#050811; border:1px solid rgba(246, 173, 85, 0.2); box-shadow:0 12px 36px rgba(0,0,0,0.6);">
                            <video id="herVideoPlayer" controls autoplay playsinline preload="auto" src="assets/project_her_demo.mp4" style="width:100%; max-height:420px; display:block; object-fit:contain; background:#000;">
                                Your browser does not support HTML5 video playback.
                            </video>
                            <div style="position:absolute; top:12px; left:12px; display:flex; gap:6px; z-index:3; pointer-events:none;">
                                <span class="her-spec-badge" style="background:rgba(10,15,29,0.85); backdrop-filter:blur(8px); border-color:var(--accent);">
                                    <i class="fas fa-circle text-warning" style="font-size:0.55rem;"></i> DEMO PREVIEW
                                </span>
                                <span class="her-spec-badge" style="background:rgba(10,15,29,0.85); backdrop-filter:blur(8px);">
                                    Remotion 4.0
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

                // Download MP4 button
                const btnDownload = document.getElementById('herBtnDownloadMp4');
                if (btnDownload) {
                    btnDownload.href = 'assets/project_her_demo.mp4';
                    const safeFileName = (title.replace(/[^a-z0-9_-]/gi, '_').toLowerCase() || 'project_her_video') + '.mp4';
                    btnDownload.setAttribute('download', safeFileName);
                }

                // Show completed state
                if (herStateProgress) herStateProgress.style.display = 'none';
                if (herStateCompleted) herStateCompleted.style.display = 'flex';
                herBtnGenerate.disabled = false;
                showHerToast('Video preview ready. Start local engine for real-time video generation.', 'success');
            }, 6400);
        });
    }

    // Initialize initial download button state
    const initialBtnDownload = document.getElementById('herBtnDownloadMp4');
    if (initialBtnDownload) {
        initialBtnDownload.href = 'assets/project_her_demo.mp4';
        initialBtnDownload.setAttribute('download', 'project_her_video.mp4');
    }

});
