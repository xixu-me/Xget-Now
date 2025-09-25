/**
 * Zen Browser 安装验证脚本
 * 
 * 在浏览器控制台中运行此脚本来验证扩展是否正确安装
 */

(function() {
    console.log('🔧 开始 Zen Browser 扩展验证...');
    
    const results = {
        browser: null,
        apis: {},
        storage: null,
        messaging: null,
        overall: 'unknown'
    };
    
    // 1. 检测浏览器
    console.log('1️⃣ 检测浏览器环境...');
    const ua = navigator.userAgent;
    const isZen = /\bZen\//.test(ua) || /\bzen\b/i.test(ua);
    results.browser = isZen ? 'zen' : 'other';
    console.log(`   浏览器: ${isZen ? 'Zen Browser ✅' : '其他浏览器 ⚠️'}`);
    
    // 2. 检查 API 可用性
    console.log('2️⃣ 检查 API 可用性...');
    const apiChecks = {
        browser: typeof browser !== 'undefined',
        chrome: typeof chrome !== 'undefined',
        webext: typeof webext !== 'undefined',
        browserRuntime: !!(browser?.runtime),
        chromeRuntime: !!(chrome?.runtime),
        webextRuntime: !!(webext?.runtime),
        webextStorage: !!(webext?.storage),
        zenFix: typeof isZenBrowser !== 'undefined'
    };
    
    results.apis = apiChecks;
    Object.entries(apiChecks).forEach(([key, value]) => {
        console.log(`   ${key}: ${value ? '✅' : '❌'}`);
    });
    
    // 3. 测试存储功能
    console.log('3️⃣ 测试存储功能...');
    if (webext?.storage?.local) {
        webext.storage.local.get({})
            .then(data => {
                results.storage = 'success';
                console.log('   存储测试: ✅ 成功');
            })
            .catch(error => {
                results.storage = 'failed';
                console.log('   存储测试: ❌ 失败', error.message);
            });
    } else {
        results.storage = 'unavailable';
        console.log('   存储测试: ❌ API 不可用');
    }
    
    // 4. 测试消息传递
    console.log('4️⃣ 测试消息传递...');
    if (webext?.runtime?.sendMessage) {
        webext.runtime.sendMessage({ action: 'getSettings' })
            .then(response => {
                if (response) {
                    results.messaging = 'success';
                    console.log('   消息传递: ✅ 成功，收到响应');
                } else {
                    results.messaging = 'no-response';
                    console.log('   消息传递: ⚠️ 成功发送，但无响应');
                }
            })
            .catch(error => {
                results.messaging = 'failed';
                console.log('   消息传递: ❌ 失败', error.message);
            });
    } else {
        results.messaging = 'unavailable';
        console.log('   消息传递: ❌ API 不可用');
    }
    
    // 5. 综合评估
    setTimeout(() => {
        console.log('5️⃣ 综合评估...');
        
        const criticalAPIs = apiChecks.webext && apiChecks.webextRuntime && apiChecks.webextStorage;
        const storageOK = results.storage === 'success';
        const messagingOK = results.messaging === 'success' || results.messaging === 'no-response';
        
        if (criticalAPIs && storageOK && messagingOK) {
            results.overall = 'excellent';
            console.log('   🎉 扩展状态: 优秀 - 所有功能正常');
        } else if (criticalAPIs && (storageOK || messagingOK)) {
            results.overall = 'good';
            console.log('   ✅ 扩展状态: 良好 - 基本功能可用');
        } else if (criticalAPIs) {
            results.overall = 'basic';
            console.log('   ⚠️ 扩展状态: 基础 - API 可用但功能受限');
        } else {
            results.overall = 'poor';
            console.log('   ❌ 扩展状态: 差 - 关键 API 不可用');
        }
        
        // 提供建议
        console.log('💡 建议:');
        if (results.overall === 'excellent') {
            console.log('   - 扩展工作正常，可以正常使用');
        } else if (results.overall === 'good') {
            console.log('   - 扩展基本可用，如有问题请重启浏览器');
        } else if (results.overall === 'basic') {
            console.log('   - 重新安装扩展或检查权限设置');
        } else {
            console.log('   - 使用最新的 Zen Browser 优化版本');
            console.log('   - 确保在 about:debugging 中正确加载扩展');
        }
        
        // 返回结果供进一步分析
        window.zenVerificationResults = results;
        console.log('📊 详细结果已保存到 window.zenVerificationResults');
        
    }, 2000);
    
    console.log('⏳ 验证进行中，请等待 2 秒查看完整结果...');
    
})();

// 提供便捷的重新验证函数
window.verifyZenExtension = function() {
    console.clear();
    // 重新运行验证脚本
    eval(document.querySelector('script[src*="verify-zen-install"]')?.textContent || '/* 请手动运行验证脚本 */');
};