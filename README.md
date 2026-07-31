# Panorama Viewer

A [SiYuan Note](https://github.com/siyuan-note/siyuan) widget for previewing 360-degree panoramic images and videos, powered by [Photo Sphere Viewer](https://photo-sphere-viewer.js.org/).

[简体中文](./public/README.zh-CN.md) | [English](./public/README.md)

## Development

This package is developed from the parent monorepo workspace.

```bash
pnpm -C workspace install
pnpm -C workspace --filter panorama-viewer run dev
pnpm -C workspace --filter panorama-viewer run check:svelte
pnpm -C workspace --filter panorama-viewer run lint
pnpm -C workspace --filter panorama-viewer run build
```

For development outside a SiYuan widget iframe, copy `.env.example` to `.env.local` and configure the SiYuan service URL and API token. Saving requires a valid widget block ID supplied by SiYuan or the `?id=<block-id>` query parameter.

## Configuration storage

Each widget instance stores its configuration as JSON in the widget block's `custom-config` attribute. The schema is versioned with `schemaVersion` for future migrations.

## License

[AGPL-3.0](./LICENSE)
