<script lang="ts">
    import { onMount } from "svelte";

    import { applyUrlTemplate, CUBEMAP_FACES, resolveMediaUrl } from "../lib/config";

    import type { NavbarCustomButton, ViewerConfig as PhotoSphereViewerConfig, Viewer } from "@photo-sphere-viewer/core";
    import type { Cubemap, CubemapFaces as PsvCubemapFace } from "@photo-sphere-viewer/cubemap-adapter";
    import type { SettingsPlugin } from "@photo-sphere-viewer/settings-plugin";

    import type { PanoramaConfig } from "../lib/config";

    type InteractionKey = "mousemove" | "mousewheel" | "mousewheelCtrlKey" | "touchmoveTwoFingers";

    interface Props {
        baseUrl: string;
        config: PanoramaConfig;
        loadingLabel: string;
        nativeSettingsLabel: string;
        openSettingsLabel: string;
        interactionLabels: Record<InteractionKey, string>;
        onOpenSettings: () => void;
        onInteractionChange: (key: InteractionKey, value: boolean) => Promise<void>;
        onViewerError: (message: string) => void;
    }

    const {
        baseUrl,
        config,
        loadingLabel,
        nativeSettingsLabel,
        openSettingsLabel,
        interactionLabels,
        onOpenSettings,
        onInteractionChange,
        onViewerError,
    }: Props = $props();
    let container: HTMLDivElement;
    let loading = $state(true);

    const settingsIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M6 14v6"/></svg>`;

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
                const [{ EquirectangularAdapter, Viewer: ViewerConstructor }, { SettingsPlugin: SettingsPluginConstructor }] = await Promise.all([
                    import("@photo-sphere-viewer/core"),
                    import("@photo-sphere-viewer/settings-plugin"),
                ]);
                const plugins: NonNullable<PhotoSphereViewerConfig["plugins"]> = [SettingsPluginConstructor];
                const navbar: NonNullable<PhotoSphereViewerConfig["navbar"]> = [];
                const externalSettingsButton: NavbarCustomButton = {
                    id: "widget-settings",
                    title: openSettingsLabel,
                    content: settingsIcon,
                    collapsable: false,
                    tabbable: true,
                    onClick: onOpenSettings,
                };

                if (config.navbar.visible) {
                    navbar.push("zoom", "move", "download", "autorotate");
                    if (config.navbar.description.trim())
                        navbar.push("description");
                    navbar.push("caption");
                    if (config.gyroscope.enabled)
                        navbar.push("gyroscope");
                    if (config.stereo.enabled)
                        navbar.push("stereo");
                }
                navbar.push("settings", externalSettingsButton);
                if (config.navbar.visible)
                    navbar.push("fullscreen");

                const { AutorotatePlugin } = await import("@photo-sphere-viewer/autorotate-plugin");
                plugins.push([AutorotatePlugin, {
                    autostartDelay: config.autorotate.enabled
                        ? config.autorotate.delay
                        : null,
                    autostartOnIdle: config.autorotate.enabled,
                    autorotateSpeed: `${config.autorotate.speed}rpm`,
                }]);
                if (config.compass.enabled) {
                    const { CompassPlugin } = await import("@photo-sphere-viewer/compass-plugin");
                    plugins.push([CompassPlugin, {
                        size: config.compass.size,
                        position: config.compass.position,
                        coneColor: config.compass.coneColor,
                        navigation: config.compass.navigation,
                        resetPitch: config.compass.resetPitch,
                        navigationColor: config.compass.navigationColor,
                        hotspotColor: config.compass.hotspotColor,
                    }]);
                }

                let gyroscopeLoaded = false;
                if (config.gyroscope.enabled || config.stereo.enabled) {
                    const { GyroscopePlugin } = await import("@photo-sphere-viewer/gyroscope-plugin");
                    plugins.push([GyroscopePlugin, {
                        touchmove: config.gyroscope.touchmove,
                        roll: config.gyroscope.roll,
                        absolutePosition: config.gyroscope.absolutePosition,
                        moveMode: config.gyroscope.moveMode,
                    }]);
                    gyroscopeLoaded = true;
                }
                if (config.stereo.enabled) {
                    if (!gyroscopeLoaded)
                        throw new Error("Stereo requires the gyroscope plugin");
                    const { StereoPlugin } = await import("@photo-sphere-viewer/stereo-plugin");
                    plugins.push(StereoPlugin);
                }
                if (config.map.enabled) {
                    const { MapPlugin } = await import("@photo-sphere-viewer/map-plugin");
                    plugins.push([MapPlugin, {
                        imageUrl: resolveMediaUrl(config.map.imageUrl, baseUrl),
                        center: { x: config.map.centerX, y: config.map.centerY },
                        rotation: `${config.map.rotation}deg`,
                        shape: config.map.shape,
                        size: config.map.size,
                        position: config.map.position,
                        visibleOnLoad: config.map.visibleOnLoad,
                        pinSize: config.map.pinSize,
                        coneColor: config.map.coneColor,
                        coneSize: config.map.coneSize,
                        static: config.map.static,
                        defaultZoom: config.map.defaultZoom,
                        minZoom: config.map.minZoom,
                        maxZoom: config.map.maxZoom,
                        minimizeOnHotspotClick: config.map.minimizeOnHotspotClick,
                        buttons: { ...config.map.buttons },
                    }]);
                }
                if (config.plan.enabled) {
                    const { PlanPlugin } = await import("@photo-sphere-viewer/plan-plugin");
                    plugins.push([PlanPlugin, {
                        coordinates: [config.plan.longitude, config.plan.latitude, config.plan.altitude],
                        bearing: `${config.plan.bearing}deg`,
                        size: { width: config.plan.width, height: config.plan.height },
                        position: config.plan.position,
                        visibleOnLoad: config.plan.visibleOnLoad,
                        pinSize: config.plan.pinSize,
                        defaultZoom: config.plan.defaultZoom,
                        minimizeOnHotspotClick: config.plan.minimizeOnHotspotClick,
                        buttons: { ...config.plan.buttons },
                        layers: [{
                            urlTemplate: resolveMediaUrl(config.plan.layer.urlTemplate, baseUrl),
                            name: config.plan.layer.name,
                            attribution: config.plan.layer.attribution,
                        }],
                    }]);
                }
                if (config.visibleRange.enabled) {
                    const { VisibleRangePlugin } = await import("@photo-sphere-viewer/visible-range-plugin");
                    plugins.push([VisibleRangePlugin, {
                        horizontalRange: config.visibleRange.horizontalEnabled
                            ? [`${config.visibleRange.horizontalMin}deg`, `${config.visibleRange.horizontalMax}deg`]
                            : undefined,
                        verticalRange: config.visibleRange.verticalEnabled
                            ? [`${config.visibleRange.verticalMin}deg`, `${config.visibleRange.verticalMax}deg`]
                            : undefined,
                        usePanoData: config.visibleRange.usePanoData,
                    }]);
                }

                const options: PhotoSphereViewerConfig = {
                    container,
                    caption: config.navbar.caption || undefined,
                    description: config.navbar.description || undefined,
                    defaultPitch: `${config.view.defaultPitch}deg`,
                    defaultYaw: `${config.view.defaultYaw}deg`,
                    defaultZoomLvl: config.view.defaultZoomLvl,
                    lang: { settings: nativeSettingsLabel },
                    maxFov: config.view.maxFov,
                    minFov: config.view.minFov,
                    mousemove: config.interaction.mousemove,
                    mousewheel: config.interaction.mousewheel,
                    mousewheelCtrlKey: config.interaction.mousewheelCtrlKey,
                    moveSpeed: config.interaction.moveSpeed,
                    navbar,
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
                        options.adapter = EquirectangularVideoAdapter.withConfig({ ...config.video, ...config.equirectangularVideo });
                        plugins.push(VideoPlugin);
                        panorama = { source: source() };
                        break;
                    }
                    case "cubemap": {
                        const { CubemapAdapter } = await import("@photo-sphere-viewer/cubemap-adapter");
                        options.adapter = CubemapAdapter;
                        if (config.cubemap.layout === "separate") {
                            panorama = { type: "separate", paths: cubemapFaces(), flipTopBottom: config.cubemap.flipTopBottom };
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
                const settings = viewer.getPlugin<SettingsPlugin>(SettingsPluginConstructor);
                const interactionState = { ...config.interaction };
                for (const key of ["mousemove", "mousewheel", "mousewheelCtrlKey", "touchmoveTwoFingers"] as const) {
                    settings.addSetting({
                        id: `interaction-${key}`,
                        type: "toggle",
                        label: interactionLabels[key],
                        active: () => interactionState[key],
                        toggle: () => {
                            const value = !interactionState[key];
                            interactionState[key] = value;
                            viewer?.setOptions({ [key]: value });
                            void onInteractionChange(key, value).catch((error) => onViewerError(error instanceof Error ? error.message : String(error)));
                        },
                    });
                }
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
