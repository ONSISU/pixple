const local = "http://localhost:8085";
const prod_url = "http://tomhoon.duckdns.org:18085";

// const urlParams = new URLSearchParams(window.location.search);
// const value = urlParams.get('data');

// ⭐️ URL변경 여기만 하면 전부 적용됨
sessionStorage.setItem("url", local);
const UserIdVal = localStorage.getItem('userId');

const MESSAGE = document.getElementById("message");
const CHATAREA = document.querySelector("#chat");
const SEND = document.querySelector("#send");
const gameFrame = document.getElementById('gameFrame');
const gameArea = document.querySelector('.game-area');
// const space = document.querySelector(".space");

let iframeWindow = null; // iframe의 window 객체 참조
let 캐릭명2 = null; 

let characterX = 0; // 자신의 캐릭터 초기 x 좌표
let characterY = 0; // 자신의 캐릭터 초기 y 좌표
let userCount = 0;
let walkImg = document.querySelector('.walkImg');
let userName = null;
// let space = document.querySelector('.space');
// let moveSpeed = 2; // 이동 속도
// let keys = {};
// let walls = document.querySelectorAll('.wall');

let isShiftPressed = false; // 쉬프트트키가 눌렸는지 여부
let ArrowLeftPressed = false; // 좌우 중 어느 방향키 눌렀는지 여부

let A_KeyPressed = false; // a키(스킬1)가 눌렸는지 여부
let S_KeyPressed = false; // s키(스킬2)가 눌렸는지 여부
let D_KeyPressed = false; // d키(스킬3)가 눌렸는지 여부
let skillImage01 = null; 
let skillImage02 = null;
let skillImage03 = null; 
let Skill01UseTime = 0; // 마지막 스킬 사용 시간
let Skill02UseTime = 0;
let Skill03UseTime = 0;
let skillCoolTime01 = 3000; // 쿨타임
let skillCoolTime02 = 6000; 
let skillCoolTime03 = 15000; 

const hitEffectImage = document.querySelector('.hitEffectImage');
// 쿨타임 게이지 요소 가져오기
const skillCoolTimeCircle01 = document.querySelector('.skill01-coolTime-circle');
const skillCoolTimeCircle02 = document.querySelector('.skill02-coolTime-circle');
const skillCoolTimeCircle03 = document.querySelector('.skill03-coolTime-circle');
const skill01Image = document.querySelector('.skill01-image');
const skill01Content = document.querySelector('.skill01-content');
const skill02Image = document.querySelector('.skill02-image');
const skill02Content = document.querySelector('.skill02-content');
const skill03Image = document.querySelector('.skill03-image');
const skill03Content = document.querySelector('.skill03-content');

// if (urlParams.get('name')) {
//     const 캐릭명 = urlParams.get('name');
//     walkImg.src = `../img/${캐릭명}`;
// }


gameFrame.onload = function() {
    iframeWindow = gameFrame.contentWindow;
    console.log("iframe 로드 완료, iframeWindow 객체 얻음");

    // iframe 로드 완료 후 STOMP 연결 및 메시지 구독을 시작하는 것이 안전할 수 있습니다.
    // 아니면 iframe에서 부모에게 'ready' 메시지를 보내면 그때 시작하도록 해도 좋습니다.
    // 현재 예시에서는 iframe 로드 완료 후 STOMP 연결 및 구독 로직이 이미 실행되었다고 가정합니다.
};


function generateUniqueId() {
    return Math.random().toString(36).substring(2, 15);
}



MESSAGE.addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
        const val = e.target.value;

        if (!val) return;

        document.querySelector("#send").click();
    }
});

