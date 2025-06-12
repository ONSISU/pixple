let direction = 'ArrowUp';
let movingSize = 5;
let isMoving = false;
const 처리할리스트 = ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'];

const 움직이기 = () => {
  const ele = document.querySelector(`[pk="${window.myId}"]`);

  if (!isMoving) return;

  let param = { x: '', y: window[window.myId].position.y };

  switch (direction) {
    case 'ArrowLeft':
      // ele.style.left = ele.getBoundingClientRect().left - movingSize + 'px';
      param.x = ele.getBoundingClientRect().left - movingSize;
      break;
    case 'ArrowRight':
      // ele.style.left = ele.getBoundingClientRect().left + movingSize + 'px';
      param.x = ele.getBoundingClientRect().left + movingSize;
      break;
    case 'ArrowUp':
      // ele.style.top = ele.getBoundingClientRect().top - movingSize + 'px';
      param.y = ele.getBoundingClientRect().top - movingSize;
      break;
    case 'ArrowDown':
      // ele.style.top = ele.getBoundingClientRect().top + movingSize + 'px';
      param.y = ele.getBoundingClientRect().top + movingSize;
      break;
  }

  window[window.myId].position = {
    ...param,
  };

  stompClient.send('/app/greetings', {}, JSON.stringify(window[window.myId]));

  requestAnimationFrame(움직이기);
};

const 좌표전송 = (target) => {
  document.querySelector(`[pk="${window.myId}"]`);
};

const 좌표처리 = (id) => {
  // const X좌표 = window[id].position.x + 'px' || '0px';
  // const Y좌표 = window[id].position.y + 'px' || '0px';

  let div = '';

  const element = document.querySelector(`[pk="${id}"]`);

  if (!element) {
    console.log('no element ', window[id].position);
    div = document.createElement('div');
    div.setAttribute('pk', id);
    div.classList.add('person');
    div.style.position = 'absolute';

    div.style.left = window[id].position.x + 'px';
    div.style.top = window[id].position.y + 'px';

    peopleArea.appendChild(div);
  } else {
    element.style.top = window[id].position.y + 'px';
    element.style.left = window[id].position.x + 'px';
  }
};

const 접속시연결 = () => {
  //1: ✅ Connect Chatting Socket
  stompClient.connect({}, (frame) => {
    stompClient.subscribe('/topic/greetings', (message) => {
      console.log('✅ 요청옴 .... ', message);
      // ✅ Receive Message when sending by '/app/hello'
      // ⚠️ This Area Should be using only for the make Character

      const body = JSON.parse(message.body);

      if (!window[body.id]) {
        window[body.id] = {
          id: body.id,
          charater: body.charater,
          position: body.position,
          isMine: body.id === window.myId,
        };
      } else {
        window[body.id] = {
          id: body.id,
          charater: body.charater,
          position: body.position,
          isMine: body.id === window.myId,
        };
      }

      좌표처리(body.id);
    });
  });
};

const 최초접속시회원정보보내기 = () => {
  let num = ~~(Math.random() * 100);
  let charater = num % 2 == 0 ? 'A' : 'B';
  let id = 'id' + num;

  // 📌 For test.
  window.myId = id;
  window.connectedId = [...(window?.connectedId || []), id];

  let position = {
    x: 123,
    y: 444,
  };

  let param = {
    id,
    num,
    charater,
    position,
  };

  stompClient.send('/app/greetings', {}, JSON.stringify(param));
};

const 메세지이벤트추가 = () => {
  test.addEventListener('click', () => {
    stompClient.send('/app/hello', {}, 'test');
  });
};

const 키보드움직임이벤트추가 = () => {
  document.addEventListener('keydown', (e) => {
    if (처리할리스트.includes(e.key)) {
      direction = e.key;
      if (!isMoving) {
        isMoving = true;
        requestAnimationFrame(움직이기);
      }
    }
  });

  document.addEventListener('keyup', (e) => {
    if (처리할리스트.includes(e.key)) {
      isMoving = false;
    }
  });
};
