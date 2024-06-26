import React from "react";


// We use Route in order to define the different routes of our application
import { Route, Routes } from "react-router-dom";

// We import all the components we need in our app
import Navbar from "./components/navbar";
import LandingPage from "./components/pages/landingPage";
import HomePage from "./components/pages/homePage";
import MbtaAlertsPage from "./components/pages/mbtaAlerts";
import FavoritesPage from "./components/pages/favorites"
import UsersMenu from "./components/pages/usersMenu";
import CommentsPage from "./components/pages/comments";
import MbtaMyPage from  "./components/pages/mbtaMyPage"
import Login from "./components/pages/loginPage";
import Signup from "./components/pages/registerPage";
import PrivateUserProfile from "./components/pages/privateUserProfilePage";
import { createContext, useState, useEffect } from "react";
import getUserInfo from "./utilities/decodeJwt";
import "./components/styles/Favorites.css"
export const UserContext = createContext();
//test change
//test again
const App = () => {
  const [user, setUser] = useState();

  useEffect(() => {
    setUser(getUserInfo());
  }, []);

  return (
    <>
      <Navbar username={user?.username || ''}  />
      <UserContext.Provider value={user}>
        <Routes>
          <Route exact path="/" element={<LandingPage />} />
          <Route exact path="/home" element={<HomePage />} />
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/signup" element={<Signup />} />
          <Route exact path="/mbtaAlerts" element={<MbtaAlertsPage />} />
          <Route exact path="/mbtaMyPage" element={<MbtaMyPage />} />
          <Route exact path="/favorites/:username" element={<FavoritesPage />} />
          <Route exact path="/users" element={<UsersMenu/>}/>
          <Route exact path="/comments/:username" element={<CommentsPage/>} />
          <Route path="/privateUserProfile" element={<PrivateUserProfile />} />
        </Routes>
      </UserContext.Provider>
    </>
  );
};



export default App
