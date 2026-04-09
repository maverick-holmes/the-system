# THE SYSTEM v4

Gamifizierter Habit Tracker mit Bonus/Malus-System, FAB-Punkten und KW-basiertem Tracking.

## Features

- **Wochenansicht** mit KW-Navigation
- **Alle Kategorien**: Business, Studium, Wasser, Sport, Geist, Ernährung, Rausch, Zahnpflege, Schlaf, Daily Review, Ordnung
- **Auto-Berechnung** von FAB-Punkten, €-Bonus und €-Malus
- **Smart Sync** — JSON aus Chat (Claude/ChatGPT/etc.) einfügen, Merge statt Replace
- **Schema-Export** — Prompt für jedes LLM generieren
- **PWA** — Installierbar auf dem Homescreen
- **Dark/Light Theme**
- **Joker-System** (60/Jahr)
- **Import/Export** als JSON-Backup

## Setup

1. Clone oder Download
2. GitHub Pages aktivieren (Settings → Pages → Source: main)
3. Fertig: `username.github.io/the-system`

## Dateien

| Datei | Zweck |
|-------|-------|
| `index.html` | App Shell |
| `style.css` | Alle Styles |
| `app.js` | Core Logic |
| `config.json` | Regeln & Schema (SSOT) |
| `manifest.json` | PWA Manifest |

## LLM-Integration

Die App generiert automatisch einen Schema-Prompt (⇄ → Schema-Tab), den man in jedes LLM pasten kann. Das LLM gibt am Ende ein JSON aus, das man per Smart Sync in die App merged.

## Daten

Alle Daten leben in `localStorage` im Browser. Export/Import über Settings.
