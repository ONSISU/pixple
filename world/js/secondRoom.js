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
    changeMovingImageDirection();
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
    if( 90 <= imgRect.top && imgRect.top <= 112  || 144 <= imgRect.bottom && imgRect.bottom <= 166) {
        goDoorUpDown = true;
    } else {
        goDoorUpDown = false;
    }
    if(imgRect.left <= 5) {
        goDoorRight = true;
    } else {
        goDoorRight = false;
    }

    if(goDoorUpDown && goDoorRight) {
        goPage = 1;
        window.location.href = `First.html?data=${encodeURIComponent(goPage)}&name=${urlParams.get('name')}`;
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
    walkImg.style.opacity = `0.5`;
    console.log("닿음");
    walkImgMoving = false;
    setTimeout(() => {
        walkImg.style.opacity = `1`;
        walkImgMoving = true;
    }, 1000);
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