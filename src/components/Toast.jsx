import { Toast as BsToast, ToastContainer } from "react-bootstrap"

function Toast({ message }) {
  return (
    <ToastContainer position="bottom-end" className="position-fixed p-3">
      <BsToast show={Boolean(message)} bg="dark" className="text-white" role="status">
        <BsToast.Body>{message}</BsToast.Body>
      </BsToast>
    </ToastContainer>
  )
}

export default Toast
