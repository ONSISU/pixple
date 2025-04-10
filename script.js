let walkImg = document.querySelector('.walkImg');
let space = document.querySelector('.space');
let moveSpeed = 2; // 이동 속도
let keys = {};
let walls = document.querySelectorAll('.wall');
let goDoorRight = false;
let goDoorLeft = false;
let goDoorUpDown = false;
let goPage = 0;

let translateX = 0; // X축 이동 거리
let translateY = 0; // Y축 이동 거리
const ctrlTranslateX = 5; // 컨트롤키와 함께 눌렀을 때 추가 이동 X
const ctrlTranslateY = 5; // 컨트롤키와 함께 눌렀을 때 추가 이동 Y
let isCtrlPressed = false; // 컨트롤키가 눌렸는지 여부
let ArrowLeftPressed = false; // 좌우 중 어느 방향키 눌렀는지 여부
let isShiftPressed = false; // 쉬프트 키가 눌렸는지 여부
let skillImage = null; // 스킬 이미지 변수 초기화
let lastSkillUseTime = 0; // 마지막 스킬 사용 시간
const skillCoolTime = 10000; // 쿨타임 (5초)

const monster = document.querySelector('.monster');
const hitEffectImage = document.querySelector('.hitEffectImage');
const skillLeft = document.querySelector('.skillLeft');
const skillRight = document.querySelector('.skillRight');
// 쿨타임 게이지 요소 가져오기
const skillCoolTimeCircle = document.querySelector('.skill01-coolTime-circle');
const monsters = [];
let maxMonsters = 5; // 최대 몬스터 수

let xVal = 0;
let yVal = 0;
let speed = 0.3; // 속도 변경
let angle = Math.random() * 2 * Math.PI;
let changeAngleProbability = 0.01; // 각도 변경 확률 (낮출수록 직선에 가깝게 움직임)

document.addEventListener('keydown', (event) => {
    keys[event.key] = true;
});

document.addEventListener('keyup', (event) => {
    keys[event.key] = false;
});

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

// 컨트롤 키가 눌렸을 때
document.addEventListener('keydown', (event) => {
    if (event.key === 'Control') {
        isCtrlPressed = true;
    }
});

// 컨트롤 키가 떼어졌을 때
document.addEventListener('keyup', (event) => {
    if (event.key === 'Control') {
        isCtrlPressed = false;
    }
});

// 방향키 눌렀을 때
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
        ArrowLeftPressed = true; // 왼쪽 방향키
    }
    if (event.key === 'ArrowRight') {
        ArrowLeftPressed = false; // 오른른쪽 방향키
    }
});

// 키 입력 이벤트 핸들러 수정
document.addEventListener('keydown', (event) => {
    if (event.key === 'Shift') {
        const currentTime = Date.now(); // 현재 시간
        const timeSinceLastSkillUse = currentTime - lastSkillUseTime; // 마지막 스킬 사용 후 경과 시간

        if (timeSinceLastSkillUse >= 3000) {
            isShiftPressed = true;
            lastSkillUseTime = currentTime; // 마지막 스킬 사용 시간 업데이트
            // 스킬 이미지 위치 설정 (사용자 위치)
            skillImage = document.createElement('img');
            skillImage.style.position = 'absolute';
            skillImage.style.width = '100px'; // 스킬 이미지 크기 설정
            skillImage.style.height = '40px'; // 스킬 이미지 크기 설정
            skillImage.style.left = walkImg.offsetLeft + 'px';
            skillImage.style.top = walkImg.offsetTop + 'px';
            skillImage.style.display = 'block';
            skillImage.style.zIndex = '101';

            // 애니메이션 클래스 추가 (방향에 따라 클래스 추가)
            if (ArrowLeftPressed) {
                skillImage.src = '../img/skillLeft.png'; // 왼쪽 이미지
                skillImage.classList.add('skill-animation-left');
                skillImage.classList.remove('skill-animation-right');
            } else {
                skillImage.src = '../img/skillRight.png'; // 오른쪽 이미지
                skillImage.classList.add('skill-animation-right');
                skillImage.classList.remove('skill-animation-left');
            }

            space.appendChild(skillImage); // space에 추가
            startCoolTime();
            // 애니메이션이 끝나면 skillAnimationEnd 함수 실행
            skillImage.addEventListener('animationend', skillAnimationEnd);
        } else {
            console.log('스킬은 3초에 한 번만 사용할 수 있습니다.');
            // 또는 사용자에게 시각적인 피드백을 제공 (예: "아직 스킬을 사용할 수 없습니다" 메시지 표시)
        }
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'Shift') {
        isShiftPressed = false;
    } 
});
// 스킬 애니메이션이 끝났을 때 실행되는 함수
function skillAnimationEnd() {
    if (skillImage) {
        skillImage.classList.remove('skill-animation-right'); // 애니메이션 클래스 제거
        skillImage.classList.remove('skill-animation-left'); // 애니메이션 클래스 제거
        space.removeChild(skillImage); // 스킬 이미지 제거
        skillImage = null; // 스킬 이미지 변수 초기화
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
            health: 100, // 초기 체력
            lastAttacked: 0, // 마지막 공격 시간 초기화
            damageReceived: false // 데미지 받았는지 여부 플래그 추가

        };

        // 몬스터 컨테이너에 몬스터와 체력바 추가
        monsterContainer.appendChild(healthBar);
        monsterContainer.appendChild(monster);
        space.appendChild(monsterContainer);
        monsters.push(monsterData);
    }
}

