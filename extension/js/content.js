let draggableElement;

// 드래그 가능한 요소 생성
function createDraggableElement(imgSrc) {
    removeDraggableElement(); // 기존 요소 제거

    // 드래그 가능한 요소 생성
    draggableElement = document.createElement('div');
    draggableElement.className = 'draggable p-0 bg-white';
    draggableElement.style.position = 'absolute';
    draggableElement.style.zIndex = 1000;
    draggableElement.style.overflow = 'hidden';

    // 원본 이미지 생성
    const img = document.createElement('img');
    img.src = imgSrc;
    img.style.height = `${window.innerHeight * 0.4}px`;
    img.style.width = 'auto';
    img.style.pointerEvents = 'none'; 
    draggableElement.appendChild(img);

    // 크기 조절 핸들 추가
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';
    draggableElement.appendChild(resizeHandle);

    // 초기 위치 설정: 상단 중앙에 위치
    draggableElement.style.top = '0';
    draggableElement.style.left = `${(window.innerWidth - img.width) / 2}px`;

    document.body.appendChild(draggableElement);

    // Interact.js로 드래그 및 크기 조절 가능하게 설정
    interact(draggableElement)
        .draggable({ onmove: dragMoveListener })
        .resizable({
            edges: { left: false, right: true, bottom: true, top: false },
            listeners: { move: resizeListener },
            modifiers: [
                interact.modifiers.restrictSize({
                    min: { width: 50, height: 20 },
                    max: { width: window.innerWidth, height: window.innerHeight }
                }),
            ]
        });

    // 드래그할 수 있게 설정
    draggableElement.addEventListener('mousedown', (event) => {
        event.preventDefault();
    });

    // 우클릭 시 드래그 가능한 요소 제거
    draggableElement.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        removeDraggableElement();
    });

    // 초기 비율 계산
    draggableElement.setAttribute('data-aspect-ratio', img.offsetWidth / img.offsetHeight);
}

// 드래그 가능한 요소 제거
function removeDraggableElement() {
    if (draggableElement) {
        document.body.removeChild(draggableElement);
        draggableElement = null;
    }
}

// 크기 조절 함수
function resizeListener(event) {
    const target = event.target;
    const aspectRatio = parseFloat(target.getAttribute('data-aspect-ratio'));
    const newWidth = event.rect.width;
    const newHeight = newWidth / aspectRatio; 

    // 크기 업데이트
    target.style.width = `${newWidth}px`;
    target.style.height = `${newHeight}px`;

    // 이미지 크기 조정
    const img = target.querySelector('img');
    img.style.width = '100%';
    img.style.height = 'auto';
}

// 드래그 이동 함수
function dragMoveListener(event) {
    const target = event.target;
    const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
    const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    // 위치 업데이트
    target.style.transform = `translate(${x}px, ${y}px)`;
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
}

// 메시지 리스너
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'createDraggable') {
        const htmlContent = request.htmlContent;

        // 새로운 div 요소 만들기
        const newElement = document.createElement('div');
        newElement.style.position = 'fixed'; // 고정 위치
        newElement.style.top = '20px'; // 상단에서의 거리
        newElement.style.left = '50%'; // 화면 중앙
        newElement.style.transform = 'translateX(-50%)'; // 중앙 정렬
        newElement.style.zIndex = '1000'; // 다른 요소 위에 표시
        newElement.innerHTML = htmlContent; // HTML 코드 삽입

        // interact.js를 사용하여 드래그 가능하게 설정
        interact(newElement).draggable({
            listeners: {
                move(event) {
                    const target = event.target;
                    const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.delta.x;
                    const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.delta.y;

                    // 변환 적용
                    target.style.transform = `translate(${x}px, ${y}px)`;
                    target.setAttribute('data-x', x);
                    target.setAttribute('data-y', y);
                },
            },
        });

        // 우클릭 시 삭제 기능 추가
        newElement.addEventListener('contextmenu', (event) => {
            event.preventDefault(); // 기본 우클릭 메뉴 방지
            newElement.remove(); // 요소 삭제
        });

        document.body.appendChild(newElement); // DOM에 추가
    }
});

