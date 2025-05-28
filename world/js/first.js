const urlParams = new URLSearchParams(window.location.search);
const value = urlParams.get('data');
const 캐릭명 = urlParams.get('name');
let goDoorLR = false;
let goDoorUD = false;
let goPage = 0;
let maxMonsters = 1; // 최대 몬스터 수
const space = document.querySelector(".space");
let keys = {};
const UserIdVal1 = localStorage.getItem('userId');
const monsters = [];
// const characterElement = document.createElement('img');

// 화면에 표시되는 캐릭터 요소들을 관리하는 맵 (캐릭터 ID -> HTML 요소)
// const characterDiv = [];
const characterElements = {};
let myCharacterId = null; // 내 캐릭터 ID를 저장할 변수 (부모로부터 받아옴)
// iframeId = null;
let characterIframeIds = {}; // 캐릭터 ID와 iframe ID 매핑

// requestAnimationFrame 루프가 시작되었는지 확인하는 플래그
let isUpdateLoopRunning = false;
let initialUpdateDone = false;
// 캐릭터 이동 거리 (픽셀 단위)
const moveSpeed = 1.5; // 제공된 코드와의 변수명 통일을 위해 선언
let walls = document.querySelectorAll('.wall');

    // 이 iframe에 해당하는 사용자의 캐릭터 ID (부모로부터 전달받음)
// let walls = document.querySelectorAll('.wall');
// const 캐릭명 = {
//     'pix1.png': '곰돌이',
//     'pix2.png': '호랑이',
//     'pix3.png': '팬더'
// }[urlParams.get('name')]

// if (!space) {
//     console.error("HTML에 ID가 'game-area'인 요소가 없습니다.");
// }

// update 루프 시작
// if (!isUpdateLoopRunning) {
//     update();
//     isUpdateLoopRunning = true;
// }

// update 루프 시작 함수 (한 번만 실행되도록 제어)
function maybeStartUpdateLoop() {
    console.log("iframe(startUpdateLoop): 업데이트1 루프가 시작되었습니다.");
    if (!isUpdateLoopRunning) {
        update();
        isUpdateLoopRunning = true;
        console.log("iframe: update 루프 시작");
    } else {
        console.log("iframe: update 루프는 이미 실행 중입니다.");
    }
}
function startUpdateLoop() {
    if (!isUpdateLoopRunning) {
        maybeStartUpdateLoop();
    }
}
function initializeGame() {
    if (!initialUpdateDone) {
        update();
        initialUpdateDone = true;
        console.log("iframe: 초기 update 실행");
    }
}

    document.addEventListener('DOMContentLoaded', () => {
        // space = document.querySelector(".space");
        if (!space) {
            console.error("HTML에 ID가 'game-area'인 요소가 없습니다.");
        }
    });
document.addEventListener('keydown', (event) => {
    keys[event.key] = true;
});

document.addEventListener('keyup', (event) => {
    keys[event.key] = false;
});
function sendToParent(message) {
    window.parent.postMessage(message, "*"); // "*" allows all origins, or replace with your domain
}

// window.setMyCharacterId = function(id) {
//     myCharacterId = id;
//     console.log("home.html received my ID:", myCharacterId);
//     // 만약 내 캐릭터 요소가 이미 화면에 그려져 있다면 my-character 클래스 적용
//     const myElement = characters[myCharacterId];
//     if(myElement) {
//          myElement.classList.add('my-character');
//          console.log("Applied my-character class to:", myCharacterId);
//     }
// }

