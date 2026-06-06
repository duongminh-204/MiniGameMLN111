# Avatar Sprite Assets

The game uses a **layered SVG sprite system** in `js/avatar-renderer.js`.
Replace or extend with PNG sprite sheets per state:

```
assets/avatars/
├── idle/       # Breathing loop frames
├── happy/      # Jump / correct answer
├── sad/        # Wrong answer
├── victory/    # Quiz complete dance
└── skins/      # Per-skin outfit overlays
```

To use image sprites, extend `AvatarRenderer._buildHTML()` to render
`<img src="assets/avatars/idle/frame1.png">` layers instead of inline SVG.
