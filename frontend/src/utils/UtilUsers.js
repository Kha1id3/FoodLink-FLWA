import axios from "axios";

export const getAllUsers = () => {
  return axios.get("/api/users/");
};

// export const getSingleUser = () => {
//   return axios.get(`/api/users/:${id}`);
// };


export const postClientFormChanges = (id) => {
  return axios.patch(`/api/users/:${id}`);
}
