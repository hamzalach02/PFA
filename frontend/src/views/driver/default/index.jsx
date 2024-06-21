// Chakra imports
import {
  Box,
  useColorModeValue,
  Text,
} from "@chakra-ui/react";
// Assets
import Usa from "assets/img/dashboards/usa.png";
import React, { useState, useEffect } from "react";

export default function UserReports() {
  // Chakra Color Mode
  const brandColor = useColorModeValue("brand.500", "white");
  const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");

  // State to manage animation
  const [textToShow, setTextToShow] = useState('');

  // Text to animate
  const textToAnimate = "Welcome back dear driver!";

  // Function to simulate letter-by-letter animation
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTextToShow(prevText => prevText + textToAnimate[index]);
      index++;
      if (index === textToAnimate.length) clearInterval(interval);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      pt={{ base: "130px", md: "80px", xl: "80px" }}
      bg="white"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="50vh"
    >
      <Text
        fontSize="4xl"
        fontWeight="bold"
        color="#4e88a0"
        textAlign="center"
        fontFamily="Arial, sans-serif"
      >
        {textToShow}
      </Text>
    </Box>
  );
}
