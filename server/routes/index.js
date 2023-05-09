const express = require("express");
const router = express();
const mysql = require("mysql");
const dbconfig = require("./database.js");
const connection = mysql.createConnection(dbconfig);

// http://localhost:4000/ 으로 접속 시 응답메시지 출력
router.get("/header", (req, res) => {
  connection.query(
    "SELECT id, value FROM headers ORDER BY id",
    (error, rows) => {
      if (error) throw error;
      console.log("headers: ", rows);
      res.send(rows);
    }
  );
});

router.get("/files", (req, res) => {
  connection.query(
    "SELECT file_info.id, file_info.file_name, file_info.file_path, pdf_info.file_url FROM file_info LEFT OUTER JOIN pdf_info ON file_info.id=pdf_info.file_id ORDER BY file_info.id",
    (error, rows) => {
      if (error) throw error;
      console.log("files: ", rows);
      res.send(rows);
    }
  );
});

router.get("/fileheaders", (req, res) => {
  connection.query(
    "SELECT file_id, header_id, value FROM header_info ORDER BY file_id",
    (error, rows) => {
      if (error) throw error;
      console.log("file headers: ", rows);
      res.send(rows);
    }
  );
});

async function create(pdf_file) {
  console.log(pdf_file);
  const result = await connection.query(
    `INSERT INTO pdf_info 
    (file_id, file_url) 
    VALUES 
    (${pdf_file.file_id}, '${pdf_file.file_url}') 
    ON DUPLICATE KEY UPDATE file_url = '${pdf_file.file_url}'`
  );

  let message = "Error in creating programming language";

  if (result.affectedRows) {
    message = "Programming language created successfully";
  }

  return { message };
}

router.post("/pdf_file", async function (req, res, next) {
  try {
    res.json(await create(req.body));
  } catch (err) {
    console.error(`Error while creating programming language`, err.message);
    next(err);
  }
});

module.exports = router;
