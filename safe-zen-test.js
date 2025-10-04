/**
 * 安全的 Zen Browser 测试脚本
 * 避免重复声明错误，可以多次运行
 */

(function() {
    'use strict';
    
    // 避免重复声明
    if (window.zenTestRunning) {
        console.log('⚠️ 测试已在运行中，请等待完成');
        return;
    }
    
    window.zenTestRunning = true;
    
    console.log('🚀 开始 Zen Browser 安全测试...');
    
    const testResults = {
        timestamp: new Date().toISOString(),
        browser: null,
        apis: {},
        storage: null,
        messaging: null,
        overall: 'unknown'
    };
    
    // 测试 1: 检查基本 API
    console.log('1️⃣ 检查基本 API...');
    const hasChrome = typeof chrome !== 'undefined';
    const hasBrowser = typeof browser !== 'undefined';
    const hasWebext = typeof webext !== 'undefined';
    
    testResults.apis = {
        chrome: hasChrome,
        browser: hasBrowser,
        webext: hasWebext
    };
    
    console.log(`Chrome API: ${hasChrome ? '✅' : '❌'}`);
    console.log(`Browser API: ${hasBrowser ? '✅' : '❌'}`);
    console.log(`Webext API: ${hasWebext ? '✅' : '❌'}`);
    
    // 获取 API 引用
    let extensionAPI = null;
    if (hasBrowser) {
        extensionAPI = browser;
        testResults.browser = 'firefox-based';
    } else if (hasChrome) {
        extensionAPI = chrome;
        testResults.browser = 'chrome-based';
    }
    
    // 测试 2: 检查存储 API
    console.log('2️⃣ 检查存储 API...');
    if (extensionAPI && extensionAPI.storage && extensionAPI.storage.local) {
        console.log('存储 API: ✅ 可用');
        
        // 测试存储功能
        const testKey = 'zenTest_' + Date.now();
        const testValue = 'testValue_' + Math.random();
        
        extensionAPI.storage.local.set({[testKey]: testValue})
            .then(() => {
                console.log('存储写入: ✅ 成功');
                testResults.storage = 'write-success';
                return extensionAPI.storage.local.get([testKey]);
            })
            .then(result => {
                if (result[testKey] === testValue) {
                    console.log('存储读取: ✅ 成功');
                    testResults.storage = 'full-success';
                } else {
                    console.log('存储读取: ❌ 失败');
                    testResults.storage = 'read-failed';
                }
                // 清理
                return extensionAPI.storage.local.remove([testKey]);
            })
            .then(() => {
                console.log('存储清理: ✅ 完成');
            })
            .catch(error => {
                console.log('存储测试: ❌ 失败', error.message);
                testResults.storage = 'failed';
            });
    } else {
        console.log('存储 API: ❌ 不可用');
        testResults.storage = 'unavailable';
    }
    
    // 测试 3: 检查消息传递
    console.log('3️⃣ 检查消息传递...');
    if (extensionAPI && extensionAPI.runtime && extensionAPI.runtime.sendMessage) {
        console.log('消息 API: ✅ 可用');
        
        // 尝试发送消息
        extensionAPI.runtime.sendMessage({action: 'getSettings'})
            .then(response => {
                if (response && typeof response === 'object') {
                    console.log('消息传递: ✅ 成功，收到有效响应');
                    console.log('响应类型:', typeof response);
                    testResults.messaging = 'success';
                    
                    // 检查响应内容
                    if (response.xgetDomain !== undefined) {
                        console.log('设置对象: ✅ 有效');
                    }
                } else if (response === null) {
                    console.log('消息传递: ⚠️ 成功发送，但收到空响应');
                    testResults.messaging = 'null-response';
                } else {
                    console.log('消息传递: ⚠️ 收到响应但格式异常');
                    testResults.messaging = 'invalid-response';
                }
            })
            .catch(error => {
                console.log('消息传递: ❌ 失败', error.message);
                testResults.messaging = 'failed';
            });
    } else {
        console.log('消息 API: ❌ 不可用');
        testResults.messaging = 'unavailable';
    }
    
    // 测试 4: 检查 Zen Browser 特定功能
    console.log('4️⃣ 检查 Zen Browser 特定功能...');
    if (typeof isZenBrowser === 'function') {
        try {
            const isZen = isZenBrowser();
            console.log(`Zen Browser 检测: ${isZen ? '✅ 是 Zen Browser' : '⚠️ 不是 Zen Browser'}`);
            testResults.browser = isZen ? 'zen' : testResults.browser;
        } catch (error) {
            console.log('Zen Browser 检测: ❌ 函数执行失败', error.message);
        }
    } else {
        console.log('Zen Browser 检测: ❌ 函数不可用');
    }
    
    if (typeof zenBrowserApiCheck === 'function') {
        console.log('Zen API 检查: ✅ 可用');
        try {
            const apiCheck = zenBrowserApiCheck();
            console.log('API 检查结果:', apiCheck);
        } catch (error) {
            console.log('API 检查: ❌ 失败', error.message);
        }
    } else {
        console.log('Zen API 检查: ❌ 不可用');
    }
    
    // 综合评估
    setTimeout(() => {
        console.log('📊 综合评估...');
        
        const criticalTests = [
            testResults.apis.chrome || testResults.apis.browser,
            extensionAPI && extensionAPI.storage && extensionAPI.storage.local,
            extensionAPI && extensionAPI.runtime && extensionAPI.runtime.sendMessage
        ];
        
        const passedTests = criticalTests.filter(Boolean).length;
        const totalTests = criticalTests.length;
        
        console.log(`通过测试: ${passedTests}/${totalTests}`);
        
        if (passedTests === totalTests) {
            testResults.overall = 'excellent';
            console.log('🎉 所有关键测试通过！扩展应该能正常工作');
        } else if (passedTests >= 2) {
            testResults.overall = 'good';
            console.log('⚠️ 大部分测试通过，扩展可能可以工作');
        } else {
            testResults.overall = 'poor';
            console.log('❌ 多个关键测试失败，需要检查扩展安装');
        }
        
        console.log('💡 建议:');
        if (testResults.overall === 'excellent') {
            console.log('   - 扩展工作正常，可以正常使用');
        } else if (testResults.overall === 'good') {
            console.log('   - 扩展基本可用，如有问题请重启浏览器');
        } else {
            console.log('   - 使用最新的 Zen Browser 优化版本');
            console.log('   - 确保在 about:debugging 中正确加载扩展');
            console.log('   - 检查浏览器控制台是否有其他错误');
        }
        
        // 保存结果
        window.zenTestResults = testResults;
        console.log('📊 详细结果已保存到 window.zenTestResults');
        
        // 重置运行标志
        window.zenTestRunning = false;
        
    }, 3000);
    
    console.log('⏳ 测试进行中，请等待 3 秒查看完整结果...');
    
})();

// 提供便捷的重新测试函数
window.runZenTest = function() {
    if (window.zenTestRunning) {
        console.log('⚠️ 测试已在运行中，请等待完成');
        return;
    }
    
    console.clear();
    // 重新运行测试
    eval(document.querySelector('script[src*="safe-zen-test"]')?.textContent || 
         '/* 请手动复制并运行测试脚本 */');
};

console.log('💡 提示: 可以随时运行 runZenTest() 重新测试');