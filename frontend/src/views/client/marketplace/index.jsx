import React, { useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  Select,
  Divider,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import axios from 'axios';
import Cookies from 'js-cookie'; // Importing js-cookie library

export default function Marketplace() {
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [weight, setWeight] = useState('');
  const [items, setItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sourceLocation, setSourceLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [clientID, setClientID] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [receiverFirstName, setReceiverFirstName] = useState('');
  const [receiverLastName, setReceiverLastName] = useState('');
  const [receiverPhoneNumber, setReceiverPhoneNumber] = useState('');
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState('');
  const [estimatedDistance, setEstimatedDistance] = useState('');
  const [source, setSource] = useState('');

  const handleAddItem = () => {
    setItems([...items, { name: title, weight: parseFloat(weight), category }]);
    setTitle('');
    setWeight('');
    setCategory('');
  };

  const handleDeleteItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const getCoordinates = async (address) => {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          q: address,
          format: 'json',
        },
      });
      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
        return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
      } else {
        throw new Error('Coordinates not found');
      }
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      throw error;
    }
  };

  const calculateDistance = (sourceCoords, destinationCoords) => {
    const earthRadius = 6371; // Earth's radius in km
    const dLat = degreesToRadians(destinationCoords.latitude - sourceCoords.latitude);
    const dLon = degreesToRadians(destinationCoords.longitude - sourceCoords.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(degreesToRadians(sourceCoords.latitude)) * Math.cos(degreesToRadians(destinationCoords.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadius * c;
    return distance.toFixed(2); // Distance in kilometers, rounded to 2 decimal places
  };

  const degreesToRadians = (degrees) => {
    return degrees * (Math.PI / 180);
  };

  const calculateEstimatedDeliveryTime = (distance) => {
    const averageSpeed = 50; // km/h
    const timeInHours = distance / averageSpeed;
    const timeInDays = timeInHours / 24;
    const minMargin = 1;
    const maxMargin = 4;
    const marginInDays = Math.floor(Math.random() * (maxMargin - minMargin + 1)) + minMargin; // Random margin between 1 and 4 days
    const totalDays = Math.ceil(timeInDays + marginInDays);
    const minDays = Math.ceil(timeInDays + minMargin);
    const maxDays = Math.ceil(timeInDays + maxMargin);
    const estimatedDeliveryTime = `between ${minDays} and ${maxDays} days`;
    const output = `${estimatedDeliveryTime} (${totalDays} days)`;
    return output.length <= 50 ? output : estimatedDeliveryTime;
  };
  


  const handleCheckout = () => {
    setIsModalOpen(true);
  };

  const handleConfirmCheckout = async () => {
    try {
      const sourceCoords = await getCoordinates(sourceLocation);
      const destinationCoords = await getCoordinates(destination);
      const distance = calculateDistance(sourceCoords, destinationCoords);
      setEstimatedDistance(distance);

      const estimatedDeliveryTime = calculateEstimatedDeliveryTime(distance);
      setEstimatedDeliveryTime(estimatedDeliveryTime);

      const packageData = {
        date: "2024-05-21",
        state: "pending",
        destination,
        currentPlace: "Current Place of Colis",
        driver_id: 0,
        products: items.map((item) => ({
          poids: item.weight,
          description: item.name,
          category: item.category
        })),
        receiver_first_name: receiverFirstName,
        receiver_last_name: receiverLastName,
        receiver_phone_number: receiverPhoneNumber,
        estimated_delivery_time: estimatedDeliveryTime,
        estimated_price: estimatedPrice,
        source: sourceLocation,
        total_weight : totalWeight
      };

      const token = Cookies.get('token');
      if (!token) {
        console.error('No token found in cookies');
        return;
      }

      const response = await axios.post('http://localhost:8000/api/createcolis', packageData, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      const colisId = response.data.id;

      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        const imageUploadResponse = await axios.post(`http://localhost:8000/api/addimagecolis/${colisId}/`, formData);

        console.log('Image uploaded successfully:', imageUploadResponse.data.image_url);
        handleCloseModal();
      }

      setItems([]);
      setDestination('');
      setReceiverFirstName('');
      setReceiverLastName('');
      setReceiverPhoneNumber('');
      setImageFile(null);
    } catch (error) {
      console.error('Error adding package:', error);
      if (error.response) {
        console.error('Server response:', error.response.data);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const totalWeight = items.reduce((acc, item) => acc + item.weight, 0);
  const estimatedPrice = totalWeight * 12; 
  const totalItems = items.length;

  return (
    <Flex>
      {/* Left Card - Form */}
      <Box flex="1" p="4" bg="white" borderRadius="md" boxShadow="md" style={{ marginTop: "140px" }}>
        <VStack spacing="4">
          <Text fontSize="xl">Add Item</Text>
          <Select
            placeholder="Select Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Medications">Medications</option>
            <option value="Food">Food</option>
            <option value="Books and Documents">Books and Documents</option>
            <option value="Engines or Mechanical Pieces">Engines or Mechanical Pieces</option>
            <option value="Clothes and Beauty">Clothes and Beauty</option>
            <option value="Electronics">Electronics</option>
            <option value="Fournitures and similar objects">Fournitures and similar objects</option>

          </Select>
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            placeholder="Weight"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
          <Button colorScheme="blue" onClick={handleAddItem}>
            Add
          </Button>
        </VStack>
      </Box>
      {/* Right Card - List of Items */}
      <Box
        flex="1"
        p="4"
        bg="white"
        borderRadius="md"
        boxShadow="md"
        ml="4"
        style={{ marginTop: "140px" }}
      >
        <Text fontSize="xl" mb="2">
          Package
        </Text>
        <Divider my="2" />
        <VStack align="stretch" spacing="2">
          {items.map((item, index) => (
            <Flex
              key={index}
              bg="gray.100"
              p="2"
              borderRadius="md"
              boxShadow="sm"
              justifyContent="space-between"
              alignItems="center"
            >
              <VStack align="start">
                <Text fontWeight="bold">{item.name}</Text>
                <Text>Category: {item.category}</Text>
                <Text>Weight: {item.weight}</Text>
              </VStack>
              <Button
                colorScheme="red"
                size="sm"
                onClick={() => handleDeleteItem(index)}
              >
                Delete
              </Button>
            </Flex>
          ))}
        </VStack>
        <Divider my="2" />
        <Text>Total Items: {totalItems}</Text>
        <Text>Total Weight: {totalWeight} kg</Text>
        <Text>Estimated Price: MAD {estimatedPrice}</Text>
        <Button
          mt="4"
          colorScheme="green"
          onClick={handleCheckout}
          isDisabled={items.length === 0}
        >
          Checkout
        </Button>
      </Box>
      {/* Checkout Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Checkout</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Source Location"
              value={sourceLocation}
              onChange={(e) => setSourceLocation(e.target.value)}
              mb="4"
            />
            <Input
              placeholder="Destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              mb="4"
            />
            <Input
              placeholder="Receiver's First Name"
              value={receiverFirstName}
              onChange={(e) => setReceiverFirstName(e.target.value)}
              mb="4"
            />
            <Input
              placeholder="Receiver's Last Name"
              value={receiverLastName}
              onChange={(e) => setReceiverLastName(e.target.value)}
              mb="4"
            />
            <Input
              placeholder="Receiver's Phone Number"
              value={receiverPhoneNumber}
              onChange={(e) => setReceiverPhoneNumber(e.target.value)}
              mb="4"
            />
            <Input
              type="file"
              accept="image/*"
              mb="4"
              onChange={(e) => setImageFile(e.target.files[0])} // Store the selected image file
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleCloseModal}>
              Close
            </Button>
            <Button colorScheme="green" onClick={handleConfirmCheckout}>
              Confirm Checkout
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}
