import React from "react";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  return <>{children}</>;
};

export default ProtectedRoute;

