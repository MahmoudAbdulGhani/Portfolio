# Three-device showcase implementation

Each featured project uses three CMS screenshots concurrently. The screen mapping is in `project-cover-directions.ts`; it does not copy private data or invent product interfaces. DeviceScreen owns its measured viewport, screenshot and GSAP timeline. Image loading, page visibility, reduced motion, active project selection, pause and resize gate motion. Long pages scroll naturally; short desktop captures use a readable enlarged crop to provide a small, bounded vertical movement. Full originals remain available by clicking any screen.

The split hero reads the CMS title, retains introduction/location/availability and project/CV actions on the left, places the real profile photo centrally, and moves Software Engineer and focus areas to the right. The portrait makes two 3D turns (720 degrees) over 1.6 seconds on entry, then settles. Phone layout stacks the role text and portrait.

Built-in image generation supplied three independent neutral graphite raster device frames, converted to WebP for production without replacing any project screen content. Prompts requested straight-on, isolated laptop (16:10), phone (9:19.5) and tablet (3:4), no logos/text, transparent exterior and a flat screen matte for measured live-screen placement. Asset paths: `public/projects/devices/laptop.webp`, `phone.webp`, `tablet.webp`. Source outputs retained outside the repository in generated_images. The laptop exterior is clipped to the measured device outline. Screen bounds are measured from the generated assets and covered by separate interactive screenshot masks.

No backend, authentication, CMS schema or project detail data changed. Build output is ignored. QA evidence and comparison are in this directory; the final gate is root `design-qa.md`.
