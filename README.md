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
- 登录状态存储于 `sessionStorage`，关闭标签页后自动失效。
- 所有用户输入均经过 HTML 转义，防止 XSS 攻击。
- 已启用 `Content-Security-Policy` 元标签，限制资源加载来源。