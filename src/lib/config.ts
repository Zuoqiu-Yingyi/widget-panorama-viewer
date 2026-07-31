export type MediaType = "image" | "video";

export interface PanoramaConfig {
    schemaVersion: 1;
    media: {
        type: MediaType;
        url: string;
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

export const DEFAULT_CONFIG: PanoramaConfig = {
    schemaVersion: 1,
    media: {
        type: "image",
        url: "",
    },
    view: {
        defaultYaw: 0,
        defaultPitch: 0,
        defaultZoomLvl: 50,
        minFov: 30,
        maxFov: 90,
    },
    interaction: {
        moveSpeed: 1,
        mousemove: true,
        mousewheel: true,
        touchmoveTwoFingers: false,
    },
    navbar: {
        visible: true,
    },
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

function readMediaType(value: Record<string, unknown>, group: string, key: string): MediaType | undefined {
    const candidate = readString(value, group, key);
    return candidate === "image" || candidate === "video" ? candidate : undefined;
}

export function cloneConfig(config: PanoramaConfig): PanoramaConfig {
    return {
        ...config,
        media: { ...config.media },
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
        if (extension && VIDEO_EXTENSIONS.has(extension)) {
            return "video";
        }
        if (extension && IMAGE_EXTENSIONS.has(extension)) {
            return "image";
        }
    }
    catch {
        return undefined;
    }
    return undefined;
}

export function normalizeConfig(value: unknown): PanoramaConfig {
    const normalized = cloneConfig(DEFAULT_CONFIG);
    if (!isRecord(value)) {
        return normalized;
    }

    normalized.media.type = readMediaType(value, "media", "type") ?? normalized.media.type;
    normalized.media.url = readString(value, "media", "url") ?? normalized.media.url;

    normalized.view.defaultYaw = readNumber(value, "view", "defaultYaw") ?? normalized.view.defaultYaw;
    normalized.view.defaultPitch = readNumber(value, "view", "defaultPitch") ?? normalized.view.defaultPitch;
    normalized.view.defaultZoomLvl = readNumber(value, "view", "defaultZoomLvl") ?? normalized.view.defaultZoomLvl;
    normalized.view.minFov = readNumber(value, "view", "minFov") ?? normalized.view.minFov;
    normalized.view.maxFov = readNumber(value, "view", "maxFov") ?? normalized.view.maxFov;

    normalized.interaction.moveSpeed = readNumber(value, "interaction", "moveSpeed") ?? normalized.interaction.moveSpeed;
    normalized.interaction.mousemove = readBoolean(value, "interaction", "mousemove") ?? normalized.interaction.mousemove;
    normalized.interaction.mousewheel = readBoolean(value, "interaction", "mousewheel") ?? normalized.interaction.mousewheel;
    normalized.interaction.touchmoveTwoFingers = readBoolean(value, "interaction", "touchmoveTwoFingers") ?? normalized.interaction.touchmoveTwoFingers;

    normalized.navbar.visible = readBoolean(value, "navbar", "visible") ?? normalized.navbar.visible;
    normalized.autorotate.enabled = readBoolean(value, "autorotate", "enabled") ?? normalized.autorotate.enabled;
    normalized.autorotate.speed = readNumber(value, "autorotate", "speed") ?? normalized.autorotate.speed;
    normalized.autorotate.delay = readNumber(value, "autorotate", "delay") ?? normalized.autorotate.delay;
    normalized.video.autoplay = readBoolean(value, "video", "autoplay") ?? normalized.video.autoplay;
    normalized.video.muted = readBoolean(value, "video", "muted") ?? normalized.video.muted;

    return normalized;
}

export function resolveMediaUrl(source: string, baseUrl: string): string {
    return new URL(source.trim(), baseUrl).href;
}