window.addEventListener('message', function(event) {
    const data = event.data;
    console.log("부모로부터 메시지 수신:", data);
    console.log("부모로부터 메시지 수신 타입:", data.type);
    const{type} = data;
    // 메시지 타입에 따라 다른 처리
    if (data && data.type) {
        switch (data.type) {
            case 'setIframeId':
                iframeId = data.iframeId;
                console.log('first.js: iframe ID 설정됨:', iframeId);
                break;
            case 'newCharacter': // 부모로부터 새로운 캐릭터 접속 알림 수신
                if (data.character) {
                    console.log("first.js: newCharacter - characterName:", data.characterName);
                    console.log("iframe에 새로운 캐릭터 그리기:", data.character.id);
                    console.log("iframe에 새로운 캐릭터 그리기:", data.character.characterName);
                    // createCharacterElement(data.character.id, data.character.id == myCharacterId); // 내 캐릭터인지 여부 전달
                    createCharacterElement(data.character, false, data.characterName); // 내 캐릭터인지 여부 전달
                }
                break;
            case 'currentCharacters': // 부모로부터 현재 접속 중인 모든 캐릭터 정보 수신
                if (data.characters) {
                    console.log("iframe에 현재 캐릭터 목록 그리기:", data.characters);
                    console.log("iframe에 현재 캐릭터 목록 그리기:", myCharacterId);
                    // 기존 캐릭터 요소 모두 제거 (클린 업데이트)
                    removeAllCharacters();
                    // 새로 받은 목록으로 다시 그리기
                    data.characters.forEach(charData => {
                        createCharacterElement(charData, charData.id === myCharacterId, charData.name); // 내 캐릭터인지 여부 전달
                    });
                }
                else if (data.character) {
                    console.log("iframe에 현재 캐릭터 목록 그리기:", data.character);
                    // 기존 캐릭터 요소 모두 제거 (클린 업데이트)
                    removeAllCharacters();
                    // 새로 받은 목록으로 다시 그리기
                    data.character.forEach(charData => {
                        createCharacterElement(charData, charData.id === myCharacterId, charData.name); // 내 캐릭터인지 여부 전달
                    });
                }
                else {
                    console.log("iframe에 현재 캐릭터 목록 그리기:", data);
                }
                break;
            case 'createCharacter':
                console.log("iframe: 메시지 수신 - type:", data.type, "data:", data);
                if (data.characterData && data.characterData.id  && data.isMyCharacter) { // characterData와 id 존재 확인
                    myCharacterId = data.characterData.id; // iframe에서도 내 캐릭터 ID 설정
                    console.log("iframe: 내 캐릭터 ID 설정됨:", myCharacterId);
                    console.log("first.js: createCharacter - characterName:", data.characterName);
                    console.log("first.js: createCharacter - characterData.characterName:", data.characterData.characterName);
                    createCharacterElement(data.characterData, true, data.characterName); // 내 캐릭터 생성
                    if (!isUpdateLoopRunning) {
                        startUpdateLoop();
                        isUpdateLoopRunning = true;
                    }
                    console.log("iframe: 내 캐릭터 정보 수신 및 업데이트 루프 시작.");
                } else {
                    console.warn("iframe: 'createCharacter' 메시지에 characterData가 누락되었습니다.");
                }
                break;
            case 'currentCharacter':
                if (data.character) {
                    myCharacterId = data.character.id;
                    console.log("iframe: 내 캐릭터 ID 설정됨:", myCharacterId);
                    createCharacterElement(data.character, true, data.character.name);
                    if (!isUpdateLoopRunning) {
                        startUpdateLoop();
                        isUpdateLoopRunning = true;
                    }
                }
                break;
            case 'loadInitialCharacters':
                    // console.log("iframe: 'loadInitialCharacters' (초기 목록) 메시지 수신:", data.characters);
                if (Array.isArray(data.characters)) { // data.name -> data.characters 수정
                    console.log("first.js: loadInitialCharacters - myCharacterName:", data.myCharacterName);
                    data.characters.forEach(charData => { // data.name -> data.characters 수정
                        createCharacterElement(charData, charData.id === myCharacterId, data.myCharacterName);
                    });
                    if (!isUpdateLoopRunning) {
                        startUpdateLoop();
                        isUpdateLoopRunning = true;
                    }
                    // console.log("iframe: 초기 캐릭터 목록 생성/업데이트 완료.");
                } else {
                    console.warn("iframe: 'loadInitialCharacters' 메시지에 characters 배열이 누락되었습니다.");
                }
                break;
            case 'characterMoved': // 부모로부터 캐릭터 이동 정보 수신
                console.log("iframe: 'characterMoved' 메시지 수신:", data);
                if (data.characterId !== undefined && data.x !== undefined && data.y !== undefined) {
                    const characterElement = characterElements[data.characterId];
                    // console.log('characterElement --- ' + characterElement);
                    // console.log('data.characterId --- ' + data.characterId);
                    // console.log('myCharacterId --- ' + myCharacterId);
                    // if (characterElement && data.characterId !== myCharacterId) { // 자신의 캐릭터가 아닌 경우에만 업데이트
                    // // if (characterElement && characterIframeIds[data.characterId] === iframeId) { // 자신의 캐릭터가 아닌 경우에만 업데이트
                    //     console.log('characterElement --- ' + characterElement);
                    //     console.log('myCharacterId --- ' + myCharacterId);
                    //     characterElement.style.left = data.x + 'px';
                    //     characterElement.style.top = data.y + 'px';
                    // } else if (!characterElement) {
                    //     console.warn("iframe: 이동할 캐릭터를 찾을 수 없음:", data.id);
                    // }
                    if (characterElement) {
                        characterElement.style.left = data.x + 'px';
                        characterElement.style.top = data.y + 'px';
                    } else {
                        console.warn("iframe: 이동할 캐릭터를 찾을 수 없음:", data.characterId);
                    }
                }
                break;
            case 'characterDisconnected': // 부모로부터 캐릭터 연결 해제 알림 수신
                console.log('data.type = ' + data.type);
                console.log('first.js: 접속 해제 처리 - 캐릭터 ID:', data.characterId);
                // if (data.characterId !== undefined) {
                //     console.log("iframe: 캐릭터 연결 해제 - ID:", data.characterId);
                //     if (characterElements[data.characterId]) {
                //         console.log("iframe: 캐릭터 제거 전 -", characterElements);
                //         removeCharacterElement(data.characterId);
                //         console.log("iframe: 캐릭터 제거 후 -", characterElements);
                //     } else {
                //         console.warn("iframe: 제거할 캐릭터를 찾을 수 없음 (이미 제거되었거나 없음) - ID:", data.characterId);
                //     }
                // } else {
                //     console.error("iframe: 'characterDisconnected' 메시지에 characterId가 없음");
                // }
                if (data.characterId) {
                    removeCharacterElement(data.characterId);
                    console.log("iframe: 캐릭터 제거 메시지 수신 - ID:", data.characterId);
                }
                // if (data.characterId) {
                //     console.log("iframe: 캐릭터 제거 메시지 수신 - ID:", data.characterId);
                //     removeCharacterElement(data.characterId);
                // }
                break;
            case 'userName':
                userName = data.name;
                break;
        }
    }
});

