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
          ...MapConfig.tooltip,
          formatter: (params) => {
            const provinceData = this.dataLoader.getProvinceData(params.name);
            return this.dataLoader.getTooltipContent(provinceData);
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
        
        // 添加标题
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
