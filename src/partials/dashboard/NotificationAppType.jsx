import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import EditMenu from '../../components/DropdownEditMenu';
import { Link } from 'react-router-dom';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF6384'];

const API_URL = import.meta.env.VITE_NOTIFLOW_API_URL;
const API_KEY = import.meta.env.VITE_NOTIFLOW_API_KEY;

const NotificationAppType = () => {
  const [categoryData, setCategoryData] = useState([]);

  // Fetch data from the backend API
  useEffect(() => {
    fetch(`${API_URL}/api/app-type-data`, {
          method: "GET",
          headers: {
            "X-API-Key": API_KEY,
            "Content-Type": "application/json",
          },
        })
      .then((response) => response.json())
      .then((data) => {
        setCategoryData(data);
      })
      .catch((error) => console.error('Error fetching category data:', error));
  }, []);

  const renderCustomizedLabel = ({ type, count }) => {
    const percentage = ((count / totalCount) * 100).toFixed(0); // Calculate percentage and round to 0 decimals
    return `${type} (${percentage}%)`; // Display app type and percentage with a % sign
  };

  return (
    <div className="flex flex-col col-span-full sm:col-span-8 xl:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
      <div className="px-5 pt-5">
        <header className="flex justify-between items-start mb-2">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Acme Plus</h2>
          {/* Menu button */}
          <EditMenu align="right" className="relative inline-flex">
            <li>
              <Link className="font-medium text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200 flex py-1 px-3" to="#0">
                Option 1
              </Link>
            </li>
            <li>
              <Link className="font-medium text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200 flex py-1 px-3" to="#0">
                Option 2
              </Link>
            </li>
            <li>
              <Link className="font-medium text-sm text-red-500 hover:text-red-600 flex py-1 px-3" to="#0">
                Remove
              </Link>
            </li>
          </EditMenu>
        </header>
      </div>
      {/* Responsive Pie chart */}
      <div className="max-sm:max-h-[250px] xl:max-h-[250px] px-8">
        {categoryData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="count"           // "count" field from your data
                nameKey="type"            // "type" field from your data
                startAngle={180}          // Adjust the start angle for layout
                endAngle={0}              // Adjust the end angle for layout
                cx="50%"                  // X center
                cy="50%"                  // Y center
                outerRadius={145}         // Size of the chart
                fill="#8884d8"            // Default color
                label={({ name, count }) => `${name} (${(count*100).toFixed(0)}%)`} // Custom label function to show names and counts
                labelLine={false}          // Disable the label line for cleaner look
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p>Loading app type data...</p>
        )}
      </div>
    </div>
  );
};

export default NotificationAppType;
