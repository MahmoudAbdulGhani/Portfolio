# Original laptop assets

The shared Three.js model in `src/lib/laptop-model.ts` is authored for this portfolio. No commercial device asset or copied demo source is used. Runtime geometry, offline frames and static posters derive from the same mesh and `src/lib/laptop-motion.ts` poses. Existing CMS screenshots are composited with contain sizing; they are not fabricated product UI.

Regenerate from the repository root with installed project dependencies, Node supporting `--experimental-strip-types`, Python, NumPy and Pillow:

```sh
node --experimental-strip-types scripts/laptop-assets/export-model.mjs
python scripts/laptop-assets/render-frames.py
python scripts/laptop-assets/render-posters.py
python scripts/laptop-assets/render-atlases.py
```

`export-model.mjs` flattens the real mesh into temporary `model-data.json`. The CPU renderer uses perspective projection, depth buffering, lighting and a contact shadow to produce 46 transparent 1024×640 frames. Posters use pose 27, matching the open hold, and project the real screenshots onto its physical display. The packer creates six 2816×880 atlases containing eight 704×440 slots each; the final atlas has two unused slots.

Only the six atlases, five project posters and provenance manifest in `public/projects/cinematic/laptop/` are shipped. Intermediate model data and individual frames are ignored. These intermediates can be removed after regeneration; the runtime does not request them. Model or pose changes require regenerating all final assets and rerunning the geometry tests. Changes to a mapped screenshot require regenerating its poster. Future CMS entries without a poster retain their actual screenshot fallback.

The software frames and WebGL model share geometry and camera; CPU lighting approximates the GPU material path. Hardware appearance and performance must be checked on real WebGL-capable devices before release.
