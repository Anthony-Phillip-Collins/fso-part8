// import axios from 'axios';

// const baseUrl = '/api/login';
const Key = 'currentUser';

// const login = async (credentials) => {
//   const { data } = await axios.post(baseUrl, credentials);
//   return data;
// };

const logout = () => {
  window.localStorage.removeItem(Key);
};

const setUser = (user) => {
  if (user) {
    window.localStorage.setItem(Key, JSON.stringify(user));
  }
};

const getUser = () => {
  const userString = window.localStorage.getItem(Key);
  return userString && userString !== 'undefined' && JSON.parse(userString);
};

const loginService = { logout, setUser, getUser };

export default loginService;
