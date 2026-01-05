# AI Agent 开发规范

## 通用原则

### 代码风格
- 使用 TypeScript，启用严格模式
- 组件使用函数式写法 + async Server Components
- 使用 `cn()` 工具函数合并 Tailwind 类名
- 文件命名：kebab-case（如 `sign-in-form.tsx`）
- 组件导出：PascalCase（如 `export function SignInForm`）

### 导入规范
- 使用 `@/` 路径别名导入 src 目录下的模块
- 按顺序组织导入：外部库 → 内部模块 → 相对路径
- UI 组件从 `@/shared/components/ui/` 导入
- 工具函数从 `@/shared/lib/` 导入

### 国际化
- 所有用户可见文本必须使用 next-intl
- 翻译文件位于 `src/config/locale/messages/{locale}/`
- 使用 `useTranslations()` (客户端) 或 `getTranslations()` (服务端)

## 文件创建规范

### 新页面
- 放在 `src/app/[locale]/(group)/` 对应的路由组下
- 使用 `setRequestLocale(locale)` 设置请求语言
- 通过 `getThemePage()` 加载主题页面组件

### 新组件
- 通用 UI 组件 → `src/shared/components/ui/`
- 业务区块组件 → `src/shared/blocks/`
- 主题相关组件 → `src/themes/default/blocks/`

### 新 API 路由
- 放在 `src/app/api/` 对应目录下
- 使用 `respData()` / `respErr()` 统一响应格式
- 需要认证的接口使用 `getAuth()` 验证

### 数据模型
- 模型定义在 `src/shared/models/`
- 使用 Drizzle ORM 查询语法
- Schema 修改需同步更新三个数据库版本的 schema 文件

## 禁止事项
- 不要硬编码中文/英文文本，使用 i18n
- 不要直接修改 `src/shared/components/ui/` 下的 shadcn 组件
- 不要在客户端组件中直接访问数据库
- 不要提交 `.env` 文件或暴露密钥

## 常用模式

### 获取当前用户
```typescript
import { getAuth } from '@/core/auth';
const auth = await getAuth();
const session = await auth.api.getSession({ headers: await headers() });
```

### 数据库查询
```typescript
import { db } from '@/core/db';
import { user } from '@/config/db/schema';
const users = await db.select().from(user).where(eq(user.id, userId));
```

### 主题组件加载
```typescript
import { getThemeBlock } from '@/core/theme';
const Hero = await getThemeBlock('hero');
```
