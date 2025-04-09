const urlParams = new URLSearchParams(window.location.search);
const value = urlParams.get('data');

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
// // 애니메이션 시작
update();