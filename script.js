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

let A_KeyPressed = false; // a키(스킬1)가 눌렸는지 여부
let S_KeyPressed = false; // s키(스킬2)가 눌렸는지 여부
let skillImage01 = null; // 스킬 이미지 변수 초기화
let skillImage02 = null; // 스킬 이미지 변수 초기화
let Skill01UseTime = 0; // 마지막 스킬 사용 시간
let Skill02UseTime = 0; // 마지막 스킬 사용 시간
let skillCoolTime01 = 3000; // 쿨타임
let skillCoolTime02 = 6000; 

const monster = document.querySelector('.monster');
const hitEffectImage = document.querySelector('.hitEffectImage');
// 쿨타임 게이지 요소 가져오기
const skillCoolTimeCircle01 = document.querySelector('.skill01-coolTime-circle');
const skillCoolTimeCircle02 = document.querySelector('.skill02-coolTime-circle');
// Skill02UseTime = Date.now() - skillCoolTime02;

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
    if (event.key === 'a') {
        const currentTime = Date.now(); // 현재 시간
        let timeSinceLastSkillUse = currentTime - Skill01UseTime; // 마지막 스킬 사용 후 경과 시간
        if (timeSinceLastSkillUse >= skillCoolTime01) {
            A_KeyPressed = true;
            Skill01UseTime = currentTime; // 마지막 스킬 사용 시간 업데이트
            // 스킬 이미지 위치 설정 (사용자 위치)
            skillImage01 = document.createElement('img');
            skillImage01.style.position = 'absolute';
            skillImage01.style.width = '100px'; // 스킬 이미지 크기 설정
            skillImage01.style.height = '40px'; // 스킬 이미지 크기 설정
            skillImage01.style.left = walkImg.offsetLeft + 'px';
            skillImage01.style.top = walkImg.offsetTop + 'px';
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
            startCoolTime01();
            // 애니메이션이 끝나면 skillAnimationEnd 함수 실행
            skillImage01.addEventListener('animationend', skill01AnimationEnd);
        }
    }
});
document.addEventListener('keyup', (event) => {
    if (event.key === 'a') {
        A_KeyPressed = false;
    } 
});
// 키 입력 이벤트 핸들러 수정
document.addEventListener('keydown', (event) => {
    if (event.key === 's') {
        const currentTime = Date.now();
        let timeSinceLastSkillUse = currentTime - Skill02UseTime;

        if (timeSinceLastSkillUse >= skillCoolTime02) {
            S_KeyPressed = true;
            Skill02UseTime = currentTime;
            useSkill02(); // 스킬 사용 함수 호출
            startCoolTime02();
        }
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 's') {
        S_KeyPressed = false;
    } 
});
function useSkill02() { // 스킬 사용 함수
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

    skillImage02.style.left = (walkImg.offsetLeft - 100) + 'px'; // 이펙트 위치 조정
    skillImage02.style.top = (walkImg.offsetTop - 100) + 'px'; // 이펙트 위치 조정
    skillImage02.style.width = (100 * 2) + 'px'; // 스킬 범위에 맞게 조정
    skillImage02.style.height = (100 * 2) + 'px'; // 스킬 범위에 맞게 조정
    // 몬스터 데미지 초기화
    for (let i = 0; i < monsters.length; i++) {
        monsters[i].skill02DamageApplied = false; // 데미지 적용 여부 초기화
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
        };

        // 몬스터 컨테이너에 몬스터와 체력바 추가
        monsterContainer.appendChild(healthBar);
        monsterContainer.appendChild(monster);
        space.appendChild(monsterContainer);
        monsters.push(monsterData);
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
                monster.health -= 30; // 데미지 적용
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
function startCoolTime01() {
    let startTime = Date.now();
    let animationFrameId01;

    function updateCoolTimeCircle() {
        const elapsedTime = Date.now() - startTime;
        let angle = Math.min((elapsedTime / 11000) * 360, 360); // 0 ~ 360
        skillCoolTimeCircle01.style.background = `conic-gradient(blue 0%, blue ${angle}%, transparent ${angle}%, transparent 100%)`;

        if (angle < 360) {
            animationFrameId01 = requestAnimationFrame(updateCoolTimeCircle);
        } else {
            // 쿨타임 완료 시점 보정
            skillCoolTimeCircle01.style.background = `conic-gradient(blue 0%, blue 360%, transparent 360%, transparent 100%)`;
        }
    }
    animationFrameId01 = requestAnimationFrame(updateCoolTimeCircle);
}
// 쿨타임 시작 함수
function startCoolTime02() {
    let startTime = Date.now();
    let animationFrameId02;

    function updateCoolTimeCircle() {
        const elapsedTime = Date.now() - startTime;
        let angle = Math.min((elapsedTime / 22000) * 360, 360); // 0 ~ 360

        skillCoolTimeCircle02.style.background = `conic-gradient(blue 0%, blue ${angle}%, transparent ${angle}%, transparent 100%)`;

        if (angle < 360) {
            animationFrameId02 = requestAnimationFrame(updateCoolTimeCircle);
        } else {
            // 쿨타임 완료 시점 보정
            skillCoolTimeCircle02.style.background = `conic-gradient(blue 0%, blue 360%, transparent 360%, transparent 100%)`;
        }
    }
    animationFrameId02 = requestAnimationFrame(updateCoolTimeCircle);
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

// 에니메이션 시작
attackAnimate();
animate(); 