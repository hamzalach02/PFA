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

import './AdminClientView.css'; // Import CSS file for styling

const AdminClientView = () => {
  const [clients, setClients] = useState([]);
  const [editMode, setEditMode] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    current_place: '',
  });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = Cookies.get('token');
        const response = await axios.get('http://127.0.0.1:8000/api/adminclients', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClients(response.data);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };

    fetchClients();
  }, []);

  const handleEdit = (client) => {
    setEditMode(client.id);
    setFormData(client);
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
      await axios.put(`http://127.0.0.1:8000/api/update-client/${formData.id}/`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditMode(null);
      const updatedClients = clients.map(client =>
        client.id === formData.id ? formData : client
      );
      setClients(updatedClients);
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = Cookies.get('token');
      await axios.delete(`http://127.0.0.1:8000/api/delete-client/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClients(clients.filter(client => client.id !== id));
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  return (
    <div className="admin-client-view"> {/* Apply custom CSS class */}
      <h2>Client List</h2>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>First Name</Th>
            <Th>Last Name</Th>
            <Th>Email</Th>
            <Th>Phone Number</Th>
            <Th>Current Place</Th>
            <Th>Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {clients.map((client) => (
            <Tr key={client.id}>
              <Td>{editMode === client.id ? (
                <Input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              ) : (
                client.first_name
              )}</Td>
              <Td>{editMode === client.id ? (
                <Input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              ) : (
                client.last_name
              )}</Td>
              <Td>{editMode === client.id ? (
                <Input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              ) : (
                client.email
              )}</Td>
              <Td>{editMode === client.id ? (
                <Input
                  type="text"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                />
              ) : (
                client.phone_number
              )}</Td>
              <Td>{editMode === client.id ? (
                <Input
                  type="text"
                  name="current_place"
                  value={formData.current_place}
                  onChange={handleChange}
                />
              ) : (
                client.current_place
              )}</Td>
              <Td>
                {editMode === client.id ? (
                  <Button onClick={handleSave} colorScheme="blue" size="sm">Save</Button>
                ) : (
                  <>
                    <Button onClick={() => handleEdit(client)} colorScheme="blue" size="sm">Edit</Button>
                    <Button colorScheme="red" size="sm" onClick={() => handleDelete(client.id)}>Delete</Button>
                  </>
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </div>
  );
};

export default AdminClientView;