const container = document.querySelector('.space');
const character = document.getElementById('walkImg');
const moveSpeed = 10; // 이동 속도
let currentDirection = 'down'; // 초기 방향

// 스프라이트 시트 위치 정보 (각 방향에 따른 프레임 위치)
const spritePositions = {
  up: '0px 96px',
  down: '0px 0px',
  left: '0px 32px',
  right: '0px 64px'
};

// 키 입력 이벤트 처리
document.addEventListener('keydown', function(event) {
  let newX = character.offsetLeft;
  let newY = character.offsetTop;

  switch (event.key) {
    case 'ArrowUp':
      newY -= moveSpeed;
      currentDirection = 'up';
      break;
    case 'ArrowDown':
      newY += moveSpeed;
      currentDirection = 'down';
      break;
    case 'ArrowLeft':
      newX -= moveSpeed;
      currentDirection = 'left';
      break;
    case 'ArrowRight':
      newX += moveSpeed;
      currentDirection = 'right';
      break;
  }

  // 화면 경계 검사 (선택 사항)
  const maxX = container.clientWidth - character.offsetWidth;
  const maxY = container.clientHeight - character.offsetHeight;

  newX = Math.max(0, Math.min(newX, maxX)); // X 좌표 제한
  newY = Math.max(0, Math.min(newY, maxY)); // Y 좌표 제한

  // 캐릭터 위치 업데이트
  character.style.left = newX + 'px';
  character.style.top = newY + 'px';

  // 스프라이트 시트 위치 업데이트
  character.style.backgroundPosition = spritePositions[currentDirection];
});
