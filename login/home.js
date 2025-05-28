
const clickParticle = (e) => {
  for (let i = 0; i < 10; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';

    const x = e.clientX;
    const y = e.clientY;

    const angle = Math.random() * 2 * Math.PI;
    const radius = Math.random() * 60;

    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.setProperty('--x', `${Math.cos(angle) * radius}px`);
    particle.style.setProperty('--y', `${Math.sin(angle) * radius}px`);

    document.body.appendChild(particle);

    setTimeout(() => particle.remove(), 600);
  }
}
document.addEventListener('click', clickParticle);

const getAllUserInfo = () => {
  const userId = document.querySelector('#id').value;
  const pw = document.querySelector('#password').value;

  if (!userId || !pw) return 0;

  return {
    userId,
    pw
  }
}

const goLogin = async () => {
  const param = getAllUserInfo();

  if (!param) {
    alert("아이디 비밀번호 입력");
    return;
  }
  
  const res = await fetch(`${sessionStorage.getItem("url")}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(param)
  });

  const data = await res.json();

  if (data?.resultCode == 100) {
    localStorage.setItem('userId', param.userId);
    location.href = '../character/select.html';
  } else {
    alert(data?.result || '로그인 실패');
  }

}

const JOINBTN = document.querySelector('.joinbtn');
const PLAYBTN = document.querySelector('.playbutton');
const password = document.querySelector('#password');
const id = document.querySelector('#id');

PLAYBTN.addEventListener('click', (e) => {
  goLogin();
});

JOINBTN.addEventListener('click', (e) => {
  e.preventDefault();

  location.href = './join.html';

});

password.addEventListener('keydown', (e) => {
  if (e.key == 'Enter') {
    goLogin();
  }
})
id.addEventListener('keydown', (e) => {
  if (e.key == 'Enter') {
    goLogin();
  }
})