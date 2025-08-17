import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const API_URL = import.meta.env.VITE_NOTIFLOW_API_URL;
const API_KEY = import.meta.env.VITE_NOTIFLOW_API_KEY;

const EmotionalToneTrends = ( {trendType} ) => {
    const [data, setData] = useState([]);
    const [emotions, setEmotions] = useState([]);
    const [stats, setStats] = useState({});

    useEffect(() => {
            fetch(`${API_URL}/web/emotional-tone-trends?filter=${trendType}`, {
                method: "GET",
                headers: {
                    "X-API-Key": API_KEY,
                    "Content-Type": "application/json",
                },
                })
            .then((res) => res.json())
            .then((trends) => {
                console.log("Raw API Response:", trends);

                // Convert dictionary to list of objects
                const transformedData = {};
                const emotionStats = {};

                Object.keys(trends).forEach(date => {
                    const dailyData = { date };

                    Object.keys(trends[date]).forEach(emotion => {
                        const { count, avg_intensity, example_notification, matches } = trends[date][emotion];

                        // Store time-series data
                        dailyData[emotion] = count;

                        // Store emotion-level stats (single example notification, total count, avg intensity)
                        if (!emotionStats[emotion]) {
                            emotionStats[emotion] = {
                                total_count: 0,
                                total_intensity: 0,
                                example_notification,
                                matches  // Store matches array
                            };
                        }
                        emotionStats[emotion].total_count += count;
                        emotionStats[emotion].total_intensity += avg_intensity;
                    });

                    transformedData[date] = dailyData;
                });

                // Calculate the final average intensity per emotion
                Object.keys(emotionStats).forEach(emotion => {
                    const { total_count, total_intensity } = emotionStats[emotion];
                    emotionStats[emotion].avg_intensity = (total_intensity / total_count).toFixed(2);
                });

                console.log("Transformed Data for Recharts:", Object.values(transformedData));
                console.log("Emotion Stats:", emotionStats);

                setData(Object.values(transformedData));
                setEmotions(Object.keys(emotionStats));
                setStats(emotionStats);
                console.log(emotionStats)
            })
            .catch((error) => console.error("Error fetching emotional tone trends:", error));
    }, [trendType]);

    const highlightMatches = (text, matches) => {
        if (!text || !matches || matches.length === 0) return text;
    
        // Escape special characters in matches to avoid regex errors
        const escapedMatches = matches.map(match => match.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'));
    
        // Create a regex to match whole words AND phrases (multi-word matches)
        const regex = new RegExp(`(${escapedMatches.join("|")})`, "gi");
    
        // Replace matched words with highlighted span
        return text.split(regex).map((part, index) =>
            escapedMatches.some(match => part.toLowerCase() === match.toLowerCase()) ? (
                <span key={index} className="bg-pink-200 px-1 rounded-md text-black">{part}</span>
            ) : (
                part
            )
        );
    };
    

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {emotions.map((emotion, index) => (
                <div key={emotion} className="bg-white p-4 rounded-xl shadow-md">
                    <div className="grid grid-cols-2">
                        <h2 className="text-lg font-bold text-left mb-2">{emotion}</h2>
                        <div className="grid grid-cols-2">
                            <h4 className="text-xs text-right font-bold text-blue-500 m-2">Volume: {stats[emotion]?.total_count.toLocaleString()}</h4>
                            <h4 className="text-xs text-left font-bold text-pink-500 m-2">Intensity: {stats[emotion]?.avg_intensity}</h4>
                        </div>
                    </div>
                    
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis 
                                dataKey="date"
                                tickFormatter={(tick) => new Date(tick).toLocaleString('en-US', { month: 'short' })} 
                                tick={{ fill: "#fed7aa", fontSize: 12 }}  // Tick color (blue) and font size
                                axisLine={{ stroke: "#fed7aa", strokeWidth: 2 }}
                                tickLine={{ stroke: "#fed7aa", strokeWidth: 2 }}
                                />

                            <Line
                                type="monotone"
                                dataKey={emotion}
                                stroke={"#ff9800"}
                                strokeWidth={3}
                                dot={{ r: 3 }}
                            />

                        </LineChart>
                    </ResponsiveContainer>
                    <div className="p-5 text-ellipsis whitespace-normal line-clamp-5 text-justify">{highlightMatches(stats[emotion]?.example_notification, stats[emotion]?.matches)}</div>
                </div>
            ))}
        </div>
    );
};

export default EmotionalToneTrends;
