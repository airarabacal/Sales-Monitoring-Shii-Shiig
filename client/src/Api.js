import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3001/api',
})

export const insertRecord = (route, payload, document)=> api.post(route, {data: {docData: payload, doc: document}});
export const getAllRecords = (route, document) => api.post(route, {data: {doc: document}});
export const updateRecordById = (route, payload, document) => api.put(route, {data: {docData: payload, doc: document}});
export const deleteRecordById = (route, document) => api.post(route, {data: {doc: document}});
export const getOrdersByCustomerIDAndDate = (route) => api.post(route);
export const getOrdersByDate = (route) => api.post(route);
export const getExpensesByDate = (route) => api.post(route);
// export const getRecordById = route => api.get(route);

const apis = {
    insertRecord,
    getAllRecords,
    updateRecordById,
    deleteRecordById,
    getOrdersByCustomerIDAndDate,
    getOrdersByDate,
    getExpensesByDate
    
}

export default apis;
