import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Room() {
	const location = useLocation();
	const navigate = useNavigate();

	const [userInfo, setUserInfo] = useState({
		name: location.state?.name,
		roomId: location.state?.roomId,
	});

	useEffect(() => {
		if (!location.state) navigate("/");
	}, []);

	return <div>{userInfo.name}</div>;
}

export default Room;
