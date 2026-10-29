// 現在のタブで実行する関数
async function executeInTab(func) {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    return chrome.scripting.executeScript({
        target: {tabId: tab.id},
        func: func
    });
}

// 検出件数を取得して表示
async function updateCount() {
    const result = await executeInTab(() => {
        return document.querySelectorAll('[class*="nyga-click"]').length;
    });
    document.getElementById('countNum').textContent = result[0].result;
}

// 初期表示
updateCount();

// ハイライト表示
document.getElementById('highlight').addEventListener('click', async function() {
    await executeInTab(() => {
        const elements = document.querySelectorAll('[class*="nyga-click"]');
        
        elements.forEach(el => {
            // ハイライト
            el.style.outline = '3px solid #ff6b00';
            el.style.outlineOffset = '2px';
            
            // クリック時にコンソール出力
            if (!el.dataset.ga4VisualizerBound) {
                el.addEventListener('click', function() {
                    console.group('%c📊 GA4送信情報', 'color: #ff6b00; font-weight: bold; font-size: 14px;');
                    console.log('要素:', el);
                    console.log('data-click-label:', el.dataset.clickLabel || '(なし)');
                    console.log('data-content-section:', 
                        el.dataset.contentSection || 
                        el.closest('[data-content-section]')?.dataset.contentSection || 
                        '(なし)'
                    );
                    console.log('href:', el.href || '(なし)');
                    console.groupEnd();
                }, true);
                el.dataset.ga4VisualizerBound = 'true';
            }
        });
    });
});

// ハイライト解除
document.getElementById('clear').addEventListener('click', async function() {
    await executeInTab(() => {
        const elements = document.querySelectorAll('[class*="nyga-click"]');
        elements.forEach(el => {
            el.style.outline = '';
            el.style.outlineOffset = '';
        });
    });
});

// コンソールに一覧出力
document.getElementById('log').addEventListener('click', async function() {
    await executeInTab(() => {
        const elements = document.querySelectorAll('[class*="nyga-click"]');
        
        console.group('%c🎯 GA4計測対象の要素一覧', 'color: #ff6b00; font-weight: bold; font-size: 14px;');
        console.log('件数:', elements.length);
        
        const data = Array.from(elements).map((el, i) => ({
            '#': i + 1,
            'タグ': el.tagName.toLowerCase(),
            'label': el.dataset.clickLabel || '-',
            'section': el.dataset.contentSection || el.closest('[data-content-section]')?.dataset.contentSection || '-',
            'href': el.href || '-'
        }));
        
        console.table(data);
        console.groupEnd();
    });
});