/**
 * 简单的 Zen Browser 测试命令
 * 可以在控制台中安全地多次运行
 */

// 清理之前的测试结果
delete window.zenSimpleTestResult;

console.log('🔍 Zen Browser 简单测试');

// 使用立即执行函数避免变量冲突
(function() {
    const result = {};
    
    // 1. 基本 API 检查
    result.apis = {
        browser: typeof browser !== 'undefined',
        chrome: typeof chrome !== 'undefined',
        webext: typeof webext !== 'undefined'
    };
    
    // 2. 获取可用的 API
    const availableAPI = result.apis.browser ? browser : 
                        result.apis.chrome ? chrome : null;
    
    result.extensionAPI = !!availableAPI;
    result.storage = !!(availableAPI?.storage?.local);
    result.messaging = !!(availableAPI?.runtime?.sendMessage);
    
    // 3. Zen Browser 特定检查
    result.zenFunctions = {
        isZenBrowser: typeof isZenBrowser === 'function',
        zenBrowserApiCheck: typeof zenBrowserApiCheck === 'function'
    };
    
    // 4. 快速存储测试
    if (result.storage) {
        const testKey = 'quickTest' + Date.now();
        availableAPI.storage.local.set({[testKey]: 'ok'})
            .then(() => availableAPI.storage.local.get([testKey]))
            .then(data => {
                result.storageTest = data[testKey] === 'ok' ? 'success' : 'failed';
                availableAPI.storage.local.remove([testKey]);
                console.log('存储测试:', result.storageTest === 'success' ? '✅' : '❌');
            })
            .catch(() => {
                result.storageTest = 'error';
                console.log('存储测试: ❌ 错误');
            });
    }
    
    // 5. 快速消息测试
    if (result.messaging) {
        availableAPI.runtime.sendMessage({action: 'getSettings'})
            .then(response => {
                result.messagingTest = response ? 'success' : 'no-response';
                console.log('消息测试:', response ? '✅ 有响应' : '⚠️ 无响应');
            })
            .catch(error => {
                result.messagingTest = 'error';
                console.log('消息测试: ❌', error.message);
            });
    }
    
    // 输出结果
    console.log('API 状态:');
    console.log('  Browser API:', result.apis.browser ? '✅' : '❌');
    console.log('  Chrome API:', result.apis.chrome ? '✅' : '❌');
    console.log('  Webext API:', result.apis.webext ? '✅' : '❌');
    console.log('  存储 API:', result.storage ? '✅' : '❌');
    console.log('  消息 API:', result.messaging ? '✅' : '❌');
    
    if (result.zenFunctions.isZenBrowser) {
        try {
            const isZen = isZenBrowser();
            console.log('  Zen Browser:', isZen ? '✅ 是' : '⚠️ 否');
        } catch (e) {
            console.log('  Zen Browser: ❌ 检测失败');
        }
    }
    
    // 综合评分
    const score = Object.values(result.apis).filter(Boolean).length + 
                  (result.storage ? 1 : 0) + 
                  (result.messaging ? 1 : 0);
    
    console.log(`总分: ${score}/5`);
    
    if (score >= 4) {
        console.log('🎉 扩展状态: 优秀');
    } else if (score >= 3) {
        console.log('✅ 扩展状态: 良好');
    } else if (score >= 2) {
        console.log('⚠️ 扩展状态: 一般');
    } else {
        console.log('❌ 扩展状态: 差');
    }
    
    // 保存结果
    window.zenSimpleTestResult = result;
    
})();

console.log('💡 结果已保存到 window.zenSimpleTestResult');