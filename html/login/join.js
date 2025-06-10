const getAllUserInfo = () => {
  const userId = document.querySelector('#id').value;
  const pw = document.querySelector('#password').value;
  const nickname = document.querySelector('#nickname').value;

  if (!userId || !pw || !nickname) return 0;

  return {
    userId,
    pw,
    nickname
  }
}

const submit = async () => {
  const url = sessionStorage.getItem("url");
  const param = getAllUserInfo();

  if (!param) {
    alert('모두 채워주세요');
    return;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(param)
  });

  const data = await res.json();

  if (data?.resultCode == 100) {
    alert(data?.result);
  } else {
    alert(data?.result || '회원가입 실패');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const SUBMITBTN = document.querySelector('.submitbtn');
  SUBMITBTN.addEventListener('click', submit);
});
