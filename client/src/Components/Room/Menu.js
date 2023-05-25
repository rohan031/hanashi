import React from "react";
import {
	Camera,
	CameraOff,
	Microphone,
	MicrophoneOff,
	PhoneOff,
	Message2 as Message,
	Copy,
	ScreenShare,
	ScreenShareOff,
} from "tabler-icons-react";
import { Dropdown, SelectPicker, Notification, useToaster } from "rsuite";
import { useNavigate } from "react-router-dom";

function Menu({
	toggleStream,
	toggleCamera,
	toggleMic,
	cameras,
	handleCameraChange,
	roomId,
	setOpen,
	handleScreenShare,
}) {
	const toaster = useToaster(); // to manage notifications
	const navigate = useNavigate(); // to programatically navigate

	// success message for copying room-id to clipboard
	const message = (
		<Notification closable type="success" header="success">
			Successfully copied room-id.
		</Notification>
	);

	// error message
	const error = (
		<Notification closable type="error" header="error">
			Can't copy room-id right now.
			<br /> Room-id: {roomId}
		</Notification>
	);

	// copying room-id to clipboard
	const copy = () => {
		navigator.clipboard
			.writeText(roomId)
			.then(() => {
				toaster.push(message, { placement: "bottomEnd" });

				setTimeout(() => {
					toaster.remove(message);
				}, 1000);
			})
			.catch(() => {
				toaster.push(error, { placement: "bottomEnd" });

				setTimeout(() => {
					toaster.remove(error);
				}, 1000);
			});
	};

	// handling room leave
	const handleLeave = () => {
		navigate("/");
		navigate(0);
	};

	// handle chat open and close
	const handleChat = () => {
		setOpen((prev) => !prev);
	};

	return (
		<div className="menu">
			<div className="menu-container">
				<button onClick={() => toggleCamera()}>
					{toggleStream.camera ? (
						<Camera strokeWidth={2} size={28} />
					) : (
						<CameraOff strokeWidth={2} size={28} />
					)}
				</button>
				<button onClick={() => toggleMic()}>
					{toggleStream.mic ? (
						<Microphone strokeWidth={2} size={28} />
					) : (
						<MicrophoneOff strokeWidth={2} size={28} />
					)}
				</button>
				<button onClick={handleChat}>
					<Message strokeWidth={2} size={28} />
				</button>
				<button onClick={handleLeave}>
					<PhoneOff strokeWidth={2} size={28} />
					End
				</button>
				<Dropdown title={"More"} placement="topEnd">
					<button onClick={() => handleScreenShare()}>
						{!toggleStream.screenShare ? (
							<>
								<ScreenShare strokeWidth={2} size={28} />
								Share screen
							</>
						) : (
							<>
								<ScreenShareOff strokeWidth={2} size={28} />
								Stop screen share
							</>
						)}
					</button>

					<button onClick={copy}>
						<Copy strokeWidth={2} size={28} /> Copy room-id
					</button>

					<SelectPicker
						data={cameras}
						searchable={false}
						onChange={handleCameraChange}
						style={{ width: 224 }}
						cleanable={false}
						placement="topStart"
					/>
				</Dropdown>
			</div>
		</div>
	);
}

export default Menu;