window.addEventListener("message", (event) => {
    const data = event.data;
    const { type } = data;
    if (data.action === 'loginSuccess') {
        gameArea.style.display = 'block';
        캐릭명2 = data.name;
        console.log('캐릭명2 - ' + 캐릭명2);
        connect();
    }

    // if (event.data.type === "characterPosition") {
    //     const x = event.data.x;
    //     const y = event.data.y;
    //     // console.log("캐릭터 위치:", x, y);
    //     // TODO:  좌표를 사용하여 다른 작업 수행 (예: 캐릭터 위치 업데이트)
    // }
//     if (type === "chat") {
//         // Send message to WebSocket server
//         let socket = new SockJS(`${sessionStorage.getItem("url")}/chat`); // Connect to the /ws WebSocket endpoint
//         let stompClient = Stomp.over(socket); // Use STOMP over the WebSocket connection
//         // if(userName === "pix1.png") {
//         //     캐릭터아이디 = '곰돌이';
//         // }else if(userName === 'pix2.png') {
//         //     캐릭터아이디 = '팬더';
//         // }else {
//         //     캐릭터아이디 = '호랑이'
//         // }

//         stompClient.connect({ userId: UserIdVal }, function (frame) {
//             // ✅ 연결1: 방연결
//             stompClient.subscribe(`/topic/room1`, function (message) {
//                 CHATAREA.innerHTML += transferSocketData(message);
//                 CHATAREA.scrollTo(0, CHATAREA.scrollHeight);
//             });
//             // ✅ 연결2: 유저 연결상태
//             stompClient.subscribe("/topic/status", (msg) => {
//                 CHATAREA.innerHTML += transferSocketData(msg);
//                 CHATAREA.scrollTo(0, CHATAREA.scrollHeight);
//             });
//             const chatMessage = {
//                 sender: UserIdVal,
//                 roomName: "status",
//                 content: `${UserIdVal}님이 입장하셨습니다.`,
//             };
//             console.log('chatMessage - ' + chatMessage);
//             stompClient.send("/app/send", {}, JSON.stringify(chatMessage));
//         });
        
//         // 함수: 메세지 전송
//         const sendMsg = () => {
//             const chatMessage = {
//                 sender: UserIdVal,
//                 roomName: "room1",
//                 content: MESSAGE.value,
//             };

//             stompClient.send("/app/send", {}, JSON.stringify(chatMessage));

//             MESSAGE.value = "";
//             CHATAREA.scrollTo(0, CHATAREA.scrollHeight);
//         };

//         document.getElementById("send").onclick = function () {
//             if (MESSAGE.value === '') {
//                 return false;
//             }
//             sendMsg();
//         };
//         // 함수: 메세지 파싱
//         const transferSocketData = (message) => {
//             const fixedStr = message.body.replace(/(\w+):(\w+)/g, '"$1":"$2"'); // Add quotes
//             const obj = JSON.parse(fixedStr);

//             if (obj.roomName == "status") {
//                 return "<p class='chatMessage'>" + `${obj.message}` + "</p>";
//             }

//             return "<p class='chatMessage'>" + `${obj.sender}: ${obj.message}` + "</p>"; 
//         };
        
//     }
});

