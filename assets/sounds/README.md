# Sound Assets (Placeholders)

Drop audio files here and load them in `js/audio.js`:

| File | Usage |
|------|-------|
| `click.mp3` | Button click |
| `correct.mp3` | Correct answer |
| `wrong.mp3` | Wrong answer |
| `tick.mp3` | Timer tick (optional) |

Example integration in `app.js` on init:

```js
await audio.loadSound('click', 'assets/sounds/click.mp3');
await audio.loadSound('correct', 'assets/sounds/correct.mp3');
await audio.loadSound('wrong', 'assets/sounds/wrong.mp3');
```

Until files are added, the game uses Web Audio synthesized tones.
