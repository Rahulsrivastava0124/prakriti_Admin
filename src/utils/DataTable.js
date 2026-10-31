import React from "react";
import {
  Chip,
  Grid,
  Pagination,
  Button,
  Stack,
  Select,
  MenuItem,
  FormControl,
  Rating,
  IconButton,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

// Add CSS for spinner animation
const spinnerStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Inject styles into the document head
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = spinnerStyles;
  document.head.appendChild(styleSheet);
}
import { Table, TableHead } from "@mui/material";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableFooter from "@mui/material/TableFooter";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import PropTypes from "prop-types";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import {
  getNewlineText,
  getStatusColor,
  fetchCertificateDetails,
} from "src/helpers/helper";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import DoneIcon from "@mui/icons-material/Done";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@mui/icons-material/Close";
import ReplayIcon from "@mui/icons-material/Replay";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import LockIcon from "@mui/icons-material/Lock";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";

class DataTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      minWidth: this.props.minWidth,
      columns: this.props.columns,
      rows: this.props.rows,
      page: this.props.page,
      limit: this.props.limit,
      total: this.props.total,
      columnAlign: this.props.columnAlign,
      rowAlign: this.props.rowAlign,
      haveAction: this.props.haveAction,
      actions: this.props.actions,
      actionValue: this.props.actionValue,
      deleteDialogOpen: false,
      deleteRow: null,
      deleteFun: null,
      havePagination: this.props.havePagination,
      actionValueColorConditions: this.props.actionValueColorConditions,
      showSerialNo: this.props.showSerialNo,
      haveAllOption: this.props.haveAllOption,
      stickyHeader: this.props.stickyHeader,
      showAll: false,
      manualLimit: this.props.limit,
      imageDialogOpen: false,
      imagePath: "",
      crID: "",
      CrfunResult: "Loading...",
      certificateModalOpen: false,
      certificateNo: "",
      certificateDetails: null,
      certificateLoading: false,
      // Row keys currently expanded, for the opt-in `expandableKey` mode.
      expandedRowKeys: [],
    };
  }

  /*
   * Expandable rows are opt-in: a page passes `expandableKey` (the field on a
   * row holding its nested rows) and, optionally, `expandableFlag`. Without
   * `expandableKey` every branch below is inert and the table renders exactly
   * as it always has - this component backs most screens in the admin, so the
   * default path must not shift.
   */
  getNestedRows = (row) => {
    const key = this.props.expandableKey;
    if (!key || !row) return [];
    const nested = row[key];
    return Array.isArray(nested) ? nested : [];
  };

  rowHasNested = (row) => {
    if (!this.props.expandableKey) return false;
    const flag = this.props.expandableFlag;
    if (flag && !row[flag]) return false;
    return this.getNestedRows(row).length > 0;
  };

  rowKeyFor = (row, index) =>
    row && row.id !== undefined && row.id !== null ? `id:${row.id}` : `i:${index}`;

  isRowExpanded = (row, index) =>
    this.state.expandedRowKeys.includes(this.rowKeyFor(row, index));

  toggleRowExpanded = (row, index) => {
    const key = this.rowKeyFor(row, index);
    this.setState((prev) => ({
      expandedRowKeys: prev.expandedRowKeys.includes(key)
        ? prev.expandedRowKeys.filter((k) => k !== key)
        : [...prev.expandedRowKeys, key],
    }));
  };

  handleChangePage = (e, number) => {
    console.log("page datatable", number);
    this.props.handlePagination(number);
  };

  getArrayComponent = (components, space) => {
    return (
      <>
        {components.map((component, index) => (
          <React.Fragment key={index}>
            {component}
            {space !== false ? <>&nbsp;</> : ""}
          </React.Fragment>
        ))}
      </>
    );
  };

  getData = (item) => {
    // console.log("--this is sene the data for ",item)
    let arr = [];
    // console.log("this is the data for ", arr);

    for (let i of this.state.columns) {
      /*
       * `fallback_name` covers a field an older API build does not send yet:
       * the invoice payment tables bind Payment Mode to `payment_mode_display`,
       * and against an API without it the whole column rendered blank rather
       * than dropping back to the plain `payment_mode` it does send.
       */
      let d = i.name in item ? item[i.name] : "";
      if (
        (d === "" || d === null || d === undefined) &&
        "fallback_name" in i &&
        i.fallback_name in item
      ) {
        d = item[i.fallback_name];
      }
      if (Array.isArray(d)) {
        if ("show_tag" in i) {
          let tags = [];
          for (let x = 0; x < d.length; x++) {
            tags.push(<Chip label={d[x][i.array_key]} color="primary" />);
          }
          d = this.getArrayComponent(tags);
        } else {
          let filterArr = [];
          if ("array_key" in i) {
            for (let x = 0; x < d.length; x++) {
              filterArr.push(d[x][i.array_key]);
            }
            d = filterArr;
          }
          d = getNewlineText(d.join("\n"));
        }
      } else {
        if ("show_tag" in i) {
          let color = "primary";
          if ("color_conditions" in i) {
            for (let x = 0; x < i.color_conditions.length; x++) {
              if (
                i.color_conditions[x].value == item[i.color_conditions[x].key]
              ) {
                color = i.color_conditions[x].color;
                break;
              }
            }
          } else if (i.display_name == "Status") {
            color = getStatusColor(d);
          }
          d = d ? (
            <Chip label={d} color={color} style={{ width: "127px" }} />
          ) : (
            ""
          );
          if ("showAttendenceAddress" in i && i.showAttendenceAddress) {
            let links = [];
            if (item.attendence_address && item.attendence_address.login) {
              links.push(
                <a
                  href={
                    "http://maps.google.com/?ll=" +
                    item.attendence_address.login.lat +
                    "," +
                    item.attendence_address.login.lng
                  }
                  style={{ display: "block" }}
                  target="_blank"
                >
                  {item.attendence_address.login.address}
                </a>,
              );
              if (item.attendence_address.logout) {
                links.push(
                  <a
                    href={
                      "http://maps.google.com/?ll=" +
                      item.attendence_address.logout.lat +
                      "," +
                      item.attendence_address.logout.lng
                    }
                    target="_blank"
                  >
                    {item.attendence_address.logout.address}
                  </a>,
                );
              }
            }
            d = [d].concat(links);
            d = this.getArrayComponent(d, false);
          }
          if ("redirectToMap" in i && i.redirectToMap) {
            let links = [
              <a
                href={"http://maps.google.com/?ll=" + item.lat + "," + item.lng}
                style={{ display: "block" }}
                target="_blank"
              >
                {d}
              </a>,
            ];
            d = this.getArrayComponent(links, false);
          }
        }
        if ("isBold" in i && i.isBold) {
          d = this.getArrayComponent([<b>{d}</b>]);
        }
      }
      // console.log("this table data ",i)

      if ("isImage" in i && i.isImage) {
        if (item.current_image != null) {
          d = item.current_image;
        }
        let width = "isBanner" in i && i.isBanner ? "200px" : "60px";
        let style = { width: width };
        if (!("isBanner" in i && i.isBanner)) {
          style.height = "40px";
        }
        // Use custom onImageClick if provided, otherwise use default
        const imageClickHandler = this.props.onImageClick
          ? (e) => {
              e.preventDefault();
              e.stopPropagation();
              const imageElement = e.currentTarget;
              console.log("DataTable: Calling custom onImageClick with:", {
                d,
                item,
              });
              this.props.onImageClick(d, item, {
                isImageLoaded: Boolean(
                  imageElement &&
                  imageElement.complete &&
                  imageElement.naturalWidth > 0,
                ),
              });
            }
          : () => this.handleImageClick(d);
        arr.push(
          <img
            src={d}
            style={style}
            name={"this is tested comment"}
            className="table-data-image cursor-pointer"
            onClick={imageClickHandler}
          />,
        );
      } else if ("isRating" in i && i.isRating) {
        arr.push(<Rating name="read-only" value={d} readOnly />);
      } else {
        let class_name = "";
        if ("class_conditions" in i) {
          for (let x = 0; x < i.class_conditions.length; x++) {
            if (
              i.class_conditions[x].value == item[i.class_conditions[x].key]
            ) {
              class_name = i.class_conditions[x].class_name;
              break;
            }
          }
        }

        if ("isHtml" in i && i.isHtml) {
          d = this.getArrayComponent([
            <span dangerouslySetInnerHTML={{ __html: d }}></span>,
          ]);
        }

        if (class_name) {
          d = this.getArrayComponent([<span className={class_name}>{d}</span>]);
        }
        arr.push(d);
      }
    }

    return arr;
  };

  getActionIcon = (a) => {
    if ("icon" in a && a.icon === false) {
      return a.label;
    }
    switch (a.label) {
      case "Edit":
        return <EditIcon />;
        break;

      case "Delete":
        return <DeleteIcon />;
        break;

      case "View":
        return <RemoveRedEyeIcon />;
        break;

      case "Stocks":
        /* used wherever an action opens a listing of stocks under this record,
           so the eye icon can be kept for a profile-style page */
        return <FormatListBulletedIcon />;
        break;

      case "+":
        return <AddIcon />;
        break;

      case "...":
        return (
          <div
            style={{
              width: "12px",
              height: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ...
          </div>
        );
        break;

      case "Download":
        return <FileDownloadIcon />;
        break;

      case "green_tick":
        return <DoneIcon />;
        break;

      case "Accept":
        return <CheckCircleIcon />;
        break;
      case "Decline":
        return <CancelIcon />;
        break;

      case "Close":
        return <CloseIcon />;
        break;

      case "Return":
        return <ReplayIcon />;
        break;

      case "Assign":
        return <AssignmentIndIcon />;
        break;

      case "Permissions":
        return <LockIcon />;
        break;

      default:
        break;
    }
  };

  static getDerivedStateFromProps(props, state) {
    let update = {};

    if (props.rows !== state.rows) {
      update.rows = props.rows;
    }
    if (props.page !== state.page) {
      update.page = props.page;
    }
    if (props.total !== state.total) {
      update.total = props.total;
    }
    if (props.limit !== state.limit) {
      update.limit = props.limit;
      if (!state.showAll) {
        update.manualLimit = props.limit;
      }
    }
    if (props.actions !== state.actions) {
      update.actions = props.actions;
    }

    return update;
  }

  handleActionButtonClick = (a, row) => {
    if ("isDelete" in a && a.isDelete) {
      this.setState({
        deleteDialogOpen: true,
        deleteRow: row,
        deleteFun: a.onClick,
      });
    } else {
      a.onClick(row);
    }
  };

  handleClose = () => {
    this.setState({
      deleteDialogOpen: false,
    });
  };

  handleDelete = () => {
    this.state.deleteFun(this.state.deleteRow);
    this.setState({
      deleteDialogOpen: false,
    });
  };

  checkActionBtnCondtion = (conditions, item) => {
    let allTrue = [];
    for (let i = 0; i < conditions.length; i++) {
      if ("con_type" in conditions[i]) {
        if (item[conditions[i].key] != conditions[i].value) {
          allTrue.push(true);
        }
      } else if (item[conditions[i].key] == conditions[i].value) {
        allTrue.push(true);
      }
    }
    return allTrue.length == conditions.length;
  };

  getColumnStyle = (column) => {
    let x = {};
    if ("width" in column) {
      x.width = column.width;
    }
    return x;
  };

  getActionValueStyle = (val) => {
    let color = "";
    let extra = null;
    /*
     * Matched case-insensitively: the two APIs spell these labels differently
     * ("Processed" vs "processed"), and an exact compare silently dropped the
     * chip, leaving a bare grey word beside properly chipped neighbours.
     */
    const target = String(val ?? "").trim().toLowerCase();
    for (let x = 0; x < this.state.actionValueColorConditions.length; x++) {
      if (
        String(this.state.actionValueColorConditions[x].value)
          .trim()
          .toLowerCase() === target
      ) {
        color = this.state.actionValueColorConditions[x].color;
        // A condition may carry a whole style object as well as a colour, so a
        // status can render as a chip rather than bare coloured text. Yellow
        // text is unreadable on a white row at any shade that still looks
        // yellow, so the waiting statuses need a filled background.
        extra = this.state.actionValueColorConditions[x].style || null;
        break;
      }
    }

    if (!color && !extra) return {};
    return { ...(color ? { color: color } : {}), ...(extra || {}) };
  };

  getSerialNo = (index, page, limit) => {
    let serialNo = (page - 1) * limit + index + 1;
    return serialNo < 10 ? "0" + serialNo : serialNo;
  };

  handleLimitChange = (e) => {
    console.log(
      "this is the value ",
      this.state.page,
      this.state.limit,
      e.target.value,
    );
    this.setState(
      {
        manualLimit: e.target.value,
        showAll: e.target.value == "all" ? true : false,
      },
      () => {
        this.props.handlePagination(
          e.target.value == "all" ? 1 : this.state.page,
          this.state.showAll,
        );
      },
    );
  };

  handleImageClick = (url) => {
    this.setState({
      imageDialogOpen: true,
      imagePath: url,
    });
  };

  handleImageDialogClose = () => {
    this.setState({
      imageDialogOpen: false,
    });
  };

  handleCertificateClick = async (certificateNo) => {
    const hasAlphabet = /[a-zA-Z]/.test(certificateNo);

    this.setState({
      certificateModalOpen: true,
      certificateNo: certificateNo,
      certificateLoading: true,
      certificateDetails: null,
      certificateType: hasAlphabet ? 'igi' : 'iigl',
    });

    if (hasAlphabet) {
      const result = await fetchCertificateDetails(certificateNo);
      this.setState({
        certificateDetails: result,
        certificateLoading: false,
      });
    } else {
      try {
        const url = `https://www.iigl.org/verify-report?_token=9qeXaecEEQxpc6lxgetMVYbRspPDeAI93byemKfw&report_no=${certificateNo}&mobile=9874445612`;
        const response = await fetch(url);
        const result = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(result, 'text/html');
        const table = doc.querySelector('table');

        if (table) {
          const rows = Array.from(table.rows).map((row) =>
            Array.from(row.cells).map((cell) => {
              const img = cell.querySelector('img');
              return img ? img.src : cell.textContent.trim();
            })
          );
          this.setState({
            certificateDetails: { success: true, iiglData: rows },
            certificateLoading: false,
          });
        } else {
          this.setState({
            certificateDetails: 'No certificate data found from IIGL',
            certificateLoading: false,
          });
        }
      } catch (error) {
        console.error('Error fetching IIGL certificate:', error);
        this.setState({
          certificateDetails: `Failed to fetch IIGL certificate: ${error.message}`,
          certificateLoading: false,
        });
      }
    }
  };

  handleCertificateModalClose = () => {
    this.setState({
      certificateModalOpen: false,
      certificateNo: "",
      certificateDetails: null,
    });
  };

  crFunction = async (item) => {
    if (this.state.CrfunResult !== "Loading...") {
      this.setState({ CrfunResult: "Loading..." });
    }
    this.setState({ crID: item });

    const url = `https://www.iigl.org/verify-report?_token=9qeXaecEEQxpc6lxgetMVYbRspPDeAI93byemKfw&report_no=${item}&mobile=9874445612`;
    const options = {
      method: "GET",
    };

    try {
      const response = await fetch(url, options);
      const result = await response.text();

      // Parse the HTML response to extract table data
      const parser = new DOMParser();
      const doc = parser.parseFromString(result, "text/html");
      const table = doc.querySelector("table");

      if (table) {
        const rows = Array.from(table.rows).map((row) =>
          Array.from(row.cells).map((cell) => {
            const img = cell.querySelector("img");
            return img ? img.src : cell.textContent;
          }),
        );

        // console.log("rows", rows);
        this.setState({ CrfunResult: rows });
      } else {
        this.setState({ CrfunResult: "No table found in the response" });
      }
    } catch (error) {
      console.error(error);
      this.setState({ CrfunResult: "Error fetching data" });
    }
  };

  render() {
    const {
      rows,
      columnAlign,
      rowAlign,
      total,
      limit,
      page,
      columns,
      actions,
      havePagination,
      haveAllOption,
      showAll,
      stickyHeader,
    } = this.state;
    const safeLimit = Number(limit) > 0 ? Number(limit) : 1;
    const totalPage = !showAll ? Math.ceil(total / safeLimit) : 1;
    const isClientPagination = Number(total) === Number(rows.length);
    const paginatedRows =
      !showAll && havePagination && isClientPagination
        ? rows.slice((page - 1) * safeLimit, page * safeLimit)
        : rows;

    const crFunction = async (item) => {
      this.setState({ CrfunResult: "Loading..." });
      this.setState({ crID: item });
      const url = `https://cors-proxy4.p.rapidapi.com/?url=https%3A%2F%2Fwww.iigl.org%2Fverify-report%3F_token%3D9qeXaecEEQxpc6lxgetMVYbRspPDeAI93byemKfw%26report_no%3D${item}%26mobile%3D9874445612`;
      const options = {
        method: "GET",
        headers: {
          "x-rapidapi-key":
            "47446d4ac6msh204cf477df496a7p1da8aejsn9c974cb1fbbb",
          "x-rapidapi-host": "cors-proxy4.p.rapidapi.com",
        },
      };

      try {
        const response = await fetch(url, options);
        const result = await response.text();

        // Parse the HTML response to extract table data
        const parser = new DOMParser();
        const doc = parser.parseFromString(result, "text/html");
        const table = doc.querySelector("table");

        if (table) {
          const rows = Array.from(table.rows).map((row) =>
            Array.from(row.cells).map((cell) => {
              const img = cell.querySelector("img");
              return img ? img.src : cell.textContent;
            }),
          );

          this.setState({ CrfunResult: JSON.stringify(rows, null, 2) });
        } else {
          this.setState({ CrfunResult: "No table found in the response" });
        }
      } catch (error) {
        console.error(error);
        this.setState({ CrfunResult: "Error fetching data" });
      }
    };

    // console.log("this is the data ", this.state.CrfunResult);
    // console.log("crfunresult", this.state.CrfunResult);

    return (
      <>
        <div
          className="modal fade"
          id="exampleModal"
          tabIndex="-1"
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable z-10">
            <div className="modal-content">
              <div className="modal-header">
                <h1
                  className="modal-title fs-6"
                  id="exampleModalLabel"
                  style={{ fontSize: "14px" }}
                >
                  Certificate Details :{" "}
                  <span className="fw-bold">{this.state.crID}</span>
                </h1>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                {this.state.CrfunResult === "Loading..." ? (
                  <div className="loading-animation d-flex justify-content-center">
                    <div className="spinner-grow" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <table className="table table-striped">
                    <tbody style={{ fontSize: "12px" }}>
                      {Array.isArray(this.state.CrfunResult) ? (
                        this.state.CrfunResult.map(([key, value], index) => (
                          <tr key={index}>
                            <th scope="row">{key}</th>
                            <td>
                              {value.startsWith("http") ? (
                                <img
                                  src={value}
                                  alt="Product"
                                  style={{
                                    maxWidth: "100px",
                                    maxHeight: "100px",
                                  }}
                                />
                              ) : (
                                value
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <h6>{this.state.CrfunResult}</h6>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>

        <Dialog
          open={this.state.certificateModalOpen}
          onClose={this.handleCertificateModalClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 0 },
          }}
        >
          <DialogTitle
            sx={{
              background: "#000",
              color: "#fff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 20px",
            }}
          >
            <span>
              <span className=" text-lg text-gray-400 ">
                {" "}
                Certificate Number :
              </span>

              <span className="text-base "> {this.state.certificateNo}</span>
            </span>
            <button
              onClick={this.handleCertificateModalClose}
              style={{
                background: "none",
                border: "none",
                color: "#fff",
                fontSize: "24px",
                cursor: "pointer",
                padding: "0 8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
          </DialogTitle>
          <DialogContent
            sx={{
              padding: "28px",
              background: "#fff",
              maxHeight: "650px",
              overflowY: "auto",
            }}
          >
            {this.state.certificateLoading ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "50px 0",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    border: "3px solid #e0e0e0",
                    borderTop: "3px solid #000",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                ></div>
              </div>
            ) : typeof this.state.certificateDetails === "string" ? (
              <p
                style={{
                  color: "#000",
                  fontSize: "14px",
                  padding: "20px 0",
                  margin: 0,
                }}
              >
                ⚠️ {this.state.certificateDetails}
              </p>
            ) : this.state.certificateDetails?.success && this.state.certificateDetails?.iiglData ? (
              <div>
                <div style={{ marginBottom: "10px", marginTop: "10px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#000", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.8px" }}>IIGL Certificate Details</div>
                  <div style={{ background: "#f5f5f5", border: "1px solid #000", padding: "14px" }}>
                    {this.state.certificateDetails.iiglData.map(([key, value], idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", paddingBottom: "12px", borderBottom: idx < this.state.certificateDetails.iiglData.length - 1 ? "1px solid #ddd" : "none", marginBottom: idx < this.state.certificateDetails.iiglData.length - 1 ? "12px" : "0" }}>
                        <span style={{ fontWeight: 700, color: "#000", fontSize: "13px" }}>{key}</span>
                        <span style={{ color: "#000", fontSize: "14px" }}>
                          {value && value.startsWith && value.startsWith("http") ? (
                            <img src={value} alt={key} style={{ maxWidth: "100px", maxHeight: "100px" }} />
                          ) : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : this.state.certificateDetails?.success ? (
              <div>
                {this.state.certificateDetails.certificateData && (
                  <div>
                    {this.state.certificateDetails.certificateData.jewelry
                      .type && (
                      <div style={{ marginBottom: "24px", marginTop: "10px" }}>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "#000",
                            marginBottom: "10px",
                            textTransform: "uppercase",
                            letterSpacing: "0.8px",
                          }}
                        >
                          Jewelry Details
                        </div>
                        <div
                          style={{
                            background: "#f5f5f5",
                            border: "1px solid #000",
                            padding: "14px",
                          }}
                        >
                          {this.state.certificateDetails.certificateData.jewelry
                            .type && (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                paddingBottom: "12px",
                                borderBottom: "1px solid #ddd",
                                marginBottom: "12px",
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: 700,
                                  color: "#000",
                                  fontSize: "13px",
                                }}
                              >
                                Type
                              </span>
                              <span style={{ color: "#000", fontSize: "14px" }}>
                                {
                                  this.state.certificateDetails.certificateData
                                    .jewelry.type
                                }
                              </span>
                            </div>
                          )}
                          {this.state.certificateDetails.certificateData.jewelry
                            .metal && (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                paddingBottom: "12px",
                                borderBottom: "1px solid #ddd",
                                marginBottom: "12px",
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: 700,
                                  color: "#000",
                                  fontSize: "13px",
                                }}
                              >
                                Metal
                              </span>
                              <span style={{ color: "#000", fontSize: "14px" }}>
                                {
                                  this.state.certificateDetails.certificateData
                                    .jewelry.metal
                                }
                              </span>
                            </div>
                          )}
                          {this.state.certificateDetails.certificateData.jewelry
                            .color && (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                paddingBottom: "12px",
                                borderBottom: "1px solid #ddd",
                                marginBottom: "12px",
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: 700,
                                  color: "#000",
                                  fontSize: "13px",
                                }}
                              >
                                Color
                              </span>
                              <span style={{ color: "#000", fontSize: "14px" }}>
                                {
                                  this.state.certificateDetails.certificateData
                                    .jewelry.color
                                }
                              </span>
                            </div>
                          )}
                          {this.state.certificateDetails.certificateData.jewelry
                            .weight_grams && (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: 700,
                                  color: "#000",
                                  fontSize: "13px",
                                }}
                              >
                                Weight
                              </span>
                              <span style={{ color: "#000", fontSize: "14px" }}>
                                {
                                  this.state.certificateDetails.certificateData
                                    .jewelry.weight_grams
                                }
                                g
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {(this.state.certificateDetails.certificateData.diamonds
                      .quantity ||
                      this.state.certificateDetails.certificateData.diamonds
                        .total_carat_weight) && (
                      <div style={{ marginBottom: "24px" }}>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "#000",
                            marginBottom: "10px",
                            textTransform: "uppercase",
                            letterSpacing: "0.8px",
                          }}
                        >
                          Diamond/Gemstone Details
                        </div>
                        <div
                          style={{
                            background: "#f5f5f5",
                            border: "1px solid #000",
                            padding: "14px",
                          }}
                        >
                          {this.state.certificateDetails.certificateData
                            .diamonds.quantity && (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                paddingBottom: "12px",
                                borderBottom: "1px solid #ddd",
                                marginBottom: "12px",
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: 700,
                                  color: "#000",
                                  fontSize: "13px",
                                }}
                              >
                                Quantity
                              </span>
                              <span style={{ color: "#000", fontSize: "14px" }}>
                                {
                                  this.state.certificateDetails.certificateData
                                    .diamonds.quantity
                                }
                              </span>
                            </div>
                          )}
                          {this.state.certificateDetails.certificateData
                            .diamonds.shape && (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                paddingBottom: "12px",
                                borderBottom: "1px solid #ddd",
                                marginBottom: "12px",
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: 700,
                                  color: "#000",
                                  fontSize: "13px",
                                }}
                              >
                                Shape
                              </span>
                              <span style={{ color: "#000", fontSize: "14px" }}>
                                {
                                  this.state.certificateDetails.certificateData
                                    .diamonds.shape
                                }
                              </span>
                            </div>
                          )}
                          {this.state.certificateDetails.certificateData
                            .diamonds.cut && (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                paddingBottom: "12px",
                                borderBottom: "1px solid #ddd",
                                marginBottom: "12px",
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: 700,
                                  color: "#000",
                                  fontSize: "13px",
                                }}
                              >
                                Cut
                              </span>
                              <span style={{ color: "#000", fontSize: "14px" }}>
                                {
                                  this.state.certificateDetails.certificateData
                                    .diamonds.cut
                                }
                              </span>
                            </div>
                          )}
                          {this.state.certificateDetails.certificateData
                            .diamonds.color_grade && (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                paddingBottom: "12px",
                                borderBottom: "1px solid #ddd",
                                marginBottom: "12px",
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: 700,
                                  color: "#000",
                                  fontSize: "13px",
                                }}
                              >
                                Color Grade
                              </span>
                              <span style={{ color: "#000", fontSize: "14px" }}>
                                {
                                  this.state.certificateDetails.certificateData
                                    .diamonds.color_grade
                                }
                              </span>
                            </div>
                          )}
                          {this.state.certificateDetails.certificateData
                            .diamonds.clarity_grade && (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                paddingBottom: "12px",
                                borderBottom: "1px solid #ddd",
                                marginBottom: "12px",
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: 700,
                                  color: "#000",
                                  fontSize: "13px",
                                }}
                              >
                                Clarity Grade
                              </span>
                              <span style={{ color: "#000", fontSize: "14px" }}>
                                {
                                  this.state.certificateDetails.certificateData
                                    .diamonds.clarity_grade
                                }
                              </span>
                            </div>
                          )}
                          {this.state.certificateDetails.certificateData
                            .diamonds.total_carat_weight && (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: 700,
                                  color: "#000",
                                  fontSize: "13px",
                                }}
                              >
                                Total Carat Weight
                              </span>
                              <span style={{ color: "#000", fontSize: "14px" }}>
                                {
                                  this.state.certificateDetails.certificateData
                                    .diamonds.total_carat_weight
                                }
                                ct
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {this.state.certificateDetails.certificateData.comments
                      .length > 0 && (
                      <div style={{ marginBottom: "24px" }}>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "#000",
                            marginBottom: "10px",
                            textTransform: "uppercase",
                            letterSpacing: "0.8px",
                          }}
                        >
                          Comments
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#000",
                            padding: "14px 16px",
                            background: "#f5f5f5",
                            border: "1px solid #000",
                            lineHeight: "1.6",
                          }}
                        >
                          {this.state.certificateDetails.certificateData.comments.join(
                            " ",
                          )}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        const blob = new Blob(
                          [this.state.certificateDetails.data],
                          { type: "application/pdf" },
                        );
                        const url = window.URL.createObjectURL(blob);
                        window.open(url, "_blank");
                      }}
                      style={{
                        width: "100%",
                        background: "#000",
                        color: "#fff",
                        border: "none",
                        padding: "14px 20px",
                        fontSize: "14px",
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        letterSpacing: "0.5px",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "#333";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "#000";
                      }}
                    >
                      VIEW PDF
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </DialogContent>
        </Dialog>

        <TableContainer
          component={Paper}
          className="ratn-table-wrapper"
          sx={{ maxHeight: 500 }}
        >
          <Table sx={{ minWidth: 500 }} stickyHeader={stickyHeader}>
            <TableHead className="ratn-table-header">
              <TableRow>
                {this.props.expandableKey ? (
                  <TableCell align={columnAlign} sx={{ width: 44 }} />
                ) : null}
                {this.state.showSerialNo ? (
                  <TableCell align={columnAlign}>#</TableCell>
                ) : null}
                {columns.map((column, index) => (
                  <TableCell
                    align={columnAlign}
                    key={index}
                    sx={this.getColumnStyle(column)}
                    className={"className" in column ? column.className : ""}
                  >
                    {column.display_name}
                    {"helper_text" in column ? (
                      <p className="table-column-helper-text">
                        {column.helper_text}
                      </p>
                    ) : null}
                  </TableCell>
                ))}
                {actions.length || this.state.actionValue !== "" ? (
                  <TableCell align={columnAlign} sx={{ width: 100 }}>
                    Actions
                  </TableCell>
                ) : null}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRows.map((row, i) => (
                <React.Fragment key={i}>
                <TableRow>
                  {this.props.expandableKey ? (
                    <TableCell align={rowAlign} sx={{ width: 44 }}>
                      {this.rowHasNested(row) ? (
                        <IconButton
                          size="small"
                          aria-label={
                            this.isRowExpanded(row, i)
                              ? "Hide earlier transaction"
                              : "Show earlier transaction"
                          }
                          onClick={() => this.toggleRowExpanded(row, i)}
                        >
                          {this.isRowExpanded(row, i) ? (
                            <KeyboardArrowUpIcon fontSize="small" />
                          ) : (
                            <KeyboardArrowDownIcon fontSize="small" />
                          )}
                        </IconButton>
                      ) : null}
                    </TableCell>
                  ) : null}
                  {this.state.showSerialNo ? (
                    <TableCell align={rowAlign} style={{ fontSize: "12px" }}>
                      {/* {console.log("page, limit", page, limit)} */}
                      {this.getSerialNo(i, page, safeLimit)}
                    </TableCell>
                  ) : null}
                  {this.getData(row).map((item, index) => {
                    const columnName = this.state.columns[index]?.name || "";
                    // Only open certificate modal for certificate/report number columns
                    const isCertificateColumn =
                      columnName?.toLowerCase().includes("certificate") ||
                      columnName?.toLowerCase().includes("report");

                    if (isCertificateColumn && item) {
                      const certificateNo = item;
                      return (
                        <TableCell align={rowAlign} key={i + index}>
                          <span
                            className="btn"
                            style={{
                              cursor: "pointer",
                              color: "#007bff",
                              textDecoration: "underline",
                            }}
                            onClick={() =>
                              this.handleCertificateClick(certificateNo)
                            }
                          >
                            {item}
                          </span>
                        </TableCell>
                      );
                    } else {
                      return (
                        <TableCell align={rowAlign} key={i + index}>
                          {item}
                        </TableCell>
                      );
                    }
                  })}
                  {actions.length || this.state.actionValue !== "" ? (
                    <TableCell align={rowAlign} className="action_btn">
                      {actions.length ? (
                        <Stack
                          spacing={1}
                          direction="row"
                          justifyContent={rowAlign}
                          alignItems={rowAlign}
                        >
                          {(this.props.getRowActions
                            ? this.props.getRowActions(row)
                            : actions
                          ).map((a, index) => {
                            return (
                              <React.Fragment key={index}>
                                {(!("show" in a) || a.show) &&
                                // hide accept/decline buttons if row is not actionable
                                !(
                                  (a.label === "green_tick" ||
                                    a.label === "Close") &&
                                  row.can_accept !== true
                                ) &&
                                (("conditions" in a &&
                                  this.checkActionBtnCondtion(
                                    a.conditions,
                                    row,
                                  )) ||
                                  !("conditions" in a)) ? (
                                  <Button
                                    key={"b" + index}
                                    variant="contained"
                                    color={a.color}
                                    onClick={() =>
                                      !a.disabled &&
                                      !a.loading &&
                                      this.handleActionButtonClick(a, row)
                                    }
                                    disabled={a.disabled || a.loading || false}
                                    style={{
                                      fontSize: "10px",
                                      minWidth: "32px",
                                      minHeight: "32px",
                                      opacity: a.loading
                                        ? 0.6
                                        : a.disabled
                                          ? 0.5
                                          : 1,
                                      cursor:
                                        a.disabled || a.loading
                                          ? "not-allowed"
                                          : "pointer",
                                      transition: "all 0.2s ease-in-out",
                                    }}
                                    title={
                                      a.loading
                                        ? "Adding to cart..."
                                        : a.disabled
                                          ? "Disabled"
                                          : ""
                                    }
                                  >
                                    {a.loading ? (
                                      <div
                                        className="spinner-border spinner-border-sm"
                                        role="status"
                                        style={{
                                          width: "14px",
                                          height: "14px",
                                          border:
                                            "2px solid rgba(255, 255, 255, 0.3)",
                                          borderTop: "2px solid #ffffff",
                                          borderRadius: "50%",
                                          animation: "spin 1s linear infinite",
                                          display: "inline-block",
                                        }}
                                      >
                                        <span className="visually-hidden">
                                          Loading...
                                        </span>
                                      </div>
                                    ) : (
                                      this.getActionIcon(a)
                                    )}
                                  </Button>
                                ) : null}
                              </React.Fragment>
                            );
                          })}
                        </Stack>
                      ) : null}
                      {this.state.actionValue !== "" ? (
                        <span
                          style={{
                            ...this.getActionValueStyle(
                              row[this.state.actionValue],
                            ),
                            fontSize: "12px",
                          }}
                        >
                          {row[this.state.actionValue]}
                        </span>
                      ) : null}
                    </TableCell>
                  ) : null}
                </TableRow>

                {/* Earlier states of this row, revealed by the chevron. */}
                {this.rowHasNested(row) && this.isRowExpanded(row, i)
                  ? this.getNestedRows(row).map((nested, n) => (
                      <TableRow
                        key={`n${i}-${n}`}
                        sx={{
                          backgroundColor: "rgba(0, 0, 0, 0.03)",
                          "& td": { color: "text.secondary" },
                        }}
                      >
                        <TableCell align={rowAlign} sx={{ width: 44 }} />
                        {this.state.showSerialNo ? (
                          <TableCell align={rowAlign} />
                        ) : null}
                        {this.getData(nested).map((item, index) => (
                          <TableCell
                            align={rowAlign}
                            key={`nc${i}-${n}-${index}`}
                            style={{ fontSize: "12px" }}
                          >
                            {item}
                          </TableCell>
                        ))}
                        {actions.length || this.state.actionValue !== "" ? (
                          <TableCell align={rowAlign} className="action_btn">
                            {/*
                              History is a record, not something to act on -
                              no buttons here, only the status it ended in.
                            */}
                            {this.state.actionValue !== "" ? (
                              <span
                                style={{
                                  ...this.getActionValueStyle(
                                    nested[this.state.actionValue],
                                  ),
                                  fontSize: "12px",
                                }}
                              >
                                {nested[this.state.actionValue]}
                              </span>
                            ) : null}
                          </TableCell>
                        ) : null}
                      </TableRow>
                    ))
                  : null}
                </React.Fragment>
              ))}

              {paginatedRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    align="center"
                    colSpan={
                      columns.length +
                      actions.length +
                      (this.state.showSerialNo ? 1 : 0) +
                      (this.props.expandableKey ? 1 : 0)
                    }
                  >
                    No data found.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
            <TableFooter>
              <TableRow></TableRow>
            </TableFooter>
          </Table>
          {total > 0 && havePagination ? (
            <Grid container alignItems="right" className="ratn-table-footer">
              {haveAllOption ? (
                <Grid item xs={2}>
                  <FormControl size="small">
                    <Select
                      className="input-inner"
                      value={this.state.manualLimit}
                      fullWidth
                      onChange={this.handleLimitChange}
                    >
                      <MenuItem value={limit} style={{ fontSize: "12px" }}>
                        {limit}
                      </MenuItem>
                      <MenuItem value="all" style={{ fontSize: "12px" }}>
                        All
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              ) : null}
              <Grid item xs={haveAllOption ? 10 : 12}>
                <Pagination
                  count={totalPage}
                  page={page}
                  onChange={this.handleChangePage}
                />
              </Grid>
            </Grid>
          ) : null}
          <Dialog
            className="ratn-dialog-footer delete_modal"
            open={this.state.deleteDialogOpen}
            onClose={this.handleClose}
            fullWidth
            maxWidth="md"
          >
            <DialogTitle style={{ fontSize: "14px" }}>Delete</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-slide-description">
                Are you sure want to delete this record?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <div className="ratn-footer-buttons">
                <Button onClick={this.handleClose} className="close-button">
                  Close
                </Button>
                <Button onClick={this.handleDelete} className="conf-button">
                  Yes, Confirm
                </Button>
              </div>
            </DialogActions>
          </Dialog>

          <Dialog
            onClose={this.handleImageDialogClose}
            open={this.state.imageDialogOpen}
          >
            <DialogTitle>
              <CloseIcon
                sx={{
                  cursor: "pointer",
                  float: "right",
                  marginTop: "5px",
                  width: "30px",
                }}
                onClick={this.handleImageDialogClose}
              />
            </DialogTitle>
            <DialogContent>
              <img src={this.state.imagePath} width={500} height={350} />
            </DialogContent>
          </Dialog>
        </TableContainer>
      </>
    );
  }
}

DataTable.defaultProps = {
  minWidth: 500,
  columns: [],
  rows: [],
  page: 0,
  limit: 0,
  total: 0,
  columnAlign: "left",
  rowAlign: "left",
  haveAction: true,
  actions: [],
  havePagination: true,
  actionValue: "",
  actionValueColorConditions: [],
  showSerialNo: true,
  haveAllOption: false,
  loading: false,
  stickyHeader: true,
};

DataTable.propTypes = {
  minWidth: PropTypes.number,
  columns: PropTypes.array,
  actionValueColorConditions: PropTypes.array,
  rows: PropTypes.array,
  page: PropTypes.number,
  limit: PropTypes.number,
  total: PropTypes.number,
  columnAlign: PropTypes.string,
  actionValue: PropTypes.string,
  rowAlign: PropTypes.string,
  haveAction: PropTypes.bool,
  actions: PropTypes.array,
  havePagination: PropTypes.bool,
  showSerialNo: PropTypes.bool,
  loading: PropTypes.bool,
  stickyHeader: PropTypes.bool,
};

export default DataTable;
