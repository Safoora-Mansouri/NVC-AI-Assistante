import axios from "axios";

export const analyzeText = (text) => {
  return axios.post("http://localhost:3000/analyze", { text });
};