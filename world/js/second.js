const urlParams = new URLSearchParams(window.location.search);
const value = urlParams.get('data');
let goDoorLR1 = false;
let goDoorUD1 = false;
let goDoorLR3 = false;
let goDoorUD3 = false;
let goPage = 0;
let maxMonsters = 5; // 최대 몬스터 수

if (urlParams.get('name')) {
    const 캐릭명 = urlParams.get('name');
    walkImg.src = `../img/${캐릭명}`;
}

if(value == 12){
    walkImg.style.position = 'absolute';
    walkImg.style.top = '50px';
    walkImg.style.left = '50px';
}else if (value == 32){
    walkImg.style.position = 'absolute';
    walkImg.style.top = '448px';
    walkImg.style.left = '284px';
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
    if( 90 <= imgRect.top && imgRect.top <= 112) {
        goDoorUD1 = true;
    }else {
        goDoorUD1 = false;
    }
    if(imgRect.left <= 5) {
        goDoorLR1 = true;
    } else {
        goDoorLR1 = false;
    }
    if( 364 <= imgRect.left && imgRect.left <= 388){
        goDoorLR3 = true;
    }else {
        goDoorLR3 = false;
    }
    if(imgRect.bottom >= 532) {
        goDoorUD3 = true;
    } else {
        goDoorUD3 = false;
    }
    if(goDoorUD1 && goDoorLR1) {
        goPage = 21;
        window.location.href = `First.html?data=${encodeURIComponent(goPage)}&name=${urlParams.get('name')}`;
    }
    if(goDoorUD3 && goDoorLR3) {
        goPage = 23;
        window.location.href = `Third.html?data=${encodeURIComponent(goPage)}&name=${urlParams.get('name')}`;
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

animate();
update();