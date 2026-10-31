import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import Loadable from 'ui-component/Loadable';
import MainLayout from 'layout/MainLayout';


const LoginPage = Loadable(lazy(() => import('../pages/SuperAdmin/Auth/Login')));
const ForgotPasswordPage = Loadable(lazy(() => import('../pages/SuperAdmin/Auth/ForgotPassword')));
const ResetPasswordPage = Loadable(lazy(() => import('../pages/SuperAdmin/Auth/ResetPassword')));
const DashboardPage = Loadable(lazy(() => import('../pages/SuperAdmin/Dashboard')));
const CertificatePage = Loadable(lazy(() => import('../pages/SuperAdmin/Certificate')));
const CategoryPage = Loadable(lazy(() => import('../pages/SuperAdmin/Category')));
//const CertificateEditPage = Loadable(lazy(() => import('../pages/SuperAdmin/Certificate/Edit')));
const SubCategoryPage = Loadable(lazy(() => import('../pages/SuperAdmin/SubCategory')));

//country
const CountryPage = Loadable(lazy(() => import('../pages/SuperAdmin/Country')));

//State
const StatePage = Loadable(lazy(() => import('../pages/SuperAdmin/State')));

//District
const DistrictPage = Loadable(lazy(() => import('../pages/SuperAdmin/District')));

// investor
const InvestorPage = Loadable(lazy(() => import('../pages/SuperAdmin/Investor')));
const InvestorCreatePage = Loadable(lazy(() => import('../pages/SuperAdmin/Investor/Create')));
const InvestorEditPage = Loadable(lazy(() => import('../pages/SuperAdmin/Investor/Edit')));

// admin
const AdminPage = Loadable(lazy(() => import('../pages/SuperAdmin/Admin')));
const AdminCreatePage = Loadable(lazy(() => import('../pages/SuperAdmin/Admin/Create')));
const AdminEditPage = Loadable(lazy(() => import('../pages/SuperAdmin/Admin/Edit')));
const AdminViewPage = Loadable(lazy(() => import('../pages/SuperAdmin/Admin/View')));
const AdminInvoiceTransactionLedgerPage = Loadable(lazy(() => import('../pages/SuperAdmin/Admin/Ledger')));


// distributor
const DistributorPage = Loadable(lazy(() => import('../pages/SuperAdmin/Distributor')));
const DistributorCreatePage = Loadable(lazy(() => import('../pages/SuperAdmin/Distributor/Create')));
const DistributorEditPage = Loadable(lazy(() => import('../pages/SuperAdmin/Distributor/Edit')));

// retailer
const RetailerPage = Loadable(lazy(() => import('../pages/SuperAdmin/Retailer')));
const RetailerCreatePage = Loadable(lazy(() => import('../pages/SuperAdmin/Retailer/Create')));
const RetailerEditPage = Loadable(lazy(() => import('../pages/SuperAdmin/Retailer/Edit')));
const RetailerViewPage = Loadable(lazy(() => import('../pages/SuperAdmin/Retailer/View')));

// supplier
const SupplierPage = Loadable(lazy(() => import('../pages/SuperAdmin/Supplier')));
const SupplierCreatePage = Loadable(lazy(() => import('../pages/SuperAdmin/Supplier/Create')));
const SupplierEditPage = Loadable(lazy(() => import('../pages/SuperAdmin/Supplier/Edit')));
const SupplierViewPage = Loadable(lazy(() => import('../pages/SuperAdmin/Supplier/View')));
const SupplierInvoiceTransactionLedgerPage = Loadable(lazy(() => import('../pages/SuperAdmin/Supplier/Ledger')));

// employee
const EmployeePage = Loadable(lazy(() => import('../pages/SuperAdmin/Employee')));
const EmployeeCreatePage = Loadable(lazy(() => import('../pages/SuperAdmin/Employee/Create')));
const EmployeeEditPage = Loadable(lazy(() => import('../pages/SuperAdmin/Employee/Edit')));
const EmployeeViewPage = Loadable(lazy(() => import('../pages/SuperAdmin/Employee/View')));

// sales executive
const SalesExecutivePage = Loadable(lazy(() => import('../pages/SuperAdmin/SalesExecutive')));
const SalesExecutiveCreatePage = Loadable(lazy(() => import('../pages/SuperAdmin/SalesExecutive/Create')));
const SalesExecutiveEditPage = Loadable(lazy(() => import('../pages/SuperAdmin/SalesExecutive/Edit')));
/* Stocks listing opened from the new list icon beside the profile View on the
   SE row. Admin already had this route; Super Admin was missing it. */
