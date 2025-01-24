import axios from 'axios';

const createAxiosInstance = () => {
  return axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    }
  });
};

export default createAxiosInstance;