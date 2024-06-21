import React, { useState } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { Box, Button, Flex, FormControl, FormLabel, Heading, Icon, Input, InputGroup, InputRightElement, Text } from "@chakra-ui/react";
import { HSeparator } from "components/separator/Separator";
import DefaultAuth from "layouts/auth/Default";
import illustration from "assets/img/auth/auth.png";  
import { RiEyeCloseLine } from "react-icons/ri";  
import { MdOutlineRemoveRedEye } from "react-icons/md";  

function SignUpDriver() {
  const history = useHistory();

  const [show, setShow] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [cin, setCin] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [errors, setErrors] = useState({});

  const navigateToSignUp = () => {
    history.push("/auth/sign-in");
  };
  const handleSignUp = async (e) => {
    e.preventDefault();
   
      try {
        const response = await axios.post("http://localhost:8000/api/registerdriver", {
          fname: firstName,
          lname: lastName,
          email: email,
          password: password,
      
        cin: cin,
        phone_number: phoneNumber,
        current_place: "current",
        license_number: licenseNumber,
        vehicle_number: vehicleNumber
        });
      
        history.push("/auth/sign-in/");
        console.log("done, u did it ");
      } catch (error) {
        console.error("Error signing up:", error);
      
    }
  };
 

  return (
    <DefaultAuth illustrationBackground={illustration} image={illustration}>
      <Flex
        maxW="50%"
        w={{ base: "100%", md: "80%" }}
        mx={{ base: "auto", lg: "30px" }} 
        me="auto"
        h="110%"
        alignItems="start"
        justifyContent="center"
        mb={{ base: "5px", md: "60px" }}
        px={{ base: "25px", md: "0px" }}
        mt={{ base: "10px", md: "14vh" }}
        flexDirection="column"
        borderRadius="25px"
        p="10px"
      >
        <Box me="auto">
       
        </Box>
        <Flex
          zIndex="2"
          direction="column"
          w={{ base: "100%", md: "420px" }}
          maxW="100%"
          background="transparent"
          borderRadius="15px"
          mx={{ base: "auto", lg: "unset" }}
          me="auto"
          mb={{ base: "20px", md: "auto" }}
        >
               <Heading color="#4e88a0" fontSize="36px" mt="-130px" mb="20px" ml={"150px"}>
            Signup
          </Heading>
                      <HSeparator />

          <form onSubmit={handleSignUp} style={{marginBottom:"-100px"}} >
            <Flex direction="column" flexWrap="wrap" mb="20px">
              <Flex direction="row" flexWrap="wrap" >
                <FormControl id="firstName" mr="2" mb="2">
                  <FormLabel style={{marginBottom:"-1px"}} >First Name</FormLabel>
                  <Input style={{marginBottom:"-4px"}} type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} isRequired />
                </FormControl>
                <FormControl id="lastName" mr="2" mb="2">
                  <FormLabel style={{marginBottom:"-4px"}}>Last Name</FormLabel>
                  <Input style={{marginBottom:"-4px"}} type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} isRequired />
                </FormControl>
              </Flex>
              <Flex direction="row" flexWrap="wrap">
                <FormControl id="email" mr="4" mb="4">
                  <FormLabel style={{marginBottom:"-4px"}}>Email</FormLabel>
                  <Input style={{marginBottom:"-4px"}} type="email" value={email} onChange={(e) => setEmail(e.target.value)} isRequired />
                  {errors.email && <Text color="red.500">{errors.email}</Text>}
                </FormControl>
              </Flex>
              <Flex direction="row" flexWrap="wrap">
                <FormControl style={{marginBottom:"0px"}}id="phoneNumber" mr="4" mb="4">
                  <FormLabel style={{marginBottom:"-1px"}}>Phone Number</FormLabel>
                  <Input style={{marginBottom:"-1px"}} type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                </FormControl>
                <FormControl id="password" mr="4" mb="4">
                  <FormLabel style={{marginBottom:"-4px"}}>Password</FormLabel>
                  <InputGroup>
                    <Input style={{marginBottom:"-4px"}} type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} isRequired />
                    <InputRightElement>
                      <Icon onClick={() => setShow(!show)} cursor="pointer" color="gray.500" fontSize="sm" mt="1" mr="2" h="100%" as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye} />
                    </InputRightElement>
                  </InputGroup>
                  {errors.password && <Text color="red.500">{errors.password}</Text>}
                </FormControl>
              </Flex>
              <Flex direction="row" flexWrap="wrap">
                <FormControl id="cin" mr="4" mb="4">
                  <FormLabel style={{marginBottom:"-4px"}}>CIN</FormLabel>
                  <Input style={{marginBottom:"-4px"}} type="text" value={cin} onChange={(e) => setCin(e.target.value)} />
                  {errors.cin && <Text color="red.500">{errors.cin}</Text>}
                </FormControl>
                <FormControl style={{marginBottom:"0px"}} id="licenseNumber" mr="4" mb="4">
                  <FormLabel style={{marginBottom:"-2px"}}>License Number</FormLabel>
                  <Input type="text" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} />
                  {errors.license_number && <Text color="red.500">{errors.license_number}</Text>}
                </FormControl>
              </Flex>
              <FormControl id="vehicleNumber" mr="4" mb="4">
                <FormLabel>Vehicle Number</FormLabel>
                <Input type="text" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} />
                {errors.vehicle_number && <Text color="red.500">{errors.vehicle_number}</Text>}
              </FormControl>
            </Flex>
            <Button type="submit" backgroundColor="#4e88a0" width="100%" style={{marginTop:"-25px"}}>Sign Up</Button>
          </form>
        </Flex>
      </Flex>
      <Flex flexDirection="column" justifyContent="center" marginLeft={"230px"} marginTop={"60px"} marginBottom={"-70px"} alignItems="start" maxW="100%" mt="10px">
              <Text fontSize="sm">
                Already have an account?{" "}
                <Text as="span" color="#4e88a0" fontWeight="500" cursor="pointer" onClick={navigateToSignUp} >
                  Sign in
                </Text> 
              </Text>
            </Flex>
    </DefaultAuth>
  );
}

export default SignUpDriver;

