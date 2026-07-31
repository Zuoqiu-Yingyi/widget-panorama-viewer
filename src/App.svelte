<script lang="ts">
    import { Button, Input, Label, Select, Textarea, Toggle } from "flowbite-svelte";
    import { untrack } from "svelte";

    import {
        applyUrlTemplate,
        cloneConfig,
        CUBEMAP_FACES,
        DEFAULT_CONFIG,
        hasConfiguredSource,
        inferMediaType,
        isVideoAdapter,
        OVERLAY_POSITIONS,
        resolveMediaUrl,
    } from "./lib/config";
    import { createTranslator, getViewerLanguage } from "./lib/i18n";

    import PanoramaViewer from "./components/PanoramaViewer.svelte";

    import type { AdapterId, CubemapFace, PanoramaConfig } from "./lib/config";
    import type { MessageKey } from "./lib/i18n";
    import type { WidgetContext } from "./lib/siyuan";

    interface Props { context: WidgetContext }

    const { context }: Props = $props();
    const initialContext = untrack(() => context);
    const initialConfig = cloneConfig(initialContext.config);
    const t = createTranslator(initialContext.locale);
    const viewerLanguage = getViewerLanguage(initialContext.locale);

    let activeConfig = $state(cloneConfig(initialConfig));
    let draft = $state(cloneConfig(initialConfig));
    let stripeOrderText = $state(initialConfig.cubemap.stripeOrder.join(", "));
    let drawerOpen = $state(!hasConfiguredSource(initialConfig));
    let viewerKey = $state(0);
    let saving = $state(false);
    let notice = $state("");
    let noticeIsError = $state(false);
    let errorMessage = $state("");
    let viewerError = $state("");
    const configured = $derived(hasConfiguredSource(activeConfig));
    const videoAdapter = $derived(isVideoAdapter(draft.adapter));

    const adapters = [
        { value: "equirectangular", name: t("equirectangular") },
        { value: "equirectangular-tiles", name: t("equirectangularTiles") },
        { value: "equirectangular-video", name: t("equirectangularVideo") },
        { value: "cubemap", name: t("cubemap") },
        { value: "cubemap-tiles", name: t("cubemapTiles") },
        { value: "cubemap-video", name: t("cubemapVideo") },
        { value: "dual-fisheye", name: t("dualFisheye") },
        { value: "dual-fisheye-video", name: t("dualFisheyeVideo") },
    ];
    const layouts = [
        { value: "separate", name: t("layoutSeparate") },
        { value: "stripe", name: t("layoutStripe") },
        { value: "net", name: t("layoutNet") },
    ];
    const positions = OVERLAY_POSITIONS.map((value) => ({ value, name: t(value.replace(" ", "") as MessageKey) }));
    const mapShapes = [{ value: "round", name: t("round") }, { value: "square", name: t("square") }];
    const moveModes = [{ value: "smooth", name: t("smooth") }, { value: "fast", name: t("fast") }];

    function usesSingleUrl(config: PanoramaConfig): boolean {
        return config.adapter !== "equirectangular-tiles"
            && config.adapter !== "cubemap-tiles"
            && !(config.adapter === "cubemap" && config.cubemap.layout === "separate");
    }

    function suggestAdapterFromUrl(): void {
        const mediaType = inferMediaType(draft.media.url);
        if (draft.adapter === "equirectangular" && mediaType === "video")
            draft.adapter = "equirectangular-video";
        else if (draft.adapter === "equirectangular-video" && mediaType === "image")
            draft.adapter = "equirectangular";
    }

    function faceLabel(face: CubemapFace): MessageKey {
        return `face${face.charAt(0).toUpperCase()}${face.slice(1)}` as MessageKey;
    }

    function isPowerOfTwo(value: number): boolean {
        return Number.isInteger(value) && value > 0 && (value & (value - 1)) === 0;
    }

    function validUrl(value: string): boolean {
        if (!value.trim())
            return false;
        try {
            resolveMediaUrl(value, context.baseUrl);
            return true;
        }
        catch {
            return false;
        }
    }

    function hasPlaceholders(template: string, names: string[]): boolean {
        return names.every((name) => template.includes(`{${name}}`));
    }

    function validate(config: PanoramaConfig): string | undefined {
        if (usesSingleUrl(config) && !validUrl(config.media.url))
            return t("invalidUrl");
        if (config.adapter === "cubemap" && config.cubemap.layout === "separate") {
            if (!CUBEMAP_FACES.every((face) => validUrl(config.cubemap.faces[face])))
                return t("invalidUrl");
        }
        if (config.adapter === "cubemap" && config.cubemap.layout === "stripe") {
            const unique = new Set(config.cubemap.stripeOrder);
            if (config.cubemap.stripeOrder.length !== 6
                || unique.size !== 6
                || !config.cubemap.stripeOrder.every((face) => CUBEMAP_FACES.includes(face))) {
                return t("invalidOrder");
            }
        }
        if (config.adapter === "equirectangular-tiles") {
            const tile = config.equirectangularTiles;
            if (!hasPlaceholders(tile.tileUrl, ["col", "row"]))
                return t("invalidTemplate");
            try {
                applyUrlTemplate(tile.tileUrl, { col: 0, row: 0, level: 0 }, context.baseUrl);
            }
            catch {
                return t("invalidUrl");
            }
            if (tile.baseUrl.trim() && !validUrl(tile.baseUrl))
                return t("invalidUrl");
            if (!Number.isInteger(tile.width) || tile.width <= 0
                || !isPowerOfTwo(tile.cols) || tile.cols > 64
                || !isPowerOfTwo(tile.rows) || tile.rows > 32
                || !isPowerOfTwo(tile.resolution)) {
                return t("invalidNumber");
            }
        }
        if (config.adapter === "cubemap-tiles") {
            const tile = config.cubemapTiles;
            if (!hasPlaceholders(tile.tileUrl, ["face", "col", "row"]))
                return t("invalidTemplate");
            try {
                applyUrlTemplate(tile.tileUrl, { face: "front", col: 0, row: 0, level: 0 }, context.baseUrl);
            }
            catch {
                return t("invalidUrl");
            }
            if (!Number.isInteger(tile.faceSize) || tile.faceSize <= 0
                || !isPowerOfTwo(tile.nbTiles) || tile.nbTiles > 16) {
                return t("invalidNumber");
            }
        }

        if (config.map.enabled && !validUrl(config.map.imageUrl))
            return t("mapImageRequired");
        if (config.plan.enabled) {
            if (!hasPlaceholders(config.plan.layer.urlTemplate, ["z", "x", "y"]))
                return t("invalidPlanTemplate");
            try {
                resolveMediaUrl(config.plan.layer.urlTemplate, context.baseUrl);
            }
            catch {
                return t("invalidUrl");
            }
        }
        if (config.visibleRange.enabled && !config.visibleRange.usePanoData
            && !config.visibleRange.horizontalEnabled && !config.visibleRange.verticalEnabled) {
            return t("rangeRequired");
        }
        if (config.visibleRange.enabled && config.visibleRange.horizontalEnabled
            && config.visibleRange.horizontalMin > config.visibleRange.horizontalMax) {
            return t("invalidRange");
        }
        if (config.visibleRange.enabled && config.visibleRange.verticalEnabled
            && config.visibleRange.verticalMin > config.visibleRange.verticalMax) {
            return t("invalidRange");
        }

        const finiteValues = [
            config.view.defaultYaw,
            config.view.defaultPitch,
            config.view.defaultZoomLvl,
            config.view.minFov,
            config.view.maxFov,
            config.interaction.moveSpeed,
            config.autorotate.speed,
            config.autorotate.delay,
        ];
        if (config.map.enabled) {
            finiteValues.push(
                config.map.centerX,
                config.map.centerY,
                config.map.rotation,
                config.map.pinSize,
                config.map.coneSize,
                config.map.defaultZoom,
                config.map.minZoom,
                config.map.maxZoom,
            );
        }
        if (config.plan.enabled) {
            finiteValues.push(
                config.plan.latitude,
                config.plan.longitude,
                config.plan.altitude,
                config.plan.bearing,
                config.plan.pinSize,
                config.plan.defaultZoom,
            );
        }
        if (config.visibleRange.enabled) {
            finiteValues.push(
                config.visibleRange.horizontalMin,
                config.visibleRange.horizontalMax,
                config.visibleRange.verticalMin,
                config.visibleRange.verticalMax,
            );
        }
        let validAdapterResolution = true;
        if (config.adapter === "equirectangular")
            validAdapterResolution = isPowerOfTwo(config.equirectangular.resolution);
        else if (config.adapter === "equirectangular-video")
            validAdapterResolution = isPowerOfTwo(config.equirectangularVideo.resolution);

        const valid = finiteValues.every(Number.isFinite)
            && validAdapterResolution
            && Math.abs(config.view.defaultYaw) <= 360
            && Math.abs(config.view.defaultPitch) <= 90
            && config.view.defaultZoomLvl >= 0 && config.view.defaultZoomLvl <= 100
            && config.view.minFov >= 1 && config.view.minFov <= 180
            && config.view.maxFov >= 1 && config.view.maxFov <= 180
            && config.interaction.moveSpeed >= 0.1 && config.interaction.moveSpeed <= 10
            && Math.abs(config.autorotate.speed) <= 20 && config.autorotate.speed !== 0
            && config.autorotate.delay >= 0 && config.autorotate.delay <= 60000
            && (!config.map.enabled || (
                config.map.pinSize > 0 && config.map.coneSize > 0
                && config.map.minZoom > 0 && config.map.minZoom <= config.map.defaultZoom
                && config.map.defaultZoom <= config.map.maxZoom
            ))
            && (!config.plan.enabled || (
                config.plan.latitude >= -90 && config.plan.latitude <= 90
                && config.plan.longitude >= -180 && config.plan.longitude <= 180
                && config.plan.pinSize > 0 && config.plan.defaultZoom >= 0 && config.plan.defaultZoom <= 22
            ))
            && (!config.visibleRange.enabled || (
                config.visibleRange.horizontalMin >= -360 && config.visibleRange.horizontalMax <= 360
                && config.visibleRange.verticalMin >= -90 && config.visibleRange.verticalMax <= 90
            ));
        if (!valid)
            return t("invalidNumber");
        if (config.view.minFov > config.view.maxFov)
            return t("invalidFov");
        return undefined;
    }

    function coerceNumbers(config: PanoramaConfig): void {
        config.equirectangular.resolution = Number(config.equirectangular.resolution);
        config.equirectangularTiles.width = Number(config.equirectangularTiles.width);
        config.equirectangularTiles.cols = Number(config.equirectangularTiles.cols);
        config.equirectangularTiles.rows = Number(config.equirectangularTiles.rows);
        config.equirectangularTiles.resolution = Number(config.equirectangularTiles.resolution);
        config.equirectangularVideo.resolution = Number(config.equirectangularVideo.resolution);
        config.cubemapTiles.faceSize = Number(config.cubemapTiles.faceSize);
        config.cubemapTiles.nbTiles = Number(config.cubemapTiles.nbTiles);
        config.view.defaultYaw = Number(config.view.defaultYaw);
        config.view.defaultPitch = Number(config.view.defaultPitch);
        config.view.defaultZoomLvl = Number(config.view.defaultZoomLvl);
        config.view.minFov = Number(config.view.minFov);
        config.view.maxFov = Number(config.view.maxFov);
        config.interaction.moveSpeed = Number(config.interaction.moveSpeed);
        config.autorotate.speed = Number(config.autorotate.speed);
        config.autorotate.delay = Number(config.autorotate.delay);
        for (const key of ["centerX", "centerY", "rotation", "pinSize", "coneSize", "defaultZoom", "minZoom", "maxZoom"] as const)
            config.map[key] = Number(config.map[key]);
        for (const key of ["latitude", "longitude", "altitude", "bearing", "pinSize", "defaultZoom"] as const)
            config.plan[key] = Number(config.plan[key]);
        for (const key of ["horizontalMin", "horizontalMax", "verticalMin", "verticalMax"] as const)
            config.visibleRange[key] = Number(config.visibleRange[key]);
    }

    function trimSources(config: PanoramaConfig): void {
        config.media.url = config.media.url.trim();
        config.equirectangularTiles.tileUrl = config.equirectangularTiles.tileUrl.trim();
        config.equirectangularTiles.baseUrl = config.equirectangularTiles.baseUrl.trim();
        config.cubemapTiles.tileUrl = config.cubemapTiles.tileUrl.trim();
        config.map.imageUrl = config.map.imageUrl.trim();
        config.plan.layer.urlTemplate = config.plan.layer.urlTemplate.trim();
        for (const face of CUBEMAP_FACES) config.cubemap.faces[face] = config.cubemap.faces[face].trim();
    }

    let interactionSaveQueue: Promise<void> = Promise.resolve();

    async function applyConfig(): Promise<void> {
        errorMessage = "";
        notice = "";
        noticeIsError = false;
        viewerError = "";
        const nextConfig = cloneConfig(draft);
        nextConfig.adapter = draft.adapter as AdapterId;
        nextConfig.cubemap.stripeOrder = stripeOrderText.split(",").map((face) => face.trim().toLowerCase()) as CubemapFace[];
        coerceNumbers(nextConfig);
        trimSources(nextConfig);
        const validationError = validate(nextConfig);
        if (validationError) {
            errorMessage = validationError;
            return;
        }
        saving = true;
        try {
            await interactionSaveQueue;
            await context.saveConfig(nextConfig);
            activeConfig = cloneConfig(nextConfig);
            draft = cloneConfig(nextConfig);
            stripeOrderText = nextConfig.cubemap.stripeOrder.join(", ");
            viewerKey += 1;
            drawerOpen = false;
            notice = t("saved");
            setTimeout(() => notice = "", 7000);
        }
        catch (error) {
            console.error(error);
            errorMessage = t("saveFailed");
        }
        finally {
            saving = false;
        }
    }

    function persistInteraction(key: "mousemove" | "mousewheel" | "mousewheelCtrlKey" | "touchmoveTwoFingers", value: boolean): Promise<void> {
        activeConfig.interaction[key] = value;
        draft.interaction[key] = value;
        const snapshot = cloneConfig(activeConfig);
        interactionSaveQueue = interactionSaveQueue
            .catch(() => undefined)
            .then(async () => {
                try {
                    await context.saveConfig(snapshot);
                    notice = t("saved");
                    noticeIsError = false;
                }
                catch (error) {
                    console.error(error);
                    notice = t("saveFailed");
                    noticeIsError = true;
                }
                setTimeout(() => notice = "", 7000);
            });
        return interactionSaveQueue;
    }

    function cancelChanges(): void {
        draft = cloneConfig(activeConfig);
        stripeOrderText = activeConfig.cubemap.stripeOrder.join(", ");
        errorMessage = "";
        drawerOpen = false;
    }

    function resetDraft(): void {
        draft = cloneConfig(DEFAULT_CONFIG);
        stripeOrderText = DEFAULT_CONFIG.cubemap.stripeOrder.join(", ");
        errorMessage = "";
    }

    function submitConfig(event: SubmitEvent): void {
        event.preventDefault();
        void applyConfig();
    }
