#!/bin/bash
# 阿里云账单快速查询脚本

echo "======================================"
echo "  阿里云账单快速查询"
echo "======================================"
echo ""

# 检查 CLI 配置
echo "📁 检查 CLI 配置..."
if aliyun configure list 2>&1 | grep -q "Valid"; then
    echo "✅ CLI 配置正常"
else
    echo "❌ CLI 未配置或配置无效"
    echo ""
    echo "请运行：aliyun configure"
    echo "或查看：~/.openclaw/configs/ALIYUN-CREDENTIALS.md"
    exit 1
fi
echo ""

# 查询余额
echo "💰 查询账户余额..."
balance=$(aliyun bssopenapi QueryAccountBalance 2>/dev/null | grep -o '"AvailableAmount":"[^"]*"' | cut -d'"' -f4)
if [ -n "$balance" ]; then
    echo "   可用余额：${balance} CNY"
else
    echo "   ❌ 查询失败"
fi
echo ""

# 查询最近 7 天交易
echo "📝 查询最近 7 天交易记录..."
start_date=$(date -d '7 days ago' +%Y-%m-%dT00:00:00Z 2>/dev/null || date -v-7d +%Y-%m-%dT00:00:00Z 2>/dev/null || echo "2026-05-25T00:00:00Z")
end_date=$(date +%Y-%m-%dT23:59:59Z 2>/dev/null || echo "2026-06-01T23:59:59Z")

echo "   时间范围：${start_date} 到 ${end_date}"
echo ""

aliyun bssopenapi QueryAccountTransactions \
    --CreateTimeStart "$start_date" \
    --CreateTimeEnd "$end_date" \
    --PageSize 10 2>/dev/null | \
    grep -E '"Amount"|"TransactionTime"|"Remarks"' | \
    sed 's/^[[:space:]]*/   /g'

echo ""
echo "======================================"
echo "  配置信息"
echo "======================================"
echo "📁 CLI 配置：~/.aliyun/config.json"
echo "📁 备份配置：~/.openclaw/configs/"
echo "📁 配置文档：~/.openclaw/configs/ALIYUN-CREDENTIALS.md"
echo "📁 Memory 文件：~/docs/memory/02-project-notes.md"
echo ""
echo "🔧 恢复配置：~/.openclaw/configs/restore-config.sh"
echo "======================================"
