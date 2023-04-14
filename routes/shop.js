//           npm으로 설치한 express 라이브러리의 Router()라는 함수를 쓰겠다.
let router = require('express').Router();

router.get('/shop/shirts', function(req, res){
  res.send('셔츠 파는 페이지입니다.');
});

router.get('/shop/pants', function(req, res){
  res.send('바지 파는 페이지입니다.');
});

// ↓ server.js 에 /shop까지 포함한 경우
// router.get('/shirts', function(req, res){
//   res.send('셔츠 파는 페이지입니다.');
// });

// router.get('/pants', function(req, res){
//   res.send('바지 파는 페이지입니다.');
// });

// 다른 곳에서 shop.js를 가져다 쓸 때 내보낼 변수
module.exports = router;