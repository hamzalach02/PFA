import React, { useState, useEffect } from "react";
import { Box, SimpleGrid, Text, Flex, Button } from "@chakra-ui/react";
import {
  MdLocalShipping,
  MdCheckCircle,
  MdHourglassEmpty,
} from "react-icons/md";
import Cookies from 'js-cookie';
import {jwtDecode} from 'jwt-decode';
import pdfFonts from "pdfmake/build/vfs_fonts";
import pdfMake from "pdfmake/build/pdfmake";
// Register the fonts
pdfMake.vfs = pdfFonts.pdfMake.vfs;


export default function Settings() {
  const [packages, setPackages] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const token = Cookies.get('token');
        if (!token) {
          console.error('No token found in cookies');
          return;
        }

        // Decode the JWT token to extract the user ID from its payload
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.id;
        console.log("id", userId);
        
        console.log('User ID:', userId);
        setUserId(userId);

        // Fetch all colis
        const response = await fetch("http://localhost:8000/api/drivercolis", {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        console.log(data);
        
        // Filter colis by driver_id
        const filteredData = data.filter(colis => String(colis.driver_id) === String(userId));
        setPackages(filteredData);
        console.log('Filtered Data:', filteredData);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchUserId();
  }, []);

  // Function to get appropriate icon based on state
  const getStateIcon = (state) => {
    switch (state) {
      case "waiting for pick up":
        return <MdLocalShipping />;
      case "picked up":
        return <MdCheckCircle />;
      default:
        return <MdHourglassEmpty />;
    }
  };

  // Handle button actions (dummy functions for now)
  const handleConfirmPickUp = (id) => {
    console.log(`Confirm pick up for package ID: ${id}`);
    // Implement the functionality to confirm pick up
  };

   // Function to handle pick up confirmation
   const handlePickUp = async (colisId) => {
    try {
      const token = Cookies.get('token');
      const response = await fetch("http://localhost:8000/api/pickcolis", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ colis: colisId }),
      });

      if (!response.ok) {
        throw new Error('Failed to pick up colis');
      }

      const data = await response.json();
      console.log('Pick up response:', data);

      // Update the state of the picked up colis in the UI
      setPackages(prevPackages =>
        prevPackages.map(packageItem =>
          packageItem.id === colisId
            ? { ...packageItem, state: 'picked up' }
            : packageItem
        )
      );

    } catch (error) {
      console.error('Error picking up colis:', error);
    }
  };

  const handleConfirmDelivery = async (id) => {
    console.log(`Confirm delivery for package ID: ${id}`);
    
    try {
      const token = Cookies.get('token');
      if (!token) {
        console.error('No token found in cookies');
        return;
      }

      const response = await fetch("http://localhost:8000/api/delivercolis", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ colis: id })
      });

      if (!response.ok) {
        throw new Error('Failed to confirm delivery');
      }

      const data = await response.json();
      console.log('Delivery confirmed:', data);

      // Update the state to reflect the change
      setPackages(prevPackages =>
        prevPackages.map(packageItem =>
          packageItem.id === id ? { ...packageItem, state: 'delivered' } : packageItem
        )
      );
    } catch (error) {
      console.error('Error confirming delivery:', error);
    }
  };




  const handleUploadSignedBonDeLivraison = (id) => {
    console.log(`Upload signed bon de livraison for package ID: ${id}`);
    // Implement the functionality to upload signed bon de livraison
  };
