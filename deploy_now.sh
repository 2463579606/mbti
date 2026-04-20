#!/bin/bash

# MBTI前端修复部署脚本 - 立即执行版本
# 修复问题：1. "Test already completed"错误 2. 分享按钮报错

echo "🚀 开始部署MBTI前端修复..."
echo ""

# 上传文件到服务器
echo "📤 步骤 1/3: 上传前端文件到服务器..."
scp -r frontend/dist/* root@101.201.150.140:/www/wwwroot/frontend/dist/

if [ $? -ne 0 ]; then
    echo "❌ 文件上传失败 - 请检查SSH密码"
    exit 1
fi

echo "✅ 文件上传成功"
echo ""

# 重启前端服务
echo "🔄 步骤 2/3: 重启前端服务..."
ssh root@101.201.150.140 "pm2 restart mbti-frontend"

if [ $? -ne 0 ]; then
    echo "❌ 服务重启失败"
    exit 1
fi

echo "✅ 服务重启成功"
echo ""

# 等待服务启动
echo "⏳ 步骤 3/3: 等待服务启动..."
sleep 3

# 检查服务状态
echo "📊 最终服务状态:"
ssh root@101.201.150.140 "pm2 list | grep mbti"

echo ""
echo "🎉 部署完成！"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "修复内容："
echo "  ✅ 修复 'Test already completed' 错误"
echo "     -> 每次测试都创建新的session"
echo "  ✅ 修复分享结果按钮报错"
echo "     -> 添加多层fallback机制"
echo ""
echo "测试地址："
echo "  🌐 http://101.201.150.140:4173"
echo ""
echo "重要提示："
echo "  ⚠️  部署后请清除浏览器缓存！"
echo "  1. 按 Ctrl+Shift+R (Windows) 或 Cmd+Shift+R (Mac)"
echo "  2. 或打开开发工具(F12) -> 应用 -> 存储 -> 清除站点数据"
echo ""
echo "验证步骤："
echo "  1. 访问应用并点击 '开始测试'"
echo "  2. 选择答案 -> 应该能正常进入下一题"
echo "  3. 完成60题后点击 '分享结果' -> 应该复制链接成功"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
