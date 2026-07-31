import en from "../i18n/en.json";
import zhCN from "../i18n/zh-CN.json";
import zhTW from "../i18n/zh-TW.json";

export type Locale = "en" | "zh-CN" | "zh-TW";
export type MessageKey = keyof typeof en.messages;
export type ViewerLanguage = typeof en.viewer;

interface TranslationCatalog {
    messages: Record<MessageKey, string>;
    viewer: ViewerLanguage;
}

const catalogs: Record<Locale, TranslationCatalog> = {
    en,
    "zh-CN": zhCN,
    "zh-TW": zhTW,
};

export function normalizeLocale(locale: string | undefined): Locale {
    const normalized = locale?.toLowerCase() ?? "";
    if (normalized === "zh-tw" || normalized === "zh-hk" || normalized === "zh-hant")
        return "zh-TW";
    if (normalized.startsWith("zh"))
        return "zh-CN";
    return "en";
}

export function createTranslator(locale: Locale) {
    return (key: MessageKey): string => catalogs[locale].messages[key] ?? catalogs.en.messages[key];
}

export function getViewerLanguage(locale: Locale): ViewerLanguage {
    return catalogs[locale].viewer;
}