function connect() {
    let socket = new SockJS(`${sessionStorage.getItem("url")}/chat`); // Connect to the /ws WebSocket endpoint
    let stompClient = Stomp.over(socket); 

    // STOMP 연결 시도
    stompClient.connect({}, function (frame) {
        // 연결 성공 콜백
    console.log('STOMP Connected11: ' + frame);
    stompClient.subscribe(`/topic/room1`, function (message) {
            CHATAREA.innerHTML += transferSocketData(message);
            CHATAREA.scrollTo(0, CHATAREA.scrollHeight);
        });
    // ✅ 연결2: 유저 연결상태
    stompClient.subscribe("/topic/status", (msg) => {
        CHATAREA.innerHTML += transferSocketData(msg);
        CHATAREA.scrollTo(0, CHATAREA.scrollHeight);
    });

      // '내' 캐릭터 정보 수신 구독 (기존 코드에 postMessage 추가)
    stompClient.subscribe('/user/queue/my-character', function(message) {
        console.log("개인 큐 메시지 수신:", message);
        const data = JSON.parse(message.body);
        console.log("내 캐릭터 정보 수신:", data);
        if (data.type === 'myCharacterCreated' && data.character) {
            myCharacterId = data.character.id;

            console.log("내 캐릭터 ID (STOMP Session ID):", myCharacterId);

            // --- **이 부분이 join 성공 후 처리 로직입니다.** ---
            console.log(`★★★ join 성공! 내 캐릭터 ID: ${myCharacterId} ★★★`);
            // 예: 게임 시작 버튼 활성화, 게임 UI 표시, 다른 플레이어 목록 로딩 등
            // 부모 창으로 'joinSuccessful' 메시지를 보낼 수도 있습니다.
             if (window.parent) {
                 window.parent.postMessage({ type: 'joinSuccessful', characterId: myCharacterId }, '*'); // 부모에게 알림
             }
            // iframe으로 '내 캐릭터 정보' 메시지 전달
            if (iframeWindow) {
                iframeWindow.postMessage(data, '*'); // 실제 운영 환경에서는 '*' 대신 iframe의 origin을 지정해야 합니다.
            }
        }
    });

      // join 성공 상태를 받을 개인 큐 구독
  stompClient.subscribe('/queue/join-status', function(message) {
    const data = JSON.parse(message.body);
    console.log("join 상태 메시지 수신:", data);
    if (data.type === 'joinSuccess') {
        // 서버로부터 join 성공 메시지를 받았습니다!
        console.log(`★★★ join 성공! ${data.message} 내 캐릭터 ID: ${data.characterId} ★★★`);
        // 이 시점에서 내 캐릭터 ID를 저장하거나, 게임 UI를 활성화하는 등의 로직을 수행합니다.
        myCharacterId = data.characterId; // 이 메시지에서도 내 캐릭터 ID를 받을 수 있습니다.

         // 부모 창으로 'joinSuccessful' 메시지를 보낼 수도 있습니다.
         if (window.parent) {
             window.parent.postMessage({ type: 'joinSuccessful', characterId: myCharacterId }, '*'); // 부모에게 알림
         }
         // 또는 iframe 자신에게 joinSuccess 이벤트를 발생시켜 first.js 내부에서 처리
         // window.dispatchEvent(new CustomEvent('joinSuccessful', { detail: data }));

    } else if (data.type === 'joinFailed') { // 만약 서버에서 join 실패 메시지도 보낸다면
        console.error(`★★★ join 실패: ${data.message} ★★★`);
        // join 실패 처리 로직 (예: 오류 메시지 표시, 재시도 버튼 활성화 등)
    }
});

    // 현재 접속 중인 모든 캐릭터 정보 수신 구독 (기존 코드에 postMessage 추가)
    stompClient.subscribe('/user/queue/characters', function(message) {
    const data = JSON.parse(message.body);
    console.log("현재 캐릭터 목록 수신:", data);
    if (data.type === 'currentCharacters' && data.characters) {
        // iframe으로 '현재 캐릭터 목록' 메시지 전달
        if (iframeWindow) {
            iframeWindow.postMessage(data, '*'); // 실제 운영 환경에서는 '*' 대신 iframe의 origin을 지정해야 합니다.
        }
    }
    });

    // 새로운 캐릭터 접속 및 연결 해제 알림 수신 구독 (기존 코드에 postMessage 추가)
    stompClient.subscribe('/topic/characters', function(message) {
    const data = JSON.parse(message.body);
    console.log("메시지 수신:", data);
    if ((data.type === 'newCharacter' && data.character) || (data.type === 'characterDisconnected' && data.id)) {
        // iframe으로 '새 캐릭터 접속' 또는 '캐릭터 연결 해제' 메시지 전달
        if (iframeWindow) {
            iframeWindow.postMessage(data, '*'); // 실제 운영 환경에서는 '*' 대신 iframe의 origin을 지정해야 합니다.
        }
    }
    });

    // 다른 캐릭터의 이동 정보 수신 구독 (기존 코드에 postMessage 추가)
    stompClient.subscribe('/topic/character-moves', function(message) {
        const data = JSON.parse(message.body);
        console.log("메시지 수신:", data);
        if (data.type === 'characterMoved' && data.id !== undefined && data.x !== undefined && data.y !== undefined) {
            // iframe으로 '캐릭터 이동' 메시지 전달
            if (iframeWindow) {
                iframeWindow.postMessage(data, '*'); // 실제 운영 환경에서는 '*' 대신 iframe의 origin을 지정해야 합니다.
            }
        }
    });

    const chatMessage = {
        sender: UserIdVal,
        roomName: "status",
        content: `${UserIdVal}님이 입장하셨습니다.`,
    };
    stompClient.send("/app/send", {}, JSON.stringify(chatMessage));
    
    // 함수: 메세지 전송
    const sendMsg = () => {
        const chatMessage = {
            sender: UserIdVal,
            roomName: "room1",
            content: MESSAGE.value,
        };
        
        console.log('chatMessage - ' + chatMessage);
        stompClient.send("/app/send", {}, JSON.stringify(chatMessage));

        MESSAGE.value = "";
        CHATAREA.scrollTo(0, CHATAREA.scrollHeight);
    };

    document.getElementById("send").onclick = function () {
        if (MESSAGE.value === '') {
            return false;
        }
        sendMsg();
    };
    // 함수: 메세지 파싱
    const transferSocketData = (message) => {
        const fixedStr = message.body.replace(/(\w+):(\w+)/g, '"$1":"$2"'); // Add quotes
        const obj = JSON.parse(fixedStr);

        if (obj.roomName == "status") {
            return "<p class='chatMessage'>" + `${obj.message}` + "</p>";
        }

        return "<p class='chatMessage'>" + `${obj.sender}: ${obj.message}` + "</p>"; 
    };

    
    // 서버 연결이 완료되면 게임 참여 메시지를 보냅니다.
    stompClient.send("/app/join", {}, JSON.stringify({}));

    }, function(error) {
    console.error('서버 연결 실패:', error);
    });


    // --- iframe으로부터 메시지 수신 처리 (예: 이동 요청) ---
    // iframe에서 window.parent.postMessage()로 보낸 메시지를 여기서 받습니다.
    window.addEventListener('message', function(event) {
    // 보안: 메시지 출처(origin) 확인이 매우 중요합니다!
    // if (event.origin !== 'http://localhost:8080') { // iframe의 실제 origin으로 변경해야 합니다.
    //     console.warn("알 수 없는 출처로부터 메시지 수신:", event.origin);
    //     return;
    // }

    const messageData = event.data; // iframe으로부터 받은 데이터
    const throttledSendMoveMessage = _.throttle(sendMoveMessage, 1000);
    if (messageData && messageData.type === 'moveRequest') {
        // iframe에서 캐릭터 이동 요청이 왔을 때 처리
        const moveRequest = messageData.payload; // 실제 이동 정보 (x, y)
        
        // 서버로 이동 메시지 전송 (STOMP)
        throttledSendMoveMessage(moveRequest.x, moveRequest.y);
        sendUserNameToIframe(캐릭명2);
    }
    // 다른 타입의 메시지 처리...
    });

        
   
    // (클라이언트 -> 서버) 캐릭터 이동 메시지 보내는 함수 예시
function sendMoveMessage(x, y) {
    if (stompClient && stompClient.connected) {
        const moveMessage = {
            x: x,
            y: y
        };
        // 서버의 @MessageMapping("/move") 메서드로 메시지를 보냅니다.
        stompClient.send("/app/move", {}, JSON.stringify(moveMessage));
        console.log(`이동 메시지 전송: (${x}, ${y})`);
    } else {
        console.warn("STOMP 클라이언트가 연결되지 않았습니다.");
    }
}

// 서버 연결 해제 함수
function disconnect() {
    if (stompClient) {
        stompClient.disconnect();
        console.log("STOMP 연결 해제됨");
    }
}




}

