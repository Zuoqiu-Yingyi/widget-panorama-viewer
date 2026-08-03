<div align="center">
<img alt="icon" src="https://cdn.jsdelivr.net/gh/Zuoqiu-Yingyi/widget-panorama-viewer@main/public/icon.png" style="width: 8em; height: 8em;">

---
[![GitHub release (latest by date including pre-releases)](https://img.shields.io/github/v/release/Zuoqiu-Yingyi/widget-panorama-viewer?include_prereleases&style=flat-square)](https://github.com/Zuoqiu-Yingyi/widget-panorama-viewer/releases/latest)
[![GitHub Release Date](https://img.shields.io/github/release-date/Zuoqiu-Yingyi/widget-panorama-viewer?style=flat-square)](https://github.com/Zuoqiu-Yingyi/widget-panorama-viewer/releases/latest)
[![GitHub License](https://img.shields.io/github/license/Zuoqiu-Yingyi/widget-panorama-viewer?style=flat-square)](https://github.com/Zuoqiu-Yingyi/widget-panorama-viewer/blob/main/LICENSE)
[![GitHub last commit](https://img.shields.io/github/last-commit/Zuoqiu-Yingyi/widget-panorama-viewer?style=flat-square)](https://github.com/Zuoqiu-Yingyi/widget-panorama-viewer/commits/main)
![GitHub repo size](https://img.shields.io/github/repo-size/Zuoqiu-Yingyi/widget-panorama-viewer?style=flat-square)
![hits](https://hits.b3log.org/Zuoqiu-Yingyi/widget-panorama-viewer.svg)
[![GitHub all releases](https://img.shields.io/github/downloads/Zuoqiu-Yingyi/widget-panorama-viewer/total?style=flat-square)](https://github.com/Zuoqiu-Yingyi/widget-panorama-viewer/releases)
---

[简体中文](./README.zh-CN.md) \| English

---

</div>

# Panorama Viewer

A 360-degree panoramic image and video viewer for [SiYuan Note](https://github.com/siyuan-note/siyuan), powered by [Photo Sphere Viewer](https://photo-sphere-viewer.js.org/).

## PREVIEW

![preview](https://cdn.jsdelivr.net/gh/Zuoqiu-Yingyi/widget-panorama-viewer@main/public/preview.png)

## FUNCTIONAL DESCRIPTION

- Display 360-degree panoramic images and videos.
  - Equirectangular images, tiled equirectangular images, and equirectangular videos
  - Cubemap images, tiled cubemaps, and cubemap videos
  - Dual-fisheye images and dual-fisheye videos
- Cubemap image sources.
  - Six separate face images
    - URLs for `left`, `front`, `right`, `back`, `top`, and `bottom`
  - One horizontal stripe image
    - Configurable face order
  - One cross-shaped net image
  - Flip the top and bottom faces when the source orientation requires it
- Tiled adapters (single-level configuration).
  - Equirectangular tile templates must contain `{col}` and `{row}`
  - Cubemap tile templates must contain `{face}`, `{col}`, and `{row}`
  - Both templates may also contain the optional `{level}` placeholder (single-level configurations use level `0`)
- URL resolution.
  - All source and tile URLs are resolved with `new URL(value, baseUrl)`
  - Absolute and relative URLs are accepted
  - External servers must permit cross-origin access
- Optional Photo Sphere Viewer plugins.
  - `Compass`
  - `Gyroscope`
  - `Map`
    - Map image
  - `Plan`
    - OpenStreetMap by default
    - Plan tile templates retain `{z}`, `{x}`, and `{y}`
  - `Stereo`
    - Automatically loads its `Gyroscope` dependency
  - `Visible Range`
  - Plugin code is loaded only when enabled
- Common viewer options.
  - Initial yaw, pitch, zoom, and field of view
  - Movement speed and navigation controls
  - Navbar caption and description
  - Idle automatic rotation
  - Video autoplay and mute behavior
- Per-widget configuration storage.
- Automatic light/dark appearance.
- Drag, wheel, Ctrl+wheel, and two-finger interaction switches live in Photo Sphere Viewer's native **Settings** menu and save immediately.

## START

The widget has been put on the shelves at [SiYuan community bazaar](https://github.com/siyuan-note/bazaar) and can be installed directly in the Bazaar.

## USAGE

1. Insert **Panorama Viewer** from SiYuan's widget menu.
2. Select the widget settings button in the native viewer navbar. This button remains available even when ordinary navbar controls are hidden.
3. Choose an adapter and provide its required URL, cubemap faces, or tile template.
4. Adjust adapter-specific and common viewer options.
5. Select **Apply and save**.

> Browser autoplay policies generally require videos to be muted. Tile counts and geometry resolutions must use powers of two; the settings validation reports invalid source, template, face-order, and numeric configurations before saving.

## REFERENCE & THANKS

## DEPENDENCIES

| Author                                              | Project                                                                                                                                             | License                                                                                  |
| :-------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------- |
| **[sveltejs](https://github.com/sveltejs)**         | [sveltejs/svelte: Cybernetically enhanced web apps](https://github.com/sveltejs/svelte)                                                             | _[MIT license](https://github.com/sveltejs/svelte/blob/main/LICENSE.md)_                 |
| **[vitejs](https://github.com/vitejs)**             | [vitejs/vite: Next generation frontend tooling. It's fast!](https://github.com/vitejs/vite)                                                         | _[MIT license](https://github.com/vitejs/vite/blob/main/LICENSE.md)_                     |
| **[themesberg](https://github.com/themesberg)**     | [themesberg/flowbite-svelte: Flowbite components for Svelte](https://github.com/themesberg/flowbite-svelte)                                         | _[MIT license](https://github.com/themesberg/flowbite-svelte/blob/main/LICENSE)_         |
| **[tailwindlabs](https://github.com/tailwindlabs)** | [tailwindlabs/tailwindcss: A utility-first CSS framework for rapidly building custom user interfaces.](https://github.com/tailwindlabs/tailwindcss) | _[MIT license](https://github.com/tailwindlabs/tailwindcss/blob/master/LICENSE)_         |
| **[mistic100](https://github.com/mistic100)**       | [mistic100/Photo-Sphere-Viewer: A JavaScript library to display 360° panoramas](https://github.com/mistic100/Photo-Sphere-Viewer)                   | _[MIT license](https://github.com/mistic100/Photo-Sphere-Viewer/blob/master/LICENSE.md)_ |

ps: Sort by introduction time.

## CHANGE LOGS

[CHANGELOG.md](https://github.com/Zuoqiu-Yingyi/widget-panorama-viewer/blob/main/CHANGELOG.md)
