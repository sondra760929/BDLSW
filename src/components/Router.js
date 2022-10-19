import React, {useState} from "react";
import {HashRouter as Router, Route, Routes } from "react-router-dom";
import Home from "../routes/Home";
import Auth from "../routes/Auth";
import Profile from "../routes/Profile";
import Navigation from "./Navigation";

const AppRouter= ({isLoggedIn, userObj}) => {
    return (
        <Router>
            {/* {isLoggedIn && <Navigation />} */}
            <Routes>
                {isLoggedIn ? (
                    <>
                        console.log(userObj);
                        <Route exact path ="/" element={<Home userObj={userObj} />}>
                        </Route>
                        <Route exact path ="/profile" element={<Profile />}>
                        </Route>
                    </>
                ) : (
                <Route exact path ="/" element={ <Auth /> } />
                )}
            </Routes>
        </Router>
    );
};

export default AppRouter;