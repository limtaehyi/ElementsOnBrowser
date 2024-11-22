document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.getElementById('main-container');
    const addButton = document.getElementById('add-button');
    let count = 1;

    addButton.addEventListener('click', () => {
        addContainer(mainContainer);
    });

    function addContainer(container) {
        const newContainer = document.createElement('div');
        newContainer.className = 'container mb-3';

        const p = document.createElement('p');
        p.textContent = count++;
        newContainer.appendChild(p);

        const inputRow = document.createElement('div');
        inputRow.className = 'input-row d-flex align-items-center';

        const inputText = document.createElement('input');
        inputText.type = 'text';
        inputText.className = 'form-control mr-2';
        inputText.placeholder = '</>';
        inputRow.appendChild(inputText);

        const inputImage = document.createElement('input');
        inputImage.type = 'file';
        inputImage.accept = 'image/gif, image/png, image/jpeg';
        inputImage.style.width = "150px";
        inputRow.appendChild(inputImage);

        const visibility = document.createElement('button');
        visibility.className = "btn btn-secondary mx-1";
        visibility.textContent = "V";
        inputRow.appendChild(visibility);

        const delbutton = document.createElement('button');
        delbutton.className = "btn btn-danger mx-1";
        delbutton.textContent = "X";
        inputRow.appendChild(delbutton);

        newContainer.appendChild(inputRow);

        const canvasContainer = document.createElement('div');
        canvasContainer.className = 'canvas-container';
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 150;
        canvas.id = p.textContent + "_canvas";
        canvas.style.border = "1px solid black";
        canvasContainer.appendChild(canvas);
        newContainer.appendChild(canvasContainer);

        const ctx = canvas.getContext('2d');

        // 이미지 선택 이벤트
        inputImage.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.src = e.target.result;

                    // 캔버스에 미리보기
                    img.onload = () => {
                        const aspectRatio = img.width / img.height;
                        let drawWidth, drawHeight;

                        // 미리보기 크기 설정
                        if (img.width > img.height) {
                            drawWidth = 150; // 미리보기 너비
                            drawHeight = drawWidth / aspectRatio;
                        } else {
                            drawHeight = 150; // 미리보기 높이
                            drawWidth = drawHeight * aspectRatio;
                        }

                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, 0, drawWidth, drawHeight);
                        newContainer.dataset.imageSrc = img.src; // 원본 이미지 저장
                    };
                };
                reader.readAsDataURL(file);
            }
        });

        // 가시성 버튼 클릭 이벤트
        visibility.addEventListener('click', () => {
            const imgSrc = newContainer.dataset.imageSrc; // 원본 이미지 소스 가져오기
            if (imgSrc) {
                chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                    chrome.tabs.sendMessage(tabs[0].id, {action: 'createDraggable', imgSrc: imgSrc});
                });
            }
        });

        // 삭제 버튼 이벤트
        delbutton.addEventListener('click', () => {
            container.removeChild(newContainer);
        });

        container.appendChild(newContainer);
    }
});
