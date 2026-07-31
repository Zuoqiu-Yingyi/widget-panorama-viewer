<script lang="ts">
    import { onMount } from "svelte";

    import type { ViewerConfig as PhotoSphereViewerConfig, Viewer } from "@photo-sphere-viewer/core";

    import type { PanoramaConfig } from "../lib/config";

    interface Props {
        config: PanoramaConfig;
        source: string;
        loadingLabel: string;
        onViewerError: (message: string) => void;
    }

    const { config, source, loadingLabel, onViewerError }: Props = $props();
    let container: HTMLDivElement;
    let loading = $state(true);

    onMount(() => {
        let viewer: undefined | Viewer;
        let disposed = false;

        const createViewer = async () => {
            try {
                const [
                    { Viewer: ViewerConstructor },
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

                let panorama: { source: string } | string = source;
                if (config.media.type === "video") {
                    const [
                        { EquirectangularVideoAdapter },
                        { VideoPlugin },
                    ] = await Promise.all([
                        import("@photo-sphere-viewer/equirectangular-video-adapter"),
                        import("@photo-sphere-viewer/video-plugin"),
                    ]);
                    options.adapter = EquirectangularVideoAdapter.withConfig({
                        autoplay: config.video.autoplay,
                        muted: config.video.muted,
                    });
                    plugins.push(VideoPlugin);
                    panorama = { source };
                }

                viewer = new ViewerConstructor(options);
                await viewer.setPanorama(panorama);
                if (!disposed) {
                    loading = false;
                }
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

<div
    bind:this={container}
    class="h-full w-full bg-gray-950"
></div>

{#if loading}
    <div class="pointer-events-none absolute inset-0 flex items-center justify-center bg-gray-950/70 text-sm text-white">
        <span class="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
        {loadingLabel}
    </div>
{/if}
