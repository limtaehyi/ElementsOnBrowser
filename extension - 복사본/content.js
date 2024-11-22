let draggableElement;

function createDraggableElement(imgSrc) {
    if (draggableElement) {
        document.body.removeChild(draggableElement);
    }

    draggableElement = document.createElement('div');
    draggableElement.className = 'draggable';
    draggableElement.style.position = 'absolute';
    draggableElement.style.border = '1px solid black';
    draggableElement.style.padding = '5px';
    draggableElement.style.backgroundColor = 'white';
    draggableElement.style.cursor = 'move';
    draggableElement.style.zIndex = 1000;
    draggableElement.style.pointerEvents = 'auto';


    const img = document.createElement('img');
    img.src = imgSrc;
    img.style.maxWidth = '200px'; // 크기 조정
    draggableElement.appendChild(img);

    document.body.appendChild(draggableElement); // 드래그 가능한 요소를 body에 추가

    let offsetX, offsetY;

    draggableElement.addEventListener('mousedown', (e) => {
        offsetX = e.clientX - draggableElement.getBoundingClientRect().left;
        offsetY = e.clientY - draggableElement.getBoundingClientRect().top;

        const mouseMoveHandler = (e) => {
            draggableElement.style.left = `${e.clientX - offsetX}px`;
            draggableElement.style.top = `${e.clientY - offsetY}px`;
        };

        const mouseUpHandler = () => {
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        };

        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    });
}

// 메시지를 수신하여 드래그 가능한 요소를 생성
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'createDraggable') {
        createDraggableElement(request.imgSrc);
    }
});
