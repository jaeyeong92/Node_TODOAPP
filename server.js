// 서버를 띄우기 위한 기본 Template(express 라이브러리)
const express = require('express'); // 처음 설치한 express 라이브러리의 첨부와 사용
const app = express();
// body-parser 라이브러리 - post로 넘긴 req의 값을 꺼내기 쉽게
app.use(express.urlencoded({extended: true})) ;
//MongoDB 연결 - 첫번째로 npm install mongodb@3.6.4 로 라이브러리 설치
const MongoClient = require('mongodb').MongoClient;
// EJS
app.set('view engine', 'ejs');
// CSS - static 파일을 보관하기 위해 public 폴더를 쓸 것이다.
app.use('/public', express.static('public'));
// method-override package
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
// passport library
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
// app.use -> 미들웨어 -> 웹서버는 요청-응답해주는 머신인데 그 중간에서 뭔가 실행되는 코드
app.use(session({secret : '비밀코드', resave : true, saveUninitialized : false}));
app.use(passport.initialize());
app.use(passport.session());

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
  res.render(__dirname + '/views/index.ejs');
});

app.get('/write', function(req, res){
  res.render(__dirname + '/views/write.ejs');
});



// /list GET요청으로 접속하면 실제 DB에 저장된 데이터들로 예쁘게 꾸며진 HTML 보여줌
app.get('/list', function(req, res){

  // DB에 저장된 post라는 collection의 모든데이터를 꺼내기
  db.collection('post').find().toArray(function(error, result){
    // console.log([result]);
    res.render('list.ejs', {posts : result});
  });
});



//      /detail로 접속하면 detail.ejs 보여줌
app.get('/detail/:detailNum', function(req, res){
  db.collection('post').findOne({_id : parseInt(req.params.detailNum)}, function(error, result){
    // console.log(result);
    res.render('detail.ejs', { data : result });
  })
})


// Edit 기능
app.get('/edit/:editNum', function(req, res){
  db.collection('post').findOne({_id : parseInt(req.params.editNum)}, function(error, result){
    // console.log(result);
    res.render('edit.ejs', { data : result });
  })
});


// Edit 후 다시 DB에 저장
app.put('/edit', function(req, res){
  db.collection('post').updateOne({ _id : parseInt(req.body.id) }, { $set : {제목 : req.body.title , 날짜 : req.body.date} }, function(error, result){
    console.log('Edit 업데이트 완료')
    res.redirect('/list');
  });
})

app.get('/login', function(req, res){
  res.render('login.ejs');
});

app.post('/login', passport.authenticate('local', {
  failureRedirect : '/fail'
}), function(req, res){
  res.redirect('/');
});

// 아이디 비번 인증
passport.use(new LocalStrategy({
  usernameField: 'id',
  passwordField: 'pw',
  session: true,
  passReqToCallback: false,
}, function (입력한아이디, 입력한비번, done) {
  console.log(입력한아이디, 입력한비번);
  db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
    if (에러) return done(에러)

    if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
    if (입력한비번 == 결과.pw) {
      return done(null, 결과)
    } else {
      return done(null, false, { message: '비번틀렸어요' })
    }
  })
}));

// 로그인 성공하면 세션을 만들어준다.
// 세션을 저장시키는 코드(로그인 성공시 발동) -> id를 이용해서 세션을 저장시키는 코드
//                              ↓ 위 passport.use의 결과가 user에 들어간다.
passport.serializeUser(function(user ,done){
  done(null, user.id)
});
// 이 세션 데이터를 가진 사람을 DB에서 찾아주세요 (먀이페이지 접속 시 발동)
//                           위 user.id가 아이디
passport.deserializeUser(function(아이디, done){
  db.collection('login').findOne({ id : 아이디 }, function(error, result){
    done(null, result); // 이 result가 req.user에 꽂힌다.
  });
});



// My Page
app.get('/mypage', 로그인했니, function(req, res){
  console.log(req.user);
  res.render('mypage.ejs', { 사용자 : req.user });
});

function 로그인했니(req, res, next){
  if(req.user){ // 로그인 후 세션이 있으면 req.user가 항상 있음.
    next()  // 통과
  } else {
    res.send('로그인 안하셨는데요')
  }
};


// Search
app.get('/search', (req, res) => {
  let 검색조건 = [
    {
      $search: {
        index: 'titleSearch',
        text: {
          query: req.query.value,
          path: '제목'  // 제목날짜 둘다 찾고 싶으면 ['제목', '날짜']
        }
      }
    },
    { $sort : { _id : 1 } }
  ] 
  // db.collection('post').find({ 제목 : req.query.value }).toArray(function(error, result){
  // db.collection('post').find({ $text: { $search: req.query.value }}).toArray(function(error, result){  
  db.collection('post').aggregate(검색조건).toArray(function(error, result){

    console.log(result); 
    res.render('search.ejs', { 검색결과 : result });
  });
});


// 회원가입
app.post('/register', function(req, res){
  db.collection('login').insertOne({ id : req.body.id, pw : req.body.pw }, function(error, result){
    res.redirect('/');
  });
});

// DB에 글 저장
app.post('/add', function(req, res){
  res.send('전송완료');
  // 서버로 보낸 정보(req) 확인
  // console.log(req.body);
  // 게시물갯수 counter 찾기
  db.collection('counter').findOne({name : '게시물갯수'}, function(error, result){
    let 총게시물갯수 = result.totalPost;
    console.log(req.user)
    let 저장할것 = 
      {_id : 총게시물갯수 + 1, 제목 : req.body.title, 날짜 : req.body.date, 작성자 : req.user._id }
    // 글 저장
    db.collection('post').insertOne(저장할것, function(에러, 결과){
      console.log('DB에 글 저장완료');         // ↓ 어떤게시물수정할건지, 수정값, 콜백함수
      // counter collection의 totalPost 도 +1 증가             operator : $set(변경), $inc(증가)
      db.collection('counter').updateOne({name : '게시물갯수'}, { $inc : {totalPost : 1} }, function(error, result){
        if(error) {return console.log(error)};
      })
    });
  });
});


// DELETE 요청
app.delete('/delete', function(req, res){
  // console.log(req.body);
  req.body._id = parseInt(req.body._id);
  
  let 삭제데이터 = { _id : req.body._id, 작성자 : req.user._id }
  // req.body에 담겨온 게시물번호를 가진 글을 DB에서 찾아서 삭제
  db.collection('post').deleteOne(삭제데이터, function(error, result){
    console.log('삭제완료');
    // 성공인지 실패인지 판정 -> 응답코드 200을 보내주세요
    res.status(200).send({ message : '성공했습니다'});
  });
});