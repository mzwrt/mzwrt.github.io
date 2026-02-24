# mzwrt.github.io

个人帮助文档中心 — 记录使用说明与操作指南。

## 访问密码

默认密码：`admin123`

**如何修改密码：**

1. 在浏览器控制台中运行以下代码，获取新密码的 SHA-256 哈希值：
   ```js
   crypto.subtle.digest('SHA-256', new TextEncoder().encode('你的新密码'))
     .then(buf => console.log(Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('')));
   ```
2. 将输出的哈希值替换 `app.js` 顶部 `PASSWORD_HASH` 常量的值。
3. 提交并推送更改。

## 文件结构

| 文件 | 说明 |
|------|------|
| `index.html` | 页面结构 |
| `style.css` | 样式表 |
| `app.js` | 应用逻辑（含身份验证） |

## 安全说明

- 页面使用客户端密码验证（SHA-256 哈希），防止未授权访问。
- 连续 5 次密码错误将触发 30 秒冻结，防止暴力破解。
- 登录状态存储于 `sessionStorage`，关闭标签页后自动失效。
- 所有用户输入均经过 HTML 转义，防止 XSS 攻击。
- 从 `localStorage` 加载数据时进行类型校验与长度截断，防止篡改数据注入。
- 已启用 `Content-Security-Policy` 元标签，限制资源加载来源（禁止 inline 脚本/样式）。

## 如何添加图片

在新建或编辑文档时，可以通过"图片（可选）"区域上传图片：

1. 点击「📁 选择图片」按钮，选择本地图片（JPG / PNG / GIF / WebP）。
2. 图片大小建议不超过 **1 MB**（过大会占用较多本地存储空间）。
3. 图片将以 **Base64 Data URL** 格式存储于浏览器 `localStorage`，无需服务器，离线可用。
4. 如需移除图片，点击「✕ 移除」按钮。

> **注意：** 由于所有数据存储在浏览器本地，`localStorage` 通常限制约 5 MB。如果添加大量图片导致存储空间不足，浏览器会报错，建议导出备份后清理旧数据。