function createCharacterElement(characterData, isMyCharacter, characterName) {
    // if (!characterData) {
    //     console.error("iframe: 캐릭터 데이터가 null입니다.", characterData);
    //     return;
    // }
    // if (!characterData.id) {
    //     console.error("iframe: 캐릭터 데이터에 id가 없습니다.", characterData);
    //     return;
    // }
    if (!characterData || characterData.id === undefined) {
        console.error("createCharacterElement: characterData가 유효하지 않습니다.", characterData);
        return;
    }

    const existingElement = characterElements[characterData.id];
    if (existingElement) {
        console.warn(`createCharacterElement: 캐릭터 ID '${characterData.id}'에 해당하는 요소가 이미 존재합니다.`, existingElement);
        return;
    }
    // if (characterElements[characterId]) {
    //     console.warn("iframe: 이미 존재하는 캐릭터 ID:", characterId);
    //     characterElements[characterId].style.left = characterData.x + 'px';
    //     characterElements[characterId].style.top = characterData.y + 'px';
    //     return;
    // }
    // const characterId = characterData.id;

    const characterDiv = document.createElement('div');
    characterDiv.id = `char-${characterData.id}`;
    characterDiv.className = 'character';
    characterDiv.style.left = characterData.x + 'px';
    characterDiv.style.top = characterData.y + 'px';
    console.log("first.js: createCharacterElement - characterName:", characterName);
    console.log("first.js: characterDiv - characterDiv:", characterDiv);
    console.log("first.js: characterId:", characterData.id);
    // 캐릭터 이미지 설정 (예시)
    const img = document.createElement('img');
    if (characterName) {
        img.src = `../img/${characterName}`; // 캐릭터 이름에 따라 이미지 설정
    } else {
        img.src = `../img/${캐릭명}`; // 기본 이미지 (예: 선택 화면에서 처음 들어왔을 때)
    }
    // img.src = `../img/${characterData.characterType}`;
    img.alt = `캐릭터 ${characterData.id}`;
    img.style.zIndex = "1000";
    characterDiv.appendChild(img);
    
    // 이름표 (선택 사항)
    const nameTag = document.createElement('div');
    nameTag.classList.add('name-tag');
    nameTag.style.zIndex = "1000";
    nameTag.textContent = characterElements.characterName; // 또는 character.name 등
    characterDiv.appendChild(nameTag);

    if (isMyCharacter) {
        // myCharacterId = characterId;
        characterDiv.classList.add('my-character');
    }

    characterElements[characterData.id] = characterDiv;
    space.appendChild(characterDiv);
    console.log(`createCharacterElement: 캐릭터 생성됨 - ID: ${characterData.id}, x: ${characterData.x}, y: ${characterData.y}`);

    // characterElements[characterId] = characterDiv;
    // characterIframeIds[characterId] = iframeId; 

}

