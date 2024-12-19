import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import EditMenu from '../../components/DropdownEditMenu';
import { Link } from 'react-router-dom';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF6384'];

const API_URL = import.meta.env.VITE_NOTIFLOW_API_URL;

const NotificationVolume = () => {
  const [volumeData, setVolumeData] = useState([]);

  // Fetch data from the backend API
  useEffect(() => {
    fetch(`${API_URL}/api/volume_data`) // Replace with your API endpoint
      .then((response) => response.json())
      .then((data) => {
        setVolumeData(data);
      })
      .catch((error) => console.error('Error fetching volume data:', error));
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
      {/* Responsive Line chart */}
      <div className="max-sm:max-h-[250px] xl:max-h-[250px] pr-8">
        {volumeData.length > 0 ? (
           <ResponsiveContainer width="100%" height={220}>
           <LineChart data={volumeData} margin={{ left: 0, right: 25, bottom: 40, top: 0 }}>
             {/* Place the Legend above the chart */}
             <Legend
               layout="horizontal" // Set legend layout to horizontal
               align="right"       // Center the legend above the chart
               verticalAlign="top"  // Place it at the top of the chart
               wrapperStyle={{
                 fontSize: '12px',   // Adjust font size
                 marginBottom: '10px', // Add spacing between legend and chart
               }}
             />
             <CartesianGrid strokeDasharray="3 3" />
             <XAxis dataKey="date" angle={65} textAnchor="start" tick={{ fontSize: 10 }} />
             <YAxis tick={{ fontSize: 10 }} />
             <Tooltip />
             <Line type="monotone" dataKey="notifications" stroke={COLORS[0]} />
           </LineChart>
         </ResponsiveContainer>
        ) : (
          <p>Loading notification volume data...</p>
        )}
      </div>
    </div>
  );
};

export default NotificationVolume;
