import React from "react";
import { connect } from "react-redux";
import {
  Grid,
  Button,
  CircularProgress,
  IconButton,
  Collapse,
  Box,
  Typography,
  TextareaAutosize,
  Stack,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  InputAdornment,
  Chip,
  Divider,
} from "@mui/material";
import { gridSpacing } from "store/constant";
import MainCard from "ui-component/cards/MainCard";
import withRouter from "src/helpers/withRouter";
import DataTable from "src/utils/DataTable";
import { withSnackbar } from "notistack";
import {
  purchaseView,
  purchaseViewRaw,
  purchaseDownloadInvoiceInfo,
  purchaseDownloadInvoiceItemList,
  purchaseDownloadInvoiceItemDetails,
} from "actions/superadmin/purchase.actions";
import { bindActionCreators } from "redux";
import { Table, TableHead } from "@mui/material";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableFooter from "@mui/material/TableFooter";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import moment from "moment";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import {
  isEmpty,
  getApprovalColor,
  formatIndianNumber, prepareFileWindow, showFileWindow, closeFileWindow } from "src/helpers/helper";
import { paymentStore, paymentList } from "actions/superadmin/payment.actions";
import { SUPERADMIN_RESET_PAYMENT } from "../../../actionTypes/superadmin/payment.types";
import { getRoleName, getUserDashboardRoute } from "src/helpers/helper";
import { getNotifiactions } from "actions/superadmin/notification.actions";
import { getProfile } from "actions/superadmin/profile.actions";
import {
  salesDownloadInvoiceInfo,
  salesViewRaw,
} from "actions/superadmin/sales.actions";
import { purityList } from "actions/superadmin/purity.actions";
import { fetchLiveGoldRates, invoiceFineMetal, purityRatePerGram } from "src/helpers/goldRate";
import { isAdmin } from "src/helpers/helper";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import "./style.css";
import { PAYMENT_STATUS_COLORS } from "../../../utils/paymentStatusColors";
class PurchaseViewPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      purchase: null,
      openDialog: false,
      ...this.defaultFormValues(),
      actionCalled: this.props.actionCalled,
      createSuccess: this.props.createSuccess,
      successMessage: this.props.successMessage,
      errorMessage: this.props.errorMessage,
      processing: false,
      items: this.props.items,
      total: this.props.total,
      queryParams: {
        page: 1,
        limit: 50,
        date_from: null,
        date_to: null,
        table_type: "purchase",
      },
      auth: this.props.auth,
      downloadingInfo: false,
      downloadingList: false,
      downloadingItem: false,
      downloadingCurrent: false,
      paymentOpen: false,
      productListOpen: false,
      activeTab: "section-purchase-details",
      profile: null,
      liveGoldPerGram: 0, // today's 24K rate per gram, for metal payments
    };

    this.columns = [
      {
        name: "payment_date",
        display_name: "Payment Date",
      },
      {
        // the amount stays in its own column, pending or not - the status is
        // shown under Actions (Pending / Accepted / Declined)
        name: "amount_value",
        fallback_name: "amount",
        display_name: "Amount",
      },
      {
        name: "payment_mode",
        display_name: "Payment Mode",
      },
      {
        name: "cheque_no",
        display_name: "Cheque #",
      },
      {
        name: "txn_id",
        display_name: "Transaction #",
      },
      {
        // fine weight of a metal payment
        name: "weight",
        display_name: "Weight",
      },
    ];
  }

  componentDidMount() {
    this.loadViewData();
    this.loadListData();
    getProfile().then((res) => {
      if (res.data.success) this.setState({ profile: res.data.data });
    });
    this.props.actions.purityList({ all: 1 });
    fetchLiveGoldRates().then((rates) =>
      this.setState({ liveGoldPerGram: rates ? rates.rate24 : 0, goldRates: rates })
    );
  }

  /* an admin (not an "own" account) may pay a purchase in metal */
  canPayMetal = () =>
    isAdmin() && this.state.profile && this.state.profile.own == false;

  /* every purity, so an admin holding no metal can still pay in metal (their
     stock goes below zero when it moves) */
  metalPurities = () =>
    (this.props.purityItems || []).map((item) => ({
      id: item.id,
      unit_id: item.unit_id || "",
      value: item.value,
      name: item.name + `${item.value ? "(" + item.value + "%)" : ""}`,
    }));

  /*
   * Metal is valued like the super admin's Pay Now: fine weight = gross x
   * purity, amount = fine x today's 24K rate, and the quoted rate saved with
   * the payment is the purity rate (24K x purity), which applies to the gross.
   */
  /* invoice fine metal: total, already paid, still payable */
  fineMetal = () =>
    invoiceFineMetal(
      this.state.purchase && this.state.purchase.products,
      this.state.items,
      this.props.purityItems,
    );

  /*
   * Metal is valued as the invoice bills gold - gross weight x the purity's
   * live karat rate - from the API's own rate. The API recomputes the same on
   * save, so what is shown here is what gets recorded. Fine = gross x purity.
   */
  /* a purity with its display name, e.g. "24 Carat(99.5%)" */
  metalPurityById = (id) => {
    const item = (this.props.purityItems || []).find((p) => p.id == id);
    return item
      ? { ...item, name: item.name + `${item.value ? "(" + item.value + "%)" : ""}` }
      : null;
  };

  /* the purity rate the amount uses, e.g. "24 Carat(99.5%) rate ₹14750.1/GM" */
  metalRateLabel = () => {
    const purity = this.metalPurityById(this.state.formValues.purity_id);
    const rate = purityRatePerGram(purity ? purity.value : 100, this.state.goldRates);
    return `${purity ? purity.name + " " : "24K "}rate ₹${rate}/GM`;
  };

  metalValues = (weight, purity) => {
    let gross = parseFloat(weight) || 0;
    const pct = purity ? parseFloat(purity.value) || 100 : 100;
    const rate = purityRatePerGram(pct, this.state.goldRates);
    let fine = parseFloat(((gross * pct) / 100).toFixed(3));
    /* no more than the invoice still owes in metal - the gross follows */
    const owed = this.fineMetal();
    let capped = {};
    if (owed && fine > owed.remaining) {
      fine = parseFloat(owed.remaining.toFixed(3));
      gross = parseFloat(((fine * 100) / pct).toFixed(3));
      capped = { weight: gross };
    }
    return {
      ...capped,
      effective_weight: gross > 0 ? fine : "",
      amount: gross > 0 && rate > 0 ? parseFloat((gross * rate).toFixed(2)) : "",
      metal_rate: rate > 0 ? rate : null,
    };
  };


  loadListData = () => {
    let data = { ...this.state.queryParams, table_id: this.props.params.id };
    this.props.actions.paymentList(data);
  };

  handlePagination = (page) => {
    this.setState(
      {
        queryParams: {
          ...this.state.queryParams,
          page: page,
        },
      },
      () => {
        this.loadListData();
      },
    );
  };

  handleDownloadInfo = async (id) => {
    // opened on the click itself so mobile does not treat it as a popup
    const fileWindow = prepareFileWindow();
    this.setState({
      downloadingInfo: true,
    });

    let response = await purchaseDownloadInvoiceInfo(id);
    if (response.data.success) {
      this.setState(
        {
          downloadingInfo: false,
        },
        () => {
          showFileWindow(fileWindow, response.data.data.url);
        },
      );

      /*var xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = (event) => {
        var blob = xhr.response;
        var downloaded = document.createElement('a');
        var downloadedurl = window.URL.createObjectURL(blob);
        downloaded.href = downloadedurl;
        downloaded.download = response.data.data.file_name;
        document.body.append(downloaded);
        downloaded.click();
        downloaded.remove();
        window.URL.revokeObjectURL(downloadedurl);
      };
      xhr.open('GET', response.data.data.url);
      xhr.send();*/
    } else {
      // the API failed, so the blank tab has nothing to show
      closeFileWindow(fileWindow);
      this.setState({
        downloadingInfo: false,
      });
    }
  };

  /*
   * The current-rate invoice of a purchase made from a sale is that sale's own
   * current invoice - same pieces, same invoice number - priced at today's gold
   * rate: held pieces billed, returned ones crossed out. The API lets the
   * buyer download it (current=1 only) on the seller's letterhead.
   */
  handleDownloadCurrent = async (saleId) => {
    // opened on the click itself so mobile does not treat it as a popup
    const fileWindow = prepareFileWindow();
    this.setState({ downloadingCurrent: true });
    try {
      const response = await salesDownloadInvoiceInfo(saleId, true);
      if (response.data.success) {
        this.setState({ downloadingCurrent: false }, () =>
          showFileWindow(fileWindow, response.data.data.url),
        );
      } else {
        closeFileWindow(fileWindow);
        this.setState({ downloadingCurrent: false });
        this.props.enqueueSnackbar(response.data.message || "Could not create the current invoice.", { variant: "error" });
      }
    } catch (e) {
      closeFileWindow(fileWindow);
      this.setState({ downloadingCurrent: false });
      this.props.enqueueSnackbar("Could not create the current invoice.", { variant: "error" });
    }
  };

  handleDownloadList = async (id) => {
    // opened on the click itself so mobile does not treat it as a popup
    const fileWindow = prepareFileWindow();
    this.setState({
      downloadingList: true,
    });

    let response = await purchaseDownloadInvoiceItemList(id);
    if (response.data.success) {
      this.setState(
        {
          downloadingList: false,
        },
        () => {
          showFileWindow(fileWindow, response.data.data.url);
        },
      );

      /*var xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = (event) => {
        var blob = xhr.response;
        var downloaded = document.createElement('a');
        var downloadedurl = window.URL.createObjectURL(blob);
        downloaded.href = downloadedurl;
        downloaded.download = response.data.data.file_name;
        document.body.append(downloaded);
        downloaded.click();
        downloaded.remove();
        window.URL.revokeObjectURL(downloadedurl);
      };
      xhr.open('GET', response.data.data.url);
      xhr.send();*/
    } else {
      // the API failed, so the blank tab has nothing to show
      closeFileWindow(fileWindow);
      this.setState({
        downloadingList: false,
      });
    }
  };

  handleDownloadItems = async (id) => {
    // opened on the click itself so mobile does not treat it as a popup
    const fileWindow = prepareFileWindow();
    this.setState({
      downloadingItem: true,
    });
    let response = await purchaseDownloadInvoiceItemDetails(id);
    if (response.data.success) {
      this.setState(
        {
          downloadingItem: false,
        },
        () => {
          showFileWindow(fileWindow, response.data.data.url);
        },
      );

      /*var xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = (event) => {
        var blob = xhr.response;
        var downloaded = document.createElement('a');
        var downloadedurl = window.URL.createObjectURL(blob);
        downloaded.href = downloadedurl;
        downloaded.download = response.data.data.file_name;
        document.body.append(downloaded);
        downloaded.click();
        downloaded.remove();
        window.URL.revokeObjectURL(downloadedurl);
      };
      xhr.open('GET', response.data.data.url);
      xhr.send();*/
    } else {
      // the API failed, so the blank tab has nothing to show
      closeFileWindow(fileWindow);
      this.setState({
        downloadingItem: false,
      });
    }
  };

  static getDerivedStateFromProps(props, state) {
    let update = {};
    if (props.actionCalled !== state.actionCalled) {
      update.actionCalled = props.actionCalled;
    }
    if (props.createSuccess !== state.createSuccess) {
      update.createSuccess = props.createSuccess;
    }
    if (props.successMessage !== state.successMessage) {
      update.successMessage = props.successMessage;
    }
    if (props.errorMessage !== state.errorMessage) {
      update.errorMessage = props.errorMessage;
    }
    if (props.items !== state.items) {
      update.items = props.items;
    }
    if (props.total !== state.total) {
      update.total = props.total;
    }
    if (props.auth !== state.auth) {
      update.auth = props.auth;
    }
    return update;
  }

  handlePayNow = () => {
    this.setState({ openDialog: true });
  };

  scrollToSection = (id) => {
    this.setState({ activeTab: id });
    if (id === "section-payment") {
      this.setState({ paymentOpen: true, activeTab: id }, () => {
        setTimeout(() => {
          const element = document.getElementById(id);
          if (element)
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 300);
      });
    } else if (id === "section-product-list") {
      this.setState({ productListOpen: true, activeTab: id }, () => {
        setTimeout(() => {
          const element = document.getElementById(id);
          if (element)
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 300);
      });
    } else {
      const element = document.getElementById(id);
      if (element)
        element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  togglePaymentSection = () => {
    this.setState((prev) => ({ paymentOpen: !prev.paymentOpen }));
  };

  toggleProductListSection = () => {
    this.setState((prev) => ({ productListOpen: !prev.productListOpen }));
  };

  handleDialogClose = (event, reason) => {
    if (reason && reason == "backdropClick") return;
    this.setState({
      openDialog: false,
    });
  };

  handleSupplierChange = (event) => {
    this.updateFormValue(event.target.value, "user_id");
    this.props.actions.paymentTotalDue(event.target.value);
  };

  updateFormValue = (value, key) => {
    this.setState({
      formValues: {
        ...this.state.formValues,
        [key]: value,
      },
    });
  };

  defaultFormValues = () => {
    return {
      formValues: {
        user_id: "",
        payment_mode: "",
        payment_date: moment().format("MM/DD/YYYY"),
        due_date: "",
        amount: "",
        notes: "",
        cheque_no: "",
        txn_id: "",
        material_id: "1", // Gold
        purity_id: "",
        unit_id: "",
        weight: "",
        effective_weight: "",
        metal_rate: null,
        table_type: "purchase",
        table_id: "",
      },
      formErros: {
        user_id: false,
        payment_mode: false,
        payment_date: false,
        amount: false,
        notes: false,
        cheque_no: false,
        txn_id: false,
        due_date: false,
        purity_id: false,
        weight: false,
      },
    };
  };

  handleSubmit = async () => {
    if (!this.formValidate()) {
      this.setState({
        processing: true,
      });
      const { formValues, purchase } = this.state;
      let data = {
        ...formValues,
        user_id: purchase.supplier_id,
        table_id: purchase.id,
        // the Due shown is at today's gold rate for a purchase made from a
        // sale, so the API re-values that sale before settling
        ...(purchase.sale ? { at_current_rate: 1 } : {}),
      };
      if (formValues.payment_mode !== "metal") {
        ["material_id", "purity_id", "unit_id", "weight", "effective_weight", "metal_rate"]
          .forEach((k) => delete data[k]);
      }
      /* The API moves the metal itself - when the super admin accepts the
         payment, or at once when it settles on the spot - writing the stock
         history; the admin's stock may go below zero. */
      await this.props.actions.paymentStore(data);
    }
  };

  formValidate = () => {
    let formValues = this.state.formValues;
    let formErros = this.state.formErros;
    let hasErr = false;
    if (
      parseFloat(formValues.amount) > parseFloat(this.state.purchase.due_amount)
    ) {
      hasErr = true;
      this.props.enqueueSnackbar(
        "Amount must be less than or equal due amount.",
        { variant: "error" },
      );
    }
    if (isEmpty(formValues.amount)) {
      formErros.amount = true;
      hasErr = true;
    } else {
      formErros.amount = false;
    }
    if (isEmpty(formValues.payment_mode)) {
      formErros.payment_mode = true;
      hasErr = true;
    } else {
      formErros.payment_mode = false;
    }
    if (formValues.payment_mode === "metal") {
      if (!(this.state.liveGoldPerGram > 0)) {
        hasErr = true;
        this.props.enqueueSnackbar(
          "Today's gold rate is not available right now. Please try again.",
          { variant: "error" },
        );
      }
      formErros.purity_id = isEmpty(formValues.purity_id);
      formErros.weight = !(parseFloat(formValues.weight) > 0);
      if (formErros.purity_id || formErros.weight) hasErr = true;
    }
    if (isEmpty(formValues.payment_date)) {
      formErros.payment_date = true;
      hasErr = true;
    } else {
      formErros.payment_date = false;
    }
    if (isEmpty(formValues.due_date)) {
      formErros.due_date = true;
      hasErr = true;
    } else {
      formErros.due_date = false;
    }
    this.setState({
      formErros: formErros,
    });
    return hasErr;
  };

  componentDidUpdate(prevProps) {
    if (this.props.params.id != prevProps.params.id) {
      this.loadViewData();
      this.loadListData();
    }

    if (this.state.actionCalled) {
      if (this.state.createSuccess) {
        this.props.enqueueSnackbar(this.state.successMessage, {
          variant: "success",
        });
        this.setState({
          processing: false,
          openDialog: false,
          queryParams: {
            ...this.state.queryParams,
            page: 1,
          },
          ...this.defaultFormValues(),
        });
        this.loadViewData();
        this.loadListData();
        this.props.actions.getNotifiactions();
      } else {
        this.props.enqueueSnackbar(this.state.errorMessage, {
          variant: "error",
        });
        this.setState({
          processing: false,
        });
      }
      this.props.dispatch({
        type: SUPERADMIN_RESET_PAYMENT,
      });
    }
  }

  loadViewData = async () => {
    this.setState({ purchase: null });
    const response = await purchaseViewRaw(this.props.params.id, true);
    if (!response.data.success) return;
    let purchase = response.data.data;
    /*
     * A purchase made from a sale is the same pieces as that sale, so it is
     * shown at today's gold rate exactly as the seller's Sale Details shows
     * it: held pieces repriced, returned ones flagged, report charge and the
     * Due worked out the same way. The purchase keeps its own identity,
     * supplier, payments and actions; only the figures come from the sale.
     */
    if (purchase.sale) {
      try {
        const live = await salesViewRaw(purchase.sale.id, true);
        if (live.data.success) {
          const sale = live.data.data;
          purchase = {
            ...purchase,
            subCatItems: sale.subCatItems,
            products: sale.products,
            taxable_amount: sale.taxable_amount,
            tax: sale.total_tax,
            discount: sale.discount,
            bill_amount: sale.bill_amount,
            total_payable: sale.total_payable,
            due_amount: sale.due_amount,
            due_amount_display: sale.due_amount_display,
            report_qty: sale.report_qty,
            report_charge: sale.report_charge,
            report_tax_percentage: sale.report_tax_percentage,
            at_current_rate: true,
          };
        }
      } catch (e) {
        // keep the stored figures if today's rate cannot be loaded
      }
    }
    this.setState({ purchase });
  };

  render() {
    const {
      purchase,
      formValues,
      formErros,
      downloadingInfo,
      downloadingItem,
      downloadingList,
    } = this.state;

    return (
      <>
        {/* Sticky header — plain divs, not Box: global .MuiBox-root in
            style.scss forces padding/margin 0 !important */}
        <div className="ratn-sticky-header">
          {/* Left: title + chip + tabs */}
          <div className="ratn-sticky-header-left">
            <span className="ratn-sticky-header-title">Purchase Details</span>
            {purchase && (
              <Chip
                label={purchase.approve_status}
                color={getApprovalColor(purchase.is_approved)}
              />
            )}
            {purchase && (
              <div className="ratn-sticky-header-tabs">
                {[
                  { id: "section-purchase-details", label: "Purchase Details" },
                  { id: "section-payment", label: "Payment" },
                  { id: "section-product-list", label: "Product List" },
                ].map((tab) => (
                  <Button
                    key={tab.id}
                    variant="contained"
                    size="small"
                    onClick={() => this.scrollToSection(tab.id)}
                    sx={{
                      borderRadius: "4px",
                      textTransform: "none",
                      backgroundColor:
                        this.state.activeTab === tab.id ? "#1E2746" : "#9e9e9e",
                      color: "#ffffff !important",
                      fontWeight: this.state.activeTab === tab.id ? 700 : 400,
                      "&:hover": {
                        backgroundColor:
                          this.state.activeTab === tab.id
                            ? "#1E2746"
                            : "#757575",
                      },
                    }}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Invoice + Back */}
          <div className="ratn-sticky-header-actions">
            {downloadingInfo ? (
              <CircularProgress size="28px" />
            ) : (
              <Button
                variant="contained"
                onClick={() => this.handleDownloadInfo(this.props.params.id)}
                sx={{ color: "#fff !important" }}
              >
                Invoice
                <FileDownloadIcon sx={{ ml: 0.5 }} />
              </Button>
            )}
            {/* the same jewellery re-costed at today's gold rate - only for a
                purchase made from a sale */}
            {purchase && purchase.sale ? (
              this.state.downloadingCurrent ? (
                <CircularProgress size="28px" />
              ) : (
                <Button
                  variant="contained"
                  onClick={() => this.handleDownloadCurrent(purchase.sale.id)}
                  sx={{ color: "#fff !important", backgroundColor: "#f57c00" }}
                  title="Re-costed at today's gold rate"
                >
                  Current Invoice
                  <FileDownloadIcon sx={{ ml: 0.5 }} />
                </Button>
              )
            ) : null}
            <Button
              variant="contained"
              onClick={() => this.props.navigate(-1)}
              sx={{ color: "#fff !important" }}
            >
              Back
            </Button>
          </div>
        </div>

        <MainCard id="downloadViewPurchase" border={false}>
          {!purchase ? (
            <Grid container justifyContent="center">
              <CircularProgress size="30px" />
            </Grid>
          ) : (
            <>
              {/* Purchase Details Section */}
              <Box id="section-purchase-details" className="invoice-block">
                <Grid container className="invoice-info-bar">
                  <Grid item xs={12} sm={6}>
                    <Typography className="invoice-company-name">
                      {purchase?.supplier_name}
                    </Typography>
                    {purchase?.supplier_mobile && (
                      <Typography className="invoice-info-line">
                        Contact: {purchase.supplier_mobile}
                      </Typography>
                    )}
                    {purchase?.supplier_gst && (
                      <Typography className="invoice-info-line">
                        GST: {purchase.supplier_gst}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6} className="invoice-info-right">
                    {purchase.invoice_number && (
                      <Typography className="invoice-info-line">
                        Invoice No: <b>{purchase.invoice_number}</b>
                      </Typography>
                    )}
                    <Typography className="invoice-info-line">
                      Invoice Date: {purchase.invoice_date}
                    </Typography>
                  </Grid>
                </Grid>

                <TableContainer
                  component={Paper}
                  className="invoice-table-wrapper"
                >
                  <div className="ratn-table-purchase-wrapper">
                    <Table
                      aria-label="collapsible table"
                      className="invoice_product_list table-bordered"
                    >
                      <TableHead className="ratn-table-header">
                        <TableRow>
                          <TableCell />
                          <TableCell>SL</TableCell>
                          <TableCell>Product Name</TableCell>
                          <TableCell>QTY</TableCell>
                          <TableCell>HSN</TableCell>
                          <TableCell>Material</TableCell>
                          <TableCell>WT</TableCell>
                          <TableCell>Unit</TableCell>
                          <TableCell>Rate</TableCell>
                          <TableCell>Tax@</TableCell>
                          <TableCell>Taxable Amt.</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {/* returned pieces are counted in the totals box, not billed */}
                        {purchase.subCatItems
                          .filter((row) => !row.is_return)
                          .map((row, i) => (
                            <SubCatRow key={i} row={row} index={i} />
                          ))}
                        {(() => {
                          const materialTotals = {};
                          let totalTaxableAmt = 0;
                          purchase.subCatItems
                            .filter((item) => !item.is_return)
                            .forEach((item) => {
                            const taxableAmt =
                              parseFloat(item.taxableAmount) || 0;
                            totalTaxableAmt += taxableAmt;
                            item.material.forEach((mat) => {
                              const key = mat.name;
                              if (!materialTotals[key]) {
                                materialTotals[key] = {
                                  weight: 0,
                                  unit: mat.unit,
                                  rate: parseFloat(mat.rate) || 0,
                                  amount: 0,
                                };
                              }
                              materialTotals[key].weight +=
                                parseFloat(mat.weight) || 0;
                              const amt =
                                (mat.material_cost != null /* after the discount */ ? parseFloat(mat.material_cost) || 0 : (parseFloat(mat.weight) || 0) *
                                (parseFloat(mat.rate) || 0));
                              materialTotals[key].amount += amt;
                            });
                          });
                          const entries = Object.entries(materialTotals);
                          if (entries.length === 0) return null;
                          const parseAmt = (v) =>
                            parseFloat(
                              String(v || "").replace(/[^0-9.-]+/g, ""),
                            ) || 0;
                          const discountAmt = parseAmt(purchase.discount);
                          return (
                            <>
                              <TableRow>
                                <TableCell
                                  colSpan={11}
                                  style={{
                                    borderBottom: "none",
                                    padding: "4px",
                                  }}
                                />
                              </TableRow>
                              {entries.map(([name, data], idx) => (
                                <TableRow
                                  key={idx}
                                  sx={{
                                    "& td": {
                                      borderBottom: "none",
                                      padding: "2px 16px",
                                    },
                                  }}
                                >
                                  <TableCell
                                    colSpan={5}
                                    style={{ fontSize: "13px", color: "#555" }}
                                  >
                                    {name}
                                  </TableCell>
                                  <TableCell
                                    style={{ fontSize: "13px", color: "#555" }}
                                  >
                                    {data.weight.toFixed(3)} {data.unit}
                                  </TableCell>
                                  <TableCell
                                    colSpan={2}
                                    style={{ fontSize: "13px", color: "#555" }}
                                  >
                                    × ₹{formatIndianNumber((data.weight ? data.amount / data.weight : data.rate))}
                                  </TableCell>
                                  <TableCell
                                    colSpan={3}
                                    style={{
                                      fontSize: "13px",
                                      color: "#555",
                                      textAlign: "right",
                                    }}
                                  >
                                    ₹{formatIndianNumber(data.amount)}
                                  </TableCell>
                                </TableRow>
                              ))}
                              <TableRow>
                                <TableCell
                                  colSpan={8}
                                  style={{
                                    fontSize: "15px",
                                    fontWeight: 700,
                                    color: "#1E2746",
                                    borderTop: "2px solid #90caf9",
                                    borderBottom: "none",
                                  }}
                                >
                                  Taxable Amt.
                                </TableCell>
                                <TableCell
                                  colSpan={3}
                                  style={{
                                    fontSize: "15px",
                                    fontWeight: 700,
                                    color: "#1E2746",
                                    textAlign: "right",
                                    borderTop: "2px solid #90caf9",
                                    borderBottom: "none",
                                  }}
                                >
                                  ₹{totalTaxableAmt.toFixed(2)}
                                </TableCell>
                              </TableRow>
                              {discountAmt > 0 && (
                                <TableRow>
                                  <TableCell
                                    colSpan={8}
                                    style={{
                                      fontSize: "15px",
                                      fontWeight: 700,
                                      color: "#1E2746",
                                      borderBottom: "none",
                                    }}
                                  >
                                    Discount
                                  </TableCell>
                                  <TableCell
                                    colSpan={3}
                                    style={{
                                      fontSize: "15px",
                                      fontWeight: 700,
                                      color: "#1E2746",
                                      textAlign: "right",
                                      borderBottom: "none",
                                    }}
                                  >
                                    - ₹{formatIndianNumber(discountAmt)}
                                  </TableCell>
                                </TableRow>
                              )}
                            </>
                          );
                        })()}
                      </TableBody>
                    </Table>
                  </div>
                </TableContainer>

                <Grid container className="invoice-totals-row">
                  <Grid item xs={12} sm={6}>
                    {purchase.notes && (
                      <Typography className="invoice-info-line invoice-notes">
                        Notes: {purchase.notes}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <div className="invoice-totals-box">
                      {(() => {
                        const parseAmt = (v) =>
                          parseFloat(
                            String(v || "").replace(/[^0-9.-]+/g, ""),
                          ) || 0;
                        const subTotal = parseAmt(purchase.taxable_amount);
                        const tax = parseAmt(purchase.tax);
                        const discount = parseAmt(purchase.discount);
                        // at today's rate the payable carries the report
                        // charge and its GST, so they are shown as well
                        const report = purchase.at_current_rate
                          ? (parseFloat(purchase.report_qty) || 0) *
                            (parseFloat(purchase.report_charge) || 0)
                          : 0;
                        const reportTax =
                          (report * (parseFloat(purchase.report_tax_percentage) || 0)) / 100;
                        const returnedCount = (purchase.products || []).filter(
                          (p) => p.is_return,
                        ).length;
                        return (
                          <>
                            {returnedCount > 0 && (
                              <div className="invoice-totals-line">
                                <span>Returned Items</span>
                                <span>{returnedCount}</span>
                              </div>
                            )}
                            <div className="invoice-totals-line">
                              <span style={{ fontWeight: 700 }}>Sub Total</span>
                              <span style={{ fontWeight: 700 }}>
                                ₹{formatIndianNumber(subTotal)}
                              </span>
                            </div>
                            {report > 0 && (
                              <div className="invoice-totals-line">
                                <span>
                                  Report Charge ({purchase.report_qty} x ₹
                                  {formatIndianNumber(purchase.report_charge)})
                                </span>
                                <span>₹{formatIndianNumber(report)}</span>
                              </div>
                            )}
                            <div className="invoice-totals-line">
                              <span>Tax</span>
                              <span>₹{formatIndianNumber(tax)}</span>
                            </div>
                            {reportTax > 0 && (
                              <div className="invoice-totals-line">
                                <span>
                                  Report Tax ({parseFloat(purchase.report_tax_percentage)}%)
                                </span>
                                <span>₹{formatIndianNumber(reportTax)}</span>
                              </div>
                            )}
                            <div className="invoice-totals-line">
                              <span>Discount</span>
                              <span>
                                - ₹
                                {formatIndianNumber(
                                  discount > 0 ? discount : 0,
                                )}
                              </span>
                            </div>
                          </>
                        );
                      })()}
                      <div className="invoice-totals-line invoice-totals-line-final">
                        <span style={{ fontWeight: 700 }}>Total Payable</span>
                        <span style={{ fontWeight: 700 }}>
                          {purchase.total_payable || purchase.bill_amount}
                        </span>
                      </div>
                    </div>
                  </Grid>
                </Grid>

                <Grid container className="invoice-footer-band">
                  <Grid item xs={6} sm={3}>
                    <span className="invoice-footer-label">Due Date</span>
                    <br />
                    {purchase.due_date}
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <span className="invoice-footer-label">Return Amount</span>
                    <br />
                    {purchase.return_amount}
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <span className="invoice-footer-label">Paid Amount</span>
                    <br />
                    {purchase.paid_amount_display}
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <span className="invoice-footer-label">Due Amount</span>
                    <br />
                    {purchase.due_amount_display}
                  </Grid>
                </Grid>
              </Box>

              <Divider
                sx={{ my: 2, borderColor: "#1E2746", borderWidth: "1px" }}
              />

              {/* Payment Section */}
              <div id="section-payment">
                <Grid
                  container
                  spacing={{ xs: 2, md: 2 }}
                  style={{ paddingBottom: "1%", cursor: "pointer" }}
                  onClick={this.togglePaymentSection}
                  alignItems="center"
                >
                  <Grid item xs={4} md={6} sm={5}>
                    <h3
                      className="p_heading_list"
                      style={{ margin: 0, fontSize: "20px" }}
                    >
                      Payment Details
                    </h3>
                  </Grid>
                  <Grid
                    item
                    xs={8}
                    md={6}
                    sm={7}
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {purchase && parseFloat(purchase.due_amount) > 0 ? (
                      <div className="action_btn">
                        <Button
                          variant="contained"
                          onClick={(e) => {
                            e.stopPropagation();
                            this.handlePayNow();
                          }}
                        >
                          Pay Now
                        </Button>
                      </div>
                    ) : null}
                    <IconButton size="small">
                      {this.state.paymentOpen ? (
                        <KeyboardArrowUpIcon />
                      ) : (
                        <KeyboardArrowDownIcon />
                      )}
                    </IconButton>
                  </Grid>
                </Grid>

                <Collapse
                  in={this.state.paymentOpen}
                  timeout="auto"
                  unmountOnExit
                >
                  {!purchase.is_assigned ? (
                    <Grid
                      item
                      xs={12}
                      className="p-add-product create-input button-right"
                    >
                      <DataTable
                        columns={this.columns}
                        rows={this.state.items}
                        page={this.state.queryParams.page}
                        limit={this.state.queryParams.limit}
                        total={this.state.total}
                        handlePagination={this.handlePagination}
                        actions={[]}
                        actionValue={"action_value"}
                        actionValueColorConditions={PAYMENT_STATUS_COLORS}
                        /*
                          An accepted payment that had newer rows above it is listed as a
                          single "Accepted" row; the request it replaced folds underneath
                          and opens with the chevron - same as the wallet screen.
                        */
                        expandableKey="history"
                        expandableFlag="has_history"
                      />
                    </Grid>
                  ) : null}
                </Collapse>
              </div>

              <Divider
                sx={{ my: 2, borderColor: "#1E2746", borderWidth: "1px" }}
              />

              {/* Product List Section */}
              <div id="section-product-list">
                <Grid
                  container
                  spacing={{ xs: 2, md: 3 }}
                  style={{ cursor: "pointer" }}
                  onClick={this.toggleProductListSection}
                  alignItems="center"
                >
                  <Grid item xs={4} md={6} sm={5}>
                    <h3
                      className="p_heading_list"
                      style={{ margin: 0, fontSize: "20px" }}
                    >
                      Product List
                    </h3>
                  </Grid>
                  <Grid
                    item
                    xs={8}
                    md={6}
                    sm={7}
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div className="action_btn">
                      {downloadingList ? (
                        <CircularProgress size="30px" />
                      ) : (
                        <Button
                          variant="contained"
                          onClick={(e) => {
                            e.stopPropagation();
                            this.handleDownloadList(this.props.params.id);
                          }}
                        >
                          <span className="download-text">List</span>
                          <FileDownloadIcon size="20px" />
                        </Button>
                      )}
                    </div>
                    <div className="action_btn">
                      {downloadingItem ? (
                        <CircularProgress size="30px" />
                      ) : (
                        <Button
                          variant="contained"
                          onClick={(e) => {
                            e.stopPropagation();
                            this.handleDownloadItems(this.props.params.id);
                          }}
                        >
                          <span className="download-text">Details</span>
                          <FileDownloadIcon />
                        </Button>
                      )}
                    </div>
                    <IconButton size="small">
                      {this.state.productListOpen ? (
                        <KeyboardArrowUpIcon />
                      ) : (
                        <KeyboardArrowDownIcon />
                      )}
                    </IconButton>
                  </Grid>
                </Grid>

                <Collapse
                  in={this.state.productListOpen}
                  timeout="auto"
                  unmountOnExit
                >
                  <Grid
                    container
                    spacing={gridSpacing}
                    className="details-header ratn-pur-wrapper loans_view"
                  >
                    <Grid item xs={12}>
                      <TableContainer component={Paper}>
                        <div className="ratn-table-purchase-wrapper">
                          <Table
                            aria-label="collapsible table"
                            className="invoice_product_list"
                          >
                            <TableHead className="ratn-table-header">
                              <TableRow>
                                <TableCell />
                                <TableCell>#</TableCell>
                                <TableCell>Product Name</TableCell>
                                <TableCell>Category Name</TableCell>
                                <TableCell>Certificate Number</TableCell>
                                <TableCell>Total Weight</TableCell>
                                <TableCell>Size</TableCell>
                                <TableCell>Making Charge</TableCell>
                                <TableCell>Sub Total</TableCell>
                                <TableCell>Dist</TableCell>
                                <TableCell>Tax</TableCell>
                                <TableCell colSpan="2">Total</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {purchase.products.map((row, i) => (
                                <Row key={i} row={row} index={i} />
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </TableContainer>
                    </Grid>
                  </Grid>
                </Collapse>
              </div>
            </>
          )}

          <Dialog
            className="ratn-dialog-wrapper"
            open={this.state.openDialog}
            onClose={this.handleDialogClose}
            fullWidth
            maxWidth="md"
          >
            <DialogTitle>Pay Now</DialogTitle>
            <DialogContent>
              <DialogContentText></DialogContentText>
              <Box sx={{ flexGrow: 1, m: 0.5 }}>
                <Grid container spacing={2}>
                  <Grid
                    item
                    md={4}
                    xs={12}
                    className="p-invoice-date create-input"
                  >
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Payment Date"
                        value={formValues.payment_date}
                        inputFormat="DD/MM/YYYY"
                        onChange={(newValue) =>
                          this.updateFormValue(newValue, "payment_date")
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            error={formErros.payment_date}
                            className="non_disable_text"
                          />
                        )}
                        disabled
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item md={4} xs={12} className="create-input">
                    <TextField
                      label="Amount"
                      variant="outlined"
                      fullWidth
                      value={formValues.amount}
                      disabled={formValues.payment_mode === "metal"}
                      helperText={
                        formValues.payment_mode === "metal" && this.state.liveGoldPerGram > 0
                          ? `Gross weight x today's ${this.metalRateLabel()}`
                          : ""
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">₹</InputAdornment>
                        ),
                      }}
                      error={formErros.amount}
                      onChange={(event) =>
                        this.updateFormValue(event.target.value, "amount")
                      }
                    />
                  </Grid>
                  <Grid item md={4} xs={12} className="create-input">
                    <FormControl fullWidth error={formErros.payment_mode}>
                      <InputLabel>Payment Mode</InputLabel>
                      <Select
                        className="input-inner"
                        value={formValues.payment_mode}
                        fullWidth
                        label="Payment Mode"
                        onChange={(event) =>
                          this.updateFormValue(
                            event.target.value,
                            "payment_mode",
                          )
                        }
                      >
                        <MenuItem value=""></MenuItem>
                        <MenuItem value="cash">Cash</MenuItem>
                        <MenuItem value="cheque">Cheque</MenuItem>
                        <MenuItem value="imps_neft">BANKING/RTGS/NEFT</MenuItem>
                        <MenuItem value="online">UPI/PhonePe/Gpay</MenuItem>
                        {this.canPayMetal() && (
                          <MenuItem value="metal">Metal</MenuItem>
                        )}
                      </Select>
                    </FormControl>
                  </Grid>
                  {formValues.payment_mode === "cheque" ? (
                    <Grid item md={4} xs={12} className="create-input">
                      <TextField
                        label="Cheque No"
                        variant="outlined"
                        fullWidth
                        value={formValues.cheque_no}
                        onChange={(event) =>
                          this.updateFormValue(event.target.value, "cheque_no")
                        }
                      />
                    </Grid>
                  ) : null}
                  {formValues.payment_mode === "imps_neft" ||
                  formValues.payment_mode === "upi" ? (
                    <Grid item md={4} xs={12} className="create-input">
                      <TextField
                        label="Transaction #"
                        variant="outlined"
                        fullWidth
                        value={formValues.txn_id}
                        onChange={(event) =>
                          this.updateFormValue(event.target.value, "txn_id")
                        }
                      />
                    </Grid>
                  ) : null}
                  {this.canPayMetal() && formValues.payment_mode === "metal" ? (
                    <>
                      {(() => {
                        const owed = this.fineMetal();
                        if (!owed) return null;
                        const purity = this.metalPurities().find((p) => p.id == formValues.purity_id);
                        return (
                          <Grid item xs={12} className="create-input">
                            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, p: "6px 12px", bgcolor: "#e8f5e9", borderRadius: 1 }}>
                              <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
                                Metal Needed{purity ? ` (${purity.name})` : " (24K)"}:
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: "#1a7a1a" }}>
                                {(purity && parseFloat(purity.value) > 0 ? (owed.remaining * 100) / parseFloat(purity.value) : owed.remaining).toFixed(3)} GM
                              </Typography>
                              {purity && parseFloat(purity.value) > 0 && (
                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                  (= {owed.remaining.toFixed(3)} GM fine)
                                </Typography>
                              )}
                              {owed.paid > 0 && (
                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                  (already paid {owed.paid.toFixed(3)} GM of {owed.total.toFixed(3)} GM)
                                </Typography>
                              )}
                            </Box>
                          </Grid>
                        );
                      })()}
                      <Grid item md={4} xs={12} className="create-input">
                        <FormControl fullWidth error={formErros.purity_id}>
                          <InputLabel>Purity</InputLabel>
                          <Select
                            className="input-inner"
                            value={formValues.purity_id}
                            fullWidth
                            label="Purity"
                            onChange={(event) => {
                              const purity = this.metalPurities().find(
                                (item) => item.id == event.target.value,
                              );
                              if (!purity) return;
                              this.setState({
                                formValues: {
                                  ...this.state.formValues,
                                  ...this.metalValues(formValues.weight, purity),
                                  purity_id: purity.id,
                                  unit_id: purity.unit_id,
                                },
                              });
                            }}
                          >
                            {this.metalPurities().map((item) => (
                              <MenuItem key={item.id} value={item.id}>
                                {item.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item md={4} xs={12} className="create-input">
                        <TextField
                          label="Gross Weight(GM)"
                          variant="outlined"
                          fullWidth
                          type="number"
                          inputProps={{ step: "0.001", min: 0 }}
                          error={formErros.weight}
                          value={formValues.weight}
                          onChange={(event) => {
                            let value = event.target.value;
                            // 3 decimals, like every other weight
                            if (value.includes(".") && value.split(".")[1].length > 3) {
                              value = parseFloat(value).toFixed(3);
                            }
                            const purity = this.metalPurities().find(
                              (item) => item.id == formValues.purity_id,
                            );
                            this.setState({
                              formValues: {
                                ...this.state.formValues,
                                weight: value,
                                ...this.metalValues(value, purity),
                              },
                            });
                          }}
                        />
                        {formValues.effective_weight > 0 ? (
                          <Typography variant="h6" gutterBottom component="div">
                            {`Fine weight : ${formValues.effective_weight} GM`}
                          </Typography>
                        ) : null}
                      </Grid>
                    </>
                  ) : null}
                  <Grid item md={4} xs={12} className="create-input">
                    <TextareaAutosize
                      className="description"
                      minRows={1}
                      placeholder="Notes"
                      style={{ width: "100%", height: "51px" }}
                      value={formValues.notes}
                      onChange={(event) =>
                        this.updateFormValue(event.target.value, "notes")
                      }
                    />
                  </Grid>
                  <Grid
                    item
                    md={4}
                    xs={12}
                    className="p-invoice-date create-input"
                  >
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Due Date"
                        value={formValues.due_date}
                        inputFormat="DD/MM/YYYY"
                        onChange={(newValue) =>
                          this.updateFormValue(newValue, "due_date")
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            error={formErros.due_date}
                          />
                        )}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack
                      spacing={1}
                      direction="row"
                      justifyContent="flex-end"
                    >
                      <Button
                        variant="contained"
                        type="button"
                        disabled={this.state.processing}
                        onClick={this.handleSubmit}
                      >
                        {this.state.processing ? "Processing" : "Submit"}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={this.handleDialogClose}
                      >
                        Cancel
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
          </Dialog>
        </MainCard>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  actionCalled: state.superadmin.payment.actionCalled,
  createSuccess: state.superadmin.payment.createSuccess,
  successMessage: state.superadmin.payment.successMessage,
  errorMessage: state.superadmin.payment.errorMessage,
  items: state.superadmin.payment.items,
  total: state.superadmin.payment.total,
  auth: state.auth,
  purityItems: state.superadmin.purity.items,
});

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
    actions: bindActionCreators(
      {
        paymentStore,
        paymentList,
        purityList,
        getNotifiactions,
      },
      dispatch,
    ),
  };
};

export default withSnackbar(
  withRouter(connect(mapStateToProps, mapDispatchToProps)(PurchaseViewPage)),
);

function SubCatRow(props) {
  const { row, index } = props;
  const [open, setOpen] = React.useState(false);
  const sl_no = index + 1;
  let odd_even_class = sl_no % 2 == 0 ? "SubCatRow_even" : "SubCatRow_odd";
  if (row.is_return) {
    odd_even_class += " strike_through";
  }

  let materialNames = row.material
    .map((itm) => itm.name)
    .join("\n")
    .replace(/\n/g, "<br/>");
  let materialWts = row.material
    .map((itm) => itm.weight.toFixed(2))
    .join("\n")
    .replace(/\n/g, "<br/>");
  let materialUnits = row.material
    .map((itm) => itm.unit)
    .join("\n")
    .replace(/\n/g, "<br/>");
  let materialRates = row.material
    .map((itm) => /* rate after discount, so it matches the amount charged */ (itm.material_cost != null && parseFloat(itm.weight) ? parseFloat(itm.material_cost) / parseFloat(itm.weight) : parseFloat(itm.rate)).toFixed(2))
    .join("\n")
    .replace(/\n/g, "<br/>");

  return (
    <React.Fragment>
      <TableRow
        sx={{ "& > *": { borderBottom: "unset" } }}
        className={odd_even_class}
      >
        <TableCell>
          {/* <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
            className="expand_icon"
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton> */}
        </TableCell>
        <TableCell component="th" scope="row">
          {sl_no <= 9 ? "0" + sl_no : sl_no}
        </TableCell>
        <TableCell component="th" scope="row">
          {row.name}
        </TableCell>
        <TableCell>{row.qty}</TableCell>
        <TableCell>{row.hsn}</TableCell>
        <TableCell
          dangerouslySetInnerHTML={{ __html: materialNames }}
        ></TableCell>
        <TableCell
          dangerouslySetInnerHTML={{ __html: materialWts }}
        ></TableCell>
        <TableCell
          dangerouslySetInnerHTML={{ __html: materialUnits }}
        ></TableCell>
        <TableCell
          dangerouslySetInnerHTML={{ __html: materialRates }}
        ></TableCell>
        <TableCell>{row.tax}%</TableCell>
        <TableCell>{row.taxableAmount.toFixed(2)}</TableCell>
      </TableRow>
      {/* <TableRow className={'table-inner-row sub_table ' + odd_even_class}>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={11}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="span">

              </Typography>
              <Table size="medium" aria-label="purchases">
                <TableHead>
                  <TableRow className='pur-details-inner-table'>
                    <TableCell>Material Name</TableCell>
                    <TableCell>Purity</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Weight</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>Rate</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Dist</TableCell>
                    {
                      row.product_type == "material" ?
                        <>
                          <TableCell>Return Weight</TableCell>
                          <TableCell>Return Qty</TableCell>
                        </>
                        : null
                    }
                  </TableRow>
                </TableHead>
                <TableBody className='pur-details-table-body'>
                  {row.materials.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell component="th" scope="row">
                        {item.material_name}
                      </TableCell>
                      <TableCell>{item.purity_name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.weight}</TableCell>
                      <TableCell>{item.unit_name}</TableCell>
                      <TableCell>{item.rate}</TableCell>
                      <TableCell>{item.amount}</TableCell>
                      <TableCell>{item.discount_amount_display}</TableCell>
                      {
                        row.product_type == "material" ?
                          <>
                          <TableCell>{item.return_weight}</TableCell>
                          <TableCell>{item.return_qty}</TableCell>
                          </>
                          : null
                      }
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow> */}
    </React.Fragment>
  );
}

function Row(props) {
  const { row, index } = props;
  const [open, setOpen] = React.useState(true);
  const sl_no = index + 1;
  let odd_even_class = sl_no % 2 == 0 ? "even" : "odd";
  if (row.is_return) {
    odd_even_class += " strike_through";
  }
  return (
    <React.Fragment>
      <TableRow
        sx={{ "& > *": { borderBottom: "unset" } }}
        className={odd_even_class}
      >
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
            className="expand_icon"
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row" style={{ color: "#fff" }}>
          {sl_no <= 9 ? "0" + sl_no : sl_no}
        </TableCell>
        <TableCell component="th" scope="row" style={{ color: "#fff" }}>
          {row.product_name}
        </TableCell>
        <TableCell style={{ color: "#fff" }}>{row.category_name}</TableCell>
        <TableCell style={{ color: "#fff" }}>{row.certificate_no}</TableCell>
        <TableCell style={{ color: "#fff" }}>{row.total_weight}</TableCell>
        <TableCell style={{ color: "#fff" }}>{row.size_name}</TableCell>
        <TableCell style={{ color: "#fff" }}>{row.making_charge}</TableCell>
        <TableCell style={{ color: "#fff" }}>{row.rep}</TableCell>
        <TableCell style={{ color: "#fff" }}>{row.sub_total}</TableCell>
        <TableCell style={{ color: "#fff" }}>{row.total_discount}</TableCell>
        <TableCell style={{ color: "#fff" }}>{row.tax}</TableCell>
        <TableCell style={{ color: "#fff" }}>{row.total}</TableCell>
      </TableRow>
      <TableRow className={"table-inner-row sub_table " + odd_even_class}>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={11}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography
                variant="h6"
                gutterBottom
                component="div"
              ></Typography>
              <Table size="medium" aria-label="purchases">
                <TableHead>
                  <TableRow className="pur-details-inner-table">
                    <TableCell className={odd_even_class}>
                      Material Name
                    </TableCell>
                    <TableCell className={odd_even_class}>Purity</TableCell>
                    <TableCell className={odd_even_class}>Quantity</TableCell>
                    <TableCell className={odd_even_class}>
                      Total Weight
                    </TableCell>
                    {row.product_code == "" ? (
                      <TableCell className={odd_even_class}>
                        Pakka Weight
                      </TableCell>
                    ) : (
                      ""
                    )}
                    <TableCell className={odd_even_class}>Unit</TableCell>
                    <TableCell className={odd_even_class}>Rate</TableCell>
                    <TableCell className={odd_even_class}>Amount</TableCell>
                    <TableCell className={odd_even_class}>Dist</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody className="pur-details-table-body">
                  {row.materials.map((item, i) =>
                    !(item.weight == 0 && item.quantity == 0) ? (
                      <TableRow key={i}>
                        {/* {console.log(
                          "---------------- view",
                          item.weight != 0 ||
                            (item.quantity != 0 && item.rate != 0.0)
                        )}
                        {console.log(
                          "--------------row.materials",
                          row.materials
                        )} */}
                        <TableCell scope="row" className={odd_even_class}>
                          {item.material_name}
                        </TableCell>
                        <TableCell className={odd_even_class}>
                          {item.purity_name}
                        </TableCell>
                        <TableCell className={odd_even_class}>
                          {item.quantity}
                        </TableCell>
                        <TableCell className={odd_even_class}>
                          {item.weight}
                        </TableCell>
                        {row.product_code == "" ? (
                          <TableCell className={odd_even_class}>
                            {item.pakka_weight}
                          </TableCell>
                        ) : (
                          ""
                        )}
                        <TableCell className={odd_even_class}>
                          {item.unit_name}
                        </TableCell>
                        <TableCell className={odd_even_class}>
                          {item.rate}
                        </TableCell>
                        <TableCell className={odd_even_class}>
                          {item.amount}
                        </TableCell>
                        <TableCell className={odd_even_class}>
                          {item.discount_amount}
                        </TableCell>
                      </TableRow>
                    ) : null,
                  )}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}
