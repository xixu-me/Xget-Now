#!/usr/bin/env python3
"""
开发和测试脚本
"""

import http.server
import json
import os
import socketserver
import subprocess
import time


def start_dev_server(port=8000):
    """启动开发服务器用于测试"""

    class Handler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=os.getcwd(), **kwargs)

        def log_message(self, format, *args):
            # 简化日志输出
            print(f"[DEV] {format % args}")

    with socketserver.TCPServer(("", port), Handler) as httpd:
        print(f"开发服务器启动在 http://localhost:{port}")
        print("按 Ctrl+C 停止服务器")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n开发服务器已停止")


def watch_files():
    """监控文件变化并自动重新构建"""
    import os

    watch_files = [
        "manifest.json",
        "manifest-firefox.json",
        "background.js",
        "content.js",
        "popup.js",
        "popup.html",
        "webext-compat.js",
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
    """运行测试"""
    print("运行基础测试...")

    # 测试 manifest 文件
    def test_manifest(file_path, platform):
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
            "background.js",
            "content.js",
            "popup.js",
            "popup.html",
            "webext-compat.js",
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
    """代码检查"""
    print("运行代码检查...")

    js_files = ["background.js", "content.js", "popup.js", "webext-compat.js"]

    for file in js_files:
        if os.path.exists(file):
            print(f"检查 {file}...")

            # 简单的语法检查
            with open(file, encoding="utf-8") as f:
                content = f.read()

            # 检查常见问题
            issues = []

            if "chrome." in content and "webext." not in content:
                issues.append("发现直接使用 chrome API，应使用 webext 兼容层")

            if "console.log(" in content and "console.error(" not in content:
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
