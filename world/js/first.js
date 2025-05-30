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

//스킬
let isShiftPressed = false; // 쉬프트트키가 눌렸는지 여부
let ArrowLeftPressed = false; // 좌우 중 어느 방향키 눌렀는지 여부
let A_KeyPressed = false; // a키(스킬1)가 눌렸는지 여부
let S_KeyPressed = false; // s키(스킬2)가 눌렸는지 여부
let D_KeyPressed = false; // d키(스킬3)가 눌렸는지 여부
let skillImage01 = null; 
let skillImage02 = null;
let skillImage03 = null; 
let Skill01UseTime = 0; // 마지막 스킬 사용 시간
let Skill02UseTime = 0;
let Skill03UseTime = 0;
let skillCoolTime01 = 3000; // 쿨타임
let skillCoolTime02 = 6000; 
let skillCoolTime03 = 15000; 
const skillCoolTimeCircle01 = document.querySelector('.skill01-coolTime-circle'); // 쿨타임 게이지 요소 가져오기
const skillCoolTimeCircle02 = document.querySelector('.skill02-coolTime-circle');
const skillCoolTimeCircle03 = document.querySelector('.skill03-coolTime-circle');
const skill01Image = document.querySelector('.skill01-image');
const skill01Content = document.querySelector('.skill01-content');
const skill02Image = document.querySelector('.skill02-image');
const skill02Content = document.querySelector('.skill02-content');
const skill03Image = document.querySelector('.skill03-image');
const skill03Content = document.querySelector('.skill03-content');
const hitEffectImage = document.querySelector('.hitEffectImage');

