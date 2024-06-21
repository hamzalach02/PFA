/*!
  _   _  ___  ____  ___ ________  _   _   _   _ ___   
 | | | |/ _ \|  _ \|_ |_  / _ \| \ | | | | | |_ _| 
 | || | | | | |) || |  / / | | |  \| | | | | || | 
 |  _  | || |  _ < | | / /| || | |\  | | |_| || |
 || ||\/|| \\/\/|| \|  \/|_|
                                                                                                                                                                                                                                                                                                                                       
=========================================================
* Horizon UI - v1.1.0
=========================================================

* Product Page: https://www.horizon-ui.com/
* Copyright 2023 Horizon UI (https://www.horizon-ui.com/)

* Designed and Coded by Simmmple

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

// Chakra imports
import { Box, SimpleGrid } from "@chakra-ui/react";
import DevelopmentTable from "views/admin/dataTables/components/DevelopmentTable";
import CheckTable from "views/admin/dataTables/components/CheckTable";
import ColumnsTable from "views/admin/dataTables/components/ColumnsTable";
import ComplexTable from "views/admin/Clients/components/ComplexTable";
import {
  columnsDataDevelopment,
  columnsDataCheck,
  columnsDataColumns,
  columnsDataComplex,
} from "views/admin/Clients/variables/columnsData";
import tableDataDevelopment from "views/admin/Clients/variables/tableDataDevelopment.json";
import tableDataCheck from "views/admin/dataTables/variables/tableDataCheck.json";
import tableDataColumns from "views/admin/dataTables/variables/tableDataColumns.json";
import tableDataComplex from "views/admin/Clients/variables/tableDataComplex.json";
import React from "react";

export default function Settings() {
  // Chakra Color Mode
  return (
    <Box pt={{ base: "400px", md: "80px", xl: "80px" }}>
      <SimpleGrid
        mb='20px' mt='20px'
        columns={{ sm: 5, md: 1}}
        spacing={{ base: "20px", xl: "20px" }}>
     
       
        <ComplexTable
          columnsData={columnsDataComplex}
          tableData={tableDataDevelopment}
        />
      </SimpleGrid>
    </Box>
  );
}
