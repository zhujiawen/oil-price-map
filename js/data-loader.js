/**
 * 油价数据加载器
 * 负责加载和处理油价数据
 */

class OilPriceDataLoader {
  constructor() {
    this.data = null;
    this.dataPath = 'data/oil-prices.json';
  }

  /**
   * 加载油价数据
   */
  async load() {
    try {
      const response = await fetch(this.dataPath);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.data = await response.json();
      console.log('油价数据加载成功:', this.data.updateTime);
      return this.data;
    } catch (error) {
      console.error('加载油价数据失败:', error);
      throw error;
    }
  }

  /**
   * 获取指定省份的油价数据
   */
  getProvinceData(provinceName) {
    if (!this.data) return null;
    
    // 直接匹配
    let result = this.data.provinces.find(p => p.name === provinceName);
    if (result) return result;
    
    // 尝试去掉"省"、"自治区"、"市"等后缀匹配
    const normalizedName = provinceName.replace(/(省 | 自治区 | 市)$/, '');
    result = this.data.provinces.find(p => {
      const pName = p.name.replace(/(省 | 自治区 | 市)$/, '');
      return pName === normalizedName;
    });
    
    return result;
  }

  /**
   * 获取所有省份数据
   */
  getAllProvinces() {
    return this.data ? this.data.provinces : [];
  }

  /**
   * 获取更新时间
   */
  getUpdateTime() {
    return this.data ? this.data.updateTime : null;
  }

  /**
   * 获取下次调价日期
   */
  getNextAdjustDate() {
    return this.data ? this.data.nextAdjustDate : null;
  }

  /**
   * 计算全国平均油价
   */
  getAveragePrice(fuelType = '92') {
    if (!this.data) return 0;
    const prices = this.data.provinces.map(p => p.prices[fuelType]);
    const sum = prices.reduce((a, b) => a + b, 0);
    return (sum / prices.length).toFixed(2);
  }

  /**
   * 获取最高/最低油价省份
   */
  getExtremePrice(fuelType = '92', type = 'max') {
    if (!this.data) return null;
    const sorted = [...this.data.provinces].sort((a, b) => {
      return type === 'max' 
        ? b.prices[fuelType] - a.prices[fuelType]
        : a.prices[fuelType] - b.prices[fuelType];
    });
    return sorted[0];
  }

  /**
   * 格式化调价信息
   */
  formatPriceChange(change) {
    const absChange = Math.abs(change).toFixed(2);
    if (change > 0) {
      return { text: `↑ +${absChange}`, class: 'price-up' };
    } else if (change < 0) {
      return { text: `↓ ${absChange}`, class: 'price-down' };
    } else {
      return { text: '→ 0.00', class: 'price-unchanged' };
    }
  }

  /**
   * 生成悬浮提示内容
   */
  getTooltipContent(provinceData) {
    if (!provinceData) return '暂无数据';
    
    const { name, prices, history } = provinceData;
    
    // 确保 prices 存在
    if (!prices) return '暂无数据';
    
    let historyHtml = '';
    if (history && history.length > 0) {
      historyHtml = `
        <div style="margin-top:10px;padding-top:10px;border-top:1px dashed #ddd;">
          <div style="font-size:11px;color:#888;margin-bottom:6px;">📅 近 5 次调价</div>
          ${history.map(h => {
            const formatted = this.formatPriceChange(h.change);
            return `
              <div style="display:flex;justify-content:space-between;font-size:11px;color:#555;padding:2px 0;">
                <span>${h.date}</span>
                <span style="${formatted.class === 'price-up' ? 'color:#e74c3c;font-weight:500;' : (formatted.class === 'price-down' ? 'color:#27ae60;font-weight:500;' : 'color:#95a5a6;')}">${formatted.text}</span>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    return `
      <div style="background:rgba(255,255,255,0.98);color:#333;border-radius:8px;padding:15px;box-shadow:0 4px 20px rgba(0,0,0,0.3);max-width:280px;font-size:13px;line-height:1.6;">
        <div style="font-size:16px;font-weight:600;color:#1a1a2e;margin-bottom:10px;padding-bottom:8px;border-bottom:2px solid #f39c12;">📍 ${name}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="color:#666;font-size:12px;">92#</span>
            <span style="color:#3498db;font-weight:600;font-size:14px;">¥${prices['92']?.toFixed(2) || '-'}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="color:#666;font-size:12px;">95#</span>
            <span style="color:#e74c3c;font-weight:600;font-size:14px;">¥${prices['95']?.toFixed(2) || '-'}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="color:#666;font-size:12px;">98#</span>
            <span style="color:#9b59b6;font-weight:600;font-size:14px;">¥${prices['98']?.toFixed(2) || '-'}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="color:#666;font-size:12px;">0#</span>
            <span style="color:#27ae60;font-weight:600;font-size:14px;">¥${prices['0']?.toFixed(2) || '-'}</span>
          </div>
        </div>
        ${historyHtml}
      </div>
    `;
  }
}

// 导出单例
window.oilPriceLoader = new OilPriceDataLoader();
