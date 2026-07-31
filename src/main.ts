import { mount } from "svelte";

import { createWidgetContext, startThemeSync } from "./lib/siyuan";

import App from "./App.svelte";

import "@photo-sphere-viewer/core/index.css";
import "@photo-sphere-viewer/compass-plugin/index.css";
import "@photo-sphere-viewer/map-plugin/index.css";
import "@photo-sphere-viewer/plan-plugin/index.css";
import "@photo-sphere-viewer/settings-plugin/index.css";
import "@photo-sphere-viewer/video-plugin/index.css";
import "./style.css";

const stopThemeSync = startThemeSync();

createWidgetContext()
    .then((context) => {
        mount(App, {
            target: document.getElementById("app")!,
            props: { context },
        });
    })
    .catch((error) => {
        console.error(error);
        document.getElementById("app")!.innerHTML = `
            <main style="box-sizing:border-box;padding:1rem;color:#b91c1c">
                Panorama Viewer failed to initialize.
            </main>
        `;
    });

globalThis.addEventListener("pagehide", stopThemeSync, { once: true });