const SalesExecutiveViewPage = Loadable(lazy(() => import('../pages/SuperAdmin/SalesExecutive/View')));

// worker
/*const WorkerPage = Loadable(lazy(() => import('../pages/SuperAdmin/Worker')));
const WorkerCreatePage = Loadable(lazy(() => import('../pages/SuperAdmin/Worker/Create')));
const WorkerEditPage = Loadable(lazy(() => import('../pages/SuperAdmin/Worker/Edit')));*/

//tax 
const TaxPage = Loadable(lazy(() => import('../pages/SuperAdmin/Tax')));

// Unit 
const UnitPage = Loadable(lazy(() => import('../pages/SuperAdmin/Unit')));

// Purity 
const PurityPage = Loadable(lazy(() => import('../pages/SuperAdmin/Purity')));

// Report Charge 
const ReportChargePage = Loadable(lazy(() => import('../pages/SuperAdmin/ReportCharge')));

// Size 
const SizePage = Loadable(lazy(() => import('../pages/SuperAdmin/Size')));

// Material
const MaterialPage = Loadable(lazy(() => import('../pages/SuperAdmin/Material')));

// Product 
const ProductPage = Loadable(lazy(() => import('../pages/SuperAdmin/Product')));
const ProductCreatePage = Loadable(lazy(() => import('../pages/SuperAdmin/Product/Create')));
const ProductEditPage = Loadable(lazy(() => import('../pages/SuperAdmin/Product/Edit')));
const ProductViewPage = Loadable(lazy(() => import('../pages/SuperAdmin/Product/View')));

// Promocode
const PromocodePage = Loadable(lazy(() => import('../pages/SuperAdmin/Promocode')));
const PromocodeCreatePage = Loadable(lazy(() => import('../pages/SuperAdmin/Promocode/Create')));
const PromocodeEditPage = Loadable(lazy(() => import('../pages/SuperAdmin/Promocode/Edit')));

// Festiveoffer
const FestiveofferPage = Loadable(lazy(() => import('../pages/SuperAdmin/FestiveOffer')));
const FestiveofferCreatePage = Loadable(lazy(() => import('../pages/SuperAdmin/FestiveOffer/Create')));
const FestiveofferEditPage = Loadable(lazy(() => import('../pages/SuperAdmin/FestiveOffer/Edit')));

// StockProductBannerPage
const StockProductBannerPage = Loadable(lazy(() => import('../pages/SuperAdmin/StockProductBanner')));
const StockProductBannerCreatePage = Loadable(lazy(() => import('../pages/SuperAdmin/StockProductBanner/Create')));
const StockProductBannerEditPage = Loadable(lazy(() => import('../pages/SuperAdmin/StockProductBanner/Edit')));

//material price
const MaterialPricePage = Loadable(lazy(() => import('../pages/SuperAdmin/MaterialPrice')));
const MaterialPriceCreatePage = Loadable(lazy(() => import('../pages/SuperAdmin/MaterialPrice/Create')));
const MaterialPriceEditPage = Loadable(lazy(() => import('../pages/SuperAdmin/MaterialPrice/Edit')));

// leave-application
const LeaveApplicationPage =Loadable(lazy(() => import('../pages/SuperAdmin/Leave_application')));
const LeaveApplicationViewPage =Loadable(lazy(() => import('../pages/SuperAdmin/Leave_application/View')));

// expense
const ExpensePage =Loadable(lazy(() => import('../pages/SuperAdmin/Expense')));

//stocks
const StocksPage =Loadable(lazy(() => import('../pages/SuperAdmin/Stocks')));
const StocksViewPage = Loadable(lazy(() => import('../pages/SuperAdmin/Stocks/View')));

//material stocks
const MaterialStocksPage =Loadable(lazy(() => import('../pages/SuperAdmin/MaterialStocks')));
const MaterialStocksViewPage = Loadable(lazy(() => import('../pages/SuperAdmin/MaterialStocks/View')));
const MaterialStocksHistoryPage = Loadable(lazy(() => import('../pages/SuperAdmin/MaterialStocks/history')));

