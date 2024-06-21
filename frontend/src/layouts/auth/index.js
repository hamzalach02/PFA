import React, { useState } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import routes from "routes.js";
import SignupClient from "../../views/auth/signIn/Signupclient";
import SignupDriver from "../../views/auth/signIn/Signupdriver";

import { Box, useColorModeValue } from "@chakra-ui/react";
import { SidebarContext } from "contexts/SidebarContext";

export default function Auth() {
  const [toggleSidebar, setToggleSidebar] = useState(false);

  const getRoute = () => {
    return window.location.pathname !== "/auth/full-screen-maps";
  };

  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.layout === "/auth") {
        return (
          <Route
            path={prop.layout + prop.path}
            component={prop.component}
            key={key}
          />
        );
      }
      if (prop.collapse) {
        return getRoutes(prop.items);
      }
      if (prop.category) {
        return getRoutes(prop.items);
      } else {
        return null;
      }
    });
  };

  const authBg = useColorModeValue("white", "navy.900");

  return (
    <Box>
      <SidebarContext.Provider value={{ toggleSidebar, setToggleSidebar }}>
        <Box
          bg={authBg}
          float="right"
          minHeight="100vh"
          height="100%"
          position="relative"
          w="100%"
          transition="all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)"
          transitionDuration=".2s, .2s, .35s"
          transitionProperty="top, bottom, width"
          transitionTimingFunction="linear, linear, ease"
        >
          {getRoute() ? (
            <Box mx="auto" minH="100vh">
              <Switch>
                {getRoutes(routes)}
                <Route path="/auth/sign-up/client" component={SignupClient} />
                <Route path="/auth/sign-up/driver" component={SignupDriver} />
                <Redirect from="/auth" to="/auth/sign-in/default" />
        

              </Switch>
            </Box>
          ) : null}
        </Box>
      </SidebarContext.Provider>
    </Box>
  );
}
