// A smart academic scoring system to evaluate YouTube videos based on contextual sense, not just single words
function analyzeStudyRelevance(title, channelName = "", isSearchQuery = false) {
    if (!title) return false;
    title = title.toLowerCase();
    channelName = channelName.toLowerCase();

    // 1. Distraction Words
    const distractionWords = [
        "splitsvilla", "funny", "prank", "reels", "shorts", "meme", "tiktok", "vlog",
        "movie", "trailer", "music", "gossip", "challenge", "comedy", "standup",
        "gaming", "gameplay", "reaction", "bgmi", "free fire", "minecraft", "gta",
        "mrbeast", "unbox", "esports", "speedrun", "bloopers", "try not to laugh",
        "storytime", "celebrity", "drama", "wwe", "ipl", "fifa", "concert", "album",
        "cinema", "tv show", "episode", "season preview", "review", "fortnite",
        "ishowspeed", "kai cenat", "logan paul", "ksi", "100 days", "i spent",
        "million dollars", "vs", "exposed", "truth about", "podcast"
    ];

    // 2. High-Value Academic Context (Worth +3 points per hit)
    const strongStudyWords = [
        "tutorial", "lecture", "syllabus", "ncert", "cbse", "je mains", "neet",
        "calculus", "algebra", "thermodynamics", "organic chemistry", "ui/ux",
        "javascript", "reactjs", "html", "css", "frontend", "backend", "machine learning",
        "cybersecurity", "crash course", "masterclass", "full course", "explanation",
        "chapter", "revision", "exam", "guide", "university", "academic"
    ];

    // 3. Ambiguous/Weak Study Words (Worth +1 point per hit)
    const weakStudyWords = [
        "study", "course", "python", "learn", "education", "programming", "math",
        "science", "engineering", "class", "lesson", "code", "developer", "physics",
        "chemistry", "biology", "history", "geography", "english", "grammar",
        "economics", "accounting", "plus two"
    ];

    // 4. Reputable Channel Reputation (Worth +4 points)
    const reputableChannelKeywords = [
        "academy", "education", "institute", "classes", "tutorials", "code", "learning",
        "school", "university", "math", "science", "physics", "college", "khan",
        "freecodecamp", "mit", "stanford", "edx", "coursera"
    ];

    // PRO LEVEL 🔥: Block Mixed Content Titles
    const hasDistraction = distractionWords.some(w => title.includes(w) || channelName.includes(w));
    const hasStudy = strongStudyWords.some(w => title.includes(w));

    if (hasDistraction && !hasStudy) return false;

    // If both exist → still suspicious → reject
    if (hasDistraction && hasStudy) return false;

    let studyScore = 0;
    let penaltyScore = 0;

    // Penalty System (reduces score heavily for distractions)
    distractionWords.forEach(w => {
        if (title.includes(w) || channelName.includes(w)) penaltyScore += 5; // BIG penalty
    });

    strongStudyWords.forEach(w => {
        if (title.includes(w)) studyScore += 3;
    });

    weakStudyWords.forEach(w => {
        if (title.includes(w)) studyScore += 1;
    });

    reputableChannelKeywords.forEach(w => {
        if (channelName.includes(w)) studyScore += 4;
    });

    const finalScore = studyScore - penaltyScore;

    // 5. Intelligent Requirement Gates
    // Searches are passed with a basic 1 point (e.g., searching "physics")
    // But individual parsed videos in the results require at least 2 points to survive the scrubber
    // (e.g., "python" + "course" = 2. "pet python snake" = 1 -> Rejected).
    const requiredScore = isSearchQuery ? 1 : 2;
    return finalScore >= requiredScore;
}

let isFetching = false;

