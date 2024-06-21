import React from "react";

// Chakra imports
import { Flex, useColorModeValue } from "@chakra-ui/react";
import HorizonLogoImage from './logo.png';

// Custom components
import { HorizonLogo } from "components/icons/Icons";
import { HSeparator } from "components/separator/Separator";

export function SidebarBrand() {
  //   Chakra color mode
  let logoColor = useColorModeValue("navy.700", "white");

  return (
      <Flex align='center' direction='column'>
          <img src={HorizonLogoImage}    alt="Horizon Logo"/>
          <HSeparator mb='10px'/>
      </Flex>
  );
}

export default SidebarBrand;
