import {
    i18nCheck,
    i18nChecks,
} from "@workspace/types/siyuan/i18n";

import type en from "@/i18n/en.json";
import type zh_Hans from "@/i18n/zh-CN.json";
import type zh_Hant from "@/i18n/zh-TW.json";

export type I18N = typeof zh_Hans;

i18nChecks([
    i18nCheck<I18N, typeof en>(),
    i18nCheck<I18N, typeof zh_Hant>(),
    i18nCheck<I18N, typeof zh_Hans>(),
]);
