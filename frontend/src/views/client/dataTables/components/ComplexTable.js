import {
  Flex,
  Table,

  Icon,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  Button
} from "@chakra-ui/react";
import React, { useMemo } from "react";
import {
  useGlobalFilter,
  usePagination,
  useSortBy,
  useTable,
} from "react-table";

// Custom components
import Card from "components/card/Card";
import Menu from "components/menu/MainMenu";

import { SearchBar } from "components/navbar/searchBar/SearchBar";

// Assets
import { MdCheckCircle, MdCancel, MdOutlineError } from "react-icons/md";
export default function ColumnsTable(props) {
  const { columnsData, tableData } = props;

  const columns = useMemo(() => columnsData, [columnsData]);
  const data = useMemo(() => tableData, [tableData]);

  const tableInstance = useTable(
    {
      columns,
      data,
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    initialState,
  } = tableInstance;
  initialState.pageSize = 5;

  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  return (
   
    <Card
    direction='column'
    w='190%'
    px='0px'
    overflowX={{ sm: "scroll", lg: "hidden" }}>
    <Flex px='25px' justify='space-between' mb='20px' align='center'>
      <Text
        color={textColor}
        fontSize='26px' // Increased font size
        fontWeight='700'
        lineHeight='100%'>
        Liste des colis
      </Text>
    <SearchBar></SearchBar>
  </Flex>
  <Table variant='simple' color='gray.500' mb='24px'>
    <Thead>
      <Tr>
        <Th pe='10px' borderColor={borderColor}>
          <Flex
            justify='space-between'
            align='center'
            fontSize={{ sm: "10px", lg: "12px" }}
            color='gray.400'>
            Colis
          </Flex>
        </Th>
        <Th pe='10px' borderColor={borderColor}>
          <Flex
            justify='space-between'
            align='center'
            fontSize={{ sm: "10px", lg: "12px" }}
            color='gray.400'>
            Status
          </Flex>
        </Th>
        <Th pe='10px' borderColor={borderColor}>
          <Flex
            justify='space-between'
            align='center'
            fontSize={{ sm: "10px", lg: "12px" }}
            color='gray.400'>
            Prix
          </Flex>
        </Th>
        <Th pe='10px' borderColor={borderColor}>
          <Flex
            justify='space-between'
            align='center'
            fontSize={{ sm: "10px", lg: "12px" }}
            color='gray.400'>
            Livreur
          </Flex>
        </Th>
        <Th pe='10px' borderColor={borderColor}>
          <Flex
            justify='space-between'
            align='center'
            fontSize={{ sm: "10px", lg: "12px" }}
            color='gray.400'>
            Proprieter
          </Flex>
        </Th>
        
        <Th pe='10px' borderColor={borderColor}>
          <Flex
            justify='space-between'
            align='center'
            fontSize={{ sm: "10px", lg: "12px" }}
            color='gray.400'
            style={{ marginRight: '20px' }}
            >
            Actions
          </Flex>
        </Th>
      </Tr>
    </Thead>
    <Tbody>
      {data.map((row, index) => (
        <Tr key={index}>
          <Td>{row.commande}</Td>
          <Td>
            <Flex align='center'>
              <Icon
                w='24px'
                h='24px'
                me='5px'
                color={
                  row.status === "Approved"
                    ? "green.500"
                    : row.status === "Disable"
                    ? "red.500"
                    : row.status === "Error"
                    ? "orange.500"
                    : null
                }
                as={
                  row.status === "Approved"
                    ? MdCheckCircle
                    : row.status === "Disable"
                    ? MdCancel
                    : row.status === "Error"
                    ? MdOutlineError
                    : null
                }
              />
              <Text color={textColor} fontSize='sm' fontWeight='700'>
                {row.status}
              </Text>
            </Flex>
          </Td>
          <Td>{row.prix}</Td>
          <Td>{row.livreur}</Td>
          <Td>{row.proprieter}</Td>
          <Td>
            <Flex align="center" justify="center">
              <Button variant="outline" colorScheme="red" size="sm" mr="2">Delete</Button>
              <Button variant="outline" colorScheme="blue" size="sm">Modify</Button>
            </Flex>
          </Td>
        </Tr>
      ))}
    </Tbody>
  </Table>
</Card>

  );
}
