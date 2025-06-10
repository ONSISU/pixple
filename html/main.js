const local = "http://localhost:18080";
const prod_url = "http://tomhoon.duckdns.org:18080";

// ⭐️ URL변경 여기만 하면 전부 적용됨
sessionStorage.setItem("url", prod_url);
const UserIdVal = localStorage.getItem('userId');

const MESSAGE = document.getElementById("message");
const CHATAREA = document.querySelector("#chat");
const SEND = document.querySelector("#send");
const gameFrame = document.getElementById('gameFrame');
const gameArea = document.querySelector('.game-area');
let characterDiv1 = document.querySelector(".walkImg");

let iframeWindow = null; // iframe의 window 객체 참조
// let iframeId = generateUniqueId(); // 각 iframe에 고유 ID 부여 함수 (예시)
let userName = null;

function initializeIframeCommunication() {
    if (gameFrame && gameFrame.contentWindow) {
        iframeWindow = gameFrame.contentWindow;
    } else {
        console.warn("iframe 요소 또는 contentWindow를 찾을 수 없음");
    }
}

// 초기 로드 시 또는 select.html에서 First.html로 이동 후 실행
gameFrame.onload = () => {
    initializeIframeCommunication();
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
        userName = data.name; 
        gameArea.style.display = 'block';
        initializeIframeCommunication();
        connect(); // STOMP 연결
    }
});

