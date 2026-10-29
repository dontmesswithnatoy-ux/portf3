/**
 * Portfolio Interactive Scripts
 * Handles theme toggling, mobile drawer, project filtering, modal viewer,
 * resume lightbox, mock interview video controls, and contact form feedback.
 */

// ---------------------------------------------------------------------------
// Resume Lightbox Viewer
// ---------------------------------------------------------------------------
function openResumeViewer() {
    const lb = document.getElementById('resume-lightbox');
    if (lb) {
        lb.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeResumeViewer() {
    const lb = document.getElementById('resume-lightbox');
    if (lb) {
        lb.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ---------------------------------------------------------------------------
// Mock Interview Video Player
// ---------------------------------------------------------------------------
function getInterviewVideo() {
    return document.getElementById('jevy-interview-video') || document.getElementById('jevyInterviewVideo');
}

function updatePlayUi(isPlaying) {
    const overlay = document.getElementById('jevyVideoOverlay');
    const ctrlLabel = document.getElementById('jevyCtrlLabel');
    const ctrlIcon = document.getElementById('jevyCtrlIcon');
    const playBtn = document.getElementById('jevyPlayBtn');

    if (overlay) {
        if (isPlaying) {
            overlay.classList.add('playing');
        } else {
            overlay.classList.remove('playing');
        }
    }

    if (ctrlLabel) {
        ctrlLabel.textContent = isPlaying ? 'Pause' : 'Play';
    }

    if (ctrlIcon) {
        ctrlIcon.innerHTML = isPlaying
            ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
               </svg>`
            : `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="6 4 20 12 6 20 6 4"></polygon>
               </svg>`;
    }

    if (playBtn) {
        playBtn.setAttribute('aria-label', isPlaying ? 'Pause interview video' : 'Play interview video');
    }
}

function jevyTogglePlay() {
    const video = getInterviewVideo();
    if (!video) return;

    if (video.paused || video.ended) {
        video.play().then(() => {
            updatePlayUi(true);
        }).catch(err => {
            console.log('Video playback error or user interaction needed:', err);
        });
    } else {
        video.pause();
        updatePlayUi(false);
    }
}

function jevyRestartVideo() {
    const video = getInterviewVideo();
    if (video) {
        video.currentTime = 0;
        video.play().then(() => {
            updatePlayUi(true);
        }).catch(() => {
            updatePlayUi(false);
        });
    }
}

function jevyToggleMute() {
    const video = getInterviewVideo();
    const muteLabel = document.getElementById('jevyMuteLabel');
    if (!video) return;

    video.muted = !video.muted;
    if (muteLabel) {
        muteLabel.textContent = video.muted ? 'Unmute' : 'Mute';
    }
}

function jevySetSpeed(speed, btn) {
    const video = getInterviewVideo();
    if (video) {
        video.playbackRate = parseFloat(speed);
    }
    document.querySelectorAll('.speed-chip').forEach(c => c.classList.remove('active'));
    if (btn) btn.classList.add('active');
}

function jevyFullscreen() {
    const video = getInterviewVideo();
    const wrapper = document.getElementById('interviewVideoWrapper') || video;
    if (!wrapper) return;

    if (!document.fullscreenElement) {
        if (wrapper.requestFullscreen) {
            wrapper.requestFullscreen();
        } else if (wrapper.webkitRequestFullscreen) {
            wrapper.webkitRequestFullscreen();
        } else if (wrapper.msRequestFullscreen) {
            wrapper.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

function jevySeek(seconds) {
    const video = getInterviewVideo();
    if (video) {
        video.currentTime = seconds;
        video.play().then(() => {
            updatePlayUi(true);
        }).catch(() => {});
    }

    // Highlight active chapter
    document.querySelectorAll('.chapter-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    if (event && event.currentTarget && event.currentTarget.classList.contains('chapter-chip')) {
        event.currentTarget.classList.add('active');
    }
}

// ---------------------------------------------------------------------------
// Main DOMContentLoaded Setup
// ---------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Sync native video player events with custom UI
    const video = getInterviewVideo();
    if (video) {
        video.addEventListener('play', () => updatePlayUi(true));
        video.addEventListener('pause', () => updatePlayUi(false));
        video.addEventListener('ended', () => updatePlayUi(false));
        video.addEventListener('volumechange', () => {
            const muteLabel = document.getElementById('jevyMuteLabel');
            if (muteLabel) {
                muteLabel.textContent = video.muted ? 'Unmute' : 'Mute';
            }
        });
    }

    // 1. Theme Toggle
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme') || 'dark';
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('portfolio_theme', next);
            showToast(next === 'dark' ? 'Switched to Dark Mode' : 'Switched to Light Mode');
        });
    }

    // 2. Mobile Menu Toggle
    const mobileToggle = document.getElementById('mobile-nav-toggle');
    const mobileDrawer = document.getElementById('mobile-nav-drawer');
    if (mobileToggle && mobileDrawer) {
        mobileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = mobileDrawer.classList.contains('active') || mobileDrawer.classList.contains('open');
            const nextState = !isOpen;
            mobileToggle.setAttribute('aria-expanded', String(nextState));
            mobileToggle.classList.toggle('active', nextState);
            mobileToggle.classList.toggle('open', nextState);
            mobileDrawer.classList.toggle('active', nextState);
            mobileDrawer.classList.toggle('open', nextState);
            mobileDrawer.setAttribute('aria-hidden', String(!nextState));
        });

        mobileDrawer.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.setAttribute('aria-expanded', 'false');
                mobileToggle.classList.remove('active', 'open');
                mobileDrawer.classList.remove('active', 'open');
                mobileDrawer.setAttribute('aria-hidden', 'true');
            });
        });

        document.addEventListener('click', (e) => {
            if (mobileDrawer.classList.contains('active') || mobileDrawer.classList.contains('open')) {
                if (!mobileDrawer.contains(e.target) && !mobileToggle.contains(e.target)) {
                    mobileToggle.setAttribute('aria-expanded', 'false');
                    mobileToggle.classList.remove('active', 'open');
                    mobileDrawer.classList.remove('active', 'open');
                    mobileDrawer.setAttribute('aria-hidden', 'true');
                }
            }
        });
    }

    // 3. Project Filter Tabs
    const filterBtns = document.querySelectorAll('.filter-btn, .filter-tab-btn');
    const projectCards = document.querySelectorAll('.project-card');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');

            const filter = btn.getAttribute('data-filter') || btn.id.replace('filter-', '');
            projectCards.forEach(card => {
                const cat = card.getAttribute('data-category');
                if (filter === 'all' || cat === filter) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // 4. Project Modal Inspector
    const modal = document.getElementById('project-modal');
    const modalClose = document.getElementById('modal-close');
    const inspectBtns = document.querySelectorAll('[data-project-id]');

    function openProjectModal(projectId) {
        if (!modal || !window.portfolioData || !window.portfolioData.projects) return;
        const project = window.portfolioData.projects.find(p => p.id === projectId);
        if (!project) return;

        const categoryEl = document.getElementById('modal-project-category');
        const titleEl = document.getElementById('modal-project-title');
        const imgEl = document.getElementById('modal-project-img');
        const descEl = document.getElementById('modal-project-desc');
        const highlightsEl = document.getElementById('modal-project-highlights');
        const tagsEl = document.getElementById('modal-project-tags');
        const demoBtn = document.getElementById('modal-demo-btn');
        const githubBtn = document.getElementById('modal-github-btn');

        if (categoryEl) categoryEl.textContent = project.category_label || project.category;
        if (titleEl) titleEl.textContent = project.title;
        if (imgEl) {
            imgEl.src = project.image || '';
            imgEl.alt = project.title;
        }
        if (descEl) descEl.textContent = project.description || project.summary;

        if (highlightsEl) {
            highlightsEl.innerHTML = '';
            (project.highlights || []).forEach(hl => {
                const li = document.createElement('li');
                li.textContent = hl;
                highlightsEl.appendChild(li);
            });
        }

        if (tagsEl) {
            tagsEl.innerHTML = '';
            (project.tags || []).forEach(t => {
                const badge = document.createElement('span');
                badge.className = 'tech-badge';
                badge.textContent = t;
                tagsEl.appendChild(badge);
            });
        }

        if (demoBtn) demoBtn.href = project.demo || '#';
        if (githubBtn) githubBtn.href = project.github || '#';

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeProjectModal() {
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    inspectBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const pid = btn.getAttribute('data-project-id');
            if (pid) {
                e.preventDefault();
                openProjectModal(pid);
            }
        });
    });

    if (modalClose) {
        modalClose.addEventListener('click', closeProjectModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeProjectModal();
        });
    }

    // 5. Back to Top Button
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 6. Contact Form AJAX-like Feedback
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('submit-btn');
            if (submitBtn) {
                const origText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<span>Sending...</span>';
                setTimeout(() => {
                    submitBtn.innerHTML = origText;
                    contactForm.reset();
                    showToast('Message sent successfully! Salamat!');
                }, 900);
            }
        });
    }

    // 7. Global Keyboard listener (Escape closes modals)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeProjectModal();
            closeResumeViewer();
        }
    });

    // 8. Navigation ScrollSpy & Active Link Sync
    const sections = document.querySelectorAll('section[id]');
    const desktopLinks = document.querySelectorAll('.desktop-nav .nav-link');
    const mobileLinks = document.querySelectorAll('.mobile-nav-drawer .mobile-nav-link');

    function updateActiveNav() {
        let currentSectionId = '';
        const scrollPos = window.scrollY + 120;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            if (scrollPos >= top && scrollPos < top + height) {
                currentSectionId = section.getAttribute('id');
            }
        });

        [...desktopLinks, ...mobileLinks].forEach(link => {
            const href = link.getAttribute('href');
            if (currentSectionId && href === `#${currentSectionId}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();
});

// Toast notification helper
function showToast(message, icon = '✓') {
    const toast = document.getElementById('toast-notification');
    const toastMsg = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');
    if (!toast) return;

    if (toastMsg) toastMsg.textContent = message;
    if (toastIcon) toastIcon.textContent = icon;

    toast.classList.add('show');
    clearTimeout(window._toastTimeout);
    window._toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 3200);
}
