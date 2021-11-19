const axios = require('axios');
const axiosApiInstance = axios.create();

const generalHelpers = require("./generalHelpers");
const errorConstants = require("../constants/errorConstants");

// Axios request interceptor to add automatically token
axiosApiInstance.interceptors.request.use(async (config) => {
    config.headers["content-type"] = 'application/json';

    // Add token to request header if exist into local storage
    const token = await generalHelpers.spawnRequestToken();
    if(token) {
        config.headers["authorization"] = `Bearer ${token}`;
    }

    return config;
}, (error) => Promise.reject(error));

// Axios response interceptor to automatically refresh token
axiosApiInstance.interceptors.response.use((response) => {
    return response
}, async (error) => {
    if(error.response) {
        const originalRequest = error.config;
        if (error.response.status === 406 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Add token to request header if exist into local storage
            const token = await generalHelpers.spawnRequestToken(true);
            if(token) {
                axios.defaults.headers.common['authorization'] = `Bearer ${token}`;
            }

            return axiosApiInstance(originalRequest);
        }
    }
    return Promise.reject(error);
});

// Get verb xhr request
module.exports.xhrGetRequest = async (url) => {
    try {
        const response = await axiosApiInstance.get(url);
        return response.data;
    } catch (e) {
        return manageXhrError(e, url);
    }
};

// Post verb xhr request
module.exports.xhrPostRequest = async (url, data = null) => {
    try {
        const response = await axiosApiInstance.post(url, data);
        return response.data;
    } catch (e) {
        return manageXhrError(e, url);
    }
};

// Manage xhr error
const manageXhrError = (error, url) => {
    generalHelpers.log("Xhr request error", error);
    if(error.response) return error.response.data;
    return {message: errorConstants.GENERAL.REQUEST, status: false, data: null};
}
