const urlParams = new URLSearchParams(window.location.search);
const value = urlParams.get('data');
let goDoorLR = false;
let goDoorUD = false;
let goPage = 0;
let maxMonsters = 1; // 최대 몬스터 수
const space = document.querySelector(".space");
let keys = {};
const UserIdVal1 = localStorage.getItem('userId');
const characterElement = document.createElement('img');
const monsters = [];

// 캐릭터 이동 거리 (픽셀 단위)
const moveSpeed = 2; // 제공된 코드와의 변수명 통일을 위해 선언
let walls = document.querySelectorAll('.wall');

    // 이 iframe에 해당하는 사용자의 캐릭터 ID (부모로부터 전달받음)
// let walls = document.querySelectorAll('.wall');
// const 캐릭명 = {
//     'pix1.png': '곰돌이',
//     'pix2.png': '호랑이',
//     'pix3.png': '팬더'
// }[urlParams.get('name')]

if (!space) {
    console.error("HTML에 ID가 'game-area'인 요소가 없습니다.");
}

// 화면에 표시되는 캐릭터 요소들을 관리하는 맵 (캐릭터 ID -> HTML 요소)
const characterElements = {};

let myCharacterId = null; // 내 캐릭터 ID를 저장할 변수 (부모로부터 받아옴)

document.addEventListener('keydown', (event) => {
    keys[event.key] = true;
});

document.addEventListener('keyup', (event) => {
    keys[event.key] = false;
});

// if (urlParams.get('name')) {
//     const 캐릭명 = urlParams.get('name');
//     walkImg.src = `../img/${캐릭명}`;
// }
// if (value == 21) {
//     userImage.style.top = '102px';
//     userImage.style.left = '530px';
// } else {
    // sendToParent({ type: "chat", text: "Enter First", roomName: 'room1', 캐릭터아이디: 캐릭명 });
//     userImage.style.top = '53px';
// }
// document.addEventListener('keydown', function(event) {
//     if (event.key === 'Enter' || event.keyCode === 13) { // 엔터 키 확인
//       event.preventDefault(); // 기본 동작 취소 (선택 사항)
//       window.parent.postMessage('focusMessage', '*'); // 부모 창으로 메시지 전송
//     }
// });
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
    const 캐릭명 = event.data.name;
    console.log("부모로부터 메시지 수신:", data);
    const{type} = data;
        // 메시지 타입에 따라 다른 처리
        if (data && data.type) {
            switch (data.type) {
                case 'myCharacterCreated': // 부모로부터 내 캐릭터 정보 수신
                    if (data.character) {
                        myCharacterId = data.character.id; // 내 캐릭터 ID 저장
                        console.log("iframe에 내 캐릭터 ID 저장:", myCharacterId);
                        // 이 시점에서는 아직 다른 캐릭터 정보는 못 받았을 수 있으니,
                        // myCharacterId를 활용하여 'currentCharacters'나 'newCharacter' 처리 시 내 캐릭터를 구분합니다.
                    }
                    break;

            case 'currentCharacters': // 부모로부터 현재 접속 중인 모든 캐릭터 정보 수신
                if (data.characters) {
                    console.log("iframe에 현재 캐릭터 목록 그리기:", data.characters);
                    // 기존 캐릭터 요소 모두 제거 (클린 업데이트)
                    removeAllCharacters();
                    // 새로 받은 목록으로 다시 그리기
                    data.characters.forEach(charData => {
                        createCharacterElement(charData, charData.id === myCharacterId); // 내 캐릭터인지 여부 전달
                    });
                }
                break;

            case 'newCharacter': // 부모로부터 새로운 캐릭터 접속 알림 수신
                if (data.character) {
                    console.log("iframe에 새로운 캐릭터 그리기:", data.character);
                    createCharacterElement(data.character, data.character.id === myCharacterId); // 내 캐릭터인지 여부 전달
                }
                break;

            case 'characterMoved': // 부모로부터 캐릭터 이동 정보 수신
                if (data.id !== undefined && data.x !== undefined && data.y !== undefined) {
                    console.log(`iframe에서 캐릭터 이동 처리 - ID: ${data.id}, (${data.x}, ${data.y})`);
                    updateCharacterPosition(data.id, data.x, data.y);
                }
                break;

            case 'characterDisconnected': // 부모로부터 캐릭터 연결 해제 알림 수신
                if (data.id !== undefined) {
                    console.log("iframe에서 캐릭터 연결 해제 처리:", data.id);
                    removeCharacterElement(data.id);
                }
                break;
    
                // 필요하다면 다른 메시지 타입 처리...
            }
        }
});

