// lib/axios.ts
import axios from "axios";

// Always send the Clerk session cookie on same-origin requests
axios.defaults.withCredentials = true;

export default axios;
