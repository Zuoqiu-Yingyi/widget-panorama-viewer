<div align="center">
<img alt="图标" src="https://cdn.jsdelivr.net/gh/Zuoqiu-Yingyi/widget-panorama-viewer@main/public/icon.png" style="width: 8em; height: 8em;">

---
[![GitHub 最新发行版本 (最新一次发行/预发行)](https://img.shields.io/github/v/release/Zuoqiu-Yingyi/widget-panorama-viewer?include_prereleases&style=flat-square)](https://github.com/Zuoqiu-Yingyi/widget-panorama-viewer/releases/latest)
[![GitHub 最新发行时间](https://img.shields.io/github/release-date/Zuoqiu-Yingyi/widget-panorama-viewer?style=flat-square)](https://github.com/Zuoqiu-Yingyi/widget-panorama-viewer/releases/latest)
[![GitHub 许可证](https://img.shields.io/github/license/Zuoqiu-Yingyi/widget-panorama-viewer?style=flat-square)](https://github.com/Zuoqiu-Yingyi/widget-panorama-viewer/blob/main/LICENSE)
[![GitHub 最后一次提交时间](https://img.shields.io/github/last-commit/Zuoqiu-Yingyi/widget-panorama-viewer?style=flat-square)](https://github.com/Zuoqiu-Yingyi/widget-panorama-viewer/commits/main)
![GitHub 仓库大小](https://img.shields.io/github/repo-size/Zuoqiu-Yingyi/widget-panorama-viewer?style=flat-square)
![查看次数](https://hits.b3log.org/Zuoqiu-Yingyi/widget-panorama-viewer.svg)
[![GitHub 发行版本下载次数](https://img.shields.io/github/downloads/Zuoqiu-Yingyi/widget-panorama-viewer/total?style=flat-square)](https://github.com/Zuoqiu-Yingyi/widget-panorama-viewer/releases)
---

简体中文 \| [English](./README.md)

---

</div>

# 全景图预览

一个由 [Photo Sphere Viewer](https://photo-sphere-viewer.js.org/) 驱动、用于在[思源笔记](https://github.com/siyuan-note/siyuan)中预览 360 度全景图片和视频的挂件。

## 预览

![预览](https://cdn.jsdelivr.net/gh/Zuoqiu-Yingyi/widget-panorama-viewer@main/public/preview.png)

## 功能介绍

- 展示 360 度全景图片和视频
  - 等距柱状投影图片、等距柱状投影瓦片和等距柱状投影视频
  - 立方体贴图图片、立方体贴图瓦片和立方体贴图视频
  - 双鱼眼图片和双鱼眼视频
- 立方体贴图图片来源
  - 六张独立面图片
    - 需填写 `left`、`front`、`right`、`back`、`top`、`bottom` 六个 URL
  - 单张水平条带图
    - 可配置各面的排列顺序
  - 单张十字展开网格图
  - 源图片方向不匹配时可翻转顶面和底面
- 瓦片适配器（单层配置）
  - 等距柱状投影瓦片模板必须包含 `{col}` 和 `{row}`
  - 立方体贴图瓦片模板必须包含 `{face}`、`{col}` 和 `{row}`
  - 两种模板都可选用 `{level}` 占位符（单层配置的 level 为 `0`）
- URL 解析
  - 所有媒体和瓦片 URL 都通过 `new URL(value, baseUrl)` 解析
  - 支持绝对与相对 URL
  - 外部服务器必须允许跨域访问
- 可选的 Photo Sphere Viewer 插件
  - `Compass` 罗盘
  - `Gyroscope` 陀螺仪
  - `Map` 地图
    - 图片地图
  - `Plan` 地理地图
    - 默认 OpenStreetMap
    - 瓦片模板保留 `{z}`、`{x}`、`{y}`
  - `Stereo` 立体视图
    - 自动加载其依赖的 `Gyroscope` 陀螺仪
  - `Visible Range` 可见范围
  - 插件代码仅在启用时加载
- 查看器通用选项
  - 初始水平角、俯仰角、缩放和视野
  - 移动速度和导航控件
  - 导航栏标题与描述
  - 空闲自动旋转
  - 视频自动播放和静音
- 按挂件实例存储配置
- 自动跟随思源的明暗外观
- 拖动、滚轮、Ctrl+滚轮和双指交互开关位于 Photo Sphere Viewer 原生“设置”菜单中，并会立即保存

## 开始

该挂件已在[思源笔记社区集市](https://github.com/siyuan-note/bazaar)上架, 可直接在集市中安装

## 使用方法

1. 从思源的挂件菜单插入“全景图预览”。
2. 点击查看器原生导航栏中的挂件设置按钮；即使隐藏普通导航控件，该按钮仍会保留。
3. 选择适配器，并填写所需 URL、立方体六面 URL 或瓦片模板。
4. 调整适配器专用选项和查看器通用选项。
5. 点击“应用并保存”。

> 受浏览器自动播放策略限制，自动播放视频通常需要同时开启静音。瓦片数量和几何分辨率必须是 2 的幂；保存前会验证来源 URL、模板占位符、条带面顺序和数值。

## 参考 & 感谢

## 依赖

| 作者                                                | 项目                                                                                                                                                | 许可证                                                                                  |
| :-------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------- |
| **[sveltejs](https://github.com/sveltejs)**         | [sveltejs/svelte: Cybernetically enhanced web apps](https://github.com/sveltejs/svelte)                                                             | _[MIT 许可证](https://github.com/sveltejs/svelte/blob/main/LICENSE.md)_                 |
| **[vitejs](https://github.com/vitejs)**             | [vitejs/vite: Next generation frontend tooling. It's fast!](https://github.com/vitejs/vite)                                                         | _[MIT 许可证](https://github.com/vitejs/vite/blob/main/LICENSE.md)_                     |
| **[themesberg](https://github.com/themesberg)**     | [themesberg/flowbite-svelte: Flowbite components for Svelte](https://github.com/themesberg/flowbite-svelte)                                         | _[MIT 许可证](https://github.com/themesberg/flowbite-svelte/blob/main/LICENSE)_         |
| **[tailwindlabs](https://github.com/tailwindlabs)** | [tailwindlabs/tailwindcss: A utility-first CSS framework for rapidly building custom user interfaces.](https://github.com/tailwindlabs/tailwindcss) | _[MIT 许可证](https://github.com/tailwindlabs/tailwindcss/blob/master/LICENSE)_         |
| **[mistic100](https://github.com/mistic100)**       | [mistic100/Photo-Sphere-Viewer: A JavaScript library to display 360° panoramas](https://github.com/mistic100/Photo-Sphere-Viewer)                   | _[MIT 许可证](https://github.com/mistic100/Photo-Sphere-Viewer/blob/master/LICENSE.md)_ |

注: 按引入时间排序

## 更改日志

[CHANGELOG.md](https://github.com/Zuoqiu-Yingyi/widget-panorama-viewer/blob/main/CHANGELOG.md)
