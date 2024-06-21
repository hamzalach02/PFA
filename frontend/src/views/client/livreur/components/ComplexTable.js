import React, { useMemo } from "react";
import {
  Center,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  IconButton,
} from "@chakra-ui/react";
import {
  useGlobalFilter,
  usePagination,
  useSortBy,
  useTable,
} from "react-table";

import Card from "components/card/Card";
import Menu from "components/menu/MainMenu";
import { Table } from "@chakra-ui/react";

import { MdDelete, MdCreate } from "react-icons/md";

import { SearchBar } from "components/navbar/searchBar/SearchBar";

function ComplexTable({ columnsData, tableData }) {
  const columns = useMemo(() => columnsData, [columnsData]);
  const data = useMemo(() => tableData, [tableData]);

  const tableInstance = useTable(
    {
      columns,
      data,
      initialState: { pageSize: 5 },
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
  } = tableInstance;

  const textColor = useColorModeValue("secondaryGray.900", "white");

  const handleDeleteClick = (rowData) => {
    console.log("Delete clicked for row:", rowData);
  };

  const handleModifyClick = (rowData) => {
    console.log("Modify clicked for row:", rowData);
  };

  return (
<Center style={{ width: "1200px" }}>
      <Card direction="column" w="260%" px="0px" mb=' 50px'style={{ width: "1100px" }} overflowX={{ sm: "scroll", lg: "hidden" }}>
        <Center>
          <SearchBar placeholder="Search table..." />
        </Center>
        <Table variant="simple" color="gray.500" mb="24px" {...getTableProps()}>
          <Thead>
            {headerGroups.map((headerGroup) => (
              <Tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <Th {...column.getHeaderProps(column.getSortByToggleProps())}>
                    {column.render("Header")}
                  </Th>
                ))}
              </Tr>
            ))}
          </Thead>
          <Tbody {...getTableBodyProps()}>
            {page.map((row) => {
              prepareRow(row);
              return (
                <Tr {...row.getRowProps()}>
                  {row.cells.map((cell) => {
                    return (
                      <Td {...cell.getCellProps()}>
                        {cell.column.Header === "ACTION" ? (
                          <>
                            <IconButton
                              size="sm"
                              colorScheme="red"
                              icon={<MdDelete />}
                              onClick={() => handleDeleteClick(row.original)}
                              mr={2}
                            />
                            <IconButton
                              size="sm"
                              colorScheme="yellow"
                              icon={<MdCreate />}
                              onClick={() => handleModifyClick(row.original)}
                            />
                          </>
                        ) : (
                          cell.render("Cell")
                        )}
                      </Td>
                    );
                  })}
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Card>
    </Center>
  );
}

export default ComplexTable;
