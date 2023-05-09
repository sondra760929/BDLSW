import { useEffect, useState } from "react";
import { dbService } from "fbase";
import { collection, onSnapshot, addDoc } from "firebase/firestore";
import Nweet from "./Nweet";
import NweetFactory from "components/NweetFactory";
import "semantic-ui-css/semantic.min.css";
import { Icon, Item, Label, Menu, Table } from "semantic-ui-react";
import * as XLSX from "xlsx/xlsx.mjs";
import axios from "axios";

const Home = ({ userObj }) => {
  const [header, setHeader] = useState([]);
  const [files, setFiles] = useState([]);
  const [fileheader, setFileHeader] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [nweets, setNweets] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [excelHeader, setExcelHeader] = useState([]);
  //   const refreshHeaders = () => {
  //     setHeaders([]);
  //     const unsubscribe = onSnapshot(
  //       collection(dbService, "headers"),
  //       (snapshot) => {
  //         const db_headers = [];
  //         snapshot.forEach((doc) => {
  //           const header_obj = {
  //             id: doc.id,
  //             ...doc.data(),
  //           };
  //           db_headers.push(header_obj);
  //         });
  //         setHeaders(db_headers);
  //       },
  //       (error) => {
  //         console.log(error);
  //       }
  //     );
  //   };
  const refreshTable = () => {
    setTableData([]);
    const unsubscribe = onSnapshot(
      collection(dbService, "fileInfos"),
      (snapshot) => {
        const db_table = [];
        snapshot.forEach((doc) => {
          const db_row = {
            id: doc.id,
            ...doc.data(),
          };
          db_table.push(db_row);
        });
        setTableData(db_table);
        console.log(db_table);
      },
      (error) => {
        console.log(error);
      }
    );
  };

  const refreshHeader = async () => {
    axios.get("http://211.238.111.26:4000/api/header").then((res) => {
      console.log(res);
      setHeader(res.data);
    });
  };

  const refreshFiles = async () => {
    axios.get("http://211.238.111.26:4000/api/files").then((res) => {
      console.log(res);
      const file_rows = [];
      res.data.forEach((file_info) => {
        const db_row = {
          file_name: file_info.file_name,
          file_path: file_info.file_path,
        };
        file_rows[file_info.id] = db_row;
      });
      setFiles(file_rows);
    });
  };

  const refreshFileHeaders = async () => {
    axios.get("http://211.238.111.26:4000/api/fileheaders").then((res) => {
      console.log(res);
      const file_rows = [];
      let file_row = [];
      let file_id = -1;
      res.data.forEach((file_header) => {
        file_row[file_header.header_id] = file_header.value;
        if (file_id !== file_header.file_id) {
          if (file_id > -1) {
            file_rows[file_id] = file_row;
            file_row = [];
          }

          file_id = file_header.file_id;
        }
      });
      file_rows[file_id] = file_row;
      setFileHeader(file_rows);
    });
  };

  useEffect(() => {
    // refreshHeaders();
    refreshTable();
    setNweets([]);
    const unsubscribe = onSnapshot(
      collection(dbService, "nweets"),
      (snapshot) => {
        const db_nweets = [];
        snapshot.forEach((doc) => {
          const nweetObj = {
            id: doc.id,
            ...doc.data(),
          };
          db_nweets.push(nweetObj);
        });
        setNweets(db_nweets);
      },
      (error) => {}
    );
  }, []);
  const onChange = (event) => {
    const {
      target: { value },
    } = event;
    setHeader(value);
  };
  const onSubmit = async (event) => {
    event.preventDefault();
    const header_obj = {
      text: header,
      index: 0,
    };
    await await addDoc(collection(dbService, "headers"), header_obj);
  };
  const onFileChange = (event) => {
    const {
      target: { files },
    } = event;
    const theFile = files[0];
    const reader = new FileReader();
    reader.onloadend = (e) => {
      const result = [];
      let data = e.target.result;
      const wb = XLSX.read(data, { type: "binary" });
      const wsName = wb.SheetNames[0];
      let worksheet = wb.Sheets[wsName];
      let row;
      let row_header;
      let row_header_final;
      let rowNum;
      let colNum;
      let range = XLSX.utils.decode_range(worksheet["!ref"]);

      setExcelData([]);
      setExcelHeader([]);
      let current_row = 0;
      for (rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
        if (current_row === 0) {
          row_header = [];
          for (colNum = range.s.c; colNum < range.e.c; colNum++) {
            var nextCell =
              worksheet[XLSX.utils.encode_cell({ r: rowNum, c: colNum })];
            if (typeof nextCell === "undefined") {
              row_header.push("-");
            } else row_header.push(nextCell.w);
          }
        } else {
          row = [];
          for (colNum = range.s.c; colNum < range.e.c; colNum++) {
            var nextCell =
              worksheet[XLSX.utils.encode_cell({ r: rowNum, c: colNum })];
            if (typeof nextCell === "undefined") {
              if (row_header[colNum] !== "-") {
                row[row_header[colNum]] = "";
              }
            } else {
              row[row_header[colNum]] = nextCell.w;
            }
          }
          result.push(row);
        }
        current_row++;
      }
      row_header_final = [];
      for (const r_header of row_header) {
        if (r_header !== "-") row_header_final.push(r_header);
      }
      setExcelHeader(row_header_final);
      setExcelData(result);
    };
    reader.readAsBinaryString(theFile);
  };

  const loadDB = (event) => {
    refreshHeader();
    refreshFileHeaders();
    refreshFiles();
  };
  return (
    <div>
      <form onSubmit={onSubmit}>
        <button onClick={loadDB}>Load Database</button>
        <input
          value={header}
          onChange={onChange}
          type="text"
          placeholder="new header"
          maxLength={120}
        />
        <input type="submit" />
        <input
          type="file"
          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={onFileChange}
        />
      </form>
      <div>
        <Table celled selectable>
          <Table.Header>
            <Table.Row>
              {excelHeader.map((header_obj, index) => (
                <Table.HeaderCell key={header_obj}>
                  {header_obj}
                </Table.HeaderCell>
              ))}
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {excelData.map((rowData, id) => (
              <Table.Row key={id}>
                {excelHeader.map((cell_header, id1) => (
                  <Table.Cell key={id1}>{rowData[`${cell_header}`]}</Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>

        <Table celled selectable>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell key="no">No</Table.HeaderCell>
              {header.map((header_obj, index) => (
                <Table.HeaderCell key={header_obj.id}>
                  {header_obj.value}
                </Table.HeaderCell>
              ))}
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {fileheader.map((rowData1, id) => (
              <Table.Row key={id}>
                <Table.Cell key="no">{id}</Table.Cell>
                {header.map((cell_header, id1) => (
                  <Table.Cell key={id1}>
                    {rowData1[`${cell_header.id}`]}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>

        {/* <Table celled selectable>
          <Table.Header>
            <Table.Row>
              {headers.map((header_obj) => (
                <Table.HeaderCell key={header_obj.id}>
                  {header_obj.text}
                </Table.HeaderCell>
              ))}
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {tableData.map((rowData, idx) => (
              <Table.Row key={idx}>
                {headers.map((header_obj) => (
                  <Table.Cell>{rowData[`${header_obj.text}`]}</Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table> */}

        <NweetFactory userObj={userObj} />
        {nweets.map((nweet) => (
          <Nweet
            key={nweet.id}
            nweetObj={nweet}
            isOwner={nweet.creatorId === userObj.uid}
          />
        ))}
      </div>
    </div>
  );
};
export default Home;