function sendUserNameToIframe(userName) {
    if (iframeWindow) {
        const messageToSend = {
            type: 'userName', // iframe이 이 메시지가 '이름' 정보임을 알 수 있도록 타입 지정
            name: userName    // 전달할 실제 이름 값
        };
        // iframeWindow.postMessage(메시지, 대상 Origin);
        // 실제 운영 환경에서는 '*' 대신 iframe의 실제 Origin (first.html의 origin)을 지정해야 합니다.
        iframeWindow.postMessage(messageToSend, '*');
    } else {
        console.error("iframeWindow가 null이어서 이름을 전달할 수 없습니다.");
    }
}

function sendToParent(message) {
    gameFrame.contentWindow.postMessage(message, "*");
}
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' || event.keyCode === 27) { // ESC 키 확인
        const activeElement = document.activeElement; // 현재 포커스된 요소 가져오기
        if (activeElement === MESSAGE) { // 현재 포커스된 요소가 input 태그인지 확인
            event.preventDefault(); // 기본 동작 취소 (선택 사항)
            gameFrame.focus(); // 캐릭터에 포커스 설정
        }
    }
});
SEND.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' || event.keyCode === 27) { // ESC 키 확인
        event.preventDefault(); // 기본 동작 취소 (선택 사항)
        gameFrame.focus(); // 캐릭터에 포커스 설정
    }
});
CHATAREA.addEventListener('click', function(event) {
    MESSAGE.focus(); 
});
CHATAREA.addEventListener('mousedown', function(event) {
    MESSAGE.focus(); 
});
window.addEventListener('message', function(event) {
    if (event.data === 'focusMessage') { 
        if (MESSAGE) {
            MESSAGE.focus(); 
        }
    }
});






