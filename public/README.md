# Panorama Viewer

A 360-degree panoramic image and video viewer for [SiYuan Note](https://github.com/siyuan-note/siyuan).

[简体中文](./README.zh-CN.md) | English

## Features

- Preview equirectangular 360-degree images.
- Preview equirectangular 360-degree videos with play and volume controls.
- Accept absolute or relative URLs parseable by `new URL()`, such as `assets/panorama.jpg` and `/assets/panorama.jpg`.
- Configure initial yaw, pitch, zoom, field of view, movement, mouse, touch, and navigation controls.
- Enable idle automatic rotation with configurable speed and delay.
- Configure video autoplay and mute behavior.
- Store independent settings in each widget block's `custom-config` attribute.
- Follow SiYuan's light and dark appearance.
- Suggest the media type from common file extensions without overriding your explicit selection.

## Usage

1. Insert **Panorama Viewer** from SiYuan's widget menu.
2. Open the settings button in the upper-right corner.
3. Select image or video and enter the media URL.
4. Adjust viewing and interaction options.
5. Select **Apply and save**.

External servers must permit cross-origin access to the media. Browser autoplay policies generally require videos to be muted.

## Dependencies

- [Svelte](https://svelte.dev/)
- [Vite](https://vite.dev/)
- [Flowbite Svelte](https://flowbite-svelte.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Photo Sphere Viewer](https://photo-sphere-viewer.js.org/)

## License

[AGPL-3.0](https://github.com/Zuoqiu-Yingyi/widget-panorama-viewer/blob/main/LICENSE)
