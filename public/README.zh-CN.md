# 全景图预览

一个用于在[思源笔记](https://github.com/siyuan-note/siyuan)中预览 360 度全景图片和全景视频的挂件。

简体中文 | [English](./README.md)

## 功能

- 预览等距柱状投影的 360 度全景图片。
- 预览等距柱状投影的 360 度全景视频，并提供播放和音量控制。
- 支持任意可由 `new URL()` 解析的绝对或相对 URL，例如 `assets/panorama.jpg`、`/assets/panorama.jpg`。
- 配置初始水平角、俯仰角、缩放、视野、移动速度、鼠标、触控与导航控件。
- 配置空闲自动旋转、旋转速度和启动延迟。
- 配置视频自动播放和静音行为。
- 将每个挂件实例的独立配置保存到挂件块的 `custom-config` 属性。
- 自动跟随思源的明暗外观。
- 根据常见文件扩展名建议媒体类型，但不会覆盖明确选择的类型。

## 使用方法

1. 从思源的挂件菜单插入“全景图预览”。
2. 点击右上角的设置按钮。
3. 选择图片或视频，并填写媒体 URL。
4. 调整视角和交互选项。
5. 点击“应用并保存”。

外部服务器必须允许跨域访问媒体。受浏览器自动播放策略限制，自动播放视频通常需要同时开启静音。

## 主要依赖

- [Svelte](https://svelte.dev/)
- [Vite](https://vite.dev/)
- [Flowbite Svelte](https://flowbite-svelte.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Photo Sphere Viewer](https://photo-sphere-viewer.js.org/)

## 许可证

[AGPL-3.0](https://github.com/Zuoqiu-Yingyi/widget-panorama-viewer/blob/main/LICENSE)