//purchase
const PurchasePage = Loadable(lazy(() => import('../pages/SuperAdmin/Purchase')));
const PurchaseCreatePage = Loadable(lazy(() => import('../pages/SuperAdmin/Purchase/Create')));
const PurchaseEditPage = Loadable(lazy(() => import('../pages/SuperAdmin/Purchase/Edit')));
const PurchaseViewPage = Loadable(lazy(() => import('../pages/SuperAdmin/Purchase/View')));
const PurchaseDownloadViewPage = Loadable(lazy(() => import('../pages/SuperAdmin/Purchase/DownloadView')));
const PurchaseAllViewPage = Loadable(lazy(() => import('../pages/SuperAdmin/Purchase/AllView')));
const PurchaseReturnPage = Loadable(lazy(() => import('../pages/SuperAdmin/Purchase/Return')));
const PurchaseProductsPage = Loadable(lazy(() => import('../pages/SuperAdmin/Purchase/PurchaseProducts')));

//loan
const LoanPage = Loadable(lazy(() => import('../pages/SuperAdmin/Loans')));
const LoanViewPage = Loadable(lazy(() => import('../pages/SuperAdmin/Loans/View')));

//sales
const SalePage = Loadable(lazy(() => import('../pages/SuperAdmin/Sale')));
const SaleCreatePage = Loadable(lazy(() => import('../pages/SuperAdmin/Sale/Create')));
const SaleViewPage = Loadable(lazy(() => import('../pages/SuperAdmin/Sale/View')));
const SaleEditPage = Loadable(lazy(() => import('../pages/SuperAdmin/Sale/Edit')));
const SaleDownloadViewPage = Loadable(lazy(() => import('../pages/SuperAdmin/Sale/DownloadView')));
//const OwnSalePage = Loadable(lazy(() => import('../pages/SuperAdmin/Sale/OwnSale')));
//const OwnSaleViewPage = Loadable(lazy(() => import('../pages/SuperAdmin/Sale/OwnSaleView')));
const SaleProductsPage = Loadable(lazy(() => import('../pages/SuperAdmin/Sale/SaleProducts')));

//Sale On Approval
const SaleOnApprovePage = Loadable(lazy(() => import('../pages/SuperAdmin/SaleOnApproval')));
const SaleOnApproveViewPage = Loadable(lazy(() => import('../pages/SuperAdmin/SaleOnApproval/View')));
const SaleOnApproveDownloadViewPage = Loadable(lazy(() => import('../pages/SuperAdmin/SaleOnApproval/DownloadView')));
const PurchaseOnApprovePage = Loadable(lazy(() => import('../pages/SuperAdmin/PurchaseOnApproval')));
const PurchaseOnApproveViewPage = Loadable(lazy(() => import('../pages/SuperAdmin/PurchaseOnApproval/View')));
const PurchaseOnApproveDownloadViewPage = Loadable(lazy(() => import('../pages/SuperAdmin/PurchaseOnApproval/DownloadView')));

//profile
const EditProfilePage = Loadable(lazy(() => import('../pages/SuperAdmin/Profile/EditProfile')));
const ChangePasswordPage = Loadable(lazy(() => import('../pages/SuperAdmin/Profile/ChangePassword')));

//roles
const RolePage = Loadable(lazy(() => import('../pages/SuperAdmin/Role')));
const RolePermissionPage = Loadable(lazy(() => import('../pages/SuperAdmin/Role/permission')));

//orders
const OrderPage = Loadable(lazy(() => import('../pages/SuperAdmin/Orders')));
const OrderViewPage = Loadable(lazy(() => import('../pages/SuperAdmin/Orders/View')));

//customers
const CustomerPage = Loadable(lazy(() => import('../pages/SuperAdmin/Customer')));
const CustomerViewPage = Loadable(lazy(() => import('../pages/SuperAdmin/Customer/View')));

//paymenta
const PaymentPage = Loadable(lazy(() => import('../pages/SuperAdmin/Payment')));
const WalletPage = Loadable(lazy(() => import('../pages/SuperAdmin/Payment/wallet')));

//Return policy
const ReturnPolicyPage = Loadable(lazy(() => import('../pages/SuperAdmin/ReturnPolicy')));

//Return purchase
const ReturnPurchasePage = Loadable(lazy(() => import('../pages/SuperAdmin/ReturnPurchase')));
const ReturnPurchaseViewPage = Loadable(lazy(() => import('../pages/SuperAdmin/ReturnPurchase/View')));

//Return sale
const ReturnSalePage = Loadable(lazy(() => import('../pages/SuperAdmin/ReturnSale')));
const ReturnSalePageViewPage = Loadable(lazy(() => import('../pages/SuperAdmin/ReturnSale/View')));

