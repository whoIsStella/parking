"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface EarningsChartProps {
  data: { month: string; earnings: number }[];
}

const EarningsChart: React.FC<EarningsChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="earnings" fill="#6366f1" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default EarningsChart;
