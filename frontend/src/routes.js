import React from "react";

import { Icon } from "@chakra-ui/react";
import {
  MdBarChart,
  MdPerson,
  MdHome,
  MdLock, MdMap,MdArrowForward,MdPeople ,MdLocalShipping ,
  MdOutlineShoppingCart,
} from "react-icons/md";

// Admin Imports
import MainDashboard from "views/admin/default";
import NFTMarketplace from "views/admin/marketplace";
import livreur from "views/admin/livreur";
import DataTables from "views/admin/dataTables";
import Clients from "views/admin/Clients";

// Auth Imports
import SignInCentered from "views/auth/signIn";


const routes = [
  {
    name: "Dashboard",
    layout: "/admin",
    path: "/default",
    icon: <Icon as={MdHome} width='20px' height='20px' color='inherit' />,
    component: MainDashboard,
  },
  {
    name: "Packages",
    layout: "/admin",
    icon: <Icon as={MdLocalShipping } width='20px' height='20px' color='inherit' />,
    path: "/data-tables",
    component: DataTables,
  },
  {
    name: "Drivers",
    layout: "/admin",
    path: "/livreur",
    icon: <Icon as={MdPerson} width='20px' height='20px' color='inherit' />,
    component: livreur,
  },
  {
    name: "Clients",
    layout: "/admin",
    path: "/client-default",
    icon: <Icon as={MdPeople } width='20px' height='20px' color='inherit' />,
    component: Clients,
  },
  {
    name: "    ",
    layout: "/auth",
    path: "/sign-in",
    icon: <Icon as={MdArrowForward} width='20px' height='20px' color='inherit' />,
    component: SignInCentered,
  }


];

export default routes;
