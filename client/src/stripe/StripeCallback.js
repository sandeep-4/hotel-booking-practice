import React, { useEffect } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { getAccountStatus } from "../actions/stripe";
import { updateUserInLocalStorage } from "../actions/auth";

const StripeCallback = ({ history }) => {
  const { auth } = useSelector((state) => ({ ...state }));
  const dispatch = useDispatch();

  useEffect(() => {
    if (auth && auth.token) accountStatus();
  }, [auth]);

  const accountStatus = async () => {
    try {
      const res = await getAccountStatus(auth.token);
      updateUserInLocalStorage(res.data, () => {
        dispatch({
          type: "LOGGED_IN_USER",
          payload: res.data,
        });
        window.location.href = "/dashboard/seller";
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="d-flex justify-content-center p-5">
      <LoadingOutlined className="display-1 p-5 text-danger" />
    </div>
  );
};

export default StripeCallback;