function createCharacterElement(characterData, isMyCharacter = false) {
    if (!space) return;
    // const 캐릭명 = urlParams.get('name');

    console.log('characterData - ' + characterData);
    console.log('characterData.id - ' + characterData.id);
    // 이미 존재하는 캐릭터 요소인지 확인
    if (characterElements[characterData.id]) {
        // console.log(`캐릭터 요소가 이미 iframe에 존재합니다: ID ${characterData.id}`);
        updateCharacterPosition(characterData.id, characterData.x, characterData.y); // 위치만 업데이트
        return;
    }
    characterElement.id = `char-${characterData.id}`;
    characterElement.classList.add('character');
    // characterElement.src =  `../img/${캐릭명}`;
    characterElement.src =  `../img/pix1.png`;
    characterElement.style.position = 'absolute';
    characterElement.style.width = '45px'; // 원하는 크기
    characterElement.style.height = '45px'; // 원하는 크기
    characterElement.style.zIndex = '102';

     // 이미지가 로드되면 초기 위치 설정
     characterElement.onload = () => {
         updateCharacterPosition(characterData.id, characterData.x, characterData.y);
         // console.log(`iframe: 캐릭터 이미지 로드 및 초기 배치 완료: ID ${characterData.id}`);
     };
     // 이미지 로드 실패 시
     characterElement.onerror = () => {
          console.error(`iframe: 캐릭터 이미지 로드 실패: ${characterElement.src}`);
     };

    space.appendChild(characterElement);
    characterElements[characterData.id] = characterElement;
    // console.log(`iframe: 캐릭터 요소 생성 완료: ID ${characterData.id}`);
}

/**
 * 특정 캐릭터 요소의 화면 위치를 업데이트합니다.
 * @param {string} characterId - 위치를 업데이트할 캐릭터의 ID
 * @param {number} x - 새로운 x 좌표
 * @param {number} y - 새로운 y 좌표
 */
function updateCharacterPosition(characterId, x, y) {
    const characterElement = characterElements[characterId];
    if (characterElement) {
        characterElement.style.left = `${x}px`;
        characterElement.style.top = `${y}px`;
        // console.log(`iframe: 캐릭터 위치 업데이트: ID ${characterId} to (${x}, ${y})`);
    }
}

/**
 * 특정 캐릭터 요소를 화면에서 제거합니다.
 * @param {string} characterId - 제거할 캐릭터의 ID
 */
function removeCharacterElement(characterId) {
    const characterElement = characterElements[characterId];
    if (characterElement && space) {
        space.removeChild(characterElement);
        delete characterElements[characterId];
        // console.log(`iframe: 캐릭터 요소 제거 완료: ID ${characterId}`);
    }
}

/**
 * 모든 캐릭터 요소를 화면에서 제거하고 맵을 비웁니다.
 */
function removeAllCharacters() {
    if (!space) return;
    // space의 모든 자식 요소 제거
    while (space.firstChild) {
        space.removeChild(space.firstChild);
    }
    // characterElements 맵 비우기
    for (const id in characterElements) {
        if (characterElements.hasOwnProperty(id)) {
            delete characterElements[id];
        }
    }
     console.log("iframe: 모든 캐릭터 요소 제거 완료");
}


// --- iframe -> 부모 창으로 메시지 전송 (예: 이동 요청) ---

// 예시: 게임 영역 클릭 시 내 캐릭터 이동 요청을 부모에게 보내기
    // if (space) {
    //     space.addEventListener('click', (event) => {
    //          // 클릭된 위치를 게임 영역 기준으로 계산
    //          const rect = space.getBoundingClientRect();
    //          const clickX = event.clientX - rect.left;
    //          const clickY = event.clientY - rect.top;

    //          // 캐릭터 이미지의 중앙이 클릭 위치에 오도록 좌표 조정 (이미지 크기 30x30 가정)
    //          const targetX = clickX - 15; // 30px의 절반
    //          const targetY = clickY - 15; // 30px의 절반

    //          // 부모 창으로 이동 요청 메시지 전송
    //          sendMoveRequestToParent(targetX, targetY);
    //     });
    // }

/**
 * 캐릭터 이동 요청 메시지를 부모 창으로 전송합니다.
 * @param {number} x - 이동할 x 좌표
 * @param {number} y - 이동할 y 좌표
 */
