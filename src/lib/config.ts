export type AdapterId
    = | "cubemap-tiles"
    | "cubemap-video"
    | "cubemap"
    | "dual-fisheye-video"
    | "dual-fisheye"
    | "equirectangular-tiles"
    | "equirectangular-video"
    | "equirectangular";
export type MediaType = "image" | "video";
export type CubemapLayout = "net" | "separate" | "stripe";
export type CubemapFace = "back" | "bottom" | "front" | "left" | "right" | "top";
export type CubemapFaces = Record<CubemapFace, string>;
export type OverlayPosition = "bottom left" | "bottom right" | "top left" | "top right";

export const CUBEMAP_FACES: CubemapFace[] = ["left", "front", "right", "back", "top", "bottom"];
export const OVERLAY_POSITIONS: OverlayPosition[] = ["top left", "top right", "bottom left", "bottom right"];

export interface PanoramaConfig {
    schemaVersion: 3;
    adapter: AdapterId;
    media: { url: string };
    equirectangular: { useXmpData: boolean; shader: boolean; resolution: number };
    equirectangularTiles: {
        width: number;
        cols: number;
        rows: number;
        tileUrl: string;
        baseUrl: string;
        useXmpData: boolean;
        resolution: number;
        showErrorTile: boolean;
        baseBlur: boolean;
        antialias: boolean;
    };
    equirectangularVideo: { shader: boolean; resolution: number };
    cubemap: { layout: CubemapLayout; faces: CubemapFaces; flipTopBottom: boolean; stripeOrder: CubemapFace[] };
    cubemapTiles: {
        faceSize: number;
        nbTiles: number;
        tileUrl: string;
        flipTopBottom: boolean;
        showErrorTile: boolean;
        baseBlur: boolean;
        antialias: boolean;
    };
    cubemapVideo: { equiangular: boolean };
    view: { defaultYaw: number; defaultPitch: number; defaultZoomLvl: number; minFov: number; maxFov: number };
    interaction: {
        moveSpeed: number;
        mousemove: boolean;
        mousewheel: boolean;
        mousewheelCtrlKey: boolean;
        touchmoveTwoFingers: boolean;
    };
    navbar: { visible: boolean; caption: string; description: string };
    autorotate: { enabled: boolean; speed: number; delay: number };
    video: { autoplay: boolean; muted: boolean };
    compass: {
        enabled: boolean;
        size: string;
        position: OverlayPosition;
        coneColor: string;
        navigation: boolean;
        resetPitch: boolean;
        navigationColor: string;
        hotspotColor: string;
    };
    gyroscope: { enabled: boolean; touchmove: boolean; roll: boolean; absolutePosition: boolean; moveMode: "fast" | "smooth" };
    map: {
        enabled: boolean;
        imageUrl: string;
        centerX: number;
        centerY: number;
        rotation: number;
        shape: "round" | "square";
        size: string;
        position: OverlayPosition;
        visibleOnLoad: boolean;
        pinSize: number;
        coneColor: string;
        coneSize: number;
        static: boolean;
        defaultZoom: number;
        minZoom: number;
        maxZoom: number;
        minimizeOnHotspotClick: boolean;
        buttons: { maximize: boolean; close: boolean; reset: boolean; north: boolean };
    };
    plan: {
        enabled: boolean;
        latitude: number;
        longitude: number;
        altitude: number;
        bearing: number;
        width: string;
        height: string;
        position: OverlayPosition;
        visibleOnLoad: boolean;
        pinSize: number;
        defaultZoom: number;
        minimizeOnHotspotClick: boolean;
        buttons: { maximize: boolean; close: boolean; reset: boolean };
        layer: { urlTemplate: string; name: string; attribution: string };
    };
    stereo: { enabled: boolean };
    visibleRange: {
        enabled: boolean;
        horizontalEnabled: boolean;
        horizontalMin: number;
        horizontalMax: number;
        verticalEnabled: boolean;
        verticalMin: number;
        verticalMax: number;
        usePanoData: boolean;
    };
}

const EMPTY_FACES: CubemapFaces = { left: "", front: "", right: "", back: "", top: "", bottom: "" };