//banners
const BannerPage = Loadable(lazy(() => import('../pages/SuperAdmin/Banner')));

//new arrivals
const NewArrivalPage = Loadable(lazy(() => import('../pages/SuperAdmin/NewArrival')));

//search
const SearchPage = Loadable(lazy(() => import('../pages/SuperAdmin/Search')));

//Return orders
const ReturnOrderPage = Loadable(lazy(() => import('../pages/SuperAdmin/ReturnOrder')));
const ReturnOrderViewPage = Loadable(lazy(() => import('../pages/SuperAdmin/ReturnOrder/View')));

//holiday
const HolidayPage = Loadable(lazy(() => import('../pages/SuperAdmin/Holiday')));

//Transfer 
const TransferPage = Loadable(lazy(() => import('../pages/SuperAdmin/Transfer')));
const TransferViewPage = Loadable(lazy(() => import('../pages/SuperAdmin/Transfer/View')));

//Received 
const ReceivedPage = Loadable(lazy(() => import('../pages/SuperAdmin/Received')));
const ReceivedViewPage = Loadable(lazy(() => import('../pages/SuperAdmin/Received/View')));

//salary 
const SalaryPage = Loadable(lazy(() => import('../pages/SuperAdmin/Salary')));
const SalaryHistoryPage = Loadable(lazy(() => import('../pages/SuperAdmin/Salary/History')));

//Return stocks
const ReturnStocksPage =Loadable(lazy(() => import('../pages/SuperAdmin/ReturnStocks')));
const ReturnStocksViewPage = Loadable(lazy(() => import('../pages/SuperAdmin/ReturnStocks/View')));

//SubscriberPage
const SubscriberPage =Loadable(lazy(() => import('../pages/SuperAdmin/Subscriber')));

//homepage settings
const HomepageSettingPage = Loadable(lazy(() => import('../pages/SuperAdmin/HomepageSetting')));
const CompanyDetailsPage = Loadable(lazy(() => import('../pages/SuperAdmin/CompanyDetails')));