/**
 * 특정 캐릭터 요소를 화면에서 제거합니다.
 * @param {string} characterId - 제거할 캐릭터의 ID
 */
// function removeCharacterElement(characterId) {
//     console.log('Removing character with ID:', characterId);
//     if (!characterId) {
//         console.error('first.js: 에러! characterId가 정의되지 않았거나 null입니다!');
//         return;
//     }
//     const characterDiv = document.getElementById(`char-${characterId}`);
//     if (!characterDiv) {
//         console.warn('first.js: 해당 ID의 엘리먼트 없음:', characterId);
//         console.log('first.js: 현재 characterElements:', characterElements);
//         return;
//     }
//     console.log('characterDiv = ' + characterDiv);
//     // const characterDiv = charaFterElements[characterId];
//     if (!characterDiv.parentNode) {
//         console.warn('first.js: characterDiv에 parentNode가 없습니다!');
//         delete characterElements[characterId]; // 맵에서 제거
//         return;
//     }
//     characterDiv.parentNode.removeChild(characterDiv);
//     delete characterElements[characterId];
//     // delete characterIframeIds[characterId]; 
//     console.log("first.js: 캐릭터 제거됨 - ID:", characterId);
//     // if (characterDiv) {
//     //     console.log('Character div found:', characterDiv);
//     //     characterDiv.parentNode.removeChild(characterDiv);
//     //     delete characterElements[characterId];
//     //     console.log("iframe: 캐릭터 제거됨 - ID:", characterId);
//     // } else {
//     //     console.warn("iframe: 제거할 캐릭터를 찾을 수 없음 - ID:", characterId);
//     // }
// }
function removeCharacterElement(characterId) {
    const characterElement = characterElements[characterId];
    if (characterElement) {
        characterElement.remove();
        delete characterElements[characterId];
        console.log(`removeCharacterElement: 캐릭터 제거됨 - ID: ${characterId}`);
    } else {
        console.warn(`removeCharacterElement: 제거할 캐릭터를 찾을 수 없음 - ID: ${characterId}`);
    }
}


// 모든 캐릭터 요소를 화면에서 제거하고 맵을 비웁니다.
function removeAllCharacters() {
    for (const id in characterElements) {
        removeCharacterElement(id);
    }
     console.log("iframe: 모든 캐릭터 요소 제거 완료");
}

/**
 * 특정 캐릭터 요소의 화면 위치를 업데이트합니다.
 * @param {string} characterId - 위치를 업데이트할 캐릭터의 ID
 * @param {number} x - 새로운 x 좌표
 * @param {number} y - 새로운 y 좌표
 */