function sendMoveRequestToParent(x, y) {
    if (window.parent) {
        const moveRequestMessage = {
            type: 'moveRequest', // 메시지 타입 정의
            payload: { x: x, y: y } // 실제 데이터 페이로드
            // 필요하다면 다른 정보도 추가 (예: characterId - 하지만 내 캐릭터 ID는 이미 부모가 알고 있습니다)
        };
        // 부모 창으로 메시지 전송
        window.parent.postMessage(moveRequestMessage, '*'); // 실제 운영 환경에서는 '*' 대신 부모 창의 origin을 지정해야 합니다.
        console.log(`iframe: 부모에게 이동 요청 메시지 전송: (${x}, ${y})`);
    } else {
        console.warn("iframe: 부모 창을 찾을 수 없습니다.");
    }
}


// window.addEventListener('message', function(event) {
//     const data = event.data;
//     const{id, name,type} = data;
//     // 부모로부터 전달된 캐릭터 메시지 처리
  
    // characterDiv.className = 'user-container';
    // characterDiv.style.position = 'absolute';
    // characterDiv.style.zIndex = '105';
    // characterDiv.style.width = '60px';
    // characterDiv.style.height = '60px';
  
    // const userImage = document.createElement("img");
    // userImage.className = "user1";
    // userImage.src = `../img/${name}`;  // 예: ../img/고양이왕.png
    // userImage.style.width = '48px';
    // userImage.style.height = '48px';
  
    // characterDiv.appendChild(userImage);
  
    //   space.appendChild(characterDiv);
