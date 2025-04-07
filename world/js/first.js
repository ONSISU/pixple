const urlParams = new URLSearchParams(window.location.search);
const value = urlParams.get('data');
if (urlParams.get('name')) {
    const 캐릭명 = urlParams.get('name');
    walkImg.src = `../img/${캐릭명}`;
}

if(value == 1){
    walkImg.style.position = 'absolute';
    walkImg.style.top = '102px';
    walkImg.style.left = '530px';
}
// function update() {
//     const rect = space.getBoundingClientRect();
//     let top = walkImg.offsetTop;
//     let left = walkImg.offsetLeft;

//     // 현재 이미지의 경계 사각형
//     const imgRect = {
//         top: top,
//         left: left,
//         right: left + walkImg.offsetWidth,
//         bottom: top + walkImg.offsetHeight
//     };
//     // 벽들에 대한 충돌 검사
//     let canMove = true;
//     // console.log('top-----' + imgRect.top);
//     // console.log('left-----' + imgRect.left);
//     // console.log('right-----' + imgRect.right);
//     // console.log('bottom-----' + imgRect.bottom);

//     if (keys['ArrowUp'] && top > 0) {
//         let newTop = Math.max(0, top - moveSpeed);
//         imgRect.top = newTop;
//         imgRect.bottom = newTop + walkImg.offsetHeight;
//         walls.forEach(wall => {
//             const wallRect = {
//                 top: wall.offsetTop,
//                 left: wall.offsetLeft,
//                 right: wall.offsetLeft + wall.offsetWidth,
//                 bottom: wall.offsetTop + wall.offsetHeight
//             };
//             if (isColliding(imgRect, wallRect)) {
//                 canMove = false; // 충돌 시 이동 불가
//             }
//         });
//         if (canMove) {
//             walkImg.style.top = `${newTop}px`;
//         }
//     }

//     canMove = true; // 이동 가능 상태 초기화
//     if (keys['ArrowDown'] && top < rect.height - walkImg.offsetHeight) {
//         let newTop = Math.min(rect.height - walkImg.offsetHeight, top + moveSpeed);
//         imgRect.top = newTop;
//         imgRect.bottom = newTop + walkImg.offsetHeight;
//         walls.forEach(wall => {
//             const wallRect = {
//                 top: wall.offsetTop,
//                 left: wall.offsetLeft,
//                 right: wall.offsetLeft + wall.offsetWidth,
//                 bottom: wall.offsetTop + wall.offsetHeight
//             };
//             if (isColliding(imgRect, wallRect)) {
//                 canMove = false; // 충돌 시 이동 불가
//             }
//         });
//         if (canMove) {
//             walkImg.style.top = `${newTop}px`;
//         }
//     }

//     canMove = true; // 이동 가능 상태 초기화
//     if (keys['ArrowLeft'] && left > 0) {
//         let newLeft = Math.max(0, left - moveSpeed);
//         imgRect.left = newLeft;
//         imgRect.right = newLeft + walkImg.offsetWidth;
//         walls.forEach(wall => {
//             const wallRect = {
//                 top: wall.offsetTop,
//                 left: wall.offsetLeft,
//                 right: wall.offsetLeft + wall.offsetWidth,
//                 bottom: wall.offsetTop + wall.offsetHeight
//             };
//             if (isColliding(imgRect, wallRect)) {
//                 canMove = false; // 충돌 시 이동 불가
//             }
//         });
//         if (canMove) {
//             walkImg.style.left = `${newLeft}px`;
//         }
//     }

