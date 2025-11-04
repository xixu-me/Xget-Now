// Test functions for zen browser fix testing page

function addResult(containerId, message, type = 'success') {
    const container = document.getElementById(containerId);
    const div = document.createElement('div');
    div.className = `test-result ${type}`;
    div.textContent = message;
    container.appendChild(div);
}

function clearResults(containerId) {
    document.getElementById(containerId).innerHTML = '';
}

function detectBrowser() {
    clearResults('browser-info');
    
    const ua = navigator.userAgent;
    addResult('browser-info', `User Agent: ${ua}`, 'warning');
    
    if (typeof isZenBrowser === 'function') {
        const isZen = isZenBrowser();
        addResult('browser-info', `是否为 Zen Browser: ${isZen}`, isZen ? 'success' : 'warning');
    }
    
    if (typeof webextFlavor !== 'undefined') {
        addResult('browser-info', `浏览器版本: ${webextFlavor.major}`, 'success');
        addResult('browser-info', `特性: ${Array.from(webextFlavor.soup).join(', ')}`, 'success');
    }
}

function testAPIs() {
    clearResults('api-results');
    
    // 测试基本 API 可用性
    const tests = [
        { name: 'browser API', test: () => typeof browser !== 'undefined' },
        { name: 'chrome API', test: () => typeof chrome !== 'undefined' },
        { name: 'webext API', test: () => typeof webext !== 'undefined' },
        { name: 'browser.runtime', test: () => browser && browser.runtime },
        { name: 'chrome.runtime', test: () => chrome && chrome.runtime },
        { name: 'webext.runtime', test: () => webext && webext.runtime },
        { name: 'webext.storage', test: () => webext && webext.storage },
    ];

    tests.forEach(test => {
        try {
            const result = test.test();
            addResult('api-results', `${test.name}: ${result ? '✅ 可用' : '❌ 不可用'}`, result ? 'success' : 'error');
        } catch (error) {
            addResult('api-results', `${test.name}: ❌ 错误 - ${error.message}`, 'error');
        }
    });

    // 测试 Zen Browser 特定功能
    if (typeof zenBrowserApiCheck === 'function') {
        try {
            const zenCheck = zenBrowserApiCheck();
            addResult('api-results', `Zen Browser API 检查完成`, 'success');
            Object.entries(zenCheck).forEach(([key, value]) => {
                addResult('api-results', `${key}: ${value ? '✅' : '❌'}`, value ? 'success' : 'warning');
            });
        } catch (error) {
            addResult('api-results', `Zen Browser API 检查失败: ${error.message}`, 'error');
        }
    }
}

async function testStorage() {
    clearResults('storage-results');
    
    if (!webext || !webext.storage) {
        addResult('storage-results', '存储 API 不可用', 'error');
        return;
    }

    try {
        // 测试本地存储
        const testData = { test: 'zen-browser-test', timestamp: Date.now() };
        
        addResult('storage-results', '开始存储测试...', 'warning');
        
        await webext.storage.local.set(testData);
        addResult('storage-results', '✅ 数据写入成功', 'success');
        
        const retrieved = await webext.storage.local.get(['test', 'timestamp']);
        if (retrieved.test === testData.test) {
            addResult('storage-results', '✅ 数据读取成功', 'success');
        } else {
            addResult('storage-results', '❌ 数据读取失败', 'error');
        }
        
        // 清理测试数据
        await webext.storage.local.remove(['test', 'timestamp']);
        addResult('storage-results', '✅ 测试数据已清理', 'success');
        
    } catch (error) {
        addResult('storage-results', `❌ 存储测试失败: ${error.message}`, 'error');
    }
}

async function testMessaging() {
    clearResults('message-results');
    
    if (!webext || !webext.runtime || !webext.runtime.sendMessage) {
        addResult('message-results', '消息 API 不可用', 'error');
        return;
    }

    try {
        addResult('message-results', '开始消息传递测试...', 'warning');
        
        const response = await webext.runtime.sendMessage({ action: 'getSettings' });
        
        if (response) {
            addResult('message-results', '✅ 消息发送成功，收到响应', 'success');
            addResult('message-results', `响应类型: ${typeof response}`, 'success');
        } else {
            addResult('message-results', '⚠️ 消息发送成功，但无响应', 'warning');
        }
        
    } catch (error) {
        addResult('message-results', `❌ 消息传递失败: ${error.message}`, 'error');
    }
}

function showDebugInfo() {
    clearResults('debug-info');
    
    const info = {
        'User Agent': navigator.userAgent,
        'Location': window.location.href,
        'Webext Available': typeof webext !== 'undefined',
        'Browser API': typeof browser !== 'undefined',
        'Chrome API': typeof chrome !== 'undefined',
        'Zen Fix Loaded': typeof isZenBrowser !== 'undefined',
        'Timestamp': new Date().toISOString()
    };

    Object.entries(info).forEach(([key, value]) => {
        addResult('debug-info', `${key}: ${value}`, 'warning');
    });

    // 显示控制台命令
    const commands = [
        'isZenBrowser()',
        'zenBrowserApiCheck()',
        'webext.storage.local.get({})',
        'webext.runtime.sendMessage({action: "getSettings"})'
    ];

    addResult('debug-info', '可用的控制台命令:', 'success');
    commands.forEach(cmd => {
        addResult('debug-info', cmd, 'warning');
    });
}

// Setup event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners to buttons
    document.getElementById('detect-browser-btn')?.addEventListener('click', detectBrowser);
    document.getElementById('test-apis-btn')?.addEventListener('click', testAPIs);
    document.getElementById('test-storage-btn')?.addEventListener('click', testStorage);
    document.getElementById('test-messaging-btn')?.addEventListener('click', testMessaging);
    document.getElementById('show-debug-btn')?.addEventListener('click', showDebugInfo);
});

// 页面加载时自动运行基本检测
window.addEventListener('load', () => {
    setTimeout(() => {
        detectBrowser();
        testAPIs();
    }, 1000);
});