async function fetchAndRenderStudyVideos() {
    if (isFetching) return;
    isFetching = true;

    // Create loading state if grid doesn't exist
    let customGrid = document.getElementById("smarttrack-custom-grid");
    const contents = document.querySelector("ytd-browse[page-subtype='home'] #primary");

    if (contents && !customGrid) {
        customGrid = document.createElement("div");
        customGrid.id = "smarttrack-custom-grid";
        customGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
            gap: 16px; row-gap: 40px; padding: 24px; width: 100%;
        `;
        customGrid.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #888; font-family: Roboto; font-size: 18px; grid-column: 1 / -1;">
                Loading your personalized study recommendations... 📚
            </div>
        `;

        const header = document.createElement("h2");
        header.id = "smarttrack-custom-header";
        header.innerHTML = "📚 Recommended Study Materials";
        header.style.cssText = "padding: 20px 24px 0; margin: 0; font-family: Roboto, sans-serif; font-size: 20px; color: var(--yt-spec-text-primary, inherit);";

        contents.prepend(customGrid);
        contents.prepend(header);
    }

    try {
        // We pick 3 random queries from a huge list so your homepage stays fresh with programming, plus two, and study strategies!
        const studyQueries = [
            // Student-referred & Strategy
            "best study techniques for exams", "how to study efficiently students",
            "topper exam strategy class 12", "exam preparation tips",

            // Programming & Tech
            "programming tutorial full course", "web development roadmap", "data structures and algorithms beginner",
            "machine learning full course", "ui ux design masterclass", "cybersecurity basics course",

            // College Level & University
            "calculus 1 full course university", "organic chemistry crash course",
            "microeconomics college level", "university physics lecture series", "anatomy physiology full course",
            "engineering mechanics course", "linear algebra mit",

            // High School & Plus Two
            "plus two physics ncert full chapter", "plus two chemistry exam strategy",
            "plus two maths important questions", "class 12 biology revision",
            "class 11 accounts basic concepts", "high school history documentary",

            // Middle School
            "class 10 science ncert explanation", "class 10 maths full revision board exam",
            "class 9 physics syllabus", "middle school geography lessons", "basic english grammar rules"
        ];

        // Randomly select 3 entirely different topics to fetch at the same time
        let shuffled = [...studyQueries].sort(() => 0.5 - Math.random());
        let selectedQueries = [shuffled[0], shuffled[1], shuffled[2]];

        // Fetch 3 entire pages of YouTube results in parallel
        const responses = await Promise.all([
            fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedQueries[0])}`),
            fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedQueries[1])}`),
            fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedQueries[2])}`)
        ]);

        const htmls = await Promise.all(responses.map(r => r.text()));
        let videos = [];

        // Deep recursive search to find ALL videos
        function extractEveryVideo(obj, targetArray) {
            if (!obj) return;
            if (obj.videoRenderer && obj.videoRenderer.videoId) {
                if (!targetArray.some(v => v.videoId === obj.videoRenderer.videoId)) {
                    targetArray.push(obj.videoRenderer);
                }
            }
            if (Array.isArray(obj)) {
                obj.forEach(item => extractEveryVideo(item, targetArray));
            } else if (typeof obj === 'object') {
                Object.values(obj).forEach(item => extractEveryVideo(item, targetArray));
            }
        }

        // Parse all 3 HTML files and merge their videos
        htmls.forEach(html => {
            const match = html.match(/var ytInitialData = (.*?);<\/script>/);
            if (!match) return; // Skip if a fetch failed silently

            const data = JSON.parse(match[1]);
            if (data.contents && data.contents.twoColumnSearchResultsRenderer && data.contents.twoColumnSearchResultsRenderer.primaryContents) {
                extractEveryVideo(data.contents.twoColumnSearchResultsRenderer.primaryContents, videos);
            }
        });

        // Randomly shuffle the massive combined list of 60-100 videos so it looks like a natural homepage mix
        videos.sort(() => Math.random() - 0.5);

        renderCustomGrid(videos);
    } catch (error) {
        console.error("SmartTrack: Failed to load background study videos", error);
        if (customGrid) {
            customGrid.innerHTML = "<div style='padding: 24px;'>Failed to load study contents. Please try again.</div>";
        }
    }
    isFetching = false;
}

function renderCustomGrid(videos) {
    let customGrid = document.getElementById("smarttrack-custom-grid");
    if (!customGrid) return;

    customGrid.innerHTML = "";

    videos.forEach(v => {
        try {
            const videoId = v.videoId;
            const title = v.title.runs[0].text;
            const thumbnail = v.thumbnail.thumbnails.length > 0 ? v.thumbnail.thumbnails[v.thumbnail.thumbnails.length - 1].url : "";
            const channel = v.ownerText ? v.ownerText.runs[0].text : "YouTube Channel";
            const views = v.viewCountText ? v.viewCountText.simpleText : "";
            const time = v.publishedTimeText ? v.publishedTimeText.simpleText : "";
            const duration = v.lengthText ? v.lengthText.simpleText : "";
            const channelIcon = (v.channelThumbnailSupportedRenderers && v.channelThumbnailSupportedRenderers.channelThumbnailWithLinkRenderer.thumbnail.thumbnails[0].url) || "";

            const card = document.createElement("a");
            card.href = `/watch?v=${videoId}`;
            card.style.cssText = `
                display: flex; flex-direction: column; text-decoration: none;
                color: inherit; font-family: Roboto, Arial, sans-serif; cursor: pointer;
            `;

            card.innerHTML = `
                <div style="position: relative; width: 100%; aspect-ratio: 16/9; margin-bottom: 12px; overflow: hidden; border-radius: 12px;">
                    <img src="${thumbnail}" style="width: 100%; height: 100%; object-fit: cover; background: #222;" />
                    <span style="position: absolute; bottom: 6px; right: 6px; background: rgba(0,0,0,0.8); color: white; padding: 3px 4px; font-size: 12px; font-weight: 500; border-radius: 4px;">${duration}</span>
                </div>
                <div style="display: flex; gap: 12px; padding-right: 24px;">
                    ${channelIcon ? `<img src="${channelIcon}" style="width: 36px; height: 36px; border-radius: 50%; background: #333;" />` : `<div style="width: 36px; height: 36px; border-radius: 50%; display: none;"></div>`}
                    <div style="display: flex; flex-direction: column;">
                        <span style="font-size: 16px; font-weight: 500; line-height: 22px; margin-bottom: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; color: var(--yt-spec-text-primary, inherit);">${title}</span>
                        <span style="font-size: 14px; color: var(--yt-spec-text-secondary, #aaa);">${channel}</span>
                        <span style="font-size: 14px; color: var(--yt-spec-text-secondary, #aaa); margin-top: 2px;">${views} ${time ? '• ' + time : ''}</span>
                    </div>
                </div>
            `;
            customGrid.appendChild(card);
        } catch (e) {
            console.error("Error rendering video card", e);
        }
    });
}

function handleHomepageUI() {
    const isHomepage = window.location.pathname === "/" || window.location.pathname === "";

    const customGrid = document.getElementById("smarttrack-custom-grid");
    const customHeader = document.getElementById("smarttrack-custom-header");

    // The core of YouTube's homepage grid
    const getOriginalGrid = () => document.querySelector("ytd-browse[page-subtype='home'] ytd-rich-grid-renderer");

    if (isHomepage) {
        const originalGrid = getOriginalGrid();
        if (originalGrid) originalGrid.style.setProperty("display", "none", "important");

        if (customGrid) {
            customGrid.style.display = "grid";
            if (customHeader) customHeader.style.display = "block";
        } else {
            fetchAndRenderStudyVideos();
        }
    } else {
        if (customGrid) customGrid.style.display = "none";
        if (customHeader) customHeader.style.display = "none";
    }
}

function showBlockingOverlay(messageText = "SmartTrack has blocked this content because it is not related to your studies. Get back to work!") {
    // Hide the actual video grid or player underneath
    const primary = document.querySelector("#primary");
    if (primary) primary.style.setProperty("display", "none", "important");

    // Aggressively stop and mute any background videos so they can't cheat by listening
    document.querySelectorAll("video").forEach(video => {
        video.pause();
        video.volume = 0;
    });

    // Create the aggressive blocking UI
    let overlay = document.getElementById("smarttrack-block-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "smarttrack-block-overlay";
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(10, 10, 10, 0.95); z-index: 2147483647; /* Maximum possible z-index */
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            color: white; font-family: 'Segoe UI', Roboto, sans-serif; text-align: center;
            backdrop-filter: blur(15px);
        `;
        overlay.innerHTML = `
            <div style="background: #1e1e1e; padding: 50px 70px; border-radius: 20px; border: 2px solid #ef4444; max-width: 500px; box-shadow: 0 15px 50px rgba(239, 68, 68, 0.25);">
                <div style="font-size: 56px; margin-bottom: 20px;">🚫</div>
                <h1 style="color: #ef4444; font-size: 32px; margin: 0 0 16px 0;">Oh no! It's time to study</h1>
                <p id="smarttrack-msg-text" style="font-size: 16px; color: #aaa; margin: 0 0 35px 0; line-height: 1.6;">${messageText}</p>
                <button id="smarttrack-back-btn" style="
                    padding: 16px 32px; background: #10b981; color: white; border: none;
                    border-radius: 12px; font-size: 18px; font-weight: bold; cursor: pointer;
                    transition: all 0.2s ease; width: 100%; letter-spacing: 0.5px;
                ">Go Back to Study Hub</button>
            </div>
        `;
        document.body.appendChild(overlay);

        // Button redirects back to the safe homepage
        document.getElementById("smarttrack-back-btn").addEventListener("click", () => {
            overlay.style.display = "none";
            window.location.replace("https://www.youtube.com/");
        });

        // Simple hover effect for the button
        const btn = document.getElementById("smarttrack-back-btn");
        btn.onmouseover = () => btn.style.background = "#059669";
        btn.onmouseout = () => btn.style.background = "#10b981";
    }

    // Update the message text dynamically
    const msgEl = overlay.querySelector("#smarttrack-msg-text");
    if (msgEl) msgEl.innerText = messageText;

    overlay.style.display = "flex";
}

