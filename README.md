# 🏹 ArcheryGame

<div align="center">

![Archery Game Banner](https://img.shields.io/badge/RiiiCODE-ArcheryGame-f5c842?style=for-the-badge&logo=github&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

**A dark-themed, mobile-friendly archery game built with pure HTML, CSS & JavaScript.**  
Aim. Charge. Release. Hit the bullseye.

</div>

---

## 🎮 Gameplay

Take control of an archer and fire up to **6 arrows** per round at a target across the field. Use the joystick to aim, hold the shoot button to charge your power, then release to fire. The more precise your shot, the higher your score.

### Scoring
| Result | Points |
|--------|--------|
| 🎯 Bullseye | +200 |
| ✅ Hit (close) | +20–60 |
| ❌ Miss | +0 |

Your **best score** is saved automatically via `localStorage`.

---

## 🕹️ Controls

### Mobile (Touch)
| Control | Action |
|---------|--------|
| **Joystick** (center) | Aim your shot |
| **◀ ▶ Buttons** | Move the archer left / right |
| **Hold SHOOT** | Charge power |
| **Release SHOOT** | Fire arrow |

### Desktop (Mouse)
| Control | Action |
|---------|--------|
| **Drag Joystick** | Aim your shot |
| **Click & Hold ◀ ▶** | Move the archer |
| **Hold SHOOT** | Charge power |
| **Release SHOOT** | Fire arrow |

---

## ✨ Features

- 🌌 **Animated starfield** background
- 🎨 **SVG-based scene** — archer, bow, target, arrows all in vector
- ⚡ **GSAP-powered animations** — smooth bow pull, arrow flight, arm motion
- 💥 **Particle effects** on hit/bullseye/miss
- 📊 **Round summary screen** with Bullseye / Hit / Miss stats
- 🏆 **Persistent best score** via localStorage
- 📱 **Fully responsive** — works on mobile and desktop
- 🎯 **Bezier curve arrow trajectory** with realistic arc preview

---

## 📁 Project Structure

```
ArcheryGame/
├── index.html   # Game layout, SVG scene, HUD
├── style.css    # All visual styling
├── game.js      # Game logic, physics, controls, animation
└── README.md    # You're here!
```

---

## 🚀 Getting Started

No build tools, no dependencies (except GSAP via CDN).

```bash
git clone https://github.com/RiiiCODE/ArcheryGame.git
cd ArcheryGame
```

Then just open `index.html` in your browser — or use a local server:

```bash
npx serve .
# or
python -m http.server 8080
```

---

## 🛠️ Tech Stack

- **HTML5** — semantic structure & inline SVG game scene
- **CSS3** — layout, animations, glass-morphism UI
- **Vanilla JavaScript** — game logic, touch/mouse controls, canvas particles
- **[GSAP 1.19 (TweenMax)](https://cdnjs.cloudflare.com/ajax/libs/gsap/1.19.1/TweenMax.min.js)** — smooth animation engine
- **Google Fonts** — Cinzel & Rajdhani

---

## 📸 Preview

> Dark night sky · animated stars · SVG archer · glowing bullseye target · particle explosions on hit

```
⟡ ARCHERY                Round: 1  Score: 0  Best: 0

        [Archer with bow] ————————————> [🎯 Target]

  [◀▶ Move]    [Joystick AIM]    [🔥 SHOOT]
```

---

## 📄 License

MIT © [RiiiCODE](https://instagram.com/RiiCODE)
