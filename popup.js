document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('power-toggle');
    const statusLabel = document.getElementById('status-label');
    const statDistractions = document.getElementById('stat-distractions');
    const reloadBtn = document.getElementById('reload-btn');

    // Load initial state
    chrome.storage.local.get(['isActive', 'distractionsBlocked', 'studySessions'], (data) => {
        const isActive = data.isActive !== undefined ? data.isActive : true;
        const blocks = data.distractionsBlocked || 0;

        toggle.checked = isActive;
        updateStatusLabel(isActive);
        statDistractions.innerText = blocks;

        // Let's fake sessions based on blocks for now, or just increment
        const sessions = data.studySessions || Math.max(1, Math.floor(blocks / 3));
        document.getElementById('stat-sessions').innerText = sessions;
    });

    function updateStatusLabel(isActive) {
        if (isActive) {
            statusLabel.innerText = "Actively Filtering";
            statusLabel.style.color = "#4ade80";
        } else {
            statusLabel.innerText = "Disabled / Free Browsing";
            statusLabel.style.color = "#9ca3af";
        }
    }

    // Listen for toggle changes
    toggle.addEventListener('change', (e) => {
        const isActive = e.target.checked;
        updateStatusLabel(isActive);
        chrome.storage.local.set({ isActive: isActive });
    });

    // Refresh tab utility
    reloadBtn.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.reload(tabs[0].id);
        });
    });
});
