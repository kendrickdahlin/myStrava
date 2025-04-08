"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

type IntervalGraphProps = {
  intervals: { duration: number, distance: number }[];
};

export default function IntervalGraph({ intervals }: IntervalGraphProps) {
  const formattedData = intervals.map((interval, index) => ({
    name: `Lap ${index + 1}`,
    Duration: (interval.duration / 60).toFixed(2), // Convert seconds to minutes
    Distance: (interval.distance / 1000).toFixed(2), // Convert meters to kilometers
  }));

  return (
    <div className="w-full h-72">
      <BarChart width={500} height={300} data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Duration" fill="#8884d8" />
        <Bar dataKey="Distance" fill="#82ca9d" />
      </BarChart>
    </div>
  );
}
