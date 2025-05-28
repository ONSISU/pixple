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

// 화면에 표시되는 캐릭터 요소들을 관리하는 맵 (캐릭터 ID -> HTML 요소)
const characterElements = {};
let myCharacterId = null; // 내 캐릭터 ID를 저장할 변수 (부모로부터 받아옴)
let isUpdateLoopRunning = false;
let initialUpdateDone = false;
// 캐릭터 이동 거리 (픽셀 단위)
const moveSpeed = 1.5; // 제공된 코드와의 변수명 통일을 위해 선언
let walls = document.querySelectorAll('.wall');

// update 루프 시작 함수 (한 번만 실행되도록 제어)
function maybeStartUpdateLoop() {
    if (!isUpdateLoopRunning) {
        update();
        isUpdateLoopRunning = true;
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

document.addEventListener('keydown', (event) => {
    keys[event.key] = true;
});

document.addEventListener('keyup', (event) => {
    keys[event.key] = false;
});
function sendToParent(message) {
    window.parent.postMessage(message, "*"); // "*" allows all origins, or replace with your domain
}

window.addEventListener('message', function(event) {
    const data = event.data;
    console.log("부모로부터 메시지 수신:", data);
    const{type} = data;
    // 메시지 타입에 따라 다른 처리
    if (data && data.type) {
        switch (data.type) {
            case 'newCharacter': // 부모로부터 새로운 캐릭터 접속 알림 수신
                if (data.character) {
                    createCharacterElement(data.character, data.characterName); // 내 캐릭터인지 여부 전달
                }
                break;
            case 'currentCharacters': // 부모로부터 현재 접속 중인 모든 캐릭터 정보 수신
                if (data.characters) {
                    // 기존 캐릭터 요소 모두 제거 (클린 업데이트)
                    removeAllCharacters();
                    // 새로 받은 목록으로 다시 그리기
                    data.characters.forEach(charData => {
                        createCharacterElement(charData, charData.name); // 내 캐릭터인지 여부 전달
                    });
                }
                else if (data.character) {
                    // 기존 캐릭터 요소 모두 제거 (클린 업데이트)
                    removeAllCharacters();
                    // 새로 받은 목록으로 다시 그리기
                    data.character.forEach(charData => {
                        createCharacterElement(charData, charData.name); // 내 캐릭터인지 여부 전달
                    });
                }
                else {
                    console.log("iframe에 현재 캐릭터 목록 그리기:", data);
                }
                break;
            case 'createCharacter':
                if (data.characterData && data.characterData.id  && data.isMyCharacter) { // characterData와 id 존재 확인
                    myCharacterId = data.characterData.id; // iframe에서도 내 캐릭터 ID 설정
                    createCharacterElement(data.characterData, data.characterName); // 내 캐릭터 생성
                    if (!isUpdateLoopRunning) {
                        startUpdateLoop();
                        isUpdateLoopRunning = true;
                    }
                } else {
                    console.warn("iframe: 'createCharacter' 메시지에 characterData가 누락되었습니다.");
                }
                break;
            case 'currentCharacter':
                if (data.character) {
                    myCharacterId = data.character.id;
                    createCharacterElement(data.character, data.character.name);
                    if (!isUpdateLoopRunning) {
                        startUpdateLoop();
                        isUpdateLoopRunning = true;
                    }
                }
                break;
            case 'loadInitialCharacters':
                if (Array.isArray(data.characters)) {
                    data.characters.forEach(charData => {
                        createCharacterElement(charData, data.myCharacterName);
                    });
                    if (!isUpdateLoopRunning) {
                        startUpdateLoop();
                        isUpdateLoopRunning = true;
                    }
                } else {
                    console.warn("iframe: 'loadInitialCharacters' 메시지에 characters 배열이 누락되었습니다.");
                }
                break;
            case 'characterMoved': // 부모로부터 캐릭터 이동 정보 수신
                if (data.characterId !== undefined && data.x !== undefined && data.y !== undefined) {
                    const characterElement = characterElements[data.characterId];
                    if (characterElement) {
                        characterElement.style.left = data.x + 'px';
                        characterElement.style.top = data.y + 'px';
                    } else {
                        console.warn("iframe: 이동할 캐릭터를 찾을 수 없음:", data.characterId);
                    }
                }
                break;
            case 'characterDisconnected': // 부모로부터 캐릭터 연결 해제 알림 수신
                console.log('first.js: 접속 해제 처리 - 캐릭터 ID:', data.characterId);
                if (data.characterId) {
                    removeCharacterElement(data.characterId);
                }
                break;
            case 'userName':
                userName = data.name;
                break;
        }
    }
});

function createCharacterElement(characterData, characterName) {
    if (!characterData || characterData.id === undefined) {
        console.error("createCharacterElement: characterData가 유효하지 않습니다.", characterData);
        return;
    }

    const characterDiv = document.createElement('div');
    characterDiv.id = `char-${characterData.id}`;
    characterDiv.className = 'character';
    characterDiv.style.left = characterData.x + 'px';
    characterDiv.style.top = characterData.y + 'px';
    // 캐릭터 이미지 설정 (예시)
    const img = document.createElement('img');
    if (characterName) {
        img.src = `../img/${characterName}`; // 캐릭터 이름에 따라 이미지 설정
    } else {
        img.src = `../img/${캐릭명}`; // 기본 이미지 (예: 선택 화면에서 처음 들어왔을 때)
    }
    img.alt = `캐릭터 ${characterData.id}`;
    img.style.zIndex = "102";
    characterDiv.appendChild(img);
    
    // 이름표 (선택 사항)
    const nameTag = document.createElement('div');
    nameTag.classList.add('name-tag');
    nameTag.style.zIndex = "102";
    nameTag.textContent = UserIdVal; // 또는 character.name 등
    characterDiv.appendChild(nameTag);

    // if (isMyCharacter) {
    //     // myCharacterId = characterId;
    //     characterDiv.classList.add('my-character');
    // }

    characterElements[characterData.id] = characterDiv;
    space.appendChild(characterDiv);
}

function removeCharacterElement(characterId) {
    const characterElement = characterElements[characterId];
    if (characterElement) {
        characterElement.remove();
        delete characterElements[characterId];
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

function update() {
    // 모든 캐릭터에 대해 반복문을 돌지만,
    for (const characterId in characterElements) {
        // 내 캐릭터일 경우에만 움직임
        if (characterId === myCharacterId) {
            moveCharacter(characterId);
        }
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

    // 서버에 이동 정보 전송
    if (characterId === myCharacterId && window.parent) {
        window.parent.postMessage({
            type: 'moveRequest',
            payload: {
                characterId: characterId, 
                x: newX,
                y: newY }
        }, '*');
    }
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
initializeGame();
