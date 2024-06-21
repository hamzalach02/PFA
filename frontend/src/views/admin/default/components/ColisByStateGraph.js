import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Flex, Text } from '@chakra-ui/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Cookies from 'js-cookie';

const ColisByStateGraph = () => {
    const [colisData, setColisData] = useState([]);

    useEffect(() => {
        const fetchColisData = async () => {
            try {
                const token = getToken();
                const response = await axios.get('http://127.0.0.1:8000/api/ColisByState', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setColisData(response.data);
            } catch (error) {
                console.error('Error fetching colis data:', error);
            }
        };

        fetchColisData();
    }, []);

    const data = colisData.map(item => ({
        state: item.state,
        count: item.count
    }));

    return (
        <Flex direction="column" alignItems="center">
            <Text fontSize="xl" mb={4}>Packages Statistics by status</Text>
            <ResponsiveContainer width="80%" height={400}>
                <BarChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="state" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>
        </Flex>
    );
};

export default ColisByStateGraph;

const getToken = () => {
    const token = Cookies.get('token');
    if (!token) {
        console.error('JWT token not found in cookies');
        return '';
    }
    return token;
};