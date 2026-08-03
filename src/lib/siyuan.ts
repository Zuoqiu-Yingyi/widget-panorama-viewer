import { Client } from "@siyuan-community/siyuan-sdk";

import { normalizeConfig } from "./config";
import { normalizeLocale } from "./i18n";

import type { PanoramaConfig } from "./config";
import type { Locale } from "./i18n";

interface SiyuanLike {
    config?: {
        appearance?: {
            mode?: number | string;
        };
        lang?: string;
    };
}

export interface WidgetContext {
    baseUrl: string;
    blockId: string;
    config: PanoramaConfig;
    locale: Locale;
    saveConfig: (config: PanoramaConfig) => Promise<void>;
}

function getTopWindow(): undefined | Window {
    try {
        return globalThis.top ?? undefined;
    }
    catch {
        return undefined;
    }
}

function readSiyuan(topWindow: undefined | Window): SiyuanLike | undefined {
    try {
        return (topWindow as undefined | Window & { siyuan?: SiyuanLike })?.siyuan;
    }
    catch {
        return undefined;
    }
}

function readBaseUrl(topWindow: undefined | Window): string {
    try {
        return new URL(topWindow?.document.baseURI ?? globalThis.location.href).origin;
    }
    catch {
        return globalThis.location.origin;
    }
}

function readBlockId(): string {
    const queryId = new URL(globalThis.location.href).searchParams.get("id");
    if (queryId) {
        return queryId;
    }

    try {
        const frame = globalThis.frameElement;
        const block = frame?.closest<HTMLElement>("[data-node-id]")
            ?? frame?.parentElement?.closest<HTMLElement>("[data-node-id]");
        return block?.dataset.nodeId ?? "";
    }
    catch {
        return "";
    }
}

export async function createWidgetContext(): Promise<WidgetContext> {
    const topWindow = getTopWindow();
    const siyuan = readSiyuan(topWindow);
    const baseUrl = readBaseUrl(topWindow);
    const blockId = readBlockId();
    const client = new Client({ baseURL: baseUrl });

    if (import.meta.env.DEV && import.meta.env.VITE_SIYUAN_SERVE) {
        client._updateOptions({
            baseURL: import.meta.env.VITE_SIYUAN_SERVE,
            token: import.meta.env.VITE_SIYUAN_TOKEN,
        }, "fetch");
    }

    let config = normalizeConfig(undefined);
    if (blockId) {
        try {
            const attrs = (await client.getBlockAttrs({ id: blockId })).data;
            const serialized = attrs["custom-config"];
            if (serialized) {
                config = normalizeConfig(JSON.parse(serialized));
            }
        }
        catch (error) {
            console.warn("Unable to load panorama-viewer configuration", error);
        }
    }

    return {
        baseUrl: import.meta.env.DEV && import.meta.env.VITE_SIYUAN_SERVE
            ? import.meta.env.VITE_SIYUAN_SERVE
            : baseUrl,
        blockId,
        config,
        locale: normalizeLocale(siyuan?.config?.lang ?? navigator.language),
        async saveConfig(updatedConfig) {
            if (!blockId) {
                throw new Error("missing-widget-block-id");
            }
            await client.setBlockAttrs({
                id: blockId,
                attrs: {
                    "custom-config": JSON.stringify(updatedConfig),
                },
            });
        },
    };
}

export function startThemeSync(): () => void {
    const topWindow = getTopWindow();
    const mediaQuery = globalThis.matchMedia("(prefers-color-scheme: dark)");
    const update = () => {
        const mode = readSiyuan(topWindow)?.config?.appearance?.mode;
        const dark = mode === 1 || mode === "1" || mode === "dark" || (mode === undefined && mediaQuery.matches);
        document.documentElement.classList.toggle("dark", dark);
    };

    update();
    mediaQuery.addEventListener("change", update);

    let observer: MutationObserver | undefined;
    try {
        if (topWindow && topWindow !== globalThis.window) {
            observer = new MutationObserver(update);
            observer.observe(topWindow.document.documentElement, {
                attributes: true,
                attributeFilter: ["class", "data-theme-mode", "style"],
            });
        }
    }
    catch {
        // Cross-origin development previews cannot observe the parent document.
    }

    return () => {
        mediaQuery.removeEventListener("change", update);
        observer?.disconnect();
    };
}
