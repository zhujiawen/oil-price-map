#!/usr/bin/env python3
"""
油价数据更新脚本
更新 data/oil-prices.json 中的油价数据

注意：此脚本为模板，需要根据实际数据源调整抓取逻辑
"""

import json
import sys
from datetime import datetime, timedelta
from pathlib import Path

# 模拟油价数据（实际应从网站抓取）
# 国内油价每 10 个工作日调整一次
def generate_mock_data():
    """生成模拟油价数据"""
    
    # 基础油价（以 2026-03-19 为基准）
    base_92 = 7.95
    base_95 = 8.46
    base_98 = 9.65
    base_0 = 7.61
    
    # 各省差异系数
    province_factors = {
        "北京市": 1.00, "天津市": 0.99, "上海市": 0.99, "重庆市": 1.01,
        "河北省": 0.99, "山西省": 1.00, "辽宁省": 0.98, "吉林省": 0.99,
        "黑龙江省": 0.98, "江苏省": 0.98, "浙江省": 0.98, "安徽省": 1.00,
        "福建省": 0.99, "江西省": 1.00, "山东省": 0.99, "河南省": 1.00,
        "湖北省": 1.01, "湖南省": 1.01, "广东省": 0.98, "广西壮族自治区": 1.01,
        "海南省": 1.03, "四川省": 1.02, "贵州省": 1.01, "云南省": 1.02,
        "陕西省": 1.00, "甘肃省": 1.01, "青海省": 1.02, "内蒙古自治区": 1.00,
        "宁夏回族自治区": 1.00, "新疆维吾尔自治区": 0.98, "西藏自治区": 1.03
    }
    
    provinces = []
    for name, factor in province_factors.items():
        # 生成历史调价记录（模拟近 5 次）
        history = []
        current_date = datetime(2026, 3, 19)
        
        for i in range(5):
            date = current_date - timedelta(days=(i + 1) * 14)  # 每 14 天调整一次
            # 模拟价格波动
            change = (-1) ** i * (0.08 + i * 0.02)
            price_92 = base_92 * factor + sum([(-1) ** j * 0.1 for j in range(i)])
            
            history.append({
                "date": date.strftime('%Y-%m-%d'),
                "change": round(change, 2),
                "92": round(price_92, 2),
                "95": round(price_92 * 1.065, 2)
            })
        
        provinces.append({
            "name": name,
            "code": get_province_code(name),
            "prices": {
                "92": round(base_92 * factor, 2),
                "95": round(base_95 * factor, 2),
                "98": round(base_98 * factor, 2),
                "0": round(base_0 * factor, 2)
            },
            "history": history
        })
    
    return {
        "updateTime": datetime.now().strftime('%Y-%m-%d'),
        "nextAdjustDate": (datetime.now() + timedelta(days=10)).strftime('%Y-%m-%d'),
        "provinces": provinces
    }

def get_province_code(name):
    """获取省份行政区划代码"""
    codes = {
        "北京市": "110000", "天津市": "120000", "上海市": "310000", "重庆市": "500000",
        "河北省": "130000", "山西省": "140000", "辽宁省": "210000", "吉林省": "220000",
        "黑龙江省": "230000", "江苏省": "320000", "浙江省": "330000", "安徽省": "340000",
        "福建省": "350000", "江西省": "360000", "山东省": "370000", "河南省": "410000",
        "湖北省": "420000", "湖南省": "430000", "广东省": "440000", "广西壮族自治区": "450000",
        "海南省": "460000", "四川省": "510000", "贵州省": "520000", "云南省": "530000",
        "陕西省": "610000", "甘肃省": "620000", "青海省": "630000", "内蒙古自治区": "150000",
        "宁夏回族自治区": "640000", "新疆维吾尔自治区": "650000", "西藏自治区": "540000"
    }
    return codes.get(name, "000000")

def main():
    """主函数"""
    try:
        # 生成数据
        data = generate_mock_data()
        
        # 保存文件
        output_path = Path(__file__).parent.parent / 'data' / 'oil-prices.json'
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"✅ 油价数据已更新：{data['updateTime']}")
        print(f"📊 省份数量：{len(data['provinces'])}")
        print(f"📅 下次调价：{data['nextAdjustDate']}")
        
        return 0
    except Exception as e:
        print(f"❌ 更新失败：{e}", file=sys.stderr)
        return 1

if __name__ == '__main__':
    sys.exit(main())
