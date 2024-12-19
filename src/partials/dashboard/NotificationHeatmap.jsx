import React, { useEffect, useState } from 'react';
import { HeatMapGrid } from 'react-grid-heatmap';
import EditMenu from '../../components/DropdownEditMenu';
import { Link } from 'react-router-dom';

const NotificationHeatmap = () => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [maxValue, setMaxValue] = useState(1);
  const [topHotCells, setTopHotCells] = useState([]); // Stores the top 5 hottest cells
  const [topColdCells, setTopColdCells] = useState([]); // Stores the top 20 coldest cells

  // Fetch data from the back-end API
  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/heatmap_data')
      .then((response) => response.json())
      .then((data) => {
        // Transform the data to create a 2D array where each row is a day and each column is an hour
        const formattedData = Array.from({ length: 7 }, (_, day) => {
          return Array.from({ length: 24 }, (_, hour) => data[day]?.[hour] || 0);  // Notification count
        });

        setHeatmapData(formattedData);

        // Calculate the maximum value for color scaling
        const maxVal = Math.max(...formattedData.flat());
        setMaxValue(maxVal > 0 ? maxVal : 1); // Ensure maxValue is at least 1 to avoid division by zero

        // Get top 5 hottest and top 20 coldest cells
        findTopCells(formattedData);
      })
      .catch((error) => console.error('Error fetching heatmap data:', error));
  }, []);

  // Function to find the top 5 hottest and 20 coldest cells
  const findTopCells = (data) => {
    const allCells = [];
    data.forEach((dayData, dayIdx) => {
      dayData.forEach((count, hourIdx) => {
        allCells.push({ count, dayIdx, hourIdx });
      });
    });

    // Sort cells by count, in descending order for hottest and ascending for coldest
    const sortedCells = [...allCells].sort((a, b) => b.count - a.count);

    // Get top 5 hottest cells
    const topHot = sortedCells.slice(0, 5);
    setTopHotCells(topHot);

    // Get top 20 coldest cells (from the end of the sorted list)
    const topCold = sortedCells.slice(-20);
    setTopColdCells(topCold);
  };

  // Function to map notification counts to a color scale (smooth gradient from blue to red)
  const getColor = (value) => {
    if (value === 0) {
      return 'rgba(0, 0, 255, 1)'; // Pure blue for zero notifications
    }

    const intensity = value / maxValue; // Normalize the notification count to be between 0 and 1

    // Blue for low values, Red for high values, transition in between
    const red = Math.floor(intensity * 255); // Red increases with higher intensity
    const blue = Math.floor((1 - intensity) * 255); // Blue decreases with higher intensity

    return `rgba(${red}, 0, ${blue}, 1)`;  // Smooth gradient from blue (low) to red (high)
  };

  // Check if the current cell should have a fire or snowflake emoji
  const getEmoji = (dayIdx, hourIdx) => {
    const isHot = topHotCells.some(cell => cell.dayIdx === dayIdx && cell.hourIdx === hourIdx);
    const isCold = topColdCells.some(cell => cell.dayIdx === dayIdx && cell.hourIdx === hourIdx);

    if (isHot) return '🔥';
    if (isCold) return '❄️';
    return ''; // No emoji for this cell
  };

  return (
    <div className="flex flex-col col-span-full bg-white dark:bg-gray-800 shadow-sm rounded-xl">
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
      {/* Heatmap chart */}
      <div className="grow max-sm:max-h-[250px] xl:max-h-[250px] px-8 pb-8">
        {heatmapData.length > 0 ? (
          <HeatMapGrid
            data={heatmapData}  // Data contains notification counts
            xLabels={[...Array(24).keys()]}  // Hours 0 to 23
            yLabels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}  // Days of the week
            cellStyle={(dayIdx, hourIdx) => {
              const notificationCount = heatmapData[dayIdx][hourIdx];  // Get the notification count for each cell
              const emoji = getEmoji(dayIdx, hourIdx);  // Get the appropriate emoji (fire or snowflake)

              return {
                background: getColor(notificationCount),  // Set background color based on notification count
                fontSize: '14px',  // Adjust font size
                color: '#fff',  // White text for good contrast
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              };
            }}
            cellContent={(dayIdx, hourIdx) => {
              const notificationCount = heatmapData[dayIdx][hourIdx];
              const emoji = getEmoji(dayIdx, hourIdx);
              return `${notificationCount} ${emoji}`;  // Show notification count and emoji inside the cell
            }}
            cellHeight="30px"
            xLabelsPos="top"
            yLabelsPos="left"
            xLabelsStyle={(index) => ({
              color: index % 2 === 0 ? 'black' : 'gray',
              fontSize: '12px',
            })}
            yLabelsStyle={() => ({
              fontSize: '12px',
              textTransform: 'uppercase',
              color: 'black',
            })}
          />
        ) : (
          <p>Loading heatmap data...</p>
        )}
      </div>
    </div>
  );
};

export default NotificationHeatmap;
