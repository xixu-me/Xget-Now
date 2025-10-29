#!/usr/bin/env python3
"""
Zen Browser 专用构建脚本

这个脚本创建一个专门针对 Zen Browser 优化的扩展版本
"""

import os
import shutil
import json
import zipfile
from pathlib import Path

def create_zen_build():
    """创建 Zen Browser 专用构建"""
    
    # 创建构建目录
    build_dir = Path("build/zen")
    if build_dir.exists():
        shutil.rmtree(build_dir)
    build_dir.mkdir(parents=True, exist_ok=True)
    
    print("🔧 创建 Zen Browser 专用构建...")
    
    # 复制基础文件
    files_to_copy = [
        "background-zen.js",
        "content.js", 
        "popup.html",
        "popup.js",
        "webext-compat.js",
        "zen-browser-fix.js",
        "platform-detector.js",
        "platforms.js",
        "simple-zen-test.js",
        "safe-zen-test.js",
        "test-zen-fix.html",
        "LICENSE",
        "README.md"
    ]
    
    for file in files_to_copy:
        if os.path.exists(file):
            # 特殊处理：将 background-zen.js 重命名为 background.js
            if file == "background-zen.js":
                shutil.copy2(file, build_dir / "background.js")
                print(f"✅ 复制 {file} -> background.js")
            else:
                shutil.copy2(file, build_dir / file)
                print(f"✅ 复制 {file}")
    
    # 复制图标目录
    if os.path.exists("icons"):
        shutil.copytree("icons", build_dir / "icons")
        print("✅ 复制 icons 目录")
    
    # 创建 Zen Browser 专用 manifest
    with open("manifest-zen.json", "r", encoding="utf-8") as f:
        manifest = json.load(f)
    
    # Zen Browser 专用 manifest 已经包含所有必要的优化
    # 只需要重命名后台脚本文件
    if "background" in manifest and "scripts" in manifest["background"]:
        scripts = manifest["background"]["scripts"]
        for i, script in enumerate(scripts):
            if script == "background-zen.js":
                scripts[i] = "background.js"  # 重命名为标准名称
    
    # 保存 Zen Browser 专用 manifest
    with open(build_dir / "manifest.json", "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    print("✅ 创建 Zen Browser 专用 manifest.json")
    
    # 创建 Zen Browser 专用的 README
    zen_readme = """# Xget Now - Zen Browser 优化版

这是专门为 Zen Browser 优化的 Xget Now 扩展版本。

## Zen Browser 特殊优化

- 增强的 API 兼容性处理
- 改进的设置加载机制
- 更好的错误处理和恢复
- 针对 Zen Browser 的特殊修复

## 安装方法

1. 下载 `Xget-Now_zen.zip` 文件
2. 在 Zen Browser 中打开 `about:debugging`
3. 点击 "This Zen Browser"
4. 点击 "Load Temporary Add-on"
5. 选择解压后的 manifest.json 文件

## 故障排除

如果遇到设置加载问题：

1. 打开浏览器开发者工具 (F12)
2. 在控制台中运行 `zenBrowserApiCheck()` 检查 API 可用性
3. 重新加载扩展或重启浏览器

## 支持

如果在 Zen Browser 中仍然遇到问题，请在 GitHub 上报告问题并注明使用的是 Zen Browser。
"""
    
    with open(build_dir / "README_ZEN.md", "w", encoding="utf-8") as f:
        f.write(zen_readme)
    print("✅ 创建 Zen Browser 专用 README")
    
    # 创建调试信息文件
    debug_info = {
        "build_type": "zen-browser-optimized",
        "build_date": "2024-12-19",
        "optimizations": [
            "Enhanced API compatibility",
            "Improved settings loading",
            "Better error handling",
            "Zen Browser specific fixes"
        ],
        "debug_commands": {
            "zenBrowserApiCheck": "Check API availability",
            "isZenBrowser": "Detect if running in Zen Browser"
        }
    }
    
    with open(build_dir / "zen-debug-info.json", "w", encoding="utf-8") as f:
        json.dump(debug_info, f, indent=2, ensure_ascii=False)
    print("✅ 创建调试信息文件")
    
    # 创建 ZIP 包
    packages_dir = Path("packages")
    packages_dir.mkdir(exist_ok=True)
    zip_path = packages_dir / "Xget-Now_zen.zip"
    
    # 删除现有的 ZIP 文件（如果存在）
    if zip_path.exists():
        zip_path.unlink()
    
    with zipfile.ZipFile(str(zip_path), 'w', zipfile.ZIP_DEFLATED) as zipf:
        for file_path in build_dir.rglob('*'):
            if file_path.is_file():
                arcname = file_path.relative_to(build_dir)
                zipf.write(file_path, arcname)
                print(f"📦 添加到 ZIP: {arcname}")
    
    print(f"🎉 Zen Browser 优化版构建完成: {zip_path}")
    print(f"📁 构建目录: {build_dir}")
    
    return zip_path

if __name__ == "__main__":
    try:
        zip_path = create_zen_build()
        print(f"\n✨ 构建成功！")
        print(f"📦 ZIP 文件: {zip_path}")
        print(f"📏 文件大小: {zip_path.stat().st_size / 1024:.1f} KB")
        
        print("\n🔧 安装说明:")
        print("1. 在 Zen Browser 中打开 about:debugging")
        print("2. 点击 'This Zen Browser'")
        print("3. 点击 'Load Temporary Add-on'")
        print("4. 选择解压后的 manifest.json 文件")
        
    except Exception as e:
        print(f"❌ 构建失败: {e}")
        exit(1)