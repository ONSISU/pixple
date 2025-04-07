let walkImg = document.getElementById('walkImg');
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

const monster = document.getElementById('monster');
var xVal = 0;
var yVal = 0;
var speed = 0.3; // 속도 변경
var angle = Math.random() * 2 * Math.PI;
var changeAngleProbability = 0.005; // 각도 변경 확률 (낮출수록 직선에 가깝게 움직임)
let walkImgMoving = true; // walkImg 움직임 제어 변수

document.addEventListener('keydown', (event) => {
    keys[event.key] = true;
});

document.addEventListener('keyup', (event) => {
    keys[event.key] = false;
});

function isColliding(rect1, rect2) {
    return !(rect1.right < rect2.left || 
        rect1.left > rect2.right || 
        rect1.bottom < rect2.top || 
        rect1.top > rect2.bottom);
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

// 애니메이션 루프
function animate1() {
    if (isCtrlPressed) {
        if(ArrowLeftPressed){
            walkImg.style.transform = `translate(-5px, -3px)`;
        }else {
            walkImg.style.transform = `translate(5px, -3px)`;
        }
    } else {
        // 원래 위치로 되돌리기
        walkImg.style.transform = `translate(0, 0)`;
    }
    requestAnimationFrame(animate1);
}

// 애니메이션 시작
animate1();