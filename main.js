const local = "http://localhost:8085";
const prod_url = "http://tomhoon.duckdns.org:18085";

// ⭐️ URL변경 여기만 하면 전부 적용됨
sessionStorage.setItem("url", prod_url);

const MESSAGE = document.getElementById("message");
const CHATAREA = document.querySelector("#chat");
const SEND = document.querySelector("#send");
const gameFrame = document.getElementById('gameFrame');
const gameArea = document.querySelector('.game-area');

MESSAGE.addEventListener("keydown", (e) => {
if (e.key == "Enter") {
    const val = e.target.value;

    if (!val) return;

    document.querySelector("#send").click();
}
});

window.addEventListener("message", (event) => {
const data = event.data;
if (data.action === 'loginSuccess') {
    gameArea.style.display = 'block';
}
const { 캐릭터아이디, type } = data;
if (type === "chat") {
    // Send message to WebSocket server

    let socket = new SockJS(`${sessionStorage.getItem("url")}/chat`); // Connect to the /ws WebSocket endpoint
    let stompClient = Stomp.over(socket); // Use STOMP over the WebSocket connection

    // 사용자 목록
    const userList = {};

    stompClient.connect({ userId: 캐릭터아이디 }, function (frame) {
    // ✅ 연결1: 방연결
    stompClient.subscribe(`/topic/room1`, function (message) {
        CHATAREA.innerHTML += transferSocketData(message);
        CHATAREA.scrollTo(0, CHATAREA.scrollHeight);
    });

    // ✅ 연결2: 유저 연결상태
    stompClient.subscribe("/topic/status", (msg) => {
        CHATAREA.innerHTML += transferSocketData(msg);
        CHATAREA.scrollTo(0, CHATAREA.scrollHeight);
    });

    const chatMessage = {
        sender: 캐릭터아이디,
        roomName: "status",
        content: `${캐릭터아이디}님이 입장하셨습니다.`,
    };

    stompClient.send("/app/send", {}, JSON.stringify(chatMessage));
    });

    // 함수: 메세지 전송
    const sendMsg = () => {
    const chatMessage = {
        sender: 캐릭터아이디,
        roomName: "room1",
        content: MESSAGE.value,
    };

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
}
});
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
MESSAGE.addEventListener('blur', function() { 
    CHATAREA.style.height = '15vh';
});
