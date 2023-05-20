import React, { useState, useEffect } from "react";
import videoConfrencing from "../../assests/illustrations/hallowen-video-call.svg";
import { nanoid } from "nanoid";
import { useNavigate } from "react-router-dom";

function Main() {
	let navigate = useNavigate();
	const [userInfo, setUserInfo] = useState({
		name: "",
		roomId: "",
	});
	const [isDisabled, setIsDisabled] = useState(true);

	useEffect(() => {
		if (userInfo.name.length < 1 || userInfo.roomId.length < 1)
			setIsDisabled(true);
		else setIsDisabled(false);
	}, [userInfo]);

	const handleInput = (key, value) => {
		setUserInfo((prev) => ({ ...prev, [key]: value }));
	};

	const handleRoomJoin = () => {
		navigate("/join", {
			state: {
				name: userInfo.name,
				roomId: userInfo.roomId,
			},
		});
	};

	return (
		<div className="main">
			<img src={videoConfrencing} alt="" />

			<div className="user-details">
				<div>
					<h2>Join/Create room for video confrencing</h2>
				</div>

				<div>
					<div className="user-details__input">
						<input
							type="text"
							value={userInfo.name}
							onChange={(e) =>
								handleInput("name", e.target.value)
							}
							id="name"
							required
						/>

						<label htmlFor="name">Name</label>
					</div>

					<div className="user-details__input">
						<input
							type="text"
							value={userInfo.roomId}
							onChange={(e) =>
								handleInput("roomId", e.target.value)
							}
							id="roomId"
							required
						/>

						<label htmlFor="roomId">Room-id</label>

						<button onClick={() => handleInput("roomId", nanoid())}>
							Create random room-id
						</button>
					</div>

					<button onClick={handleRoomJoin} disabled={isDisabled}>
						Create/Join room
					</button>
				</div>
			</div>
		</div>
	);
}

export default Main;