//     canMove = true; // 이동 가능 상태 초기화
//     if (keys['ArrowRight'] && left < rect.width - walkImg.offsetWidth) {
//         let newLeft = Math.min(rect.width - walkImg.offsetWidth, left + moveSpeed);
//         imgRect.left = newLeft;
//         imgRect.right = newLeft + walkImg.offsetWidth;
//         walls.forEach(wall => {
//             const wallRect = {
//                 top: wall.offsetTop,
//                 left: wall.offsetLeft,
//                 right: wall.offsetLeft + wall.offsetWidth,
//                 bottom: wall.offsetTop + wall.offsetHeight
//             };
//             if (isColliding(imgRect, wallRect)) {
//                 canMove = false; // 충돌 시 이동 불가
//             }
//         });
//         if (canMove) {
//             walkImg.style.left = `${newLeft}px`;
//         }
//     }
//         if( 90 <= imgRect.top <= 110  || 144 <= imgRect.bottom <= 164) {
//             goDoorUpDown = true;
//         }else {
//             goDoorUpDown = false;
//         }
//         if(imgRect.right >= 630) {
//             goDoorRight = true;
//         }else {
//             goDoorRight = false;
//         }

//         if(goDoorUpDown && goDoorRight) {
//             goPage = 2;
//             setTimeout(() => {
//                 window.location.href = `SecondRoom.html?data=${encodeURIComponent(goPage)}&name=${urlParams.get('name')}`;
//             }, 500);
//         }
//     requestAnimationFrame(update);
// }

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
    
      // 움직일 이미지와의 충돌 검사
  const movingImgRect = {
    top: monster.offsetTop,
    left: monster.offsetLeft,
    right: monster.offsetLeft + monster.offsetWidth,
    bottom: monster.offsetTop + monster.offsetHeight
  };

  if (isColliding(imgRect, movingImgRect)) {
    console.log("충돌 발생!"); 
    // 충돌 시 움직일 이미지 방향 바꾸기
    changeMovingImageDirection();

    // walkImg 멈추기
    stopWalkImg();

  }

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

function changeMovingImageDirection() {
    const moveDistance = 10; // 움직일 거리
    const directionX = Math.random() > 0.5 ? 1 : -1; // 랜덤 방향
    const directionY = Math.random() > 0.5 ? 1 : -1;

    monster.style.left = `${monster.offsetLeft + moveDistance * directionX}px`;
    monster.style.top = `${monster.offsetTop + moveDistance * directionY}px`;

    // 움직이는 범위 제한 (선택 사항)
    const containerRect = space.getBoundingClientRect();
    if (monster.offsetLeft < 0) monster.style.left = '0px';
    if (monster.offsetTop < 0) monster.style.top = '0px';
    if (monster.offsetLeft + monster.offsetWidth > containerRect.width) {
        monster.style.left = `${containerRect.width - monster.offsetWidth}px`;
    }
    if (monster.offsetTop + monster.offsetHeight > containerRect.height) {
        monster.style.top = `${containerRect.height - monster.offsetHeight}px`;
    }
}

function stopWalkImg() {
    walkImg.style.transform = `translate(-5px, -3px)`;
    console.log("닿음");
    walkImgMoving = false;
    setTimeout(() => {
        walkImgMoving = true;
    }, 2000);
}

function animate() {
    // x, y 좌표 업데이트
    xVal += speed * Math.cos(angle);
    yVal += speed * Math.sin(angle);

    // 각도 변경 (매우 낮은 확률로)
    if (Math.random() < changeAngleProbability) {
        angle = Math.random() * 2 * Math.PI;
    }

    // 경계 확인 (container 안에서만 움직이도록)
    if (xVal < 0) {
        xVal = 0;
        angle = Math.random() * 2 * Math.PI;
    } else if (xVal + monster.width > space.offsetWidth) {
        xVal = space.offsetWidth - monster.width;
        angle = Math.random() * 2 * Math.PI;
    }

    if (yVal < 0) {
        yVal = 0;
        angle = Math.random() * 2 * Math.PI;
    } else if (yVal + monster.height > space.offsetHeight) {
        yVal = space.offsetHeight - monster.height;
        angle = Math.random() * 2 * Math.PI;
    }

    monster.style.left = xVal + 'px';
    monster.style.top = yVal + 'px';

    requestAnimationFrame(animate);
}
update();
animate(); 