// 쉬프트 키가 눌렸을 때
document.addEventListener('keydown', (event) => {
    if (event.key === 'Shift') {
        isShiftPressed = true;
    }
});
// 쉬프트 키가 떼어졌을 때
document.addEventListener('keyup', (event) => {
    if (event.key === 'Shift') {
        isShiftPressed = false;
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

// 키 입력 이벤트 핸들러 수정
document.addEventListener('keydown', (event) => {
    if (event.key === 'a' || event.key === 'A' || event.key === 'ㅁ') {
        const currentTime = Date.now(); // 현재 시간
        let timeSinceLastSkillUse = currentTime - Skill01UseTime; // 마지막 스킬 사용 후 경과 시간
        if (timeSinceLastSkillUse >= skillCoolTime01) {
            A_KeyPressed = true;
            Skill01UseTime = currentTime; // 마지막 스킬 사용 시간 업데이트
            // 스킬 이미지 위치 설정 (사용자 위치)
            skillImage01 = document.createElement('img');
            skillImage01.style.position = 'absolute';
            skillImage01.style.width = '100px'; // 스킬 이미지 크기 설정
            skillImage01.style.height = '40px'; // 스킬 이미지 크기 설정
            skillImage01.style.left = walkImg.offsetLeft + 'px';
            skillImage01.style.top = walkImg.offsetTop + 'px';
            skillImage01.style.display = 'block';
            skillImage01.style.zIndex = '101';

            // 애니메이션 클래스 추가 (방향에 따라 클래스 추가)
            if (ArrowLeftPressed) {
                skillImage01.src = '../img/skill01Left.png'; // 왼쪽 이미지
                skillImage01.classList.add('skill01-animation-left');
                skillImage01.classList.remove('skill01-animation-right');
            } else {
                skillImage01.src = '../img/skill01Right.png'; // 오른쪽 이미지
                skillImage01.classList.add('skill01-animation-right');
                skillImage01.classList.remove('skill01-animation-left');
            }

            space.appendChild(skillImage01); // space에 추가
            startCoolTime01();
            // 애니메이션이 끝나면 skillAnimationEnd 함수 실행
            skillImage01.addEventListener('animationend', skill01AnimationEnd);
        }
    }
});
document.addEventListener('keyup', (event) => {
    if (event.key === 'a' || event.key === 'A' || event.key === 'ㅁ') {
        A_KeyPressed = false;
    } 
});

document.addEventListener('keydown', (event) => {
    if (event.key === 's' || event.key === 'S' || event.key === 'ㄴㄴ') {
        const currentTime = Date.now();
        let timeSinceLastSkillUse = currentTime - Skill02UseTime;

        if (timeSinceLastSkillUse >= skillCoolTime02) {
            S_KeyPressed = true;
            Skill02UseTime = currentTime;
            useSkill02(); // 스킬 사용 함수 호출
            startCoolTime02();
        }
    }
});
document.addEventListener('keyup', (event) => {
    if (event.key === 's' || event.key === 'S' || event.key === 'ㄴㄴ') {
        S_KeyPressed = false;
    } 
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'd' || event.key === 'D' || event.key === 'ㅇㅇ') {
        const currentTime = Date.now();
        let timeSinceLastSkillUse = currentTime - Skill03UseTime;

        if (timeSinceLastSkillUse >= skillCoolTime03) {
            D_KeyPressed = true;
            Skill03UseTime = currentTime;
            useSkill03(); // 스킬 사용 함수 호출
            startCoolTime03();
        }
    }
});
document.addEventListener('keyup', (event) => {
    if (event.key === 'd' || event.key === 'D' || event.key === 'ㅇ') {
        D_KeyPressed = false;
    } 
});

skill01Image.addEventListener('mouseover', () => {
    skill01Content.style.display = 'block';
});
skill01Image.addEventListener('mouseout', () => {
    skill01Content.style.display = 'none';
});
skill02Image.addEventListener('mouseover', () => {
    skill02Content.style.display = 'block';
});
skill02Image.addEventListener('mouseout', () => {
    skill02Content.style.display = 'none';
});
skill03Image.addEventListener('mouseover', () => {
    skill03Content.style.display = 'block';
});
skill03Image.addEventListener('mouseout', () => {
    skill03Content.style.display = 'none';
});

function useSkill02() {
    if (!skillImage02) { // 스킬 이미지가 없으면 생성
        skillImage02 = document.createElement('img');
        skillImage02.style.position = 'absolute';
        skillImage02.style.borderRadius = '50%';
        skillImage02.style.backgroundColor = 'rgba(45, 59, 255, 0.3)';
        skillImage02.style.pointerEvents = 'none';
        skillImage02.style.zIndex = '101';
        space.appendChild(skillImage02); // space에 추가
        skillImage02.addEventListener('animationend', skill02AnimationEnd); // 애니메이션 종료 이벤트 리스너 등록
    }

    skillImage02.classList.remove('skill-effect'); // 기존 애니메이션 클래스 제거
    void skillImage02.offsetWidth; // reflow 발생 (애니메이션 재시작 트릭)
    skillImage02.classList.add('skill-effect'); // 애니메이션 클래스 추가

    skillImage02.style.left = (walkImg.offsetLeft - 100) + 'px'; // 이펙트 위치 조정
    skillImage02.style.top = (walkImg.offsetTop - 100) + 'px'; // 이펙트 위치 조정
    skillImage02.style.width = (100 * 2) + 'px'; // 스킬 범위에 맞게 조정
    skillImage02.style.height = (100 * 2) + 'px'; // 스킬 범위에 맞게 조정
    // 몬스터 데미지 초기화
    for (let i = 0; i < monsters.length; i++) {
        monsters[i].skill02DamageApplied = false; // 데미지 적용 여부 초기화
    }
}
function useSkill03() { // 스킬 사용 함수
    if (!skillImage03) { // 스킬 이미지가 없으면 생성
        skillImage03 = document.createElement('img');
        skillImage03.src = "../img/스킬3.png"; // backgroundImage 대신 src 사용
        skillImage03.style.position = 'absolute'; // position 설정
        skillImage03.style.zIndex = '101';  
        skillImage03.style.width = '800px'; // 스킬 범위에 맞게 조정
        skillImage03.style.height = '640px'; // 스킬 범위에 맞게 조정
        space.appendChild(skillImage03); // space에 추가
        skillImage03.addEventListener('animationend', skill03AnimationEnd); // 애니메이션 종료 이벤트 리스너 등록
    }

    skillImage03.classList.remove('skill03'); // 기존 애니메이션 클래스 제거
    void skillImage03.offsetWidth; // Reflow를 강제로 발생시켜 애니메이션을 재시작
    skillImage03.classList.add('skill03'); // 애니메이션 클래스 추가

    skillImage03.style.left = (walkImg.offsetLeft - 380 + walkImg.offsetWidth / 2) + 'px'; // 이펙트 위치 조정 (중앙)
    skillImage03.style.top = (walkImg.offsetTop - 270 + walkImg.offsetHeight / 2) + 'px'; // 이펙트 위치 조정 (중앙)

    // 몬스터 데미지 초기화
    for (let i = 0; i < monsters.length; i++) {
        monsters[i].skill03DamageApplied = false; // 데미지 적용 여부 초기화
    }
}
// 스킬 애니메이션이 끝났을 때 실행되는 함수
function skill01AnimationEnd() {
    if (skillImage01) {
        skillImage01.classList.remove('skill01-animation-right'); // 애니메이션 클래스 제거
        skillImage01.classList.remove('skill01-animation-left'); // 애니메이션 클래스 제거
        space.removeChild(skillImage01); // 스킬 이미지 제거
        skillImage01 = null; // 스킬 이미지 변수 초기화
    }
}
function skill02AnimationEnd() {
    if (skillImage02) {
        skillImage02.classList.remove('skill-effect'); // 애니메이션 클래스 제거
        space.removeChild(skillImage02); // 스킬 이미지 제거
        skillImage02 = null; // 스킬 이미지 변수 초기화
    }
}
function skill03AnimationEnd() {
    if (skillImage03) {
        skillImage03.classList.remove('skill03');
        space.removeChild(skillImage03);
        skillImage03.remove(); // 이미지 제거
        skillImage03 = null;
    }
}


// 쿨타임 시작 함수
function startCoolTime01() {
    let startTime = Date.now();

    function updateCoolTimeCircle() {
        const elapsedTime = Date.now() - startTime;
        let angle = Math.min((elapsedTime / 11000) * 360, 360); // 0 ~ 360
        skillCoolTimeCircle01.style.background = `conic-gradient(blue 0%, blue ${angle}%, transparent ${angle}%, transparent 100%)`;

        if (angle < 360) {
            let animationFrameId01 = requestAnimationFrame(updateCoolTimeCircle);
        } else {
            // 쿨타임 완료 시점 보정
            skillCoolTimeCircle01.style.background = `conic-gradient(blue 0%, blue 360%, transparent 360%, transparent 100%)`;
        }
    }
    animationFrameId01 = requestAnimationFrame(updateCoolTimeCircle);
}
function startCoolTime02() {
    let startTime = Date.now();

    function updateCoolTimeCircle() {
        const elapsedTime = Date.now() - startTime;
        let angle = Math.min((elapsedTime / 22000) * 360, 360); // 0 ~ 360

        skillCoolTimeCircle02.style.background = `conic-gradient(blue 0%, blue ${angle}%, transparent ${angle}%, transparent 100%)`;

        if (angle < 360) {
            let animationFrameId02 = requestAnimationFrame(updateCoolTimeCircle);
        } else {
            // 쿨타임 완료 시점 보정
            skillCoolTimeCircle02.style.background = `conic-gradient(blue 0%, blue 360%, transparent 360%, transparent 100%)`;
        }
    }
    animationFrameId02 = requestAnimationFrame(updateCoolTimeCircle);
}
function startCoolTime03() {
    let startTime = Date.now();

    function updateCoolTimeCircle() {
        const elapsedTime = Date.now() - startTime;
        let angle = Math.min((elapsedTime / 55000) * 360, 360); // 0 ~ 360

        skillCoolTimeCircle03.style.background = `conic-gradient(blue 0%, blue ${angle}%, transparent ${angle}%, transparent 100%)`;

        if (angle < 360) {
            let animationFrameId03 = requestAnimationFrame(updateCoolTimeCircle);
        } else {
            // 쿨타임 완료 시점 보정
            skillCoolTimeCircle03.style.background = `conic-gradient(blue 0%, blue 360%, transparent 360%, transparent 100%)`;
        }
    }
    animationFrameId03 = requestAnimationFrame(updateCoolTimeCircle);
}

// 체력바 업데이트 함수
function updateHealthBar(monsterData) {
    const healthPercent = (monsterData.health / monsterData.initialHealth) * 100;
    const displayPercent = Math.max(0, healthPercent); // 0% 이하로 떨어지지 않도록 보정
    monsterData.healthBarInner.style.width = displayPercent + '%';
    // 체력에 따라 체력바 색상 변경 (선택 사항)
    if (displayPercent > 50) {
        monsterData.healthBarInner.style.backgroundColor = 'green';
    } else if (displayPercent > 20) {
        monsterData.healthBarInner.style.backgroundColor = 'yellow';
    } else {
        monsterData.healthBarInner.style.backgroundColor = 'red';
    }
}

// // 몬스터 움직임 함수
function moveMonster(monsterData) {
    const monsterContainer = monsterData.container;
    const monster = monsterData.element;

    // x, y 좌표 업데이트
    monsterData.x += monsterData.speed * Math.cos(monsterData.angle);
    monsterData.y += monsterData.speed * Math.sin(monsterData.angle);

    // 각도 변경 (매우 낮은 확률로)
    if (Math.random() < monsterData.changeAngleProbability) {
        monsterData.angle = Math.random() * 2 * Math.PI;
    }

    // 경계 확인
    if (monsterData.x < 0) {
        monsterData.x = 0;
        monsterData.angle = Math.random() * 2 * Math.PI;
    } else if (monsterData.x + monster.width > space.offsetWidth) {
        monsterData.x = space.offsetWidth - monster.width;
        monsterData.angle = Math.random() * 2 * Math.PI;
    }
    if (monsterData.y < 0) {
        monsterData.y = 0;
        monsterData.angle = Math.random() * 2 * Math.PI;
    } else if (monsterData.y + monster.height > space.offsetHeight) {
        monsterData.y = space.offsetHeight - monster.height;
        monsterData.angle = Math.random() * 2 * Math.PI;
    }

    monsterContainer.style.left = monsterData.x + 'px';
    monsterContainer.style.top = monsterData.y + 'px';

    // 체력바 업데이트
    updateHealthBar(monsterData);

    // 체력이 0 이하가 되면 몬스터 제거
    if (monsterData.health <= 0) {
        // 몬스터 컨테이너 제거
        space.removeChild(monsterContainer);

        // 몬스터 배열에서 제거
        const index = monsters.indexOf(monsterData);
        if (index > -1) {
            monsters.splice(index, 1);
        }
    }
}

// 애니메이션 루프
// function attackAnimate() {
//     if (isShiftPressed) {
//         if(ArrowLeftPressed){
//             walkImg.style.transform = `translate(-5px, -3px)`;
//         }else {
//             walkImg.style.transform = `translate(5px, -3px)`;
//         }
//              // 몬스터 공격 로직
//         for (let i = 0; i < monsters.length; i++) {
//             const monster = monsters[i];

//             // 충돌 감지
//             if (isColliding(walkImg, monster)) {
//                 const currentTime = Date.now();
//                 if (currentTime - monster.lastAttacked >= 300) { // 공격시간
//                     // 몬스터 체력 감소
//                     monster.health -= 10;
//                     updateHealthBar(monster);

//                     // 마지막 공격 시간 업데이트
//                     monster.lastAttacked = currentTime;

//                     // 체력이 0 이하가 되면 몬스터 제거 (기존 코드 활용)
//                     if (monster.health <= 0) {
//                         space.removeChild(monster.container);
//                         const index = monsters.indexOf(monster);
//                         if (index > -1) {
//                             monsters.splice(index, 1);
//                         }
//                     }
//                 }
//             }
//         }
//     } else {
//         // 원래 위치로 되돌리기
//         walkImg.style.transform = `translate(0, 0)`;
//     }
//     // 몬스터와 스킬 이미지 충돌 감지
//     if (skillImage01 && (skillImage01.classList.contains('skill01-animation-right') || skillImage01.classList.contains('skill01-animation-left'))) { // 스킬 애니메이션 중일 때만 충돌 감지
//         for (let i = 0; i < monsters.length; i++) {
//             const monster = monsters[i];
//             // 충돌 감지
//             if (isColliding(skillImage01, monster)) {
//                 const currentTime = Date.now();
//                 if (currentTime - monster.lastAttacked >= skillCoolTime01) { // 공격시간
//                     // 몬스터 체력 감소
//                     monster.health -= 30; // 예시: 30 데미지
//                     updateHealthBar(monster);
//                     // 마지막 공격 시간 업데이트
//                     monster.lastAttacked = currentTime;

//                     // 체력이 0 이하가 되면 몬스터 제거 (기존 코드 활용)
//                     if (monster.health <= 0) {
//                         space.removeChild(monster.container);

//                         const index = monsters.indexOf(monster);
//                         if (index > -1) {
//                             monsters.splice(index, 1);
//                         }
//                     }
//                 }
//             }
//         }
//     }
//     if (skillImage02 && (skillImage02.classList.contains('skill-effect'))) { 
//         for (let i = 0; i < monsters.length; i++) {
//             const monster = monsters[i];

//             if (isColliding(skillImage02, monster) && !monster.skill02DamageApplied) {
//                 // 충돌 감지 및 데미지 미적용 상태 확인
//                 monster.health -= 60; // 데미지 적용
//                 updateHealthBar(monster);
//                 monster.skill02DamageApplied = true; // 데미지 적용 상태로 변경

//                 if (monster.health <= 0) {
//                     space.removeChild(monster.container);
//                     monsters.splice(i, 1);
//                     i--; // 몬스터 제거 후 인덱스 조정
//                 }
//             }
//         }
//     }
//     if (skillImage03 && (skillImage03.classList.contains('skill03'))) { 
//         for (let i = 0; i < monsters.length; i++) {
//             const monster = monsters[i];

//             if (isColliding(skillImage03, monster) && !monster.skill03DamageApplied) {
//                 // 충돌 감지 및 데미지 미적용 상태 확인
//                 monster.health -= 200; // 데미지 적용
//                 updateHealthBar(monster);
//                 monster.skill03DamageApplied = true; // 데미지 적용 상태로 변경

//                 if (monster.health <= 0) {
//                     space.removeChild(monster.container);
//                     monsters.splice(i, 1);
//                     i--; // 몬스터 제거 후 인덱스 조정
//                 }
//             }
//         }
//     }

//     // 플레이어와 몬스터 충돌 감지 및 이미지 표시 로직 (공격과 관계없이)
//     for (let i = 0; i < monsters.length; i++) {
//         const monster = monsters[i];

//         // 충돌 감지
//         if (isColliding(walkImg, monster)) {
//             walkImg.style.transform = `translate(-5px, -3px)`;
//             // 이미지 표시 (사용자 위치에)
//             hitEffectImage.style.left = walkImg.offsetLeft + 25 + 'px';
//             hitEffectImage.style.top = walkImg.offsetTop - 20 + 'px';
//             hitEffectImage.style.display = 'block';

//             // 0.3초 후에 이미지 숨김
//             setTimeout(() => {
//                 hitEffectImage.style.display = 'none';
//             }, 300);
//         }
//     }
//     requestAnimationFrame(attackAnimate);
// }

document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' || event.keyCode === 13) { // 엔터 키 확인
      event.preventDefault(); // 기본 동작 취소 (선택 사항)
      window.parent.postMessage('focusMessage', '*'); // 부모 창으로 메시지 전송
    }
});

