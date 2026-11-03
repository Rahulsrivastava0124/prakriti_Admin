import axios from 'actions/axios';
import {
    LIST_SALES,
    LIST_SALES_TXN_LEDGER,
    LIST_SALES_ON_APPROVE,
    GET_SALES_ON_APPROVE,
    UPDATE_SALES_STATUS,
    CREATE_SALES,
    ADD_SALES,
    GET_SALES,
    UPDATE_SALES,
    DELETE_SALES,
} from '../../actionTypes/superadmin/sales.types';
import {objectToQuery} from 'src/helpers/helper';

export const saleTxnLedgerList = (params) => {
    params = objectToQuery(params, true)
    return (dispatch) => {
        axios.get(`/superadmin/sales/txn-ledger${params}`)
        .then(response => {
            if(response.data.success){
                dispatch({
                    type: LIST_SALES_TXN_LEDGER,
                    payload: response.data.data
                });
            }
        })
        .catch(error => {
        })
    }
}

export const salesList = (params) => {
    params = objectToQuery(params, true)
    return (dispatch) => {
        axios.get(`/superadmin/sales${params}`)
        .then(response => {
            if(response.data.success){
                dispatch({
                    type: LIST_SALES,
                    payload: response.data.data
                });
            }
        })
        .catch(error => {
        })
    }
}

export const salesOnApproveList = (params) => {
    params = objectToQuery(params, true)
    return (dispatch) => {
        axios.get(`/superadmin/sales-on-approve${params}`)
        .then(response => {
            if(response.data.success){
                dispatch({
                    type: LIST_SALES_ON_APPROVE,
                    payload: response.data.data
                });
            }
        })
        .catch(error => {
        })
    }
}

export const salesCreate = (params) => {
    params = objectToQuery(params, true)
    return (dispatch) => {
        axios.get(`/superadmin/sales/create`)
        .then(response => {
            if(response.data.success){
                dispatch({
                    type: CREATE_SALES,
                    payload: response.data.data
                });
            }
        })
        .catch(error => {
        })
    }
}

export const salesStore = (data) => {
    return (dispatch) => {
        axios.post("/superadmin/sales/store", data)
        .then(response => {
            dispatch({
                type: ADD_SALES,
                payload: response.data
            });
        })
        .catch(error => {
        })
    }
}

export const salesView = (id) => {
    return (dispatch) => {
        axios.get(`/superadmin/sales/view/${id}`)
        .then(response => {
            console.log(response.data.data)
            if(response.data.success){
                dispatch({
                    type: GET_SALES,
                    payload: response.data.data
                });
            }
        })
        .catch(error => {
        })
    }
}

export const salesOnApproveView = (id) => {
    return (dispatch) => {
        axios.get(`/superadmin/sales-on-approve/view/${id}`)
        .then(response => {
            console.log(response.data.data)
            if(response.data.success){
                dispatch({
                    type: GET_SALES_ON_APPROVE,
                    payload: response.data.data
                });
            }
        })
        .catch(error => {
        })
    }
}
export const salesStatusChange = (id, data) => {
    /*return (dispatch) => {
        axios.post(`/superadmin/sales-on-approve/status/${id}`, data)
        .then(response => {
            dispatch({
                type: UPDATE_SALES_STATUS,
                payload: response.data
            });
        })
        .catch(error => {
        })
    }*/

    return axios.post(`/superadmin/sales-on-approve/status/${id}`, data);
        
}
export const salesEdit = (id) => {
    return (dispatch) => {
        /* no current=1: a return is credited at the rate the sale was made at */
        axios.get(`/superadmin/sales/edit/${id}`)
        .then(response => {
            console.log(response.data.data)
            if(response.data.success){
                dispatch({
                    type: GET_SALES,
                    payload: response.data.data
                });
            }
        })
        .catch(error => {
        })
    }
}

export const salesUpdate = (id, data) => {
    return (dispatch) => {
        axios.post(`/superadmin/sales/update/${id}`, data)
        .then(response => {
            dispatch({
                type: UPDATE_SALES,
                payload: response.data
            });
        })
        .catch(error => {
        })
    }
}

export const salesDelete = (id, data) => {
    return (dispatch) => {
        axios.delete(`/superadmin/sales/delete/${id}`, data)
        .then(response => {
            dispatch({
                type: DELETE_SALES,
                payload: response.data
            });
        })
        .catch(error => {
        })
    }
}

export const salesDownloadInvoice = (id) => {
    return axios.post(`/superadmin/sales/download-invoice/${id}`);
}

/**
 * current = true asks for the same jewellery re-costed at today's gold rate.
 * The plain call keeps printing the rates frozen when the sale was raised.
 */
export const salesDownloadInvoiceInfo = (id, current = false) => {
    return axios.post(`/superadmin/sales/download-invoice-info/${id}${current ? '?current=1' : ''}`);
}

export const salesDownloadInvoiceItemList = (id, current = false) => {
    return axios.post(`/superadmin/sales/download-invoice-item-list/${id}${current ? '?current=1' : ''}`);
}

export const salesDownloadInvoiceItemDetails = (id, current = false) => {
    return axios.post(`/superadmin/sales/download-invoice-item-details/${id}${current ? '?current=1' : ''}`);
}

/**
 * current = true asks for the same jewellery re-costed at today's gold rate.
 * The plain call keeps printing the rates frozen when the sale was raised.
 */
export const salesOnApprovalDownloadInvoiceInfo = (id, current = false) => {
    return axios.post(`/superadmin/sales-on-approve/download-invoice-info/${id}${current ? '?current=1' : ''}`);
}

export const salesOnApprovalDownloadInvoiceItemList = (id) => {
    return axios.post(`/superadmin/sales-on-approve/download-invoice-item-list/${id}`);
}

export const salesOnApprovalDownloadInvoiceItemDetails = (id) => {
    return axios.post(`/superadmin/sales-on-approve/download-invoice-item-details/${id}`);
}

export const salesViewRaw = (id, current = false) => {
    return axios.get(`/superadmin/sales/view/${id}${current ? '?current=1' : ''}`)
}

export const salesOnApproveViewRaw = (id, current = false) => {
    return axios.get(`/superadmin/sales-on-approve/view/${id}${current ? '?current=1' : ''}`)
}

/* items of a sale on approval, cart shaped, without touching the cart */
export const salesOnApproveTransferItemsRaw = (id) => {
    return axios.get(`/superadmin/sales-on-approve/transfer-items/${id}`)
}

export const salesEditRaw = (id) => {
    return axios.get(`/superadmin/sales/edit/${id}`)
}

export const saleReturn = (id, post) => {
    return axios.post(`/superadmin/sales/return/${id}`, post)
}

export const returnStockTrasnfer = (post) => {
    return axios.post(`/superadmin/sales/return-stock-transfer`, post)
}

export const saleProducts = (params) => {
    params = objectToQuery(params, true)
    return axios.get(`/superadmin/sales-products${params}`);
}

export const saleDownloadLedger = (params) => {
    params = objectToQuery(params, true)
    return axios.get(`/superadmin/sales/txn-ledger-download/${params}`);
}

