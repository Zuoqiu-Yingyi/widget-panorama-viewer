<script lang="ts">
    import { Button, Input, Label, Select, Toggle } from "flowbite-svelte";
    import { untrack } from "svelte";

    import {
        applyUrlTemplate,
        cloneConfig,
        CUBEMAP_FACES,
        DEFAULT_CONFIG,
        hasConfiguredSource,
        inferMediaType,
        isVideoAdapter,
        resolveMediaUrl,
    } from "./lib/config";
    import { createTranslator } from "./lib/i18n";

    import PanoramaViewer from "./components/PanoramaViewer.svelte";

    import type { AdapterId, CubemapFace, PanoramaConfig } from "./lib/config";
    import type { MessageKey } from "./lib/i18n";
    import type { WidgetContext } from "./lib/siyuan";

    interface Props { context: WidgetContext }

    const { context }: Props = $props();
    const initialContext = untrack(() => context);
    const initialConfig = cloneConfig(initialContext.config);
    const t = createTranslator(initialContext.locale);

    let activeConfig = $state(cloneConfig(initialConfig));
    let draft = $state(cloneConfig(initialConfig));
    let stripeOrderText = $state(initialConfig.cubemap.stripeOrder.join(", "));
    let drawerOpen = $state(!hasConfiguredSource(initialConfig));
    let viewerKey = $state(0);
    let saving = $state(false);
    let notice = $state("");
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
            && config.view.minFov >= 1 && config.view.minFov <= 179
            && config.view.maxFov >= 1 && config.view.maxFov <= 179
            && config.interaction.moveSpeed >= 0.1 && config.interaction.moveSpeed <= 10
            && Math.abs(config.autorotate.speed) <= 20 && config.autorotate.speed !== 0
            && config.autorotate.delay >= 0 && config.autorotate.delay <= 60000;
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
    }

    function trimSources(config: PanoramaConfig): void {
        config.media.url = config.media.url.trim();
        config.equirectangularTiles.tileUrl = config.equirectangularTiles.tileUrl.trim();
        config.equirectangularTiles.baseUrl = config.equirectangularTiles.baseUrl.trim();
        config.cubemapTiles.tileUrl = config.cubemapTiles.tileUrl.trim();
        for (const face of CUBEMAP_FACES) config.cubemap.faces[face] = config.cubemap.faces[face].trim();
    }

    async function applyConfig(): Promise<void> {
        errorMessage = "";
        notice = "";
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
            await context.saveConfig(nextConfig);
            activeConfig = cloneConfig(nextConfig);
            draft = cloneConfig(nextConfig);
            stripeOrderText = nextConfig.cubemap.stripeOrder.join(", ");
            viewerKey += 1;
            drawerOpen = false;
            notice = t("saved");
        }
        catch (error) {
            console.error(error);
            errorMessage = t("saveFailed");
        }
        finally {
            saving = false;
        }
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
                loadingLabel={t("loading")}
                onViewerError={(message) => viewerError = message}
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

    <Button class="absolute right-4 top-4 z-20 shadow-lg" aria-label={t("openSettings")} color="dark" onclick={() => drawerOpen = true} pill title={t("openSettings")}>
        <svg class="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" viewBox="0 0 24 24"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" /><circle cx="12" cy="12" r="3" /></svg>
    </Button>
    {#if notice}<div class="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-lg bg-green-700 px-4 py-2 text-sm text-white shadow-lg">{notice}</div>{/if}
    {#if viewerError}<div class="absolute bottom-4 left-4 right-4 z-20 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800 shadow-lg dark:border-red-800 dark:bg-red-950 dark:text-red-200"><strong>{t("viewerError")}:</strong> {t("loadFailed")}<span class="block truncate opacity-70" title={viewerError}>{viewerError}</span></div>{/if}
</main>

{#if drawerOpen}
    <button class="fixed inset-0 z-[100] cursor-default bg-gray-900/50" aria-label={t("close")} onclick={cancelChanges} type="button"></button>
    <aside class="fixed inset-y-0 right-0 z-[101] w-full max-w-[30rem] overflow-hidden bg-white shadow-2xl dark:bg-gray-900" aria-label={t("configuration")}>
        <form class="flex h-full min-h-0 flex-col overflow-hidden" onsubmit={submitConfig}>
            <header class="z-10 flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-5 py-4 dark:border-gray-700 dark:bg-gray-900">
                <h2 class="text-lg font-semibold">{t("configuration")}</h2>
                <button class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800" aria-label={t("close")} onclick={cancelChanges} type="button"><svg class="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg></button>
            </header>

            <div class="min-h-0 flex-1 space-y-5 overflow-y-scroll p-5 [overflow-anchor:none] [scrollbar-gutter:stable]">
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
                    <div><Label class="mb-2" for="min-fov">{t("minFov")}</Label><Input id="min-fov" max="179" min="1" step="1" type="number" bind:value={draft.view.minFov} /></div>
                    <div><Label class="mb-2" for="max-fov">{t("maxFov")}</Label><Input id="max-fov" max="179" min="1" step="1" type="number" bind:value={draft.view.maxFov} /></div>
                </fieldset>

                <fieldset class="space-y-4 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    <legend class="px-2 font-medium">{t("interaction")}</legend>
                    <div><Label class="mb-2" for="move-speed">{t("moveSpeed")}</Label><Input id="move-speed" max="10" min="0.1" step="0.1" type="number" bind:value={draft.interaction.moveSpeed} /></div>
                    <Toggle bind:checked={draft.interaction.mousemove}>{t("mousemove")}</Toggle><Toggle bind:checked={draft.interaction.mousewheel}>{t("mousewheel")}</Toggle>
                    <Toggle bind:checked={draft.interaction.mousewheelCtrlKey}>{t("mousewheelCtrlKey")}</Toggle><Toggle bind:checked={draft.interaction.touchmoveTwoFingers}>{t("touchTwoFingers")}</Toggle>
                    <Toggle bind:checked={draft.navbar.visible}>{t("navbar")}</Toggle>
                </fieldset>

                <fieldset class="space-y-4 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    <legend class="px-2 font-medium">{t("autorotate")}</legend><Toggle bind:checked={draft.autorotate.enabled}>{t("autorotate")}</Toggle>
                    <div class="grid grid-cols-2 gap-4">
                        <div><Label class="mb-2" for="rotate-speed">{t("autorotateSpeed")}</Label><Input id="rotate-speed" max="20" min="-20" step="0.1" type="number" bind:value={draft.autorotate.speed} /></div>
                        <div><Label class="mb-2" for="rotate-delay">{t("autorotateDelay")}</Label><Input id="rotate-delay" max="60000" min="0" step="100" type="number" bind:value={draft.autorotate.delay} /></div>
                    </div>
                </fieldset>
            </div>
            <footer class="flex shrink-0 flex-wrap justify-end gap-2 border-t border-gray-200 bg-white px-5 py-4 dark:border-gray-700 dark:bg-gray-900">
                <Button color="alternative" onclick={resetDraft} type="button">{t("reset")}</Button><Button color="alternative" onclick={cancelChanges} type="button">{t("cancel")}</Button><Button disabled={saving} loading={saving} type="submit">{t("apply")}</Button>
            </footer>
        </form>
    </aside>
{/if}
