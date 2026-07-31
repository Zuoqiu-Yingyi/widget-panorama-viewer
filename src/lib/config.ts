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

export const CUBEMAP_FACES: CubemapFace[] = ["left", "front", "right", "back", "top", "bottom"];

export interface PanoramaConfig {
    schemaVersion: 2;
    adapter: AdapterId;
    media: {
        url: string;
    };
    equirectangular: {
        useXmpData: boolean;
        shader: boolean;
        resolution: number;
    };
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
    equirectangularVideo: {
        shader: boolean;
        resolution: number;
    };
    cubemap: {
        layout: CubemapLayout;
        faces: CubemapFaces;
        flipTopBottom: boolean;
        stripeOrder: CubemapFace[];
    };
    cubemapTiles: {
        faceSize: number;
        nbTiles: number;
        tileUrl: string;
        flipTopBottom: boolean;
        showErrorTile: boolean;
        baseBlur: boolean;
        antialias: boolean;
    };
    cubemapVideo: {
        equiangular: boolean;
    };
    view: {
        defaultYaw: number;
        defaultPitch: number;
        defaultZoomLvl: number;
        minFov: number;
        maxFov: number;
    };
    interaction: {
        moveSpeed: number;
        mousemove: boolean;
        mousewheel: boolean;
        mousewheelCtrlKey: boolean;
        touchmoveTwoFingers: boolean;
    };
    navbar: {
        visible: boolean;
    };
    autorotate: {
        enabled: boolean;
        speed: number;
        delay: number;
    };
    video: {
        autoplay: boolean;
        muted: boolean;
    };
}

const EMPTY_FACES: CubemapFaces = {
    left: "",
    front: "",
    right: "",
    back: "",
    top: "",
    bottom: "",
};

export const DEFAULT_CONFIG: PanoramaConfig = {
    schemaVersion: 2,
    adapter: "equirectangular",
    media: { url: "" },
    equirectangular: {
        useXmpData: true,
        shader: false,
        resolution: 64,
    },
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
    equirectangularVideo: {
        shader: false,
        resolution: 64,
    },
    cubemap: {
        layout: "separate",
        faces: { ...EMPTY_FACES },
        flipTopBottom: false,
        stripeOrder: [...CUBEMAP_FACES],
    },
    cubemapTiles: {
        faceSize: 4096,
        nbTiles: 4,
        tileUrl: "",
        flipTopBottom: false,
        showErrorTile: true,
        baseBlur: true,
        antialias: true,
    },
    cubemapVideo: {
        equiangular: true,
    },
    view: {
        defaultYaw: 0,
        defaultPitch: 0,
        defaultZoomLvl: 50,
        minFov: 30,
        maxFov: 150,
    },
    interaction: {
        moveSpeed: 1,
        mousemove: true,
        mousewheel: true,
        mousewheelCtrlKey: true,
        touchmoveTwoFingers: true,
    },
    navbar: { visible: true },
    autorotate: {
        enabled: false,
        speed: 2,
        delay: 2000,
    },
    video: {
        autoplay: false,
        muted: true,
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
        schemaVersion: 2,
        adapter: config.adapter,
        media: { url: config.media.url },
        equirectangular: { ...config.equirectangular },
        equirectangularTiles: { ...config.equirectangularTiles },
        equirectangularVideo: { ...config.equirectangularVideo },
        cubemap: {
            ...config.cubemap,
            faces: { ...config.cubemap.faces },
            stripeOrder: [...config.cubemap.stripeOrder],
        },
        cubemapTiles: { ...config.cubemapTiles },
        cubemapVideo: { ...config.cubemapVideo },
        view: { ...config.view },
        interaction: { ...config.interaction },
        navbar: { ...config.navbar },
        autorotate: { ...config.autorotate },
        video: { ...config.video },
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
    catch {
        return undefined;
    }
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
    if (config.adapter === "cubemap" && config.cubemap.layout === "separate") {
        return CUBEMAP_FACES.every((face) => Boolean(config.cubemap.faces[face].trim()));
    }
    return Boolean(config.media.url.trim());
}

export function normalizeConfig(value: unknown): PanoramaConfig {
    const normalized = cloneConfig(DEFAULT_CONFIG);
    if (!isRecord(value))
        return normalized;

    const adapter = value.adapter;
    if (typeof adapter === "string" && ADAPTERS.has(adapter as AdapterId)) {
        normalized.adapter = adapter as AdapterId;
    }
    else {
        // Schema v1 stored only media.type and media.url.
        normalized.adapter = readString(value, "media", "type") === "video"
            ? "equirectangular-video"
            : "equirectangular";
    }
    normalized.media.url = readString(value, "media", "url") ?? normalized.media.url;

    const stringFields = [
        ["equirectangularTiles", "tileUrl"],
        ["equirectangularTiles", "baseUrl"],
        ["cubemapTiles", "tileUrl"],
    ] as const;
    for (const [group, key] of stringFields) {
        const found = readString(value, group, key);
        if (found !== undefined)
            Object.assign(normalized[group], { [key]: found });
    }

    const numberFields = [
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
    ] as const;
    for (const [group, key] of numberFields) {
        const found = readNumber(value, group, key);
        if (found !== undefined)
            Object.assign(normalized[group], { [key]: found });
    }

    const booleanFields = [
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
    ] as const;
    for (const [group, key] of booleanFields) {
        const found = readBoolean(value, group, key);
        if (found !== undefined)
            Object.assign(normalized[group], { [key]: found });
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
    if (Array.isArray(order) && order.length === 6 && order.every((face) => CUBEMAP_FACES.includes(face as CubemapFace))) {
        normalized.cubemap.stripeOrder = [...order] as CubemapFace[];
    }
    return normalized;
}

export function resolveMediaUrl(source: string, baseUrl: string): string {
    return new URL(source.trim(), baseUrl).href;
}

export function applyUrlTemplate(template: string, values: Record<string, number | string>, baseUrl: string): string {
    let result = template;
    for (const [name, value] of Object.entries(values)) {
        result = result.replaceAll(`{${name}}`, String(value));
    }
    return resolveMediaUrl(result, baseUrl);
}
