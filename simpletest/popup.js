document.getElementById('visibility').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'checkLoaded'}, (response) => {
            if (chrome.runtime.lastError) {
                alert("Content script not loaded. Please refresh the page.");
                return;
            }

            const canvas = document.getElementById('yourCanvasId'); // 캔버스 ID로 수정
            const canvasDataUrl = canvas.toDataURL();

            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'createDraggable',
                imgSrc: canvasDataUrl
            });
        });
    });
});
