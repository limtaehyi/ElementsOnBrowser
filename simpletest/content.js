let draggableElement;

function createDraggableElement(imgSrc) {
    console.log("Creating draggable element with image source:", imgSrc);

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

    const img = document.createElement('img');
    img.src = imgSrc;
    img.style.maxWidth = '200px';
    draggableElement.appendChild(img);

    document.body.appendChild(draggableElement);

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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'checkLoaded') {
        sendResponse({status: 'loaded'});
    } else if (request.action === 'createDraggable') {
        createDraggableElement(request.imgSrc);
    }
});
