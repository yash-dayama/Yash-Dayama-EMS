import React from "react";
import { Spinner } from "react-bootstrap";

const LoadingSpinner = ({
  size = "lg",
  variant = "primary",
  centered = true,
  overlay = false,
  message = "Loading...",
}) => {
  const spinnerElement = (
    <div
      className={`d-flex flex-column align-items-center ${
        centered ? "justify-content-center" : ""
      }`}
    >
      <Spinner
        animation="border"
        variant={variant}
        size={size}
        role="status"
        aria-hidden="true"
      />
      {message && <div className="mt-2 text-muted">{message}</div>}
    </div>
  );

  if (overlay) {
    return (
      <div
        className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          zIndex: 9999,
        }}
      >
        {spinnerElement}
      </div>
    );
  }

  if (centered) {
    return (
      <div className="min-h-100vh d-flex align-items-center justify-content-center">
        {spinnerElement}
      </div>
    );
  }

  return spinnerElement;
};

export default LoadingSpinner;
