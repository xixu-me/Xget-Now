/**
 * Zen Browser 快速测试脚本
 * 在浏览器控制台中运行此脚本来快速验证修复
 */

console.log('🚀 开始 Zen Browser 快速测试...');

// 测试 1: 检查基本 API
console.log('1️⃣ 检查基本 API...');
const hasChrome = typeof chrome !== 'undefined';
const hasBrowser = typeof browser !== 'undefined';
const hasWebext = typeof webext !== 'undefined';

console.log(`Chrome API: ${hasChrome ? '✅' : '❌'}`);
console.log(`Browser API: ${hasBrowser ? '✅' : '❌'}`);
console.log(`Webext API: ${hasWebext ? '✅' : '❌'}`);

// 测试 2: 检查存储 API
console.log('2️⃣ 检查存储 API...');
const api = hasBrowser ? browser : (hasChrome ? chrome : null);
if (api && api.storage && api.storage.local) {
    console.log('存储 API: ✅ 可用');

    // 测试存储功能
    api.storage.local.set({ testKey: 'testValue' })
        .then(() => {
            console.log('存储写入: ✅ 成功');
            return api.storage.local.get(['testKey']);
        })
        .then(result => {
            if (result.testKey === 'testValue') {
                console.log('存储读取: ✅ 成功');
            } else {
                console.log('存储读取: ❌ 失败');
            }
            // 清理
            return api.storage.local.remove(['testKey']);
        })
        .then(() => {
            console.log('存储清理: ✅ 完成');
        })
        .catch(error => {
            console.log('存储测试: ❌ 失败', error);
        });
} else {
    console.log('存储 API: ❌ 不可用');
}

// 测试 3: 检查消息传递
console.log('3️⃣ 检查消息传递...');
if (api && api.runtime && api.runtime.sendMessage) {
    console.log('消息 API: ✅ 可用');

    // 尝试发送消息
    api.runtime.sendMessage({ action: 'getSettings' })
        .then(response => {
            if (response) {
                console.log('消息传递: ✅ 成功，收到响应');
                console.log('响应内容:', response);
            } else {
                console.log('消息传递: ⚠️ 成功发送，但无响应');
            }
        })
        .catch(error => {
            console.log('消息传递: ❌ 失败', error.message);
        });
} else {
    console.log('消息 API: ❌ 不可用');
}

// 测试 4: 检查 Zen Browser 特定功能
console.log('4️⃣ 检查 Zen Browser 特定功能...');
if (typeof isZenBrowser === 'function') {
    const isZen = isZenBrowser();
    console.log(`Zen Browser 检测: ${isZen ? '✅ 是 Zen Browser' : '⚠️ 不是 Zen Browser'}`);
} else {
    console.log('Zen Browser 检测: ❌ 函数不可用');
}

if (typeof zenBrowserApiCheck === 'function') {
    console.log('Zen API 检查: ✅ 可用');
    try {
        const apiCheck = zenBrowserApiCheck();
        console.log('API 检查结果:', apiCheck);
    } catch (error) {
        console.log('API 检查: ❌ 失败', error);
    }
} else {
    console.log('Zen API 检查: ❌ 不可用');
}

// 综合评估
setTimeout(() => {
    console.log('📊 综合评估...');

    const criticalTests = [
        hasChrome || hasBrowser,
        api && api.storage && api.storage.local,
        api && api.runtime && api.runtime.sendMessage
    ];

    const passedTests = criticalTests.filter(Boolean).length;
    const totalTests = criticalTests.length;

    console.log(`通过测试: ${passedTests}/${totalTests}`);

    if (passedTests === totalTests) {
        console.log('🎉 所有关键测试通过！扩展应该能正常工作');
    } else if (passedTests >= 2) {
        console.log('⚠️ 大部分测试通过，扩展可能可以工作');
    } else {
        console.log('❌ 多个关键测试失败，需要检查扩展安装');
    }

    console.log('💡 如果测试失败，请：');
    console.log('   1. 确保使用最新的 Zen Browser 优化版本');
    console.log('   2. 重新加载扩展');
    console.log('   3. 重启 Zen Browser');

}, 2000);

console.log('⏳ 测试进行中，请等待 2 秒查看完整结果...');