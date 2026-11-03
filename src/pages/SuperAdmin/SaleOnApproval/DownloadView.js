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
  salesOnApproveViewRaw,
  salesOnApprovalDownloadInvoiceInfo,
  salesOnApprovalDownloadInvoiceItemList,
  salesOnApprovalDownloadInvoiceItemDetails,
} from "actions/superadmin/sales.actions";
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
  isSuperAdmin,
  isAdmin,
  formatIndianNumber,
  getRoleName,
  getUserDashboardRoute,
  getApprovalColor,
  convertUnitToGram, prepareFileWindow, showFileWindow, closeFileWindow } from "src/helpers/helper";
import { metalValuesFromFine as computeMetalValues } from "src/helpers/metalPayment.mjs";
import { fetchLiveGoldRates, purityRatePerGram, fineRatePerGram } from "src/helpers/goldRate";
import { paymentStore, paymentList } from "actions/superadmin/payment.actions";
import { SUPERADMIN_RESET_PAYMENT } from "../../../actionTypes/superadmin/payment.types";
import { getNotifiactions } from "actions/superadmin/notification.actions";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { stocksList } from "actions/superadmin/stocks.actions";
import { stocksTransferHistoryStore } from "actions/superadmin/stockHistory.actions";
import { purityList } from "actions/superadmin/purity.actions";
import "./style.css";
import { PAYMENT_STATUS_COLORS } from "../../../utils/paymentStatusColors";

class SaleViewPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sale: null,
      materialStocks: this.props.materialStocks,
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
        table_type: "sale",
      },
      auth: this.props.auth,
      downloadingInfo: false,
      downloadingCurrent: false,
      downloadingList: false,
      downloadingItem: false,
      paymentOpen: false,
      productListOpen: false,
      activeTab: "section-sale-details",
      liveGoldPerGram: 0,
      liveGoldPriceDisplay: '',
      selectedPurityLabel: '',
      selectedPurityPerGram: 0,
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
        name: "weight",
        display_name: "Weight",
      },
    ];
  }

  componentDidMount() {
    this.loadViewData();
    this.loadListData();
    this.props.actions.purityList({ all: 1 });
  }

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

  handleDownloadInfo = async (id, current = false) => {
    // opened on the click itself so mobile does not treat it as a popup
    const fileWindow = prepareFileWindow();
    this.setState(
      current ? { downloadingCurrent: true } : { downloadingInfo: true }
    );

    let response = await salesOnApprovalDownloadInvoiceInfo(id, current);
    if (response.data.success) {
      /*if(response.data.data.html){
        var newWindow = window.open();
        newWindow.document.write(response.data.data.html);
        return false;
      }*/
      this.setState(
        { downloadingInfo: false, downloadingCurrent: false },
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
      this.setState({ downloadingInfo: false, downloadingCurrent: false });
    }
  };

  handleDownloadList = async (id) => {
    // opened on the click itself so mobile does not treat it as a popup
    const fileWindow = prepareFileWindow();
    this.setState({
      downloadingList: true,
    });

    let response = await salesOnApprovalDownloadInvoiceItemList(id);
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

    let response = await salesOnApprovalDownloadInvoiceItemDetails(id);
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
    if (props.materialStocks !== state.materialStocks) {
      update.materialStocks = props.materialStocks;
    }
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
    /* the API's rate - the one the invoice and the saved payment use */
    fetchLiveGoldRates({ force: true }).then((rates) => {
      if (rates && rates.rate24 > 0) {
        this.setState({
          liveGoldPerGram: rates.rate24,
          liveGoldPriceDisplay: rates.display || `₹${rates.rate24.toLocaleString('en-IN')}`,
          goldRates: rates,
        });
      }
    });
    this.props.actions.stocksList({
      page: 1,
      limit: 50,
      category_id: "",
      sub_category_id: "",
      search: "",
      type: "material",
      all: 0,
      by_specific: "",
      manager: "",
      user_id: this.state.sale.user_id,
      material_id: this.state.formValues.material_id, // Gold
    });
    this.setState({
      openDialog: true,
    });
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
        material_id: "1", // Gold
        purity_id: "",
        unit_id: "",
        payment_date: moment().format("MM/DD/YYYY"),
        due_date: "",
        amount: "",
        notes: "",
        cheque_no: "",
        txn_id: "",
        weight: "",
        effective_weight: "",
        table_type: "sale",
        table_id: "",
      },
      formErros: {
        user_id: false,
        purity_id: false,
        payment_mode: false,
        payment_date: false,
        amount: false,
        notes: false,
        cheque_no: false,
        txn_id: false,
        weight: false,
        due_date: false,
      },
    };
  };

  // Per-gram rate for the selected purity. The feed's 24K price is already
  // quoted at 24 Carat (99.50 in the purity master), so it is taken as-is for
  // 24 Carat and pro-rated from there — e.g. 18 Carat of a 14422 spot is
  // 14422 x 76 / 99.5 = 11017.75, not 14422 x 76 / 100.
  getQuotedMetalRate = () => {
    const { goldRates, formValues } = this.state;
    const purity = (this.props.purityItems || []).find(
      (p) => p.id == formValues.purity_id
    );
    const rate = purityRatePerGram(parseFloat(purity?.value) || 100, goldRates);
    return rate > 0 ? rate : null;
  };

  handleSubmit = async () => {
    if (!this.formValidate()) {
      this.setState({ processing: true });
      const { formValues, sale } = this.state;
      const isMetalPayment = formValues.payment_mode === 'metal';
      const quotedRate = this.getQuotedMetalRate();
      /* metal: the amount the API records - gross weight x purity rate - so the
         stock transfer and the payment carry the same figure */
      const totalAmount =
        isMetalPayment && quotedRate > 0 && parseFloat(formValues.weight) > 0
          ? parseFloat((parseFloat(formValues.weight) * quotedRate).toFixed(2))
          : parseFloat(formValues.amount) || 0;
      // Store the rate the operator was actually quoted - the purity rate,
      // which applies to the gross weight. Deriving amount/fine_weight later
      // would give the 24K rate instead, which is not what was agreed.
      const metalRate = quotedRate;

      // 1. Record payment against the sale
      this.props.actions.paymentStore({
        ...formValues,
        amount: totalAmount,
        metal_rate: isMetalPayment ? metalRate : null,
        user_id: sale.user_id,
        table_id: sale.id,
        effective_weight: isMetalPayment ? formValues.weight : formValues.effective_weight,
      });

      // 2. Transfer metal from buyer to seller's material stock
      if (isMetalPayment) {
        try {
          const stockRes = await stocksTransferHistoryStore({
            from_user_id: sale.user_id,
            to_user_id: sale.sale_by_id,
            material_id: formValues.material_id,
            quantity: 0,
            payment_mode: 'metal',
            amount: totalAmount,
            metal_rate: metalRate,
            ref_no: sale.invoice_number || `SALE-${sale.id}`,
            purity_id: formValues.purity_id || '',
            unit_id: formValues.unit_id || '',
            weight: formValues.weight,
            effective_weight: formValues.effective_weight || formValues.weight,
          });
          if (!stockRes?.data?.success) {
            this.props.enqueueSnackbar(
              stockRes?.data?.message || 'Metal stock update failed.',
              { variant: 'warning' }
            );
          }
        } catch (e) {
          this.props.enqueueSnackbar('Metal stock update failed.', { variant: 'warning' });
        }
      }
    }
  };

  formValidate = () => {
    let formValues = this.state.formValues;
    let formErros = this.state.formErros;
    let hasErr = false;
    const isMetalPayment = formValues.payment_mode === 'metal';
    // Nothing absorbs an over-payment any more, so no mode may exceed the due.
    if (parseFloat(formValues.amount) > parseFloat(this.state.sale.due_amount)) {
      hasErr = true;
      this.props.enqueueSnackbar("Amount must be less than or equal due amount.", { variant: "error" });
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
    if (formValues.payment_mode == "metal") {
      if (isEmpty(formValues.purity_id)) {
        formErros.purity_id = true;
        hasErr = true;
      } else {
        formErros.purity_id = false;
      }
      if (isEmpty(formValues.weight)) {
        formErros.weight = true;
        hasErr = true;
      } else if (formValues.weight <= 0) {
        formErros.weight = true;
        hasErr = true;
        this.props.enqueueSnackbar("Weight must be greater than 0.", {
          variant: "error",
        });
      } else {
        formErros.weight = false;
      }
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
    this.setState({ sale: null });
    /* current=1: the metal is shown at today's gold rate. The API only
       reprices the copy it sends back - the stored sale is untouched, and the
       plain Invoice button still prints the rates frozen at sale time. */
    const response = await salesOnApproveViewRaw(this.props.params.id, true);
    if (response.data.success) {
      this.setState({ sale: response.data.data });
    }
  };

  render() {
    const {
      sale,
      formValues,
      formErros,
      downloadingInfo,
      downloadingCurrent,
      downloadingItem,
      downloadingList,
    } = this.state;
    let metalPurityList = [];
    if (
      formValues.payment_mode == "metal" &&
      this.props.purityItems &&
      this.props.purityItems.length > 0
    ) {
      this.props.purityItems.forEach((item) => {
        metalPurityList.push({
          id: item.id,
          value: item.value,
          name: item.name + `${item.value ? "(" + item.value + "%)" : ""}`,
          label: item.name,
        });
      });
    }
    const extractPurityPct = (purity_name) => {
      const pctMatch = (purity_name || '').match(/\((\d+\.?\d*)%\)/);
      if (pctMatch) return parseFloat(pctMatch[1]);
      const caratMatch = (purity_name || '').match(/(\d+\.?\d*)\s*(?:carat|k)\b/i);
      if (caratMatch) return (parseFloat(caratMatch[1]) / 24) * 100;
      return 0;
    };
    // Build purity lookup from purityItems (name → value%) for fallback
    const purityLookup = {};
    (this.props.purityItems || []).forEach(item => {
      if (item.name && item.value) purityLookup[item.name.trim()] = parseFloat(item.value);
    });
    // Invoice fine metal: 18K gold × 76% = fine gold (24K equivalent)
    let invoiceFineWeight = 0;
    if (sale) {
      (sale.products || []).forEach(product => {
        (product.materials || []).forEach(material => {
          if ((material.material_name || '').toLowerCase().includes('gold')) {
            const pakka = parseFloat(material.pakka_weight) || 0;
            if (pakka > 0) {
              invoiceFineWeight += pakka;
            } else {
              const w = parseFloat(material.weight) || 0;
              // Try regex, then purityItems lookup, then carat extraction
              let purityPct = extractPurityPct(material.purity_name);
              if (!purityPct && material.purity_name) {
                purityPct = purityLookup[material.purity_name.trim()] || 0;
              }
              if (purityPct > 0 && w > 0) {
                invoiceFineWeight += w * purityPct / 100;
              }
            }
          }
        });
      });
    }
    // Metal already paid on this invoice. The API stores effective_weight in
    // payments.weight, so that column is the fine (24K) weight settled so far.
    const paidFineWeight = (this.state.items || []).reduce(
      (sum, row) => sum + (parseFloat(row.weight) || 0), 0
    );
    // Fine weight still payable in metal — fixed by the invoice, less what's paid.
    const calculatedFineWeight = invoiceFineWeight > 0
      ? Math.max(invoiceFineWeight - paidFineWeight, 0)
      : null;
    const selectedPurityForFine = metalPurityList.find(p => p.id == formValues.purity_id);
    const selectedPurityPct = parseFloat(selectedPurityForFine?.value) || 0;
    // Amount and Weight drive each other through the fine weight:
    // gross x purity% = fine, fine x pure rate = amount. Both inputs clamp to
    // the fine metal still owed on the invoice, so neither can be used to
    // over-pay. One helper so the two directions cannot drift apart.
    // Valued as the invoice bills gold: gross x the purity's live rate, i.e.
    // fine x (purity rate / purity%) - the API recomputes the same on save.
    const metalPurityPct = selectedPurityPct || 100;
    const pureGoldPerGram = fineRatePerGram(metalPurityPct, this.state.goldRates);
    const maxMetalAmount = calculatedFineWeight !== null && pureGoldPerGram > 0
      ? parseFloat((calculatedFineWeight * pureGoldPerGram).toFixed(2))
      : null;
    const metalValuesFromFine = (fine) =>
      computeMetalValues(fine, {
        purityPct: metalPurityPct,
        ratePerGram: pureGoldPerGram,
        maxFine: calculatedFineWeight,
      });
    console.log("sale : ", sale);

    return (
      <>
        {/* Sticky header — plain divs, not Box: global .MuiBox-root in
            style.scss forces padding/margin 0 !important */}
        <div className="ratn-sticky-header">
          {/* Left: title + chip + tabs */}
          <div className="ratn-sticky-header-left">
            <span className="ratn-sticky-header-title">Sale Details</span>
            {sale && (
              <Chip
                label={sale.approve_status}
                color={getApprovalColor(sale.is_approved)}
              />
            )}
            {sale && (
              <div className="ratn-sticky-header-tabs">
                {[
                  { id: "section-sale-details", label: "Sales Details" },
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
                title="Rates as they were when the sale was raised"
              >
                Invoice
                <FileDownloadIcon sx={{ ml: 0.5 }} />
              </Button>
            )}
            {/* the same jewellery re-costed at today's gold rate */}
            {downloadingCurrent ? (
              <CircularProgress size="28px" />
            ) : (
              <Button
                variant="contained"
                onClick={() => this.handleDownloadInfo(this.props.params.id, true)}
                sx={{ color: "#fff !important", backgroundColor: "#f57c00" }}
                title="Re-costed at today's gold rate"
              >
                Current Invoice
                <FileDownloadIcon sx={{ ml: 0.5 }} />
              </Button>
            )}
            <Button
              variant="contained"
              onClick={() => this.props.navigate(-1)}
              sx={{ color: "#fff !important" }}
            >
              Back
            </Button>
          </div>
        </div>

        <MainCard id="downloadViewSale" border={false}>
          {!sale ? (
            <Grid container justifyContent="center">
              <CircularProgress size="30px" />
            </Grid>
          ) : (
            <>
              {/* <Grid
              container
              spacing={{ xs: 2, md: 3 }}
              columns={{ xs: 4, sm: 8, md: 12 }}>
              <Grid item xs={11}>
                <h3 className='p_heading_list text-center'>Sale Details</h3>
              </Grid>
              <Grid item xs={1} className='action_btn'>
                {downloadingInfo ? (
                  <CircularProgress size='30px' />
                ) : (
                  <Button
                    variant='contained'
                    style={{ paddingLeft: "8%" }}
                    onClick={() =>
                      this.handleDownloadInfo(this.props.params.id)
                    }>
                    <FileDownloadIcon />
                  </Button>
                )}
              </Grid>
            </Grid> */}

              <Box id="section-sale-details" className="invoice-block">
                <Grid container className="invoice-info-bar">
                  <Grid item xs={12} sm={6}>
                    <Typography className="invoice-company-name">
                      {sale?.user_details?.company_name}
                    </Typography>
                    {sale?.user_details?.mobile && (
                      <Typography className="invoice-info-line">
                        Contact: {sale.user_details.mobile}
                      </Typography>
                    )}
                    {sale?.user_details?.gst && (
                      <Typography className="invoice-info-line">
                        GST: {sale.user_details.gst}
                      </Typography>
                    )}
                    {sale?.user_details?.city && (
                      <Typography className="invoice-info-line">
                        City: {sale.user_details.city}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6} className="invoice-info-right">
                    {sale.invoice_number && (
                      <Typography className="invoice-info-line">
                        Invoice No: <b>{sale.invoice_number}</b>
                      </Typography>
                    )}
                    <Typography className="invoice-info-line">
                      Invoice Date: {sale.invoice_date}
                    </Typography>
                    <Typography className="invoice-info-line">
                      Sold By: {sale.user_name}
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
                          <TableCell>SL</TableCell>
                          <TableCell>Product Name</TableCell>
                          <TableCell>QTY</TableCell>
                          <TableCell>HSN</TableCell>
                          <TableCell>Material</TableCell>
                          <TableCell>WT</TableCell>
                          <TableCell>GW</TableCell>
                          <TableCell>Unit</TableCell>
                          <TableCell>Rate</TableCell>
                          <TableCell>Making(-Dis.)</TableCell>
                          <TableCell>Tax@</TableCell>
                          <TableCell>Taxable Amt.</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(() => {
                          // Build making charge (after discount) lookup from products by sub_category_hsn
                          const makingChargeMap = {};
                          if (sale.products) {
                            sale.products.forEach((p) => {
                              const key = p.sub_category_hsn || "";
                              if (!makingChargeMap[key])
                                makingChargeMap[key] = 0;
                              makingChargeMap[key] +=
                                (parseFloat(p.making_charge) || 0) -
                                (parseFloat(p.making_charge_discount_amount) ||
                                  0);
                            });
                          }
                          return sale.subCatItems.map((row, i) => {
                            const makingCharge = makingChargeMap[row.hsn] || 0;
                            return (
                              <SubCatRow
                                key={i}
                                row={row}
                                index={i}
                                makingCharge={makingCharge}
                              />
                            );
                          });
                        })()}
                        {(() => {
                          const materialTotals = {};
                          let totalTaxableAmt = 0;
                          let totalMakingCharge = 0;
                          // Sum making_charge after discount from products
                          if (sale.products) {
                            sale.products.forEach((product) => {
                              totalMakingCharge +=
                                (parseFloat(product.making_charge) || 0) -
                                (parseFloat(
                                  product.making_charge_discount_amount,
                                ) || 0);
                            });
                          }
                          let totalTax = 0;
                          sale.subCatItems.forEach((item) => {
                            const taxableAmt =
                              parseFloat(item.taxableAmount) || 0;
                            const taxPercent = parseFloat(item.tax) || 0;
                            totalTaxableAmt += taxableAmt;
                            totalTax += (taxableAmt * taxPercent) / 100;
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
                          const entries = Object.entries(materialTotals).sort(
                            (a, b) => {
                              const aIsGold = a[0]
                                .toLowerCase()
                                .includes("gold")
                                ? 1
                                : 0;
                              const bIsGold = b[0]
                                .toLowerCase()
                                .includes("gold")
                                ? 1
                                : 0;
                              return aIsGold - bIsGold;
                            },
                          );
                          if (entries.length === 0) return null;
                          const reportAmt =
                            (parseFloat(sale.report_qty) || 0) *
                            (parseFloat(sale.report_charge) || 0);
                          const reportTax =
                            (reportAmt *
                              (parseFloat(sale.report_tax_percentage) || 0)) /
                            100;
                          const parseAmt = (v) =>
                            parseFloat(
                              String(v || "").replace(/[^0-9.-]+/g, ""),
                            ) || 0;
                          const discountAmt = parseAmt(sale.discount);
                          // Calculate total Gross Weight with unit conversion
                          let totalGrossWeight = 0;
                          if (sale.subCatItems) {
                            sale.subCatItems.forEach((item) => {
                              item.material.forEach((mat) => {
                                totalGrossWeight += convertUnitToGram(
                                  mat.unit,
                                  mat.weight,
                                );
                              });
                            });
                          }

                          return (
                            <>
                              <TableRow>
                                <TableCell
                                  colSpan={12}
                                  style={{
                                    borderBottom: "none",
                                    padding: "4px",
                                  }}
                                />
                              </TableRow>
                              <TableRow
                                sx={{
                                  "& td": {
                                    borderBottom: "none",
                                    padding: "2px 16px",
                                  },
                                }}
                              >
                                <TableCell
                                  colSpan={6}
                                  style={{
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    color: "#1E2746",
                                  }}
                                >
                                  Total Gross Weight (GW)
                                </TableCell>
                                <TableCell
                                  style={{
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    color: "#1E2746",
                                  }}
                                >
                                  {totalGrossWeight.toFixed(3)} gm
                                </TableCell>
                                <TableCell colSpan={5} />
                              </TableRow>
                              {entries.map(([name, data], idx) => {
                                const isGold = name
                                  .toLowerCase()
                                  .includes("gold");
                                return (
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
                                      style={{
                                        fontSize: "13px",
                                        color: isGold ? "#1E2746" : "#555",
                                        fontWeight: isGold ? 600 : 400,
                                      }}
                                    >
                                      {name}
                                    </TableCell>
                                    <TableCell
                                      style={{
                                        fontSize: "13px",
                                        color: isGold ? "#1E2746" : "#555",
                                        fontWeight: isGold ? 600 : 400,
                                      }}
                                    >
                                      {data.weight.toFixed(3)} {data.unit}
                                    </TableCell>
                                    <TableCell
                                      colSpan={2}
                                      style={{
                                        fontSize: "13px",
                                        color: isGold ? "#1E2746" : "#555",
                                        fontWeight: isGold ? 600 : 400,
                                      }}
                                    >
                                      × ₹{formatIndianNumber((data.weight ? data.amount / data.weight : data.rate))}
                                    </TableCell>
                                    <TableCell
                                      colSpan={4}
                                      style={{
                                        fontSize: "13px",
                                        color: isGold ? "#1E2746" : "#555",
                                        fontWeight: isGold ? 600 : 400,
                                      }}
                                    >
                                      ₹{formatIndianNumber(data.amount)}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                              {totalMakingCharge > 0 && (
                                <TableRow
                                  sx={{
                                    "& td": {
                                      borderBottom: "none",
                                      padding: "2px 16px",
                                    },
                                  }}
                                >
                                  <TableCell
                                    colSpan={9}
                                    style={{ fontSize: "13px", color: "#555" }}
                                  >
                                    Making Charge
                                  </TableCell>
                                  <TableCell
                                    colSpan={3}
                                    style={{ fontSize: "13px", color: "#555" }}
                                  >
                                    ₹{totalMakingCharge.toFixed(2)}
                                  </TableCell>
                                </TableRow>
                              )}
                              {reportAmt > 0 && (
                                <TableRow
                                  sx={{
                                    "& td": {
                                      borderBottom: "none",
                                      padding: "2px 16px",
                                    },
                                  }}
                                >
                                  <TableCell
                                    colSpan={9}
                                    style={{ fontSize: "13px", color: "#555" }}
                                  >
                                    Report Charge ({parseFloat(sale.report_qty) || 0} pcs ×{" "}
                                    ₹{(parseFloat(sale.report_charge) || 0).toFixed(2)})
                                  </TableCell>
                                  <TableCell
                                    colSpan={3}
                                    style={{ fontSize: "13px", color: "#555" }}
                                  >
                                    ₹{reportAmt.toFixed(2)}
                                  </TableCell>
                                </TableRow>
                              )}
                              <TableRow>
                                <TableCell
                                  colSpan={9}
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
                                  ₹{(totalTaxableAmt + reportAmt).toFixed(2)}
                                </TableCell>
                              </TableRow>
                              {(() => {
                                const discount =
                                  discountAmt > 0 ? discountAmt : 0;
                                return (
                                  <TableRow>
                                    <TableCell
                                      colSpan={9}
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
                                      - ₹{formatIndianNumber(discount)}
                                    </TableCell>
                                  </TableRow>
                                );
                              })()}
                            </>
                          );
                        })()}
                      </TableBody>
                    </Table>
                  </div>
                </TableContainer>

                <Grid container className="invoice-totals-row">
                  <Grid item xs={12} sm={6}>
                    {sale.notes && (
                      <Typography className="invoice-info-line invoice-notes">
                        Notes: {sale.notes}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <div className="invoice-totals-box">
                      {(() => {
                        const reportAmt =
                          (parseFloat(sale.report_qty) || 0) *
                          (parseFloat(sale.report_charge) || 0);
                        const taxableAmt =
                          parseFloat(
                            String(sale.taxable_amount || "").replace(
                              /[^0-9.-]+/g,
                              "",
                            ),
                          ) || 0;
                        const subTotal = taxableAmt;
                        const rTax =
                          (reportAmt *
                            (parseFloat(sale.report_tax_percentage) || 0)) /
                          100;
                        const igst = parseFloat(sale.igst_tax) || 0;
                        const cgst = parseFloat(sale.cgst_tax) || 0;
                        const sgst = parseFloat(sale.sgst_tax) || 0;
                        const reportTaxPerc =
                          parseFloat(sale.report_tax_percentage) || 0;
                        const totalPayableAmt =
                          parseFloat(
                            String(sale.total_payable || "").replace(
                              /[^0-9.-]+/g,
                              "",
                            ),
                          ) || 0;
                        const totalTaxAmt = igst > 0 ? igst : cgst + sgst;
                        /* the stored GST carries the report tax too; it has its own line above,
                           so the GST lines show the products' share and Tax adds them up */
                        const productGst = Math.max(0, totalTaxAmt - rTax);
                        const finalDiscount =
                          parseFloat(
                            String(sale.discount || "0").replace(
                              /[^0-9.-]+/g,
                              "",
                            ),
                          ) || 0;
                        return (
                          <>
                            <div className="invoice-totals-line">
                              <span style={{ fontWeight: 700 }}>Sub Total</span>
                              <span style={{ fontWeight: 700 }}>
                                ₹{formatIndianNumber(subTotal)}
                              </span>
                            </div>
                            {rTax > 0 && (
                              <div className="invoice-totals-line">
                                <span>
                                  Report Tax ({reportTaxPerc.toFixed(2)}%)
                                </span>
                                <span>₹{formatIndianNumber(rTax)}</span>
                              </div>
                            )}
                            {igst > 0 ? (
                              <div className="invoice-totals-line">
                                <span style={{ fontWeight: 700 }}>IGST</span>
                                <span style={{ fontWeight: 700 }}>
                                  ₹{formatIndianNumber(productGst)}
                                </span>
                              </div>
                            ) : cgst > 0 || sgst > 0 ? (
                              <>
                                <div className="invoice-totals-line">
                                  <span style={{ fontWeight: 700 }}>CGST</span>
                                  <span style={{ fontWeight: 700 }}>
                                    ₹{formatIndianNumber(productGst / 2)}
                                  </span>
                                </div>
                                <div className="invoice-totals-line">
                                  <span style={{ fontWeight: 700 }}>SGST</span>
                                  <span style={{ fontWeight: 700 }}>
                                    ₹{formatIndianNumber(productGst / 2)}
                                  </span>
                                </div>
                              </>
                            ) : null}
                            {/* all of it - product GST plus the report tax, i.e. CGST + SGST (or IGST) */}
                            <div className="invoice-totals-line">
                              <span style={{ fontWeight: 700 }}>Tax</span>
                              <span style={{ fontWeight: 700 }}>
                                ₹{formatIndianNumber(totalTaxAmt > 0 ? totalTaxAmt : 0)}
                              </span>
                            </div>
                            <div className="invoice-totals-line">
                              <span>Discount</span>
                              <span>
                                - ₹
                                {formatIndianNumber(
                                  finalDiscount > 0 ? finalDiscount : 0,
                                )}
                              </span>
                            </div>
                          </>
                        );
                      })()}
                      <div className="invoice-totals-line invoice-totals-line-final">
                        <span style={{ fontWeight: 700 }}>Total Payable</span>
                        <span style={{ fontWeight: 700 }}>
                          {sale.total_payable}
                        </span>
                      </div>
                    </div>
                  </Grid>
                </Grid>

                <Grid container className="invoice-footer-band">
                  <Grid item xs={6} sm={3}>
                    <span className="invoice-footer-label">Due Date</span>
                    <br />
                    {sale.due_date}
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <span className="invoice-footer-label">
                      Settlement Date
                    </span>
                    <br />
                    {sale.settlement_date}
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <span className="invoice-footer-label">Paid Amount</span>
                    <br />
                    {sale.paid_amount_display}
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <span className="invoice-footer-label">Due Amount</span>
                    <br />
                    {sale.due_amount_display}
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
                    {sale && parseFloat(sale.due_amount) > 0 ? (
                      <div className="action_btn">
                        <Button
                          variant="contained"
                          className=""
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
                  {!sale.is_assigned ? (
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
                          <FileDownloadIcon size="20px" />
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
                                <TableCell>Total</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {sale.products.map((row, i) => (
                                <Row key={i} row={row} index={i} />
                              ))}
                              {(() => {
                                const materialTotals = {};
                                let totalTax = 0;
                                sale.products.forEach((product) => {
                                  const taxPercent =
                                    parseFloat(product.tax) || 0;
                                  product.materials.forEach((item) => {
                                    if (item.weight == 0 && item.quantity == 0)
                                      return;
                                    const key = item.material_name;
                                    if (!materialTotals[key]) {
                                      materialTotals[key] = {
                                        weight: 0,
                                        unit: item.unit_name,
                                        rate: parseFloat(item.rate) || 0,
                                        amount: 0,
                                      };
                                    }
                                    materialTotals[key].weight +=
                                      parseFloat(item.weight) || 0;
                                    const amt =
                                      (item.material_cost != null /* after the discount */ ? parseFloat(item.material_cost) || 0 : (parseFloat(item.weight) || 0) *
                                      (parseFloat(item.rate) || 0));
                                    materialTotals[key].amount += amt;
                                    totalTax += (amt * taxPercent) / 100;
                                  });
                                });
                                const entries = Object.entries(materialTotals);
                                if (entries.length === 0) return null;
                                const totalBeforeDiscount2 =
                                  entries.reduce(
                                    (sum, [, d]) => sum + d.amount,
                                    0,
                                  ) + totalTax;
                                const parseAmt2 = (v) =>
                                  parseFloat(
                                    String(v || "").replace(/[^0-9.-]+/g, ""),
                                  ) || 0;
                                const discountAmt2 = parseAmt2(sale.discount);
                                const grandTotal = parseAmt2(
                                  sale.total_payable,
                                );
                                return (
                                  <>
                                    <TableRow>
                                      <TableCell
                                        colSpan={12}
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
                                          style={{
                                            fontSize: "13px",
                                            color: "#555",
                                          }}
                                        >
                                          {name}
                                        </TableCell>
                                        <TableCell
                                          style={{
                                            fontSize: "13px",
                                            color: "#555",
                                          }}
                                        >
                                          {data.weight.toFixed(2)} {data.unit}
                                        </TableCell>
                                        <TableCell
                                          colSpan={2}
                                          style={{
                                            fontSize: "13px",
                                            color: "#555",
                                          }}
                                        >
                                          × ₹{(data.weight ? data.amount / data.weight : data.rate).toFixed(2)}
                                        </TableCell>
                                        <TableCell
                                          colSpan={4}
                                          style={{
                                            fontSize: "13px",
                                            color: "#555",
                                            textAlign: "right",
                                          }}
                                        >
                                          ₹{data.amount.toFixed(2)}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                    <TableRow
                                      sx={{
                                        "& td": {
                                          borderBottom: "none",
                                          padding: "2px 16px",
                                        },
                                      }}
                                    >
                                      <TableCell
                                        colSpan={8}
                                        style={{
                                          fontSize: "13px",
                                          color: "#555",
                                        }}
                                      >
                                        Tax
                                      </TableCell>
                                      <TableCell
                                        colSpan={4}
                                        style={{
                                          fontSize: "13px",
                                          color: "#555",
                                          textAlign: "right",
                                        }}
                                      >
                                        ₹{totalTax.toFixed(2)}
                                      </TableCell>
                                    </TableRow>
                                    <TableRow
                                      sx={{
                                        "& td": {
                                          padding: "4px 16px",
                                          borderTop: "1px solid #ccc",
                                        },
                                      }}
                                    >
                                      <TableCell
                                        colSpan={8}
                                        style={{
                                          fontSize: "13px",
                                          fontWeight: 700,
                                          color: "#1E2746",
                                        }}
                                      >
                                        Total
                                      </TableCell>
                                      <TableCell
                                        colSpan={4}
                                        style={{
                                          fontSize: "13px",
                                          fontWeight: 700,
                                          color: "#1E2746",
                                          textAlign: "right",
                                        }}
                                      >
                                        ₹{grandTotal.toFixed(2)}
                                      </TableCell>
                                    </TableRow>
                                  </>
                                );
                              })()}
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
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 3 }}>
              <span>Pay Now</span>
              {this.state.liveGoldPerGram > 0 ? (
                <span style={{
                  display: 'inline-flex', alignItems: 'center',
                  color: '#fff', fontWeight: 800, fontSize: '0.9rem',
                  whiteSpace: 'nowrap'
                }}>
                  {this.state.selectedPurityLabel || '24K'}:-&nbsp;<strong>₹{(this.getQuotedMetalRate() || this.state.liveGoldPerGram).toLocaleString('en-IN')}/gm</strong>
                </span>
              ) : null}
            </DialogTitle>
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
                  {/* Slot 2 holds Purity for metal payments, Amount otherwise —
                      Amount moves down into the metal block beside Weight. */}
                  {formValues.payment_mode == "metal" ? (
                    <Grid item md={4} xs={12} className="create-input">
                      <FormControl fullWidth error={formErros.purity_id}>
                        <InputLabel>Purity</InputLabel>
                        <Select
                          className="input-inner"
                          value={formValues.purity_id}
                          fullWidth
                          label="Purity"
                          error={formErros.purity_id}
                          onChange={(event) => {
                            const selected_purity = metalPurityList.find(
                              (item) => item.id == event.target.value,
                            );
                            const purityPct =
                              parseFloat(selected_purity?.value) || 100;
                            // Gross weight is what the operator hands over, so
                            // it stays put; fine weight and amount re-derive.
                            const gross = parseFloat(formValues.weight) || 0;
                            this.setState({
                              formValues: {
                                ...this.state.formValues,
                                purity_id: selected_purity.id,
                                unit_id: selected_purity.unit_id || "",
                                ...metalValuesFromFine((gross * purityPct) / 100),
                              },
                            });
                          }}
                        >
                          {metalPurityList.map((item, i) => (
                            <MenuItem key={i} value={item.id}>
                              {item.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  ) : (
                    <Grid item md={4} xs={12} className="create-input">
                      <TextField
                        label="Amount"
                        variant="outlined"
                        fullWidth
                        value={formValues.amount}
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
                  )}

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
                        {isSuperAdmin && isAdmin && (
                          <MenuItem value="metal">Metal</MenuItem>
                        )}
                      </Select>
                    </FormControl>
                  </Grid>
                  {formValues.payment_mode == "cheque" ? (
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
                  {formValues.payment_mode == "imps_neft" ||
                  formValues.payment_mode == "upi" ? (
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
                  {formValues.payment_mode == "metal" ? (
                    <>
                      {calculatedFineWeight !== null && (
                        <Grid item xs={12} className="create-input">
                          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, p: '6px 12px', bgcolor: '#e8f5e9', borderRadius: 1 }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                              Metal Needed ({selectedPurityForFine?.label || selectedPurityForFine?.name || '24K'}):
                            </Typography>
                            {/* fine gold still owed, shown as weight of the
                                chosen purity: fine ÷ purity% (7.082 fine = 9.318 of 18 Carat) */}
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1a7a1a' }}>
                              {(selectedPurityPct > 0 ? (calculatedFineWeight * 100) / selectedPurityPct : calculatedFineWeight).toFixed(3)} GM
                            </Typography>
                            {selectedPurityPct > 0 && (
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                (= {calculatedFineWeight.toFixed(3)} GM fine)
                              </Typography>
                            )}
                            {paidFineWeight > 0 && (
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                (already paid {paidFineWeight.toFixed(3)} GM of {invoiceFineWeight.toFixed(3)} GM)
                              </Typography>
                            )}
                          </Box>
                        </Grid>
                      )}
                      <Grid item md={4} xs={12} className="create-input">
                        <TextField
                          label="Amount"
                          variant="outlined"
                          fullWidth
                          value={formValues.amount}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">₹</InputAdornment>
                            ),
                          }}
                          error={formErros.amount}
                          onChange={(event) => {
                            const typed = event.target.value;
                            if (!(pureGoldPerGram > 0)) {
                              this.updateFormValue(typed, "amount");
                              return;
                            }
                            const entered = parseFloat(typed) || 0;
                            const synced = metalValuesFromFine(
                              entered / pureGoldPerGram,
                            );
                            this.setState({
                              formValues: {
                                ...this.state.formValues,
                                ...synced,
                                // Keep the raw text unless the cap trimmed it,
                                // otherwise a trailing "." can't be typed.
                                amount:
                                  maxMetalAmount !== null &&
                                  entered > maxMetalAmount
                                    ? synced.amount
                                    : typed,
                              },
                            });
                          }}
                        />
                      </Grid>
                      {/* <Grid item md={4} xs={12} className='create-input'>
                      <FormControl fullWidth error={formErros.payment_mode}>
                        <InputLabel>Material</InputLabel>
                        <Select
                          className='input-inner'
                          value={formValues.material_id}
                          fullWidth
                          label='Material'
                          error={formErros.material_id}
                          onChange={(event) => {
                            
                          }
                          }>
                          {metalPurityList.map((item, i) => (
                            <MenuItem key={i} value={item.id}>
                              {item.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid> */}
                      <Grid item md={4} xs={12} className="create-input">
                        <TextField
                          label={`Weight (${selectedPurityForFine?.label || selectedPurityForFine?.name || '24K'}) (GM)`}
                          variant="outlined"
                          fullWidth
                          type="number"
                          inputProps={{ step: '0.001', min: 0 }}
                          error={formErros.weight}
                          value={formValues.weight}
                          onChange={(event) => {
                            let inputVal = event.target.value;
                            // Limit to 3 decimal places
                            if (inputVal && inputVal.includes('.')) {
                              const parts = inputVal.split('.');
                              if (parts[1] && parts[1].length > 3) {
                                inputVal = parts[0] + '.' + parts[1].slice(0, 3);
                              }
                            }
                            const selected_purity = metalPurityList.find(
                              (item) => item.id == formValues.purity_id,
                            );
                            // This box is the gross weight handed over, so the
                            // fine weight it settles is gross x purity%.
                            const gross = parseFloat(inputVal) || 0;
                            const synced = metalValuesFromFine(
                              (gross * metalPurityPct) / 100,
                            );
                            this.setState({
                              formValues: {
                                ...this.state.formValues,
                                ...synced,
                                unit_id: selected_purity
                                  ? selected_purity.unit_id || ""
                                  : "",
                                // Keep the raw text unless the cap trimmed it,
                                // otherwise a trailing "." can't be typed.
                                weight:
                                  synced.weight !== "" && synced.weight < gross
                                    ? synced.weight
                                    : inputVal,
                              },
                            });
                          }}
                        />
                        {formValues.effective_weight > 0 ? (
                          <Typography
                            variant="h6"
                            gutterBottom
                            component="div"
                          >{`Fine Weight : ${formValues.effective_weight} GM`}</Typography>
                        ) : (
                          <></>
                        )}
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
  materialStocks: state.superadmin.stocks.items,
  purityItems: state.superadmin.purity.items,
  actionCalled: state.superadmin.payment.actionCalled,
  createSuccess: state.superadmin.payment.createSuccess,
  successMessage: state.superadmin.payment.successMessage,
  errorMessage: state.superadmin.payment.errorMessage,
  items: state.superadmin.payment.items,
  total: state.superadmin.payment.total,
  auth: state.auth,
});

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
    actions: bindActionCreators(
      {
        paymentStore,
        paymentList,
        getNotifiactions,
        stocksList,
        purityList,
      },
      dispatch,
    ),
  };
};

export default withSnackbar(
  withRouter(connect(mapStateToProps, mapDispatchToProps)(SaleViewPage)),
);

function SubCatRow(props) {
  const { row, index, makingCharge } = props;
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
    .map((itm) => itm.weight.toFixed(3))
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
        <TableCell style={{ fontWeight: 600 }}>
          {row.material
            .reduce((sum, m) => sum + convertUnitToGram(m.unit, m.weight), 0)
            .toFixed(3)}
        </TableCell>
        <TableCell
          dangerouslySetInnerHTML={{ __html: materialUnits }}
        ></TableCell>
        <TableCell
          dangerouslySetInnerHTML={{ __html: materialRates }}
        ></TableCell>
        <TableCell>
          {makingCharge > 0 ? "₹" + formatIndianNumber(makingCharge) : "-"}
        </TableCell>
        <TableCell>{row.tax}%</TableCell>
        <TableCell style={{ fontWeight: 700, color: "#1E2746" }}>
          ₹{row.taxableAmount.toFixed(2)}
        </TableCell>
      </TableRow>
      {/* <TableRow className={'table-inner-row sub_table ' + odd_even_class}>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={11}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="span">

              </Typography>
              <Table size="medium" aria-label="sales">
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
        {/* <TableCell style={{color: "#fff"}}>{row.rep}</TableCell> */}
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