function hideBlockingOverlay() {
    const overlay = document.getElementById("smarttrack-block-overlay");
    if (overlay) overlay.style.display = "none";
}

// Scans rendering videos on Search and Watch pages to hide individual non-study videos
function enforceStrictDOMFilters() {
    // 1. Instantly nuke all Shorts carousels and reels everywhere, no exceptions
    const shortsShelves = document.querySelectorAll("ytd-reel-shelf-renderer, ytd-rich-shelf-renderer[is-shorts]");
    shortsShelves.forEach(shelf => {
        shelf.style.setProperty("display", "none", "important");
    });

    if (window.location.pathname === "/results" || window.location.pathname === "/watch") {
        let videoContainers = document.querySelectorAll(
            "ytd-video-renderer:not([data-checked]), ytd-compact-video-renderer:not([data-checked])"
        );

        videoContainers.forEach(video => {
            let titleElement = video.querySelector("#video-title, #video-title-link, .ytd-channel-name");
            if (titleElement) {
                let text = (titleElement.innerText || titleElement.textContent || "");
                if (text.trim() !== "") {
                    // Analyse the video elements using the new study relevance scoring system
                    if (!analyzeStudyRelevance(text, "", false)) {
                        // Completely hide this specific video
                        video.style.setProperty("display", "none", "important");
                    } else {
                        // Highlight successful study videos slightly
                        video.style.border = "1px solid #10b981";
                        video.style.borderRadius = "8px";
                    }
                    video.setAttribute("data-checked", "true");
                }
            }
        });
    }
}

