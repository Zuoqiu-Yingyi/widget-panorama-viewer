# Panorama Viewer

A 360-degree panoramic image and video viewer for [SiYuan Note](https://github.com/siyuan-note/siyuan), powered by Photo Sphere Viewer 5.15.0.

[简体中文](./README.zh-CN.md) | English

## Features

The settings panel supports every adapter on the Photo Sphere Viewer adapters page:

- Equirectangular images, tiled equirectangular images, and equirectangular videos
- Cubemap images, tiled cubemaps, and cubemap videos
- Dual-fisheye images and dual-fisheye videos

Cubemap images can use six separate face images, one horizontal stripe, or one cross-shaped net. Separate images require URLs for `left`, `front`, `right`, `back`, `top`, and `bottom`. Stripe images support a configurable face order. Top and bottom faces can be flipped when the source orientation requires it.

Tiled adapters currently provide a single-level configuration:

- Equirectangular tile templates must contain `{col}` and `{row}`.
- Cubemap tile templates must contain `{face}`, `{col}`, and `{row}`.
- Both templates may also contain the optional `{level}` placeholder (single-level configurations use level `0`).

All source and tile URLs are resolved with `new URL(value, baseUrl)`, so absolute and relative URLs are accepted. External servers must permit cross-origin access.

Optional Photo Sphere Viewer plugins include Compass, Gyroscope, image Map, geographic Plan (OpenStreetMap by default), Stereo, and Visible Range. Plugin code is loaded only when enabled; Stereo automatically loads its Gyroscope dependency. Map images and Plan tile templates accept absolute or relative URLs (Plan templates retain `{z}`, `{x}`, and `{y}`).

Other features include configurable initial yaw, pitch, zoom, field of view, movement speed and navigation controls; navbar caption and description; idle automatic rotation; video autoplay and mute behavior; per-widget configuration storage; and automatic light/dark appearance. Drag, wheel, Ctrl+wheel, and two-finger interaction switches live in Photo Sphere Viewer's native **Settings** menu and save immediately.

## Usage

1. Insert **Panorama Viewer** from SiYuan's widget menu.
2. Select the widget settings button in the native viewer navbar. This button remains available even when ordinary navbar controls are hidden.
3. Choose an adapter and provide its required URL, cubemap faces, or tile template.
4. Adjust adapter-specific and common viewer options.
5. Select **Apply and save**.

Browser autoplay policies generally require videos to be muted. Tile counts and geometry resolutions must use powers of two; the settings validation reports invalid source, template, face-order, and numeric configurations before saving.

## Dependencies

- [Svelte](https://svelte.dev/)
- [Vite](https://vite.dev/)
- [Flowbite Svelte](https://flowbite-svelte.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Photo Sphere Viewer](https://photo-sphere-viewer.js.org/)

## License

[AGPL-3.0](https://github.com/Zuoqiu-Yingyi/widget-panorama-viewer/blob/main/LICENSE)
