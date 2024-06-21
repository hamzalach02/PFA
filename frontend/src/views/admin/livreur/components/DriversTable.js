import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Button,
} from '@chakra-ui/react';

import './DriversTable.css'; // Import custom CSS file for styling

const DriversTable = () => {
  const [drivers, setDrivers] = useState([]);
  const [editMode, setEditMode] = useState(null);
  const [formData, setFormData] = useState({});

  const fetchDrivers = async () => {
    try {
      const token = Cookies.get('token');
      const response = await axios.get('http://127.0.0.1:8000/api/admindrivers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDrivers(response.data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = Cookies.get('token');
      await axios.delete(`http://127.0.0.1:8000/api/delete-driver/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDrivers(drivers.filter(driver => driver.id !== id));
    } catch (error) {
      console.error('Error deleting driver:', error);
    }
  };

  const handleEdit = (driver) => {
    setEditMode(driver.id);
    setFormData(driver);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    try {
      const token = Cookies.get('token');
      await axios.put(`http://127.0.0.1:8000/api/update-driver/${formData.id}/`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditMode(null);
      fetchDrivers();
    } catch (error) {
      console.error('Error updating driver:', error);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  return (
    <Table variant="simple" className="drivers-table">
    <Thead>
      <Tr>
        <Th>First Name</Th>
        <Th>Last Name</Th>
        <Th>Email</Th>
        <Th>CIN</Th>
        <Th>Phone Number</Th>
        <Th>License Number</Th>
        <Th>Vehicle Number</Th>
        <Th>Action</Th>
      </Tr>
    </Thead>
    <Tbody>
      {drivers.map((driver) => (
        <Tr key={driver.id}>
          <Td>{editMode === driver.id ? (
            <Input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
            />
          ) : (
            driver.first_name
          )}</Td>
          <Td>{editMode === driver.id ? (
            <Input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
            />
          ) : (
            driver.last_name
          )}</Td>
          <Td>{editMode === driver.id ? (
            <Input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          ) : (
            driver.email
          )}</Td>
          <Td>{editMode === driver.id ? (
            <Input
              type="text"
              name="cin"
              value={formData.cin}
              onChange={handleChange}
            />
          ) : (
            driver.cin
          )}</Td>
          <Td>{editMode === driver.id ? (
            <Input
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
            />
          ) : (
            driver.phone_number
          )}</Td>
          <Td>{editMode === driver.id ? (
            <Input
              type="text"
              name="license_number"
              value={formData.license_number}
              onChange={handleChange}
            />
          ) : (
            driver.license_number
          )}</Td>
          <Td>{editMode === driver.id ? (
            <Input
              type="text"
              name="vehicle_number"
              value={formData.vehicle_number}
              onChange={handleChange}
            />
          ) : (
            driver.vehicle_number
          )}</Td>
        
          <Td className="action-buttons">{editMode === driver.id ? (
            <Button onClick={handleSave} colorScheme="blue">Save</Button>
          ) : (
            <>
              <Button onClick={() => handleEdit(driver)} colorScheme="blue">Edit</Button>
              <Button colorScheme="red" onClick={() => handleDelete(driver.id)}>Delete</Button>
            </>
          )}</Td>
        </Tr>
      ))}
    </Tbody>
  </Table>
  );
};

export default DriversTable;