import React, { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import LeaveForecastPage from "./LeaveForecastPage";
import AddTimeSheet from "./AddTimeSheet";

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event:any, newValue:any) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      {/* Tabs Header */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        aria-label="User Dashboard Tabs"
      >
        <Tab label="Citi Compliance" />
        <Tab label="Leave Forecast" />
      </Tabs>

      {/* Tabs Content */}
      <Box mt={2}>
        {activeTab === 0 && <AddTimeSheet />}
        {activeTab === 1 && <LeaveForecastPage />}
      </Box>
    </Box>
  );
};

export default UserDashboard;
