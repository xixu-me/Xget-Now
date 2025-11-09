#!/usr/bin/env python3
"""
开发和测试脚本

提供功能：
- 启动开发服务器
- 文件变化监控
- 代码质量检查
- 自动化测试

使用方法：
    python dev.py test    # 运行测试
    python dev.py lint    # 代码检查
    python dev.py watch   # 监控文件变化
    python dev.py serve   # 启动开发服务器
"""

import http.server
import json
import os
import socketserver
import subprocess
import time


def start_dev_server(port=8000):
    """
    启动开发服务器用于测试扩展

    Args:
        port (int): 服务器端口号，默认 8000
    """

    class Handler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=os.getcwd(), **kwargs)

        def log_message(self, format, *args):
            # 简化日志输出格式
            print(f"[DEV] {format % args}")

    with socketserver.TCPServer(("", port), Handler) as httpd:
        print(f"开发服务器启动在 http://localhost:{port}")
        print("按 Ctrl+C 停止服务器")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n开发服务器已停止")


def watch_files():
    """
    监控文件变化并自动重新构建

    监控的文件包括：
    - manifest.json / manifest-firefox.json
    - JavaScript 文件 (src/background/index.js, src/content/index.js, src/popup/popup.js)
    - HTML 文件 (src/popup/index.html)
    - 兼容层文件 (src/shared/compat/*.js)
    - 平台检测文件 (src/shared/platform-detector.js, src/shared/platforms.js)
    """
    import os

    watch_files = [
        "manifest.json",
        "manifest-firefox.json",
        "src/background/index.js",
        "src/content/index.js",
        "src/popup/popup.js",
        "src/popup/index.html",
        "src/shared/compat/webext-compat.js",
        "src/shared/compat/firefox-compat.js",
        "src/shared/platform-detector.js",
        "src/shared/platforms.js",
    ]

    file_times = {}
    for file in watch_files:
        if os.path.exists(file):
            file_times[file] = os.path.getmtime(file)

    print("开始监控文件变化...")
    print(f"监控文件: {', '.join(watch_files)}")

    while True:
        try:
            changed = False
            for file in watch_files:
                if os.path.exists(file):
                    current_time = os.path.getmtime(file)
                    if file not in file_times or current_time > file_times[file]:
                        print(f"检测到文件变化: {file}")
                        file_times[file] = current_time
                        changed = True

            if changed:
                print("重新构建...")
                result = subprocess.run(
                    ["python", "build.py", "--platform", "all"],
                    capture_output=True,
                    text=True,
                )
                if result.returncode == 0:
                    print("✓ 构建成功")
                else:
                    print(f"✗ 构建失败: {result.stderr}")

            time.sleep(1)

        except KeyboardInterrupt:
            print("\n停止文件监控")
            break


def run_tests():
    """
    运行基础测试套件

    测试内容：
    - 必需文件存在性检查
    - Manifest 文件格式和内容验证
    - 平台特定配置检查

    Returns:
        bool: 所有测试是否通过
    """
    print("运行基础测试...")

    def test_manifest(file_path, platform):
        """
        测试 manifest 文件

        Args:
            file_path (str): manifest 文件路径
            platform (str): 目标平台 (chrome/firefox)

        Returns:
            bool: 测试是否通过
        """
        try:
            with open(file_path, encoding="utf-8") as f:
                manifest = json.load(f)

            # 基础字段检查
            required_fields = ["name", "version", "manifest_version"]
            for field in required_fields:
                assert field in manifest, f"缺少必需字段: {field}"

            # 平台特定检查
            if platform == "chrome":
                assert manifest["manifest_version"] == 3, "Chrome 需要 Manifest V3"
                assert "action" in manifest, "Chrome 需要 action 字段"
            elif platform == "firefox":
                assert manifest["manifest_version"] == 2, "Firefox 需要 Manifest V2"
                assert "browser_action" in manifest, "Firefox 需要 browser_action 字段"

            print(f"✓ {platform} manifest 测试通过")
            return True

        except Exception as e:
            print(f"✗ {platform} manifest 测试失败: {e}")
            return False

    # 测试文件存在性
    def test_files_exist():
        required_files = [
            "manifest.json",
            "manifest-firefox.json",
            "src/background/index.js",
            "src/content/index.js",
            "src/popup/popup.js",
            "src/popup/index.html",
            "src/shared/compat/webext-compat.js",
            "src/shared/compat/firefox-compat.js",
            "src/shared/platform-detector.js",
            "src/shared/platforms.js",
        ]

        all_exist = True
        for file in required_files:
            if os.path.exists(file):
                print(f"✓ {file} 存在")
            else:
                print(f"✗ {file} 不存在")
                all_exist = False

        return all_exist

    # 运行所有测试
    results = []
    results.append(test_files_exist())
    results.append(test_manifest("manifest.json", "chrome"))
    results.append(test_manifest("manifest-firefox.json", "firefox"))

    # 总结
    passed = sum(results)
    total = len(results)
    print(f"\n测试结果: {passed}/{total} 通过")

    return passed == total


