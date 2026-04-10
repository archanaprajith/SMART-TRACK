# SmartTrack: Procrastination Trap 🎯

## Problem Statement
Students and professionals constantly struggle to maintain focus while studying online. YouTube, while being the world's largest free educational resource, is also an aggressive algorithmic engine designed to maximize watch time through addictive, non-educational content (Shorts, gaming, movies, memes). When a student logs on to watch a calculus tutorial, the homepage and sidebar suggestions immediately bombard them with clickbait and high-dopamine entertainment, resulting in hours of lost productivity. 

The core problem is **algorithmic distraction**: We lack a filtered environment that leverages the educational power of YouTube while actively suppressing its addictive, time-wasting elements.

## Project Description
SmartTrack is a powerful Google Chrome extension designed to instantly transform YouTube from an entertainment trap into a dedicated, distraction-free Study Hub. Instead of completely blocking YouTube like traditional site-blockers, SmartTrack dynamically restructures the entire user experience in real time without needing complex external tools. 

Powered by intelligent contextual analysis and DOM filtering, it actively parses video titles, queries, and channel names to aggressively filter out entertainment, gaming, and shorts, ensuring that only high-value academic and productive content remains visible on your screen.

**What makes it useful:** It actively prevents the "YouTube Rabbit Hole". Instead of relying entirely on willpower, the extension acts as a strict digital guardian—instantly intercepting and hiding irrelevant search results, entirely blocking the Shorts carousel, and replacing the standard distracting homepage with a dynamic feed of specifically curated educational recommendations.

---

## Features
- **Curated Study Hub**: Completely replaces distracting YouTube recommendations with a productivity-focused homepage grid.
- **Distraction Blocker**: Aggressively intercepts and hides non-educational content based on intelligent keyword heuristics.
- **Shorts Eradicator**: Permanently hides YouTube Shorts shelves and prevents navigation to the Shorts tab.
- **Search Filtering**: Ensures your search query results prioritize study-related materials and immediately hides irrelevant, time-wasting videos before they render.
- **Active Dashboard**: Real-time pop-up showing how many distractions have been intercepted to keep you accountable.

---

## Tech Stack
- **JavaScript (Vanilla)**: Core engine for executing real-time DOM filtration, mutation observation, and heuristic scoring (`content.js`).
- **HTML5 & CSS3**: For the extension's dashboard (`popup.html`) and aggressive blocking overlays injected directly into the user's view.
- **Google Chrome Extensions API**: Manages long-term storage, active tab querying, and unified state across pages.

---

## Screenshots 

![SmartTrack Control Panel Dashboard](./assets/dashboard.png)  
![Distraction Blocked Overlay](./assets/blocked_overlay.png)
![Curated Study Hub Homepage](./assets/study_hub.png)

---

## Installation Steps

Because SmartTrack is built purely with Vanilla JavaScript, HTML, and CSS, it requires zero Node.js/NPM package dependencies.

```bash
# Clone the repository
git clone https://github.com/your-username/smarttrack.git

# Open Google Chrome and navigate to Extensions
chrome://extensions/

# Enable "Developer mode" in the top right corner
# Click "Load unpacked" and select the cloned smarttrack directory

# Open YouTube and experience distraction-free productivity!
```

---

## Project Structure
- `manifest.json`: Configuration, permissions, and metadata.
- `content.js`: The powerhouse script that monitors YouTube's DOM and actively enforces the distraction rules.
- `popup.html` / `popup.js`: The visual dashboard and state manager.
- `study_board.html`: Backup custom clean interface for total focus mode.

---

## License
This project is available under the [MIT License](LICENSE).
