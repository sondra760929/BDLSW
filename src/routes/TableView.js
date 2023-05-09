import { useEffect, useState, useRef } from "react";
import axios from "axios";
import "react-data-grid/lib/styles.css";
// import { css } from '@linaria/core';
import DataGrid, { textEditor, useFocusRef } from "react-data-grid";

const TableView = ({ userObj }) => {
  const [files, setFiles] = useState([]);
  const [grid, setData] = useState([]);
  const [grid_columns, setColumns] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());
  var header = [],
    fileheader = [],
    fileID = -1,
    fileURL = "";

  const defaultColumnProperties = {
    filterable: true,
    width: 120,
  };

  const refreshHeader = async () => {
    axios.get("http://localhost:4000/api/header").then((res) => {
      header = res.data; //setHeader(res.data);

      setColumns([]);
      const new_columns = [];
      header.map((header_obj, index) =>
        // new_columns.push({
        //   ...keyColumn(`${header_obj.id}`, textColumn),
        //   title: header_obj.value,
        // })
        new_columns.push({
          key: `${header_obj.id}`,
          name: header_obj.value,
          filterable: true,
          sortable: true,
          resizable: true,
          editor: textEditor,
        })
      );
      setColumns(new_columns);
    });
  };

  const refreshFiles = async () => {
    axios.get("http://localhost:4000/api/files").then((res) => {
      const file_rows = [];
      res.data.forEach((file_info) => {
        const db_row = {
          file_name: file_info.file_name,
          file_path: file_info.file_path,
          file_url: file_info.file_url,
        };
        file_rows[file_info.id] = db_row;
      });
      setFiles(file_rows);
    });
  };

  const refreshFileHeaders = async () => {
    axios.get("http://localhost:4000/api/fileheaders").then((res) => {
      let file_rows = [];
      var grid_row = null;
      let grid_rows = [];
      let grid_row_index = 0;
      res.data.forEach((file_header) => {
        if (file_rows[file_header.file_id] === undefined) {
          file_rows[file_header.file_id] = [];
        }
        file_rows[file_header.file_id][file_header.header_id] =
          file_header.value;

        if (file_header.file_id !== grid_row_index) {
          if (grid_row !== null) {
            grid_row[`id`] = grid_row_index;
            grid_rows.push(grid_row);
          }
          grid_row = new Object();
        }
        grid_row[`${file_header.header_id}`] = file_header.value;
        grid_row_index = file_header.file_id;
      });
      if (grid_row !== null) {
        grid_row[`id`] = grid_row_index;
        grid_rows.push(grid_row);
      }
      setData(grid_rows);
      fileheader = file_rows; //setFileHeader(file_rows);
    });
  };

  useEffect(() => {
    console.log(grid);
    console.log(grid_columns);
    console.log(selectedRows);
  });

  const loadDB = (event) => {
    refreshHeader();
    refreshFileHeaders();
    refreshFiles();
  };

  function rowKeyGetter(row) {
    return row.id;
  }

  function onRowClick(row) {
    console.log(row);
  }

  function onRowChange(row) {
    console.log(row);
  }

  //   const selectionChange = (selection) => {
  //     if (selection.selection !== null) {
  //       if (
  //         selection.selection.min.col == selection.selection.max.col &&
  //         selection.selection.min.row == selection.selection.max.row
  //       ) {
  //         fileID = selection.selection.min.row + 1; //setFileID(id1);
  //         console.log(files);
  //         console.log(fileID);
  //         fileURL = files[fileID].file_url; //setFileURL(files[id1].file_url);
  //         // pdf_viewer.setDocument(files[id1].file_url);
  //         if (files[fileID].file_url !== null && files[fileID].file_url !== "") {
  //           var loadingTask = pdfjs.getDocument(files[fileID].file_url);
  //           loadingTask.promise.then((pdf) => {
  //             currentPDF.current = pdf;
  //             pdfDoc = pdf;
  //             document.getElementById("page_count").textContent = pdfDoc.numPages;

  //             // Initial/first page rendering
  //             renderPage(pageNum);

  //             dockLayoutRef.current.updateTab("t3", getTab("t3"));
  //           });
  //         }
  //       }
  //     } else {
  //       console.log("selection === null");
  //     }
  //   };

  return (
    <div>
      <button onClick={loadDB}>Load Database</button>
      <DataGrid
        style={{ height: window.innerHeight - 80 }}
        rowKeyGetter={rowKeyGetter}
        columns={grid_columns}
        rows={grid}
        defaultColumnOptions={{
          sortable: true,
          resizable: true,
        }}
        selectedRows={selectedRows}
        onSelectedRowsChange={setSelectedRows}
        onRowClick={onRowClick}
        onRowChange={onRowChange}
        className="rdg-light"
      />
    </div>
  );
};
export default TableView;
