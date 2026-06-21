# AI Workflow Notes

后续 AI 接手本项目时，请先阅读本文件。这里记录了本项目开发过程中已经遇到过的问题、修复方式和后续操作注意事项，避免重复踩坑。

## 当前工作目录

后续所有操作都应在 GitHub clone 目录中进行：

```text
/Users/hamberg/Documents/GitHub/Football-Tactics-Board
```

旧目录 `/Users/hamberg/Documents/football game` 已经不再作为工作目录。不要继续在那里改文件，否则容易出现本地版本和 GitHub 仓库版本不一致。

## 项目性质

这是一个纯静态网页项目，不需要后端服务，也不需要 Node 构建流程。主要文件是：

```text
index.html
styles.css
src/app.js
src/audio.js
src/data.js
src/render.js
src/simulation.js
```

`package.json` 目前只是项目元信息，没有 npm scripts。

## GitHub Pages 注意事项

这个项目可以直接部署到 GitHub Pages。推荐设置：

```text
Source: Deploy from a branch
Branch: main
Folder: / (root)
```

仓库根目录应直接包含 `index.html`，不要再套一层文件夹。

建议保留 `.nojekyll` 文件。它可以避免 GitHub Pages 按 Jekyll 处理静态资源。

## 本地预览注意事项

不要依赖直接双击 `index.html`。项目使用 ES module，直接从文件系统打开时可能遇到模块加载问题。

本地预览可以用静态服务器，例如：

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

如果 `4173` 被占用或响应异常，可以换端口，例如 `4174`。

`127.0.0.1` 只代表当前电脑，不能给手机或别人直接访问。GitHub Pages 生成的 `github.io` 网址才适合手机播放和分享。

## 缓存版本号

浏览器缓存曾经导致过一个实际问题：`app.js` 已经更新并导入了新 export，但浏览器仍然拿旧的 `data.js`，于是页面报错。

因此修改 JS 或 CSS 后，记得同步更新版本号：

```html
<link rel="stylesheet" href="./styles.css?v=29" />
<script type="module" src="./src/app.js?v=29"></script>
```

同时也要同步 `src/app.js`、`src/render.js`、`src/simulation.js` 里的内部模块版本号，例如：

```js
import { MatchSimulation } from "./simulation.js?v=29";
import { FIELD } from "./data.js?v=29";
```

如果只改了一个入口版本号，子模块可能仍然被缓存。

## data.js 数据库检查

`src/data.js` 现在内容较多，包含 48 个国家和部分完整球员名单。修改后要重点检查：

- 国家 code 是否重复
- `starterIds` 是否都能在 `squad` 中找到
- 每个有名单的国家是否至少能生成 11 名首发
- 是否至少有 1 名门将
- 球员 `role` 是否属于模拟器支持的角色

当前支持的角色：

```text
GK, CB, FB, DM, CM, AM, W, ST
```

建议每次改完 `data.js` 后跑一次数据检查和建队检查。

## 常用检查命令

这个环境里普通 `node` 可能不可用，优先用工作区附带的 Node：

```bash
/Users/hamberg/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node
```

语法检查：

```bash
/Users/hamberg/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check src/data.js
/Users/hamberg/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check src/simulation.js
/Users/hamberg/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check src/app.js
```

48 队建队检查思路：

```bash
/Users/hamberg/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --input-type=module -e "import { COUNTRY_OPTIONS, buildTeams } from './src/data.js?v=29'; const failures = []; for (const country of COUNTRY_OPTIONS) { const teams = buildTeams([country.code, 'KSA']); if (teams[0].players.length !== 11) failures.push(country.code); if (!teams[0].players.some(p => p.role === 'GK')) failures.push(country.code + ': no GK'); } console.log({ checked: COUNTRY_OPTIONS.length, failures });"
```

## 已修复过的比赛逻辑问题

这些问题已经出现过，后续修改时要防止回归：

1. 球员夹住球后卡住  
   处理方式：增加持球停滞检测、底线强制出球、倒三角、扫向门前和解围逻辑。

2. 底线附近活球时其他球员几乎静止  
   处理方式：增加底线持球/争抢状态下的支援跑位。

3. 比分过高  
   处理方式：降低射门窗口和射门成功率，调低越位陷阱概率。

4. 越位不真实  
   处理方式：只在传球目标真实处于越位位置时才可能吹越位；角球、门球、边线球等重开球要跳过越位。

5. 门将脚下有球但不发球  
   处理方式：门将持球有独立计时，必须快速分球或大脚开向前场。

6. 出界逻辑不完整  
   处理方式：边线球、门球、角球都进入“获得重开球 -> 暂停站位 -> 实际开出/掷出”的流程。

7. 开球者刚踢出自由球后又立刻自己抢回  
   处理方式：给刚出脚球员增加短暂 `releaseIgnore` 保护。

## 重开球规则注意事项

以下事件应被视为死球重启：

- 边线出界：边线球
- 底线出界且最后碰防守方：角球
- 底线出界且最后碰进攻方：门球
- 越位：防守方任意球
- 犯规：被犯规方任意球
- 禁区内防守方犯规：被犯规方点球

角球、门球、边线球直接接球不应判越位。代码中通过 `skipOffside: true` 处理。

## 设置面板注意事项

设置面板现在包含：

- 主队/客队选择
- 主队/客队阵型
- 主队/客队战术
- 比赛时间
- 音效
- 两队首发选择

比赛画面右侧有比赛中换人面板，使用当前比赛快照中的首发和替补席，每队最多 5 次。

纪律逻辑现在包含随机黄牌、犯规黄牌、直红、两黄变红、红牌减员、任意球和点球。

当 `data.js` 中某个国家名单为空时，界面会使用默认占位球员。

当同一球员被放入首发后，其他首发槽位中同名球员选项会被禁用，避免重复上场。

## 文件和 Git 注意事项

`.DS_Store` 是 macOS 系统文件，当前仓库中可能显示为未跟踪文件。通常不要提交它。

如果后续要提交到 GitHub，推荐流程：

```bash
git status
git add index.html styles.css README.md package.json src
git commit -m "描述本次修改"
git push
```

提交前先确认只包含本次相关修改，避免把临时文件或旧目录内容带进去。

## 页面验证

页面正常加载时应满足：

- 标题是“足球战术板”
- 球队选择里有 48 个国家
- 阵型选择里有 5 套阵型
- 浏览器控制台没有模块导入错误
- 比赛能自动开始并持续播放

如果浏览器报类似：

```text
does not provide an export named ...
```

优先检查缓存版本号是否所有入口和子模块都同步更新。
