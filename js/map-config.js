/**
 * ECharts 地图配置
 * 定义地图样式、颜色映射等配置
 */

const MapConfig = {
  // 颜色映射配置 - 根据 92 号汽油价格
  colorConfig: {
    min: 7.80,  // 最低油价阈值
    max: 8.20,  // 最高油价阈值
    colors: [
      '#91CC75',  // 绿色 - 低油价
      '#91CC75',  // 绿黄色
      '#FAC858',  // 黄色 - 中油价
      '#EE6666',  // 橙红色
      '#C23531'   // 红色 - 高油价
    ]
  },

  // 地图基础配置
  mapOption: {
    roam: true,           // 允许缩放和平移
    zoom: 1.2,            // 初始缩放比例
    center: [105.0, 38.0], // 中心点坐标
    
    label: {
      show: true,
      color: '#fff',
      fontSize: 10,
      fontWeight: 'normal'
    },
    
    emphasis: {
      label: {
        show: true,
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold'
      },
      itemStyle: {
        areaColor: '#f39c12',
        shadowBlur: 10,
        shadowColor: 'rgba(0, 0, 0, 0.5)'
      }
    },
    
    itemStyle: {
      borderColor: '#1a1a2e',
      borderWidth: 1,
      areaColor: '#34495e'
    },
    
    select: {
      itemStyle: {
        areaColor: '#f39c12'
      },
      label: {
        color: '#fff'
      }
    }
  },

  // 视觉映射配置（颜色图例）
  visualMap: {
    type: 'piecewise',
    show: true,
    left: '30',
    bottom: '30',
    pieces: [
      { min: 8.10, label: '高油价 (≥¥8.10)', color: '#C23531' },
      { min: 7.95, max: 8.10, label: '较高油价 (¥7.95-8.10)', color: '#EE6666' },
      { min: 7.85, max: 7.95, label: '中等油价 (¥7.85-7.95)', color: '#FAC858' },
      { min: 7.80, max: 7.85, label: '较低油价 (¥7.80-7.85)', color: '#91CC75' },
      { max: 7.80, label: '低油价 (≤¥7.80)', color: '#2ECC71' }
    ],
    textStyle: {
      color: '#fff',
      fontSize: 11
    },
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 8
  },

  // 工具栏配置
  toolbox: {
    show: true,
    right: '30',
    top: '20',
    feature: {
      restore: {
        show: true,
        title: '重置视图'
      },
      saveAsImage: {
        show: true,
        title: '保存地图',
        backgroundColor: '#1a1a2e'
      }
    },
    iconStyle: {
      borderColor: '#fff'
    }
  },

  // 提示框配置
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: '#f39c12',
    borderWidth: 1,
    textStyle: {
      color: '#333'
    },
    padding: [10, 15],
    extraCssText: 'box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); border-radius: 8px;'
  },

  // 响应式配置
  responsive: {
    small: {
      zoom: 1.0,
      label: { fontSize: 9 }
    },
    large: {
      zoom: 1.4,
      label: { fontSize: 11 }
    }
  }
};

// 获取颜色基于油价
function getColorByPrice(price) {
  const { min, max, colors } = MapConfig.colorConfig;
  
  if (price <= min) return colors[0];
  if (price >= max) return colors[colors.length - 1];
  
  const ratio = (price - min) / (max - min);
  const index = Math.floor(ratio * (colors.length - 1));
  return colors[index];
}

// 生成各省份数据映射
function generateMapData(provinces) {
  return provinces.map(province => ({
    name: province.name,
    value: province.prices['92'],
    prices: province.prices,
    history: province.history
  }));
}

// 导出配置
window.MapConfig = MapConfig;
window.getColorByPrice = getColorByPrice;
window.generateMapData = generateMapData;
