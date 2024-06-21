import React, { useEffect, useState } from 'react';
import { Box, Heading } from '@chakra-ui/react';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTooltip } from 'victory';
import Cookies from 'js-cookie';

const ColisMonthlyStatsGraph = () => {
  const [colisStats, setColisStats] = useState([]);
  const token = Cookies.get('token');

  useEffect(() => {
    // Fetch colis statistics data from your API endpoint
    fetchColisStats();
  }, []);

  const fetchColisStats = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/ColisMonthlyStats', {
        headers: {
          Authorization: `Bearer ${token}`, // Include JWT token in the Authorization header
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch colis statistics');
      }
      const data = await response.json();
      setColisStats(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box>
      <Heading size="md" mb={2} textAlign="center">Added Packages Each Day This Month</Heading>
      <VictoryChart height={200} padding={{ top: 20, bottom: 50, left: 50, right: 20 }}>
        <VictoryAxis
          tickFormat={(tick) => {
            if (typeof tick === 'string') {
              const [month, day] = tick.split(" ");
              return `${month.substring(0, 3)} ${day}`;
            }
            return tick;
          }}
          style={{ tickLabels: { fontSize: 4, padding: 2 } }}
        />
        <VictoryAxis dependentAxis label="Number of Packages" style={{ axisLabel: { padding: 35 ,fontSize : 8} }} />
        <VictoryBar
          data={colisStats}
          x="month_day"
          y="count"
          labels={({ datum }) => `${datum.count}`}
          labelComponent={<VictoryTooltip />} 
          style={{
            data: { fill: "#3182CE" }, 
            labels: { fontSize: 6, fill: "#3182CE" }
          }}
        />
      </VictoryChart>
    </Box>
  );
};

export default ColisMonthlyStatsGraph;