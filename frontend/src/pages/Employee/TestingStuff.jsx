import React from 'react'
import { Outlet } from "react-router-dom";
import { Loading } from "../../components/common/Loading";
import { FeaturesGrid } from "../../components/common/Card";
import { DashboardStats } from "../../components/common/card01";
import LoadingScreen from './LoadingScreen';

export const TestingStuff = () => {
  return (
   <div>
      {/* This layout just provides structure (no summary here) */}
      <LoadingScreen />
    </div>
  )
}
