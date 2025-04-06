const urlParams = new URLSearchParams(window.location.search);
const value = urlParams.get('data');

if (urlParams.get('name')) {
    const 캐릭명 = urlParams.get('name');
    walkImg.src = `../img/${캐릭명}`;
}

if(value == 2){
    walkImg.style.position = 'absolute';
    walkImg.style.top = '50px';
    walkImg.style.left = '50px';
}
function update() {
    const rect = space.getBoundingClientRect();
    let top = walkImg.offsetTop;
    let left = walkImg.offsetLeft;

    // 현재 이미지의 경계 사각형
    const imgRect = {
        top: top,
        left: left,
        right: left + walkImg.offsetWidth,
        bottom: top + walkImg.offsetHeight
    };
    // 벽들에 대한 충돌 검사
    let canMove = true;
    // console.log('top-----' + imgRect.top);
    // console.log('left-----' + imgRect.left);
    // console.log('right-----' + imgRect.right);
    // console.log('bottom-----' + imgRect.bottom);

    if (keys['ArrowUp'] && top > 0) {
        let newTop = Math.max(0, top - moveSpeed);
        imgRect.top = newTop;
        imgRect.bottom = newTop + walkImg.offsetHeight;
        walls.forEach(wall => {
            const wallRect = {
                top: wall.offsetTop,
                left: wall.offsetLeft,
                right: wall.offsetLeft + wall.offsetWidth,
                bottom: wall.offsetTop + wall.offsetHeight
            };
            if (isColliding(imgRect, wallRect)) {
                canMove = false; // 충돌 시 이동 불가
            }
        });
        if (canMove) {
            walkImg.style.top = `${newTop}px`;
        }
    }

    canMove = true; // 이동 가능 상태 초기화
    if (keys['ArrowDown'] && top < rect.height - walkImg.offsetHeight) {
        let newTop = Math.min(rect.height - walkImg.offsetHeight, top + moveSpeed);
        imgRect.top = newTop;
        imgRect.bottom = newTop + walkImg.offsetHeight;
        walls.forEach(wall => {
            const wallRect = {
                top: wall.offsetTop,
                left: wall.offsetLeft,
                right: wall.offsetLeft + wall.offsetWidth,
                bottom: wall.offsetTop + wall.offsetHeight
            };
            if (isColliding(imgRect, wallRect)) {
                canMove = false; // 충돌 시 이동 불가
            }
        });
        if (canMove) {
            walkImg.style.top = `${newTop}px`;
        }
    }

    canMove = true; // 이동 가능 상태 초기화
    if (keys['ArrowLeft'] && left > 0) {
        let newLeft = Math.max(0, left - moveSpeed);
        imgRect.left = newLeft;
        imgRect.right = newLeft + walkImg.offsetWidth;
        walls.forEach(wall => {
            const wallRect = {
                top: wall.offsetTop,
                left: wall.offsetLeft,
                right: wall.offsetLeft + wall.offsetWidth,
                bottom: wall.offsetTop + wall.offsetHeight
            };
            if (isColliding(imgRect, wallRect)) {
                canMove = false; // 충돌 시 이동 불가
            }
        });
        if (canMove) {
            walkImg.style.left = `${newLeft}px`;
        }
    }

    canMove = true; // 이동 가능 상태 초기화
    if (keys['ArrowRight'] && left < rect.width - walkImg.offsetWidth) {
        let newLeft = Math.min(rect.width - walkImg.offsetWidth, left + moveSpeed);
        imgRect.left = newLeft;
        imgRect.right = newLeft + walkImg.offsetWidth;
        walls.forEach(wall => {
            const wallRect = {
                top: wall.offsetTop,
                left: wall.offsetLeft,
                right: wall.offsetLeft + wall.offsetWidth,
                bottom: wall.offsetTop + wall.offsetHeight
            };
            if (isColliding(imgRect, wallRect)) {
                canMove = false; // 충돌 시 이동 불가
            }
        });
        if (canMove) {
            walkImg.style.left = `${newLeft}px`;
        }
    }
        if(imgRect.top == 102 || imgRect.bottom == 156) {
            goDoorUpDown = true;
        }else {
            goDoorUpDown = false;
        }
        if(imgRect.left == 0) {
            goDoorLeft = true;
        }else {
            goDoorLeft = false;
        }
        if(goDoorUpDown && goDoorLeft) {
            goPage = 1
            setTimeout(() => {
                window.location.href = `First.html?data=${encodeURIComponent(goPage)}`;
            }, 500);
        }
    requestAnimationFrame(update);
}
update(); // 애니메이션 시작
