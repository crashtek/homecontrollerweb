import React from "react";
import { Router, Route, Switch } from "react-router-dom";
import { Container } from "reactstrap";

import PrivateRoute from "./components/PrivateRoute";
import Loading from "./components/Loading";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Home from "./views/Home";
import LoggedOut from "./views/LoggedOut";
import Profile from "./views/Profile";
import Room from "./views/Room";
import Window from "./views/Window";
import Schedule from "./views/Schedule";
import { useAuth } from "./react-bff-auth";
import history from "./utils/history";

// styles
import "./App.css";

// fontawesome
import initFontAwesome from "./utils/initFontAwesome";
initFontAwesome();

const App = () => {
  const { loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return (
    <Router history={history}>
      <div id="app" className="d-flex flex-column h-100">
        <NavBar />
        <Container className="flex-grow-1 mt-5">
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/loggedOut" exact component={LoggedOut} />
            <Route path="/room/:id?" exact component={Room} />
            <Route path="/room/:roomId/window/:windowId?" exact component={Window} />
            <Route path="/room/:roomId/schedule/:scheduleId?" exact component={Schedule} />
            <PrivateRoute path="/profile" component={Profile} />
          </Switch>
        </Container>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