export const DEFAULT_CONFIG: PanoramaConfig = {
    schemaVersion: 3,
    adapter: "equirectangular",
    media: { url: "" },
    equirectangular: { useXmpData: true, shader: false, resolution: 64 },
    equirectangularTiles: {
        width: 8192,
        cols: 8,
        rows: 4,
        tileUrl: "",
        baseUrl: "",
        useXmpData: true,
        resolution: 64,
        showErrorTile: true,
        baseBlur: true,
        antialias: true,
    },
    equirectangularVideo: { shader: false, resolution: 64 },
    cubemap: { layout: "separate", faces: { ...EMPTY_FACES }, flipTopBottom: false, stripeOrder: [...CUBEMAP_FACES] },
    cubemapTiles: { faceSize: 4096, nbTiles: 4, tileUrl: "", flipTopBottom: false, showErrorTile: true, baseBlur: true, antialias: true },
    cubemapVideo: { equiangular: true },
    view: { defaultYaw: 0, defaultPitch: 0, defaultZoomLvl: 50, minFov: 30, maxFov: 150 },
    interaction: { moveSpeed: 1, mousemove: true, mousewheel: true, mousewheelCtrlKey: true, touchmoveTwoFingers: true },
    navbar: { visible: true, caption: "", description: "" },
    autorotate: { enabled: false, speed: 2, delay: 2000 },
    video: { autoplay: false, muted: true },
    compass: {
        enabled: false,
        size: "120px",
        position: "top left",
        coneColor: "rgba(255, 255, 255, 0.5)",
        navigation: true,
        resetPitch: false,
        navigationColor: "rgba(255, 0, 0, 0.2)",
        hotspotColor: "rgba(0, 0, 0, 0.5)",
    },
    gyroscope: { enabled: false, touchmove: true, roll: true, absolutePosition: false, moveMode: "smooth" },
    map: {
        enabled: false,
        imageUrl: "",
        centerX: 0,
        centerY: 0,
        rotation: 0,
        shape: "round",
        size: "200px",
        position: "bottom left",
        visibleOnLoad: true,
        pinSize: 35,
        coneColor: "#1E78E6",
        coneSize: 40,
        static: false,
        defaultZoom: 100,
        minZoom: 20,
        maxZoom: 200,
        minimizeOnHotspotClick: true,
        buttons: { maximize: true, close: true, reset: true, north: true },
    },
    plan: {
        enabled: false,
        latitude: 0,
        longitude: 0,
        altitude: 0,
        bearing: 0,
        width: "300px",
        height: "200px",
        position: "bottom left",
        visibleOnLoad: true,
        pinSize: 35,
        defaultZoom: 15,
        minimizeOnHotspotClick: true,
        buttons: { maximize: true, close: true, reset: true },
        layer: {
            urlTemplate: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            name: "OpenStreetMap",
            attribution: "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a>",
        },
    },
    stereo: { enabled: false },
    visibleRange: {
        enabled: false,
        horizontalEnabled: false,
        horizontalMin: -180,
        horizontalMax: 180,
        verticalEnabled: false,
        verticalMin: -90,
        verticalMax: 90,
        usePanoData: false,
    },
};

