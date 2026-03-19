# 🚀 部署指南

## 本地测试

### 方法 1: Python 简易服务器
```bash
cd /home/admin/.openclaw/workspace/oil-price-map
python3 -m http.server 8080
# 访问 http://localhost:8080
```

### 方法 2: Node.js 服务器
```bash
npx serve .
# 或
npx http-server
```

---

## 部署到 GitHub Pages

### 步骤 1: 创建仓库
```bash
cd /home/admin/.openclaw/workspace/oil-price-map
git init
git add .
git commit -m "Initial commit: 中国油价地图"
```

### 步骤 2: 关联远程仓库
```bash
# 在 GitHub 创建新仓库后
git remote add origin https://github.com/YOUR_USERNAME/oil-price-map.git
git branch -M main
git push -u origin main
```

### 步骤 3: 启用 GitHub Pages
1. 进入仓库 Settings → Pages
2. Source 选择 `main` 分支
3. 保存后等待部署（约 1-2 分钟）
4. 访问 `https://YOUR_USERNAME.github.io/oil-price-map/`

---

## 自动更新数据

### 方案 A: GitHub Actions (推荐)

创建 `.github/workflows/update-oil-price.yml`:

```yaml
name: Update Oil Price Data

on:
  schedule:
    # 每天 UTC 16:00 (北京时间 00:00)
    - cron: '0 16 * * *'
  workflow_dispatch: # 允许手动触发

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      
      - name: Install dependencies
        run: |
          pip install requests beautifulsoup4
      
      - name: Update oil price data
        run: python scripts/update_data.py
      
      - name: Commit and push
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add data/oil-prices.json
          git commit -m "Update oil prices $(date +%Y-%m-%d)" || echo "No changes"
          git push
```

### 方案 B: 手动更新

1. 编辑 `data/oil-prices.json`
2. 更新 `updateTime` 字段
3. 更新各省 `prices` 数据
4. 提交更改

---

## 部署到 Vercel

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
cd /home/admin/.openclaw/workspace/oil-price-map
vercel

# 按提示操作即可
```

---

## 部署到 Netlify

```bash
# 安装 Netlify CLI
npm i -g netlify-cli

# 部署
cd /home/admin/.openclaw/workspace/oil-price-map
netlify deploy --prod
```

---

## 数据更新脚本（示例）

创建 `scripts/update_data.py`:

```python
#!/usr/bin/env python3
"""
油价数据更新脚本
从指定数据源抓取最新油价并更新 JSON 文件
"""

import json
import requests
from datetime import datetime
from bs4 import BeautifulSoup

def fetch_oil_prices():
    """
    从网站抓取油价数据
    注意：需要根据实际网站结构调整解析逻辑
    """
    # 示例：从某个油价网站抓取
    url = "http://www.youjia100.cn/"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # 解析逻辑（需要根据实际网站结构编写）
    provinces = []
    # ... 解析代码 ...
    
    return provinces

def update_data():
    # 加载现有数据
    with open('data/oil-prices.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 更新数据
    data['updateTime'] = datetime.now().strftime('%Y-%m-%d')
    # data['provinces'] = fetch_oil_prices()
    
    # 保存
    with open('data/oil-prices.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"数据已更新：{data['updateTime']}")

if __name__ == '__main__':
    update_data()
```

---

## 性能优化建议

1. **启用 CDN** - 使用 jsDelivr 等 CDN 加载 ECharts
2. **压缩文件** - 使用 gzip 压缩 HTML/CSS/JS
3. **缓存策略** - 设置合适的 Cache-Control 头
4. **图片优化** - 如有图片使用 WebP 格式

---

## 监控和维护

- 使用 GitHub Status Pages 监控可用性
- 设置 Uptime Robot 监控网站在线状态
- 定期检查数据更新是否成功

---

*最后更新：2026-03-19*
