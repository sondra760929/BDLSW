import { useEffect, useState, useRef } from "react";
import { collection, onSnapshot, addDoc } from "firebase/firestore";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { storageService, dbService } from "fbase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import * as pdfjs from "pdfjs-dist";
import DockLayout from "rc-dock";
import "rc-dock/dist/rc-dock.css";
import TableView from "./TableView";

// import { Document, Page, pdfjs } from "react-pdf";
// import { pdfjsLib } from "pdfjs-dist";
// const pdfJS = import("pdfjs-dist/build/pdf");
// import * as pdfJS from "pdfjs-dist/build/pdf";
// import pdfJS from "pdfjs-dist/build/pdf";
// import "pdfjs-dist/web/pdf_viewer";
const Home = ({ userObj }) => {
  const [attachment, setAttachment] = useState("");
  var header = [],
    fileheader = [],
    fileID = -1,
    fileURL = "";
  const canvasRef = useRef(null);
  const currentPDF = useRef(null);
  const dockLayoutRef = useRef(null);
  var pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    scale = 0.8;

  const onSubmit = async (event) => {
    event.preventDefault();
    let attachmentUrl = "";
    if (attachment !== "") {
      const fileRef = ref(storageService, `${userObj.uid}/${uuidv4()}`);
      const response = await uploadString(fileRef, attachment, "data_url");
      attachmentUrl = await getDownloadURL(response.ref);

      axios
        .post("http://localhost:4000/api/pdf_file", {
          file_id: fileID,
          file_url: attachmentUrl,
        })
        .then(function (response) {
          console.log(response);
        })
        .catch(function (error) {
          console.log(error);
        });
    }
    setAttachment("");
  };
  const onFileChange = (event) => {
    const {
      target: { files },
    } = event;
    const theFile = files[0];
    const reader = new FileReader();
    reader.onloadend = (finishedEvent) => {
      const {
        currentTarget: { result },
      } = finishedEvent;
      setAttachment(result);
    };
    reader.readAsDataURL(theFile);
  };
  const onClearAttachment = () => setAttachment(null);

  useEffect(() => {
    dockLayoutRef.current.updateTab("t2", getTab("t2"));
    // We import this here so that it's only loaded during client-side rendering.
    // if (fileURL !== null && fileURL !== "") {
    //   pdfJS.GlobalWorkerOptions.workerSrc =
    //     window.location.origin + "/pdf.worker.min.js";
    //   const pdf = pdfJS.getDocument(
    //     "https://cors-anywhere.herokuapp.com/https://firebasestorage.googleapis.com/v0/b/bdlsw-1e2bb.appspot.com/o/y1otKGGk3RgSOFmTCBJSwgdeXI03%2F78ed49f4-7a71-4865-9f3d-69d08d1b8251?alt=media&token=1dac8eda-f3c1-44b6-86cc-eb7a06f41669"
    //   ).promise;
    //   console.log(pdf);
    //   const page = pdf.getPage(1);
    //   const viewport = page.getViewport({ scale: 1.5 });
    //   // Prepare canvas using PDF page dimensions.
    //   const canvas = canvasRef.current;
    //   const canvasContext = canvas.getContext("2d");
    //   canvas.height = viewport.height;
    //   canvas.width = viewport.width;
    //   // Render PDF page into canvas context.
    //   const renderContext = { canvasContext, viewport };
    //   page.render(renderContext);
    // }
  });

  function renderPage(num) {
    pdfDoc = currentPDF.current;
    pageRendering = true;
    // Using promise to fetch the page
    pdfDoc.getPage(num).then(function (page) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      var viewport = page.getViewport({ scale: scale });
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      // Render PDF page into canvas context
      var renderContext = {
        canvasContext: ctx,
        viewport: viewport,
      };
      var renderTask = page.render(renderContext);

      // Wait for rendering to finish
      renderTask.promise.then(function () {
        pageRendering = false;
        if (pageNumPending !== null) {
          // New page rendering is pending
          renderPage(pageNumPending);
          pageNumPending = null;
        }
      });
    });

    // Update page counters
    document.getElementById("page_num").textContent = num;
  }

  /**
   * If another page rendering in progress, waits until the rendering is
   * finised. Otherwise, executes rendering immediately.
   */
  function queueRenderPage(num) {
    if (pageRendering) {
      pageNumPending = num;
    } else {
      renderPage(num);
    }
  }

  /**
   * Displays previous page.
   */
  function onPrevPage() {
    if (pageNum <= 1) {
      return;
    }
    pageNum--;
    queueRenderPage(pageNum);
  }

  /**
   * Displays next page.
   */
  function onNextPage() {
    if (pageNum >= currentPDF.current.numPages) {
      return;
    }
    pageNum++;
    queueRenderPage(pageNum);
  }

  const getTab = (id) => {
    switch (id) {
      case "t1":
        return {
          id,
          title: "Tab 1",
          content: (
            <div>
              <form onSubmit={onSubmit}>
                <input type="file" accept=".pdf" onChange={onFileChange} />
                <input type="submit" value="PDF" />
                {attachment && (
                  <div>
                    <img src={attachment} width="50px" height="50px" />
                    <button onClick={onClearAttachment}>Clear</button>
                  </div>
                )}
              </form>
            </div>
          ),
        };
      case "t2":
        return {
          id,
          title: "Protect",
          closable: false,
          content: <TableView userObj={userObj} />,
        };
      case "t3":
        return {
          id,
          title: "PDF View",
          content: (
            <div>
              <div>
                <button id="prev" onClick={onPrevPage}>
                  Previous
                </button>
                <button id="next" onClick={onNextPage}>
                  Next
                </button>
                &nbsp; &nbsp;
                <span>
                  Page: <span id="page_num"></span> /{" "}
                  <span id="page_count"></span>
                </span>
              </div>
              <canvas ref={canvasRef} />
            </div>
          ),
        };
    }

    return {
      id,
      title: id,
      content: <div>Tab Content</div>,
    };
  };

  let defaultLayout = {
    dockbox: {
      mode: "horizontal",
      children: [
        {
          size: 200,
          tabs: [getTab("t1")],
        },
        {
          size: 1000,
          tabs: [getTab("t2")],
          panelLock: { panelStyle: "main" },
        },
        {
          size: 200,
          tabs: [getTab("t3")],
        },
      ],
    },
  };

  let groups = {
    locked: {
      floatable: false,
      tabLocked: true,
    },
  };

  return (
    <DockLayout
      ref={dockLayoutRef}
      defaultLayout={defaultLayout}
      groups={groups}
      style={{
        position: "absolute",
        left: 10,
        top: 10,
        right: 10,
        bottom: 10,
      }}
    />
  );
};
export default Home;
