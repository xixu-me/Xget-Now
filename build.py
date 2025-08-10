#!/usr/bin/env python3
"""
构建脚本，用于生成不同浏览器版本的扩展包

支持平台：
- Chrome/Chromium（Manifest V3）
- Firefox（Manifest V2）

使用方法：
    python build.py --platform all --package
"""

import argparse
import json
import os
import shutil
import zipfile
from pathlib import Path


def create_build_directory(platform, clean=True):
    """
    创建构建目录

    Args:
        platform (str): 目标平台名称 (chrome/firefox)
        clean (bool): 是否清理已存在的目录

    Returns:
        Path: 构建目录路径
    """
    build_dir = Path(f"build/{platform}")
    if clean and build_dir.exists():
        shutil.rmtree(build_dir)
    build_dir.mkdir(parents=True, exist_ok=True)
    return build_dir


def copy_common_files(build_dir):
    """
    复制通用文件到构建目录

    Args:
        build_dir (Path): 目标构建目录
    """
    common_files = [
        "webext-compat.js",
        "background.js",
        "content.js",
        "popup.js",
        "popup.html",
        "platforms.js",
        "LICENSE",
        "README.md",
        "PRIVACY_POLICY.md",
        "SECURITY.md",
    ]

    for file in common_files:
        if os.path.exists(file):
            shutil.copy2(file, build_dir)

    # 复制图标目录
    if os.path.exists("icons"):
        shutil.copytree("icons", build_dir / "icons", dirs_exist_ok=True)


def build_chrome():
    """
    构建 Chrome/Chromium 版本

    Returns:
        Path: 构建目录路径
    """
    print("构建 Chrome 版本...")
    build_dir = create_build_directory("chrome")

    # 复制通用文件
    copy_common_files(build_dir)

    # 复制 Chrome manifest
    shutil.copy2("manifest.json", build_dir / "manifest.json")

    # 修改 background.js 为 Chrome 优化
    optimize_for_chrome(build_dir)

    print(f"Chrome 版本构建完成: {build_dir}")
    return build_dir


def build_firefox():
    """
    构建 Firefox 版本

    Returns:
        Path: 构建目录路径
    """
    print("构建 Firefox 版本...")
    build_dir = create_build_directory("firefox")

    # 复制通用文件
    copy_common_files(build_dir)

    # 复制 Firefox manifest
    shutil.copy2("manifest-firefox.json", build_dir / "manifest.json")

    # 优化文件以适配 Firefox
    optimize_for_firefox(build_dir)

    print(f"Firefox 版本构建完成: {build_dir}")
    return build_dir


def optimize_for_chrome(build_dir):
    """
    为 Chrome 优化文件

    Args:
        build_dir (Path): 构建目录路径
    """
    # 移除 background.js 中的 importScripts 调用，因为在 Manifest V3 中不需要
    bg_file = build_dir / "background.js"
    if bg_file.exists():
        content = bg_file.read_text(encoding="utf-8")
        # 注释掉 importScripts 调用
        content = content.replace(
            "importScripts('webext-compat.js');",
            "// importScripts('webext-compat.js'); // Chrome 不需要显式导入",
        )
        bg_file.write_text(content, encoding="utf-8")


def optimize_for_firefox(build_dir):
    """
    为 Firefox 优化文件

    Args:
        build_dir (Path): 构建目录路径
    """
    # Firefox 特有的优化可以在这里添加
    pass


def create_package(build_dir, platform):
    """
    创建扩展包

    Args:
        build_dir (Path): 构建目录路径
        platform (str): 目标平台名称 (chrome/firefox)

    Returns:
        Path: 扩展包文件路径
    """
    package_dir = Path("packages")
    package_dir.mkdir(exist_ok=True)

    # 读取版本信息
    manifest_file = build_dir / "manifest.json"
    with open(manifest_file, encoding="utf-8") as f:
        manifest = json.load(f)

    version = manifest["version"]

    # 根据平台设置文件扩展名和命名
    if platform == "chrome":
        file_ext = "zip"
        platform_name = "chromium"
    elif platform == "firefox":
        file_ext = "xpi"
        platform_name = "firefox"
    else:
        file_ext = "zip"
        platform_name = platform

    package_name = f"Xget-Now_{version}.{platform_name}.{file_ext}"
    package_path = package_dir / package_name

    # 创建扩展包
    compression = zipfile.ZIP_DEFLATED
    with zipfile.ZipFile(package_path, "w", compression) as zipf:
        for file_path in build_dir.rglob("*"):
            if file_path.is_file():
                arcname = file_path.relative_to(build_dir)
                zipf.write(file_path, arcname)

    print(f"扩展包已创建: {package_path}")
    return package_path


def validate_manifest(manifest_path, platform):
    """
    验证 manifest 文件格式和内容

    Args:
        manifest_path (str): manifest 文件路径
        platform (str): 目标平台名称 (chrome/firefox)

    Returns:
        bool: 验证是否通过
    """
    try:
        with open(manifest_path, encoding="utf-8") as f:
            manifest = json.load(f)

        if platform == "chrome":
            # 验证 Manifest V3 要求
            assert manifest.get("manifest_version") == 3, "Chrome 需要 Manifest V3"
            assert "action" in manifest, "Chrome 需要 action 字段"
            assert "service_worker" in manifest.get("background", {}), (
                "Chrome 需要 service_worker"
            )

        elif platform == "firefox":
            # 验证 Manifest V2 要求
            assert manifest.get("manifest_version") == 2, "Firefox 需要 Manifest V2"
            assert "browser_action" in manifest, "Firefox 需要 browser_action 字段"
            assert (
                "applications" in manifest or "browser_specific_settings" in manifest
            ), "Firefox 需要应用ID"

        print(f"✓ {platform} manifest 验证通过")
        return True

    except Exception as e:
        print(f"✗ {platform} manifest 验证失败: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description="构建 Xget Now 扩展")
    parser.add_argument(
        "--platform",
        choices=["chrome", "firefox", "all"],
        default="all",
        help="要构建的平台",
    )
    parser.add_argument("--package", action="store_true", help="创建扩展包")
    parser.add_argument(
        "--clean", action="store_true", default=True, help="清理构建目录"
    )

    args = parser.parse_args()

    platforms = []
    if args.platform == "all":
        platforms = ["chrome", "firefox"]
    else:
        platforms = [args.platform]

    build_results = []

    for platform in platforms:
        try:
            if platform == "chrome":
                build_dir = build_chrome()
            elif platform == "firefox":
                build_dir = build_firefox()

            # 验证 manifest
            manifest_path = build_dir / "manifest.json"
            if not validate_manifest(manifest_path, platform):
                continue

            build_results.append((platform, build_dir))

            # 创建扩展包
            if args.package:
                create_package(build_dir, platform)

        except Exception as e:
            print(f"构建 {platform} 时出错: {e}")

    # 总结
    print("\n构建总结:")
    for platform, build_dir in build_results:
        print(f"✓ {platform}: {build_dir}")

    if args.package:
        print("\n扩展包位于 packages/ 目录")


if __name__ == "__main__":
    main()
