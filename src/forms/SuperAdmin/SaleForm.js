import React from "react";

import { connect } from "react-redux";

import { Field, reduxForm } from "redux-form/immutable";

import {
  Box,
  TextField,
  Button,
  Grid,
  Link,
  TextareaAutosize,
  Stack,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormControlLabel,
  Checkbox,
  FormHelperText,
  Autocomplete,
  FormLabel,
  ImageList,
  ImageListItem,
  InputAdornment,
  IconButton,
  RadioGroup,
  Radio,
  Collapse,
  Alert,
  CircularProgress,
} from "@mui/material";

import { ContactPageSharp } from "@mui/icons-material";

import {
  calculateAdminProductPrice,
  priceFormat,
  getValuesFromKey,
  isEmpty,
  toBase64,
  calculateGST,
  displayAmount,
  weightFormat,
  isSuperAdmin,
  isDistributor,
  isAdmin,
  isSalesExecutive,
  validateNumber,
  validateInteger,
} from "src/helpers/helper";

import { bindActionCreators } from "redux";

import {
  salesStore,
  salesUpdate,
  salesViewRaw,
  salesOnApproveTransferItemsRaw,
  saleReturn,
} from "actions/superadmin/sales.actions";

import {
  stocksProductList,
  stocksProducDetails,
} from "actions/superadmin/stocks.actions";

import { getProfile } from "actions/superadmin/profile.actions";

import { materialPriceProductPriceInfo } from "actions/superadmin/materialPrice.actions";

import { adminList } from "actions/superadmin/admin.actions";

import { productList } from "actions/superadmin/product.actions";

import DeleteIcon from "@mui/icons-material/Delete";

import CloseIcon from "@mui/icons-material/Close";

import AddIcon from "@mui/icons-material/Add";

import AdminForm from "forms/SuperAdmin/AdminForm";

import DistributorForm from "forms/SuperAdmin/DistributorForm";

import RetailerForm from "forms/SuperAdmin/RetailerForm";

import { withSnackbar } from "notistack";

const { updateSyncErrors } = require("redux-form/lib/actions").default;

import LoadingButton from "@mui/lab/LoadingButton";

import withRouter from "src/helpers/withRouter";

import MainCard from "ui-component/cards/MainCard";

import Dialog from "@mui/material/Dialog";

import DialogActions from "@mui/material/DialogActions";

import DialogContent from "@mui/material/DialogContent";

import DialogContentText from "@mui/material/DialogContentText";

import DialogTitle from "@mui/material/DialogTitle";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import { Table, TableHead } from "@mui/material";

import TableBody from "@mui/material/TableBody";

import TableCell from "@mui/material/TableCell";

import TableContainer from "@mui/material/TableContainer";

import TableFooter from "@mui/material/TableFooter";

import TablePagination from "@mui/material/TablePagination";

import TableRow from "@mui/material/TableRow";

import Paper from "@mui/material/Paper";

import _ from "lodash";

import { SUPERADMIN_RESET_SALES } from "../../actionTypes/superadmin/sales.types";

import { SUPERADMIN_GET_ORDERS } from "../../actionTypes/superadmin/orders.types";

import { RESET_SUB_CATEGORY_LIST } from "../../actionTypes/superadmin/subCategory.types";

import { GET_STOCK_PRODUCT_DETAILS_RESET } from "../../actionTypes/superadmin/stocks.types";

import { subCategoryList } from "actions/superadmin/subCategory.actions";

import { categoryList } from "actions/superadmin/category.actions";

import moment from "moment";

import { orderView } from "actions/superadmin/order.actions";

import Accordion from "@mui/material/Accordion";

import AccordionSummary from "@mui/material/AccordionSummary";

import AccordionDetails from "@mui/material/AccordionDetails";

import Typography from "@mui/material/Typography";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

import {
  cartDelete,
  cartListRaw,
  cartList,
} from "actions/superadmin/cart.actions";

import { retailerList } from "actions/superadmin/retailer.actions";

import { distributorList } from "actions/superadmin/distributor.actions";

import { salesExecutiveList } from "actions/superadmin/salesExecutive.actions";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import {
  getRoleName,
  getUserDashboardRoute,
  convertGramToUnit,
} from "src/helpers/helper";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";

import noImage from "src/assets/images/no_image.jpg";

import DataTable from "src/utils/DataTable";

import { employeeList } from "actions/superadmin/employee.actions";

import { parseNonNullablePickerDate } from "@mui/x-date-pickers/internals";

import { supplierList } from "actions/superadmin/supplier.actions";

import { getNotifiactions } from "actions/superadmin/notification.actions";

import { reportChargeFetchRaw } from "actions/superadmin/reportCharge.actions";

import QrCodeScanner from "@mui/icons-material/QrCodeScanner";

import Tooltip from "@mui/material/Tooltip";

import extractPdfData from "../../helpers/scanPdf";

import jsQR from "jsqr";

import Modal from "@mui/material/Modal";

class SaleForm extends React.Component {
  constructor(props) {
    super(props);

    let formData = "formData" in this.props ? this.props.formData : null;

    this.state = {
      auth: this.props.auth,

      formData: formData,

      isCreateFrom: !formData,

      adminList: this.props.adminList,
      adminListApiCall: false,

      retailerList: this.props.retailerList,
      retailerListApiCall: false,

      distributorList: this.props.distributorList,
      distributorListApiCall: false,

      salesExecutiveList: this.props.salesExecutiveList,
      salesExecutiveListApiCall: false,

      productList: this.props.productList,

      productPriceInfo: this.props.productPriceInfo,

      stockProductList: this.props.stockProductList,

      stockProductDetails: this.props.stockProductDetails,

      categoryList: this.props.categoryList,

      subCategoryList: this.props.subCategoryList,

      supplierList: this.props.supplierList,
      supplierListApiCall: false,

      loadSaleOnApprovalApiCall: false,

      materialList: [],

      materialDiscountType: "discount",

      sizeList: [],

      materials: [],

      product_type: "",

      productDialog: false,

      user_gst_no: "",

      report_charge: null,

      formValues: {
        user_id: "",

        invoice_number: "",

        invoice_date: moment().format("MM/DD/YYYY"),

        products: [],

        notes: "",

        payment_mode: "cash",

        transaction_no: "",

        cheque_no: "",

        taxable_amount: "",

        total_amount: "",

        discount: "",

        total_payable: "",

        paid_amount: "",

        already_paid_amount: 0,

        due_amount: "",

        due_date: "",

        cgst_tax: "",

        sgst_tax: "",

        igst_tax: "",

        settlement_date: "",

        product_discount: "",

        total_tag_price: "",

        total_tax: "",

        image_file: "",

        advance_amount: 0,

        pay_from_advance: false,

        report_qty: 0,

        report_charge_amount: 0,

        total_report_charge_amount: 0,

        total_report_charge_tax_amount: 0,

        total_report_charge_amount_after_tax: 0,
      },

      formErros: {
        user_id: false,

        invoice_number: false,

        invoice_date: false,

        notes: false,

        payment_mode: false,

        transaction_no: false,

        total_amount: false,

        tax: false,

        discount: false,

        sub_total: false,
      },

      deleteDialogOpen: false,

      deletingIndex: 0,

      submitting: false,

      ...this.getDefaultProductFormData(),

      actionCalled: this.props.actionCalled,

      createSuccess: this.props.createSuccess,

      editSuccess: this.props.editSuccess,

      successMessage: this.props.successMessage,

      errorMessage: this.props.errorMessage,

      order_id: this.props.order_id,

      order: this.props.order,

      cartList: [],

      common_discount: "",

      common_making_discount: "",

      common_making_discount_type: "discount",

      unique_materials: [],

      admin_details: {
        name: "",

        mobile: "",

        gst: "",

        address: "",

        city: "",

        pincode: "",
      },

      isAssign: false,

      showAddAdminDialog: false,

      pendingAdminSelectId: null,

      selectedUserOption: null,

      userAutoSelected: false,

      isOnApprove: false,

      employeeList: this.props.employeeList,

      return_products: [],

      return_products: [],

      returnDialogOpen: false,

      payNowForReturnDialogOpen: false,

      returnChargeApplyDialogOpen: false,

      return_amount: 0,

      return_from_wallet: 0,

      product_amount: 0,

      product_amount_without_report_charge: 0,

      return_charge: 0,

      return_report_charge: 0,

      return_tax_charge: 0,

      total_charge_for_return: 0,

      materialReturnDialog: false,

      actionProductIndex: 0,

      return_weight_error: false,

      return_qty_error: false,

      view_open: {},

      return_date: moment().format("MM/DD/YYYY"),

      profile: null,

      payment_type: "advance",

      return_payment_mode: "cash",

      return_discount: 0,

      discount_per_product: 0,

      approval_processing: false,

      processing: false,

      isMobile: window.innerWidth < 600, // adjust breakpoint as needed

      globalCertificateNo: "",

      qrScannerOpen: false,

      qrScanner: null,

      qrScannerError: null,

      lastRemovedCert: null,

      lastNotFoundCert: null,

      qrScanNotified: false,
    };

    this.isSuperAdmin = isSuperAdmin();

    this.isAdmin = isAdmin();

    this.isDistributor = isDistributor();

    this.isSalesExecutive = isSalesExecutive();

    this.imageFileRef = React.createRef();

    this.columns = [
      {
        name: "image",

        display_name: "Image",

        isImage: true,
      },

      {
        name: "product_name",

        display_name: "Product Name",
      },

      {
        name: "certificate_no",

        display_name: "Certificate No",

        width: "120px",
      },

      {
        name: "total_weight_display",

        display_name: "Total Wt.",

        width: "90px",
      },

      {
        name: "stock_material_display",

        display_name: "Materials Name",

        width: "165px",
      },

      {
        name: "weight_display",

        display_name: "Qty",
      },

      {
        name: "unit_display",

        display_name: "Unit",
      },

      {
        name: "product_code",

        display_name: "P Code",
      },

      {
        name: "size_name",

        display_name: "Size",
      },

      {
        name: "quantity",

        display_name: "Quantity",
      },

      {
        name: "rate",

        display_name: "Price",
      },
    ];

    this.debouncedFetchData = _.debounce(this.fetchData, 500);
  }

  updateIsMobile = () => {
    this.setState({ isMobile: window.innerWidth < 600 });
  };

