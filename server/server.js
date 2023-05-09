// express 모듈 호출
const express = require("express");
const app = express();
const api = require("./routes/index");
// api 처리는 './routes/index'에서 일괄처리
const cors = require("cors");
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.use("/api", api);

app.get("/", (req, res) => {
  res.send("혁이는 코딩 중!");
});

// server port 4000 할당
// 클라이언트와 다른 번호로 충돌나지 않도록
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server run : http://localhost:${PORT}/`);
});
