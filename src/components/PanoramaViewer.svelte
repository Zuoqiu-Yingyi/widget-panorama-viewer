<script lang="ts">
    import { onMount } from "svelte";

    import { applyUrlTemplate, CUBEMAP_FACES, resolveMediaUrl } from "../lib/config";

    import type { ViewerConfig as PhotoSphereViewerConfig, Viewer } from "@photo-sphere-viewer/core";
    import type { Cubemap, CubemapFaces as PsvCubemapFace } from "@photo-sphere-viewer/cubemap-adapter";

    import type { PanoramaConfig } from "../lib/config";

    interface Props {
        baseUrl: string;
        config: PanoramaConfig;
        loadingLabel: string;
        onViewerError: (message: string) => void;
    }

    const { baseUrl, config, loadingLabel, onViewerError }: Props = $props();
    let container: HTMLDivElement;
    let loading = $state(true);

    function source(): string {
        return resolveMediaUrl(config.media.url, baseUrl);
    }

    function cubemapFaces(): Cubemap {
        return Object.fromEntries(CUBEMAP_FACES.map((face) => [face, resolveMediaUrl(config.cubemap.faces[face], baseUrl)])) as Cubemap;
    }

    onMount(() => {
        let viewer: undefined | Viewer;
        let disposed = false;

        const createViewer = async () => {
            try {
                const [
                    { EquirectangularAdapter, Viewer: ViewerConstructor },
                    { AutorotatePlugin },
                ] = await Promise.all([
                    import("@photo-sphere-viewer/core"),
                    import("@photo-sphere-viewer/autorotate-plugin"),
                ]);
                const plugins: NonNullable<PhotoSphereViewerConfig["plugins"]> = [
                    [AutorotatePlugin, {
                        autostartDelay: config.autorotate.delay,
                        autostartOnIdle: config.autorotate.enabled,
                        autorotateSpeed: `${config.autorotate.speed}rpm`,
                    }],
                ];
                const options: PhotoSphereViewerConfig = {
                    container,
                    defaultPitch: `${config.view.defaultPitch}deg`,
                    defaultYaw: `${config.view.defaultYaw}deg`,
                    defaultZoomLvl: config.view.defaultZoomLvl,
                    maxFov: config.view.maxFov,
                    minFov: config.view.minFov,
                    mousemove: config.interaction.mousemove,
                    mousewheel: config.interaction.mousewheel,
                    moveSpeed: config.interaction.moveSpeed,
                    navbar: config.navbar.visible,
                    plugins,
                    touchmoveTwoFingers: config.interaction.touchmoveTwoFingers,
                };
                let panorama: unknown;

                switch (config.adapter) {
                    case "equirectangular":
                        options.adapter = EquirectangularAdapter.withConfig(config.equirectangular);
                        panorama = source();
                        break;
                    case "equirectangular-tiles": {
                        const { EquirectangularTilesAdapter } = await import("@photo-sphere-viewer/equirectangular-tiles-adapter");
                        options.adapter = EquirectangularTilesAdapter.withConfig({
                            antialias: config.equirectangularTiles.antialias,
                            baseBlur: config.equirectangularTiles.baseBlur,
                            resolution: config.equirectangularTiles.resolution,
                            showErrorTile: config.equirectangularTiles.showErrorTile,
                            useXmpData: config.equirectangularTiles.useXmpData,
                        });
                        panorama = {
                            width: config.equirectangularTiles.width,
                            cols: config.equirectangularTiles.cols,
                            rows: config.equirectangularTiles.rows,
                            baseUrl: config.equirectangularTiles.baseUrl.trim()
                                ? resolveMediaUrl(config.equirectangularTiles.baseUrl, baseUrl)
                                : undefined,
                            tileUrl: (col: number, row: number) => applyUrlTemplate(
                                config.equirectangularTiles.tileUrl,
                                { col, row, level: 0 },
                                baseUrl,
                            ),
                        };
                        break;
                    }
                    case "equirectangular-video": {
                        const [{ EquirectangularVideoAdapter }, { VideoPlugin }] = await Promise.all([
                            import("@photo-sphere-viewer/equirectangular-video-adapter"),
                            import("@photo-sphere-viewer/video-plugin"),
                        ]);
                        options.adapter = EquirectangularVideoAdapter.withConfig({
                            ...config.video,
                            ...config.equirectangularVideo,
                        });
                        plugins.push(VideoPlugin);
                        panorama = { source: source() };
                        break;
                    }
                    case "cubemap": {
                        const { CubemapAdapter } = await import("@photo-sphere-viewer/cubemap-adapter");
                        options.adapter = CubemapAdapter;
                        if (config.cubemap.layout === "separate") {
                            panorama = {
                                type: "separate",
                                paths: cubemapFaces(),
                                flipTopBottom: config.cubemap.flipTopBottom,
                            };
                        }
                        else if (config.cubemap.layout === "stripe") {
                            panorama = {
                                type: "stripe",
                                path: source(),
                                order: config.cubemap.stripeOrder as PsvCubemapFace[],
                                flipTopBottom: config.cubemap.flipTopBottom,
                            };
                        }
                        else {
                            panorama = { type: "net", path: source() };
                        }
                        break;
                    }
                    case "cubemap-tiles": {
                        const { CubemapTilesAdapter } = await import("@photo-sphere-viewer/cubemap-tiles-adapter");
                        options.adapter = CubemapTilesAdapter.withConfig({
                            antialias: config.cubemapTiles.antialias,
                            baseBlur: config.cubemapTiles.baseBlur,
                            showErrorTile: config.cubemapTiles.showErrorTile,
                        });
                        panorama = {
                            faceSize: config.cubemapTiles.faceSize,
                            nbTiles: config.cubemapTiles.nbTiles,
                            flipTopBottom: config.cubemapTiles.flipTopBottom,
                            tileUrl: (face: string, col: number, row: number) => applyUrlTemplate(
                                config.cubemapTiles.tileUrl,
                                { face, col, row, level: 0 },
                                baseUrl,
                            ),
                        };
                        break;
                    }
                    case "cubemap-video": {
                        const [{ CubemapVideoAdapter }, { VideoPlugin }] = await Promise.all([
                            import("@photo-sphere-viewer/cubemap-video-adapter"),
                            import("@photo-sphere-viewer/video-plugin"),
                        ]);
                        options.adapter = CubemapVideoAdapter.withConfig(config.video);
                        plugins.push(VideoPlugin);
                        panorama = { source: source(), equiangular: config.cubemapVideo.equiangular };
                        break;
                    }
                    case "dual-fisheye": {
                        const { DualFisheyeAdapter } = await import("@photo-sphere-viewer/dual-fisheye-adapter");
                        options.adapter = DualFisheyeAdapter;
                        panorama = source();
                        break;
                    }
                    case "dual-fisheye-video": {
                        const [{ DualFisheyeVideoAdapter }, { VideoPlugin }] = await Promise.all([
                            import("@photo-sphere-viewer/dual-fisheye-adapter"),
                            import("@photo-sphere-viewer/video-plugin"),
                        ]);
                        options.adapter = DualFisheyeVideoAdapter.withConfig(config.video);
                        plugins.push(VideoPlugin);
                        panorama = { source: source() };
                        break;
                    }
                }

                viewer = new ViewerConstructor(options);
                await viewer.setPanorama(panorama);
                if (!disposed)
                    loading = false;
            }
            catch (error) {
                if (!disposed) {
                    loading = false;
                    onViewerError(error instanceof Error ? error.message : String(error));
                }
            }
        };

        void createViewer();
        return () => {
            disposed = true;
            viewer?.destroy();
        };
    });
</script>

<div bind:this={container} class="h-full w-full bg-gray-950"></div>

{#if loading}
    <div class="pointer-events-none absolute inset-0 flex items-center justify-center bg-gray-950/70 text-sm text-white">
        <span class="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
        {loadingLabel}
    </div>
{/if}