const routePrefix = '/super-admin';
const SuperAdminRoutes = (isLoggedIn) => [
  {
    path: routePrefix,
    element: isLoggedIn ? <MainLayout /> : <Navigate to="/super-admin/login" />,
    children: [
      {
        path: routePrefix,
        element: <DashboardPage />
      },
      {
        path: 'dashboard',
        element: <DashboardPage />
      },
      {
        path: 'certificates',
        element: <CertificatePage />
      },
      {
        path: 'banners',
        element: <BannerPage />
      },
      {
        path: 'new-arrivals',
        element: <NewArrivalPage />
      },
      {
        path: 'categories',
        element: <CategoryPage />
      },
      {
        path: 'sub-categories',
        element: <SubCategoryPage />
      },
      {
        path: 'tax',
        element: <TaxPage />
      },
      {
        path: 'units',
        element: <UnitPage />
      },
      {
        path: 'purities',
        element: <PurityPage />
      },
      {
        path: 'report-charge',
        element: <ReportChargePage />
      },
      {
        path: 'sizes',
        element: <SizePage />
      },
      {
        path: 'materials',
        element: <MaterialPage />
      },
      {
        path: 'products',
        element: <ProductPage />
      },
      {
        path: 'products/Create',
        element: <ProductCreatePage />
      },
      {
        path: 'products/Edit/:id',
        element: <ProductEditPage />
      },
      {
        path: 'products/View/:id',
        element: <ProductViewPage />
      },
      {
        path: 'promocodes',
        element: <PromocodePage />
      },
      {
        path: 'promocodes/Create',
        element: <PromocodeCreatePage />
      },
      {
        path: 'promocodes/Edit/:id',
        element: <PromocodeEditPage />
      },
      {
        path: 'festive-offers',
        element: <FestiveofferPage />
      },
      {
        path: 'festive-offers/Create',
        element: <FestiveofferCreatePage />
      },
      {
        path: 'festive-offers/Edit/:id',
        element: <FestiveofferEditPage />
      },
      {
        path: 'stock-products',
        element: <StockProductBannerPage />
      },
      {
        path: 'stock-products/Create',
        element: <StockProductBannerCreatePage />
      },
      {
        path: 'stock-products/Edit/:id',
        element: <StockProductBannerEditPage />
      },
      {
        path: 'homepage-settings',
        element: <HomepageSettingPage />
      },
      {
        path: 'company-details',
        element: <CompanyDetailsPage />
      },
      {
        path: 'countries',
        element: <CountryPage />
      },
      {
        path: 'states',
        element: <StatePage />
      },
      {
        path: 'districts',
        element: <DistrictPage />
      },
      {
        path: 'investors',
        element: <InvestorPage />
      },
      {
        path: 'investors/Create',
        element: <InvestorCreatePage />
      },
      {
        path: 'investors/Edit/:id',
        element: <InvestorEditPage />
      },
      {
        path: 'admins',
        element: <AdminPage />
      },
      {
        path: 'admins/Create',
        element: <AdminCreatePage />
      },
      {
        path: 'admins/Edit/:id',
        element: <AdminEditPage />
      },
      {
        path: 'admins/View/:id',
        element: <AdminViewPage />
      },
      {
        path: 'admins/invoice-transaction-ledger/:id',
        element: <AdminInvoiceTransactionLedgerPage />
      },
      {
        path: 'distributors',
        element: <DistributorPage />
      },
      {
        path: 'distributors/Create',
        element: <DistributorCreatePage />
      },
      {
        path: 'distributors/Edit/:id',
        element: <DistributorEditPage />
      },
      {
        path: 'retailers',
        element: <RetailerPage />
      },
      {
        path: 'retailers/Create',
        element: <RetailerCreatePage />
      },
      {
        path: 'retailers/Edit/:id',
        element: <RetailerEditPage />
      },
      {
        path: 'retailers/View/:id',
        element: <RetailerViewPage />
      },
      {
        path: 'suppliers',
        element: <SupplierPage />
      },
      {
        path: 'suppliers/Create',
        element: <SupplierCreatePage />
      },
      {
        path: 'suppliers/Edit/:id',
        element: <SupplierEditPage />
      },
      {
        path: 'suppliers/View/:id',
        element: <SupplierViewPage />
      },
      {
        path: 'suppliers/invoice-transaction-ledger/:id',
        element: <SupplierInvoiceTransactionLedgerPage />
      },
      {
        path: 'employees',
        element: <EmployeePage />
      },
      {
        path: 'employees/Create',
        element: <EmployeeCreatePage />
      },
      {
        path: 'employees/Edit/:id',
        element: <EmployeeEditPage />
      },
      {
        path: 'employees/View/:id',
        element: <EmployeeViewPage />
      },
      /*{
        path: 'workers',
        element: <WorkerPage />
      },
      {
        path: 'workers/Create',
        element: <WorkerCreatePage />
      },
      {
        path: 'workers/Edit/:id',
        element: <WorkerEditPage />
      },*/
      {
        path: 'material-prices',
        element: <MaterialPricePage />
      },
      {
        path: 'material-prices/Create',
        element: <MaterialPriceCreatePage />
      },
      {
        path: 'material-prices/Edit/:id',
        element: <MaterialPriceEditPage />
      },
      {
        path: 'leave-applications',
        element: <LeaveApplicationPage />
      },
      {
        path: 'leave-applications/View/:id',
        element: <LeaveApplicationViewPage />
      },
      {
        path: 'expenses',
        element: <ExpensePage />
      },
      {
        path: 'stocks',
        element: <StocksPage />
      },
      {
        path: 'stocks/View/:id',
        element: <StocksViewPage />
      },
      {
        path: 'purchases',
        element: <PurchasePage />
      },
      {
        path: 'purchases/Create',
        element: <PurchaseCreatePage />
      },
      {
        path: 'purchases/Edit/:id',
        element: <PurchaseEditPage />
      },
      {
        path: 'purchases/Return/:id',
        element: <PurchaseReturnPage />
      },
      {
        path: 'purchases/View/:id',
        element: <PurchaseViewPage />
      },
      {
        path: 'purchases/Download-View/:id',
        element: <PurchaseDownloadViewPage />
      },
      {
        path: 'purchase-on-approve/Download-View/:id',
        element: <PurchaseOnApproveDownloadViewPage />
      },
      {
        path: 'purchases/all-view/:id',
        element: <PurchaseAllViewPage />
      },
      {
        path: 'purchase-products',
        element: <PurchaseProductsPage />
      },
      {
        path: 'loans',
        element: <LoanPage />
      },
      {
        path: 'loans/View/:id',
        element: <LoanViewPage />
      },
      {
        path: 'sales',
        element: <SalePage />
      },
      {
        path: 'sale-products',
        element: <SaleProductsPage />
      },
      {
        path: 'sales/Create',
        element: <SaleCreatePage />
      },
      {
        path: 'sales/Edit/:id',
        element: <SaleEditPage />
      },
      {
        path: 'sales/View/:id',
        element: <SaleViewPage />
      },
      {
        path: 'sales/Download-View/:id',
        element: <SaleDownloadViewPage />
      },
      {
        path: 'sale-on-approve/Download-View/:id',
        element: <SaleOnApproveDownloadViewPage />
      },
      // {
      //   path: 'own-sales',
      //   element: <OwnSalePage />
      // },
      // {
      //   path: 'own-sales/View/:id',
      //   element: <OwnSaleViewPage />
      // },
      {
        path: 'edit-profile',
        element: <EditProfilePage />
      },
      {
        path: 'change-password',
        element: <ChangePasswordPage />
      },
      {
        path: 'roles',
        element: <RolePage />
      },
      {
        path: 'roles/permissions/:id',
        element: <RolePermissionPage />
      },
      {
        path: 'orders',
        element: <OrderPage />
      },
      {
        path: 'orders/View/:id',
        element: <OrderViewPage />
      },
      {
        path: 'sales-executive',
        element: <SalesExecutivePage />
      },
      {
        path: 'sales-executive/Create',
        element: <SalesExecutiveCreatePage />
      },
      {
        path: 'sales-executive/Edit/:id',
        element: <SalesExecutiveEditPage />
      },
      {
        path: 'sales-executive/View/:id',
        element: <SalesExecutiveViewPage />
      },
      {
        path: 'customers',
        element: <CustomerPage />
      },
      {
        path: 'customers/View/:id',
        element: <CustomerViewPage />
      },
      /*{
        path: 'payments',
        element: <PaymentPage />
      },*/
      {
        path: 'sale-on-approve',
        element: <SaleOnApprovePage />
      },
      {
        path: 'wallet-history',
        element: <WalletPage />
      },
      {
        path: 'sale-on-approve/View/:id',
        element: <SaleOnApproveViewPage />
      },
      {
        path: 'purchase-on-approve',
        element: <PurchaseOnApprovePage />
      },
      {
        path: 'purchase-on-approve/View/:id',
        element: <PurchaseOnApproveViewPage />
      },
      {
        path: 'return-policy',
        element: <ReturnPolicyPage />
      },
      {
        path: 'return-purchase',
        element: <ReturnPurchasePage />
      },
      {
        path: 'return-purchase/View/:id',
        element: <ReturnPurchaseViewPage />
      },
      {
        path: 'return-sale',
        element: <ReturnSalePage />
      },
      {
        path: 'return-sale/View/:id',
        element: <ReturnSalePageViewPage />
      },
      {
        path: 'search',
        element: <SearchPage />
      },
      {
        path: 'return-orders',
        element: <ReturnOrderPage />
      },
      {
        path: 'return-orders/View/:id',
        element: <ReturnOrderViewPage />
      },
      {
        path: 'holidays',
        element: <HolidayPage />
      },
      {
        path: 'material-stocks',
        element: <MaterialStocksPage />
      },
      {
        path: 'material-stocks/View/:id',
        element: <MaterialStocksViewPage />
      },
      {
        path: 'material-stock-history',
        element: <MaterialStocksHistoryPage />
      },
      {
        path: 'transfer',
        element: <TransferPage />
      },
      {
        path: 'transfer/View/:id',
        element: <TransferViewPage />
      },
      {
        path: 'received',
        element: <ReceivedPage />
      },
      {
        path: 'received/View/:id',
        element: <ReceivedViewPage />
      },
      {
        path: 'salary',
        element: <SalaryPage />
      },
      {
        path: 'salary/history/:id',
        element: <SalaryHistoryPage />
      },
      {
        path: 'return-stocks',
        element: <ReturnStocksPage />
      },
      {
        path: 'return-stocks/View/:id',
        element: <ReturnStocksViewPage />
      },
      {
        path: 'subscribers',
        element: <SubscriberPage />
      },
    ]
  },
  {
    path: `${routePrefix}/login`,
    element: <LoginPage />,
  },
  {
    path: `${routePrefix}/forgot-password`,
    element: <ForgotPasswordPage />,
  },
  {
    path: `${routePrefix}/reset-password`,
    element: <ResetPasswordPage />,
  }
];

export default SuperAdminRoutes;