// function update(x, y) {
//     const rect = space.getBoundingClientRect();
//     let top = walkImg.offsetTop;
//     let left = walkImg.offsetLeft;

//     const imgRect = {
//         top: top,
//         left: left,
//         right: left + walkImg.offsetWidth,
//         bottom: top + walkImg.offsetHeight
//     };

//     let canMoveUp = true;
//     let canMoveDown = true;
//     let canMoveLeft = true;
//     let canMoveRight = true;

//     walls.forEach(wall => {
//         const wallRect = {
//             top: wall.offsetTop,
//             left: wall.offsetLeft,
//             right: wall.offsetLeft + wall.offsetWidth,
//             bottom: wall.offsetTop + wall.offsetHeight
//         };

//         if (isColliding(
//             { top: top - moveSpeed, left: left, right: left + walkImg.offsetWidth, bottom: top + walkImg.offsetHeight - moveSpeed },
//             wallRect
//         )) {
//             canMoveUp = false;
//         }
//         if (isColliding(
//             { top: top + moveSpeed, left: left, right: left + walkImg.offsetWidth, bottom: top + walkImg.offsetHeight + moveSpeed },
//             wallRect
//         )) {
//             canMoveDown = false;
//         }
//         if (isColliding(
//             { top: top, left: left - moveSpeed, right: left + walkImg.offsetWidth - moveSpeed, bottom: top + walkImg.offsetHeight },
//             wallRect
//         )) {
//             canMoveLeft = false;
//         }
//         if (isColliding(
//             { top: top, left: left + moveSpeed, right: left + walkImg.offsetWidth + moveSpeed, bottom: top + walkImg.offsetHeight },
//             wallRect
//         )) {
//             canMoveRight = false;
//         }
//     });