function updateCharacterPosition(characterId, x, y) {
    const characterDiv = characterElements[characterId];
    if (characterDiv) {
        characterDiv.style.left = x + 'px';
        characterDiv.style.top = y + 'px';
    }
}

// function update() {
//     if (!space || myCharacterId === null) {
//         console.log("iframe: space 또는 myCharacterId가 정의되지 않아 업데이트를 건너뜁니다.");
//         requestAnimationFrame(update);
//         return;
//     }

//     const characterDiv = document.getElementById(`char-${myCharacterId}`);

//     if (!characterDiv) {
//         console.log(`iframe: 내 캐릭터 ID(${myCharacterId})에 해당하는 요소를 찾을 수 없습니다.`);
//         requestAnimationFrame(update);
//         return;
//     }

//     const rect = space.getBoundingClientRect();
//     let top = characterDiv.offsetTop;
//     let left = characterDiv.offsetLeft;

//     const imgRect = {
//         top: top,
//         left: left,
//         right: left + characterDiv.offsetWidth,
//         bottom: top + characterDiv.offsetHeight
//     };

//     let canMoveUp = true;
//     let canMoveDown = true;
//     let canMoveLeft = true;
//     let canMoveRight = true;

//     walls.forEach(wall => {
//         const wallRect = {
//             top: wall.offsetTop,
//             left: wall.offsetLeft,
//             right: wall.offsetLeft + wall.offsetWidth,
//             bottom: wall.offsetTop + wall.offsetHeight
//         };

//         // if (isColliding(
//         //     { top: top - moveSpeed, left: left, right: left + characterDiv.offsetWidth, bottom: top + characterDiv.offsetHeight - moveSpeed },
//         //     wallRect
//         // )) {
//         //     canMoveUp = false;
//         // }
//         // if (isColliding(
//         //     { top: top + moveSpeed, left: left, right: left + characterDiv.offsetWidth, bottom: top + characterDiv.offsetHeight + moveSpeed },
//         //     wallRect
//         // )) {
//         //     canMoveDown = false;
//         // }
//         // if (isColliding(
//         //     { top: top, left: left - moveSpeed, right: left + characterDiv.offsetWidth - moveSpeed, bottom: top + characterDiv.offsetHeight },
//         //     wallRect
//         // )) {
//         //     canMoveLeft = false;
//         // }
//         // if (isColliding(
//         //     { top: top, left: left + moveSpeed, right: left + characterDiv.offsetWidth + moveSpeed, bottom: top + characterDiv.offsetHeight },
//         //     wallRect
//         // )) {
//         //     canMoveRight = false;
//         // }

//          if (isColliding(
//             { top: top - moveSpeed, left: left, right: left + characterDiv.offsetWidth, bottom: top + userImage.offsetHeight - moveSpeed },
//             wallRect
//         )) {
//             canMoveUp = false;
//         }
//         if (isColliding(
//             { top: top + moveSpeed, left: left, right: left + characterDiv.offsetWidth, bottom: top + userImage.offsetHeight + moveSpeed },
//             wallRect
//         )) {
//             canMoveDown = false;
//         }
//         if (isColliding(
//             { top: top, left: left - moveSpeed, right: left + characterDiv.offsetWidth - moveSpeed, bottom: top + userImage.offsetHeight },
//             wallRect
//         )) {
//             canMoveLeft = false;
//         }
//         if (isColliding(
//             { top: top, left: left + moveSpeed, right: left + characterDiv.offsetWidth + moveSpeed, bottom: top + userImage.offsetHeight },
//             wallRect
//         )) {
//             canMoveRight = false;
//         }

//     });