function checkAndRedirect() {
    const url = new URL(window.location.href);

    // 1. Permanently ban YouTube Shorts! They are the ultimate focus killer.
    if (url.pathname.startsWith("/shorts")) {
        chrome.storage.local.get(['distractionsBlocked'], (data) => {
            const blocks = (data.distractionsBlocked || 0) + 1;
            chrome.storage.local.set({ distractionsBlocked: blocks });
        });
        showBlockingOverlay("YouTube Shorts are a massive time-waster! Get back to studying immediately.");
        return true;
    }

    // 2. Ban specifically distracting Feeds (Trending, Music, Gaming, Subscriptions, Explore)
    const bannedPrefixes = ["/feed/trending", "/feed/explore", "/feed/subscriptions", "/gaming", "/music", "/movies"];
    if (bannedPrefixes.some(prefix => url.pathname.startsWith(prefix))) {
        chrome.storage.local.get(['distractionsBlocked'], (data) => {
            const blocks = (data.distractionsBlocked || 0) + 1;
            chrome.storage.local.set({ distractionsBlocked: blocks });
        });
        showBlockingOverlay("This page is restricted during active Study Mode.");
        return true;
    }

    // Block Distracting Search Queries
    if (url.pathname === "/results") {
        const query = url.searchParams.get("search_query") || "";
        if (!analyzeStudyRelevance(query, "", true)) {
            chrome.storage.local.get(['distractionsBlocked'], (data) => {
                const blocks = (data.distractionsBlocked || 0) + 1;
                chrome.storage.local.set({ distractionsBlocked: blocks });
            });

            showBlockingOverlay("SmartTrack has blocked these search results because they are not related to your studies.");
            return true;
        }
    }

    // Block Distracting Video Playback
    if (url.pathname === "/watch") {
        let title = document.title.replace(" - YouTube", "");
        let channelName = document.querySelector("ytd-channel-name yt-formatted-string");
        let channelText = channelName ? channelName.innerText : "";

        // YouTube sometimes delays setting the title object
        if (title !== "YouTube" && title.length > 0) {
            if (!analyzeStudyRelevance(title, channelText, false)) {
                chrome.storage.local.get(['distractionsBlocked'], (data) => {
                    const blocks = (data.distractionsBlocked || 0) + 1;
                    chrome.storage.local.set({ distractionsBlocked: blocks });
                });

                showBlockingOverlay("This video is distracting. Get back to work and watch some study material!");
                return true;
            }
        }
    }

    // If it's a safe page, ensure the overlay is hidden
    hideBlockingOverlay();
    return false;
}

