# 全景图预览

一个由 Photo Sphere Viewer 5.15.0 驱动、用于在[思源笔记](https://github.com/siyuan-note/siyuan)中预览 360 度全景图片和视频的挂件。

简体中文 | [English](./README.md)

## 功能

设置面板支持 Photo Sphere Viewer 官方 adapters 页面中的全部适配器：

- 等距柱状投影图片、等距柱状投影瓦片和等距柱状投影视频
- 立方体贴图图片、立方体贴图瓦片和立方体贴图视频
- 双鱼眼图片和双鱼眼视频

立方体贴图图片支持六张独立面图片、单张水平条带图和单张十字展开网格图。独立图片需要填写 `left`、`front`、`right`、`back`、`top`、`bottom` 六个 URL；水平条带图可配置各面的排列顺序；源图片方向不匹配时还可翻转顶面和底面。

瓦片适配器当前提供单层配置：

- 等距柱状投影瓦片模板必须包含 `{col}` 和 `{row}`。
- 立方体贴图瓦片模板必须包含 `{face}`、`{col}` 和 `{row}`。
- 两种模板都可选用 `{level}` 占位符（单层配置的 level 为 `0`）。

所有媒体和瓦片 URL 都通过 `new URL(value, baseUrl)` 解析，因此支持绝对与相对 URL。外部服务器必须允许跨域访问。

其他功能包括配置初始水平角、俯仰角、缩放、视野、交互和导航控件；配置空闲自动旋转；配置视频自动播放和静音；按挂件实例存储配置；自动跟随思源的明暗外观。

## 使用方法

1. 从思源的挂件菜单插入“全景图预览”。
2. 点击右上角的设置按钮。
3. 选择适配器，并填写所需 URL、立方体六面 URL 或瓦片模板。
4. 调整适配器专用选项和查看器通用选项。
5. 点击“应用并保存”。

受浏览器自动播放策略限制，自动播放视频通常需要同时开启静音。瓦片数量和几何分辨率必须是 2 的幂；保存前会验证来源 URL、模板占位符、条带面顺序和数值。

## 主要依赖

- [Svelte](https://svelte.dev/)
- [Vite](https://vite.dev/)
- [Flowbite Svelte](https://flowbite-svelte.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Photo Sphere Viewer](https://photo-sphere-viewer.js.org/)

## 许可证

[AGPL-3.0](https://github.com/Zuoqiu-Yingyi/widget-panorama-viewer/blob/main/LICENSE)
