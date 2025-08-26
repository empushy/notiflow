import { Ticks } from "chart.js";
import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";

const API_URL = import.meta.env.VITE_NOTIFLOW_API_URL;
const API_KEY = import.meta.env.VITE_NOTIFLOW_API_KEY;

const EmotionalToneHeatmap = () => {
  const [series, setSeries] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/web/emotional-tone-trends`, {
      headers: {
        "X-API-Key": API_KEY,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((trends) => {
        // Extract sorted dates and limit to last 45 for clarity
        const allDates = Object.keys(trends).sort();
        const dates = allDates.slice(-45);

        // Get all unique emotions
        const emotionSet = new Set();
        dates.forEach((date) => {
          Object.keys(trends[date]).forEach((emotion) =>
            emotionSet.add(emotion)
          );
        });
        const allEmotions = Array.from(emotionSet);

        // Compute sum for each emotion (using limited dates)
        const emotionSums = allEmotions.map((emotion) => ({
          emotion,
          sum: dates.reduce(
            (acc, date) => acc + (trends[date][emotion]?.count ?? 0),
            0
          ),
        }));

        // Sort emotions by sum descending, pick top 6
        const topEmotions = emotionSums
          .sort((a, b) => b.sum - a.sum)
          .slice(0, 6)
          .map((e) => e.emotion);

        // Build series: one per emotion, value per date
        const heatmapSeries = topEmotions.map((emotion) => ({
          name: emotion,
          data: dates.map((date) => trends[date][emotion]?.count ?? 0),
        }));

        setSeries(heatmapSeries);
        setCategories(
          dates.map((date) => {
            const d = new Date(date);
            return d.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
          })
        );
      })
      .catch((error) => console.error("Error fetching heatmap data:", error));
  }, []);

  // Adjust color ranges to your actual data distribution
  const options = {
    chart: {
      type: "heatmap",
      toolbar: { show: false },
      animations: { enabled: true },
      fontFamily: "inherit",
    },
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.7,
        radius: 4,
        useFillColorAsStroke: true,
        colorScale: {
          ranges: [
            { from: 0, to: 59, color: "#e3f2fd" },
            { from: 60, to: 119, color: "#90caf9" },
            { from: 120, to: 199, color: "#42a5f5" },
            { from: 200, to: 399, color: "#1565c0" },
            { from: 400, to: 99999, color: "#002f6c" },
          ],
        },
      },
    },
    dataLabels: { enabled: false },
    stroke: { width: 1, colors: ["#fff"] },
    grid: { padding: { left: 18, right: 18, bottom: 14 }, show: false },
    xaxis: {
      categories,
      labels: {
        rotate: -45,
        rotateAlways: true,
        style: { fontSize: "11px" },
        hideOverlappingLabels: true,
        trim: true,
      },
      tooltip: { enabled: false },
    },
    yaxis: {
      reversed: true,
      labels: {
        style: { fontWeight: 700, fontSize: "15px", color: "#222" },
      },
    },
    tooltip: {
      y: {
        formatter: (value) => `Count: ${value}`,
      },
      style: { fontSize: "13px" },
    },
    legend: { show: true },
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900">
        Emotional Tone Heatmap
      </h2>
      <Chart options={options} series={series} type="heatmap" height={350} />
    </div>
  );
};

export default EmotionalToneHeatmap;