//     // if (keys['ArrowUp'] && top > 0 && canMoveUp) {
//     //     characterDiv.style.top = `${Math.max(0, top - moveSpeed)}px`;
//     //     sendMoveRequest(left, top - moveSpeed);
//     // }
//     // if (keys['ArrowDown'] && top < rect.height - characterDiv.offsetHeight && canMoveDown) {
//     //     characterDiv.style.top = `${Math.min(rect.height - characterDiv.offsetHeight, top + moveSpeed)}px`;
//     //     sendMoveRequest(left, top + moveSpeed);
//     // }
//     // if (keys['ArrowLeft'] && left > 0 && canMoveLeft) {
//     //     characterDiv.style.left = `${Math.max(0, left - moveSpeed)}px`;
//     //     sendMoveRequest(left - moveSpeed, top);
//     // }
//     // if (keys['ArrowRight'] && left < rect.width - characterDiv.offsetWidth && canMoveRight) {
//     //     characterDiv.style.left = `${Math.min(rect.width - characterDiv.offsetWidth, left + moveSpeed)}px`;
//     //     sendMoveRequest(left + moveSpeed, top);
//     // }

//     if (keys['ArrowUp'] && top > 0 && canMoveUp) {
//         characterDiv.style.top = `${Math.max(0, top - moveSpeed)}px`;
//     }
//     if (keys['ArrowDown'] && top < rect.height - characterDiv.offsetHeight && canMoveDown) {
//         characterDiv.style.top = `${Math.min(rect.height - characterDiv.offsetHeight, top + moveSpeed)}px`;
//     }
//     if (keys['ArrowLeft'] && left > 0 && canMoveLeft) {
//         characterDiv.style.left = `${Math.max(0, left - moveSpeed)}px`;
//     }
//     if (keys['ArrowRight'] && left < rect.width - characterDiv.offsetWidth && canMoveRight) {
//         characterDiv.style.left = `${Math.min(rect.width - characterDiv.offsetWidth, left + moveSpeed)}px`;
//     }

//         const targetX = characterDiv.style.left.slice(0, -2); // 30px의 절반
//         const targetY = characterDiv.style.top.slice(0, -2); // 30px의 절반
//     // 부모 창으로 이동 요청 메시지 전송
//     sendMoveRequest(targetX, targetY);
//     //  부모 창에 좌표 전송

//     requestAnimationFrame(update);

// }




// function update() {
//     // 모든 캐릭터에 대해 반복문을 돌지만,
//     for (const characterId in characterElements) {
//         // 내 캐릭터일 경우에만 움직임
//         // if (characterIframeIds[characterId] === iframeId) {
//         if (characterId === myCharacterId) {
//             moveCharacter(characterId);
//         }
//     }
//     requestAnimationFrame(update);
// }
function update() {
    if (myCharacterId) {
        moveCharacter(myCharacterId);
    }
    requestAnimationFrame(update);
}
// 캐릭터 이동 함수
function moveCharacter(characterId) {
    const characterElement = characterElements[characterId];
    if (!characterElement) return;

    let dx = 0;
    let dy = 0;

    if (keys['ArrowLeft']) dx -= moveSpeed;
    if (keys['ArrowRight']) dx += moveSpeed;
    if (keys['ArrowUp']) dy -= moveSpeed;
    if (keys['ArrowDown']) dy += moveSpeed;

    if (dx === 0 && dy === 0) return; // 움직임 없음

    const currentX = parseFloat(characterElement.style.left) || 0;
    const currentY = parseFloat(characterElement.style.top) || 0;
    const imgWidth = characterElement.offsetWidth || 0;
    const imgHeight = characterElement.offsetHeight || 0;

    // if (!space) {
    //     console.warn("스페이스 요소가 없어 캐릭터 이동 제한을 적용할 수 없습니다.");
    //     characterElement.style.left = currentX + dx + 'px';
    //     characterElement.style.top = currentY + dy + 'px';
        // if (characterId === myCharacterId && window.parent) {
        // if (characterIframeIds[characterId] === iframeId && window.parent) {
        //     console.log('iframeId ------ ' + iframeId);
        //     console.log('characterIframeIds[characterId] ------ ' + characterIframeIds);
        //     console.log('characterIframeIds ------ ' + characterIframeIds[characterId]);
        //     console.log('characterId ------ ' + characterId);
        //     window.parent.postMessage({
        //         type: 'moveRequest',
        //         payload: { characterId: characterId, x: currentX + dx, y: currentY + dy }
        //     }, '*');
        // }
        // return;
    // }

    const spaceRect = space.getBoundingClientRect();
    const minX = 0;
    const minY = 0;
    const maxX = spaceRect.width - imgWidth;
    const maxY = spaceRect.height - imgHeight;

    let newX = currentX + dx;
    let newY = currentY + dy;

    // Clamp newX and newY within the space boundaries
    newX = Math.max(minX, Math.min(maxX, newX));
    newY = Math.max(minY, Math.min(maxY, newY));

    characterElement.style.left = newX + 'px';
    characterElement.style.top = newY + 'px';
    // console.log('characterIframeIds[characterId]---- ' + characterIframeIds[characterId]);
    // console.log('iframeId---- ' + iframeId);
    console.log('characterId---- ' + characterId);
    console.log('characterElement---- ' + characterElement);

    // 서버에 이동 정보 전송
    if (characterId === myCharacterId && window.parent) {
    // if (characterIframeIds[characterId] === iframeId && window.parent) {
        window.parent.postMessage({
            type: 'moveRequest',
            payload: {
                characterId: characterId, 
                x: newX,
                y: newY }
        }, '*');
    }
}

