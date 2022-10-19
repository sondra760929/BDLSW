import React, {useState} from "react";
import {HashRouter as Router, Route, Routes } from "react-router-dom";
import Home from "../routes/Home";
import Auth from "../routes/Auth";

const AppRouter= () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    return (
        <Router>
            <Routes>
                {isLoggedIn ? (
                <Route exact path ="/" element={ <Home /> } />
                ) : (
                <Route exact path ="/" element={ <Auth /> } />
                )}
            </Routes>
        </Router>
    );
};

export default AppRouter;