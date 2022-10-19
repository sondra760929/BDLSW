import { authService } from "fbase";
import React from "react";
import { useNavigate } from "react-router-dom";


const Profile = () => {
    const history = useNavigate();
    const onLogOutClick = () => {
        authService.signOut();
        history("/");
    };
    return (
        <>
            <button onClick={onLogOutClick}>Log Out</button>
        </>
    );
};

export default Profile;