function isColliding(player, monster) {
    const playerRect = player.getBoundingClientRect();
    const monsterRect = monster.element.getBoundingClientRect();
    return !(
        playerRect.top > monsterRect.bottom ||
        playerRect.right < monsterRect.left ||
        playerRect.bottom < monsterRect.top ||
        playerRect.left > monsterRect.right
    );
}
// 몬스터 생성 함수
function createMonster() {
    if (monsters.length < maxMonsters) {
        // 몬스터 컨테이너 생성
        const monsterContainer = document.createElement('div');
        monsterContainer.className = 'monster-container';
        monsterContainer.style.position = 'absolute';

        // 몬스터 이미지 생성
        const monster = document.createElement('img');
        monster.src = '../img/슬라임.gif';
        monster.alt = '몬스터';
        monster.className = 'monster';

        // 체력바 생성
        const healthBar = document.createElement('div');
        healthBar.className = 'health-bar';
        const healthBarInner = document.createElement('div');
        healthBarInner.className = 'health-bar-inner';
        healthBar.appendChild(healthBarInner);

        // 초기 위치 설정
        const xVal = Math.random() * (space.offsetWidth - 48);
        const yVal = Math.random() * (space.offsetHeight - 48);
        monsterContainer.style.left = xVal + 'px';
        monsterContainer.style.top = yVal + 'px';

        // 초기 속도, 각도 설정
        const speed = 1 + Math.random() * 0.5;
        const angle = Math.random() * 2 * Math.PI;
        const changeAngleProbability = 0.01;

        // 몬스터 데이터 객체 생성 (체력 정보 추가)
        const monsterData = {
            container: monsterContainer, // 몬스터 컨테이너
            element: monster,
            healthBarInner: healthBarInner, // 체력바 inner 엘리먼트
            x: xVal,
            y: yVal,
            speed: speed,
            angle: angle,
            changeAngleProbability: changeAngleProbability,
            initialHealth: 100, // 초기 체력 저장
            health: 100, // 체력
            lastAttacked: 0, // 마지막 공격 시간 초기화
        };

        // 몬스터 컨테이너에 몬스터와 체력바 추가
        monsterContainer.appendChild(healthBar);
        monsterContainer.appendChild(monster);
        space.appendChild(monsterContainer);
        monsters.push(monsterData);
    }
}

function animate() {
    // 모든 몬스터 움직이기
    for (let i = 0; i < monsters.length; i++) {
        moveMonster(monsters[i]);
    }
    requestAnimationFrame(animate);
}

// 초기 몬스터 생성 (최대 몬스터 수까지)
for (let i = 0; i < maxMonsters; i++) {
    createMonster();
}

// 몬스터 생성 인터벌 설정
monsterCreationInterval = setInterval(() => {
    if (monsters.length < maxMonsters) {
        createMonster();
    }
}, 3000); // 3초에 1마리씩

// 애니메이션 시작
animate();
// update();
initializeGame();
