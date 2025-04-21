const urlParams = new URLSearchParams(window.location.search);
const value = urlParams.get('data');
let goDoorLR = false;
let goDoorUD = false;
let goPage = 0;
let maxMonsters = 1; // 최대 몬스터 수

const 캐릭명 = {
    'pix1.png': '곰돌이',
    'pix2.png': '팬더',
    'pix3.png': '호랑이'
}[urlParams.get('name')]

if (urlParams.get('name')) {
    const 캐릭명 = urlParams.get('name');
    walkImg.src = `../img/${캐릭명}`;
}
if (value == 21) {
    walkImg.style.top = '102px';
    walkImg.style.left = '530px';
} else {
    sendToParent({ type: "chat", text: "Enter First", roomName: 'room1', 캐릭터아이디: 캐릭명 });
    walkImg.style.top = '53px';
}

function sendToParent(message) {
    window.parent.postMessage(message, "*"); // "*" allows all origins, or replace with your domain
}

function update(x, y) {
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
            { top: top - moveSpeed, left: left, right: left + walkImg.offsetWidth, bottom: top + walkImg.offsetHeight - moveSpeed },
            wallRect
        )) {
            canMoveUp = false;
        }
        if (isColliding(
            { top: top + moveSpeed, left: left, right: left + walkImg.offsetWidth, bottom: top + walkImg.offsetHeight + moveSpeed },
            wallRect
        )) {
            canMoveDown = false;
        }
        if (isColliding(
            { top: top, left: left - moveSpeed, right: left + walkImg.offsetWidth - moveSpeed, bottom: top + walkImg.offsetHeight },
            wallRect
        )) {
            canMoveLeft = false;
        }
        if (isColliding(
            { top: top, left: left + moveSpeed, right: left + walkImg.offsetWidth + moveSpeed, bottom: top + walkImg.offsetHeight },
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

        // 좌표 업데이트
        walkImg.dataset.x = walkImg.offsetLeft;  // 또는 left
        walkImg.dataset.y = walkImg.offsetTop;   // 또는 top
   
       //  부모 창에 좌표 전송
       window.parent.postMessage({
           type: "characterPosition",
           x: walkImg.offsetLeft, // 또는 left
           y: walkImg.offsetTop  // 또는 top
       }, "*");
       
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
            window.location.href = `Second.html?data=${encodeURIComponent(goPage)}&name=${urlParams.get('name')}`;
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

// // 애니메이션 시작
animate();
update();

