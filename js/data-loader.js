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
    return this.data.provinces.find(p => p.name === provinceName);
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
    if (!provinceData) return '';
    
    const { name, prices, history } = provinceData;
    
    let historyHtml = '';
    if (history && history.length > 0) {
      historyHtml = `
        <div class="tooltip-history">
          <div class="tooltip-history-title">📅 近 5 次调价</div>
          ${history.map(h => {
            const formatted = this.formatPriceChange(h.change);
            return `
              <div class="tooltip-history-item">
                <span>${h.date}</span>
                <span class="${formatted.class}">${formatted.text}</span>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    return `
      <div class="tooltip">
        <div class="tooltip-province">📍 ${name}</div>
        <div class="tooltip-prices">
          <div class="tooltip-price-item">
            <span class="tooltip-price-label">92#</span>
            <span class="tooltip-price-value price-92">¥${prices['92']?.toFixed(2) || '-'}</span>
          </div>
          <div class="tooltip-price-item">
            <span class="tooltip-price-label">95#</span>
            <span class="tooltip-price-value price-95">¥${prices['95']?.toFixed(2) || '-'}</span>
          </div>
          <div class="tooltip-price-item">
            <span class="tooltip-price-label">98#</span>
            <span class="tooltip-price-value price-98">¥${prices['98']?.toFixed(2) || '-'}</span>
          </div>
          <div class="tooltip-price-item">
            <span class="tooltip-price-label">0#</span>
            <span class="tooltip-price-value price-0">¥${prices['0']?.toFixed(2) || '-'}</span>
          </div>
        </div>
        ${historyHtml}
      </div>
    `;
  }
}

// 导出单例
window.oilPriceLoader = new OilPriceDataLoader();