// Function to generate bon de livraison
const handleGenerateBonDeLivraison = async (packageItem) => {
  console.log(`Generate bon de livraison for package ID: ${packageItem.id}`);
  
  try {
    // Extracting data from packageItem
    const {
      id,
      date,
      source,
      destination,
      total_weight,
      receiver_first_name,
      receiver_last_name,
      receiver_phone_number,
    } = packageItem;

    // Check if packageItem is defined
    if (!packageItem) {
      console.error('Package item is undefined');
      return;
    }

    // Send data to the endpoint
    const token = Cookies.get('token');
    const response = await fetch("http://localhost:8000/api/generatebon", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ colis: packageItem.id })
    });

    if (!response.ok) {
      throw new Error('Failed to generate bon de livraison');
    }

    console.log('Bon de livraison generated successfully');

    // Define the document definition
    const documentDefinition = {
      content: [
        { text: 'Delivery Note', style: 'title' },
        { text: `Colis ID: ${id}`, style: 'section' },
        { text: `Date: ${date}`, style: 'section' },
        { text: `Source: ${source}`, style: 'section' },
        { text: `Destination: ${destination}`, style: 'section' },
        { text: `Total Weight: ${total_weight} kg`, style: 'section' },
        { text: 'Receiver Information:', style: 'subtitle' },
        { text: `Name: ${receiver_first_name} ${receiver_last_name}`, style: 'section' },
        { text: `Phone Number: ${receiver_phone_number}`, style: 'section' },
        { text: 'Statement:', style: 'subtitle' },
        { text: 'The driver has delivered the package to the receiver.', style: 'statement' },
        { text: 'The receiver has received the package from the driver.', style: 'statement' },
        { text: 'Signatures', style: 'subtitle' },
        { text: 'Driver\'s Signature: ____________________________________________', style: 'signature' },
        { text: 'Receiver\'s Signature: ____________________________________________', style: 'signature' },
      ],
      styles: {
        title: {
          fontSize: 24,
          marginBottom: 10,
        },
        subtitle: {
          fontSize: 18,
          marginTop: 15,
          marginBottom: 5,
        },
        section: {
          marginBottom: 10,
        },
        statement: {
          marginBottom: 5,
        },
        signature: {
          marginTop: 20,
        }
      },
    };

    // Generate the PDF
    pdfMake.createPdf(documentDefinition).open();
  } catch (error) {
    console.error('Error generating bon de livraison:', error);
  }
};


  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing="20px">
        {packages.map((packageItem) => (
          <Box
            key={packageItem.id}
            borderWidth="1px"
            borderRadius="xl"
            overflow="hidden"
            boxShadow="md"
            bg="white"
            p="4"
            transition="all 0.3s"
            _hover={{
              transform: "translateY(-4px)",
              shadow: "xl",
            }}
          >
            <Text fontSize="xl" fontWeight="bold" mb="2">
              {packageItem.date}
            </Text>
            <Text>
              <b>Source:</b> {packageItem.source}
            </Text>
            <Text>
              <b>Destination:</b> {packageItem.destination}
            </Text>
            <Text>
              <b>State:</b>{" "}
              <Flex alignItems="center">
                {getStateIcon(packageItem.state)}
                <Text ml="2">{packageItem.state}</Text>
              </Flex>
            </Text>
            <Text>
              <b>Weight:</b> {packageItem.total_weight} kg
            </Text>
            <Text>
              <b>Estimated Delivery Time:</b> {packageItem.estimated_delivery_time}
            </Text>
            <Text>
              <b>Receiver Name:</b> {packageItem.receiver_first_name} {packageItem.receiver_last_name} 
            </Text>
            <Text>
              <b>Receiver Phone:</b> {packageItem.receiver_phone_number} 
            </Text>
            {/* Add buttons based on the package state */}
            {packageItem.state === "waiting for pick up" && (
              <Button colorScheme="teal" onClick={() => handlePickUp(packageItem.id)}>
                Confirm Pick Up
              </Button>
            )}
          {packageItem.state === "picked up" && (
              <Button colorScheme="blue" onClick={() => handleConfirmDelivery(packageItem.id)}>
                Confirm Delivery
              </Button>
            )}
{packageItem.state === "delivered" && (
  <>
  <Button
              colorScheme="blue"
              size="md"
              width="100%"
              marginBottom="2"
              onClick={() => handleGenerateBonDeLivraison(packageItem)}
              backgroundColor="#4e88a0"
              _hover={{ backgroundColor: "#3c738b" }}
            >
              Generate Delivery Note
            </Button>

  
  </>
)}


          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}