let newX = null;
let newY = null;
// update 루프 시작 함수 (한 번만 실행되도록 제어)
function maybeStartUpdateLoop() {
    if (!isUpdateLoopRunning) {
        update();
        isUpdateLoopRunning = true;
    // } else {
    //     console.log("iframe: update 루프는 이미 실행 중입니다.");
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
                // else {
                //     console.log("iframe에 현재 캐릭터 목록 그리기:", data);
                // }
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
                // console.log('first.js: 접속 해제 처리 - 캐릭터 ID:', data.characterId);
                if (data.characterId) {
                    removeCharacterElement(data.characterId);
                }
                break;
            case 'characterSkill':
                handleSkillEffect(data.characterId, data.x, data.y, data.skill);
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
    img.style.zIndex = "1020";
    characterDiv.appendChild(img);
    
    // 이름표 (선택 사항)
    const nameTag = document.createElement('div');
    nameTag.classList.add('name-tag');
    nameTag.style.zIndex = "1020";
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
}

function update() {
    // 모든 캐릭터에 대해 반복문을 돌지만,
    for (const characterId in characterElements) {
        // 내 캐릭터일 경우에만 움직임
        if (characterId === myCharacterId) {
            moveCharacter(characterId);
            attackAnimate(characterElements[characterId]);
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

    newX = currentX + dx;
    newY = currentY + dy;

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


// 스킬

document.addEventListener('keydown', (event) => {
    if (event.key === 'Shift') {
        isShiftPressed = true;
    }
    if (event.key === 'ArrowLeft') {
        ArrowLeftPressed = true; // 왼쪽 방향키
    }
    if (event.key === 'ArrowRight') {
        ArrowLeftPressed = false; // 오른른쪽 방향키
    }
    if (event.key === 'a' || event.key === 'A' || event.key === 'ㅁ') {
        const currentTime = Date.now(); // 현재 시간
        let timeSinceLastSkillUse = currentTime - Skill01UseTime; // 마지막 스킬 사용 후 경과 시간
        if (timeSinceLastSkillUse >= skillCoolTime01) {
            A_KeyPressed = true;
            Skill01UseTime = currentTime; // 마지막 스킬 사용 시간 업데이트
            if (window.parent) {
                window.parent.postMessage({
                    type: 'skillRequest',
                    payload: {
                        characterId: myCharacterId, 
                        x: newX,
                        y: newY,
                        skill: 'a'}
                }, '*');
            }
            // sendSkillMessage('skill01'); // 스킬 사용 메시지 전송
            startCoolTime('a');
            }
    }
    if (event.key === 's' || event.key === 'S' || event.key === 'ㄴㄴ') {
        const currentTime = Date.now();
        let timeSinceLastSkillUse = currentTime - Skill02UseTime;

        if (timeSinceLastSkillUse >= skillCoolTime02) {
            S_KeyPressed = true;
            Skill02UseTime = currentTime;
            if (window.parent) {
                window.parent.postMessage({
                    type: 'skillRequest',
                    payload: {
                        characterId: myCharacterId, 
                        x: newX,
                        y: newY,
                        skill: 's'}
                }, '*');
            }
            startCoolTime('s');
        }
    }
    if (event.key === 'd' || event.key === 'D' || event.key === 'ㅇㅇ') {
        const currentTime = Date.now();
        let timeSinceLastSkillUse = currentTime - Skill03UseTime;

        if (timeSinceLastSkillUse >= skillCoolTime03) {
            D_KeyPressed = true;
            Skill03UseTime = currentTime;
            if (window.parent) {
                window.parent.postMessage({
                    type: 'skillRequest',
                    payload: {
                        characterId: myCharacterId, 
                        x: newX,
                        y: newY,
                        skill: 'd'}
                }, '*');
            }
            startCoolTime('d');
        }
    }
});
document.addEventListener('keyup', (event) => {
    if (event.key === 'Shift') {
        isShiftPressed = false;
    }
    if (event.key === 'a' || event.key === 'A' || event.key === 'ㅁ') {
        A_KeyPressed = false;
    }
    if (event.key === 's' || event.key === 'S' || event.key === 'ㄴㄴ') {
        S_KeyPressed = false;
    }
    if (event.key === 'd' || event.key === 'D' || event.key === 'ㅇ') {
        D_KeyPressed = false;
    }  
});

function skillTooltip(skillImage, skillContent) {
    if (skillImage && skillContent) {
        skillImage.addEventListener('mouseover', () => {
        skillContent.style.display = 'block';
        });
        skillImage.addEventListener('mouseout', () => {
        skillContent.style.display = 'none';
        });
    }
}

skillTooltip(skill01Image, skill01Content);
skillTooltip(skill02Image, skill02Content);
skillTooltip(skill03Image, skill03Content);

function handleSkillEffect(characterId, skillX, skillY, skill) {
    // if (characterId === myCharacterId) {
        // 내 캐릭터가 사용한 스킬
        if (skill === 'a') {
            // 스킬 1 애니메이션 처리
            // 스킬 이미지 위치 설정 (사용자 위치)
            skillImage01 = document.createElement('img');
            skillImage01.style.position = 'absolute';
            skillImage01.style.width = '100px'; // 스킬 이미지 크기 설정
            skillImage01.style.height = '40px'; // 스킬 이미지 크기 설정
            skillImage01.style.left = skillX + 'px';
            skillImage01.style.top = skillY + 'px';
            skillImage01.style.display = 'block';
            skillImage01.style.zIndex = '101';

            // 애니메이션 클래스 추가 (방향에 따라 클래스 추가)
            if (ArrowLeftPressed) {
                skillImage01.src = '../img/skill01Left.png'; // 왼쪽 이미지
                skillImage01.classList.add('skill01-animation-left');
                skillImage01.classList.remove('skill01-animation-right');
            } else {
                skillImage01.src = '../img/skill01Right.png'; // 오른쪽 이미지
                skillImage01.classList.add('skill01-animation-right');
                skillImage01.classList.remove('skill01-animation-left');
            }

            space.appendChild(skillImage01); // space에 추가
            startCoolTime('a');
            // 애니메이션이 끝나면 skillAnimationEnd 함수 실행
            skillImage01.addEventListener('animationend', skill01AnimationEnd);
        } else if (skill === 's') {
            useSkill('s', skillX, skillY);
        } else if(skill === 'd') {
            useSkill('d', skillX, skillY);
        } 
    // } else {
        // 다른 캐릭터가 사용한 스킬
        // 다른 캐릭터의 스킬 애니메이션 처리 또는 이펙트 표시
    // }
}
function useSkill(key, skillX, skillY) {
    if(key === 's'){
        if (!skillImage02) { // 스킬 이미지가 없으면 생성
            skillImage02 = document.createElement('img');
            skillImage02.style.position = 'absolute';
            skillImage02.style.borderRadius = '50%';
            skillImage02.style.backgroundColor = 'rgba(45, 59, 255, 0.3)';
            skillImage02.style.pointerEvents = 'none';
            skillImage02.style.zIndex = '101';
            space.appendChild(skillImage02); // space에 추가
            skillImage02.addEventListener('animationend', skill02AnimationEnd); // 애니메이션 종료 이벤트 리스너 등록
        }
    
        skillImage02.classList.remove('skill-effect'); // 기존 애니메이션 클래스 제거
        void skillImage02.offsetWidth; // reflow 발생 (애니메이션 재시작 트릭)
        skillImage02.classList.add('skill-effect'); // 애니메이션 클래스 추가
    
        skillImage02.style.left = (skillX - 70) + 'px'; // 이펙트 위치 조정
        skillImage02.style.top = (skillY - 70) + 'px'; // 이펙트 위치 조정
        skillImage02.style.width = (100 * 2) + 'px'; // 스킬 범위에 맞게 조정
        skillImage02.style.height = (100 * 2) + 'px'; // 스킬 범위에 맞게 조정
        // 몬스터 데미지 초기화
        for (let i = 0; i < monsters.length; i++) {
            monsters[i].skill02DamageApplied = false; // 데미지 적용 여부 초기화
        }
    }else if(key === 'd') {
        if (!skillImage03) { // 스킬 이미지가 없으면 생성
            skillImage03 = document.createElement('img');
            skillImage03.src = "../img/스킬3.png"; // backgroundImage 대신 src 사용
            skillImage03.style.position = 'absolute'; // position 설정
            skillImage03.style.zIndex = '101';  
            skillImage03.style.width = '800px'; // 스킬 범위에 맞게 조정
            skillImage03.style.height = '640px'; // 스킬 범위에 맞게 조정
            space.appendChild(skillImage03); // space에 추가
            skillImage03.addEventListener('animationend', skill03AnimationEnd); // 애니메이션 종료 이벤트 리스너 등록
        }

        skillImage03.classList.remove('skill03'); // 기존 애니메이션 클래스 제거
        void skillImage03.offsetWidth; // Reflow를 강제로 발생시켜 애니메이션을 재시작
        skillImage03.classList.add('skill03'); // 애니메이션 클래스 추가

        skillImage03.style.left = skillX - 350 + 'px'; // 이펙트 위치 조정 (중앙)
        skillImage03.style.top = skillY - 240 + 'px'; // 이펙트 위치 조정 (중앙)

        // 몬스터 데미지 초기화
        for (let i = 0; i < monsters.length; i++) {
            monsters[i].skill03DamageApplied = false; // 데미지 적용 여부 초기화
        }
    }
}
// 스킬 애니메이션이 끝났을 때 실행되는 함수
function skill01AnimationEnd() {
    if (skillImage01) {
        skillImage01.classList.remove('skill01-animation-right'); // 애니메이션 클래스 제거
        skillImage01.classList.remove('skill01-animation-left'); // 애니메이션 클래스 제거
        space.removeChild(skillImage01); // 스킬 이미지 제거
        skillImage01 = null; // 스킬 이미지 변수 초기화
    }
}
function skill02AnimationEnd() {
    if (skillImage02) {
        skillImage02.classList.remove('skill-effect'); // 애니메이션 클래스 제거
        space.removeChild(skillImage02); // 스킬 이미지 제거
        skillImage02 = null; // 스킬 이미지 변수 초기화
    }
}
function skill03AnimationEnd() {
    if (skillImage03) {
        skillImage03.classList.remove('skill03');
        space.removeChild(skillImage03);
        skillImage03.remove(); // 이미지 제거
        skillImage03 = null;
    }
}

// 쿨타임 시작 함수
function startCoolTime(key) {
    if(key === 'a'){
        let startTime = Date.now();
        function updateCoolTimeCircle() {
            const elapsedTime = Date.now() - startTime;
            let angle = Math.min((elapsedTime / 11000) * 360, 360); // 0 ~ 360
            skillCoolTimeCircle01.style.background = `conic-gradient(blue 0%, blue ${angle}%, transparent ${angle}%, transparent 100%)`;
    
            if (angle < 360) {
                let animationFrameId01 = requestAnimationFrame(updateCoolTimeCircle);
            } else {
                // 쿨타임 완료 시점 보정
                skillCoolTimeCircle01.style.background = `conic-gradient(blue 0%, blue 360%, transparent 360%, transparent 100%)`;
            }
        }
        animationFrameId01 = requestAnimationFrame(updateCoolTimeCircle);
    }else if(key === 's') {
        let startTime = Date.now();
        
        function updateCoolTimeCircle() {
            const elapsedTime = Date.now() - startTime;
            let angle = Math.min((elapsedTime / 22000) * 360, 360); // 0 ~ 360
        
            skillCoolTimeCircle02.style.background = `conic-gradient(blue 0%, blue ${angle}%, transparent ${angle}%, transparent 100%)`;
        
            if (angle < 360) {
                let animationFrameId02 = requestAnimationFrame(updateCoolTimeCircle);
            } else {
                // 쿨타임 완료 시점 보정
                skillCoolTimeCircle02.style.background = `conic-gradient(blue 0%, blue 360%, transparent 360%, transparent 100%)`;
            }
        }
        animationFrameId02 = requestAnimationFrame(updateCoolTimeCircle);
    }else if(key === 'd') {
        let startTime = Date.now();
        
        function updateCoolTimeCircle() {
            const elapsedTime = Date.now() - startTime;
            let angle = Math.min((elapsedTime / 55000) * 360, 360); // 0 ~ 360
        
            skillCoolTimeCircle03.style.background = `conic-gradient(blue 0%, blue ${angle}%, transparent ${angle}%, transparent 100%)`;
        
            if (angle < 360) {
                let animationFrameId03 = requestAnimationFrame(updateCoolTimeCircle);
            } else {
                // 쿨타임 완료 시점 보정
                skillCoolTimeCircle03.style.background = `conic-gradient(blue 0%, blue 360%, transparent 360%, transparent 100%)`;
            }
        }
        animationFrameId03 = requestAnimationFrame(updateCoolTimeCircle);
    }
}

// 체력바 업데이트 함수
function updateHealthBar(monsterData) {
    const healthPercent = (monsterData.health / monsterData.initialHealth) * 100;
    const displayPercent = Math.max(0, healthPercent); // 0% 이하로 떨어지지 않도록 보정
    monsterData.healthBarInner.style.width = displayPercent + '%';
    // 체력에 따라 체력바 색상 변경 (선택 사항)
    if (displayPercent > 50) {
        monsterData.healthBarInner.style.backgroundColor = 'green';
    } else if (displayPercent > 20) {
        monsterData.healthBarInner.style.backgroundColor = 'yellow';
    } else {
        monsterData.healthBarInner.style.backgroundColor = 'red';
    }
}

// // 몬스터 움직임 함수
function moveMonster(monsterData) {
    const monsterContainer = monsterData.container;
    const monster = monsterData.element;

    // x, y 좌표 업데이트
    monsterData.x += monsterData.speed * Math.cos(monsterData.angle);
    monsterData.y += monsterData.speed * Math.sin(monsterData.angle);

    // 각도 변경 (매우 낮은 확률로)
    if (Math.random() < monsterData.changeAngleProbability) {
        monsterData.angle = Math.random() * 2 * Math.PI;
    }

    // 경계 확인
    if (monsterData.x < 0) {
        monsterData.x = 0;
        monsterData.angle = Math.random() * 2 * Math.PI;
    } else if (monsterData.x + monster.width > space.offsetWidth) {
        monsterData.x = space.offsetWidth - monster.width;
        monsterData.angle = Math.random() * 2 * Math.PI;
    }
    if (monsterData.y < 0) {
        monsterData.y = 0;
        monsterData.angle = Math.random() * 2 * Math.PI;
    } else if (monsterData.y + monster.height > space.offsetHeight) {
        monsterData.y = space.offsetHeight - monster.height;
        monsterData.angle = Math.random() * 2 * Math.PI;
    }

    monsterContainer.style.left = monsterData.x + 'px';
    monsterContainer.style.top = monsterData.y + 'px';

    // 체력바 업데이트
    updateHealthBar(monsterData);

    // 체력이 0 이하가 되면 몬스터 제거
    if (monsterData.health <= 0) {
        // 몬스터 컨테이너 제거
        space.removeChild(monsterContainer);

        // 몬스터 배열에서 제거
        const index = monsters.indexOf(monsterData);
        if (index > -1) {
            monsters.splice(index, 1);
        }
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

// 애니메이션 루프
function attackAnimate(characterDiv1) {
    if (isShiftPressed) {
        if(ArrowLeftPressed){
            characterDiv1.style.transform = `translate(-5px, -3px)`;
                // characterDiv1.style.left = newX - 5 + 'px';
                // characterDiv1.style.top = newY - 3 + 'px';
        }else {
            characterDiv1.style.transform = `translate(5px, -3px)`;
                // characterDiv1.style.left = newX + 5 + 'px';
                // characterDiv1.style.top = newY - 3 + 'px';
        }
             // 몬스터 공격 로직
        for (let i = 0; i < monsters.length; i++) {
            const monster = monsters[i];

            // 충돌 감지
            if (isColliding(characterDiv1, monster)) {
                const currentTime = Date.now();
                if (currentTime - monster.lastAttacked >= 300) { // 공격시간
                    // 몬스터 체력 감소
                    monster.health -= 10;
                    updateHealthBar(monster);

                    // 마지막 공격 시간 업데이트
                    monster.lastAttacked = currentTime;

                    // 체력이 0 이하가 되면 몬스터 제거 (기존 코드 활용)
                    if (monster.health <= 0) {
                        space.removeChild(monster.container);
                        const index = monsters.indexOf(monster);
                        if (index > -1) {
                            monsters.splice(index, 1);
                        }
                    }
                }
            }
        }
    } else {
        // 원래 위치로 되돌리기
        characterDiv1.style.transform = `translate(0px, 0px)`;
        // characterDiv1.style.left = newX + 'px';
        // characterDiv1.style.top = newY + 'px';
    }
    // 몬스터와 스킬 이미지 충돌 감지
    if (skillImage01 && (skillImage01.classList.contains('skill01-animation-right') || skillImage01.classList.contains('skill01-animation-left'))) { // 스킬 애니메이션 중일 때만 충돌 감지
        for (let i = 0; i < monsters.length; i++) {
            const monster = monsters[i];
            // 충돌 감지
            if (isColliding(skillImage01, monster)) {
                const currentTime = Date.now();
                if (currentTime - monster.lastAttacked >= skillCoolTime01) { // 공격시간
                    // 몬스터 체력 감소
                    monster.health -= 30; // 예시: 30 데미지
                    updateHealthBar(monster);
                    // 마지막 공격 시간 업데이트
                    monster.lastAttacked = currentTime;

                    // 체력이 0 이하가 되면 몬스터 제거 (기존 코드 활용)
                    if (monster.health <= 0) {
                        space.removeChild(monster.container);

                        const index = monsters.indexOf(monster);
                        if (index > -1) {
                            monsters.splice(index, 1);
                        }
                    }
                }
            }
        }
    }
    if (skillImage02 && (skillImage02.classList.contains('skill-effect'))) { 
        for (let i = 0; i < monsters.length; i++) {
            const monster = monsters[i];

            if (isColliding(skillImage02, monster) && !monster.skill02DamageApplied) {
                // 충돌 감지 및 데미지 미적용 상태 확인
                monster.health -= 60; // 데미지 적용
                updateHealthBar(monster);
                monster.skill02DamageApplied = true; // 데미지 적용 상태로 변경

                if (monster.health <= 0) {
                    space.removeChild(monster.container);
                    monsters.splice(i, 1);
                    i--; // 몬스터 제거 후 인덱스 조정
                }
            }
        }
    }
    if (skillImage03 && (skillImage03.classList.contains('skill03'))) { 
        for (let i = 0; i < monsters.length; i++) {
            const monster = monsters[i];

            if (isColliding(skillImage03, monster) && !monster.skill03DamageApplied) {
                // 충돌 감지 및 데미지 미적용 상태 확인
                monster.health -= 200; // 데미지 적용
                updateHealthBar(monster);
                monster.skill03DamageApplied = true; // 데미지 적용 상태로 변경

                if (monster.health <= 0) {
                    space.removeChild(monster.container);
                    monsters.splice(i, 1);
                    i--; // 몬스터 제거 후 인덱스 조정
                }
            }
        }
    }

    // 플레이어와 몬스터 충돌 감지 및 이미지 표시 로직 (공격과 관계없이)
    for (let i = 0; i < monsters.length; i++) {
        const monster = monsters[i];

        // 충돌 감지
        if (isColliding(characterDiv1, monster)) {
                characterDiv1.style.transform = `translate(5px, -3px)`;
                // characterDiv1.style.left = newX - 5 + 'px';
                // characterDiv1.style.top = newY - 3 + 'px';
            // 이미지 표시 (사용자 위치에)
            hitEffectImage.style.left = newX + 25 + 'px';
            hitEffectImage.style.top = newY - 20 + 'px';
            hitEffectImage.style.display = 'block';
            
            // 0.3초 후에 이미지 숨김
            setTimeout(() => {
                hitEffectImage.style.display = 'none';
            }, 300);
        }
    }
    requestAnimationFrame(() => attackAnimate(characterDiv1));
}

// 애니메이션 시작
animate();
initializeGame();
