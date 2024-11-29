document.addEventListener('DOMContentLoaded', () => {
    const blocker = document.getElementById('blocker');
    const content = document.getElementById('content');

    let isContentLoaded = false;

    function checkIfLoaded() {
        isContentLoaded = true; 
    }

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'checkLoaded') {
            sendResponse({ status: isContentLoaded });
        }
    });

    function loadBlockerState() {
        chrome.storage.local.get(['blockerVisible'], (result) => {
            if (result.blockerVisible === false) {
                blocker.style.display = 'none'; 
                content.style.display = 'flex';
            }
        });
    }

    blocker.addEventListener('click', function() {
        if (!isContentLoaded) {
            alert("Adblock이나 광고 차단 프로그램을 꺼주세요.");
            return;
        }

        blocker.style.display = 'none';
        content.style.display = 'flex';
        saveBlockerState(false);
    });

    function saveBlockerState(isVisible) {
        chrome.storage.local.set({ blockerVisible: isVisible }, () => {
            console.log('Blocker state saved:', isVisible);
        });
    }

    const mainContainer = document.getElementById('main-container');
    const addButton = document.getElementById('add-button');
    let count = 1;

    addButton.addEventListener('click', () => {
        addContainer(mainContainer, count);
        count++;
    });

    function showResult(count) {
        const renderDiv = document.getElementById('render' + count);
        const showCanvas = document.getElementById("canvas" + count);
        const checkText = document.getElementById('inputText' + count);

        // Rendered div의 표시 상태 토글
        if (renderDiv) {
            renderDiv.style.display = renderDiv.style.display === 'none' ? 'flex' : 'none';
        }

        // Canvas의 표시 상태 토글
        if (showCanvas && checkText.value === '') {
            showCanvas.style.display = showCanvas.style.display === 'none' || showCanvas.style.display === '' ? 'block' : 'none';
        }
    }


    function addContainer(container, count, text = '', imageSrc = '') {
        const newContainer = document.createElement('div');
        newContainer.className = 'container mb-3 p-3 no-margin-padding';
        newContainer.id = 'container' + count;

        const inputRow = document.createElement('div');
        inputRow.className = 'input-row d-flex align-items-center'; 

        const counter = document.createElement('span');
        counter.className = 'counter mr-3';
        counter.textContent = count;
        counter.id = 'span'+count;

        counter.onclick = function() {
            showResult(count);
        };

        inputRow.appendChild(counter);

        const inputGroup = document.createElement('div');
        inputGroup.className = 'd-flex flex-column mx-auto';

        const inputText = document.createElement('input');
        inputText.type = 'text';
        inputText.id = 'inputText' + count;
        inputText.style.width = '350px';
        inputText.className = 'form-control mb-2';
        inputText.placeholder = 'Enter HTML code...';
        inputText.value = text; 
        inputGroup.appendChild(inputText);

        const inputImage = document.createElement('input');
        inputImage.type = 'file';
        inputImage.id = 'inputImage' + count;
        inputImage.style.width = '350px';
        inputImage.accept = 'image/gif, image/png, image/jpeg';
        inputImage.className = 'mb-2'; 
        inputGroup.appendChild(inputImage);

        inputRow.appendChild(inputGroup); 

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'd-flex'; 

        const visibility = document.createElement('button');
        visibility.className = "btn btn-secondary mx-1";
        visibility.textContent = "V";
        buttonContainer.appendChild(visibility);

        const delbutton = document.createElement('button');
        delbutton.className = "btn btn-danger mx-1";
        delbutton.textContent = "X";
        buttonContainer.appendChild(delbutton);

        inputRow.appendChild(buttonContainer); 

        newContainer.appendChild(inputRow); 

        const canvasContainer = document.createElement('div');
        canvasContainer.className = 'canvas-container text-center d-flex justify-content-center align-items-center'; 
        const canvas = document.createElement('canvas');
        canvas.style.display = 'none'; 
        canvas.style.border = '1px solid #ebebeb';
        canvas.width = 400;
        canvas.height = 180;
        canvas.id = "canvas" + count; 
        canvasContainer.appendChild(canvas);
        newContainer.appendChild(canvasContainer); 

        inputText.addEventListener('input', () => {
            const spancolor = document.getElementById('span'+count);
            spancolor.style.color = 'blue';
            spancolor.style.textDecoration = 'underline';

            const htmlContent = inputText.value;

            renderHTMLToDOM(htmlContent, newContainer, count);
        });

        inputImage.addEventListener('change', (event) => {
            const spancolor = document.getElementById('span'+count);
            spancolor.style.color = 'blue';
            spancolor.style.textDecoration = 'underline';

            const cleantext = document.getElementById('inputText'+count);
            cleantext.value = '';

            const clearender = document.getElementById('render'+count);
            clearender.remove();

            const file = event.target.files[0];
            const fileNameElement = inputImage.nextElementSibling; 

            if (file) {
                if (fileNameElement) {
                    fileNameElement.textContent = file.name; 
                }
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.src = e.target.result;

                    img.onload = () => {
                        const ctx = canvas.getContext('2d');
                        ctx.clearRect(0, 0, canvas.width, canvas.height);

                        // 캔버스 비율
                        const canvasAspectRatio = canvas.width / canvas.height;
                        // 이미지 비율
                        const imgAspectRatio = img.width / img.height;

                        let drawWidth, drawHeight;

                        // 비율에 따라 크기 조정
                        if (canvasAspectRatio > imgAspectRatio) {
                            // 캔버스가 더 넓으면 높이에 맞춰 조정
                            drawHeight = canvas.height;
                            drawWidth = img.width * (canvas.height / img.height);
                        } else {
                            // 캔버스가 더 높으면 너비에 맞춰 조정
                            drawWidth = canvas.width;
                            drawHeight = img.height * (canvas.width / img.width);
                        }

                        // 중앙에 위치시키기 위한 좌표 계산
                        const xOffset = (canvas.width - drawWidth) / 2;
                        const yOffset = (canvas.height - drawHeight) / 2;

                        ctx.drawImage(img, xOffset, yOffset, drawWidth, drawHeight);
                        newContainer.dataset.imageSrc = img.src; 
                    };
                };
                reader.readAsDataURL(file);
            } else {
                if (fileNameElement) {
                    fileNameElement.textContent = "선택된 파일 없음"; 
                }
            }
        });


        visibility.addEventListener('click', () => {
            const htmlContent = inputText.value; // inputText의 값을 가져옴

            // Bootstrap 스타일을 적용한 HTML로 감쌉니다.
            const styledHtmlContent = `
                <div class="border p-3 bg-light" style="border-radius: 5px; position: relative;">
                    ${htmlContent}
                </div>
            `;

            // 외부 탭으로 전송할 데이터 구조
            const message = {
                action: 'createDraggable',
                htmlContent: styledHtmlContent // 스타일이 적용된 HTML
            };

            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, message);
            });
        });



        delbutton.addEventListener('click', () => {
            container.removeChild(newContainer);
        });

        container.appendChild(newContainer);
    }

    function renderHTMLToDOM(htmlContent, container, count) {
        // 기존에 추가된 HTML 요소 제거
        const existingElements = container.querySelectorAll('.rendered-html');
        existingElements.forEach(el => el.remove());

        // 새로운 HTML 코드 추가
        const wrapper = document.createElement('div');
        wrapper.className = 'rendered-html';
        wrapper.id = 'render' + count;
        wrapper.style.width = '400px';  // 단위 추가
        wrapper.style.height = '180px';  // 단위 추가
        wrapper.style.marginLeft = '40px';
        wrapper.style.display = 'none';   // Flexbox 사용
        wrapper.style.alignItems = 'center'; // 수직 중앙 정렬
        wrapper.style.justifyContent = 'center'; // 수평 중앙 정렬
        wrapper.style.border = '1px solid #ebebeb'; // 테두리 추가 (선택 사항)
        wrapper.style.overflow = 'hidden'; // 오버플로우 숨기기
        wrapper.innerHTML = htmlContent;

        // 버튼 클릭 이벤트 처리 (필요한 경우)
        wrapper.addEventListener('click', () => {
            alert('HTML 요소 클릭됨!');
        });

        // container에 추가
        container.appendChild(wrapper);
    }

    loadBlockerState(); 
    checkIfLoaded();
});