function connect() {
    let socket = new SockJS(`${sessionStorage.getItem("url")}/chat`); // Connect to the /ws WebSocket endpoint
    let stompClient = Stomp.over(socket); 

    // STOMP 연결 시도
    stompClient.connect({}, function (frame) {
        // 연결 성공 콜백
        // console.log('STOMP Connected11: ' + frame);
        stompClient.subscribe(`/topic/room1`, function (message) {
                CHATAREA.innerHTML += transferSocketData(message);
                CHATAREA.scrollTo(0, CHATAREA.scrollHeight);
            });
        // ✅ 연결2: 유저 연결상태
        stompClient.subscribe("/topic/status", (msg) => {
            CHATAREA.innerHTML += transferSocketData(msg);
            CHATAREA.scrollTo(0, CHATAREA.scrollHeight);
        });

        // 새로운 캐릭터 접속 및 연결 해제 알림 수신 구독 (기존 코드에 postMessage 추가)
        stompClient.subscribe('/topic/characters', function(message) {
            const data = JSON.parse(message.body);
            if (data.character && data.character.id) { // data.character가 존재하고 id 속성이 있는지 확인
                myCharacterId = data.character.id; // myCharacterCreated
            }
            if (data.type === 'newCharacter' && data.character && data.character.id) {
                if (iframeWindow) {
                    iframeWindow.postMessage({ /* ... */ characterName: data.character ? data.character.name : null }, '*');
                }
            } else if (data.type === 'characterDisconnected' && data.characterId) {
                if (iframeWindow) {
                    iframeWindow.postMessage(data, '*');
                }
            }
        });

        // '내' 캐릭터 정보 수신 구독 (기존 코드에 postMessage 추가)
        stompClient.subscribe('/topic/userCharacter', function(message) {
            const data = JSON.parse(message.body);
            if (data.type === 'currentCharacter' && data.character) {
                if (data.character.id && data.character.x !== undefined && data.character.y !== undefined) {
                    myCharacterId = data.character.id;
                    if (iframeWindow) {
                        iframeWindow.postMessage({
                            type: 'createCharacter',
                            characterData:data.character,
                            isMyCharacter: true, // 명시적으로 내 캐릭터임을 알림
                            characterName: userName 
                        }, '*');
                        // characterPositions[data.character.id] = { x: data.character.x, y: data.character.y };
                    }
                } else {
                    console.warn('main.js: currentCharacter 메시지에 필요한 데이터 누락:', data.character);
                }
            } else if (data.type === 'initialCharacters' && Array.isArray(data.characters)) {
                // console.log('main.js: 초기 캐릭터 목록 전송:', data.characters);
                if (iframeWindow) {
                    // console.log("main.js: loadInitialCharacters 메시지 전송 - myCharacterName:", userName);
                    iframeWindow.postMessage({
                        type: 'loadInitialCharacters', 
                        characters: data.characters, 
                        myCharacterName: userName 
                    }, '*');
                }
            }
        });

        // 현재 접속 중인 모든 캐릭터 정보 수신 구독 (기존 코드에 postMessage 추가)
        stompClient.subscribe(`/topic/newCharacters`, function(message) {
            const data = JSON.parse(message.body);
            if (data.type === 'currentCharacters' && data.characters && gameFrame.contentWindow) {
                gameFrame.contentWindow.postMessage(data, '*');
            }
        });

        // 다른 캐릭터의 이동 정보 수신 구독 (기존 코드에 postMessage 추가)
        stompClient.subscribe('/topic/character-moves', function(message) {
            const data = JSON.parse(message.body);
            if (data.type === 'characterMoved' && data.characterId !== undefined && data.x !== undefined && data.y !== undefined && gameFrame.contentWindow) {
                gameFrame.contentWindow.postMessage(data, '*');
                // console.log('main.js: characterMoved 메시지 수신', data);
            }
        });

        stompClient.subscribe('/topic/character-skill', function(message) {
            const data = JSON.parse(message.body);
            if (data.type === 'characterSkill') {
                gameFrame.contentWindow.postMessage(data, '*');
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
            
            // console.log('chatMessage - ' + chatMessage);
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
        stompClient.send("/app/join", {}, JSON.stringify({name: userName}));
    }, function(error) {
        console.error('서버 연결 실패:', error);
    });

    // --- iframe으로부터 메시지 수신 처리 (예: 이동 요청) ---
    // iframe에서 window.parent.postMessage()로 보낸 메시지를 여기서 받습니다.
    window.addEventListener('message', function(event) {
        const messageData = event.data;
        const throttledSendMoveMessage = _.throttle(sendMoveMessage, 100);
        if (messageData && messageData.type === 'moveRequest') {
            const moveRequest = messageData.payload;
            throttledSendMoveMessage(moveRequest.x, moveRequest.y); // userName 제거
        }else if(messageData && messageData.type === 'skillRequest') {
            const skillRequest = messageData.payload;
            if(skillRequest.skill === 'shift'){
                sendSkillMessage(skillRequest.x, skillRequest.y, 'shift');
            }else if(skillRequest.skill === 'a') {
                sendSkillMessage(skillRequest.x, skillRequest.y, 'a');
            }else if(skillRequest.skill === 's'){
                sendSkillMessage(skillRequest.x, skillRequest.y, 's');
            }else if(skillRequest.skill === 'd'){
                sendSkillMessage(skillRequest.x, skillRequest.y, 'd');
            }
            
        }
    });

    // (클라이언트 -> 서버) 캐릭터 이동 메시지 보내는 함수 예시
    function sendMoveMessage(x,y) {
        if (stompClient && stompClient.connected) {
            const moveMessage = {
                x: x,
                y: y,
                name: userName
            };
            stompClient.send("/app/move", {}, JSON.stringify(moveMessage)); // moveRequest 그대로 전송
            // console.log(`이동 메시지 전송: (${x}, ${y})`);
        } else {
            console.warn("STOMP 클라이언트가 연결되지 않았습니다.");
        }
    }
    function sendSkillMessage(x,y, key) {
        if (stompClient && stompClient.connected) {
            stompClient.send("/app/skill", {}, JSON.stringify({
                x: x,
                y: y,
                skill: key
            }));
        } else {
            console.error("STOMP 연결이 되어있지 않습니다.");
        }
    }


function handleSkillEffect(data) {
    if (data.characterId === myCharacterId) {
        // 내 캐릭터가 사용한 스킬
        if (data.skill === 'skill01') {
            // 스킬 1 애니메이션 처리
            // 스킬 이미지 위치 설정 (사용자 위치)
            skillImage01 = document.createElement('img');
            skillImage01.style.position = 'absolute';
            skillImage01.style.width = '100px'; // 스킬 이미지 크기 설정
            skillImage01.style.height = '40px'; // 스킬 이미지 크기 설정
            skillImage01.style.left = characterDiv1.offsetLeft + 'px';
            skillImage01.style.top = characterDiv1.offsetTop + 'px';
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
        } else if (data.skill === 'skill02') {
            // 스킬 2 애니메이션 처리
        }
            // ...
    } else {
        // 다른 캐릭터가 사용한 스킬
        // 다른 캐릭터의 스킬 애니메이션 처리 또는 이펙트 표시
    }
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

document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' || event.keyCode === 13) { // 엔터 키 확인
      event.preventDefault(); // 기본 동작 취소 (선택 사항)
      window.parent.postMessage('focusMessage', '*'); // 부모 창으로 메시지 전송
    }
});

// 에니메이션 시작
// attackAnimate();