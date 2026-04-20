#!/bin/bash

# MBTI前端缓存问题修复部署脚本
# 修复问题：进入测试页面直接显示第60题（缓存问题）

echo "🚀 开始部署MBTI前端缓存修复..."
echo ""

# 检查是否在正确的目录
if [ ! -d "frontend/dist" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

echo "📋 本次修复内容："
echo "  ✅ 修复 '一进去就是第60题' 的缓存问题"
echo "  ✅ 在store初始化时自动检测并清除旧的已完成测试数据"
echo "  ✅ 在欢迎页点击'开始测试'时强制清除缓存"
echo "  ✅ 在测试页面加载时创建全新的session"
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
echo "✨ 缓存问题已修复！"
echo ""
echo "修复原理："
echo "  1. Store初始化时自动检测并清除无效的旧数据"
echo "  2. 点击'开始测试'按钮时强制清除所有缓存"
echo "  3. 进入测试页面时创建全新的session"
echo ""
echo "测试步骤："
echo "  1. 访问 http://101.201.150.140:4173"
echo "  2. 点击 '开始测试' 按钮"
echo "  3. ✅ 应该看到第1题，而不是第60题"
echo ""
echo "用户提示："
echo "  如果用户仍有缓存问题，建议："
echo "  - 清除浏览器缓存 (Ctrl+Shift+R)"
echo "  - 或在无痕模式下测试"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