// });
    // const { id, name, x, y} = event.data;
    // console.log('event1 - ' + event);
    // console.log('event.origin - ' + event.name);
    // console.log('type - ' + type);
    // console.log('name - ' + name);
    // console.log('event.data1 - ' + event.data);
    // console.log('event.type1 - ' + event.type);

    // if (type === 'user') { 
            // characterDiv.className = 'user-container';
            // characterDiv.style.position = 'absolute';
            // characterDiv.style.zIndex = '105';
            // characterDiv.style.width = '60px';
            // characterDiv.style.height = '60px';
        
            // const userImage = document.createElement("img");
            // userImage.className = "user1";
            // userImage.src = `../img/${name}`;
            // userImage.style.width = '48px';
            // userImage.style.height = '48px';
            // characterDiv.appendChild(userImage);
            // space.appendChild(characterDiv);

            // space.appendChild(characterDiv);
            // characters[UserIdVal1] = {characterDiv};
            // let isMoving = false;
            // let characterX = 0; // 초기 x 좌표
            // let characterY = 0; // 초기 y 좌표
            // const easingFactor = 0.15; // 부드러움 정도 조절
            // let targetX = characterX;
            // let targetY = characterY;
            // const moveSpeed = 12; // 움직이는 속도 (픽셀 단위)
            // characterDiv.style.transition = 'left 0.1s ease-out, top 0.1s ease-out'; // 0.1초 동안 ease-out 효과 적용
            // function updateCharacterPosition() {
            //     const deltaX = targetX - characterX;
            //     const deltaY = targetY - characterY;
        
            //     characterX += deltaX * easingFactor;
            //     characterY += deltaY * easingFactor;
        
            //     characterDiv.style.left = characterX + 'px';
            //     characterDiv.style.top = characterY + 'px';
        
            //     // 목표 지점에 가까워지면 애니메이션 종료
            //     if (Math.abs(deltaX) > 0.1 || Math.abs(deltaY) > 0.1) {
            //         requestAnimationFrame(updateCharacterPosition);
            //     } else {
            //         isMoving = false;
            //     }
            // }

            // document.addEventListener('keydown', (event) => {
            //     keys[event.key] = true;
            //     if (!isMoving) {
            //         isMoving = true;
            //         updateTargetPosition();
            //         requestAnimationFrame(updateCharacterPosition);
            //     }
            // });
        
            // document.addEventListener('keyup', (event) => {
            //     delete keys[event.key];
            //     updateTargetPosition();
            //     if (Object.keys(keys).length === 0) {
            //         isMoving = false; // 더 이상 눌린 키가 없으면 움직임 상태 해제 (애니메이션은 delta가 작아지면 자동 종료)
            //     }
            // });
        
            // function updateTargetPosition() {
            //     let newTargetX = characterX;
            //     let newTargetY = characterY;
        
            //     if (keys['ArrowLeft']) {
            //         newTargetX -= moveSpeed;
            //     }
            //     if (keys['ArrowRight']) {
            //         newTargetX += moveSpeed;
            //     }
            //     if (keys['ArrowUp']) {
            //         newTargetY -= moveSpeed;
            //     }
            //     if (keys['ArrowDown']) {
            //         newTargetY += moveSpeed;
            //     }
        
            //     targetX = newTargetX;
            //     targetY = newTargetY;
            // }
    // }
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
function update() {
    const rect = space.getBoundingClientRect();
    // const characterElement1 = document.querySelector(".character");

    const characterDiv = characterElement;


    let top = characterDiv.offsetTop;
    let left = characterDiv.offsetLeft;

    const imgRect = {
        top: top,
        left: left,
        right: left + characterDiv.offsetWidth,
        bottom: top + characterDiv.offsetHeight
    };

    let canMoveUp = true;
    let canMoveDown = true;
    let canMoveLeft = true;
    let canMoveRight = true;

    walls.forEach(wall => {
        const wallRect = {
            top: wall.offsetTop,
            left: wall.offsetLeft,
            right: wall.offsetLeft + wall.offsetWidth,
            bottom: wall.offsetTop + wall.offsetHeight
        };

        if (isColliding(
            { top: top - moveSpeed, left: left, right: left + characterDiv.offsetWidth, bottom: top + userImage.offsetHeight - moveSpeed },
            wallRect
        )) {
            canMoveUp = false;
        }
        if (isColliding(
            { top: top + moveSpeed, left: left, right: left + characterDiv.offsetWidth, bottom: top + userImage.offsetHeight + moveSpeed },
            wallRect
        )) {
            canMoveDown = false;
        }
        if (isColliding(
            { top: top, left: left - moveSpeed, right: left + characterDiv.offsetWidth - moveSpeed, bottom: top + userImage.offsetHeight },
            wallRect
        )) {
            canMoveLeft = false;
        }
        if (isColliding(
            { top: top, left: left + moveSpeed, right: left + characterDiv.offsetWidth + moveSpeed, bottom: top + userImage.offsetHeight },
            wallRect
        )) {
            canMoveRight = false;
        }
    });

    if (keys['ArrowUp'] && top > 0 && canMoveUp) {
        characterDiv.style.top = `${Math.max(0, top - moveSpeed)}px`;
    }
    if (keys['ArrowDown'] && top < rect.height - characterDiv.offsetHeight && canMoveDown) {
        characterDiv.style.top = `${Math.min(rect.height - characterDiv.offsetHeight, top + moveSpeed)}px`;
    }
    if (keys['ArrowLeft'] && left > 0 && canMoveLeft) {
        characterDiv.style.left = `${Math.max(0, left - moveSpeed)}px`;
    }
    if (keys['ArrowRight'] && left < rect.width - characterDiv.offsetWidth && canMoveRight) {
        characterDiv.style.left = `${Math.min(rect.width - characterDiv.offsetWidth, left + moveSpeed)}px`;
    }

    //     if (keys['ArrowUp'] && canMoveUp) { // 위 방향키
    //     // characterDiv.style.top = `${Math.max(0, top - moveSpeed)}px`; // <-- moveSpeed 만큼 위로 이동
    //     let newTop = top - moveSpeed; // 새로운 top 위치 계산
    //     // 경계 체크: 0보다 작아지지 않도록 합니다.
    //     characterDiv.style.top = `${Math.max(0, newTop)}px`; // <-- moveSpeed 만큼 이동 적용
    // }
    // if (keys['ArrowDown'] && canMoveDown) { // 아래 방향키
    //     // characterDiv.style.top = `${Math.min(rect.height - characterDiv.offsetHeight, top + moveSpeed)}px`; // <-- moveSpeed 만큼 아래로 이동
    //     let newTop = top + moveSpeed; // 새로운 top 위치 계산
    //      // 경계 체크: 게임 영역 하단 경계를 벗어나지 않도록 합니다.
    //     characterDiv.style.top = `${Math.min(rect.height - characterDiv.offsetHeight, newTop)}px`; // <-- moveSpeed 만큼 이동 적용
    // }
    // if (keys['ArrowLeft'] && canMoveLeft) { // 왼쪽 방향키
    //     // characterDiv.style.left = `${Math.max(0, left - moveSpeed)}px`; // <-- moveSpeed 만큼 왼쪽으로 이동
    //     let newLeft = left - moveSpeed; // 새로운 left 위치 계산
    //      // 경계 체크: 0보다 작아지지 않도록 합니다.
    //     characterDiv.style.left = `${Math.max(0, newLeft)}px`; // <-- moveSpeed 만큼 이동 적용
    // }
    // if (keys['ArrowRight'] && canMoveRight) { // 오른쪽 방향키
    //     // characterDiv.style.left = `${Math.min(rect.width - characterDiv.offsetWidth, left + moveSpeed)}px`; // <-- moveSpeed 만큼 오른쪽으로 이동
    //      let newLeft = left + moveSpeed; // 새로운 left 위치 계산
    //      // 경계 체크: 게임 영역 우측 경계를 벗어나지 않도록 합니다.
    //      characterDiv.style.left = `${Math.min(rect.width - characterDiv.offsetWidth, newLeft)}px`; // <-- moveSpeed 만큼 이동 적용
    //     }
    // 캐릭터 이미지의 중앙이 클릭 위치에 오도록 좌표 조정 (이미지 크기 30x30 가정)
    const targetX = characterDiv.style.left; // 30px의 절반
    const targetY = characterDiv.style.top; // 30px의 절반

    // 부모 창으로 이동 요청 메시지 전송
    sendMoveRequestToParent(targetX, targetY);
    //  부모 창에 좌표 전송
    if (90 <= imgRect.top && imgRect.top <= 110 || 144 <= imgRect.bottom && imgRect.bottom <= 164) {
        goDoorUD = true;
    } else {
        goDoorUD = false;
    }
    if (imgRect.right >= 630) {
        goDoorLR = true;
    } else {
        goDoorLR = false;
    }
    if (goDoorUD && goDoorLR) {
        goPage = 12;
        setTimeout(() => {
            // window.location.href = `Second.html?data=${encodeURIComponent(goPage)}&name=${urlParams.get('name')}`;
        }, 500);
    }
    requestAnimationFrame(update);
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

// window.addEventListener("message", (event) => {
//     const 캐릭명 = urlParams.get('name');
//     if (event.data.type === "addUser") {
//         const userId = event.data.userId;
//         // 사용자 이미지 생성 및 iframe에 추가
//         userImage = document.createElement("img");
//         userImage.className = "walkImg1";
//         userImage.src = `../img/${캐릭명}`;
//         //   userImage.src = "../img/pix1.png";
//         userImage.alt = "사용자1";
//         userImage.id = `user-${userId}`;
//         let space = document.querySelector('.walkImg');
//         // let space = document.querySelector('.space');
//         // const space = document.getElementById("walkImg");
//         if (space) {
//             space.appendChild(userImage);
//             //update();
//             console.log("된건가?");
//         } else {
//             console.error("iframe 내부의 space 요소를 찾을 수 없습니다.");
//         }
//     } else {
//     console.error("iframe 내부의 space 요소를 찾을 수 없습니다.");
//     }
// });


// const characters = {};

// window.addEventListener('message', (event) => {
//     const data = event.data;

//     if (data.type === 'createCharacter') {
//         const name = data.name;
//         if (!characters[name]) {
//             createCharacterElement(name, 30, 10); // 초기 위치 설정
//         }
//     } else if (data.type === 'addUser') {
//         const name = data.name;
//         if (!characters[name]) {
//             createCharacterElement(name, Math.random() * 200 + 50, Math.random() * 150 + 50); // 초기 랜덤 위치
//         }
//     } else if (data.type === 'characterPosition') {
//         const x = data.x;
//         const y = data.y;
//         updateCharacterPosition(x, y);
//     }
// });

// function createCharacterElement( name, x, y) {
//     const characterDiv = document.createElement('div');
//     characterDiv.className = 'user-container';
//     characterDiv.style.position = 'absolute';
//     characterDiv.style.zIndex = '105';
//     characterDiv.style.width = '48px';
//     characterDiv.style.height = '48px';
//     characterDiv.style.left = `${x}px`;
//     characterDiv.style.top = `${y}px`;
//     characterDiv.id = `user-${name}`;

//     const userImage = document.createElement("img");
//     userImage.className = "user1";
//     userImage.src = `./img/${name}`;
//     userImage.style.width = '48px';
//     userImage.style.height = '48px';
//     characterDiv.appendChild(userImage);
//     space.appendChild(characterDiv);
//     characters[name] = characterDiv;
//     console.log(`iframe: 캐릭터 생성됨: ${name}`);
// }

// function updateCharacterPosition(name, x, y) {
//     const characterElement = characters[name];
//     if (characterElement) {
//         characterElement.style.left = `${x}px`;
//         characterElement.style.top = `${y}px`;
//     }
// }

// (선택 사항) 간단한 움직임 예시
// setInterval(() => {
//     for (const name in characters) {
//         const characterElement = characters[name];
//         const x = parseInt(characterElement.style.left) || 50;
//         const y = parseInt(characterElement.style.top) || 50;
//         const newX = x + Math.random() * 10 - 5;
//         const newY = y + Math.random() * 10 - 5;
//         characterElement.style.left = `${newX}px`;
//         characterElement.style.top = `${newY}px`;
//         window.parent.postMessage({
//             type: 'characterPosition',
//             x: newX,
//             y: newY
//         }, '*');
//     }
// }, 100);

// // // 애니메이션 시작
animate();
update();