def lint_code():
    """
    执行代码质量检查

    检查内容：
    - API 使用规范性 (优先使用 webext 兼容层)
    - 错误处理最佳实践
    - 接口导出规范性

    特殊处理：
    - webext-compat.js: 允许直接使用原生 API
    - firefox-compat.js: 允许直接使用原生 API
    - platform-detector.js: 允许直接使用原生 API
    """
    print("运行代码检查...")

    js_files = [
        "src/background/index.js",
        "src/content/index.js",
        "src/popup/popup.js",
        "src/shared/compat/webext-compat.js",
        "src/shared/compat/firefox-compat.js",
        "src/shared/platform-detector.js",
        "src/shared/platforms.js",
    ]

    for file in js_files:
        if os.path.exists(file):
            print(f"检查 {file}...")

            # 读取文件内容进行检查
            with open(file, encoding="utf-8") as f:
                content = f.read()

            # 检查常见问题
            issues = []

            # 底层文件允许直接使用原生 API
            bottom_layer_files = [
                "src/shared/compat/webext-compat.js",
                "src/shared/compat/firefox-compat.js",
                "src/shared/platform-detector.js",
            ]

            if file not in bottom_layer_files:
                if "chrome." in content and "webext." not in content:
                    issues.append("发现直接使用 chrome API，应使用 webext 兼容层")
            elif "webext-compat.js" in file:
                # 对于 webext-compat.js，检查是否正确导出了 webext 接口
                if "window.webext" not in content and "module.exports" not in content:
                    issues.append("兼容层未正确导出 webext 接口")
            elif "firefox-compat.js" in file:
                # 对于 firefox-compat.js，检查 Firefox 特定的兼容性处理
                if "browser." not in content and "chrome." not in content:
                    issues.append("Firefox 兼容层应处理 browser/chrome API")
            elif "platform-detector.js" in file:
                # 对于 platform-detector.js，检查是否正确导出了平台检测接口
                if "platformDetector" not in content:
                    issues.append("平台检测器未正确定义 platformDetector 接口")

            # 检查错误处理
            if "console.log(" in content and "console.error(" not in content:
                # 对于底层文件和平台定义文件，console.warn 也是可以接受的
                if (
                    file in bottom_layer_files or "platforms.js" in file
                ) and "console.warn(" in content:
                    pass  # 底层文件使用 console.warn 是合理的
                else:
                    issues.append("建议使用 console.error 处理错误")

            if issues:
                print(f"  ⚠ {file} 发现问题:")
                for issue in issues:
                    print(f"    - {issue}")
            else:
                print(f"  ✓ {file} 无明显问题")


def main():
    import argparse

    parser = argparse.ArgumentParser(description="Xget Now 开发工具")
    parser.add_argument(
        "command", choices=["test", "lint", "watch", "serve"], help="要执行的命令"
    )
    parser.add_argument(
        "--port", type=int, default=8000, help="开发服务器端口 (默认: 8000)"
    )

    args = parser.parse_args()

    if args.command == "test":
        success = run_tests()
        exit(0 if success else 1)
    elif args.command == "lint":
        lint_code()
    elif args.command == "watch":
        watch_files()
    elif args.command == "serve":
        start_dev_server(args.port)


if __name__ == "__main__":
    main()
