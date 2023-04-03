// 서버를 띄우기 위한 기본 Template(express 라이브러리)
const express = require('express'); // 처음 설치한 express 라이브러리의 첨부와 사용
const app = express();
// body-parser 라이브러리 - post로 넘긴 req의 값을 꺼내기 쉽게
app.use(express.urlencoded({extended: true})) 
//MongoDB 연결 - 첫번째로 npm install mongodb@3.6.4 로 라이브러리 설치
const MongoClient = require('mongodb').MongoClient;
// EJS
app.set('view engine', 'ejs');

let db;
MongoClient.connect('mongodb+srv://admin:qwer1234@cluster0.v4iodsa.mongodb.net/todoapp?retryWrites=true&w=majority', function(error, client){
  //연결되면 할 일
  if(error){
    return console.log(error);
  }
  
  db = client.db('todoapp');
  
  // db.collection('post').insertOne({이름 : 'Jang', _id : 1, 나이 : 30},function(에러, 결과){
  //   console.log('저장완료');
  // });
  
  app.listen(8080, function(){
    console.log('listening on 8080');
  });
});

// 로컬에 서버를 열 수가 있다.(listen(서버띄울 포트번호, 띄운 후 실행할 코드))
// app.listen(8080, function(){
//   console.log('listening on 8080');
// });

// 누군가가 /pet으로 방문을하면 pet 관련 안내문을 띄워주자
app.get('/pet', function(req, res){
  res.send('PET 용품 페이지입니다.');
});

app.get('/beauty', function(req, res){
  res.send('BEAUTY 용품 페이지입니다.');
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/write', function(req, res){
  res.sendFile(__dirname + '/write.html');
});

// DB에 글 저장
app.post('/add', function(req, res){
  res.send('전송완료');
  // 서버로 보낸 정보(req) 확인
  console.log(req.body);
  // 게시물갯수 counter 찾기
  db.collection('counter').findOne({name : '게시물갯수'}, function(error, result){
    let 총게시물갯수 = result.totalPost;
    // 글 저장
    db.collection('post').insertOne({_id : 총게시물갯수 + 1, 제목 : req.body.title, 날짜 : req.body.date},function(에러, 결과){
      console.log('DB에 글 저장완료');
      // counter collection의 totalPost 도 +1 증가             operator : $set(변경), $inc(증가)
      db.collection('counter').updateOne({name : '게시물갯수'}, { $inc : {totalPost : 1} }, function(error, result){
        if(error) {return console.log(error)};
      })
    });
  });
});

// /list GET요청으로 접속하면 실제 DB에 저장된 데이터들로 예쁘게 꾸며진 HTML 보여줌
app.get('/list', function(req, res){

  // DB에 저장된 post라는 collection의 모든데이터를 꺼내기
  db.collection('post').find().toArray(function(error, result){
    console.log([result]);
    res.render('list.ejs', {posts : result});
  });
});


// DELETE 요청
app.delete('/delete', function(req, res){
  console.log(req.body);
  req.body._id = parseInt(req.body._id);
  // req.body에 담겨온 게시물번호를 가진 글을 DB에서 찾아서 삭제
  db.collection('post').deleteOne(req.body, function(error, result){
    console.log('삭제완료');
  });
});



