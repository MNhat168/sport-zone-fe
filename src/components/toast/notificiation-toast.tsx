import { Flip, toast, ToastContainer } from "react-toastify";
import { CircleCheck, CircleAlert } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

export const CustomToast = () => {
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={2000}
      hideProgressBar={false} // Changed to false to show progress bar
      newestOnTop={true}
      closeOnClick={false}
      closeButton={false}
      rtl={false}
      pauseOnFocusLoss
      pauseOnHover
      transition={Flip}
      style={{
        fontSize: "14px",
        fontWeight: "500",
        fontFamily: "system-ui, -apple-system, sans-serif",
        zIndex: 9999
      }}
      toastStyle={{
        backgroundColor: "white",
        color: "#333",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        borderRadius: "8px",
        padding: "12px 16px",
        margin: "8px 0"
      }}
      containerId="global-toast"
    />
  );
};

export const CustomSuccessToast = (msg: any) => {
  return toast.success(msg, {
    position: "bottom-right",
    autoClose: 2000,
    hideProgressBar: false, // Show progress bar
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    icon: <CircleCheck size={22} color="#10B981" />,
    style: {
      backgroundColor: "#ECFDF5",
      color: "#065F46",
      borderLeft: "4px solid #10B981"
    },
    containerId: 'global-toast'
  });
};

export const CustomFailedToast = (msg: any) => {
  return toast.error(msg, {
    position: "bottom-right",
    autoClose: 2000,
    hideProgressBar: false, // Show progress bar
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    icon: <CircleAlert size={22} color="#EF4444" />,
    style: {
      backgroundColor: "#FEF2F2",
      color: "#991B1B",
      borderLeft: "4px solid #EF4444"
    },
    containerId: 'global-toast'
  });
};
