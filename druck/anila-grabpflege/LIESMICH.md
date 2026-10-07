# AniLa Grabpflege – Druckdateien

Stand: 07.10.2026

## Dateien für die Druckerei

| Datei | Produkt | Endformat | Datei mit Beschnitt |
|---|---|---|---|
| `AniLa_Flyer_DIN-lang_Wickelfalz_303x216mm.pdf` | Flyer, 6 Seiten, Wickelfalz | 297 × 210 mm offen, 99 × 210 mm gefalzt | 303 × 216 mm (3 mm rundum) |
| `AniLa_Visitenkarte_85x55mm_91x61mm.pdf` | Visitenkarte, beidseitig | 85 × 55 mm | 91 × 61 mm (3 mm rundum) |

- Seite 1 = außen bzw. Vorderseite, Seite 2 = innen bzw. Rückseite.
- Flyer-Felder außen (von links): Einklappseite 97 mm | Rückseite 100 mm | Titel 100 mm.
  Innen: 100 | 100 | 97 mm. Die Falzlinien sind nicht in der Datei eingezeichnet (die Druckerei falzt nach Vorgabe „Wickelfalz DIN lang“).
- Endformat und Beschnitt sind im PDF hinterlegt (TrimBox/BleedBox), keine Schnittmarken.
- Schriften sind vollständig eingebettet, Texte sind Vektor.
- Farbraum: RGB (sRGB). Die üblichen Online-Druckereien wandeln das selbst in CMYK um, dabei werden Farben etwas matter.

## Offen, bitte vor dem Druck klären

1. **Fotos.** Die drei Fotos sind aus den Entwürfen ausgeschnitten. Sie haben nur eine Auflösung von etwa 50–120 dpi (für den Druck üblich: 300 dpi) und wirken im Druck weich. Am stärksten betrifft das die zwei Fotos innen. Besser wären echte Fotos der Auftraggeberin, mindestens etwa 2500 px an der langen Seite. Austausch: Datei in `quelle/bilder/` unter gleichem Namen ersetzen und neu erzeugen.
2. **Telefonnummer.** Steht nirgends im Entwurf. Ist gerade weggelassen. Trägt man sie in `quelle/assets.js` bei `telefon` ein, erscheint sie automatisch auf Flyer und Karte.
3. **Haßlinghausen.** Amtlich mit ß, im Entwurf steht „Hasslinghausen“. Das ist so übernommen.
4. **Druckerei-Profil.** Falls die Druckerei CMYK verlangt (z. B. ISO Coated v2 / PSO Coated v3), erst das Profil der Druckerei abfragen.

Korrigiert gegenüber dem Entwurf: „Lievolle“ → „Liebevolle“ (Visitenkarte), „Gevelsbenrg“ → „Gevelsberg“ (Flyer innen). Der QR-Code ist echt und führt auf https://www.anila-grabpflege.de.

## Neu erzeugen

`quelle/` enthält Layout (HTML/CSS), Logo und Grafiken (Vektor, `assets.js`), Schriften (SIL Open Font License) und Fotos.
Erzeugt wird mit Chromium/Playwright: `node render.mjs flyer.html flyer.pdf`. Danach werden TrimBox/BleedBox gesetzt (3 mm).
