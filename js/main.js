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

    // Shared publication-gated media; no generation or availability probes.
    const her = window.SITE_CONFIG?.projectHer;
    if (her) {
        document.querySelectorAll('[data-her-launch]').forEach(link => { link.href = her.liveUrl; });
        document.querySelectorAll('[data-her-media]').forEach(figure => {
            const screenshot = figure.querySelector('img');
            if (screenshot && her.screenshotUrl) {
                screenshot.src = her.screenshotUrl;
                screenshot.parentElement.href = her.screenshotUrl;
            }
            if (!(her.isSampleVerified && her.sampleVideoUrl && her.posterUrl && her.sampleInput && her.sampleMetadata && her.sampleTranscript && her.sampleCaptionsUrl)) return;
            const video = document.createElement('video');
            video.controls = true;
            video.playsInline = true;
            video.preload = 'metadata';
            video.poster = her.posterUrl;
            video.setAttribute('aria-label', 'Video generated by Project HER');
            const captions = document.createElement('track');
            captions.kind = 'captions';
            captions.src = her.sampleCaptionsUrl;
            captions.srclang = 'en';
            captions.label = 'English';
            video.append(captions);
            const fallback = document.createElement('a');
            fallback.href = her.sampleVideoUrl;
            fallback.textContent = 'Open the sample video';
            video.append(fallback);
            const caption = document.createElement('figcaption');
            caption.textContent = 'Video generated by Project HER' + (her.sampleTitle ? ' · ' + her.sampleTitle : '') + '. Local render · AI illustrations.';
            const details = document.createElement('details');
            const summary = document.createElement('summary');
            summary.textContent = 'Input, provenance & transcript';
            const input = document.createElement('p');
            input.textContent = 'Original supplied account: ' + her.sampleInput;
            const provenance = document.createElement('p');
            provenance.textContent = her.sampleMetadata;
            const transcript = document.createElement('p');
            transcript.textContent = 'Rendered narration: ' + her.sampleTranscript;
            details.append(summary, provenance, input, transcript);
            figure.replaceChildren(video, caption, details);
            // Defer below-fold video network loading until near the viewport.
            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver(entries => {
                    if (entries.some(entry => entry.isIntersecting)) {
                        video.src = her.sampleVideoUrl;
                        observer.disconnect();
                    }
                }, { rootMargin: '200px' });
                observer.observe(video);
            } else video.src = her.sampleVideoUrl;
        });
    }
});
