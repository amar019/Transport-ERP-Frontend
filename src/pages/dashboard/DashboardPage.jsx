import React from "react";
import { useSelector } from "react-redux";
import BookingDashboard from "./BookingDashboard";
import DeliveryDashboard from "./DeliveryDashboard";

export const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const branchType = user?.branch?.type || user?.branchType;

  if (branchType === "DELIVERY") {
    return <DeliveryDashboard />;
  }

  return <BookingDashboard />;
};

export default DashboardPage;
