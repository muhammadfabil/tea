import { useContext } from "react";
import { AuthContext } from "./AuthContext"; // ✅ Sesuaikan path

const useAuth = () => {
  return useContext(AuthContext);
};

export default useAuth;
