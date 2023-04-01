// 서버를 띄우기 위한 기본 Template(express 라이브러리)
const express = require('express'); // 처음 설치한 express 라이브러리의 첨부와 사용
const app = express();
// body-parser 라이브러리 - post로 넘긴 req의 값을 꺼내기 쉽게
app.use(express.urlencoded({extended: true})) 

//MongoDB 연결 - 첫번째로 npm install mongodb@3.6.4 로 라이브러리 설치
const MongoClient = require('mongodb').MongoClient;
let db;
MongoClient.connect('mongodb+srv://admin:qwer1234@cluster0.v4iodsa.mongodb.net/todoapp?retryWrites=true&w=majority', function(error, client){
  //연결되면 할 일
  if(error){
    return console.log(error);
  }
  
  db = client.db('todoapp');
  
  db.collection('post').insertOne({이름 : 'Jang', _id : 1, 나이 : 30},function(에러, 결과){
    console.log('저장완료');
  });
  
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

app.post('/add', function(req, res){
  res.send('전송완료');
  console.log(req.body);
  console.log(req.body.title);
})




