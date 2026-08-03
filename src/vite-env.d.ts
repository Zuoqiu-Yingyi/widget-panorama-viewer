/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SIYUAN_SERVE?: string;
    readonly VITE_SIYUAN_TOKEN?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