const VIDEO_EXTENSIONS = new Set(["m3u8", "mov", "mp4", "m4v", "ogv", "webm"]);
const IMAGE_EXTENSIONS = new Set(["avif", "bmp", "gif", "jpeg", "jpg", "png", "webp"]);
const ADAPTERS = new Set<AdapterId>([
    "equirectangular",
    "equirectangular-tiles",
    "equirectangular-video",
    "cubemap",
    "cubemap-tiles",
    "cubemap-video",
    "dual-fisheye",
    "dual-fisheye-video",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}
function nestedRecord(value: Record<string, unknown>, key: string): Record<string, unknown> | undefined {
    const nested = value[key];
    return isRecord(nested) ? nested : undefined;
}
function readString(value: Record<string, unknown>, group: string, key: string): string | undefined {
    const candidate = nestedRecord(value, group)?.[key];
    return typeof candidate === "string" ? candidate : undefined;
}
function readNumber(value: Record<string, unknown>, group: string, key: string): number | undefined {
    const candidate = nestedRecord(value, group)?.[key];
    return typeof candidate === "number" && Number.isFinite(candidate) ? candidate : undefined;
}
function readBoolean(value: Record<string, unknown>, group: string, key: string): boolean | undefined {
    const candidate = nestedRecord(value, group)?.[key];
    return typeof candidate === "boolean" ? candidate : undefined;
}

export function cloneConfig(config: PanoramaConfig): PanoramaConfig {
    return {
        schemaVersion: 3,
        adapter: config.adapter,
        media: { ...config.media },
        equirectangular: { ...config.equirectangular },
        equirectangularTiles: { ...config.equirectangularTiles },
        equirectangularVideo: { ...config.equirectangularVideo },
        cubemap: { ...config.cubemap, faces: { ...config.cubemap.faces }, stripeOrder: [...config.cubemap.stripeOrder] },
        cubemapTiles: { ...config.cubemapTiles },
        cubemapVideo: { ...config.cubemapVideo },
        view: { ...config.view },
        interaction: { ...config.interaction },
        navbar: { ...config.navbar },
        autorotate: { ...config.autorotate },
        video: { ...config.video },
        compass: { ...config.compass },
        gyroscope: { ...config.gyroscope },
        map: { ...config.map, buttons: { ...config.map.buttons } },
        plan: { ...config.plan, buttons: { ...config.plan.buttons }, layer: { ...config.plan.layer } },
        stereo: { ...config.stereo },
        visibleRange: { ...config.visibleRange },
    };
}

export function inferMediaType(source: string): MediaType | undefined {
    try {
        const pathname = new URL(source, globalThis.location.href).pathname;
        const extension = pathname.split(".").pop()?.toLowerCase();
        if (extension && VIDEO_EXTENSIONS.has(extension))
            return "video";
        if (extension && IMAGE_EXTENSIONS.has(extension))
            return "image";
    }
    catch { return undefined; }
    return undefined;
}
export function isVideoAdapter(adapter: AdapterId): boolean {
    return adapter === "equirectangular-video" || adapter === "cubemap-video" || adapter === "dual-fisheye-video";
}
export function hasConfiguredSource(config: PanoramaConfig): boolean {
    if (config.adapter === "equirectangular-tiles")
        return Boolean(config.equirectangularTiles.tileUrl.trim());
    if (config.adapter === "cubemap-tiles")
        return Boolean(config.cubemapTiles.tileUrl.trim());
    if (config.adapter === "cubemap" && config.cubemap.layout === "separate")
        return CUBEMAP_FACES.every((face) => Boolean(config.cubemap.faces[face].trim()));
    return Boolean(config.media.url.trim());
}

export function normalizeConfig(value: unknown): PanoramaConfig {
    const normalized = cloneConfig(DEFAULT_CONFIG);
    if (!isRecord(value))
        return normalized;
    const adapter = value.adapter;
    normalized.adapter = typeof adapter === "string" && ADAPTERS.has(adapter as AdapterId)
        ? adapter as AdapterId
        : readString(value, "media", "type") === "video" ? "equirectangular-video" : "equirectangular";

    const strings = [
        ["media", "url"],
        ["equirectangularTiles", "tileUrl"],
        ["equirectangularTiles", "baseUrl"],
        ["cubemapTiles", "tileUrl"],
        ["navbar", "caption"],
        ["navbar", "description"],
        ["compass", "size"],
        ["compass", "coneColor"],
        ["compass", "navigationColor"],
        ["compass", "hotspotColor"],
        ["map", "imageUrl"],
        ["map", "size"],
        ["map", "coneColor"],
        ["plan", "width"],
        ["plan", "height"],
    ] as const;
    for (const [group, key] of strings) {
        const found = readString(value, group, key);
        if (found !== undefined)
            Object.assign(normalized[group], { [key]: found });
    }
    const planLayer = nestedRecord(nestedRecord(value, "plan") ?? {}, "layer");
    if (planLayer) {
        for (const key of ["urlTemplate", "name", "attribution"] as const) {
            if (typeof planLayer[key] === "string")
                normalized.plan.layer[key] = planLayer[key];
        }
    }

    const numbers = [
        ["equirectangular", "resolution"],
        ["equirectangularTiles", "width"],
        ["equirectangularTiles", "cols"],
        ["equirectangularTiles", "rows"],
        ["equirectangularTiles", "resolution"],
        ["equirectangularVideo", "resolution"],
        ["cubemapTiles", "faceSize"],
        ["cubemapTiles", "nbTiles"],
        ["view", "defaultYaw"],
        ["view", "defaultPitch"],
        ["view", "defaultZoomLvl"],
        ["view", "minFov"],
        ["view", "maxFov"],
        ["interaction", "moveSpeed"],
        ["autorotate", "speed"],
        ["autorotate", "delay"],
        ["map", "centerX"],
        ["map", "centerY"],
        ["map", "rotation"],
        ["map", "pinSize"],
        ["map", "coneSize"],
        ["map", "defaultZoom"],
        ["map", "minZoom"],
        ["map", "maxZoom"],
        ["plan", "latitude"],
        ["plan", "longitude"],
        ["plan", "altitude"],
        ["plan", "bearing"],
        ["plan", "pinSize"],
        ["plan", "defaultZoom"],
        ["visibleRange", "horizontalMin"],
        ["visibleRange", "horizontalMax"],
        ["visibleRange", "verticalMin"],
        ["visibleRange", "verticalMax"],
    ] as const;
    for (const [group, key] of numbers) {
        const found = readNumber(value, group, key);
        if (found !== undefined)
            Object.assign(normalized[group], { [key]: found });
    }

    const booleans = [
        ["equirectangular", "useXmpData"],
        ["equirectangular", "shader"],
        ["equirectangularTiles", "useXmpData"],
        ["equirectangularTiles", "showErrorTile"],
        ["equirectangularTiles", "baseBlur"],
        ["equirectangularTiles", "antialias"],
        ["equirectangularVideo", "shader"],
        ["cubemap", "flipTopBottom"],
        ["cubemapTiles", "flipTopBottom"],
        ["cubemapTiles", "showErrorTile"],
        ["cubemapTiles", "baseBlur"],
        ["cubemapTiles", "antialias"],
        ["cubemapVideo", "equiangular"],
        ["interaction", "mousemove"],
        ["interaction", "mousewheel"],
        ["interaction", "mousewheelCtrlKey"],
        ["interaction", "touchmoveTwoFingers"],
        ["navbar", "visible"],
        ["autorotate", "enabled"],
        ["video", "autoplay"],
        ["video", "muted"],
        ["compass", "enabled"],
        ["compass", "navigation"],
        ["compass", "resetPitch"],
        ["gyroscope", "enabled"],
        ["gyroscope", "touchmove"],
        ["gyroscope", "roll"],
        ["gyroscope", "absolutePosition"],
        ["map", "enabled"],
        ["map", "visibleOnLoad"],
        ["map", "static"],
        ["map", "minimizeOnHotspotClick"],
        ["plan", "enabled"],
        ["plan", "visibleOnLoad"],
        ["plan", "minimizeOnHotspotClick"],
        ["stereo", "enabled"],
        ["visibleRange", "enabled"],
        ["visibleRange", "horizontalEnabled"],
        ["visibleRange", "verticalEnabled"],
        ["visibleRange", "usePanoData"],
    ] as const;
    for (const [group, key] of booleans) {
        const found = readBoolean(value, group, key);
        if (found !== undefined)
            Object.assign(normalized[group], { [key]: found });
    }
    const mapButtons = nestedRecord(nestedRecord(value, "map") ?? {}, "buttons");
    if (mapButtons) {
        for (const key of ["maximize", "close", "reset", "north"] as const) {
            if (typeof mapButtons[key] === "boolean")
                normalized.map.buttons[key] = mapButtons[key];
        }
    }
    const planButtons = nestedRecord(nestedRecord(value, "plan") ?? {}, "buttons");
    if (planButtons) {
        for (const key of ["maximize", "close", "reset"] as const) {
            if (typeof planButtons[key] === "boolean")
                normalized.plan.buttons[key] = planButtons[key];
        }
    }

    const layout = readString(value, "cubemap", "layout");
    if (layout === "separate" || layout === "stripe" || layout === "net")
        normalized.cubemap.layout = layout;
    const faces = nestedRecord(nestedRecord(value, "cubemap") ?? {}, "faces");
    if (faces) {
        for (const face of CUBEMAP_FACES) {
            if (typeof faces[face] === "string")
                normalized.cubemap.faces[face] = faces[face];
        }
    }
    const order = nestedRecord(value, "cubemap")?.stripeOrder;
    if (Array.isArray(order) && order.length === 6 && order.every((face) => CUBEMAP_FACES.includes(face as CubemapFace)))
        normalized.cubemap.stripeOrder = [...order] as CubemapFace[];

    for (const group of ["compass", "map", "plan"] as const) {
        const position = readString(value, group, "position");
        if (OVERLAY_POSITIONS.includes(position as OverlayPosition))
            normalized[group].position = position as OverlayPosition;
    }
    const shape = readString(value, "map", "shape");
    if (shape === "round" || shape === "square")
        normalized.map.shape = shape;
    const moveMode = readString(value, "gyroscope", "moveMode");
    if (moveMode === "smooth" || moveMode === "fast")
        normalized.gyroscope.moveMode = moveMode;
    return normalized;
}

export function resolveMediaUrl(source: string, baseUrl: string): string {
    return new URL(source.trim(), baseUrl).href;
}
export function applyUrlTemplate(template: string, values: Record<string, number | string>, baseUrl: string): string {
    let result = template;
    for (const [name, value] of Object.entries(values)) result = result.replaceAll(`{${name}}`, String(value));
    return resolveMediaUrl(result, baseUrl);
}
