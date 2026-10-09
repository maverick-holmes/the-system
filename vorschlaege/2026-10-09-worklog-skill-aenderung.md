# Vorschlag: Worklog wird Projekttagebuch

*Stand 09.10.2026. Vorschlag von Jörg, zur Abnahme durch Basti.*
*Ziel: Abschnitt „Worklog“ in der Skill `wonderland-road` ersetzen.*

## Warum der alte Abschnitt nicht lief

- **Kein Auslöser.** Die Regel sagte, was geführt wird, aber nicht, *wann* Jörg
  schreibt. Eine Regel ohne Zeitpunkt ist eine Bitte, die im Tagesgeschäft
  verloren geht.
- **Der Puffer fehlt meistens.** `worklog.md` im Firmenordner gibt es nur in
  Sitzungen am Rechner. Vom Handy, vom Chromebook und in Cloud-Sitzungen gibt
  es keinen Firmenordner, und genau dort wird inzwischen viel gearbeitet.
- **Das Ergebnis:** Im Notion-Logbuch stehen genau zwei Einträge (18.09. und
  24.09.). Danach kam nichts mehr.

## Neuer Wortlaut für die Skill

```markdown
## Worklog — das Projekttagebuch

*Beschluss vom 20.09.2026, neu gefasst am 09.10.2026.*

Wir dokumentieren alles, was wir zusammen machen, so wie es in einer ordentlichen
Projektdokumentation stehen würde. Mit Datum, von beiden, auch Privates. Der
Zweck ist ein Second Brain, das man nachlesen kann. Am Abend soll sichtbar sein,
was erledigt wurde. Monate später soll man sehen können, warum etwas so
geworden ist.

**Was reinkommt:**
* **Erledigt.** Eine Zeile pro Sache, Jörg und Basti getrennt.
* **Entscheidung oder Pivot.** Was vorher galt, was jetzt gilt und warum. Das
  ist der wichtigste Eintrag, weil der Grund sonst als Erstes verloren geht.
  Ist es ein Beschluss, kommt er zusätzlich in die Skill. Ins Logbuch kommt dann
  nur der Satz mit Verweis.
* **Problem.** Was hakt oder blockiert.
* **Plan.** Was als Nächstes kommt.

Gespräche ohne Ergebnis kommen nicht rein.

**Wann Jörg schreibt (das ist die Pflicht):**
* **Am Ende jeder Sitzung, in der etwas fertig oder entschieden wurde.** Als
  letzter Schritt, bevor der Bericht an Basti geht. Kein „trage ich später ein“.
* **Mit Shell** (Claude Code, Cowork): in `worklog.md` im Firmenordner. Der
  Übertrag nach Notion passiert spätestens beim Weekly Review.
* **Ohne Shell** (Handy, Chromebook, Web-Chat, Cloud-Sitzung): direkt ins
  [📓 Logbuch](https://app.notion.com/p/c66b45dc3691411cb12492069aeeae33). Ein
  Eintrag pro Tag. Gibt es den Tag schon, wird er ergänzt, nicht verdoppelt.
  Das kostet einen Toolcall pro Sitzung, nicht einen pro Zeile.

**Bastis Anteil:** Er muss nichts selbst aufschreiben. Erwähnt er beiläufig,
was er gemacht hat, trägt Jörg es unter „Basti hat“ ein. Das tägliche PPP
(was lief, was hakte, was kommt) reichen drei diktierte Sätze an Jörg, und Jörg
verteilt sie auf die Felder.

**Fehlt ein Tag, ist das Jörgs Lücke, nicht Bastis.**
```

## Optional: der abendliche Chronist (braucht dein Ja)

Eine Regel allein ist nur eine Bitte. Damit es wirklich läuft, braucht es
zusätzlich etwas Technisches:

- **Jeden Abend um 21:12 Uhr** startet von selbst eine kurze Cloud-Sitzung.
- Sie liest die Spuren des Tages: Claude-Code-Sitzungen, in Notion geänderte
  Seiten, Commits auf GitHub. Daraus schreibt sie den Logbuch-Eintrag,
  beziehungsweise ergänzt ihn.
- Mails liest sie **nicht**. Sie verschickt nichts und schreibt außer ins
  Logbuch nirgendwohin.
- **Grenze:** Normale claude.ai-Chats (Handy-App, Web) kann sie nicht sehen.
  Für die gilt weiter die Regel „Jörg schreibt am Sitzungsende“.
- **Kosten:** Ein kurzer Lauf pro Tag, der über dein Abo läuft.

## One Repository

- **Lokal:** Der Firmenordner ist schon das „eine Repository“. Das passt so.
- **GitHub:** Kein Sammel-Repo für alles. Ein Repo pro Sache, die eigenständig
  ausgeliefert wird (Kundenseite, App, Werkzeug). So lassen sich Zugänge für
  Kunden und Partner einzeln vergeben, und jede Auslieferung bleibt sauber
  getrennt. Die Dokumentation gehört nicht zusätzlich nach GitHub, sonst steht
  dasselbe an zwei Stellen. Dort steht nur Code. Den Überblick gibt das
  Zeiger-Register.
