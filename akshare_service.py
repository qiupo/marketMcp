#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AkShare Python服务
为MCP服务器提供金融数据接口
"""

import sys
import json
import importlib
from typing import Dict, Any, Optional, Union
import traceback

# 导入akshare
try:
    import akshare as ak
    import pandas as pd
    print(json.dumps({
        "success": True,
        "message": "akshare库加载成功"
    }), file=sys.stderr)
except ImportError as e:
    print(json.dumps({
        "success": False,
        "error": f"akshare库未安装，请先安装：pip install akshare\\n错误详情：{str(e)}"
    }))
    sys.exit(1)

class AkshareService:
    """AkShare服务类"""

    def __init__(self):
        self.ak = ak

    def call_function(self, function_name: str, params: Dict[str, Any], original_args: Dict[str, Any] = None) -> Dict[str, Any]:
        """动态调用akshare函数"""
        try:
            # 特殊处理 realtime_quote 函数，因为它在 akshare 中不存在
            actual_function_name = function_name
            if function_name == 'realtime_quote':
                actual_function_name = 'stock_zh_a_spot_em'  # 映射到 A 股实时行情

            # 获取函数
            if not hasattr(self.ak, actual_function_name):
                return {
                    "success": False,
                    "error": f"函数 {function_name}（映射到 {actual_function_name}）不存在"
                }

            func = getattr(self.ak, actual_function_name)

            # 保存原始参数用于limit处理
            if original_args is None:
                original_args = params.copy()

            # 特殊处理某些函数的参数
            if function_name == 'stock_zh_a_hist':
                params = self._prepare_hist_params(params)
            elif function_name == 'stock_individual_info_em':
                params = self._prepare_individual_info_params(params)
            elif function_name == 'stock_individual_basic_info_xq':
                params = self._prepare_individual_basic_info_params(params)
            elif function_name == 'stock_individual_spot_xq':
                params = self._prepare_individual_spot_xq_params(params)
            elif function_name == 'stock_zh_a_minute':
                params = self._prepare_minute_params(params)
            elif function_name == 'realtime_quote':
                params = self._prepare_realtime_quote_params(params)
            elif function_name in ['stock_sh_a_spot_em', 'stock_sz_a_spot_em',
                                 'stock_kc_a_spot_em', 'stock_zh_b_spot_em',
                                 'stock_zh_a_new_em', 'stock_zh_a_st_em', 'stock_zh_ah_spot_em',
                                 'stock_us_spot_em']:
                # 这些函数通常不需要参数，移除limit等非标准参数
                params = {}

            # 调用函数
            print(f"[Python] 调用函数: {function_name}({params})", file=sys.stderr)
            result = func(**params)

            # 将DataFrame转换为字典列表
            if isinstance(result, pd.DataFrame):
                # 处理limit参数
                limit = original_args.get('limit') if original_args else None
                if limit and isinstance(limit, int) and limit > 0:
                    data = result.head(limit).to_dict('records')
                else:
                    data = result.to_dict('records')

                return {
                    "success": True,
                    "data": data,
                    "count": len(data),
                    "columns": list(result.columns)
                }
            elif isinstance(result, pd.Series):
                data = result.to_dict()
                return {
                    "success": True,
                    "data": data
                }
            else:
                # 处理其他类型的结果
                if hasattr(result, 'to_dict'):
                    data = result.to_dict()
                else:
                    data = result

                return {
                    "success": True,
                    "data": data
                }

        except Exception as e:
            error_msg = f"调用函数失败: {str(e)}\\n{traceback.format_exc()}"
            print(f"[Python Error] {error_msg}", file=sys.stderr)
            return {
                "success": False,
                "error": str(e)
            }

    def _prepare_hist_params(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """准备历史数据参数"""
        # 移除limit参数，因为它不是akshare的原始参数
        clean_params = {k: v for k, v in params.items() if k != 'limit'}

        # 确保日期格式正确
        for date_key in ['start_date', 'end_date']:
            if date_key in clean_params and clean_params[date_key]:
                date_val = str(clean_params[date_key])
                # 移除可能的分隔符
                clean_date = ''.join(c for c in date_val if c.isdigit())
                if len(clean_date) == 8:
                    clean_params[date_key] = clean_date
                else:
                    clean_params[date_key] = date_val

        return clean_params

    def _prepare_individual_info_params(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """准备个股信息查询参数"""
        symbol = params.get('symbol', '')
        # akshare的stock_individual_info_em只需要symbol参数
        return {'symbol': symbol}

    def _prepare_individual_basic_info_params(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """准备个股基本信息查询参数（雪球）"""
        symbol = params.get('symbol', '')
        # 雪球股票代码格式需要加上SH/SZ前缀
        if symbol and not symbol.startswith(('SH', 'SZ')):
            if symbol.startswith('6'):  # 上海证券交易所
                symbol = f'SH{symbol}'
            elif symbol.startswith(('0', '3')):  # 深圳证券交易所
                symbol = f'SZ{symbol}'

        return {'symbol': symbol}

    def _prepare_individual_spot_xq_params(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """准备个股实时行情查询参数（雪球）"""
        symbol = params.get('symbol', '')
        # 雪球股票代码格式需要加上SH/SZ前缀
        if symbol and not symbol.startswith(('SH', 'SZ')):
            if symbol.startswith('6'):  # 上海证券交易所
                symbol = f'SH{symbol}'
            elif symbol.startswith(('0', '3')):  # 深圳证券交易所
                symbol = f'SZ{symbol}'

        return {'symbol': symbol}

    def _prepare_minute_params(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """准备分时数据参数"""
        clean_params = {}

        if 'symbol' in params:
            clean_params['symbol'] = params['symbol']
        if 'period' in params:
            clean_params['period'] = params['period']
        if 'adjust' in params:
            clean_params['adjust'] = params['adjust']

        return clean_params

    def _prepare_realtime_quote_params(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """准备实时行情参数"""
        # realtime_quote 函数在 akshare 中不存在，映射到 stock_zh_a_spot_em
        # 该函数不需要参数，会返回所有 A 股实时行情
        return {}

def main():
    """主函数"""
    try:
        # 读取输入参数
        input_data = None

        # 尝试从命令行参数读取
        if len(sys.argv) > 1:
            try:
                input_data = json.loads(sys.argv[1])
            except json.JSONDecodeError:
                # 如果命令行参数不是JSON，尝试从stdin读取
                pass

        # 如果命令行参数解析失败，从stdin读取
        if input_data is None:
            try:
                input_str = sys.stdin.read().strip()
                if input_str:
                    input_data = json.loads(input_str)
                else:
                    input_data = {}
            except json.JSONDecodeError:
                input_data = {}

        function_name = input_data.get('function')
        params = input_data.get('params', {})

        if not function_name:
            result = {
                "success": False,
                "error": "未指定函数名称"
            }
        else:
            # 创建服务实例
            service = AkshareService()

            # 调用函数，传递原始参数
            result = service.call_function(function_name, params, input_data)

        # 输出结果
        print(json.dumps(result, ensure_ascii=False, default=str))

    except json.JSONDecodeError as e:
        print(json.dumps({
            "success": False,
            "error": f"JSON解析失败: {str(e)}"
        }))
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": f"服务执行失败: {str(e)}\\n{traceback.format_exc()}"
        }))

if __name__ == "__main__":
    main()
