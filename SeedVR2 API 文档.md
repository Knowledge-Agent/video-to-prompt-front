
# SeedVR2 API 文档

## 接口地址

```
POST https://api.replicate.com/v1/predictions
```

## 请求头

```
Authorization: Bearer YOUR_REPLICATE_API_TOKEN
Content-Type: application/json
Prefer: wait
```

## 请求参数

```json
{
  "version": "zsxkib/seedvr2:ca98249be9cb623f02a80a7851a2b1a33d5104c251a8f5a1588f251f79bf7c78",
  "input": {
    "media": "图片或视频的URL",
    "fps": 24,
    "output_format": "webp",
    "output_quality": 90
  }
}
```

### 主要参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| media | **图片或视频URL**（支持 PNG/JPG/MP4 等） | 必填 |
| fps | 输出帧率 | 24 |
| output_format | 输出格式（webp/png/jpg） | webp |
| output_quality | 输出质量（1-100） | 90 |
| apply_color_fix | 颜色修正 | true |

## 调用示例

### cURL

```bash
curl -X POST https://api.replicate.com/v1/predictions \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Prefer: wait" \
  -d '{
    "version": "zsxkib/seedvr2:ca98249be9cb623f02a80a7851a2b1a33d5104c251a8f5a1588f251f79bf7c78",
    "input": {
      "media": "https://example.com/input.mp4",
      "fps": 24
    }
  }'
```

### Python

```python
import requests

response = requests.post(
    "https://api.replicate.com/v1/predictions",
    headers={
        "Authorization": f"Bearer {REPLICATE_API_TOKEN}",
        "Content-Type": "application/json"
    },
    json={
        "version": "zsxkib/seedvr2:ca98249be9cb623f02a80a7851a2b1a33d5104c251a8f5a1588f251f79bf7c78",
        "input": {
            "media": "https://example.com/input.mp4",
            "fps": 24
        }
    }
)
result = response.json()
```

### JavaScript

```javascript
const response = await fetch('https://api.replicate.com/v1/predictions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    version: 'zsxkib/seedvr2:ca98249be9cb623f02a80a7851a2b1a33d5104c251a8f5a1588f251f79bf7c78',
    input: {
      media: 'https://example.com/input.mp4',
      fps: 24
    }
  })
});

const result = await response.json();
```
