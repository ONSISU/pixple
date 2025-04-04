const urlParams = new URLSearchParams(window.location.search);
const value = urlParams.get('data');
if(value == 1){
    walkImg.style.position = 'absolute';
walkImg.style.top = '102px';
walkImg.style.left = '530px';
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
        if(imgRect.top == 106 || imgRect.bottom == 160) {
            goDoorUpDown = true
        }else {
            goDoorUpDown = false
        }
        if(imgRect.right == 640) {
            goDoorRight = true
        }else {
            goDoorRight = false
        }

        if(goDoorUpDown && goDoorRight) {
            goPage = 2;
            window.location.href = `secondRoom.html?data=${encodeURIComponent(goPage)}`;

        }
    requestAnimationFrame(update);
}
update(); // 애니메이션 시작