let isExtensionActive = true;

// Initial state fetch so we don't spam the API later
chrome.storage.local.get(['isActive'], (data) => {
    isExtensionActive = data.isActive !== undefined ? data.isActive : true;
    init();
});

// Listen dynamically for changes from the popup so it updates without refreshing!
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.isActive) {
        isExtensionActive = changes.isActive.newValue;
        if (!isExtensionActive) {
            // Extension disabled by user setting
            const customGrid = document.getElementById("smarttrack-custom-grid");
            const customHeader = document.getElementById("smarttrack-custom-header");
            if (customGrid) customGrid.style.display = "none";
            if (customHeader) customHeader.style.display = "none";

            const originalGrid = document.querySelector("ytd-browse[page-subtype='home'] ytd-rich-grid-renderer");
            if (originalGrid) originalGrid.style.setProperty("display", "block", "important");

            hideBlockingOverlay();
        } else {
            init();
        }
    }
});

function init() {
    if (!isExtensionActive) return;

    // Extension is Active, proceed normally
    if (!checkAndRedirect()) {
        handleHomepageUI();
        enforceStrictDOMFilters();
    }
}

// Run SPA navigation events
window.addEventListener('yt-navigate-finish', init);

let lastUrl = window.location.href;

// The MutationObserver fires extremely fast. We use the cached 'isExtensionActive' boolean 
// instead of querying chrome.storage here to prevent crashing the extension with API requests!
const observer = new MutationObserver(() => {
    if (!isExtensionActive) return;

    if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        init();
    }

    // Continuously enforce blocking on watch pages if the video title loads a bit late
    // And enforce DOM filters on watch/results pages
    if (window.location.pathname === "/watch" || window.location.pathname === "/results") {
        let overlay = document.getElementById("smarttrack-block-overlay");
        // Only run the heavy check function if the overlay isn't already visible
        if (!overlay || overlay.style.display === "none") {
            checkAndRedirect();
            enforceStrictDOMFilters();
        }
    }

    // Continuously enforce hiding the original distracting grid if it tries to render again
    if (window.location.pathname === "/" || window.location.pathname === "") {
        const originalGrid = document.querySelector("ytd-browse[page-subtype='home'] ytd-rich-grid-renderer");
        if (originalGrid && originalGrid.style.display !== "none") {
            originalGrid.style.setProperty("display", "none", "important");
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true });