//     if (keys['ArrowUp'] && top > 0 && canMoveUp) {
//         walkImg.style.top = `${Math.max(0, top - moveSpeed)}px`;
//     }
//     if (keys['ArrowDown'] && top < rect.height - walkImg.offsetHeight && canMoveDown) {
//         walkImg.style.top = `${Math.min(rect.height - walkImg.offsetHeight, top + moveSpeed)}px`;
//     }
//     if (keys['ArrowLeft'] && left > 0 && canMoveLeft) {
//         walkImg.style.left = `${Math.max(0, left - moveSpeed)}px`;
//     }
//     if (keys['ArrowRight'] && left < rect.width - walkImg.offsetWidth && canMoveRight) {
//         walkImg.style.left = `${Math.min(rect.width - walkImg.offsetWidth, left + moveSpeed)}px`;
//     }

//         // 좌표 업데이트
//         walkImg.dataset.x = walkImg.offsetLeft;  // 또는 left
//         walkImg.dataset.y = walkImg.offsetTop;   // 또는 top
   
//        //  부모 창에 좌표 전송
//        window.parent.postMessage({
//            type: "characterPosition",
//            x: walkImg.offsetLeft, // 또는 left
//            y: walkImg.offsetTop  // 또는 top
//        }, "*");
       
//     if (90 <= imgRect.top && imgRect.top <= 110 || 144 <= imgRect.bottom && imgRect.bottom <= 164) {
//         goDoorUD = true;
//     } else {
//         goDoorUD = false;
//     }
//     if (imgRect.right >= 630) {
//         goDoorLR = true;
//     } else {
//         goDoorLR = false;
//     }
//     if (goDoorUD && goDoorLR) {
//         goPage = 12;
//         // setTimeout(() => {
//         //     window.location.href = `Second.html?data=${encodeURIComponent(goPage)}&name=${urlParams.get('name')}`;
//         // }, 500);
//     }
//     requestAnimationFrame(update);
// }

// 에니메이션 시작
// attackAnimate();
// update();