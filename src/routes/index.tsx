import React from "react";
import { Routes, Route } from "react-router-dom";
import { withFallback } from "./withFallback";

const LandingPage = withFallback(React.lazy(() => import("~/pages/Customers")));

const RenderRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
    </Routes>
  );
};

export default RenderRouter;