</script>

<svelte:head><title>{t("configuration")}</title></svelte:head>

<main class="relative h-full w-full overflow-hidden bg-gray-100 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
    {#if configured}
        {#key viewerKey}
            <PanoramaViewer
                baseUrl={context.baseUrl}
                config={activeConfig}
                interactionLabels={{
                    mousemove: t("mousemove"),
                    mousewheel: t("mousewheel"),
                    mousewheelCtrlKey: t("mousewheelCtrlKey"),
                    touchmoveTwoFingers: t("touchTwoFingers"),
                }}
                loadingLabel={t("loading")}
                onInteractionChange={persistInteraction}
                onOpenSettings={() => drawerOpen = true}
                onViewerError={(message) => viewerError = message}
                openSettingsLabel={t("openSettings")}
                {viewerLanguage}
            />
        {/key}
    {:else}
        <section class="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
            <div class="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                <svg class="h-9 w-9" aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" viewBox="0 0 24 24"><rect height="14" rx="2" width="18" x="3" y="3" /><path d="M4 21h1M9 21h1M14 21h1M19 21h1" /></svg>
            </div>
            <div><h1 class="text-xl font-semibold">{t("configuration")}</h1><p class="mt-2 max-w-md text-sm text-gray-600 dark:text-gray-400">{t("configurationHint")}</p></div>
            <Button onclick={() => drawerOpen = true}>{t("openSettings")}</Button>
        </section>
    {/if}

    {#if notice}<div class={`absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-lg px-4 py-2 text-sm text-white shadow-lg ${noticeIsError ? "bg-red-700" : "bg-green-700"}`}>{notice}</div>{/if}
    {#if viewerError}<div class="absolute bottom-4 left-4 right-4 z-20 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800 shadow-lg dark:border-red-800 dark:bg-red-950 dark:text-red-200"><strong>{t("viewerError")}:</strong> {t("loadFailed")}<span class="block truncate opacity-70" title={viewerError}>{viewerError}</span></div>{/if}
</main>

{#if drawerOpen}
    <button class="fixed inset-0 z-[100] cursor-default bg-gray-900/50" aria-label={t("close")} onclick={cancelChanges} type="button"></button>
    <aside class="fixed inset-y-0 right-0 z-[101] flex min-h-0 w-full max-w-[30rem] flex-col bg-white shadow-2xl dark:bg-gray-900" aria-label={t("configuration")}>
        <form class="settings-form" onsubmit={submitConfig}>
            <header class="z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-2 dark:border-gray-700 dark:bg-gray-900">
                <h2 class="text-lg font-semibold">{t("configuration")}</h2>
                <button class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800" aria-label={t("close")} onclick={cancelChanges} type="button"><svg class="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg></button>
            </header>

            <div class="settings-scroll space-y-5 p-5">
                {#if errorMessage}<div class="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">{errorMessage}</div>{/if}

                <fieldset class="space-y-4 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    <legend class="px-2 font-medium">{t("media")}</legend>
                    <div><Label class="mb-2" for="adapter">{t("adapter")}</Label><Select id="adapter" items={adapters} bind:value={draft.adapter} /></div>
                    {#if draft.adapter === "cubemap"}
                        <div><Label class="mb-2" for="cubemap-layout">{t("cubemapLayout")}</Label><Select id="cubemap-layout" items={layouts} bind:value={draft.cubemap.layout} /></div>
                    {/if}
                    {#if draft.adapter === "cubemap" && draft.cubemap.layout === "separate"}
                        <div class="grid grid-cols-2 gap-3">
                            {#each CUBEMAP_FACES as face (face)}
                                <div><Label class="mb-2" for={`face-${face}`}>{t(faceLabel(face))}</Label><Input id={`face-${face}`} placeholder={`assets/${face}.jpg`} required type="text" bind:value={draft.cubemap.faces[face]} /></div>
                            {/each}
                        </div>
                    {:else if usesSingleUrl(draft)}
                        <div><Label class="mb-2" for="media-url">{t("mediaUrl")}</Label><Input id="media-url" onblur={suggestAdapterFromUrl} placeholder="assets/panorama.jpg or https://…" required type="text" bind:value={draft.media.url} /></div>
                    {/if}
                </fieldset>

                <fieldset class="space-y-4 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    <legend class="px-2 font-medium">{t("adapterSettings")}</legend>
                    {#if draft.adapter === "equirectangular"}
                        <Toggle bind:checked={draft.equirectangular.useXmpData}>{t("useXmpData")}</Toggle>
                        <Toggle bind:checked={draft.equirectangular.shader}>{t("shader")}</Toggle>
                        <div><Label class="mb-2" for="eq-resolution">{t("resolution")}</Label><Input id="eq-resolution" min="2" step="1" type="number" bind:value={draft.equirectangular.resolution} /></div>
                    {:else if draft.adapter === "equirectangular-tiles"}
                        <div class="grid grid-cols-3 gap-3">
                            <div><Label class="mb-2" for="tile-width">{t("width")}</Label><Input id="tile-width" min="1" step="1" type="number" bind:value={draft.equirectangularTiles.width} /></div>
                            <div><Label class="mb-2" for="tile-cols">{t("cols")}</Label><Input id="tile-cols" min="1" step="1" type="number" bind:value={draft.equirectangularTiles.cols} /></div>
                            <div><Label class="mb-2" for="tile-rows">{t("rows")}</Label><Input id="tile-rows" min="1" step="1" type="number" bind:value={draft.equirectangularTiles.rows} /></div>
                        </div>
                        <div><Label class="mb-2" for="eq-tile-url">{t("tileUrl")}</Label><Input id="eq-tile-url" placeholder={"tiles/{col}/{row}.jpg"} required type="text" bind:value={draft.equirectangularTiles.tileUrl} /></div>
                        <div><Label class="mb-2" for="eq-base-url">{t("baseUrl")}</Label><Input id="eq-base-url" placeholder="assets/base.jpg" type="text" bind:value={draft.equirectangularTiles.baseUrl} /></div>
                        <div><Label class="mb-2" for="eq-tile-resolution">{t("resolution")}</Label><Input id="eq-tile-resolution" min="2" step="1" type="number" bind:value={draft.equirectangularTiles.resolution} /></div>
                        <Toggle bind:checked={draft.equirectangularTiles.useXmpData}>{t("useXmpData")}</Toggle>
                        <Toggle bind:checked={draft.equirectangularTiles.showErrorTile}>{t("showErrorTile")}</Toggle>
                        <Toggle bind:checked={draft.equirectangularTiles.baseBlur}>{t("baseBlur")}</Toggle>
                        <Toggle bind:checked={draft.equirectangularTiles.antialias}>{t("antialias")}</Toggle>
                    {:else if draft.adapter === "equirectangular-video"}
                        <Toggle bind:checked={draft.equirectangularVideo.shader}>{t("shader")}</Toggle>
                        <div><Label class="mb-2" for="video-resolution">{t("resolution")}</Label><Input id="video-resolution" min="2" step="1" type="number" bind:value={draft.equirectangularVideo.resolution} /></div>
                    {:else if draft.adapter === "cubemap"}
                        {#if draft.cubemap.layout === "stripe"}<div><Label class="mb-2" for="stripe-order">{t("stripeOrder")}</Label><Input id="stripe-order" type="text" bind:value={stripeOrderText} /></div>{/if}
                        {#if draft.cubemap.layout !== "net"}<Toggle bind:checked={draft.cubemap.flipTopBottom}>{t("flipTopBottom")}</Toggle>{/if}
                    {:else if draft.adapter === "cubemap-tiles"}
                        <div class="grid grid-cols-2 gap-3">
                            <div><Label class="mb-2" for="face-size">{t("faceSize")}</Label><Input id="face-size" min="1" step="1" type="number" bind:value={draft.cubemapTiles.faceSize} /></div>
                            <div><Label class="mb-2" for="nb-tiles">{t("nbTiles")}</Label><Input id="nb-tiles" max="16" min="1" step="1" type="number" bind:value={draft.cubemapTiles.nbTiles} /></div>
                        </div>
                        <div><Label class="mb-2" for="cube-tile-url">{t("tileUrl")}</Label><Input id="cube-tile-url" placeholder={"tiles/{face}/{col}/{row}.jpg"} required type="text" bind:value={draft.cubemapTiles.tileUrl} /></div>
                        <Toggle bind:checked={draft.cubemapTiles.flipTopBottom}>{t("flipTopBottom")}</Toggle>
                        <Toggle bind:checked={draft.cubemapTiles.showErrorTile}>{t("showErrorTile")}</Toggle>
                        <Toggle bind:checked={draft.cubemapTiles.baseBlur}>{t("baseBlur")}</Toggle>
                        <Toggle bind:checked={draft.cubemapTiles.antialias}>{t("antialias")}</Toggle>
                    {:else if draft.adapter === "cubemap-video"}
                        <Toggle bind:checked={draft.cubemapVideo.equiangular}>{t("equiangular")}</Toggle>
                    {:else}
                        <p class="text-sm text-gray-500 dark:text-gray-400">—</p>
                    {/if}
                </fieldset>

                {#if videoAdapter}
                    <fieldset class="space-y-4 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                        <legend class="px-2 font-medium">{t("video")}</legend>
                        <Toggle bind:checked={draft.video.autoplay}>{t("autoplay")}</Toggle><Toggle bind:checked={draft.video.muted}>{t("muted")}</Toggle>
                        <p class="text-xs text-gray-500 dark:text-gray-400">{t("videoMutedHint")}</p>
                    </fieldset>
                {/if}

                <fieldset class="grid grid-cols-2 gap-4 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    <legend class="px-2 font-medium">{t("view")}</legend>
                    <div><Label class="mb-2" for="yaw">{t("yaw")}</Label><Input id="yaw" max="360" min="-360" step="1" type="number" bind:value={draft.view.defaultYaw} /></div>
                    <div><Label class="mb-2" for="pitch">{t("pitch")}</Label><Input id="pitch" max="90" min="-90" step="1" type="number" bind:value={draft.view.defaultPitch} /></div>
                    <div><Label class="mb-2" for="zoom">{t("zoom")}</Label><Input id="zoom" max="100" min="0" step="1" type="number" bind:value={draft.view.defaultZoomLvl} /></div><div></div>
                    <div><Label class="mb-2" for="min-fov">{t("minFov")}</Label><Input id="min-fov" max="180" min="1" step="1" type="number" bind:value={draft.view.minFov} /></div>
                    <div><Label class="mb-2" for="max-fov">{t("maxFov")}</Label><Input id="max-fov" max="180" min="1" step="1" type="number" bind:value={draft.view.maxFov} /></div>
                </fieldset>

                <fieldset class="space-y-4 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    <legend class="px-2 font-medium">{t("interaction")}</legend>
                    <div><Label class="mb-2" for="move-speed">{t("moveSpeed")}</Label><Input id="move-speed" max="10" min="0.1" step="0.1" type="number" bind:value={draft.interaction.moveSpeed} /></div>
                    <p class="text-xs text-gray-500 dark:text-gray-400">{t("nativeInteractionHint")}</p>
                </fieldset>

                <fieldset class="space-y-4 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    <legend class="px-2 font-medium">{t("navigation")}</legend>
                    <Toggle bind:checked={draft.navbar.visible}>{t("navbar")}</Toggle>
                    <div><Label class="mb-2" for="caption">{t("caption")}</Label><Textarea id="caption" rows={2} bind:value={draft.navbar.caption} /></div>
                    <div><Label class="mb-2" for="description">{t("description")}</Label><Textarea id="description" rows={3} bind:value={draft.navbar.description} /></div>
                </fieldset>

                <fieldset class="space-y-4 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    <legend class="px-2 font-medium">{t("autorotate")}</legend><Toggle bind:checked={draft.autorotate.enabled}>{t("autorotate")}</Toggle>
                    <div class="grid grid-cols-2 gap-4">
                        <div><Label class="mb-2" for="rotate-speed">{t("autorotateSpeed")}</Label><Input id="rotate-speed" max="20" min="-20" step="0.1" type="number" bind:value={draft.autorotate.speed} /></div>
                        <div><Label class="mb-2" for="rotate-delay">{t("autorotateDelay")}</Label><Input id="rotate-delay" max="60000" min="0" step="100" type="number" bind:value={draft.autorotate.delay} /></div>
                    </div>
                </fieldset>

                <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{t("plugins")}</h3>

                <fieldset class="space-y-4 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    <legend class="px-2 font-medium">{t("compass")}</legend>
                    <Toggle bind:checked={draft.compass.enabled}>{t("enabled")}</Toggle>
                    {#if draft.compass.enabled}
                        <div class="grid grid-cols-2 gap-3">
                            <div><Label class="mb-2" for="compass-size">{t("size")}</Label><Input id="compass-size" type="text" bind:value={draft.compass.size} /></div>
                            <div><Label class="mb-2" for="compass-position">{t("position")}</Label><Select id="compass-position" items={positions} bind:value={draft.compass.position} /></div>
                        </div>
                        <div><Label class="mb-2" for="compass-cone">{t("coneColor")}</Label><Input id="compass-cone" type="text" bind:value={draft.compass.coneColor} /></div>
                        <div class="grid grid-cols-2 gap-3">
                            <div><Label class="mb-2" for="navigation-color">{t("navigationColor")}</Label><Input id="navigation-color" type="text" bind:value={draft.compass.navigationColor} /></div>
                            <div><Label class="mb-2" for="hotspot-color">{t("hotspotColor")}</Label><Input id="hotspot-color" type="text" bind:value={draft.compass.hotspotColor} /></div>
                        </div>
                        <Toggle bind:checked={draft.compass.navigation}>{t("compassNavigation")}</Toggle>
                        <Toggle bind:checked={draft.compass.resetPitch}>{t("resetPitch")}</Toggle>
                    {/if}
                </fieldset>

                <fieldset class="space-y-4 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    <legend class="px-2 font-medium">{t("gyroscope")}</legend>
                    <Toggle bind:checked={draft.gyroscope.enabled}>{t("enabled")}</Toggle>
                    {#if draft.gyroscope.enabled}
                        <div><Label class="mb-2" for="gyro-mode">{t("moveMode")}</Label><Select id="gyro-mode" items={moveModes} bind:value={draft.gyroscope.moveMode} /></div>
                        <Toggle bind:checked={draft.gyroscope.touchmove}>{t("gyroscopeTouchmove")}</Toggle>
                        <Toggle bind:checked={draft.gyroscope.roll}>{t("roll")}</Toggle>
                        <Toggle bind:checked={draft.gyroscope.absolutePosition}>{t("absolutePosition")}</Toggle>
                    {/if}
                </fieldset>

                <fieldset class="space-y-4 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    <legend class="px-2 font-medium">{t("mapPlugin")}</legend>
                    <Toggle bind:checked={draft.map.enabled}>{t("enabled")}</Toggle>
                    {#if draft.map.enabled}
                        <div><Label class="mb-2" for="map-image">{t("mapImageUrl")}</Label><Input id="map-image" required type="text" bind:value={draft.map.imageUrl} /></div>
                        <div class="grid grid-cols-2 gap-3">
                            <div><Label class="mb-2" for="map-x">{t("centerX")}</Label><Input id="map-x" type="number" bind:value={draft.map.centerX} /></div>
                            <div><Label class="mb-2" for="map-y">{t("centerY")}</Label><Input id="map-y" type="number" bind:value={draft.map.centerY} /></div>
                            <div><Label class="mb-2" for="map-rotation">{t("rotation")}</Label><Input id="map-rotation" type="number" bind:value={draft.map.rotation} /></div>
                            <div><Label class="mb-2" for="map-shape">{t("shape")}</Label><Select id="map-shape" items={mapShapes} bind:value={draft.map.shape} /></div>
                            <div><Label class="mb-2" for="map-size">{t("size")}</Label><Input id="map-size" type="text" bind:value={draft.map.size} /></div>
                            <div><Label class="mb-2" for="map-position">{t("position")}</Label><Select id="map-position" items={positions} bind:value={draft.map.position} /></div>
                            <div><Label class="mb-2" for="map-pin">{t("pinSize")}</Label><Input id="map-pin" min="1" type="number" bind:value={draft.map.pinSize} /></div>
                            <div><Label class="mb-2" for="map-cone-size">{t("coneSize")}</Label><Input id="map-cone-size" min="1" type="number" bind:value={draft.map.coneSize} /></div>
                        </div>
                        <div><Label class="mb-2" for="map-cone-color">{t("coneColor")}</Label><Input id="map-cone-color" type="text" bind:value={draft.map.coneColor} /></div>
                        <div class="grid grid-cols-3 gap-3">
                            <div><Label class="mb-2" for="map-zoom">{t("defaultZoom")}</Label><Input id="map-zoom" min="1" type="number" bind:value={draft.map.defaultZoom} /></div>
                            <div><Label class="mb-2" for="map-min-zoom">{t("minZoom")}</Label><Input id="map-min-zoom" min="1" type="number" bind:value={draft.map.minZoom} /></div>
                            <div><Label class="mb-2" for="map-max-zoom">{t("maxZoom")}</Label><Input id="map-max-zoom" min="1" type="number" bind:value={draft.map.maxZoom} /></div>
                        </div>
                        <Toggle bind:checked={draft.map.visibleOnLoad}>{t("visibleOnLoad")}</Toggle>
                        <Toggle bind:checked={draft.map.static}>{t("staticMap")}</Toggle>
                        <Toggle bind:checked={draft.map.minimizeOnHotspotClick}>{t("minimizeOnHotspotClick")}</Toggle>
                        <div class="grid grid-cols-2 gap-2">
                            <Toggle bind:checked={draft.map.buttons.maximize}>{t("buttonMaximize")}</Toggle><Toggle bind:checked={draft.map.buttons.close}>{t("buttonClose")}</Toggle>
                            <Toggle bind:checked={draft.map.buttons.reset}>{t("buttonReset")}</Toggle><Toggle bind:checked={draft.map.buttons.north}>{t("buttonNorth")}</Toggle>
                        </div>
                    {/if}
                </fieldset>

                <fieldset class="space-y-4 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    <legend class="px-2 font-medium">{t("planPlugin")}</legend>
                    <Toggle bind:checked={draft.plan.enabled}>{t("enabled")}</Toggle>
                    {#if draft.plan.enabled}
                        <div class="grid grid-cols-3 gap-3">
                            <div><Label class="mb-2" for="latitude">{t("latitude")}</Label><Input id="latitude" max="90" min="-90" type="number" bind:value={draft.plan.latitude} /></div>
                            <div><Label class="mb-2" for="longitude">{t("longitude")}</Label><Input id="longitude" max="180" min="-180" type="number" bind:value={draft.plan.longitude} /></div>
                            <div><Label class="mb-2" for="altitude">{t("altitude")}</Label><Input id="altitude" type="number" bind:value={draft.plan.altitude} /></div>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div><Label class="mb-2" for="bearing">{t("bearing")}</Label><Input id="bearing" type="number" bind:value={draft.plan.bearing} /></div>
                            <div><Label class="mb-2" for="plan-position">{t("position")}</Label><Select id="plan-position" items={positions} bind:value={draft.plan.position} /></div>
                            <div><Label class="mb-2" for="plan-width">{t("width")}</Label><Input id="plan-width" type="text" bind:value={draft.plan.width} /></div>
                            <div><Label class="mb-2" for="plan-height">{t("height")}</Label><Input id="plan-height" type="text" bind:value={draft.plan.height} /></div>
                            <div><Label class="mb-2" for="plan-pin">{t("pinSize")}</Label><Input id="plan-pin" min="1" type="number" bind:value={draft.plan.pinSize} /></div>
                            <div><Label class="mb-2" for="plan-zoom">{t("defaultZoom")}</Label><Input id="plan-zoom" max="22" min="0" type="number" bind:value={draft.plan.defaultZoom} /></div>
                        </div>
                        <Toggle bind:checked={draft.plan.visibleOnLoad}>{t("visibleOnLoad")}</Toggle>
                        <Toggle bind:checked={draft.plan.minimizeOnHotspotClick}>{t("minimizeOnHotspotClick")}</Toggle>
                        <div class="grid grid-cols-3 gap-2">
                            <Toggle bind:checked={draft.plan.buttons.maximize}>{t("buttonMaximize")}</Toggle><Toggle bind:checked={draft.plan.buttons.close}>{t("buttonClose")}</Toggle><Toggle bind:checked={draft.plan.buttons.reset}>{t("buttonReset")}</Toggle>
                        </div>
                        <div><Label class="mb-2" for="layer-url">{t("tileLayerUrl")}</Label><Input id="layer-url" required type="text" bind:value={draft.plan.layer.urlTemplate} /></div>
                        <div class="grid grid-cols-2 gap-3">
                            <div><Label class="mb-2" for="layer-name">{t("layerName")}</Label><Input id="layer-name" type="text" bind:value={draft.plan.layer.name} /></div>
                            <div><Label class="mb-2" for="layer-attribution">{t("attribution")}</Label><Input id="layer-attribution" type="text" bind:value={draft.plan.layer.attribution} /></div>
                        </div>
                    {/if}
                </fieldset>

                <fieldset class="space-y-4 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    <legend class="px-2 font-medium">{t("stereo")}</legend>
                    <Toggle bind:checked={draft.stereo.enabled}>{t("enabled")}</Toggle>
                    {#if draft.stereo.enabled}<p class="text-xs text-gray-500 dark:text-gray-400">{t("stereoGyroscopeHint")}</p>{/if}
                </fieldset>

                <fieldset class="space-y-4 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    <legend class="px-2 font-medium">{t("visibleRange")}</legend>
                    <Toggle bind:checked={draft.visibleRange.enabled}>{t("enabled")}</Toggle>
                    {#if draft.visibleRange.enabled}
                        <Toggle bind:checked={draft.visibleRange.usePanoData}>{t("usePanoData")}</Toggle>
                        <Toggle bind:checked={draft.visibleRange.horizontalEnabled}>{t("horizontalRange")}</Toggle>
                        {#if draft.visibleRange.horizontalEnabled}
                            <div class="grid grid-cols-2 gap-3">
                                <div><Label class="mb-2" for="horizontal-min">{t("minimumAngle")}</Label><Input id="horizontal-min" max="360" min="-360" type="number" bind:value={draft.visibleRange.horizontalMin} /></div>
                                <div><Label class="mb-2" for="horizontal-max">{t("maximumAngle")}</Label><Input id="horizontal-max" max="360" min="-360" type="number" bind:value={draft.visibleRange.horizontalMax} /></div>
                            </div>
                        {/if}
                        <Toggle bind:checked={draft.visibleRange.verticalEnabled}>{t("verticalRange")}</Toggle>
                        {#if draft.visibleRange.verticalEnabled}
                            <div class="grid grid-cols-2 gap-3">
                                <div><Label class="mb-2" for="vertical-min">{t("minimumAngle")}</Label><Input id="vertical-min" max="90" min="-90" type="number" bind:value={draft.visibleRange.verticalMin} /></div>
                                <div><Label class="mb-2" for="vertical-max">{t("maximumAngle")}</Label><Input id="vertical-max" max="90" min="-90" type="number" bind:value={draft.visibleRange.verticalMax} /></div>
                            </div>
                        {/if}
                    {/if}
                </fieldset>
            </div>
            <footer class="flex flex-wrap justify-end gap-2 border-t border-gray-200 bg-white px-5 py-2 dark:border-gray-700 dark:bg-gray-900">
                <Button color="alternative" onclick={resetDraft} type="button">{t("reset")}</Button><Button color="alternative" onclick={cancelChanges} type="button">{t("cancel")}</Button><Button disabled={saving} loading={saving} type="submit">{t("apply")}</Button>
            </footer>
        </form>
    </aside>
{/if}

<style>
    .settings-form {
        box-sizing: border-box;
        display: flex;
        flex: 1 1 0%;
        flex-direction: column;
        width: 100%;
        height: 100%;
        min-height: 0;
        min-width: 0;
        overflow: hidden;
    }

    .settings-form > header,
    .settings-form > footer {
        box-sizing: border-box;
        flex: 0 0 auto;
    }

    .settings-scroll {
        box-sizing: border-box;
        flex: 1 1 0;
        min-height: 0;
        overflow-y: auto;
        overscroll-behavior: contain;
        overflow-anchor: none;
        scrollbar-gutter: stable;
    }
</style>
