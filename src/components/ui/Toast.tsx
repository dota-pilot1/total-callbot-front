import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// react-toastify를 사용한 간단한 래퍼 훅
export function useToast() {
  const showToast = (
    message: string,
    type: "info" | "success" | "warning" | "error" = "info",
    duration = 2000,
  ) => {
    const options = {
      position: "top-center" as const,
      autoClose: duration,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    };

    switch (type) {
      case "success":
        toast.success(message, options);
        break;
      case "error":
        toast.error(message, options);
        break;
      case "warning":
        toast.warning(message, options);
        break;
      default:
        toast.info(message, options);
        break;
    }
  };

  // react-toastify의 ToastContainer를 그대로 export
  const ToastContainerComponent = () => (
    <ToastContainer
      position="top-center"
      autoClose={2000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      style={{ zIndex: 9999 }}
    />
  );

  return { showToast, ToastContainer: ToastContainerComponent };
}
