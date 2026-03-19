/**
 * 主程序 - 初始化地图和交互
 */

class OilPriceMap {
  constructor() {
    this.chart = null;
    this.container = document.getElementById('map');
    this.loadingEl = document.getElementById('loading');
    this.updateTimeEl = document.getElementById('update-time');
    this.dataDateEl = document.getElementById('data-date');
    this.dataLoader = window.oilPriceLoader;
  }

  /**
   * 初始化地图
   */
  async init() {
    try {
      // 加载数据
      await this.dataLoader.load();
      
      // 初始化 ECharts
      this.chart = echarts.init(this.container);
      
      // 生成地图数据
      const mapData = generateMapData(this.dataLoader.getAllProvinces());
      
      // 配置地图选项
      const option = {
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          borderColor: '#f39c12',
          borderWidth: 1,
          padding: 0,
          extraCssText: 'box-shadow: 0 4px 20px rgba(0,0,0,0.3); border-radius: 8px;',
          formatter: (params) => {
            const provinceData = this.dataLoader.getProvinceData(params.name);
            return this.formatTooltip(provinceData);
          }
        },
        
        toolbox: MapConfig.toolbox,
        
        visualMap: MapConfig.visualMap,
        
        geo: {
          ...MapConfig.mapOption,
          type: 'map',
          map: 'china',
          data: mapData,
          
          // 根据油价设置颜色
          itemStyle: {
            ...MapConfig.mapOption.itemStyle,
            color: (params) => {
              if (params.value) {
                return getColorByPrice(params.value);
              }
              return '#34495e';
            }
          }
        },
        
        title: {
          text: '',
          show: false
        }
      };
      
      // 设置配置
      this.chart.setOption(option);
      
      // 隐藏加载动画
      this.loadingEl.style.display = 'none';
      
      // 更新更新时间显示
      this.updateTimeDisplay();
      
      // 监听窗口大小变化
      window.addEventListener('resize', () => {
        this.chart.resize();
      });
      
      console.log('地图初始化完成');
      
    } catch (error) {
      console.error('初始化失败:', error);
      this.showError('加载失败：' + error.message);
    }
  }

  /**
   * 格式化悬浮提示
   */
  formatTooltip(provinceData) {
    if (!provinceData || !provinceData.prices) {
      return '暂无数据';
    }

    const { name, prices, history } = provinceData;
    const p = prices;

    // 构建价格行
    let content = `
      <div style="padding:12px 16px 8px; border-bottom:2px solid #f39c12;">
        <div style="font-size:15px; font-weight:600; color:#1a1a2e;">📍 ${name}</div>
      </div>
      <div style="padding:10px 16px;">
        <table style="width:100%; border-collapse:collapse; font-size:13px;">
          <tr>
            <td style="padding:6px 0; color:#666;">92#</td>
            <td style="padding:6px 0; color:#3498db; font-weight:600; text-align:right;">¥${p['92']?.toFixed(2) || '-'}</td>
          </tr>
          <tr>
            <td style="padding:6px 0; color:#666;">95#</td>
            <td style="padding:6px 0; color:#e74c3c; font-weight:600; text-align:right;">¥${p['95']?.toFixed(2) || '-'}</td>
          </tr>
          <tr>
            <td style="padding:6px 0; color:#666;">98#</td>
            <td style="padding:6px 0; color:#9b59b6; font-weight:600; text-align:right;">¥${p['98']?.toFixed(2) || '-'}</td>
          </tr>
          <tr>
            <td style="padding:6px 0; color:#666;">0#</td>
            <td style="padding:6px 0; color:#27ae60; font-weight:600; text-align:right;">¥${p['0']?.toFixed(2) || '-'}</td>
          </tr>
        </table>
      </div>
    `;

    // 添加历史调价
    if (history && history.length > 0) {
      content += `
        <div style="padding:8px 16px 12px; border-top:1px dashed #ddd; margin:0 16px;">
          <div style="font-size:11px; color:#888; margin-bottom:6px;">📅 近 5 次调价</div>
      `;
      
      history.forEach(h => {
        const changeClass = h.change > 0 ? '#e74c3c' : (h.change < 0 ? '#27ae60' : '#95a5a6');
        const changeIcon = h.change > 0 ? '↑' : (h.change < 0 ? '↓' : '→');
        const changeText = h.change > 0 ? `+${h.change.toFixed(2)}` : h.change.toFixed(2);
        
        content += `
          <div style="display:flex; justify-content:space-between; font-size:11px; color:#555; padding:3px 0;">
            <span>${h.date}</span>
            <span style="color:${changeClass}; font-weight:500;">${changeIcon} ${changeText}</span>
          </div>
        `;
      });
      
      content += `</div>`;
    }

    return content;
  }

  /**
   * 更新时间显示
   */
  updateTimeDisplay() {
    const updateTime = this.dataLoader.getUpdateTime();
    const nextAdjust = this.dataLoader.getNextAdjustDate();
    
    if (updateTime) {
      const dateStr = this.formatDate(updateTime);
      this.updateTimeEl.textContent = `数据更新时间：${dateStr}`;
      
      if (nextAdjust) {
        const nextDate = this.formatDate(nextAdjust);
        this.dataDateEl.textContent = ` · 下次调价：${nextDate}`;
      }
    }
  }

  /**
   * 格式化日期
   */
  formatDate(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 显示错误信息
   */
  showError(message) {
    this.loadingEl.innerHTML = `
      <div style="color: #e74c3c; text-align: center;">
        <div style="font-size: 40px; margin-bottom: 10px;">❌</div>
        <p>${message}</p>
        <p style="font-size: 12px; color: #888; margin-top: 10px;">请刷新页面重试</p>
      </div>
    `;
  }

  /**
   * 获取统计信息
   */
  getStatistics() {
    const provinces = this.dataLoader.getAllProvinces();
    
    // 最高价
    const maxProvince = this.dataLoader.getExtremePrice('92', 'max');
    // 最低价
    const minProvince = this.dataLoader.getExtremePrice('92', 'min');
    // 平均价
    const avgPrice = this.dataLoader.getAveragePrice('92');
    
    return {
      max: maxProvince,
      min: minProvince,
      avg: avgPrice,
      total: provinces.length
    };
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  const map = new OilPriceMap();
  map.init();
  
  // 暴露到全局以便调试
  window.oilPriceMap = map;
});