// 몬스터 움직임 함수
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

// 체력바 업데이트 함수
function updateHealthBar(monsterData) {
    const healthPercent = monsterData.health + '%';
    monsterData.healthBarInner.style.width = healthPercent;

    // 체력에 따라 체력바 색상 변경 (선택 사항)
    if (monsterData.health > 50) {
        monsterData.healthBarInner.style.backgroundColor = 'green';
    } else if (monsterData.health > 20) {
        monsterData.healthBarInner.style.backgroundColor = 'yellow';
    } else {
        monsterData.healthBarInner.style.backgroundColor = 'red';
    }
}

// 애니메이션 루프
function attackAnimate() {
    if (isCtrlPressed) {
        if(ArrowLeftPressed){
            walkImg.style.transform = `translate(-5px, -3px)`;
        }else {
            walkImg.style.transform = `translate(5px, -3px)`;
        }
             // 몬스터 공격 로직
        for (let i = 0; i < monsters.length; i++) {
            const monster = monsters[i];

            // 충돌 감지
            if (isColliding(walkImg, monster)) {
                
                const currentTime = Date.now();
                if (currentTime - monster.lastAttacked >= 300) { // 공격시간
                    // 몬스터 체력 감소
                    monster.health -= 20;
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
        walkImg.style.transform = `translate(0, 0)`;
    }
    // 몬스터와 스킬 이미지 충돌 감지
    if (skillImage && (skillImage.classList.contains('skill-animation-right') || skillImage.classList.contains('skill-animation-left'))) { // 스킬 애니메이션 중일 때만 충돌 감지
        for (let i = 0; i < monsters.length; i++) {
            const monster = monsters[i];
            // 충돌 감지
            if (isColliding(skillImage, monster)) {
                const currentTime = Date.now();
                if (currentTime - monster.lastAttacked >= 3000) { // 공격시간
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
    // 플레이어와 몬스터 충돌 감지 및 이미지 표시 로직 (공격과 관계없이)
    for (let i = 0; i < monsters.length; i++) {
        const monster = monsters[i];

        // 충돌 감지
        if (isColliding(walkImg, monster)) {
            walkImg.style.transform = `translate(-5px, -3px)`;
            // 이미지 표시 (사용자 위치에)
            hitEffectImage.style.left = walkImg.offsetLeft + 25 + 'px';
            hitEffectImage.style.top = walkImg.offsetTop - 20 + 'px';
            hitEffectImage.style.display = 'block';

            // 0.3초 후에 이미지 숨김
            setTimeout(() => {
                hitEffectImage.style.display = 'none';
            }, 300);
        }
    }
    requestAnimationFrame(attackAnimate);
}

// 쿨타임 시작 함수
function startCoolTime() {
    let startTime = performance.now();
    let animationFrameId;

    function updateCoolTimeCircle() {
        const elapsedTime = performance.now() - startTime;
        let angle = Math.min((elapsedTime / skillCoolTime) * 360, 360); // 0 ~ 360

        skillCoolTimeCircle.style.background = `conic-gradient(blue 0%, blue ${angle}%, transparent ${angle}%, transparent 100%)`;

        if (angle < 360) {
            animationFrameId = requestAnimationFrame(updateCoolTimeCircle);
        } else {
            // 쿨타임 완료 시점 보정
            skillCoolTimeCircle.style.background = `conic-gradient(blue 0%, blue 360%, transparent 360%, transparent 100%)`;
        }
    }

    animationFrameId = requestAnimationFrame(updateCoolTimeCircle);
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
}, 3000); // 10초 (10000 밀리초)

// 스킬 애니메이션이 끝났을 때 실행되는 함수
function skillAnimationEnd() {
    skillImage.classList.remove('skill-animation-right'); // 애니메이션 클래스 제거
    skillImage.classList.remove('skill-animation-left'); // 애니메이션 클래스 제거
    skillImage.style.display = 'none'; // 스킬 이미지 숨김
    skillImage.removeEventListener('animationend', skillAnimationEnd); // 이벤트 리스너 제거
}

// 에니메이션 시작
attackAnimate();
animate(); 