  async componentDidMount() {
    if (this.isSuperAdmin) {
      this.props.actions.adminList({ all: 1 });

      this.props.actions.employeeList({ role_id: 9 });
    } else if (this.isAdmin) {
      this.props.actions.adminList({ all: 1 });

      this.props.actions.distributorList({ all: 1 });

      this.props.actions.salesExecutiveList({ all: 1, role_id: 4 });

      this.props.actions.supplierList({ all: 1, page: 1 });
    } else if (this.isDistributor) {
      this.props.actions.retailerList({ all: 1 });

      this.props.actions.salesExecutiveList({ all: 1, role_id: 4 });

      this.props.actions.supplierList({ all: 1, page: 1 });
    } else if (this.isSalesExecutive) {
      this.props.actions.adminList({ all: 1 });

      this.props.actions.retailerList({ all: 1 });

      this.props.actions.distributorList({ all: 1 });

      this.props.actions.salesExecutiveList({ all: 1, role_id: 4 });
    }

    this.props.actions.categoryList({ all: 1 });

    this.props.dispatch({ type: SUPERADMIN_GET_ORDERS, payload: null });

    if (this.state.order_id) {
      this.props.actions.orderView(this.state.order_id);
    }

    await this.loadReportCharge();

    if (this.state.formData) {
      this.initializeFormData();
    } else {
      await this.loadCart();

      //await this.loadSaleOnApproval();
    }

    await this.loadProfile();

    window.addEventListener("resize", this.updateIsMobile);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateIsMobile);
  }

  loadProfile = async () => {
    let res = await getProfile();

    if (res.data.success) {
      this.setState({
        profile: res.data.data,
      });
    }
  };

  initializeFormData = () => {
    let formValues = { ...this.state.formValues, ...this.state.formData };

    let return_products = [],
      discount_per_product = 0,
      total_products = 0;

    for (let i = 0; i < formValues.products.length; i++) {
      return_products.push({
        id: formValues.products[i].id,

        is_return: false,
      });

      if (formValues.products[i].product_type == "material") {
        //total_products = priceFormat(total_products + parseFloat(formValues.products[i].materials[0].weight));

        total_products += parseFloat(
          formValues.products[i].materials[0].quantity,
        );
      } else {
        total_products++;
      }
    }

    if (parseFloat(formValues.discount) > 0) {
      console.log("total_products", total_products);

      discount_per_product = priceFormat(
        parseFloat(formValues.discount) / total_products,
      );
    }

    this.setState(
      {
        formValues: formValues,

        unique_materials: [],

        isCreateFrom: false,

        return_products: return_products,

        discount_per_product: discount_per_product,
      },

      () => {
        this.handleCalculateMainPrice();

        setTimeout(() => {
          this.setAdminDetails();
        }, 1000);
      },
    );
  };

  loadSaleOnApproval = async () => {
    if (
      !isEmpty(this.props.query.get("sale_on_approval")) &&
      !this.loadingSaleOnApproval
    ) {
      /* componentDidUpdate can fire again before the state flag is set */
      this.loadingSaleOnApproval = true;

      let res = await salesViewRaw(this.props.query.get("sale_on_approval"));

      if (res.data.success) {
        let saleOnApprovalData = res.data.data || {};

        let userDetails = saleOnApprovalData.user_details || {};

        //setTimeout(() => {

        this.setState(
          {
            formValues: {
              ...this.state.formValues,

              /* paid_amount: res.data.data.paid_amount

                ? res.data.data.paid_amount

                : "", */

              already_paid_amount: res.data.data.paid_amount
                ? res.data.data.paid_amount
                : 0,

              user_id: saleOnApprovalData.user_id,
            },
            admin_details: {
              ...this.state.admin_details,

              company_name: !isEmpty(userDetails.company_name)
                ? userDetails.company_name
                : "",

              name: !isEmpty(userDetails.name) ? userDetails.name : "",

              mobile: !isEmpty(userDetails.mobile) ? userDetails.mobile : "",

              gst: !isEmpty(userDetails.gst) ? userDetails.gst : "",

              city: !isEmpty(userDetails.city) ? userDetails.city : "",

              address: !isEmpty(userDetails.address) ? userDetails.address : "",

              pincode: !isEmpty(userDetails.pincode) ? userDetails.pincode : "",
            },
            loadSaleOnApprovalApiCall: true,
          },

          () => {
            this.handleCalculateMainPrice();

            /* the user list is already loaded when we get here, see componentDidUpdate */
            this.handleAdminChange("", saleOnApprovalData.user_id);
          },
        );
      } else {
        this.loadingSaleOnApproval = false;
      }
    }
  };

  loadReportCharge = async () => {
    let response = await reportChargeFetchRaw();

    console.log("response : ", response);

    if (response.data.success) {
      let reportCharge = response.data.data.items;

      console.log("reportCharge : ", reportCharge);

      this.setState(
        {
          ...this.state,

          report_charge: reportCharge[0],
        },
        () => {
          console.log(
            "========================== after report charge setState ==========================",
          );
          this.calculateProductPrice();
        },
      );
    }
  };

  loadCart = async () => {
    let onApprovalId = this.props.query.get("sale_on_approval");

    /* a sale on approval brings its own items, the cart stays untouched */
    let response = !isEmpty(onApprovalId)
      ? await salesOnApproveTransferItemsRaw(onApprovalId)
      : await cartListRaw({
          from_order_price: this.props.query.get("from_order_price"),

          order_id: this.props.query.get("order_id"),
        });

    if (response.data.success) {
      let cartList = response.data.data.items;

      let products = [];

      for (let i = 0; i < cartList.length; i++) {
        let cart = cartList[i];

        let materials = [];

        //quantity = 1;

        for (let item of cart.materials) {
          materials.push({
            id: item.id,

            material_id: item.material_id,

            material_name: item.material_name,

            weight: item.weight,

            quantity: item.quantity,

            unit_name: item.unit_name,

            unit_id: item.unit_id,

            purity: item.purity,

            purity_id: item.purity_id,

            amount: item.amount,

            rate: item.rate,

            discount_percent: item.discount_percent,

            max_discount_percent: item.max_discount_percent,

            discount_amount: item.discount_amount,

            total_gram: item.total_gram,

            per_gram_price: item.per_gram_price,

            org_per_gram_price: item.per_gram_price,

            org_rate: item.rate,

            org_discount_percent: item.discount_percent,
          });
        }

        let result2 = calculateGST(
          cart.tax_info,

          parseFloat(cart.total_amount),

          this.state.user_gst_no,
        );

        let cgst_tax = result2 ? result2.cgst : 0;

        let sgst_tax = result2 ? result2.sgst : 0;

        let igst_tax = result2 ? result2.igst : 0;

        let total_tax = priceFormat(cgst_tax + sgst_tax + igst_tax);

        let total = priceFormat(
          cart.total_amount + cgst_tax + sgst_tax + igst_tax,
        );

        if (cart.product_type == "material") {
          quantity = materials[0].quantity;
        }

        products.push({
          id: cart.id,

          product_id: cart.product_id,

          product_type: cart.product_type,

          product_name: cart.product_name,

          certificate_no: cart.certificate_no,

          size_id: cart.size_id,

          size_name: cart.size_name,

          materials: materials,

          making_charge: cart.making_charge,

          making_charge_discount_percent: cart.making_charge_discount_percent,

          making_charge_discount_type:
            cart.making_charge_discount_type || "discount",

          making_charge_flat: cart.making_charge_flat || "",

          max_making_charge_discount_percent:
            cart.max_making_charge_discount_percent,

          making_charge_discount_amount: cart.making_charge_discount_amount,

          total_discount: cart.total_discount,

          stock_id: cart.stock_id,

          sale_product_id: cart.sale_product_id,

          category_id: cart.category_id,

          sub_category_id: cart.sub_category_id,

          total_weight: cart.total_weight,

          sub_price: cart.sub_price,

          rep: cart.rep,

          cgst_tax: cgst_tax,

          sgst_tax: sgst_tax,

          igst_tax: igst_tax,

          total: total,

          tax_info: cart.tax_info,

          total_tax: total_tax,

          sub_cat_making_charge: cart.sub_cat_making_charge,

          sub_cat_making_charge_type: cart.sub_cat_making_charge_type,

          quantity: cart.quantity,

          order_product_id: cart.order_product_id,
        });
      }

      let formValues = this.state.formValues;

      formValues.products = [...products];

      formValues.invoice_number = response.data.data.next_invoice;

      /* the qty and the totals are derived in calculateProductPrice below */
      formValues.report_charge_amount = parseFloat(
        this.state.report_charge.amount,
      );

      this.setState(
        {
          formValues: formValues,

          unique_materials: this.buildUniqueMaterials(products),
        },

        () => {
          this.calculateProductPrice();
        },
      );
    }
  };

  /**
   * Material totals shown with the common discount inputs. Derived from the
   * product list so a cart load and a product removal stay in sync.
   */
  buildUniqueMaterials = (products) => {
    let material_total_by_unit = {};

    for (let product of products) {
      for (let item of product.materials) {
        material_total_by_unit[item.material_id] =
          (material_total_by_unit[item.material_id] || 0) +
          parseFloat(item.weight);
      }
    }

    let unique_materials = [];

    for (let product of products) {
      for (let item of product.materials) {
        let index = _.findIndex(
          unique_materials,

          (p) => p.material_id == item.material_id,
        );

        if (index == -1 && item.max_discount_percent > 0) {
          unique_materials.push({
            material_id: item.material_id,

            material_name: item.material_name,

            disc_type: "discount",

            amount: "",

            max_discount: item.max_discount_percent,

            unit: item.unit_name.toLowerCase(),

            ["total_" + item.material_id]:
              material_total_by_unit[item.material_id],
          });
        }
      }
    }

    return unique_materials;
  };

  /**
   * Single removal path: cart rows are dropped server side, sale on approval
   * items only live in this form so they are dropped locally.
   */
  removeProductAt = async (index) => {
    let products = [...this.state.formValues.products];

    let product = products[index];

    if (!product) {
      return;
    }

    if (isEmpty(this.props.query.get("sale_on_approval"))) {
      let response = await cartDelete(product.id, true);

      if (!response.data.success) {
        this.props.enqueueSnackbar(response.data.message, { variant: "error" });

        return;
      }

      this.notifyProductRemoved(product.certificate_no, response.data.message);

      this.loadCart();

      this.props.actions.cartList();

      return;
    }

    products.splice(index, 1);

    this.setState(
      {
        formValues: { ...this.state.formValues, products: products },

        unique_materials: this.buildUniqueMaterials(products),
      },

      () => {
        this.calculateProductPrice();
      },
    );

    this.notifyProductRemoved(
      product.certificate_no,
      "Product removed successfully.",
    );
  };

  /* the scanner can fire twice for the same certificate, notify once */
  notifyProductRemoved = (certificate_no, message) => {
    if (this.lastRemovedCert && this.lastRemovedCert === certificate_no) {
      return;
    }

    this.lastRemovedCert = certificate_no;

    this.props.enqueueSnackbar(message, { variant: "success" });

    setTimeout(() => {
      this.lastRemovedCert = null;
    }, 1000);
  };

  static getDerivedStateFromProps(props, state) {
    let update = {};

    if (props.adminList !== state.adminList) {
      update.adminList = props.adminList;
      update.adminListApiCall = true;
    }

    if (props.productList !== state.productList) {
      update.productList = props.productList;
    }

    if (props.actionCalled !== state.actionCalled) {
      update.actionCalled = props.actionCalled;
    }

    if (props.createSuccess !== state.createSuccess) {
      update.createSuccess = props.createSuccess;
    }

    if (props.editSuccess !== state.editSuccess) {
      update.editSuccess = props.editSuccess;
    }

    if (props.successMessage !== state.successMessage) {
      update.successMessage = props.successMessage;
    }

    if (props.errorMessage !== state.errorMessage) {
      update.errorMessage = props.errorMessage;
    }

    if (props.productPriceInfo !== state.productPriceInfo) {
      update.productPriceInfo = props.productPriceInfo;
    }

    if (props.stockProductList !== state.stockProductList) {
      update.stockProductList = props.stockProductList;
    }

    if (props.stockProductDetails !== state.stockProductDetails) {
      update.stockProductDetails = props.stockProductDetails;
    }

    if (props.categoryList !== state.categoryList) {
      update.categoryList = props.categoryList;
    }

    if (props.subCategoryList !== state.subCategoryList) {
      update.subCategoryList = props.subCategoryList;
    }

    if (props.order !== state.order) {
      update.order = props.order;
    }

    if (props.distributorList !== state.distributorList) {
      update.distributorList = props.distributorList;
      update.distributorListApiCall = true;
    }

    if (props.retailerList !== state.retailerList) {
      update.retailerList = props.retailerList;
      update.retailerListApiCall = true;
    }

    if (props.salesExecutiveList !== state.salesExecutiveList) {
      update.salesExecutiveList = props.salesExecutiveList;
      update.salesExecutiveListApiCall = true;
    }

    if (props.auth !== state.auth) {
      update.auth = props.auth;
    }

    if (props.employeeList !== state.employeeList) {
      update.employeeList = props.employeeList;
      update.employeeListApiCall = true;
    }

    if (props.formData !== state.formData) {
      update.formData = props.formData;
    }

    if (props.supplierList !== state.supplierList) {
      update.supplierList = props.supplierList;
      update.supplierListApiCall = true;
    }

    return update;
  }

  async componentDidUpdate(prevProps, prevState) {
    if (this.state.pendingAdminSelectId) {
      let newlyCreatedUser = _.find(
        this.getUserList(),
        (item) => String(item.id) === String(this.state.pendingAdminSelectId),
      );
      if (newlyCreatedUser) {
        let pendingId = this.state.pendingAdminSelectId;
        /* the company was picked for us by the inline creation, it is not
           meant to be swapped afterwards */
        this.setState(
          { pendingAdminSelectId: null, userAutoSelected: true },
          () => this.handleAdminChange(null, pendingId),
        );
      }
    }

    if (this.props.formData != prevProps.formData) {
      this.initializeFormData();
    } else if (
      !isEmpty(this.props.query.get("sale_on_approval")) &&
      !this.state.loadSaleOnApprovalApiCall &&
      this.getUserList().length > 0
    ) {
      /**
       * The company can only be preselected once the list it has to be picked
       * from is there, whichever role list that is for the logged in user.
       */
      await this.loadSaleOnApproval();
    }

    if (this.state.actionCalled) {
      if (this.state.isCreateFrom) {
        if (this.state.createSuccess) {
          this.props.actions.cartList();

          this.props.enqueueSnackbar(this.state.successMessage, {
            variant: "success",
          });

          this.props.dispatch({
            type: SUPERADMIN_RESET_SALES,
          });

          this.props.actions.getNotifiactions();

          if (this.state.isAssign) {
            this.props.navigate(
              getUserDashboardRoute(getRoleName(this.state.auth)) + "/transfer",
            );
          } else if (this.state.isOnApprove) {
            this.props.navigate(
              getUserDashboardRoute(getRoleName(this.state.auth)) +
                "/sale-on-approve",
            );
          } else {
            this.props.navigate(
              getUserDashboardRoute(getRoleName(this.state.auth)) + "/sales",
            );
          }
        } else {
          this.setState({
            submitting: false,

            approval_processing: false,

            processing: false,
          });

          this.props.enqueueSnackbar(this.state.errorMessage, {
            variant: "error",
          });

          this.props.dispatch({
            type: SUPERADMIN_RESET_SALES,
          });
        }
      } else {
        if (this.state.editSuccess) {
          this.props.enqueueSnackbar(this.state.successMessage, {
            variant: "success",
          });

          this.props.dispatch({
            type: SUPERADMIN_RESET_SALES,
          });

          if (this.state.isAssign) {
            this.props.navigate(
              getUserDashboardRoute(getRoleName(this.state.auth)) + "/transfer",
            );
          } else {
            this.props.navigate(
              getUserDashboardRoute(getRoleName(this.state.auth)) + "/sales",
            );
          }
        } else {
          this.setState({
            submitting: false,

            approval_processing: false,

            processing: false,
          });

          this.props.enqueueSnackbar(this.state.errorMessage, {
            variant: "error",
          });

          this.props.dispatch({
            type: SUPERADMIN_RESET_SALES,
          });
        }
      }
    }

    if (prevProps.order != this.props.order && this.props.order) {
      this.setState({
        formValues: {
          ...this.state.formValues,

          user_id: this.props.order.user_details.id,
        },

        admin_details: {
          ...this.state.admin_details,

          name: this.props.order.user_details.name,

          company_name: this.props.order.user_details.company_name,

          mobile: this.props.order.user_details.mobile,

          city: this.props.order.user_details.city,

          gst: this.props.order.user_details.gst,

          address: this.props.order.user_details.address,

          pincode: this.props.order.user_details.pincode,
        },
      });

      setTimeout(() => {
        this.setState(
          {
            formValues: {
              ...this.state.formValues,

              //user_id: this.props.order.user_details.id,

              //paid_amount: this.props.order.paid_amount,

              //payment_mode: this.state.order.payment_mode
            },
          },

          () => {
            let advance_amount = null;

            if (
              this.props.order.is_customer &&
              this.props.order.paid_amount > 0
            ) {
              advance_amount = this.props.order.paid_amount;
            }

            this.handleAdminChange(
              "",

              this.props.order.user_details.id,

              advance_amount,
            );

            //this.handleCalculateMainPrice();
          },
        );
      }, 1000);
    }
  }

  handleAddNewProduct = () => {
    if (isEmpty(this.state.formValues.user_id)) {
      this.props.enqueueSnackbar("Please select admin for tax calculate.", {
        variant: "error",
      });

      return;
    }

    this.setState({
      productDialog: true,

      ...this.getDefaultProductFormData(),
    });
  };

  handleAdminChange = (event, val, advnc_amt) => {
    this.updateFormValues(val, "user_id");

    let userList = this.getUserList();
    console.log("userList : ", userList);
    let selectedUser = this.getUserById(userList, val);
    let isSelectedAdmin = !!_.find(
      this.state.adminList,
      (item) => String(item.id) === String(val),
    );

    let user_gst_no = "",
      advance_amount = 0;
    console.log("selectedUser : ", selectedUser);
    if (selectedUser) {
      user_gst_no = selectedUser.gst;

      if (
        /*(this.isSalesExecutive || this.isSalesExecutive) &&*/ !this.state
          .isAssign
      ) {
        advance_amount = selectedUser.advance_amount;
      }
    }

    if (advnc_amt !== null && advnc_amt !== undefined && advnc_amt >= 0) {
      advance_amount = advnc_amt;
    }

    this.setState(
      {
        user_gst_no: user_gst_no,

        /* kept aside because the selection can outlive the list it came from:
           picking an own company in the sale mode flips the form to transfer,
           whose list is a different one */
        selectedUserOption: selectedUser,

        formValues: {
          ...this.state.formValues,

          advance_amount: advance_amount,
        },
      },

      () => {
        if (
          (this.isSuperAdmin || this.isAdmin || this.isDistributor) &&
          /* (this.isAdmin && this.state.profile && this.state.profile.own) */ selectedUser &&
          selectedUser.own &&
          !(this.isAdmin && isSelectedAdmin) &&
          /* a sale on approval is transferred to a sale, never to an assignment */
          isEmpty(this.props.query.get("sale_on_approval"))
        ) {
          this.handleTransfer(val);
        } else {
          this.handleCalculateMainPrice();
        }

        this.setAdminDetails();
      },
    );
  };

  /**
   * Which user the company picker can create inline, one level below the
   * logged in role: Super Admin -> Admin, Admin -> Distributor,
   * Distributor / Sales Executive -> Retailer. Transfers pick from an
   * existing list only, so assigning gets no add option.
   */
  getAddUserConfig = () => {
    if (this.state.isAssign) {
      return null;
    }

    if (this.isSuperAdmin) {
      return {
        label: "Add New Admin",
        title: "Add Admin",
        Form: AdminForm,
        refresh: () => this.props.actions.adminList({ all: 1 }),
      };
    }

    if (this.isAdmin) {
      return {
        label: "Add New Distributor",
        title: "Add Distributor",
        Form: DistributorForm,
        refresh: () => this.props.actions.distributorList({ all: 1 }),
      };
    }

    if (this.isDistributor || this.isSalesExecutive) {
      return {
        label: "Add New Retailer",
        title: "Add Retailer",
        Form: RetailerForm,
        refresh: () => this.props.actions.retailerList({ all: 1 }),
      };
    }

    return null;
  };

  handleAdminCreated = (newUser) => {
    // the lists are resynced from props on every render (see
    // getDerivedStateFromProps), so selecting the new user has to wait
    // for the refreshed list to actually arrive — see componentDidUpdate
    let addConfig = this.getAddUserConfig();

    this.setState({
      showAddAdminDialog: false,
      pendingAdminSelectId: newUser && newUser.id ? newUser.id : null,
    });

    if (addConfig) {
      addConfig.refresh();
    }
  };

  setAdminDetails = () => {
    if (!isEmpty(this.state.formValues.user_id)) {
      let userList = this.getUserList();

      let selectedUser = this.getUserById(
        userList,
        this.state.formValues.user_id,
      );

      if (selectedUser) {
        this.setState({
          admin_details: {
            ...this.state.admin_details,

            name: !isEmpty(selectedUser.name) ? selectedUser.name : "",

            company_name: !isEmpty(selectedUser.company_name)
              ? selectedUser.company_name
              : "",

            mobile: !isEmpty(selectedUser.mobile) ? selectedUser.mobile : "",

            city: !isEmpty(selectedUser.city) ? selectedUser.city : "",

            gst: !isEmpty(selectedUser.gst) ? selectedUser.gst : "",

            address: !isEmpty(selectedUser.address) ? selectedUser.address : "",

            pincode: !isEmpty(selectedUser.pincode) ? selectedUser.pincode : "",
          },
        });
      }
    }

    return "";
  };

  handleDefaultChange = (event, key) => {
    console.log(
      "handleDefaultChange => event.target.value",
      event.target.value,
    );
    this.updateFormValues(event.target.value, key);
  };

  updateFormValues = (val, key) => {
    console.log("updateFormValues => val, key", val, key);
    /* let formValues = {
      ...this.state.formValues,
      key: val,
    }; */

    let formValues = this.state.formValues;

    if (key == "report_charge_amount") {
      console.log("isEmpty(val) : ", isEmpty(val), "isNaN(val):", isNaN(val));
      formValues[key] = isEmpty(val) || isNaN(val) ? 0 : val;
    } else {
      formValues[key] = val;
    }

    console.log("updateFormValues => formValues", formValues);

    this.setState(
      {
        formValues: formValues,
      },

      () => {
        //this.handleCalculateMainPrice();

        this.calculateProductPrice();
      },
    );
  };

  handleProductChange = (event, val) => {
    this.updateProductFormValues(event.target.value, "product_id");

    this.props.actions.stocksProducDetails({ product_id: event.target.value });
  };

  handleProductFormDefaultChange = (event, key) => {
    this.updateProductFormValues(event.target.value, key);
  };

  handleProductFormStockChange = (event) => {
    let val =
      event.target.value == undefined
        ? event.target.parentNode.value
        : event.target.value;

    this.updateProductFormValues(val, "stock_id");
  };

  handleSizeChange = (event, val) => {
    this.updateProductFormValues(event.target.value, "size_id");
  };

  handleCategoryChange = (event) => {
    this.updateProductFormValues(event.target.value, "category_id");

    if (isEmpty(event.target.value)) {
      this.props.dispatch({
        type: RESET_SUB_CATEGORY_LIST,
      });
    } else {
      this.props.actions.subCategoryList({
        all: 1,

        category_id: event.target.value,
      });
    }

    this.updateProductFormValues("", "sub_category_id");

    this.updateProductFormValues("", "product_id");

    this.props.dispatch({
      type: GET_STOCK_PRODUCT_DETAILS_RESET,
    });
  };

  handleSubCategoryChange = (event) => {
    this.updateProductFormValues(event.target.value, "sub_category_id");

    this.props.actions.stocksProductList({
      sub_category_id: event.target.value,
    });

    this.updateProductFormValues("", "product_id");

    this.props.dispatch({
      type: GET_STOCK_PRODUCT_DETAILS_RESET,
    });
  };

  updateProductFormValues = (val, key) => {
    let productFormValues = this.state.productFormValues;

    let sizeList = this.state.sizeList;

    let materialFormErros = this.state.materialFormErros;

    productFormValues[key] = val;

    if (key == "product_id") {
      this.props.actions.materialPriceProductPriceInfo(val ? val : 0);

      let m = _.filter(this.state.stockProductList, { id: val });

      /*let materials = [];

            for(let item of m[0].materials){

                let purities = getValuesFromKey(item.purities, 'name')

                materials.push({

                    id: 0,

                    material_id: item.id,

                    material_name: item.name,

                    weight: '',

                    quantity: '',

                    unit_name: item.unit_name,

                    unit_id: item.unit_id,

                    purities: purities.join(', '),

                    amount: 0

                });

                materialFormErros.push({

                    weight: false,

                    quantity: false

                });

            }*/

      productFormValues.materials = [];

      productFormValues.product_type = m.length ? m[0].type : "";

      productFormValues.product_name = m.length ? m[0].name : "";

      productFormValues.tax_info = m.length ? m[0].tax_info : null;

      //productFormValues.size_id = 0;

      //sizeList = m[0].sizes;
    } else if (key == "size_id") {
      //let m = _.filter(this.state.sizeList, {id: val});
      //productFormValues.size_name = m[0].name;
    } else if (key == "stock_id") {
      let stock = _.filter(this.state.stockProductDetails, function (s) {
        return s.stock_id == val;
      });

      let materials = [];

      for (let item of stock[0].materials) {
        //let purities = getValuesFromKey(item.purities, 'name')

        materials.push({
          id: 0,

          material_id: item.material_id,

          material_name: item.material_name,

          weight: stock[0].product_type != "material" ? item.weight : "",

          quantity: stock[0].product_type != "material" ? item.quantity : "",

          unit_name: item.unit_name,

          unit_id: item.unit_id,

          purity: item.purity,

          purity_id: item.purity_id,

          amount: 0,

          rate: 0,
        });

        materialFormErros.push({
          weight: false,

          quantity: false,
        });
      }

      productFormValues.materials = materials;

      productFormValues.size_id = stock[0].size_id;

      productFormValues.size_name = stock[0].size_name;

      productFormValues.certificate_no = stock[0].certificate_no;
    }

    this.setState(
      {
        productFormValues: productFormValues,

        sizeList: sizeList,

        materialFormErros: materialFormErros,
      },

      () => {
        this.calculateProductPrice();
      },
    );
  };

  calculateProductPrice = () => {
    /*if (this.state.productPriceInfo) {

            let productFormValues = this.state.productFormValues;

            let result = calculateAdminProductPrice(this.state.productPriceInfo, productFormValues.materials);

            if (result) {

                for (let i = 0; i < result.materials_price.length; i++) {

                    productFormValues.materials[i].amount = result.materials_price[i].amount;

                    productFormValues.materials[i].rate = result.materials_price[i].rate;

                }

                productFormValues.sub_price = result.sub_total;

                productFormValues.making_charge = result.making_charge;

                let rep = (!isEmpty(productFormValues.rep)) ? parseFloat(productFormValues.rep) : 0;

                let result2 = calculateGST(productFormValues.tax_info, (result.sub_total + result.making_charge + rep), this.state.user_gst_no);

                productFormValues.cgst_tax = result2 ? result2.cgst : 0;

                productFormValues.sgst_tax = result2 ? result2.sgst : 0;

                productFormValues.igst_tax = result2 ? result2.igst : 0;

                productFormValues.total_tax = priceFormat(productFormValues.cgst_tax + productFormValues.sgst_tax + productFormValues.igst_tax);

                productFormValues.total = priceFormat(result.total_amount + rep + productFormValues.cgst_tax + productFormValues.sgst_tax + productFormValues.igst_tax);

                productFormValues.total_weight = result.total_weight;

                this.setState({

                    productFormValues: productFormValues

                })

            }

        }*/

    //new code

    let formValues = this.state.formValues;
    console.log("calculateProductPrice => formValues", formValues);

    let products = formValues.products;

    let isAssign = this.state.isAssign;

    let report_qty = 0;

    for (let x = 0; x < products.length; x++) {
      let total_price = 0,
        total_price_with_discount = 0,
        making_charge = 0,
        total_discount = 0,
        total_quantity = 0,
        quantity = !isEmpty(products[x].quantity) ? products[x].quantity : 1;

      for (let i = 0; i < products[x].materials.length; i++) {
        let per_gram_price = products[x].materials[i].per_gram_price;

        let discount_percent = products[x].materials[i].discount_percent
          ? parseFloat(products[x].materials[i].discount_percent)
          : 0;

        discount_percent = !isAssign ? discount_percent : 0;

        let disPerGramPrice = priceFormat(
          parseFloat(per_gram_price) -
            parseFloat((per_gram_price * parseFloat(discount_percent)) / 100),
        );

        let thisPrice = priceFormat(
          parseFloat(per_gram_price) *
            parseFloat(products[x].materials[i].total_gram),
        );

        total_price += thisPrice;

        total_price_with_discount += priceFormat(
          parseFloat(disPerGramPrice) *
            parseFloat(products[x].materials[i].total_gram),
        );

        products[x].materials[i].amount = thisPrice;

        products[x].materials[i].discount_amount = priceFormat(
          thisPrice -
            priceFormat(
              parseFloat(disPerGramPrice) *
                parseFloat(products[x].materials[i].total_gram),
            ),
        );

        //products[x].materials[i].discount_percent = parseFloat(products[x].materials[i].discount_percent);

        total_quantity += products[x].materials[i].quantity
          ? parseInt(products[x].materials[i].quantity)
          : 0;

        total_discount += priceFormat(
          thisPrice -
            priceFormat(
              parseFloat(disPerGramPrice) *
                parseFloat(products[x].materials[i].total_gram),
            ),
        ); //parseFloat(products[x].materials[i].rate * discount_percent / 100);
      }

      /* for those product with certificate no */

      if (!isEmpty(products[x].certificate_no)) {
        report_qty += 1;
      }

      let isMaterial = products[x].product_type == "material" ? true : false;

      if (products[x].sub_cat_making_charge_type == "per_piece") {
        making_charge = priceFormat(
          parseFloat(products[x].sub_cat_making_charge),
        );
      } else if (products[x].sub_cat_making_charge_type == "per_gram") {
        making_charge = priceFormat(
          parseFloat(products[x].total_weight) *
            parseFloat(parseFloat(products[x].sub_cat_making_charge)),
        );
      }

      let making_disc_type =
        products[x].making_charge_discount_type || "discount";

      let discount_amount = 0;

      if (!isAssign) {
        if (making_disc_type == "rate") {
          /* flat rate: the entered value is applied according to the item's
             sub-category making charge type — multiplied by the total weight
             for "per_gram" items and by the item quantity for "per_piece"
             items. No percentage discount applies. */
          let flat_raw = products[x].making_charge_flat;

          if (
            flat_raw !== "" &&
            flat_raw !== null &&
            flat_raw !== undefined &&
            !isNaN(parseFloat(flat_raw))
          ) {
            let flat_rate = parseFloat(flat_raw);

            if (products[x].sub_cat_making_charge_type == "per_gram") {
              making_charge = priceFormat(
                flat_rate * parseFloat(products[x].total_weight),
              );
            } else if (products[x].sub_cat_making_charge_type == "per_piece") {
              making_charge = priceFormat(flat_rate * parseFloat(quantity));
            } else {
              making_charge = priceFormat(flat_rate);
            }
          }

          products[x].making_charge_discount_percent = 0;
        } else {
          let making_disc_value = parseFloat(
            products[x].making_charge_discount_percent,
          )
            ? parseFloat(products[x].making_charge_discount_percent)
            : 0;

          discount_amount = priceFormat(
            (making_charge * making_disc_value) / 100,
          );
        }
      }

      let total_making_charge = priceFormat(making_charge - discount_amount);

      total_discount += discount_amount;

      let result2 = !isAssign
        ? calculateGST(
            products[x].tax_info,

            parseFloat(total_price_with_discount) +
              parseFloat(total_making_charge),

            this.state.user_gst_no,
          )
        : null;

      let cgst_tax = result2 ? result2.cgst : 0;

      let sgst_tax = result2 ? result2.sgst : 0;

      let igst_tax = result2 ? result2.igst : 0;

      let total_tax = priceFormat(cgst_tax + sgst_tax + igst_tax);

      let total_amount = priceFormat(
        total_making_charge + total_price_with_discount,
      );

      let total = priceFormat(total_amount + cgst_tax + sgst_tax + igst_tax);

      products[x].making_charge_discount_amount = discount_amount;

      products[x].total_discount = priceFormat(total_discount);

      products[x].sub_price = priceFormat(
        parseFloat(total_price) + parseFloat(making_charge),
      );

      products[x].making_charge = priceFormat(making_charge);

      products[x].total = priceFormat(total);

      products[x].total_tax = priceFormat(total_tax);

      products[x].cgst_tax = priceFormat(cgst_tax);

      products[x].sgst_tax = priceFormat(sgst_tax);

      products[x].igst_tax = priceFormat(igst_tax);
    }

    /* report charge calculation */
    let report_charge_amount = 0;

    let total_report_charge_amount = 0;

    let total_report_charge_tax_amount = 0;

    let total_report_charge_amount_after_tax = 0;

    if (!this.state.isCreateFrom) {
      //formValues.report_charge_amount = this.state.report_charge.amount;
      formValues.report_charge_amount = parseFloat(
        this.state.formValues.report_charge || 0,
      );
      report_charge_amount = parseFloat(
        this.state.formValues.report_charge || 0,
      );
    } else {
      formValues.report_charge_amount = parseFloat(
        this.state.formValues.report_charge_amount,
      ); // coming from loadCart function
      report_charge_amount =
        this.state.formValues.report_charge_amount != ""
          ? parseFloat(this.state.formValues.report_charge_amount)
          : 0;
    }

    if (!this.state.isAssign) {
      total_report_charge_amount =
        report_qty * parseFloat(report_charge_amount);

      total_report_charge_tax_amount =
        (total_report_charge_amount *
          parseFloat(this.state.report_charge.tax)) /
        100;

      total_report_charge_amount_after_tax =
        total_report_charge_amount + total_report_charge_tax_amount;
    }

    console.log("report_qty : ", report_qty);

    console.log("report_charge_amount : ", formValues.report_charge_amount);

    console.log("total_report_charge_amount : ", total_report_charge_amount);

    console.log(
      "total_report_charge_tax_amount : ",
      total_report_charge_tax_amount,
    );

    console.log(
      "total_report_charge_amount_after_tax : ",
      total_report_charge_amount_after_tax,
    );

    formValues.products = products;

    formValues.report_qty = report_qty;

    formValues.total_report_charge_amount = total_report_charge_amount;

    formValues.total_report_charge_tax_amount = total_report_charge_tax_amount;

    formValues.total_report_charge_amount_after_tax =
      total_report_charge_amount_after_tax;

    this.setState(
      {
        formValues: formValues,
      },

      () => {
        this.handleCalculateMainPrice();
      },
    );
  };

  getDefaultProductFormData = () => {
    return {
      productFormValues: {
        id: 0,

        product_id: "",

        product_type: "",

        product_name: "",

        certificate_no: "",

        size_id: "",

        size_name: "",

        materials: [],

        making_charge: 0,

        stock_id: 0,

        category_id: "",

        sub_category_id: "",

        total_weight: 0,

        sub_price: 0,

        rep: 0,

        cgst_tax: 0,

        sgst_tax: 0,

        igst_tax: 0,

        total: 0,

        tax_info: null,

        total_tax: 0,
      },

      productFormErros: {
        product_id: false,

        certificate_no: false,

        size_id: false,

        category_id: false,

        sub_category_id: false,
      },

      materialFormErros: [],
    };
  };

  handleMaterialFormChange = (event, index, key) => {
    let productFormValues = this.state.productFormValues;

    let materials = productFormValues.materials;

    materials[index][key] = event.target.value;

    productFormValues.materials = materials;

    this.setState(
      {
        productFormValues: productFormValues,
      },

      () => {
        this.calculateProductPrice();
      },
    );
  };

  handleProductDialogClose = (event, reason) => {
    if (reason && reason == "backdropClick") return;

    this.setState({
      productDialog: false,
    });
  };

  getTotalWeightByProduct = (index) => {
    let formValues = this.state.formValues;

    let products = formValues.products;

    let totalWeight = 0;

    for (let item of products[index].materials) {
      totalWeight += item.weight ? parseFloat(item.weight) : 0;
    }

    return totalWeight;
  };

  handleProductDelete = (index) => {
    this.setState({
      deletingIndex: index,

      deleteDialogOpen: true,
    });
  };

  handleProductSubmit = () => {
    let hasErr = this.productFormValidate();

    if (!hasErr) {
      let formValues = { ...this.state.formValues };

      let _data = { ...this.state.productFormValues };

      formValues.products.push(_data);

      this.setState(
        {
          formValues: formValues,

          //productDialog: false,

          productFormValues: {
            ...this.state.productFormValues,

            size_id: "",

            size_name: "",

            materials: [],

            making_charge: 0,

            stock_id: 0,

            total_weight: 0,

            sub_price: 0,

            making_charge: 0,

            rep: 0,

            cgst_tax: 0,

            sgst_tax: 0,

            igst_tax: 0,

            total: 0,

            tax_info: null,

            total_tax: 0,
          },
        },

        () => {
          this.handleCalculateMainPrice();
        },
      );
    }
  };

  calculatePrice = () => {
    /*let formValues = this.state.formValues;

        let sub_total = 0, total_amount = 0;

        for(let i = 0; i < formValues.products.length; i++){

            sub_total += priceFormat(formValues.products[i].amount, true);

            total_amount += priceFormat(formValues.products[i].total_amount, true);

        }

        formValues.sub_total = priceFormat(sub_total, true);

        if(!isEmpty(formValues.tax)){

            total_amount += priceFormat((formValues.sub_total * priceFormat(formValues.tax))/ 100);

        }

        if(!isEmpty(formValues.discount)){

            total_amount -= priceFormat(formValues.discount);

        }

        formValues.total_amount = priceFormat(total_amount, true);

        this.setState({

            formValues: formValues

        })*/
  };

  handleCalculateMainPrice = () => {
    let formValues = this.state.formValues;

    let product_discount = 0,
      total_tag_price = 0;

    let taxable_amount = 0,
      cgst_tax = 0,
      sgst_tax = 0,
      igst_tax = 0,
      total_amount = 0,
      discount = 0,
      total_payable = 0,
      paid_amount = 0,
      due_amount = 0;

    for (let i = 0; i < formValues.products.length; i++) {
      taxable_amount +=
        parseFloat(formValues.products[i].total) -
        parseFloat(formValues.products[i].total_tax);

      cgst_tax += formValues.products[i].cgst_tax
        ? parseFloat(formValues.products[i].cgst_tax)
        : 0;

      sgst_tax += formValues.products[i].sgst_tax
        ? parseFloat(formValues.products[i].sgst_tax)
        : 0;

      igst_tax += formValues.products[i].igst_tax
        ? parseFloat(formValues.products[i].igst_tax)
        : 0;

      total_amount += parseFloat(formValues.products[i].total);

      product_discount += parseFloat(formValues.products[i].total_discount);

      total_tag_price += parseFloat(formValues.products[i].sub_price);
    }

    if (!this.state.isAssign) {
      /* add report charge to taxable_amount */

      console.log("before taxable_amount : ", taxable_amount);

      taxable_amount += parseFloat(formValues.total_report_charge_amount);

      total_amount += parseFloat(
        formValues.total_report_charge_amount_after_tax,
      );

      total_tag_price += parseFloat(formValues.total_report_charge_amount);

      console.log(
        "formValues.total_report_charge_amount : ",
        formValues.total_report_charge_amount,
      );

      console.log("taxable_amount : ", taxable_amount);

      if (cgst_tax > 0 && sgst_tax > 0) {
        cgst_tax += parseFloat(formValues.total_report_charge_tax_amount) / 2;

        sgst_tax += parseFloat(formValues.total_report_charge_tax_amount) / 2;
      } else {
        igst_tax += parseFloat(formValues.total_report_charge_tax_amount);
      }
    }

    taxable_amount = priceFormat(taxable_amount, true);

    cgst_tax = priceFormat(cgst_tax, true);

    sgst_tax = priceFormat(sgst_tax, true);

    igst_tax = priceFormat(igst_tax, true);

    total_amount = priceFormat(total_amount, true);

    if (!isEmpty(formValues.discount)) {
      discount = parseFloat(formValues.discount);
    }

    if (!isEmpty(this.props.query.get("sale_on_approval"))) {
      total_payable = priceFormat(
        total_amount - discount - formValues.already_paid_amount,
        true,
      );
    } else {
      total_payable = priceFormat(total_amount - discount, true);
    }

    if (!isEmpty(formValues.paid_amount)) {
      paid_amount = parseFloat(formValues.paid_amount);
    }

    let advance_amount = formValues.advance_amount
      ? parseFloat(formValues.advance_amount)
      : 0;

    if (this.state.isCreateFrom) {
      due_amount = priceFormat(total_payable - paid_amount, true);
    } else {
      due_amount = parseFloat(this.state.formValues.due_amount);
    }

    if (formValues.pay_from_advance) {
      due_amount =
        advance_amount > due_amount
          ? 0
          : priceFormat(due_amount - advance_amount, true);
    }

    formValues.taxable_amount = taxable_amount;

    formValues.cgst_tax = cgst_tax;

    formValues.sgst_tax = sgst_tax;

    formValues.igst_tax = igst_tax;

    formValues.total_tax = priceFormat(cgst_tax + sgst_tax + igst_tax);

    formValues.total_amount = total_amount;

    formValues.total_payable = this.state.isCreateFrom
      ? total_payable
      : formValues.total_payable;

    formValues.due_amount = due_amount;

    formValues.product_discount = priceFormat(product_discount);

    formValues.total_tag_price = priceFormat(total_tag_price);

    this.setState({
      formValues: formValues,
    });
  };

  productFormValidate = () => {
    let productFormValues = this.state.productFormValues;

    let productFormErros = this.state.productFormErros;

    let materialFormErros = this.state.materialFormErros;

    let hasErr = false;

    if (isEmpty(productFormValues.product_id)) {
      productFormErros.product_id = true;

      hasErr = true;
    } else {
      productFormErros.product_id = false;
    }

    if (productFormValues.product_type != "material") {
      if (!productFormValues.stock_id) {
        //this.props.enqueueSnackbar('Please select stock', {variant: 'error'});
        //hasErr = true;
      }
    } else {
      productFormErros.certificate_no = false;

      productFormErros.size_id = false;
    }

    if (!productFormValues.materials.length) {
      this.props.enqueueSnackbar("Please select stock", { variant: "error" });

      hasErr = true;
    }

    for (let i = 0; i < productFormValues.materials.length; i++) {
      if (isEmpty(productFormValues.materials[i].weight)) {
        materialFormErros[i].weight = true;

        hasErr = true;
      } else {
        materialFormErros[i].weight = false;
      }

      if (isEmpty(productFormValues.materials[i].quantity)) {
        materialFormErros[i].quantity = true;

        hasErr = true;
      } else {
        materialFormErros[i].quantity = false;
      }
    }

    this.setState({
      productFormErros: productFormErros,

      materialFormErros: materialFormErros,
    });

    return hasErr;
  };

  handleDialogClose = () => {
    this.setState({
      deleteDialogOpen: false,

      deletingIndex: 0,
    });
  };

  handlePayNowForReturnDialogClose = () => {
    this.setState({
      payNowForReturnDialogOpen: false,
    });
  };

  handleReturnChargeApplyDialogOpen = () => {
    this.setState({
      returnChargeApplyDialogOpen: false,
    });
  };

  returnDialogClose = () => {
    this.setState({
      returnDialogOpen: false,
    });
  };

  handleDeleteConfirm = async () => {
    await this.removeProductAt(this.state.deletingIndex);

    this.setState(
      {
        deleteDialogOpen: false,
      },

      () => {
        this.handleCalculateMainPrice();
      },
    );
  };

  handleSubmit = async (isApproval, e) => {
    let formValues = this.state.formValues;

    let hasErr = this.formValidate(isApproval);

    if (hasErr) {
      e.target.disabled = false;

      return false;
    }

    if (formValues.products.length == 0) {
      this.props.enqueueSnackbar("Please add at least one product", {
        variant: "error",
      });

      e.target.disabled = false;

      return false;
    }

    if (!hasErr && formValues.products.length) {
      this.setState({
        submitting: true,

        isOnApprove: isApproval,

        approval_processing: isApproval ? true : false,

        processing: !isApproval ? true : false,
      });

      let data = {
        ...this.state.formValues,

        on_approval: isApproval,

        on_approval_id: this.props.query.get("sale_on_approval"),
      };

      data.order_id = this.state.order ? this.state.order.id : 0;

      data.order_from_customer = this.state.order
        ? this.state.order.is_customer
        : false;

      if (
        this.state.order &&
        "is_retailer" in this.state.order &&
        this.state.order.is_retailer
      ) {
        data.order_from_customer = true;
      }

      /*if(priceFormat(data.total_payable - data.due_amount) != data.paid_amount){

                data.paid_amount = priceFormat(data.total_payable - data.due_amount);

            }*/

      data.is_assigned = this.state.isAssign;

      data.image_file = data.image_file ? await toBase64(data.image_file) : "";

      console.log("sales ------- admin code ", data);

      if (this.state.isCreateFrom) {
        this.props.actions.salesStore(data);
      } else {
        this.props.actions.salesUpdate(this.state.formData.id, data);
      }
    }
  };

  formValidate = (isApproval) => {
    let formErros = this.state.formErros;

    let formValues = this.state.formValues;

    let hasErr = false;

    if (isEmpty(formValues.user_id)) {
      formErros.user_id = true;

      hasErr = true;
    } else {
      formErros.user_id = false;
    }

    if (isEmpty(formValues.invoice_date)) {
      formErros.invoice_date = true;

      hasErr = true;
    } else {
      formErros.invoice_date = false;
    }

    /*if (isEmpty(formValues.paid_amount)) {

            formErros.paid_amount = true;

            hasErr = true;

        } else {

            formErros.paid_amount = false;

        }*/

    if (parseFloat(formValues.due_amount) > 0) {
      if (!this.state.isAssign && isEmpty(formValues.due_date)) {
        formErros.due_date = true;

        hasErr = true;
      } else {
        formErros.due_date = false;
      }

      if (
        !this.state.isAssign &&
        isEmpty(formValues.settlement_date) &&
        !isApproval
      ) {
        formErros.settlement_date = true;

        hasErr = true;
      } else {
        formErros.settlement_date = false;
      }
    }

    if (
      !isEmpty(formValues.total_payable) &&
      !isEmpty(formValues.paid_amount)
    ) {
      if (
        parseFloat(formValues.paid_amount) >
        parseFloat(formValues.total_payable)
      ) {
        hasErr = true;

        this.props.enqueueSnackbar(
          "Paid amount must be less than or equal to payable amount.",

          { variant: "error" },
        );
      }
    }

    this.setState({
      formErros: formErros,
    });

    return hasErr;
  };

  checkIfStockAdded = (id) => {
    let stock = _.filter(this.state.formValues.products, function (s) {
      return s.stock_id == id;
    });

    return stock.length;
  };

  checkIfAllStockAdded = () => {
    let x = true;

    for (let i = 0; i < this.state.stockProductDetails.length; i++) {
      if (!this.checkIfStockAdded(this.state.stockProductDetails[i].stock_id)) {
        x = false;

        break;
      }
    }

    return x;
  };

  handleMaterialDisc = (event, productKey, materialKey) => {
    let formValues = this.state.formValues;

    let { value, max } = event.target;

    /* check if super admin then no need of max check for discont */

    if (!this.isSuperAdmin) {
      if (value != "") {
        value = Math.max(Number(0), Math.min(Number(max), Number(value)));
      }
    } else {
      if (value != "") {
        value = Math.max(Number(0), Math.min(Number(100), Number(value)));
      }
    }

    formValues.products[productKey].materials[materialKey].discount_percent =
      value;

    this.setState(
      {
        formValues: formValues,
      },

      () => {
        this.calculateProductPrice();
      },
    );
  };

  handleMakingDiscount = (event, productKey) => {
    let formValues = this.state.formValues;

    let { value, max } = event.target;

    /* super admin can give the full 0 - 100 %, others are capped at the per-row max */
    if (value != "") {
      if (!this.isSuperAdmin) {
        value = Math.max(Number(0), Math.min(Number(max), Number(value)));
      } else {
        value = Math.max(Number(0), Math.min(Number(100), Number(value)));
      }
    }

    formValues.products[productKey].making_charge_discount_percent = value;

    this.setState(
      {
        formValues: formValues,
      },

      () => {
        this.calculateProductPrice();
      },
    );
  };

  handleCommonDis = (event, index) => {
    let unique_materials = this.state.unique_materials;

    let { value, max } = event.target;

    if (unique_materials[index].disc_type == "discount") {
      if (!this.isSuperAdmin) {
        if (value != "") {
          value = Math.max(Number(0), Math.min(Number(max), Number(value)));
        }
      } else {
        if (value != "") {
          value = Math.max(Number(0), Math.min(Number(100), Number(value)));
        }
      }
    }

    unique_materials[index].amount = value;

    this.setState(
      {
        unique_materials: unique_materials,
      },

      () => {
        let formValues = this.state.formValues;

        console.log("unique_materials[index] : ", unique_materials[index]);

        for (let i = 0; i < formValues.products.length; i++) {
          for (let x = 0; x < formValues.products[i].materials.length; x++) {
            console.log(
              "formValues.products[i].materials[x]: ",

              formValues.products[i].materials[x],
            );

            if (
              unique_materials[index].material_id ==
              formValues.products[i].materials[x].material_id
            ) {
              if (unique_materials[index].disc_type == "discount") {
                formValues.products[i].materials[x].discount_percent = value;

                formValues.products[i].materials[x].rate =
                  formValues.products[i].materials[x].org_rate;

                formValues.products[i].materials[x].per_gram_price =
                  formValues.products[i].materials[x].org_per_gram_price;
              } else {
                formValues.products[i].materials[x].rate = value;

                formValues.products[i].materials[x].per_gram_price =
                  convertGramToUnit(
                    formValues.products[i].materials[x].unit_name,

                    value,
                  );

                formValues.products[i].materials[x].discount_percent = 0.0;
              }
            }
          }
        }

        this.setState(
          {
            formValues: formValues,
          },

          () => {
            this.calculateProductPrice();
          },
        );
      },
    );
  };

  handleDiscountType = (event, index) => {
    let unique_materials = this.state.unique_materials;

    let { value, max } = event.target;

    unique_materials[index].disc_type = value;

    unique_materials[index].amount = 0.0;

    this.setState(
      {
        unique_materials: unique_materials,
      },

      () => {
        let formValues = this.state.formValues;

        //console.log("unique_materials[index] : ", unique_materials[index]);

        for (let i = 0; i < formValues.products.length; i++) {
          for (let x = 0; x < formValues.products[i].materials.length; x++) {
            if (
              unique_materials[index].material_id ==
              formValues.products[i].materials[x].material_id
            ) {
              //Object.keys(document.querySelectorAll(".unique_materials .custom_input")).map((itm) => document.querySelectorAll(".unique_materials .custom_input")[itm].value = 0.00);

              if (value == "discount") {
                formValues.products[i].materials[x].discount_percent =
                  formValues.products[i].materials[x].org_discount_percent;
              } else {
                formValues.products[i].materials[x].discount_percent = 0.0;
              }

              formValues.products[i].materials[x].rate =
                formValues.products[i].materials[x].org_rate;

              formValues.products[i].materials[x].per_gram_price =
                formValues.products[i].materials[x].org_per_gram_price;
            }
          }
        }

        this.setState(
          {
            formValues: formValues,
          },

          () => {
            this.calculateProductPrice();
          },
        );
      },
    );
  };

  handleCommonMakingDis = (event) => {
    let type = this.state.common_making_discount_type;

    let vl = event.target.value;

    /* percentage discount is allowed only in the 0 - 100 range */
    if (type != "rate" && vl !== "") {
      vl = Math.max(Number(0), Math.min(Number(100), Number(vl)));
    }

    this.setState({
      common_making_discount: vl,
    });

    let formValues = this.state.formValues;

    for (let i = 0; i < formValues.products.length; i++) {
      formValues.products[i].making_charge_discount_type = type;

      if (formValues.products[i].max_making_charge_discount_percent > 0) {
        if (type == "rate") {
          /* flat rate is applied per the item's making charge type (per gram /
             per piece) during calculation; percentage box shows 0 */
          formValues.products[i].making_charge_flat = vl;
          formValues.products[i].making_charge_discount_percent = 0;
        } else if (!vl) {
          formValues.products[i].making_charge_discount_percent = "";
        } else if (this.isSuperAdmin) {
          /* super admin: reflect the full 0 - 100 value into every row box */
          formValues.products[i].making_charge_discount_percent = vl;
        } else {
          /* others: reflect the entered value but never above the per-row max */
          formValues.products[i].making_charge_discount_percent =
            formValues.products[i].max_making_charge_discount_percent >=
            parseFloat(vl)
              ? vl
              : formValues.products[i].max_making_charge_discount_percent;
        }
      }
    }

    this.setState(
      {
        formValues: formValues,
      },

      () => {
        this.calculateProductPrice();
      },
    );
  };

  handleCommonMakingDisType = (event) => {
    let type = event.target.value;

    let formValues = this.state.formValues;

    /* switching the discount mode resets the entered value for every product */
    for (let i = 0; i < formValues.products.length; i++) {
      formValues.products[i].making_charge_discount_type = type;
      formValues.products[i].making_charge_flat = "";
      /* flat rate forces the row percentage box to 0 */
      formValues.products[i].making_charge_discount_percent =
        type == "rate" ? 0 : "";
    }

    this.setState(
      {
        common_making_discount_type: type,
        common_making_discount: "",
        formValues: formValues,
      },

      () => {
        this.calculateProductPrice();
      },
    );
  };

  getUserList = () => {
    let userList = [];

    if (this.isSuperAdmin) {
      if (this.state.isAssign) {
        userList = this.state.employeeList;

        let ownAdmins = [];

        for (let i = 0; i < this.state.adminList.length; i++) {
          if (this.state.adminList[i].own) {
            ownAdmins.push(this.state.adminList[i]);
          }
        }

        userList = userList.concat(ownAdmins);

        userList = this.state.salesExecutiveList.concat(userList);
      } else {
        userList = this.state.adminList;
      }
    } else if (this.isAdmin) {
      if (this.state.isAssign) {
        let ownDistri = [];

        if (this.state.profile && this.state.profile.own) {
          for (let i = 0; i < this.state.distributorList.length; i++) {
            if (this.state.distributorList[i].own) {
              ownDistri.push(this.state.distributorList[i]);
            }
          }

          for (let i = 0; i < this.state.supplierList.length; i++) {
            if (this.state.supplierList[i].own) {
              ownDistri.push(this.state.supplierList[i]);
            }
          }
        }

        userList = ownDistri;

        userList = this.state.salesExecutiveList.concat(userList);
      } else {
        let loggedInUserId =
          this.state.auth && this.state.auth.user
            ? this.state.auth.user.id
            : null;

        let adminList = this.state.adminList;

        if (loggedInUserId !== null && loggedInUserId !== undefined) {
          adminList = _.filter(
            this.state.adminList,
            (item) => String(item.id) !== String(loggedInUserId),
          );
        }

        userList = adminList.concat(this.state.distributorList);
      }
    } else if (this.isDistributor) {
      if (this.state.isAssign) {
        let suppList = [];

        //if (this.state.profile && this.state.profile.own) {

        for (let i = 0; i < this.state.supplierList.length; i++) {
          //if (this.state.supplierList[i].own) {

          suppList.push(this.state.supplierList[i]);

          //}
        }

        //}

        userList = this.state.salesExecutiveList.concat(suppList);
      } else {
        userList = this.state.retailerList;
      }
    } else if (this.isSalesExecutive) {
      if (this.state.isAssign) {
        userList = this.state.distributorList.concat(
          this.state.salesExecutiveList,
        );

        userList = this.state.adminList.concat(userList);
      } else {
        userList = this.state.retailerList;
      }
    }

    return userList;
  };

  getUserById = (userList, userId) => {
    if (isEmpty(userId)) {
      return null;
    }

    return (
      _.find(userList, (user) => String(user.id) === String(userId)) || null
    );
  };

  handleTransfer = (user_id) => {
    let invoice_number = this.state.formValues.invoice_number;

    if (invoice_number) {
      invoice_number = invoice_number.replace("-S-", "-T-");
    }

    user_id = user_id === undefined ? "" : user_id;

    this.setState(
      {
        isAssign: true,

        formValues: {
          ...this.state.formValues,

          user_id: user_id,

          invoice_number,
        },
      },

      () => {
        this.calculateProductPrice();
      },
    );
  };

  handleBackAssign = () => {
    let invoice_number = this.state.formValues.invoice_number;

    if (invoice_number) {
      invoice_number = invoice_number.replace("-T-", "-S-");
    }

    this.setState(
      {
        isAssign: false,

        formValues: {
          ...this.state.formValues,

          user_id: "",

          invoice_number: invoice_number,
        },
      },

      () => {
        this.calculateProductPrice();
      },
    );
  };

  onChangeImage = (e) => {
    this.updateFormValues(e.target.files[0], "image_file");

    if (this.imageFileRef) {
      this.imageFileRef.current.value = null;
    }
  };

  getImageSrc = (item) => {
    return URL.createObjectURL(item);
  };

  deleteImage = () => {
    this.updateFormValues(null, "image_file");
  };

  haveMakingComonDis = () => {
    const { formValues, isAssign } = this.state;

    let haveDis = false;

    for (let item of formValues.products) {
      if (item.max_making_charge_discount_percent > 0 && !isAssign) {
        haveDis = true;

        break;
      }
    }

    return haveDis;
  };

  /* total weight the making discount applies to — the making charge is
     weight-based only for "per_gram" items, so sum their total weight. */
  getMakingApplicableWeight = () => {
    const { formValues } = this.state;

    let weight = 0;

    for (let item of formValues.products) {
      if (item.sub_cat_making_charge_type == "per_gram") {
        weight += parseFloat(item.total_weight) || 0;
      }
    }

    return weight;
  };

  /* total quantity the making discount applies to — the making charge is
     quantity-based only for "per_piece" items, so sum their quantity. */
  getMakingApplicableQuantity = () => {
    const { formValues } = this.state;

    let quantity = 0;

    for (let item of formValues.products) {
      if (item.sub_cat_making_charge_type == "per_piece") {
        quantity += !isEmpty(item.quantity) ? parseFloat(item.quantity) : 1;
      }
    }

    return quantity;
  };

  handleCheckBox = (e, index) => {
    //alert("hi");
    let products = this.state.formValues.products;

    let return_products = this.state.return_products;
    console.log("return_products : ", return_products);
    let product = products[index];

    let hasReturn = this.hasReturn();

    if (e.target.checked && hasReturn.will_return_charge_apply) {
      for (let i = 0; i < return_products.length; i++) {
        if (return_products[i].is_return == true) {
          let returnP = _.filter(this.state.formValues.products, function (s) {
            return s.id == return_products[i].id;
          });

          if (returnP.length) {
            if (returnP[0].category_id != product.category_id) {
              return this.props.enqueueSnackbar(
                "You can't return different category product in one invoice.",

                { variant: "error" },
              );
            }
          }
        }
      }
    }

    if (product.product_type == "material") {
      this.setState({
        materialReturnDialog: true,

        actionProductIndex: index,
      });

      return;
    }

    return_products[index].is_return = e.target.checked;

    this.setState(
      {
        return_products: return_products,
      },

      () => {
        this.calculateReturnAmount();
      },
    );
  };

  handleReturn = () => {
    const { total_charge_for_return, formValues, return_from_wallet } =
      this.state;

    let res = this.hasReturn();

    if (!res.isReturn) {
      return this.props.enqueueSnackbar("Please select return product.", {
        variant: "error",
      });
    }

    if (
      parseFloat(formValues.due_amount) == 0

      //&& parseFloat(formValues.total_payable) == parseFloat(formValues.paid_amount)
    ) {
      //return_from_wallet = formValues.paid_amount;
      this.setState({
        returnChargeApplyDialogOpen: true,
      });
    } else if (
      formValues.due_amount == 0 &&
      total_charge_for_return > 0 &&
      total_charge_for_return > formValues.paid_amount
    ) {
      //return_from_wallet = total_charge_for_return;
      console.log(
        "Customer need to pay : ",
        priceFormat(total_charge_for_return - formValues.paid_amount).toFixed(
          2,
        ),
      );
      this.setState({
        payNowForReturnDialogOpen: true,
      });
    } else {
      this.setState({
        returnDialogOpen: true,

        payment_type: res.will_return_charge_apply ? "return" : "advance",
      });
    }
  };

  handleReturnConfirm = async () => {
    this.setState({
      submitting: true,
    });

    let result = this.hasReturn();

    if (!result.isReturn) {
      return this.props.enqueueSnackbar("Please select return product.", {
        variant: "error",
      });
    }

    console.log("return payload : ", {
      return_products: this.state.return_products,

      return_data: this.state.formValues,

      return_amount: this.state.return_amount,

      product_amount: this.state.product_amount,

      return_charge: this.state.return_charge,

      return_date: this.state.return_date,

      payment_type: this.state.payment_type,

      return_payment_mode: this.state.return_payment_mode,

      return_amount_from_wallet: parseFloat(this.state.return_from_wallet),
    });
    //return false;

    let res = await saleReturn(this.state.formData.id, {
      return_products: this.state.return_products,

      return_data: this.state.formValues,

      return_amount: this.state.return_amount,

      product_amount: this.state.product_amount,

      return_charge: this.state.return_charge,

      return_date: this.state.return_date,

      payment_type: this.state.payment_type,

      return_payment_mode: this.state.return_payment_mode,

      return_amount_from_wallet: parseFloat(this.state.return_from_wallet),

      /* return_amount_from_wallet: priceFormat(

        parseFloat(this.state.return_amount) -

          parseFloat(this.state.formValues.due_amount)

      ), */
    });

    if (res.data.success) {
      this.props.enqueueSnackbar(res.data.message, { variant: "success" });

      this.props.actions.getNotifiactions();

      this.props.navigate(
        getUserDashboardRoute(getRoleName(this.state.auth)) + "/sales",
      );
    } else {
      this.setState({
        submitting: false,
      });

      this.props.enqueueSnackbar(res.data.message, { variant: "error" });
    }
  };

  handleReturnDialogClose = (event, reason) => {
    if (reason && reason == "backdropClick") return;

    this.setState({
      materialReturnDialog: false,
    });
  };

  handleCancelReturn = () => {
    let { formValues, actionProductIndex, return_products } = this.state;

    formValues.products[actionProductIndex].materials[0].return_weight = 0;

    formValues.products[actionProductIndex].materials[0].return_qty = 0;

    return_products[actionProductIndex].is_return = false;

    this.setState({
      return_products: return_products,

      formValues: formValues,

      materialReturnDialog: false,
    });
  };

  handleReturnMaterialSubmit = () => {
    let { formValues, actionProductIndex } = this.state;

    const actionProduct = formValues.products[actionProductIndex];

    let err = false;

    if (
      !actionProduct.materials[0].return_weight ||
      parseFloat(actionProduct.materials[0].return_weight) >
        parseFloat(actionProduct.materials[0].avl_weight)
    ) {
      err = true;

      this.setState({
        return_weight_error: true,
      });

      if (
        parseFloat(actionProduct.materials[0].return_weight) >
        parseFloat(actionProduct.materials[0].avl_weight)
      ) {
        this.props.enqueueSnackbar(
          "Weight can't be more than available weight.",

          { variant: "error" },
        );
      }
    } else {
      this.setState({
        return_weight_error: false,
      });
    }

    if (
      !actionProduct.materials[0].return_qty ||
      parseFloat(actionProduct.materials[0].return_qty) >
        parseFloat(actionProduct.materials[0].avl_qty)
    ) {
      err = true;

      this.setState({
        return_qty_error: true,
      });

      if (
        parseFloat(actionProduct.materials[0].return_qty) >
        parseFloat(actionProduct.materials[0].avl_qty)
      ) {
        this.props.enqueueSnackbar(
          "Quantity can't be more than available quantity.",

          { variant: "error" },
        );
      }
    } else {
      this.setState({
        return_qty_error: false,
      });
    }

    if (!err) {
      let return_products = this.state.return_products;

      return_products[actionProductIndex].is_return = true;

      this.setState(
        {
          materialReturnDialog: false,

          return_products: return_products,
        },

        () => {
          this.calculateReturnAmount();
        },
      );
    }
  };

  calculateReturnAmount = () => {
    let { formValues, actionProductIndex, discount_per_product } = this.state;

    let return_products = this.state.return_products;

    let return_amount = 0,
      return_charge = 0,
      hasCertifiedProduct = 0,
      return_report_charge = 0,
      return_tax_charge = 0,
      applicable_discount = 0,
      total_charge_for_return = 0,
      product_amount_without_report_charge = 0,
      product_amount = 0;

    for (let i = 0; i < return_products.length; i++) {
      if (return_products[i].is_return) {
        if (formValues.products[i].product_type == "material") {
          let discount = priceFormat(
            (parseFloat(formValues.products[i].materials[0].rate) *
              parseFloat(
                formValues.products[i].materials[0].discount_percent,
              )) /
              100,
          );

          let rate = priceFormat(
            parseFloat(formValues.products[i].materials[0].rate) - discount,
          );

          let thisAmt = priceFormat(
            parseFloat(formValues.products[i].materials[0].return_weight) *
              rate,
          );

          //thisAmt = priceFormat(thisAmt - (parseFloat(formValues.products[i].materials[0].return_weight) * discount_per_product));

          thisAmt = priceFormat(
            thisAmt -
              parseFloat(formValues.products[i].materials[0].return_qty) *
                discount_per_product,
          );

          let tax = priceFormat(
            parseFloat(formValues.products[i].total_tax) /
              parseFloat(formValues.products[i].materials[0].return_qty),
          );

          console.log(thisAmt, tax, discount_per_product);

          thisAmt = priceFormat(thisAmt + tax);

          let thisReturnCharge = formValues.have_return_charge
            ? parseFloat(formValues.products[i].return_charge_percent) > 0
              ? priceFormat(
                  (thisAmt *
                    parseFloat(formValues.products[i].return_charge_percent)) /
                    100,
                )
              : 0
            : 0;

          let returnAmount_val =
            thisAmt - thisReturnCharge - tax - discount_per_product;

          formValues.products[i].return_amount = returnAmount_val;

          formValues.products[i].return_charge = thisReturnCharge;

          formValues.products[i].discount_per_product = discount_per_product;

          //return_amount += thisAmt - thisReturnCharge;

          return_amount += returnAmount_val;

          return_charge += thisReturnCharge;

          applicable_discount += discount_per_product;

          return_tax_charge += tax;

          product_amount += thisAmt;

          product_amount_without_report_charge += thisAmt;

          total_charge_for_return += thisReturnCharge + tax;
        } else {
          let thisAmt = parseFloat(formValues.products[i].total);
          console.log("thisAmt before discount_per_product: ", thisAmt);
          //console.log("discount_per_product: ", discount_per_product);
          //thisAmt = priceFormat(thisAmt - discount_per_product);
          //console.log("thisAmt after discount_per_product: ", thisAmt);
          let thisReturnCharge = formValues.have_return_charge
            ? parseFloat(formValues.products[i].return_charge_percent) > 0
              ? (thisAmt *
                  parseFloat(formValues.products[i].return_charge_percent)) /
                100
              : 0
            : 0;
          console.log("thisReturnCharge: ", thisReturnCharge);

          let product = _.filter(this.state.formValues.products, {
            id: return_products[i].id,
          });
          console.log("product : ", product);
          if (product.length > 0 && !isEmpty(product[0].certificate_no)) {
            console.log("product.certificate_no : ", product[0].certificate_no);
            hasCertifiedProduct += 1;
          }

          let taxCharge = parseFloat(formValues.products[i].total_tax);

          let returnAmount_val =
            thisAmt - thisReturnCharge - taxCharge - discount_per_product;
          console.log("return_amount: ", returnAmount_val);

          formValues.products[i].return_amount = returnAmount_val;

          formValues.products[i].return_charge = thisReturnCharge;

          formValues.products[i].discount_per_product = discount_per_product;

          return_amount += returnAmount_val;

          return_charge += thisReturnCharge;

          return_tax_charge += taxCharge;

          applicable_discount += discount_per_product;

          product_amount += thisAmt;

          product_amount_without_report_charge += thisAmt;

          total_charge_for_return += thisReturnCharge + taxCharge;
        }
      }
    }

    let returnDis = 0;

    //return_amount -= parseFloat(formValues.discount);

    returnDis = priceFormat(applicable_discount, true); //parseFloat(formValues.discount);

    if (hasCertifiedProduct > 0) {
      //return_report_charge = priceFormat(formValues.total_report_charge_amount_after_tax).toFixed(2);
      //return_amount = return_amount - return_report_charge;

      /* report charge calculation */
      let report_charge_amount = 0;

      let total_report_charge_amount = 0;

      let total_report_charge_tax_amount = 0;

      let total_report_charge_amount_after_tax = 0;

      //formValues.report_charge_amount = parseFloat(this.state.formValues.report_charge || 0);
      report_charge_amount = parseFloat(
        this.state.formValues.report_charge || 0,
      );

      if (!this.state.isAssign) {
        total_report_charge_amount =
          this.state.formValues.report_qty * parseFloat(report_charge_amount);

        total_report_charge_tax_amount =
          (total_report_charge_amount *
            parseFloat(this.state.formValues.report_tax_percentage)) /
          100;

        total_report_charge_amount_after_tax =
          total_report_charge_amount + total_report_charge_tax_amount;
      }

      console.log("report_qty : ", this.state.formValues.report_qty);

      console.log("report_charge_amount : ", report_charge_amount);

      console.log("total_report_charge_amount : ", total_report_charge_amount);

      console.log(
        "total_report_charge_tax_amount : ",
        total_report_charge_tax_amount,
      );

      console.log(
        "total_report_charge_amount_after_tax : ",
        total_report_charge_amount_after_tax,
      );

      formValues.report_charge_amount = report_charge_amount;

      formValues.total_report_charge_amount = total_report_charge_amount;

      formValues.total_report_charge_tax_amount =
        total_report_charge_tax_amount;

      formValues.total_report_charge_amount_after_tax =
        total_report_charge_amount_after_tax;

      return_report_charge = priceFormat(
        total_report_charge_amount_after_tax,
      ).toFixed(2);

      /* per product */
      let return_report_charge_per_product =
        return_report_charge / this.state.formValues.report_qty;

      return_report_charge =
        return_report_charge_per_product * hasCertifiedProduct;

      return_amount = return_amount - return_report_charge;

      total_charge_for_return += return_report_charge;

      /* if due amount exists then report change will be added with product amount */
      if (formValues.due_amount > 0) {
        product_amount += return_report_charge;
      }
    }

    let didNotReturned = 0,
      totalReturnP = 0;

    for (let i = 0; i < this.state.return_products.length; i++) {
      let product = _.filter(this.state.formValues.products, {
        id: this.state.return_products[i].id,
      });

      if (product.length && product[0].is_return == true) {
        continue;
      }

      if (this.state.return_products[i].is_return) {
        totalReturnP++;
      } else {
        didNotReturned++;
      }
    }

    /* return to wallet calculation */
    let return_from_wallet = 0;

    if (
      parseFloat(formValues.due_amount) == 0

      // && parseFloat(formValues.total_payable) == parseFloat(formValues.paid_amount)
    ) {
      if (totalReturnP == 1 && didNotReturned == 0) {
        /* return_from_wallet = parseFloat(formValues.paid_amount);

        return_from_wallet = priceFormat(

          return_from_wallet - this.state.return_amount

        ); */
        //return_from_wallet = priceFormat(this.state.return_amount);
      } else if (totalReturnP == 1 && didNotReturned > 0) {
        //return_from_wallet = priceFormat(parseFloat(this.state.return_amount));
      }
    } else {
      /* if (

        this.state.formValues.due_amount &&

        parseFloat(this.state.return_amount) >

          parseFloat(this.state.formValues.due_amount)

      ) {

        return_from_wallet = priceFormat(

          parseFloat(this.state.return_amount) -

            parseFloat(this.state.formValues.due_amount)

        );

      } */

      let paid_amount = parseFloat(formValues.paid_amount);
      /* if(paid_amount > 0){
        return_from_wallet = paid_amount;
      } */

      if (totalReturnP == 1 && didNotReturned == 0) {
        /* return_from_wallet = parseFloat(formValues.paid_amount);

        return_from_wallet = priceFormat(

          return_from_wallet - this.state.return_amount

        ); */
        //return_from_wallet = paid_amount;
      } else if (totalReturnP == 1 && didNotReturned > 0) {
        //return_from_wallet = priceFormat(parseFloat(this.state.return_amount));
      }

      if (didNotReturned == 0) {
        /* now return amount from wallet to the user */
        //if(total_charge_for_return > 0 && total_charge_for_return < formValues.paid_amount){
        return_from_wallet = priceFormat(formValues.paid_amount).toFixed(2);
        //}
      }
    }

    //if(totalReturnP == 1 && didNotReturned == 0){
    // if(didNotReturned == 0 && total_charge_for_return > 0 && total_charge_for_return < formValues.paid_amount){
    //   return_from_wallet = priceFormat(formValues.paid_amount - total_charge_for_return).toFixed(2);
    // }

    //}

    console.log({
      return_amount: priceFormat(return_amount, true),

      product_amount: priceFormat(product_amount, true),

      product_amount_without_report_charge: priceFormat(
        product_amount_without_report_charge,
        true,
      ),

      return_charge: priceFormat(return_charge, true),

      return_report_charge: priceFormat(return_report_charge, true),

      return_tax_charge: priceFormat(return_tax_charge, true),

      hasCertifiedProduct,

      formValues: formValues,

      return_discount: returnDis,

      total_charge_for_return: priceFormat(total_charge_for_return, true),

      return_from_wallet: priceFormat(return_from_wallet, true),
    });

    this.setState({
      return_amount: priceFormat(return_amount, true),

      product_amount: priceFormat(product_amount, true),

      product_amount_without_report_charge: priceFormat(
        product_amount_without_report_charge,
        true,
      ),

      return_charge: priceFormat(return_charge, true),

      return_report_charge: priceFormat(return_report_charge, true),

      return_tax_charge: priceFormat(return_tax_charge, true),

      total_charge_for_return: priceFormat(total_charge_for_return, true),

      formValues: formValues,

      return_discount: returnDis,

      return_from_wallet: priceFormat(return_from_wallet, true),
    });
  };

  handleReturnMaterial = (val, key) => {
    let { formValues, actionProductIndex } = this.state;

    formValues.products[actionProductIndex].materials[0][key] = val;

    this.setState({
      formValues: formValues,
    });
  };

  hasReturn = () => {
    let isReturn = 0,
      will_return_charge_apply = false;

    for (let i = 0; i < this.state.return_products.length; i++) {
      let product = _.filter(this.state.formValues.products, {
        id: this.state.return_products[i].id,
      });

      if (product.length && product[0].is_return == true) {
        continue;
      }

      if (this.state.return_products[i].is_return) {
        isReturn++;
      }

      if (product[0].return_charge_percent > 0) {
        will_return_charge_apply = true;
      }
    }

    return {
      isReturn: isReturn,

      will_return_charge_apply: will_return_charge_apply,
    };
  };

  setOpen = (id) => {
    let view_open = this.state.view_open;

    view_open[id] = !this.checkOpen(id);

    this.setState({
      view_open: view_open,
    });
  };

  checkOpen = (id) => {
    let view_open = this.state.view_open;

    return id in view_open && view_open[id] ? true : false;
  };

  handleAdvance = (e) => {
    this.setState(
      {
        formValues: {
          ...this.state.formValues,

          pay_from_advance: e.target.checked,
        },
      },

      () => {
        this.handleCalculateMainPrice();
      },
    );
  };

  handleOpenQRScanner = () => {
    this.setState({ qrScannerOpen: true, qrScannerError: null }, () => {
      setTimeout(() => {
        const qrReaderElement = document.getElementById("qr-reader");

        if (qrReaderElement) {
          const video = document.createElement("video");

          video.setAttribute("playsinline", "true");

          video.style.width = "100%";

          video.style.height = "auto";

          const canvas = document.createElement("canvas");

          const canvasContext = canvas.getContext("2d", {
            willReadFrequently: true,
          });

          const boundary = document.createElement("div");

          boundary.className = "qr-scanner-boundary";

          boundary.style.position = "absolute";

          boundary.style.top = "50%";

          boundary.style.left = "50%";

          boundary.style.transform = "translate(-50%, -50%)";

          boundary.style.width = "70%";

          boundary.style.height = "70%";

          boundary.style.border = "2px solid #2196f3";

          boundary.style.borderRadius = "8px";

          boundary.style.boxShadow = "0 0 0 5000px rgba(0, 0, 0, 0.3)";

          boundary.style.zIndex = "1";

          qrReaderElement.innerHTML = "";

          qrReaderElement.style.position = "relative";

          qrReaderElement.appendChild(video);

          qrReaderElement.appendChild(boundary);

          const scannerState = {
            video,
            canvas,
            canvasContext,
            boundary,
            animationFrameId: null,
            stream: null,
            active: true,
            lastScanTime: 0,
            scanInterval: 100,
          };

          this.setState({ qrScanner: scannerState });

          const hasBarcodeDetector = "BarcodeDetector" in window;

          let barcodeDetector = null;

          try {
            if (hasBarcodeDetector) {
              barcodeDetector = new BarcodeDetector({
                formats: ["qr_code", "aztec", "data_matrix", "pdf417"],
              });
            }
          } catch (error) {}

          navigator.mediaDevices
            .getUserMedia({
              video: { facingMode: "environment" },
              audio: false,
            })
            .then((stream) => {
              scannerState.stream = stream;

              video.srcObject = stream;

              video.play();

              video.onloadedmetadata = () => {
                canvas.width = video.videoWidth;

                canvas.height = video.videoHeight;

                const getBoundaryRect = () => {
                  const videoRect = video.getBoundingClientRect();

                  const boundaryRect = boundary.getBoundingClientRect();

                  const boundaryRatio = {
                    x: boundaryRect.width / videoRect.width,

                    y: boundaryRect.height / videoRect.height,

                    left:
                      (boundaryRect.left - videoRect.left) / videoRect.width,

                    top: (boundaryRect.top - videoRect.top) / videoRect.height,
                  };

                  return {
                    x: Math.floor(canvas.width * boundaryRatio.left),

                    y: Math.floor(canvas.height * boundaryRatio.top),

                    width: Math.floor(canvas.width * boundaryRatio.x),

                    height: Math.floor(canvas.height * boundaryRatio.y),
                  };
                };

                const scanQRCode = () => {
                  if (!scannerState.active) return;

                  const now = Date.now();

                  if (
                    now - scannerState.lastScanTime >=
                    scannerState.scanInterval
                  ) {
                    scannerState.lastScanTime = now;

                    canvasContext.drawImage(
                      video,
                      0,
                      0,
                      canvas.width,
                      canvas.height,
                    );

                    const boundaryRect = getBoundaryRect();

                    const imageData = canvasContext.getImageData(
                      boundaryRect.x,
                      boundaryRect.y,
                      boundaryRect.width,
                      boundaryRect.height,
                    );

                    if (hasBarcodeDetector && barcodeDetector) {
                      try {
                        barcodeDetector
                          .detect(imageData)
                          .then((barcodes) => {
                            if (barcodes.length > 0) {
                              const decodedText = barcodes[0].rawValue;

                              this.handleQRCodeSuccess(decodedText);
                            }
                          })
                          .catch(() => {
                            scanWithJsQR(imageData);
                          });
                      } catch (error) {
                        scanWithJsQR(imageData);
                      }
                    } else {
                      scanWithJsQR(imageData);
                    }
                  }

                  scannerState.animationFrameId =
                    requestAnimationFrame(scanQRCode);
                };

                const scanWithJsQR = (imageData) => {
                  try {
                    const code = jsQR(
                      imageData.data,
                      imageData.width,
                      imageData.height,
                      { inversionAttempts: "dontInvert" },
                    );

                    if (code) {
                      this.handleQRCodeSuccess(code.data);
                    }
                  } catch (error) {}
                };

                scanQRCode();
              };
            })
            .catch((err) => {
              this.setState({
                qrScannerError:
                  "Failed to access camera. Please check permissions and try again.",
              });
            });
        } else {
          this.setState({
            qrScannerOpen: false,
            qrScannerError:
              "QR scanner initialization failed. Please try again.",
          });
        }
      }, 300);
    });
  };

  handleCloseQRScanner = () => {
    if (this.state.qrScanner) {
      const scannerState = this.state.qrScanner;

      scannerState.active = false;

      if (scannerState.animationFrameId) {
        cancelAnimationFrame(scannerState.animationFrameId);
      }

      if (scannerState.stream) {
        scannerState.stream.getTracks().forEach((track) => track.stop());
      }

      if (scannerState.video && scannerState.video.srcObject) {
        scannerState.video.srcObject = null;
      }

      if (scannerState.boundary && scannerState.boundary.parentNode) {
        scannerState.boundary.parentNode.removeChild(scannerState.boundary);
      }

      this.setState({
        qrScannerOpen: false,
        qrScanner: null,
        qrScannerError: null,
      });
    } else {
      this.setState({ qrScannerOpen: false, qrScannerError: null });
    }
  };

  handleRetryQRScanner = () => {
    if (this.state.qrScanner) {
      const scannerState = this.state.qrScanner;

      scannerState.active = false;

      if (scannerState.animationFrameId) {
        cancelAnimationFrame(scannerState.animationFrameId);
      }

      if (scannerState.stream) {
        scannerState.stream.getTracks().forEach((track) => track.stop());
      }

      if (scannerState.video && scannerState.video.srcObject) {
        scannerState.video.srcObject = null;
      }

      if (scannerState.boundary && scannerState.boundary.parentNode) {
        scannerState.boundary.parentNode.removeChild(scannerState.boundary);
      }

      this.setState({ qrScannerError: null, qrScanner: null }, () => {
        this.handleOpenQRScanner();
      });
    } else {
      this.handleOpenQRScanner();
    }
  };

  handleQRCodeSuccess = async (decodedText) => {
    // Debounce QR code scanned notification

    if (!this.qrScanNotified) {
      this.qrScanNotified = true;

      if (this.props.enqueueSnackbar) {
        this.props.enqueueSnackbar("QR code scanned successfully!", {
          variant: "success",
          autoHideDuration: 3000,
        });
      }

      setTimeout(() => {
        this.qrScanNotified = false;
      }, 1000);
    }

    if (typeof decodedText === "string" && decodedText.startsWith("http")) {
      await this.fetchData(decodedText); // Wait for extraction and removal
    } else {
      this.handleCertificateInput(decodedText, true);
    }

    this.handleCloseQRScanner();
  };

  handleCertificateInput = (certificate_no, clearInput = false) => {
    // If it's a URL, always try to extract the certificate number first

    if (
      typeof certificate_no === "string" &&
      certificate_no.startsWith("http")
    ) {
      this.fetchData(certificate_no);

      return;
    }

    this.handleDeleteByCertificateNo(certificate_no);
  };

  fetchData = async (url) => {
    if (url.includes("igi.org")) {
      try {
        const pdfData = await extractPdfData(url);

        const certificateNo =
          pdfData.text.report_number && pdfData.text.report_number.trim() !== ""
            ? pdfData.text.report_number
            : pdfData.text.summary_number;

        if (certificateNo) {
          this.setState({ globalCertificateNo: certificateNo }, () => {
            this.handleCertificateInput(certificateNo, true);
          });
        } else {
          if (this.props.enqueueSnackbar) {
            this.props.enqueueSnackbar(
              "Certificate number not found in IGI PDF.",
              { variant: "warning" },
            );
          }
        }

        return;
      } catch (error) {
        console.error("Error extracting PDF data:", error);

        if (this.props.enqueueSnackbar) {
          this.props.enqueueSnackbar(
            "Failed to extract certificate number from PDF.",
            { variant: "error" },
          );
        }

        return;
      }
    } else if (url.includes("iigl.org/verify-report/")) {
      try {
        // Fetch the page and extract the summary number from the HTML

        const response = await fetch(url, {
          method: "GET",
          redirect: "follow",
        });

        const result = await response.text();

        const parser = new window.DOMParser();

        const doc = parser.parseFromString(result, "text/html");

        // Try to extract summary number (certificate number) from a <b> tag

        const searchedForElement = doc.querySelector("b");

        const searchedForText = searchedForElement
          ? searchedForElement.textContent
          : "";

        if (searchedForText && !searchedForText.startsWith("http")) {
          this.setState({ globalCertificateNo: searchedForText }, () => {
            this.handleCertificateInput(searchedForText, true);
          });

          return;
        }

        // fallback: show warning if not found

        if (this.props.enqueueSnackbar) {
          this.props.enqueueSnackbar(
            "Certificate number not found in IIGL page.",
            { variant: "warning" },
          );
        }
      } catch (e) {}

      return;
    } else {
      // Try to fetch and parse the page for a certificate number (like PurchaseForm.js)

      try {
        const response = await fetch(url, {
          method: "GET",
          redirect: "follow",
        });

        const result = await response.text();

        const parser = new window.DOMParser();

        const doc = parser.parseFromString(result, "text/html");

        // Try to extract certificate number from a <b> tag (as in PurchaseForm.js)

        const searchedForElement = doc.querySelector("b");

        const searchedForText = searchedForElement
          ? searchedForElement.textContent
          : "";

        if (searchedForText && !searchedForText.startsWith("http")) {
          this.setState({ globalCertificateNo: searchedForText }, () => {
            this.handleCertificateInput(searchedForText, true);
          });

          return;
        }
      } catch (error) {
        // fallback to warning below
      }
    }

    // fallback: only use the url as certificate_no if it's not a URL

    if (typeof url === "string" && !url.startsWith("http")) {
      this.setState({ globalCertificateNo: url }, () => {
        this.handleCertificateInput(url, true);
      });
    } else {
      if (this.props.enqueueSnackbar) {
        this.props.enqueueSnackbar(
          "Invalid certificate number or unsupported URL.",
          { variant: "warning" },
        );
      }
    }
  };

  // Delete product by certificate number using the same logic as the action button

  handleDeleteByCertificateNo = async (certificate_no) => {
    let formValues = { ...this.state.formValues };

    let idx = formValues.products.findIndex(
      (p) => p.certificate_no === certificate_no,
    );

    if (idx !== -1) {
      await this.removeProductAt(idx);

      this.setState(
        {
          deleteDialogOpen: false,

          globalCertificateNo: null,
        },
        () => {
          this.handleCalculateMainPrice();
        },
      );
    } else {
      this.setState(
        {
          globalCertificateNo: null,
        },
        () => {
          this.handleCalculateMainPrice();

          if (
            !this.lastNotFoundCert ||
            this.lastNotFoundCert !== certificate_no
          ) {
            this.lastNotFoundCert = certificate_no;

            if (this.props.enqueueSnackbar) {
              this.props.enqueueSnackbar(
                `Certificate #${certificate_no} not found in list.`,
                { variant: "warning" },
              );
            }

            setTimeout(() => {
              this.lastNotFoundCert = null;
            }, 1000);
          }
        },
      );
    }
  };

  render() {
    const {
      report_charge,

      formValues,

      formErros,

      productFormValues,

      productFormErros,

      materialFormErros,

      submitting,

      order,

      actionProductIndex,

      unique_materials,

      isMobile,

      return_from_wallet,

      total_charge_for_return,
    } = this.state;

    console.log("this is the state of salefprm ", this.state);

    console.log("unique_materials : ", unique_materials);

    console.log("formValues : ", formValues);

    const actionProduct = formValues.products.length
      ? formValues.products[actionProductIndex]
      : null;

    let userList = this.getUserList();

    let userIdColumnXs = 1;

    if (this.state.isAssign) {
      userIdColumnXs = formValues.user_id ? 2 : 4;
    } else {
      userIdColumnXs = formValues.user_id ? 4 : 6;
    }

    let user = formValues.user_id
      ? _.filter(
          userList,
          (item) => String(item.id) === String(formValues.user_id),
        )
      : [];

    let userIdValue = user.length ? user[0] : null;

    /* the selected user is not always part of the list of the current mode:
       picking an own company on a sale switches the form to a transfer, whose
       list is built from other roles, so fall back to what was picked instead
       of leaving the field blank */
    if (
      !userIdValue &&
      formValues.user_id &&
      this.state.selectedUserOption &&
      String(this.state.selectedUserOption.id) === String(formValues.user_id)
    ) {
      userIdValue = this.state.selectedUserOption;
    }

    // the company picker creates the next user down the chain inline
    const addConfig = this.getAddUserConfig();
    const ADD_ADMIN_OPTION = {
      id: "__add_admin__",
      company_name: addConfig ? addConfig.label : "",
    };
    let userListWithAddOption = addConfig
      ? [...userList, ADD_ADMIN_OPTION]
      : userList;

    if (userIdValue && !user.length) {
      userListWithAddOption = [userIdValue, ...userListWithAddOption];
    }

    /* A sales executive sells out of the team's whole book, so the picker
       splits it: the retailers this executive brought in, then the rest.
       "Add New Retailer" rides along with the team's group so it stays last
       instead of opening a header of its own. */
    const userListGroupBy =
      this.isSalesExecutive && !this.state.isAssign
        ? (option) =>
            option.id !== ADD_ADMIN_OPTION.id && option.is_my_retailer
              ? "Own Retailers"
              : "Team Retailers"
        : undefined;

    /* grouping only reads right when the options are already ordered by group,
       and that has to happen after the selected user and the add option join
       the list */
    if (userListGroupBy) {
      userListWithAddOption = _.sortBy(userListWithAddOption, (option) =>
        option.id === ADD_ADMIN_OPTION.id ? 2 : option.is_my_retailer ? 0 : 1,
      );
    }

    /* the company is picked for us, either from a sale on approval or after
       an inline admin creation, both wait on the user list to arrive */
    const selectingUser =
      !!this.state.pendingAdminSelectId ||
      (!isEmpty(this.props.query.get("sale_on_approval")) &&
        !this.state.loadSaleOnApprovalApiCall);

    let hasReturn = this.hasReturn();

    let will_return_charge_apply = hasReturn.will_return_charge_apply;

    let isReturn = hasReturn.isReturn;

    /* let return_from_wallet = 0;

     let didNotReturned = 0,

        totalReturnP = 0;

    for (let i = 0; i < this.state.return_products.length; i++) {

      let product = _.filter(formValues.products, {

        id: this.state.return_products[i].id,

      });

      if (product.length && product[0].is_return == true) {

        continue;

      }

      if (this.state.return_products[i].is_return) {

        totalReturnP++;

      } else {

        didNotReturned++;

      }

    }

    if (

      parseFloat(formValues.due_amount) == 0 &&

      parseFloat(formValues.total_payable) == parseFloat(formValues.paid_amount)

    ) {

      



      if (totalReturnP == 1 && didNotReturned == 0) {

        return_from_wallet = parseFloat(formValues.paid_amount);

        return_from_wallet = priceFormat(

          return_from_wallet - this.state.return_charge

        );

        //return_from_wallet = priceFormat(this.state.return_amount);

      } else if (totalReturnP == 1 && didNotReturned > 0) {

        return_from_wallet = priceFormat(parseFloat(this.state.return_amount));

      }

    } else {

      if (

        this.state.formValues.due_amount &&

        parseFloat(this.state.return_amount) >

          parseFloat(this.state.formValues.due_amount)

      ) {

        return_from_wallet = priceFormat(

          parseFloat(this.state.return_amount) -

            parseFloat(this.state.formValues.due_amount)

        );

      }

      //let paid_amount = parseFloat(formValues.paid_amount);
      //if(paid_amount > 0){
      //  return_from_wallet = paid_amount;
      //}

      if (totalReturnP == 1 && didNotReturned == 0) {

        return_from_wallet = parseFloat(formValues.paid_amount);

        return_from_wallet = priceFormat(

          return_from_wallet - this.state.return_amount

        );

        //return_from_wallet = paid_amount;

      } else if (totalReturnP == 1 && didNotReturned > 0) {

        //return_from_wallet = priceFormat(parseFloat(this.state.return_amount));

      }
    } */

    console.log("formValues.user_id : ", formValues.user_id);

    return (
      <Box
        sx={{ flexGrow: 1, m: 0.5 }}
        className="ratn-dialog-inner sale_create_page"
      >
        <Grid
          container
          spacing={2}
          columnSpacing={{ xs: 1, sm: 2, md: 2 }}
          className="tax-input loans_view p_view"
        >
          {order ? (
            <Grid item xs={12} md={12} className="create-input">
              <Accordion className="rtn_accordion">
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography>
                    Order # {order.order_no} | {order.order_from} |{" "}
                    {order.order_date}
                  </Typography>
                </AccordionSummary>

                <AccordionDetails>
                  <DataTable
                    columns={this.columns}
                    rows={order.products}
                    page={1}
                    limit={order.products.length}
                    total={order.products.length}
                    havePagination={false}
                  />
                </AccordionDetails>
              </Accordion>
            </Grid>
          ) : null}

          <Grid container spacing={2} columnSpacing={{ xs: 1, sm: 2, md: 2 }}>
            {this.state.isAssign ? (
              <Grid item xs={12} md={2} className="create-input">
                <FormControl fullWidth>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={this.handleBackAssign}
                    startIcon={<ArrowBackIcon />}
                  >
                    Back
                  </Button>
                </FormControl>
              </Grid>
            ) : null}

            <Grid item md={userIdColumnXs} xs={6} className="create-input">
              {/*<FormControl fullWidth error={formErros.user_id}>

                                <InputLabel>{this.state.isAssign ? "Transfer To" : "Company Name"}</InputLabel>

                                <Select

                                    className='input-inner'

                                    value={formValues.user_id}

                                    fullWidth

                                    label={this.state.isAssign ? "Transfer To" : "Company Name"}

                                    onChange={this.handleAdminChange}

                                >

                                    <MenuItem value=""></MenuItem>

                                    {

                                        userList.map((item, index) => {

                                            return <MenuItem value={item.id} key={index}>{this.state.isAssign ? item.name : item.company_name}</MenuItem>

                                        })

                                    }

                                </Select>

                            </FormControl>*/}

              <FormControl fullWidth error={formErros.user_id}>
                {order && order.is_customer ? (
                  <TextField
                    label="Name"
                    variant="outlined"
                    fullWidth
                    value={order.user_details.name}
                    disabled
                    inputProps={{ className: "non_disable_text" }}
                  />
                ) : (
                  <Autocomplete
                    className="autocomplete-selectbox"
                    fullWidth
                    options={userListWithAddOption}
                    groupBy={userListGroupBy}
                    value={userIdValue}
                    autoHighlight
                    getOptionLabel={(option) =>
                      (this.state.isAssign
                        ? option.name || option.company_name
                        : option.company_name || option.name) || ""
                    }
                    renderOption={(props, option) =>
                      option.id === ADD_ADMIN_OPTION.id ? (
                        <li {...props} key={option.id}>
                          <AddIcon fontSize="small" sx={{ mr: 1 }} />
                          {ADD_ADMIN_OPTION.company_name}
                        </li>
                      ) : (
                        <li {...props} key={option.id}>
                          {" "}
                          {this.state.isAssign
                            ? (option.name || option.company_name || "") +
                              " - " +
                              ((option.user_name || "").search("RVE") != -1
                                ? "SE "
                                : "") +
                              ((option.user_name || "").search("RVA") != -1
                                ? "Admin "
                                : "") +
                              ((option.user_name || "").search("RVD") != -1
                                ? "Distributor"
                                : "") +
                              ((option.user_name || "").search("RVR") != -1
                                ? "Retailer"
                                : "")
                            : option.company_name + "( " + option.city + " )"}
                        </li>
                      )
                    }
                    renderInput={(params) => (
                      <TextField
                        style={{ margin: "auto" }}
                        {...params}
                        label={
                          this.state.isAssign ? "Transfer To" : "Company Name"
                        }
                        inputProps={{
                          ...params.inputProps,

                          autoComplete: "new-password",
                        }}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: selectingUser ? (
                            <CircularProgress size="20px" />
                          ) : (
                            params.InputProps.endAdornment
                          ),
                        }}
                        fullWidth
                        error={formErros.user_id}
                        className="non_disable_text"
                      />
                    )}
                    onChange={(event, newValue) => {
                      if (newValue && newValue.id === ADD_ADMIN_OPTION.id) {
                        this.setState({ showAddAdminDialog: true });
                        return;
                      }
                      this.handleAdminChange(
                        event,

                        newValue ? newValue.id : "",
                      );
                    }}
                    disabled={
                      !this.state.isCreateFrom ||
                      (order ? true : false) ||
                      selectingUser ||
                      this.state.userAutoSelected ||
                      /* a sale on approval brings its own company, it is not
                         changeable nor clearable */
                      !isEmpty(this.props.query.get("sale_on_approval"))
                    }
                  />
                )}
              </FormControl>
              <Dialog
                className="ratn-dialog-wrapper"
                open={this.state.showAddAdminDialog}
                onClose={() => this.setState({ showAddAdminDialog: false })}
                fullWidth
                maxWidth="xl"
              >
                <DialogTitle>
                  {addConfig ? addConfig.title : ""}
                  <IconButton
                    onClick={() =>
                      this.setState({ showAddAdminDialog: false })
                    }
                    sx={{ position: "absolute", right: 8, top: 8 }}
                  >
                    <CloseIcon />
                  </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                  {this.state.showAddAdminDialog && addConfig ? (
                    <addConfig.Form
                      onCreateSuccess={this.handleAdminCreated}
                    />
                  ) : null}
                </DialogContent>
              </Dialog>
            </Grid>

            {isMobile ? (
              <>
                <Grid item xs={6} md={userIdColumnXs} className="create-input">
                  <TextField
                    label="Contact Number"
                    variant="outlined"
                    fullWidth
                    value={this.state.admin_details.mobile}
                    disabled
                    inputProps={{ className: "non_disable_text" }}
                    onInput={(e) => validateInteger(e)}
                  />
                </Grid>

                <Grid
                  item
                  xs={6}
                  md={userIdColumnXs}
                  className={`create-input ${formValues.user_id ? "create-input-responsive" : ""}`}
                >
                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel1a-content"
                      id="panel1a-header"
                    >
                      <Typography
                        style={{
                          color: "#1e2746",

                          width: "100%",

                          textAlign: "right",
                        }}
                      >
                        See more
                      </Typography>
                    </AccordionSummary>

                    <AccordionDetails className="see-more-details-sec">
                      {formValues.user_id ? (
                        <>
                          <Grid item xs={6} md={2} className="create-input">
                            <TextField
                              label="Owner Name"
                              variant="outlined"
                              fullWidth
                              value={this.state.admin_details.name}
                              disabled
                              inputProps={{ className: "non_disable_text" }}
                            />
                          </Grid>

                          <Grid item xs={6} md={2} className="create-input">
                            <TextField
                              label="City"
                              variant="outlined"
                              fullWidth
                              value={this.state.admin_details.city}
                              disabled
                              inputProps={{ className: "non_disable_text" }}
                            />
                          </Grid>

                          <Grid item xs={6} md={2} className="create-input">
                            <TextField
                              label="Pincode"
                              variant="outlined"
                              fullWidth
                              value={this.state.admin_details.pincode}
                              disabled
                              inputProps={{ className: "non_disable_text" }}
                              onInput={(e) => validateInteger(e)}
                            />
                          </Grid>
                        </>
                      ) : null}

                      {!formValues.user_id ? (
                        <>
                          <Grid item xs={6} md={3} className="create-input">
                            <TextField
                              label="Invoice Number"
                              variant="outlined"
                              fullWidth
                              value={formValues.invoice_number}
                              onChange={(event) =>
                                this.handleDefaultChange(
                                  event,
                                  "invoice_number",
                                )
                              }
                              disabled={!this.state.isCreateFrom}
                              className="non_disable_text"
                            />
                          </Grid>

                          <Grid
                            item
                            xs={!formValues.user_id ? 6 : 6}
                            md={!formValues.user_id ? 3 : 2}
                            className="create-input p-invoice-date"
                          >
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <DatePicker
                                label="Invoice Date"
                                value={formValues.invoice_date}
                                inputFormat="DD/MM/YYYY"
                                disabled={!this.state.isCreateFrom}
                                onChange={(newValue) =>
                                  this.updateFormValues(
                                    newValue,
                                    "invoice_date",
                                  )
                                }
                                renderInput={(params) => (
                                  <TextField
                                    fullWidth
                                    {...params}
                                    error={formErros.invoice_date}
                                    className="non_disable_text"
                                  />
                                )}
                              />
                            </LocalizationProvider>
                          </Grid>
                        </>
                      ) : null}

                      {formValues.user_id ? (
                        <>
                          <Grid item xs={6} md={8} className="create-input">
                            <TextField
                              label="Full Address"
                              variant="outlined"
                              fullWidth
                              value={this.state.admin_details.address}
                              disabled
                              inputProps={{ className: "non_disable_text" }}
                            />
                          </Grid>

                          <Grid item xs={6} md={2} className="create-input">
                            <TextField
                              label="GST Number"
                              variant="outlined"
                              fullWidth
                              value={this.state.admin_details.gst}
                              disabled
                              inputProps={{ className: "non_disable_text" }}
                            />
                          </Grid>

                          <Grid item xs={6} md={2} className="create-input">
                            <TextField
                              label="Invoice Number"
                              variant="outlined"
                              fullWidth
                              value={formValues.invoice_number}
                              onChange={(event) =>
                                this.handleDefaultChange(
                                  event,
                                  "invoice_number",
                                )
                              }
                              className="non_disable_text"
                              disabled={!this.state.isCreateFrom}
                            />
                          </Grid>

                          {/* Certificate No. Remove/Scan input for main product list */}

                          <Grid item xs={12} md={4} className="create-input">
                            <TextField
                              label="Remove Product by Certificate Number"
                              variant="outlined"
                              fullWidth
                              value={this.state.globalCertificateNo || ""}
                              onChange={(e) => {
                                this.setState({
                                  globalCertificateNo: e.target.value,
                                });

                                if (e.target.value.startsWith("http")) {
                                  this.debouncedFetchData(e.target.value);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  if (
                                    this.state.globalCertificateNo.startsWith(
                                      "http",
                                    )
                                  ) {
                                    this.fetchData(
                                      this.state.globalCertificateNo,
                                    );
                                  } else {
                                    this.handleCertificateInput(
                                      this.state.globalCertificateNo,
                                      true,
                                    );
                                  }
                                }
                              }}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      color="primary"
                                      onClick={this.handleOpenQRScanner}
                                      edge="end"
                                      size="small"
                                      sx={{ p: 0.5 }}
                                    >
                                      <QrCodeScanner
                                        sx={{ color: "#1976d2" }}
                                        fontSize="small"
                                      />
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                              placeholder="Scan or enter certificate number or verification URL to remove product"
                            />
                          </Grid>
                        </>
                      ) : null}
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              </>
            ) : (
              <>
                {formValues.user_id ? (
                  <>
                    <Grid item xs={6} md={2} className="create-input">
                      <TextField
                        label="Owner Name"
                        variant="outlined"
                        fullWidth
                        value={this.state.admin_details.name}
                        disabled
                        inputProps={{ className: "non_disable_text" }}
                      />
                    </Grid>

                    <Grid item xs={6} md={2} className="create-input">
                      <TextField
                        label="Contact Number"
                        variant="outlined"
                        fullWidth
                        value={this.state.admin_details.mobile}
                        disabled
                        inputProps={{ className: "non_disable_text" }}
                        onInput={(e) => validateInteger(e)}
                      />
                    </Grid>

                    <Grid item xs={6} md={2} className="create-input">
                      <TextField
                        label="City"
                        variant="outlined"
                        fullWidth
                        value={this.state.admin_details.city}
                        disabled
                        inputProps={{ className: "non_disable_text" }}
                      />
                    </Grid>

                    <Grid item xs={6} md={2} className="create-input">
                      <TextField
                        label="Pincode"
                        variant="outlined"
                        fullWidth
                        value={this.state.admin_details.pincode}
                        disabled
                        inputProps={{ className: "non_disable_text" }}
                        onInput={(e) => validateInteger(e)}
                      />
                    </Grid>
                  </>
                ) : null}

                {!formValues.user_id ? (
                  <Grid item xs={6} md={3} className="create-input">
                    <TextField
                      label="Invoice Number"
                      variant="outlined"
                      fullWidth
                      value={formValues.invoice_number}
                      onChange={(event) =>
                        this.handleDefaultChange(event, "invoice_number")
                      }
                      disabled={!this.state.isCreateFrom}
                      className="non_disable_text"
                    />
                  </Grid>
                ) : null}

                {formValues.user_id ? (
                  <>
                    <Grid item xs={12} md={8} className="create-input">
                      <TextField
                        label="Full Address"
                        variant="outlined"
                        fullWidth
                        value={this.state.admin_details.address}
                        disabled
                        inputProps={{ className: "non_disable_text" }}
                      />
                    </Grid>

                    <Grid item xs={6} md={2} className="create-input">
                      <TextField
                        label="GST Number"
                        variant="outlined"
                        fullWidth
                        value={this.state.admin_details.gst}
                        disabled
                        inputProps={{ className: "non_disable_text" }}
                      />
                    </Grid>

                    <Grid item xs={6} md={2} className="create-input">
                      <TextField
                        label="Invoice Number"
                        variant="outlined"
                        fullWidth
                        value={formValues.invoice_number}
                        onChange={(event) =>
                          this.handleDefaultChange(event, "invoice_number")
                        }
                        className="non_disable_text"
                        disabled={!this.state.isCreateFrom}
                      />
                    </Grid>

                    {/* Certificate No. Remove/Scan input for main product list */}

                    <Grid item xs={12} md={4} className="create-input">
                      <TextField
                        label="Remove Product by Certificate Number"
                        variant="outlined"
                        fullWidth
                        value={this.state.globalCertificateNo || ""}
                        onChange={(e) => {
                          this.setState({
                            globalCertificateNo: e.target.value,
                          });

                          if (e.target.value.startsWith("http")) {
                            this.debouncedFetchData(e.target.value);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            if (
                              this.state.globalCertificateNo.startsWith("http")
                            ) {
                              this.fetchData(this.state.globalCertificateNo);
                            } else {
                              this.handleCertificateInput(
                                this.state.globalCertificateNo,
                                true,
                              );
                            }
                          }
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                color="primary"
                                onClick={this.handleOpenQRScanner}
                                edge="end"
                                size="small"
                                sx={{ p: 0.5 }}
                              >
                                <QrCodeScanner
                                  sx={{ color: "#1976d2" }}
                                  fontSize="small"
                                />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        placeholder="Scan or enter certificate number or verification URL to remove product"
                      />
                    </Grid>
                  </>
                ) : null}
              </>
            )}
          </Grid>
        </Grid>

        <Grid
          container
          spacing={2}
          columnSpacing={{ xs: 1, sm: 2, md: 2 }}
          className="tax-input loans_view"
        >
          <Grid
            item
            xs={12}
            md={12}
            className=" create-input p-add-product border-radius-0"
          >
            {/*<h3 className='p_heading_list'>Product List <Button variant="contained" className='add-button' onClick={() => this.handleAddNewProduct()}>Add Product</Button></h3>*/}

            <TableContainer component={Paper}>
              <Table
                sx={{ minWidth: 650 }}
                aria-label="simple table"
                className="ratn-table-product-wrapper sale_form_table"
              >
                <TableHead className="ratn-table-header p_view">
                  <TableRow>
                    {!this.state.isCreateFrom ? (
                      <TableCell sx={{ width: "30px" }}></TableCell>
                    ) : null}

                    <TableCell sx={{ width: 15 }}>#</TableCell>

                    <TableCell sx={{ width: 225 }}>Product Name</TableCell>

                    <TableCell sx={{ width: 100, paddingLeft: '12px', paddingRight: '12px' }}>Size</TableCell>

                    <TableCell sx={{ width: 120 }}>Certificate No</TableCell>

                    <TableCell sx={{ width: 90 }}>Matl Cost</TableCell>

                    <TableCell sx={{ width: 160 }}>Mac Charge</TableCell>

                    <TableCell sx={{ width: "40px" }}>Price</TableCell>

                    <TableCell sx={{ width: "20px" }}>Dist</TableCell>

                    <TableCell sx={{ width: "80px" }}>Tax</TableCell>

                    <TableCell sx={{ width: "40px" }}>Total</TableCell>

                    {this.state.isCreateFrom ? (
                      <TableCell sx={{ width: "20px" }}>Actions</TableCell>
                    ) : null}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {formValues.products.map((item, index) => {
                    let getUnit = item.materials.filter(
                      (itm) => itm.purity_id == 4 || itm.purity_id == 18,
                    );

                    let productWeightUnitName =
                      getUnit.length > 0 ? getUnit[0].unit_name : "";

                    return (
                      <React.Fragment key={index}>
                        <TableRow className="product_details">
                          {!this.state.isCreateFrom ? (
                            <TableCell>
                              {!item.is_return ? (
                                <Checkbox
                                  onChange={(e) =>
                                    this.handleCheckBox(e, index)
                                  }
                                  checked={
                                    this.state.return_products[index].is_return
                                  }
                                />
                              ) : null}

                              {!item.is_return &&
                              item.product_type == "material" &&
                              item.materials[0].return_weight ? (
                                <IconButton
                                  aria-label="expand row"
                                  size="small"
                                  onClick={() => this.setOpen(item.id)}
                                >
                                  {this.checkOpen(item.id) ? (
                                    <KeyboardArrowUpIcon />
                                  ) : (
                                    <KeyboardArrowDownIcon />
                                  )}
                                </IconButton>
                              ) : null}
                            </TableCell>
                          ) : null}

                          <TableCell>{index + 1}</TableCell>

                          <TableCell>
                            {item.product_name} X{" "}
                            {item.quantity
                              ? item.quantity
                              : item.certificate_no
                                ? 1
                                : item.materials[0].avl_qty}
                          </TableCell>

                          <TableCell style={{ paddingLeft: '12px', paddingRight: '12px' }}>{item.size_name}</TableCell>

                          <TableCell>{item.certificate_no}</TableCell>

                          <TableCell colSpan={2}>
                            {item.total_weight} {"Wt"}
                          </TableCell>

                          <TableCell></TableCell>
                        </TableRow>

                        <TableRow className="material_details">
                          <TableCell></TableCell>

                          {!this.state.isCreateFrom ? (
                            <>
                              <TableCell></TableCell>
                            </>
                          ) : null}

                          <TableCell colSpan={2}>
                            {item.materials.map((m, key) =>
                              parseFloat(m.weight || 0) > 0 ||
                              parseFloat(m.amount || 0) > 0 ? (
                                <div
                                  className="products-data-container"
                                  key={key}
                                >
                                  <div className="products-data-row">
                                    <div
                                      className="products-data"
                                      key={key}
                                      style={{ position: "relative" }}
                                    >
                                      {m.material_name} &nbsp;({m.purity}) &nbsp;
                                      {m.weight} &nbsp;{m.unit_name} &nbsp; x
                                      &nbsp; {m.rate}{" "}
                                    </div>

                                    <div className="products-amount">
                                      {" "}
                                      = &nbsp; &nbsp;{m.amount}
                                    </div>
                                  </div>
                                </div>
                              ) : null,
                            )}
                          </TableCell>

                          <TableCell>
                            {item.materials.map((m, key) =>
                              parseFloat(m.weight || 0) > 0 ||
                              parseFloat(m.amount || 0) > 0 ? (
                              <div className="sale-discount-wrapper" key={key}>
                                <>
                                  {m.max_discount_percent > 0 &&
                                  !this.state.isAssign ? (
                                    <>
                                      Dis@{" "}
                                      <div className="sale-discount">
                                        <input
                                          type="text"
                                          value={m.discount_percent}
                                          onChange={(event) =>
                                            this.handleMaterialDisc(
                                              event,

                                              index,

                                              key,
                                            )
                                          }
                                          className="custom_input"
                                          max={m.max_discount_percent}
                                          disabled={isReturn ? "disabled" : ""}
                                        />

                                        <div className="sale-discount-inner">
                                          {" "}
                                          %
                                        </div>
                                      </div>{" "}
                                      {m.mrp}
                                    </>
                                  ) : (
                                    " - "
                                  )}
                                </>
                              </div>
                              ) : null,
                            )}
                          </TableCell>

                          <TableCell>
                            {item.materials.map((m, key) =>
                              parseFloat(m.weight || 0) > 0 ||
                              parseFloat(m.amount || 0) > 0 ? (
                                <p key={key}>
                                  {priceFormat(m.amount - m.discount_amount)}
                                </p>
                              ) : null,
                            )}
                          </TableCell>

                          <TableCell>
                            {item.making_charge}

                            {item.max_making_charge_discount_percent > 0 &&
                            !this.state.isAssign ? (
                              <>
                                @{" "}
                                <span style={{ position: "relative" }}>
                                  <input
                                    type="text"
                                    value={item.making_charge_discount_percent}
                                    onChange={(event) =>
                                      this.handleMakingDiscount(event, index)
                                    }
                                    className="custom_input"
                                    max={
                                      item.max_making_charge_discount_percent
                                    }
                                    disabled={
                                      isReturn ||
                                      item.making_charge_discount_type == "rate"
                                        ? "disabled"
                                        : ""
                                    }
                                  />

                                  <span
                                    style={{
                                      position: "absolute",

                                      right: "1px",

                                      top: "0px",
                                    }}
                                  >
                                    {" "}
                                    %
                                  </span>
                                </span>{" "}
                                &nbsp;
                                {priceFormat(
                                  item.making_charge -
                                    item.making_charge_discount_amount,
                                )}
                              </>
                            ) : null}
                          </TableCell>

                          <TableCell>{item.sub_price}</TableCell>

                          <TableCell>{item.total_discount}</TableCell>

                          <TableCell>{item.total_tax}</TableCell>

                          <TableCell>{item.total}</TableCell>

                          {this.state.isCreateFrom ? (
                            <TableCell
                              className="action_column"
                              style={{ textAlign: "center" }}
                            >
                              {/*<IconButton className='del-icon' color="error" component="label"  onClick={() => this.handleProductDelete(index)}>

                                                              <CloseIcon />

                                                              </IconButton> */}

                              <Button
                                variant="contained"
                                className="sale-cross-icon"
                                onClick={() => this.handleProductDelete(index)}
                              >
                                {" "}
                                X{" "}
                              </Button>
                            </TableCell>
                          ) : null}
                        </TableRow>

                        {!this.state.isCreateFrom &&
                        item.materials.length == 1 &&
                        this.checkOpen(item.id) ? (
                          <TableRow className="table-inner-row">
                            <TableCell
                              style={{ paddingBottom: 0, paddingTop: 0 }}
                              colSpan={12}
                            >
                              <Collapse
                                in={this.checkOpen(item.id)}
                                timeout="auto"
                                unmountOnExit
                              >
                                <Box sx={{ margin: 1 }}>
                                  <Typography
                                    variant="h6"
                                    gutterBottom
                                    component="div"
                                  ></Typography>

                                  <Table size="medium" aria-label="purchases">
                                    <TableHead>
                                      <TableRow className="pur-details-inner-table">
                                        <TableCell>Quantity</TableCell>

                                        <TableCell>Weight</TableCell>

                                        <TableCell>Unit</TableCell>
                                      </TableRow>
                                    </TableHead>

                                    <TableBody className="pur-details-table-body">
                                      <TableRow>
                                        <TableCell scope="row">
                                          {item.materials[0].return_qty}
                                        </TableCell>

                                        <TableCell>
                                          {" "}
                                          {item.materials[0].return_weight}
                                        </TableCell>

                                        <TableCell>
                                          {item.materials[0].unit_name}
                                        </TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        ) : null}
                      </React.Fragment>
                    );
                  })}

                  {/*{

                                        formValues.products.map((item, index) => (

                                            <TableRow key={index}>

                                                <TableCell>{index + 1}</TableCell>

                                                <TableCell>{item.product_name}</TableCell>

                                                <TableCell>{item.certificate_no}</TableCell>

                                                <TableCell>{item.total_weight} gm</TableCell>

                                                <TableCell>{item.size_name}</TableCell>

                                                <TableCell>

                                                    <Table aria-label="simple table" className='ratn-table-product-wrapper'>

                                                        <TableHead className='ratn-table-header p_view'>

                                                            <TableRow>

                                                                <TableCell>Name</TableCell>

                                                                <TableCell>Weight</TableCell>

                                                                <TableCell>Rate</TableCell>

                                                                <TableCell>Disc</TableCell>

                                                            </TableRow>

                                                        </TableHead>

                                                        <TableBody className='sale-table-inner'>

                                                        {

                                                            item.materials.map((m, key) => (

                                                                <TableRow key={key}>

                                                                    <TableCell>{m.material_name}</TableCell>

                                                                    <TableCell>{m.total_gram} gm</TableCell>

                                                                    <TableCell>{displayAmount(m.rate)}</TableCell>

                                                                    <TableCell>

                                                                        <TextField

                                                                            label=""

                                                                            sx={{maxWidth: '75px'}}

                                                                            variant="outlined"

                                                                            fullWidth

                                                                            value={m.discount_percent}

                                                                            onChange={(event) => this.handleMaterialDisc(event, index, key)}

                                                                        />

                                                                    </TableCell>

                                                                </TableRow>

                                                            ))

                                                        }

                                                        </TableBody>

                                                    </Table>

                                                </TableCell>

                                                <TableCell>{displayAmount(item.sub_price)}</TableCell>

                                                <TableCell>

                                                    <div>

                                                    {displayAmount(item.making_charge)}

                                                    </div>

                                                    <div>

                                                        <TextField

                                                            className='sale-table-inner'

                                                            label=""

                                                            variant="outlined"

                                                            fullWidth

                                                            sx={{maxWidth: '100px'}}

                                                            value={item.making_charge_discount_percent}

                                                            onChange={(event) => this.handleMakingDiscount(event, index)}

                                                            disabled={item.making_charge_discount_type == "rate"}

                                                            InputProps={{

                                                                endAdornment: <InputAdornment position="end">%</InputAdornment>

                                                            }}

                                                        />

                                                    </div>

                                                </TableCell>

                                                <TableCell>{displayAmount(item.making_charge + item.sub_price)}</TableCell>

                                                <TableCell>{displayAmount(item.total_tax)}</TableCell>

                                                <TableCell>{displayAmount(item.total_discount)}</TableCell>

                                                <TableCell>{displayAmount(item.total)}</TableCell>

                                                <TableCell>

                                                    <IconButton className='del-icon' color="error" component="label" onClick={() => this.handleProductDelete(index)}>

                                                        <DeleteIcon />

                                                    </IconButton>

                                                </TableCell>

                                            </TableRow>

                                        ))

                                    }*/}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <div
            class="modal fade"
            id="noteModal"
            tabindex="-1"
            aria-labelledby="exampleModalLabel"
            aria-hidden="true"
          >
            <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content">
                <div class="modal-header">
                  <h1 class="modal-title fs-5" id="exampleModalLabel">
                    sales Notes
                  </h1>

                  <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>

                <div class="modal-body">
                  {/* <Grid

                    item

                    xs={12}

                    md={6}

                    className="create-input"

                    style={{ paddingTop: "0px" }}

                  >

                    <TextareaAutosize

                      className="description"

                      minRows={1}

                      placeholder="Notes datra"

                      style={{ width: "80%" }}



                    />

                  </Grid> */}

                  <textarea
                    class="form-control"
                    placeholder="Leave a comment here"
                    id="floatingTextarea2"
                    style={{ height: "100px" }}
                    value={formValues.notes}
                    onChange={(event) =>
                      this.handleDefaultChange(event, "notes")
                    }
                  ></textarea>

                  {/* <label for="floatingTextarea2">Comments</label> */}
                </div>
              </div>
            </div>
          </div>

          {report_charge &&
            formValues.report_qty > 0 &&
            !this.state.isAssign && (
              <Grid
                item
                xs={12}
                md={12}
                className="materialContainerGrid create-input p-add-product border-radius-0"
              >
                <TableContainer component={Paper}>
                  <Table
                    sx={{ minWidth: 650 }}
                    aria-label="simple table"
                    className="ratn-table-product-wrapper sale_form_table"
                  >
                    <TableHead className="product_details p_view">
                      <TableRow>
                        {!this.state.isCreateFrom ? (
                          <TableCell sx={{ width: "30px" }}></TableCell>
                        ) : null}

                        <TableCell sx={{ width: 15 }}></TableCell>

                        {/* <TableCell sx={{ width: 80 }}>Sub Total</TableCell> */}

                        <TableCell sx={{ width: 130 }}>Report Charge</TableCell>

                        <TableCell sx={{ width: 40 }}>Total Charge</TableCell>

                        <TableCell sx={{ width: 90 }}>Tax(%)</TableCell>

                        <TableCell sx={{ width: 40 }}>Total Tax</TableCell>

                        <TableCell sx={{ width: 40 }}>Total Charge</TableCell>

                        {/* <TableCell sx={{ width: 40 }}>Total</TableCell> */}
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      <TableRow className="">
                        <TableCell className=" "></TableCell>

                        {/* <TableCell >

                        {`${parseFloat(formValues.total_tag_price - formValues.total_report_charge_amount_after_tax).toFixed(2)}`}

                      </TableCell> */}

                        <TableCell
                          style={{
                            display: "flex",
                            gap: "5px",
                            alignItems: "center",
                          }}
                        >
                          <span>{`${formValues.report_qty} pics x `}</span>

                          <div className="sale-discount">
                            {" "}
                            {/* ${priceFormat(report_charge.amount).toFixed(2)} =  */}
                            <input
                              type="text"
                              value={formValues.report_charge_amount}
                              disabled={isReturn ? true : false}
                              onChange={(event) =>
                                this.handleDefaultChange(
                                  event,
                                  "report_charge_amount",
                                )
                              }
                              className="custom_input"
                            />
                            {/* <div className='sale-discount-inner'>

                              {" "}

                              %

                            </div> */}
                          </div>

                          <span>{` = `}</span>
                        </TableCell>

                        <TableCell className=" align-items-center">
                          {priceFormat(
                            formValues.total_report_charge_amount,
                          ).toFixed(2)}
                        </TableCell>

                        <TableCell className=" align-items-center">
                          {`${priceFormat(report_charge.tax).toFixed(2)}%`}
                        </TableCell>

                        <TableCell className=" align-items-center">
                          {priceFormat(
                            formValues.total_report_charge_tax_amount,
                          ).toFixed(2)}
                        </TableCell>

                        <TableCell className=" align-items-center">
                          {priceFormat(
                            formValues.total_report_charge_amount_after_tax,
                          ).toFixed(2)}
                        </TableCell>

                        {/* <TableCell className=" align-items-center">

                        {priceFormat(formValues.total_tag_price).toFixed(2)}

                      </TableCell> */}
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            )}

          <Grid
            item
            xs={12}
            md={12}
            className="materialContainerGrid create-input p-add-product border-radius-0"
          >
            {!this.state.isAssign ? (
              <Paper elevation={0} className="sale-summary-bar">
                <div className="sale-summary-discounts">
                  {this.state.unique_materials.map((item, index) => (
                    <div className="sale-summary-field" key={index}>
                      <label>
                        {item.material_name} (
                        {item.unit.toLowerCase() != "gm"
                          ? item["total_" + item.material_id].toFixed(2)
                          : item["total_" + item.material_id].toFixed(3)}{" "}
                        {item.unit})
                      </label>

                      <div className="sale-summary-control">
                        <input
                          type="text"
                          value={item.amount}
                          placeholder="0"
                          max={item.max_discount}
                          onChange={(event) =>
                            this.handleCommonDis(event, index)
                          }
                        />

                        <select
                          onChange={(event) =>
                            this.handleDiscountType(event, index)
                          }
                        >
                          <option value="discount">Disc %</option>

                          <option value="rate">Flat ₹</option>
                        </select>
                      </div>
                    </div>
                  ))}

                  {this.haveMakingComonDis() ? (
                    <div className="sale-summary-field">
                      <label>
                        Making Disc (
                        {this.getMakingApplicableWeight().toFixed(3)} gm |{" "}
                        {this.getMakingApplicableQuantity()} pcs)
                      </label>

                      <div className="sale-summary-control">
                        <input
                          type="text"
                          value={this.state.common_making_discount}
                          placeholder="0"
                          disabled={isReturn ? true : false}
                          onChange={(event) =>
                            this.handleCommonMakingDis(event)
                          }
                        />

                        <select
                          value={this.state.common_making_discount_type}
                          disabled={isReturn ? true : false}
                          onChange={(event) =>
                            this.handleCommonMakingDisType(event)
                          }
                        >
                          <option value="discount">Disc %</option>

                          <option value="rate">Flat ₹</option>
                        </select>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="sale-summary-stats">
                  <div className="sale-summary-stat">
                    <span>Price</span>

                    <b>{priceFormat(formValues.total_tag_price)}</b>
                  </div>

                  <div className="sale-summary-stat">
                    <span>Dist</span>

                    <b>{priceFormat(formValues.product_discount)}</b>
                  </div>

                  <div className="sale-summary-stat">
                    <span>Tax</span>

                    <b>{priceFormat(formValues.total_tax)}</b>
                  </div>

                  <div className="sale-summary-stat is-total">
                    <span>Total</span>

                    <b>{formValues.total_amount}</b>
                  </div>
                </div>

                <div className="sticky-note sale-summary-note">
                  <i
                    className="bi bi-pencil-square fs-4"
                    data-bs-toggle="modal"
                    data-bs-target="#noteModal"
                  ></i>
                </div>
              </Paper>
            ) : null}
          </Grid>

          <Grid item xs={12} md={8} style={{}}>
            <Grid
              container
              spacing={2}
              className="mob_responsive_purchase_input"
            >
              <ul className="sale_total">
                <li>
                  Price <span>{priceFormat(formValues.total_tag_price)}</span>
                </li>

                <li>
                  Dist <span>{priceFormat(formValues.product_discount)}</span>
                </li>

                <li>
                  Tax <span>{displayAmount(formValues.total_tax)}</span>
                </li>

                <li>
                  T.Amount <span>{displayAmount(formValues.total_amount)}</span>
                </li>
              </ul>
            </Grid>
          </Grid>

          {!this.state.formValues.user_id ? (
            <Grid item xs={12} md={8} style={{}}>
              <Grid
                container
                spacing={2}
                columnSpacing={{ xs: 1, sm: 2, md: 2 }}
                className="mob_responsive_purchase_input"
              >
                {(this.isSalesExecutive ||
                  this.isDistributor ||
                  this.isSuperAdmin ||
                  this.isAdmin) &&
                !this.state.isAssign &&
                !formValues.user_id &&
                this.state.isCreateFrom &&
                isEmpty(this.props.query.get("sale_on_approval")) ? (
                  <Grid
                    item
                    xs={12}
                    className="create-input button-right  "
                    style={{ paddingTop: "0px", paddingBottom: "7px" }}
                  >
                    <Button
                      variant="contained"
                      size="small"
                      className="d-flex m-auto"
                      onClick={this.handleTransfer}
                    >
                      Transfer
                    </Button>
                  </Grid>
                ) : null}

                {/* <Grid item xs={12} md={12} className='create-input' style={{ paddingTop: '0px' }}>

                                <TextareaAutosize

                                    className='description'

                                    minRows={3}

                                    placeholder="Notes"

                                    style={{ width: '100%' }}

                                    value={formValues.notes}

                                    onChange={(event) => this.handleDefaultChange(event, 'notes')}

                                />

                            </Grid> */}

                {this.props.query.get("all_added") == 0 ? (
                  <Grid item xs={12} md={12} className="create-input">
                    <Alert variant="filled" severity="error">
                      You doesn't have enough stock.
                    </Alert>
                  </Grid>
                ) : null}

                {(this.isSalesExecutive || this.isDistributor) &&
                this.state.isAssign ? (
                  <>
                    {formValues.image_file ? (
                      <Grid
                        item
                        xs={12}
                        md={2}
                        className="create-input"
                        style={{ position: "relative" }}
                      >
                        <DeleteIcon
                          onClick={this.deleteImage}
                          className="image_delete"
                          style={{
                            position: "absolute",

                            right: 0,

                            color: "#ff0000",

                            cursor: "pointer",
                          }}
                        />

                        <img
                          src={this.getImageSrc(formValues.image_file)}
                          id="logo-img"
                          style={{ height: "100px", width: "100px" }}
                        />
                      </Grid>
                    ) : (
                      <Grid item xs={12} md={2} className="create-input">
                        <img
                          src={noImage}
                          id="logo-img1"
                          style={{ height: "100px", width: "100px" }}
                        />
                      </Grid>
                    )}

                    <Grid item xs={12} md={4} className="create-input">
                      <Button
                        variant="contained"
                        className="image-button"
                        component="label"
                        endIcon={<CloudUploadIcon />}
                      >
                        Image
                        <input
                          name="main_image"
                          hidden
                          accept="image/*"
                          type="file"
                          onChange={(e) => this.onChangeImage(e)}
                          ref={this.imageFileRef}
                        />
                      </Button>
                    </Grid>
                  </>
                ) : null}
              </Grid>
            </Grid>
          ) : null}

          {!this.state.isAssign && formValues.user_id ? (
            <Grid
              item
              xs={12}
              md={4}
              style={{ paddingRight: "16px", paddingTop: "8px" }}
            >
              <Grid
                container
                spacing={2}
                columnSpacing={{ xs: 1, sm: 2, md: 2 }}
                className="mob_responsive_purchase_input_table"
              >
                {/*<Grid item xs={12}>

                                    <TextField

                                        label="Taxable Amount"

                                        variant="outlined"

                                        fullWidth

                                        value={formValues.taxable_amount}

                                        disabled

                                        InputProps={{

                                            startAdornment: <InputAdornment position="start">₹</InputAdornment>

                                        }}

                                    />

                                </Grid>*/}

                {!isReturn ? (
                  <>
                    <Grid item xs={12} className="pt-5">
                      <Grid
                        container
                        spacing={2}
                        columnSpacing={{ xs: 1, sm: 2, md: 2 }}
                        className="display_center justify-content-end"
                      >
                        <Grid item xs={4} md={6} className="text-right pt-0">
                          <span className="tax-text"> Sub Total </span>
                        </Grid>

                        <Grid item xs={5} md={6} className="pt-0">
                          <TextField
                            className="ft-amount"
                            fullWidth
                            value={priceFormat(
                              formValues.taxable_amount,
                            ).toFixed(2)}
                            disabled
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  ₹
                                </InputAdornment>
                              ),

                              className: "non_disable_text",
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>

                    {formValues.cgst_tax > 0 ? (
                      <Grid item xs={12} md={12} className="pt-5">
                        <Grid
                          container
                          columnSpacing={{ xs: 1, sm: 2, md: 2 }}
                          spacing={2}
                          className="display_center justify-content-end"
                        >
                          <Grid item xs={4} md={6} className="text-right pt-0">
                            <span className="tax-text">CGST Amount</span>
                          </Grid>

                          <Grid item xs={5} md={6} className="pt-0">
                            <TextField
                              label="CGST"
                              variant="outlined"
                              fullWidth
                              value={formValues.cgst_tax}
                              disabled
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    ₹
                                  </InputAdornment>
                                ),

                                className: "non_disable_text",
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                    ) : null}

                    {formValues.sgst_tax > 0 ? (
                      <Grid item xs={12} md={12} className="pt-5">
                        <Grid
                          container
                          spacing={2}
                          columnSpacing={{ xs: 1, sm: 2, md: 2 }}
                          className="display_center justify-content-end"
                        >
                          <Grid item xs={4} md={6} className="text-right pt-0">
                            <span className="tax-text">SGST Amount</span>
                          </Grid>

                          <Grid item xs={5} md={6} className="pt-0">
                            <TextField
                              fullWidth
                              value={formValues.sgst_tax}
                              disabled
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    ₹
                                  </InputAdornment>
                                ),

                                className: "non_disable_text",
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                    ) : null}

                    {formValues.igst_tax > 0 ? (
                      <Grid item xs={12} style={{ paddingTop: "0" }}>
                        <Grid
                          container
                          spacing={2}
                          columnSpacing={{ xs: 1, sm: 2, md: 2 }}
                          className="display_center justify-content-end"
                        >
                          <Grid item xs={4} md={6} className="text-right pt-0">
                            <span className="tax-text">IGST Amount</span>
                          </Grid>

                          <Grid item xs={5} md={6} className="pt-0">
                            <TextField
                              className="ft-amount"
                              fullWidth
                              value={formValues.igst_tax}
                              disabled
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    ₹
                                  </InputAdornment>
                                ),

                                className: "non_disable_text",
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                    ) : null}

                    <Grid item xs={12} className="pt-5">
                      <Grid
                        container
                        spacing={2}
                        columnSpacing={{ xs: 1, sm: 2, md: 2 }}
                        className="display_center justify-content-end"
                      >
                        <Grid item xs={4} md={6} className="text-right pt-0">
                          <span className="tax-text">Total Amount</span>
                        </Grid>

                        <Grid item xs={5} md={6} className="pt-0">
                          <TextField
                            className="ft-amount"
                            fullWidth
                            value={formValues.total_amount}
                            disabled
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  ₹
                                </InputAdornment>
                              ),

                              className: "non_disable_text",
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>

                    {!isEmpty(this.props.query.get("sale_on_approval")) && (
                      <Grid item xs={12} className="pt-5">
                        <Grid
                          container
                          spacing={2}
                          columnSpacing={{ xs: 1, sm: 2, md: 2 }}
                          className="display_center justify-content-end"
                        >
                          <Grid item xs={4} md={6} className="text-right pt-0">
                            <span className="tax-text">
                              Already Paid Amount
                            </span>
                          </Grid>

                          <Grid item xs={5} md={6} className="pt-0">
                            <TextField
                              className="ft-amount"
                              fullWidth
                              value={formValues.already_paid_amount}
                              disabled
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    ₹
                                  </InputAdornment>
                                ),

                                className: "non_disable_text",
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                    )}

                    <Grid item xs={12} className="pt-5">
                      <Grid
                        container
                        spacing={2}
                        columnSpacing={{ xs: 1, sm: 2, md: 2 }}
                        className="display_center justify-content-end"
                      >
                        <Grid item xs={4} md={6} className="text-right pt-0">
                          <span className="tax-text"> Cash Discount </span>
                        </Grid>

                        <Grid item xs={5} md={6} className="pt-0">
                          <TextField
                            className="ft-amount"
                            fullWidth
                            value={formValues.discount}
                            onChange={(event) =>
                              this.handleDefaultChange(event, "discount")
                            }
                            onInput={(e) => validateNumber(e)}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  ₹
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>

                    {formValues.advance_amount > 0 ? (
                      <Grid item xs={12} className="pt-5">
                        <Grid
                          container
                          spacing={2}
                          columnSpacing={{ xs: 1, sm: 2, md: 2 }}
                          className="display_center justify-content-end"
                        >
                          <Grid item xs={4} md={6} className="text-right pt-0">
                            <span className="tax-text"> Advance Amount </span>
                          </Grid>

                          <Grid item xs={5} md={6} className="pt-0">
                            <TextField
                              className="ft-amount"
                              fullWidth
                              value={formValues.advance_amount}
                              onInput={(e) => validateNumber(e)}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    ₹
                                  </InputAdornment>
                                ),

                                className: "non_disable_text",

                                endAdornment: (
                                  <Checkbox
                                    checked={formValues.pay_from_advance}
                                    onChange={this.handleAdvance}
                                  />
                                ),

                                disabled: true,
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                    ) : null}

                    <Grid item xs={12} className="pt-5">
                      <Grid
                        container
                        spacing={2}
                        columnSpacing={{ xs: 1, sm: 2, md: 2 }}
                        className="display_center justify-content-end"
                      >
                        <Grid item xs={4} md={6} className="text-right pt-0">
                          <span className="tax-text">Total Payable</span>
                        </Grid>

                        <Grid item xs={5} md={6} className="pt-0">
                          <TextField
                            className="ft-amount"
                            fullWidth
                            value={formValues.total_payable}
                            disabled
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  ₹
                                </InputAdornment>
                              ),

                              className: "non_disable_text",
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  </>
                ) : (
                  <>
                    <Grid item xs={12} md={12} className="pt-5">
                      <Grid
                        container
                        spacing={2}
                        className="display_center justify-content-end"
                      >
                        <Grid item xs={4} md={6} className="text-right pt-0">
                          Return Product Amt
                        </Grid>

                        <Grid item xs={5} md={6} className="pt-0">
                          <TextField
                            className="ft-amount"
                            fullWidth
                            value={
                              this.state.product_amount_without_report_charge
                            }
                            disabled
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  ₹
                                </InputAdornment>
                              ),

                              className: "non_disable_text",
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>

                    {formValues.due_amount == 0 &&
                    this.state.return_discount > 0 ? (
                      <Grid item xs={12} md={12} className="pt-5">
                        <Grid
                          container
                          spacing={2}
                          className="display_center justify-content-end"
                        >
                          <Grid item xs={4} md={6} className="text-right pt-0">
                            Discount
                          </Grid>

                          <Grid item xs={5} md={6} className="pt-0">
                            <TextField
                              className="ft-amount"
                              fullWidth
                              value={this.state.return_discount}
                              disabled
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    ₹
                                  </InputAdornment>
                                ),

                                className: "non_disable_text",
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                    ) : null}

                    {formValues.due_amount == 0 &&
                    formValues.have_return_charge ? (
                      <Grid item xs={12} md={12} className="pt-5">
                        <Grid
                          container
                          spacing={2}
                          className="display_center justify-content-end"
                        >
                          <Grid item xs={4} md={6} className="text-right pt-0">
                            Return Charge
                          </Grid>

                          <Grid item xs={5} md={6} className="pt-0">
                            <TextField
                              className="ft-amount"
                              fullWidth
                              value={this.state.return_charge}
                              disabled
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    ₹
                                  </InputAdornment>
                                ),

                                className: "non_disable_text",
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                    ) : null}

                    {this.state.return_report_charge > 0 ? (
                      <Grid item xs={12} md={12} className="pt-5">
                        <Grid
                          container
                          spacing={2}
                          className="display_center justify-content-end"
                        >
                          <Grid item xs={4} md={6} className="text-right pt-0">
                            <b>Report Charge</b>
                          </Grid>

                          <Grid item xs={5} md={6} className="pt-0">
                            <TextField
                              className="ft-amount"
                              fullWidth
                              value={this.state.return_report_charge}
                              disabled
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    ₹
                                  </InputAdornment>
                                ),

                                className: "non_disable_text",
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                    ) : null}

                    {formValues.due_amount == 0 &&
                    this.state.return_tax_charge > 0 ? (
                      <Grid item xs={12} md={12} className="pt-5">
                        <Grid
                          container
                          spacing={2}
                          className="display_center justify-content-end"
                        >
                          <Grid item xs={4} md={6} className="text-right pt-0">
                            <b>Tax Charge</b>
                          </Grid>

                          <Grid item xs={5} md={6} className="pt-0">
                            <TextField
                              className="ft-amount"
                              fullWidth
                              value={this.state.return_tax_charge}
                              disabled
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    ₹
                                  </InputAdornment>
                                ),

                                className: "non_disable_text",
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                    ) : null}

                    {formValues.products.length == 1 ? (
                      <Grid item xs={12} className="pt-5">
                        <Grid
                          container
                          spacing={2}
                          columnSpacing={{ xs: 1, sm: 2, md: 2 }}
                          className="display_center justify-content-end"
                        >
                          <Grid item xs={4} md={6} className="text-right pt-0">
                            <span className="tax-text"> Cash Discount </span>
                          </Grid>

                          <Grid item xs={5} md={6} className="pt-0">
                            <TextField
                              className="ft-amount"
                              fullWidth
                              value={formValues.discount}
                              onInput={(e) => validateNumber(e)}
                              onChange={(event) =>
                                this.handleDefaultChange(event, "discount")
                              }
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    ₹
                                  </InputAdornment>
                                ),
                              }}
                              disabled
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                    ) : null}

                    {formValues.due_amount == 0 &&
                    this.state.return_amount > 0 ? (
                      <Grid item xs={12} md={12} className="pt-5">
                        <Grid
                          container
                          spacing={2}
                          className="display_center justify-content-end"
                        >
                          <Grid item xs={4} md={6} className="text-right pt-0">
                            <b>Return Amount</b>
                          </Grid>

                          <Grid item xs={5} md={6} className="pt-0">
                            <TextField
                              className="ft-amount"
                              fullWidth
                              value={this.state.return_amount}
                              onInput={(e) => validateNumber(e)}
                              onChange={(e) =>
                                this.setState({ return_amount: e.target.value })
                              }
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    ₹
                                  </InputAdornment>
                                ),

                                className: "non_disable_text",
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                    ) : null}
                  </>
                )}

                {!isReturn ? (
                  <Grid item xs={12} className="pt-5">
                    <Grid
                      container
                      spacing={2}
                      columnSpacing={{ xs: 1, sm: 2, md: 2 }}
                      className="display_center justify-content-end"
                    >
                      <Grid item xs={4} md={6} className="text-right pt-0">
                        <span className="tax-text"> Payment Mode </span>
                      </Grid>

                      <Grid item xs={5} md={6} className="pt-0">
                        <FormControl fullWidth className="ft-amount">
                          <Select
                            className="input-inner"
                            value={formValues.payment_mode}
                            fullWidth
                            onChange={(event) =>
                              this.handleDefaultChange(event, "payment_mode")
                            }
                          >
                            <MenuItem value="cash">Cash</MenuItem>

                            <MenuItem value="cheque">Cheque</MenuItem>

                            <MenuItem value="imps_neft">
                              BANKING/RTGS/NEFT
                            </MenuItem>

                            <MenuItem value="online">UPI/PhonePe/Gpay</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Grid>
                ) : null}

                {formValues.payment_mode == "imps_neft" ||
                formValues.payment_mode == "upi" ? (
                  <Grid item xs={12} className="pt-5">
                    <Grid
                      container
                      spacing={2}
                      columnSpacing={{ xs: 1, sm: 2, md: 2 }}
                      className="display_center justify-content-end"
                    >
                      <Grid item xs={4} md={6} className="text-right pt-0">
                        <span className="tax-text"> Transaction No </span>
                      </Grid>

                      <Grid item xs={5} md={6} className="pt-0">
                        <TextField
                          className="ft-amount"
                          fullWidth
                          value={formValues.transaction_no}
                          onChange={(event) =>
                            this.handleDefaultChange(event, "transaction_no")
                          }
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                ) : null}

                {formValues.payment_mode == "cheque" ? (
                  <Grid item xs={12} className="pt-5">
                    <Grid
                      container
                      spacing={2}
                      columnSpacing={{ xs: 1, sm: 2, md: 2 }}
                      className="display_center justify-content-end"
                    >
                      <Grid item xs={4} md={6} className="text-right pt-0">
                        <span className="tax-text"> Cheque No </span>
                      </Grid>

                      <Grid item xs={5} md={6} className="pt-0">
                        <TextField
                          className="ft-amount"
                          fullWidth
                          value={formValues.cheque_no}
                          onChange={(event) =>
                            this.handleDefaultChange(event, "cheque_no")
                          }
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                ) : null}

                {!isReturn ? (
                  <>
                    <Grid item xs={12} className="pt-5">
                      <Grid
                        container
                        spacing={2}
                        columnSpacing={{ xs: 1, sm: 2, md: 2 }}
                        className="display_center justify-content-end"
                      >
                        <Grid item xs={4} md={6} className="text-right pt-0">
                          <span className="tax-text"> Pay Now </span>
                        </Grid>

                        <Grid item xs={5} md={6} className="pt-0">
                          <TextField
                            className="ft-amount"
                            fullWidth
                            value={formValues.paid_amount}
                            onInput={(e) => validateNumber(e)}
                            onChange={(event) =>
                              this.handleDefaultChange(event, "paid_amount")
                            }
                            error={formErros.paid_amount}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  ₹
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item xs={12} className="pt-5">
                      <Grid
                        container
                        spacing={2}
                        columnSpacing={{ xs: 1, sm: 2, md: 2 }}
                        className="display_center justify-content-end"
                      >
                        <Grid item xs={4} md={6} className="text-right pt-0">
                          <span className="tax-text"> Due Amount </span>
                        </Grid>

                        <Grid item xs={5} md={6} className="pt-0">
                          <TextField
                            className="ft-amount"
                            fullWidth
                            value={priceFormat(formValues.due_amount).toFixed(
                              2,
                            )}
                            disabled
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  ₹
                                </InputAdornment>
                              ),

                              className: "non_disable_text",
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>

                    {parseFloat(formValues.due_amount) > 0 ? (
                      <>
                        <Grid
                          item
                          xs={12}
                          className="p-invoice-date create-input pt-5"
                        >
                          <Grid
                            container
                            spacing={2}
                            columnSpacing={{ xs: 1, sm: 2, md: 2 }}
                            className="display_center justify-content-end"
                          >
                            <Grid
                              item
                              xs={4}
                              md={6}
                              className="text-right pt-0"
                            >
                              <span className="tax-text"> Due Date </span>
                            </Grid>

                            <Grid item xs={5} md={6} className="pt-0">
                              <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                  value={formValues.due_date}
                                  fullWidth
                                  className="ft-amount"
                                  inputFormat="DD/MM/YYYY"
                                  onChange={(newValue) =>
                                    this.updateFormValues(newValue, "due_date")
                                  }
                                  renderInput={(params) => (
                                    <TextField
                                      fullWidth
                                      {...params}
                                      error={formErros.due_date}
                                    />
                                  )}
                                />
                              </LocalizationProvider>
                            </Grid>
                          </Grid>
                        </Grid>

                        <Grid
                          item
                          xs={12}
                          className="p-invoice-date create-input pt-5"
                        >
                          <Grid
                            container
                            spacing={2}
                            columnSpacing={{ xs: 1, sm: 2, md: 2 }}
                            className="display_center justify-content-end"
                          >
                            <Grid
                              item
                              xs={4}
                              md={6}
                              className="text-right pt-0"
                            >
                              <span className="tax-text">
                                {" "}
                                Settlement Date{" "}
                              </span>
                            </Grid>

                            <Grid item xs={5} md={6} className="pt-0">
                              <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                  className="ft-amount"
                                  value={formValues.settlement_date}
                                  fullWidth
                                  inputFormat="DD/MM/YYYY"
                                  onChange={(newValue) =>
                                    this.updateFormValues(
                                      newValue,

                                      "settlement_date",
                                    )
                                  }
                                  renderInput={(params) => (
                                    <TextField
                                      fullWidth
                                      {...params}
                                      error={formErros.settlement_date}
                                    />
                                  )}
                                />
                              </LocalizationProvider>
                            </Grid>
                          </Grid>
                        </Grid>
                      </>
                    ) : null}
                  </>
                ) : (
                  <Grid
                    item
                    xs={12}
                    md={12}
                    className="p-invoice-date create-input pt-5"
                  >
                    <Grid
                      container
                      spacing={2}
                      className="display_center justify-content-end"
                    >
                      <Grid item xs={4} md={6} className="text-right pt-0">
                        Return Date
                      </Grid>

                      <Grid item xs={5} md={6} className="pt-0">
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            className="ft-amount"
                            value={this.state.return_date}
                            fullWidth
                            inputFormat="DD/MM/YYYY"
                            onChange={(newValue) =>
                              this.setState({ return_date: newValue })
                            }
                            renderInput={(params) => (
                              <TextField fullWidth {...params} />
                            )}
                          />
                        </LocalizationProvider>
                      </Grid>
                    </Grid>
                  </Grid>
                )}
              </Grid>
            </Grid>
          ) : null}

          {formValues.user_id ? (
            <Grid
              item
              xs={this.state.isAssign ? 12 : 12}
              md={this.state.isAssign ? 4 : 12}
            >
              {!submitting ? (
                <Stack
                  spacing={1}
                  direction="row"
                  className="ratn-footer-buttons"
                  justifyContent="flex-end"
                  style={{ paddingRight: "16px", paddingBottom: "16px" }}
                >
                  {isEmpty(this.props.query.get("sale_on_approval")) &&
                  !this.state.order_id &&
                  !this.state.isAssign &&
                  this.state.isCreateFrom ? (
                    <LoadingButton
                      className="conf-button"
                      variant="contained"
                      type="button"
                      loading={submitting}
                      disabled={submitting}
                      onClick={(e) => {
                        e.target.disabled = true;

                        this.handleSubmit(true, e);
                      }}
                    >
                      On Approval
                    </LoadingButton>
                  ) : null}

                  {this.state.isCreateFrom ? (
                    <LoadingButton
                      className="conf-button"
                      variant="contained"
                      type="button"
                      loading={submitting}
                      disabled={submitting}
                      onClick={(e) => {
                        e.target.disabled = true;

                        this.handleSubmit(false, e);
                      }}
                    >
                      {this.state.isAssign ? "Transfer " : "Sale Now"}
                    </LoadingButton>
                  ) : (
                    <>
                      {this.state.return_products.length ? (
                        <Button
                          variant="outlined"
                          type="button"
                          className="conf-button"
                          onClick={this.handleReturn}
                        >
                          Return
                        </Button>
                      ) : null}
                    </>
                  )}

                  {
                    <Button
                      variant="outlined"
                      className="close-button"
                      onClick={() => this.props.navigate(-1)}
                    >
                      Cancel
                    </Button>
                  }
                </Stack>
              ) : (
                <Stack
                  spacing={1}
                  direction="row"
                  className="ratn-footer-buttons"
                  justifyContent="flex-end"
                  style={{ paddingRight: "16px", paddingBottom: "16px" }}
                >
                  <CircularProgress size="30px" />
                </Stack>
              )}
            </Grid>
          ) : !isEmpty(this.props.query.get("sale_on_approval")) ? (
            <Stack
              spacing={1}
              direction="row"
              className="ratn-footer-buttons"
              justifyContent="flex-end"
              style={{ paddingRight: "16px", paddingBottom: "16px" }}
            >
              <CircularProgress size="30px" />
            </Stack>
          ) : null}
        </Grid>

        <Dialog
          open={this.state.productDialog}
          onClose={this.handleProductDialogClose}
          fullWidth
          maxWidth="lg"
          className="ratn-dialog-wrapper"
        >
          <DialogTitle>Add Product</DialogTitle>

          <DialogContent>
            <DialogContentText></DialogContentText>

            <Box sx={{ flexGrow: 1, m: 0.5 }}>
              <Grid
                container
                spacing={2}
                columnSpacing={{ xs: 1, sm: 2, md: 2 }}
              >
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth error={productFormErros.category_id}>
                    <InputLabel>Category</InputLabel>

                    <Select
                      value={productFormValues.category_id}
                      label="Category"
                      onChange={this.handleCategoryChange}
                      defaultValue=""
                    >
                      <MenuItem value=""></MenuItem>

                      {this.state.categoryList.map((item, index) => (
                        <MenuItem value={item.id} key={index}>
                          {item.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={3}>
                  <FormControl
                    fullWidth
                    error={productFormErros.sub_category_id}
                  >
                    <InputLabel>Sub Category</InputLabel>

                    <Select
                      value={productFormValues.sub_category_id}
                      label="Sub Category"
                      onChange={this.handleSubCategoryChange}
                      defaultValue=""
                    >
                      <MenuItem value=""></MenuItem>

                      {this.state.subCategoryList.map((item, index) => (
                        <MenuItem value={item.id} key={index}>
                          {item.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={productFormErros.product_id}>
                    <InputLabel>Product</InputLabel>

                    <Select
                      value={productFormValues.product_id}
                      label="Product"
                      onChange={this.handleProductChange}
                      defaultValue=""
                    >
                      <MenuItem value=""></MenuItem>

                      {this.state.stockProductList.map((item, index) => (
                        <MenuItem value={item.id} key={index}>
                          {item.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {productFormValues.product_type != "material" ? (
                  <>
                    {/*<Grid item xs={12} md={3}>

                                            <TextField

                                                label="Certificate Number"

                                                variant="outlined"

                                                fullWidth

                                                value={productFormValues.certificate_no}

                                                onChange={(event) => this.handleProductFormDefaultChange(event, 'certificate_no')}

                                                error={productFormErros.certificate_no}

                                            />

                                        </Grid>

                                        <Grid item xs={12} md={3}>

                                            <FormControl fullWidth error={productFormErros.size_id}>

                                                <InputLabel>Size</InputLabel>

                                                <Select

                                                    value={productFormValues.size_id}

                                                    label="Size"

                                                    onChange={this.handleSizeChange}

                                                    defaultValue=""

                                                >

                                                    <MenuItem value=""></MenuItem>

                                                    {

                                                        this.state.sizeList.map((item, index) => (

                                                            <MenuItem value={item.id} key={index}>{item.name}</MenuItem>

                                                        ))

                                                    }

                                                </Select>

                                            </FormControl>

                                                </Grid>*/}
                  </>
                ) : null}

                {this.state.stockProductDetails.length &&
                productFormValues.product_id ? (
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <RadioGroup
                        name="stock_id"
                        value={productFormValues.stock_id}
                        onChange={this.handleProductFormStockChange}
                      >
                        {!this.checkIfAllStockAdded() ? (
                          <TableContainer component={Paper}>
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Size Name</TableCell>

                                  <TableCell>Material Name</TableCell>

                                  <TableCell>Purity</TableCell>

                                  <TableCell>Weight</TableCell>

                                  <TableCell>Unit</TableCell>

                                  <TableCell>Quantity</TableCell>
                                </TableRow>
                              </TableHead>

                              <TableBody>
                                {this.state.stockProductDetails.map(
                                  (itm, i) => {
                                    return !this.checkIfStockAdded(
                                      itm.stock_id,
                                    ) ? (
                                      <React.Fragment key={i}>
                                        <TableRow>
                                          <TableCell
                                            rowSpan={itm.materials.length + 1}
                                          >
                                            <FormControlLabel
                                              value={itm.stock_id}
                                              control={<Radio />}
                                            />{" "}
                                            {itm.size_name}
                                          </TableCell>
                                        </TableRow>

                                        {itm.materials.map((x, indx) => (
                                          <React.Fragment key={indx}>
                                            <TableRow>
                                              <TableCell>
                                                {x.material_name}
                                              </TableCell>

                                              <TableCell>{x.purity}</TableCell>

                                              <TableCell>
                                                {weightFormat(x.weight, true)}
                                              </TableCell>

                                              <TableCell>
                                                {x.unit_name}
                                              </TableCell>

                                              <TableCell>
                                                {x.quantity}
                                              </TableCell>
                                            </TableRow>
                                          </React.Fragment>
                                        ))}
                                      </React.Fragment>
                                    ) : null;
                                  },
                                )}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        ) : null}
                      </RadioGroup>
                    </FormControl>

                    <FormControl fullWidth>
                      {/*<ToggleButtonGroup

                                                className='product-button'

                                                color="primary"

                                                value={productFormValues.stock_id}

                                                exclusive

                                                onChange={this.handleProductFormStockChange}

                                                aria-label="Stock"

                                            >

                                                {

                                                    this.state.stockProductDetails.map((itm, i) => {

                                                        return !this.checkIfStockAdded(itm.stock_id) ?

                                                        <ToggleButton value={convertToString(itm.stock_id)} key={i}>

                                                            {

                                                                itm.size_name ?

                                                                <>

                                                                {itm.size_name}<br />

                                                                </>

                                                                : null

                                                            }

                                                            {

                                                                itm.materials.map((x, indx) => (

                                                                    <React.Fragment key={indx}>

                                                                        {x.material_name} | {priceFormat(x.weight, true)}{x.unit_name} | {x.quantity}

                                                                        {

                                                                            (itm.materials.length - 1) > indx ?

                                                                            <br />

                                                                            : null

                                                                        }

                                                                    </React.Fragment>

                                                                ))

                                                            }

                                                        </ToggleButton>

                                                        :

                                                        null



                                                    })

                                                }

                                            </ToggleButtonGroup>*/}

                      {this.checkIfAllStockAdded() ? (
                        <h3>No Stock available</h3>
                      ) : null}
                    </FormControl>
                  </Grid>
                ) : null}

                {productFormValues.product_type == "material" ? (
                  <Grid item xs={12}>
                    <TableContainer component={Paper}>
                      <Table
                        sx={{ minWidth: 650 }}
                        aria-label="simple table"
                        className="ratn-table-product-wrapper"
                      >
                        <TableHead className="ratn-table-header">
                          <TableRow className="pur-details-inner-table">
                            <TableCell>Material Name</TableCell>

                            <TableCell>Purity</TableCell>

                            <TableCell>Quantity</TableCell>

                            <TableCell>Weight</TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody className="pur-details-table-body">
                          {productFormValues.materials.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.material_name}</TableCell>

                              <TableCell>{item.purity}</TableCell>

                              <TableCell>
                                <TextField
                                  label="Quantity"
                                  variant="outlined"
                                  fullWidth
                                  onInput={(e) => validateInteger(e)}
                                  value={item.quantity}
                                  onChange={(event) =>
                                    this.handleMaterialFormChange(
                                      event,

                                      index,

                                      "quantity",
                                    )
                                  }
                                  error={materialFormErros[index].quantity}
                                />
                              </TableCell>

                              <TableCell>
                                <TextField
                                  label="Weight"
                                  variant="outlined"
                                  fullWidth
                                  onInput={(e) => validateNumber(e)}
                                  value={item.weight}
                                  onChange={(event) =>
                                    this.handleMaterialFormChange(
                                      event,

                                      index,

                                      "weight",
                                    )
                                  }
                                  InputProps={{
                                    endAdornment: (
                                      <InputAdornment position="start">
                                        {item.unit_name}
                                      </InputAdornment>
                                    ),
                                  }}
                                  error={materialFormErros[index].weight}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                ) : null}

                {/*<Grid item xs={12}>

                                    <TableContainer component={Paper}>

                                        <Table sx={{ minWidth: 650 }} aria-label="simple table">

                                            <TableHead>

                                                <TableRow>

                                                    <TableCell>Material Name</TableCell>

                                                    <TableCell>Purities</TableCell>

                                                    <TableCell>Quantity</TableCell>

                                                    <TableCell>Weight</TableCell>

                                                </TableRow>

                                            </TableHead>

                                            <TableBody>

                                                {

                                                    productFormValues.materials.map((item, index) => (

                                                        <TableRow key={index}>

                                                            <TableCell>{item.material_name}</TableCell>

                                                            <TableCell>{item.purities}</TableCell>

                                                            <TableCell>

                                                                <TextField

                                                                    label="Quantity"

                                                                    variant="outlined"

                                                                    fullWidth

                                                                    value={item.quantity}

                                                                    onChange={(event) => this.handleMaterialFormChange(event, index, 'quantity')}

                                                                    error={materialFormErros[index].quantity}

                                                                />

                                                            </TableCell>

                                                            <TableCell>

                                                                <TextField

                                                                    label="Weight"

                                                                    variant="outlined"

                                                                    fullWidth

                                                                    value={item.weight}

                                                                    onChange={(event) => this.handleMaterialFormChange(event, index, 'weight')}

                                                                    InputProps={{

                                                                        endAdornment: <InputAdornment position="start">{item.unit_name}</InputAdornment>,

                                                                    }}

                                                                    error={materialFormErros[index].weight}

                                                                />

                                                            </TableCell>

                                                        </TableRow>

                                                    ))

                                                }

                                            </TableBody>

                                        </Table>

                                    </TableContainer>

                                </Grid>*/}

                {/*<Grid item xs={12} md={2}>

                                    <TextField

                                        label="TOT.WT(IN GRAM)"

                                        variant="outlined"

                                        fullWidth

                                        value={productFormValues.total_weight}

                                        disabled

                                    />

                                </Grid>

                                <Grid item xs={12} md={2}>

                                    <TextField

                                        label="SUB PRICE"

                                        variant="outlined"

                                        fullWidth

                                        value={productFormValues.sub_price}

                                        disabled

                                    />

                                </Grid>

                                <Grid item xs={12} md={2}>

                                    <TextField

                                        label="MAKING CHARGE"

                                        variant="outlined"

                                        fullWidth

                                        value={productFormValues.making_charge}

                                        onChange={(event) => this.updateProductMakingCharge(event)}

                                    />

                                </Grid>

                                <Grid item xs={12} md={2}>

                                    <TextField

                                        label="REP/TRANS/ETC"

                                        variant="outlined"

                                        fullWidth

                                        value={productFormValues.rep}

                                        onChange={(event) => this.updateProductFormValues(event.target.value, 'rep')}

                                    />

                                </Grid>

                                <Grid item xs={12} md={2}>

                                    <TextField

                                        label="TAX"

                                        variant="outlined"

                                        fullWidth

                                        value={productFormValues.cgst_tax}

                                        disabled

                                    />

                                </Grid>

                                <Grid item xs={12} md={2}>

                                    <TextField

                                        label="TAX"

                                        variant="outlined"

                                        fullWidth

                                        value={productFormValues.sgst_tax}

                                        disabled

                                    />

                                </Grid>

                                <Grid item xs={12} md={2}>

                                    <TextField

                                        label="TAX"

                                        variant="outlined"

                                        fullWidth

                                        value={productFormValues.igst_tax}

                                        disabled

                                    />

                                </Grid>

                                <Grid item xs={12} md={2}>

                                    <TextField

                                        label="TOTAL"

                                        variant="outlined"

                                        fullWidth

                                        value={productFormValues.total}

                                        disabled

                                    />

                                </Grid>*/}

                <Grid item xs={12}>
                  <Stack spacing={1} direction="row" justifyContent="flex-end">
                    <Button
                      variant="contained"
                      type="button"
                      onClick={this.handleProductSubmit}
                    >
                      Add Product
                    </Button>

                    <Button
                      variant="outlined"
                      onClick={this.handleProductDialogClose}
                    >
                      Cancel
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
        </Dialog>

        <Dialog
          open={this.state.payNowForReturnDialogOpen}
          onClose={this.handlePayNowForReturnDialogClose}
          fullWidth
          maxWidth="xs"
          className="ratn-dialog-wrapper"
        >
          <DialogTitle>Pay the amount!</DialogTitle>

          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              {`Total return charge is : ${total_charge_for_return} and customer paid : ${formValues.paid_amount}, so customer need to pay : ${priceFormat(total_charge_for_return - formValues.paid_amount).toFixed(2)} to initiate return process. Please goto paynow section to collect the amount from customer.`}
            </DialogContentText>
          </DialogContent>

          <DialogActions>
            <Stack spacing={2} direction="row" justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={this.handlePayNowForReturnDialogClose}
              >
                Ok
              </Button>
            </Stack>
          </DialogActions>
        </Dialog>

        <Dialog
          open={this.state.returnChargeApplyDialogOpen}
          onClose={this.handleReturnChargeApplyDialogOpen}
          fullWidth
          maxWidth="xs"
          className="ratn-dialog-wrapper"
        >
          <DialogTitle>Payable amount!</DialogTitle>

          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              {`Total payable amount will be : ${this.state.return_amount}. Will receive within 7 working days as per company policy.`}
            </DialogContentText>
          </DialogContent>

          <DialogActions>
            {!submitting ? (
              <Stack spacing={2} direction="row" justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={this.handleReturnChargeApplyDialogOpen}
                >
                  Cancel
                </Button>

                <Button
                  variant="contained"
                  type="button"
                  onClick={this.handleReturnConfirm}
                >
                  Yes, Confirm
                </Button>
              </Stack>
            ) : (
              <Stack spacing={2} direction="row" justifyContent="flex-end">
                <CircularProgress size="30px" />
              </Stack>
            )}
          </DialogActions>
        </Dialog>

        <Dialog
          open={this.state.deleteDialogOpen}
          onClose={this.handleDialogClose}
          fullWidth
          maxWidth="xs"
          className="ratn-dialog-wrapper"
        >
          <DialogTitle>Delete</DialogTitle>

          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              Are you sure want to delete this record?
            </DialogContentText>
          </DialogContent>

          <DialogActions>
            <Stack spacing={2} direction="row" justifyContent="flex-end">
              <Button variant="outlined" onClick={this.handleDialogClose}>
                Cancel
              </Button>

              <Button
                variant="contained"
                type="button"
                onClick={this.handleDeleteConfirm}
              >
                Yes, Confirm
              </Button>
            </Stack>
          </DialogActions>
        </Dialog>

        <Dialog
          open={this.state.returnDialogOpen}
          onClose={this.returnDialogClose}
          fullWidth
          maxWidth="xs"
          className="ratn-dialog-wrapper"
        >
          <DialogTitle>Return</DialogTitle>

          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              Are you sure want to return these product(s)?
            </DialogContentText>

            {return_from_wallet > 0 ? (
              <>
                <FormControl>
                  <RadioGroup
                    row
                    name="row-radio-buttons-group"
                    value={this.state.payment_type}
                    onChange={(e) =>
                      this.setState({ payment_type: e.target.value })
                    }
                  >
                    {!will_return_charge_apply ? (
                      <FormControlLabel
                        value="advance"
                        control={<Radio />}
                        label={
                          "Payment move to advance " +
                          displayAmount(return_from_wallet)
                        }
                      />
                    ) : null}

                    <FormControlLabel
                      value="return"
                      control={<Radio />}
                      label={
                        "Payment Return " + displayAmount(return_from_wallet)
                      }
                    />
                  </RadioGroup>
                </FormControl>

                {this.state.payment_type == "return" &&
                !will_return_charge_apply ? (
                  <FormControl fullWidth>
                    <InputLabel>Payment Mode</InputLabel>

                    <Select
                      className="input-inner"
                      value={this.state.return_payment_mode}
                      fullWidth
                      label="Payment Mode"
                      onChange={(e) =>
                        this.setState({ return_payment_mode: e.target.value })
                      }
                    >
                      <MenuItem value="cash">Cash</MenuItem>

                      <MenuItem value="cheque">Cheque</MenuItem>

                      <MenuItem value="imps_neft">BANKING/RTGS/NEFT</MenuItem>

                      <MenuItem value="online">UPI/PhonePe/Gpay</MenuItem>
                    </Select>
                  </FormControl>
                ) : null}
              </>
            ) : null}
          </DialogContent>

          <DialogActions>
            {!submitting ? (
              <Stack spacing={2} direction="row" justifyContent="flex-end">
                <Button variant="outlined" onClick={this.returnDialogClose}>
                  Cancel
                </Button>

                <Button
                  variant="contained"
                  type="button"
                  onClick={this.handleReturnConfirm}
                >
                  Yes, Confirm
                </Button>
              </Stack>
            ) : (
              <Stack spacing={2} direction="row" justifyContent="flex-end">
                <CircularProgress size="30px" />
              </Stack>
            )}
          </DialogActions>
        </Dialog>

        <Dialog
          open={this.state.materialReturnDialog}
          onClose={this.handleReturnDialogClose}
          fullWidth
          maxWidth="md"
          className="ratn-dialog-wrapper"
        >
          <DialogTitle>Return Product</DialogTitle>

          <DialogContent>
            <DialogContentText></DialogContentText>

            <Box sx={{ flexGrow: 1, m: 0.5 }}>
              {actionProduct ? (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Name"
                      variant="outlined"
                      fullWidth
                      value={actionProduct.product_name}
                      disabled
                      InputProps={{
                        className: "non_disable_text",
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <TextField
                      label="Purity"
                      variant="outlined"
                      fullWidth
                      value={actionProduct.materials[0].purity_name}
                      disabled
                      InputProps={{
                        className: "non_disable_text",
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <TextField
                      label="Avl Qty"
                      variant="outlined"
                      fullWidth
                      value={actionProduct.materials[0].avl_qty}
                      disabled
                      InputProps={{
                        className: "non_disable_text",
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <TextField
                      label="Avl Weight"
                      variant="outlined"
                      fullWidth
                      value={actionProduct.materials[0].avl_weight}
                      disabled
                      InputProps={{
                        className: "non_disable_text",

                        endAdornment: (
                          <InputAdornment position="start">
                            {actionProduct.materials[0].unit_name}
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Quantity"
                      variant="outlined"
                      fullWidth
                      onInput={(e) => validateInteger(e)}
                      value={actionProduct.materials[0].return_qty}
                      onChange={(event) =>
                        this.handleReturnMaterial(
                          event.target.value,

                          "return_qty",
                        )
                      }
                      error={this.state.return_qty_error}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Weight"
                      variant="outlined"
                      fullWidth
                      onInput={(e) => validateNumber(e)}
                      value={actionProduct.materials[0].return_weight}
                      onChange={(event) =>
                        this.handleReturnMaterial(
                          event.target.value,

                          "return_weight",
                        )
                      }
                      error={this.state.return_weight_error}
                      InputProps={{
                        className: "non_disable_text",

                        endAdornment: (
                          <InputAdornment position="start">
                            {actionProduct.materials[0].unit_name}
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={12}>
                    <Stack
                      spacing={1}
                      direction="row"
                      justifyContent="flex-end"
                    >
                      <Button
                        variant="outlined"
                        onClick={this.handleReturnDialogClose}
                      >
                        Close
                      </Button>

                      {this.state.return_products.length &&
                      this.state.return_products[actionProductIndex]
                        .is_return ? (
                        <Button
                          variant="outlined"
                          onClick={this.handleCancelReturn}
                        >
                          Cancel Return
                        </Button>
                      ) : null}

                      <Button
                        variant="contained"
                        type="button"
                        onClick={this.handleReturnMaterialSubmit}
                      >
                        Save
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              ) : null}
            </Box>
          </DialogContent>
        </Dialog>

        <Modal
          open={this.state.qrScannerOpen}
          onClose={this.handleCloseQRScanner}
          aria-labelledby="qr-scanner-modal"
          aria-describedby="scan-qr-code-for-certificate-number"
        >
          <Box
            sx={{
              position: "absolute",

              top: "50%",

              left: "50%",

              transform: "translate(-50%, -50%)",

              width: 350,

              bgcolor: "background.paper",

              boxShadow: 24,

              p: 4,

              borderRadius: 2,

              display: "flex",

              flexDirection: "column",

              alignItems: "center",
            }}
          >
            <Typography
              id="qr-scanner-modal"
              variant="h6"
              component="h2"
              sx={{ mb: 2 }}
            >
              Scan QR Code
            </Typography>

            {this.state.qrScannerError && (
              <Alert severity="warning" sx={{ width: "100%", mb: 2 }}>
                {this.state.qrScannerError}
              </Alert>
            )}

            <Box
              id="qr-reader"
              sx={{ width: "100%", height: 300, mb: 2 }}
            ></Box>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2, textAlign: "center" }}
            >
              Position the QR code within the frame to scan. Make sure it's
              well-lit and clearly visible.
            </Typography>

            <Button
              variant="outlined"
              color="primary"
              onClick={this.handleRetryQRScanner}
              fullWidth
            >
              Retry
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={this.handleCloseQRScanner}
              fullWidth
            >
              Cancel
            </Button>
          </Box>
        </Modal>
      </Box>
    );
  }
}

const mapStateToProps = (state) => ({
  distributorList: state.superadmin.distributor.items,

  adminList: state.superadmin.admin.items,

  retailerList: state.superadmin.retailer.items,

  salesExecutiveList: state.superadmin.salesExecutive.items,

  productList: state.superadmin.product.items,

  actionCalled: state.superadmin.sales.actionCalled,

  createSuccess: state.superadmin.sales.createSuccess,

  editSuccess: state.superadmin.sales.editSuccess,

  successMessage: state.superadmin.sales.successMessage,

  errorMessage: state.superadmin.sales.errorMessage,

  productPriceInfo: state.superadmin.materialPrice.productPriceInfo,

  stockProductList: state.superadmin.stocks.productList,

  stockProductDetails: state.superadmin.stocks.productDetails,

  categoryList: state.superadmin.category.items,

  subCategoryList: state.superadmin.subCategory.items,

  order: state.superadmin.orders.order,

  auth: state.auth,

  employeeList: state.superadmin.employee.items,

  supplierList: state.superadmin.supplier.items,

  reportCharge: state.superadmin.reportCharge.items,
});

const mapDispatchToProps = (dispatch) => ({
  dispatch,

  actions: bindActionCreators(
    {
      salesStore,

      salesUpdate,

      adminList,

      productList,

      materialPriceProductPriceInfo,

      stocksProducDetails,

      stocksProductList,

      categoryList,

      subCategoryList,

      orderView,

      cartList,

      retailerList,

      distributorList,

      salesExecutiveList,

      employeeList,

      supplierList,

      getNotifiactions,
    },

    dispatch,
  ),
});

export default withRouter(
  withSnackbar(
    connect(
      mapStateToProps,

      mapDispatchToProps,
    )(
      reduxForm({
        form: "SaleForm",
      })(SaleForm),
    ),
  ),
);

function Row(props) {
  const { row } = props;

  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>

        <TableCell component="th" scope="row">
          {row.product_name}
        </TableCell>

        <TableCell>{row.size_name}</TableCell>

        <TableCell>{row.quantity}</TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={11}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Table size="medium" aria-label="orders">
                <TableHead>
                  <TableRow className="pur-details-inner-table">
                    <TableCell>Material Name</TableCell>

                    <TableCell>Purity</TableCell>

                    <TableCell>Quantity</TableCell>

                    <TableCell>Weight</TableCell>

                    <TableCell>Unit</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody className="pur-details-table-body">
                  {row.materials.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell scope="row">{item.material_name}</TableCell>

                      <TableCell>{item.purity_name}</TableCell>

                      <TableCell>{item.quantity}</TableCell>

                      <TableCell>{item.weight}</TableCell>

                      <TableCell>{item.unit_name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}
