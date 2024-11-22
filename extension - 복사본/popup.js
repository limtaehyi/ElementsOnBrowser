// 현재 활성 탭에서 콘텐츠 스크립트가 로드되었는지 확인
chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {action: 'checkLoaded'}, (response) => {
        if (chrome.runtime.lastError) {
            console.error("Content script not loaded:", chrome.runtime.lastError);
        } else {
            console.log("Content script loaded successfully:", response);
            // 이제 메시지를 보내는 코드를 여기에 추가합니다.
            const canvasDataUrl = canvas.toDataURL(); // 캔버스 데이터를 URL로 변환
            chrome.runtime.sendMessage({
                action: 'createDraggable',
                imgSrc: canvasDataUrl
            });
        }
    });
});



document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.getElementById('main-container');
    const addButton = document.getElementById('add-button');
    let count = 1; // 숫자 카운트 초기화

    // + 버튼 클릭 이벤트
    addButton.addEventListener('click', () => {
        addContainer(mainContainer);
    });

    function addContainer(container) 
    {
        const newContainer = document.createElement('div');
        newContainer.className = 'container'; // 클래스 추가

        const p = document.createElement('p');
        p.textContent = count++; // 숫자 카운트 증가
        newContainer.appendChild(p);

        const inputRow = document.createElement('div');
        inputRow.className = 'input-row'; // 입력 행을 위한 div

        const inputText = document.createElement('input');
        inputText.type = 'text';
        inputText.className = 'form-control mr-2'; // Bootstrap 스타일 적용
        inputText.placeholder = '</>';
        inputRow.appendChild(inputText);

        const inputImage = document.createElement('input');
        inputImage.type = 'file';
        inputImage.accept = 'image/gif, image/png, image/jpeg';
        inputImage.style.width = "150px"; // 너비를 150px로 설정
        inputRow.appendChild(inputImage);

        const visibility = document.createElement('button');
        visibility.className = "btn btn-secondary mx-1"; // Bootstrap 버튼 스타일
        visibility.textContent = "V"; // Visibility 버튼 텍스트
        inputRow.appendChild(visibility);

        const delbutton = document.createElement('button');
        delbutton.className = "btn btn-danger mx-1"; // Bootstrap 버튼 스타일
        delbutton.textContent = "X"; // Delete 버튼 텍스트
        inputRow.appendChild(delbutton);

        newContainer.appendChild(inputRow); // 입력 행 추가

        const canvasContainer = document.createElement('div');
        canvasContainer.className = 'canvas-container'; // 캔버스 컨테이너 클래스 추가
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 150;
        canvas.style.border = "1px solid black";
        canvasContainer.appendChild(canvas);
        newContainer.appendChild(canvasContainer);

        const ctx = canvas.getContext('2d');

        // 텍스트 입력 이벤트
        inputText.addEventListener('input', () => {
            const html = inputText.value; // 입력된 HTML 코드
            const tempDiv = document.createElement('div'); // 임시 DIV 요소 생성
            tempDiv.innerHTML = html; // HTML 코드 삽입

            // 텍스트 내용 가져오기
            const textContent = tempDiv.innerText || tempDiv.textContent;

            ctx.clearRect(0, 0, canvas.width, canvas.height); // 캔버스 지우기
            ctx.font = '20px Arial'; // 폰트 설정
            ctx.fillText(textContent, 10, 50); // 텍스트 그리기
        });

        // 이미지 선택 이벤트
        inputImage.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        const imgAspectRatio = img.width / img.height;
                        const canvasAspectRatio = canvas.width / canvas.height;

                        let drawWidth, drawHeight;

                        if (imgAspectRatio > canvasAspectRatio) {
                            drawWidth = canvas.width;
                            drawHeight = canvas.width / imgAspectRatio;
                        } else {
                            drawHeight = canvas.height;
                            drawWidth = canvas.height * imgAspectRatio;
                        }

                        const xOffset = (canvas.width - drawWidth) / 2; // 중앙 정렬을 위한 X 오프셋
                        const yOffset = (canvas.height - drawHeight) / 2; // 중앙 정렬을 위한 Y 오프셋

                        ctx.clearRect(0, 0, canvas.width, canvas.height); // 캔버스 지우기
                        ctx.drawImage(img, xOffset, yOffset, drawWidth, drawHeight); // 중앙에 이미지 그리기
                    };
                    img.src = e.target.result; // FileReader로 읽은 이미지 데이터
                };
                reader.readAsDataURL(file); // 파일을 Data URL로 읽기
            }
        });

        // 삭제 버튼 클릭 이벤트
        delbutton.addEventListener('click', () => {
            container.removeChild(newContainer); // 해당 컨테이너 삭제
        });

        // Visibility 버튼 클릭 이벤트
        visibility.addEventListener('click', () => {
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, {action: 'checkLoaded'}, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("Content script not loaded:", chrome.runtime.lastError);
                    } else {
                        console.log("Content script loaded successfully:", response);
                        
                        // 이제 메시지를 보내는 코드를 여기에 추가합니다.
                        const canvasDataUrl = canvas.toDataURL(); // 캔버스 데이터를 URL로 변환
                        chrome.runtime.sendMessage({
                            action: 'createDraggable',
                            imgSrc: canvasDataUrl
                        });
                    }
                });
            });
        });



        container.appendChild(newContainer);
    }
});