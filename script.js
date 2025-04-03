// const space = document.querySelector('.space');
// const walkImg = document.getElementById('walkImg');
// const moveSpeed = 15; // 이동 속도
// // let currentDirection = 'down'; // 초기 방향

// // 스프라이트 시트 위치 정보 (각 방향에 따른 프레임 위치)
// // const spritePositions = {
// //   up: '0px 96px',
// //   down: '0px 0px',
// //   left: '0px 32px',
// //   right: '0px 64px'
// // };

// // 키 입력 이벤트 처리
// document.addEventListener('keydown', (event) => {
//   // let newX = character.offsetLeft;
//   // let newY = character.offsetTop;

//   // switch (event.key) {
//   //   case 'ArrowUp':
//   //     newY -= moveSpeed;
//   //     currentDirection = 'up';
//   //     break;
//   //   case 'ArrowDown':
//   //     newY += moveSpeed;
//   //     currentDirection = 'down';
//   //     break;
//   //   case 'ArrowLeft':
//   //     newX -= moveSpeed;
//   //     currentDirection = 'left';
//   //     break;
//   //   case 'ArrowRight':
//   //     newX += moveSpeed;
//   //     currentDirection = 'right';
//   //     break;
//   // }

//   const rect = space.getBoundingClientRect();
//   let top = walkImg.offsetTop;
//   let left = walkImg.offsetLeft;

//   switch (event.key) {
//       case 'ArrowUp':
//           if (top > 0) {
//               walkImg.style.top = `${top - moveSpeed}px`;
//           }
//           break;
//       case 'ArrowDown':
//           if (top < rect.height - walkImg.offsetHeight) {
//               walkImg.style.top = `${top + moveSpeed}px`;
//           }
//           break;
//       case 'ArrowLeft':
//           if (left > 0) {
//               walkImg.style.left = `${left - moveSpeed}px`;
//           }
//           break;
//       case 'ArrowRight':
//           if (left < rect.width - walkImg.offsetWidth) {
//               walkImg.style.left = `${left + moveSpeed}px`;
//           }
//           break;
//   }
//   // 화면 경계 검사 (선택 사항)
//   // const maxX = space.clientWidth - walkImg.offsetWidth;
//   // const maxY = space.clientHeight - walkImg.offsetHeight;

//   // newX = Math.max(0, Math.min(newX, maxX)); // X 좌표 제한
//   // newY = Math.max(0, Math.min(newY, maxY)); // Y 좌표 제한

//   // // 캐릭터 위치 업데이트
//   // walkImg.style.left = newX + 'px';
//   // walkImg.style.top = newY + 'px';

//   // // 스프라이트 시트 위치 업데이트
//   // walkImg.style.backgroundPosition = spritePositions[currentDirection];
// });
let walkImg = document.getElementById('walkImg');
let space = document.querySelector('.space');
let moveSpeed = 2; // 이동 속도
let keys = {};

document.addEventListener('keydown', (event) => {
    keys[event.key] = true;
});

document.addEventListener('keyup', (event) => {
    keys[event.key] = false;
});

function update() {
    const rect = space.getBoundingClientRect();
    let top = walkImg.offsetTop;
    let left = walkImg.offsetLeft;

    if (keys['ArrowUp'] && top > 0) {
      walkImg.style.top = `${Math.max(0, top - moveSpeed)}px`;
  }
  if (keys['ArrowDown'] && top < rect.height - walkImg.offsetHeight) {
    walkImg.style.top = `${Math.min(rect.height - walkImg.offsetHeight, top + moveSpeed)}px`;
  }
  if (keys['ArrowLeft'] && left > 0) {
    walkImg.style.left = `${Math.max(0, left - moveSpeed)}px`;
  }
  if (keys['ArrowRight'] && left < rect.width - walkImg.offsetWidth) {
    walkImg.style.left = `${Math.min(rect.width - walkImg.offsetWidth, left + moveSpeed)}px`;
  }
    requestAnimationFrame(update);
}

update(); // 애니메이션 시작