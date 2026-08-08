import { React, Component } from "react";
import { connect } from "react-redux";
import {
  Select,
  Stack,
  InputLabel,
  Box,
  Typography,
  FormControl,
  Card,
  CardContent,
  TextField,
  Grid,
  Button,
  MenuItem,
} from "@mui/material";
import { bindActionCreators } from "redux";
import { gridSpacing } from "store/constant";
import MainCard from "ui-component/cards/MainCard";
import withRouter from "src/helpers/withRouter";
import { purchaseProducts } from "actions/superadmin/purchase.actions";
import DataTable from "src/utils/DataTable";
import { withSnackbar } from "notistack";
import { categoryList } from "actions/superadmin/category.actions";
import { subCategoryList } from "actions/superadmin/subCategory.actions";
import { supplierList } from "actions/superadmin/supplier.actions";
import { displayAmount } from "src/helpers/helper";
import { getRoleName, getUserDashboardRoute } from "src/helpers/helper";

class PurchaseProductsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      total: 0,
      price_by_categories: [],
      categories: this.props.categories,
      sub_categories: this.props.sub_categories,
      suppliers: this.props.suppliers,
      queryParams: {
        page: 1,
        limit: 50,
        all: 0,
        category_id: "",
        sub_category_id: "",
        supplier_id: "",
      },
      auth: this.props.auth,
    };

    this.columns = [
      {
        name: "image",
        display_name: "Image",
        isImage: true,
      },
      {
        name: "name",
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
        name: "purity_display",
        display_name: "Purity Name",
        width: "165px",
      },
      /*{
        name: 'quantity',
        display_name: 'Qty'
      },*/
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
        name: "mrp_display",
        display_name: "Price",
      },
    ];

    this.tableActions = [
      {
        label: "View",
        onClick: this.handleView,
        color: "primary",
      },
    ];
  }

  componentDidMount() {
    this.loadListData();
    this.props.actions.categoryList({ all: 1 });
    this.props.actions.supplierList({ all: 1 });
  }

  static getDerivedStateFromProps(props, state) {
    let update = {};
    if (props.auth !== state.auth) {
      update.auth = props.auth;
    }
    if (props.categories !== state.categories) {
      update.categories = props.categories;
    }
    if (props.sub_categories !== state.sub_categories) {
      update.sub_categories = props.sub_categories;
    }
    if (props.suppliers !== state.suppliers) {
      update.suppliers = props.suppliers;
    }
    return update;
  }

  loadListData = () => {
    purchaseProducts(this.state.queryParams).then((res) => {
      if (res.data.success) {
        this.setState({
          items: res.data.data.items,
          total: res?.data?.data?.total || res?.data?.data?.items?.length || 0,
          price_by_categories: res.data.data.categories,
        });
      }
    });
  };

  handlePagination = (page, all = false) => {
    this.setState(
      {
        queryParams: {
          ...this.state.queryParams,
          page: page,
          all: all ? 1 : 0,
          limit: all ? this.state.total || this.state.queryParams.limit : 50,
        },
      },
      () => {
        this.loadListData();
      },
    );
  };

  handleView = (row) => {
    this.props.navigate(
      getUserDashboardRoute(getRoleName(this.state.auth)) +
        "/purchases/view/" +
        row.purchase_id,
    );
  };

  handleFilterChange = (field, value) => {
    let extra = {};
    if (field === "category_id") {
      // sub categories depend on the selected category
      this.props.actions.subCategoryList({ all: 1, category_id: value });
      extra.sub_category_id = "";
    }
    this.setState({
      queryParams: {
        ...this.state.queryParams,
        page: 1,
        all: 0,
        limit: 50,
        [field]: value,
        ...extra,
      },
    });
  };

  handleSearch = () => {
    this.setState(
      {
        queryParams: {
          ...this.state.queryParams,
          page: 1,
          all: 0,
          limit: 50,
        },
      },
      () => {
        this.loadListData();
      },
    );
  };

  handleCardClick = (category_id) => {
    this.props.actions.subCategoryList({ all: 1, category_id: category_id });
    this.setState(
      {
        queryParams: {
          ...this.state.queryParams,
          page: 1,
          all: 0,
          limit: 50,
          category_id: category_id,
          sub_category_id: "",
        },
      },
      () => {
        this.handleSearch();
      },
    );
  };

  render() {
    return (
      <>
        <div className="sale-heading">
          <h1>Purchase Products List</h1>
        </div>
        {this.state.price_by_categories.length ? (
          <Card className="dashboard_card" style={{ marginBottom: "4px" }}>
            {this.state.price_by_categories.map((item, key) => (
              <CardContent
                className={`dashboard_card_content bg-color-1`}
                sx={{ display: "flex", justifyContent: "space-between" }}
                key={key}
                onClick={() => this.handleCardClick(item.category_id)}
              >
                <Typography
                  sx={{ fontSize: 14, margin: 0 }}
                  color="text.secondary"
                  gutterBottom
                  component="span"
                >
                  <h1>{item.category_name}</h1>
                  <h2>{displayAmount(item.total_amount)}</h2>
                  <h3>{item.quantity} Piece(s)</h3>
                </Typography>
                <div className="card-icon">{/* <DiamondIcon /> */}</div>
              </CardContent>
            ))}
          </Card>
        ) : null}
        <MainCard>
          <Box sx={{ flexGrow: 1, m: 0.5 }} className="ratn-dialog-inner">
            <Grid
              container
              spacing={2}
              className="tax-input loans_view p_view"
              columnSpacing={{ xs: 1, sm: 2, md: 2 }}
            >
              <Grid item xs={6} md={3} className="create-input">
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={this.state.queryParams.category_id}
                    label="Category"
                    onChange={(e) =>
                      this.handleFilterChange("category_id", e.target.value)
                    }
                    className="input-inner"
                    defaultValue=""
                  >
                    <MenuItem value="">All</MenuItem>
                    {this.state.categories.map((item, index) => (
                      <MenuItem value={item.id} key={index}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={3} className="create-input">
                <FormControl fullWidth>
                  <InputLabel>Sub Category</InputLabel>
                  <Select
                    value={this.state.queryParams.sub_category_id}
                    label="Sub Category"
                    onChange={(e) =>
                      this.handleFilterChange("sub_category_id", e.target.value)
                    }
                    className="input-inner"
                    defaultValue=""
                  >
                    <MenuItem value="">All</MenuItem>
                    {this.state.sub_categories.map((item, index) => (
                      <MenuItem value={item.id} key={index}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={3} className="create-input">
                <FormControl fullWidth>
                  <InputLabel>Supplier</InputLabel>
                  <Select
                    value={this.state.queryParams.supplier_id}
                    label="Supplier"
                    onChange={(e) =>
                      this.handleFilterChange("supplier_id", e.target.value)
                    }
                    className="input-inner"
                    defaultValue=""
                  >
                    <MenuItem value="">All</MenuItem>
                    {this.state.suppliers.map((item, index) => (
                      <MenuItem value={item.id} key={index}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid
                item
                xs={6}
                md={1}
                className="create-input order-input button-right"
              >
                <Button
                  variant="contained"
                  className="search-btn"
                  onClick={this.handleSearch}
                >
                  Search
                </Button>
              </Grid>
            </Grid>
          </Box>
          <Grid container spacing={gridSpacing} className="orders-sale-button">
            <DataTable
              columns={this.columns}
              rows={this.state.items}
              page={this.state.queryParams.page}
              limit={this.state.queryParams.limit}
              total={this.state.total}
              haveAllOption={true}
              // havePagination={false}
              handlePagination={this.handlePagination}
              actions={this.tableActions}
            />
          </Grid>
        </MainCard>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  categories: state.superadmin.category.items,
  sub_categories: state.superadmin.subCategory.items,
  suppliers: state.superadmin.supplier.items,
  auth: state.auth,
});

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
    actions: bindActionCreators(
      {
        categoryList,
        subCategoryList,
        supplierList,
      },
      dispatch,
    ),
  };
};

export default withSnackbar(
  withRouter(
    connect(mapStateToProps, mapDispatchToProps)(PurchaseProductsPage),
  ),
);
