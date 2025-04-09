const urlParams = new URLSearchParams(window.location.search);
const value = urlParams.get('data');
const maxMonsters = 1; // 최대 몬스터 수

if (urlParams.get('name')) {
    const 캐릭명 = urlParams.get('name');
    walkImg.src = `../img/${캐릭명}`;
}

if(value == 1){
    walkImg.style.top = '102px';
    walkImg.style.left = '530px';
}else {
    walkImg.style.top = '53px';
}

function update() {
    const rect = space.getBoundingClientRect();
    let top = walkImg.offsetTop;
    let left = walkImg.offsetLeft;
    
    const imgRect = {
    top: top,
    left: left,
    right: left + walkImg.offsetWidth,
    bottom: top + walkImg.offsetHeight
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
            {top: top - moveSpeed, left: left, right: left + walkImg.offsetWidth, bottom: top + walkImg.offsetHeight - moveSpeed},
            wallRect
        )) {
            canMoveUp = false;
        }
        if (isColliding(
            {top: top + moveSpeed, left: left, right: left + walkImg.offsetWidth, bottom: top + walkImg.offsetHeight + moveSpeed},
            wallRect
        )) {
            canMoveDown = false;
        }
        if (isColliding(
            {top: top, left: left - moveSpeed, right: left + walkImg.offsetWidth - moveSpeed, bottom: top + walkImg.offsetHeight},
            wallRect
        )) {
            canMoveLeft = false;
        }
        if (isColliding(
            {top: top, left: left + moveSpeed, right: left + walkImg.offsetWidth + moveSpeed, bottom: top + walkImg.offsetHeight},
            wallRect
        )) {
            canMoveRight = false;
        }
    });
    
    if (keys['ArrowUp'] && top > 0 && canMoveUp) {
        walkImg.style.top = `${Math.max(0, top - moveSpeed)}px`;
    }
    if (keys['ArrowDown'] && top < rect.height - walkImg.offsetHeight && canMoveDown) {
        walkImg.style.top = `${Math.min(rect.height - walkImg.offsetHeight, top + moveSpeed)}px`;
    }
    if (keys['ArrowLeft'] && left > 0 && canMoveLeft) {
        walkImg.style.left = `${Math.max(0, left - moveSpeed)}px`;
    }
    if (keys['ArrowRight'] && left < rect.width - walkImg.offsetWidth && canMoveRight) {
        walkImg.style.left = `${Math.min(rect.width - walkImg.offsetWidth, left + moveSpeed)}px`;
    }

    if( 90 <= imgRect.top && imgRect.top <= 110  || 144 <= imgRect.bottom && imgRect.bottom <= 164) {
        goDoorUpDown = true;
    } else {
        goDoorUpDown = false;
    }
    if(imgRect.right >= 630) {
        goDoorRight = true;
    } else {
        goDoorRight = false;
    }
    if(goDoorUpDown && goDoorRight) {
        goPage = 2;
        setTimeout(() => {
            window.location.href = `SecondRoom.html?data=${encodeURIComponent(goPage)}&name=${urlParams.get('name')}`;
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
            health: 100, // 초기 체력
            lastAttacked: 0 // 마지막 공격 시간 초기화
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
                    monster.health -= 20; // 예시: 10 데미지
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

// 에니메이션 시작
update();
attackAnimate();
animate(); 