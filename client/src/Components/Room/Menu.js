import React from "react";
import {
	Camera,
	CameraOff,
	Microphone,
	MicrophoneOff,
	PhoneOff,
	DotsVertical as Dots,
	Message2 as Message,
	Copy,
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
}) {
	const toaster = useToaster();
	const navigate = useNavigate();

	const message = (
		<Notification closable type="success" header="success">
			Successfully copied room-id.
		</Notification>
	);

	const error = (
		<Notification closable type="error" header="error">
			Can't copy room-id right now.
			<br /> Room-id: {roomId}
		</Notification>
	);

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

	const handleLeave = () => {
		navigate("/");
	};

	return (
		<div className="menu">
			<button onClick={() => toggleCamera()}>
				{toggleStream.camera ? (
					<Camera strokeWidth={2} />
				) : (
					<CameraOff strokeWidth={2} />
				)}
			</button>
			<button onClick={() => toggleMic()}>
				{toggleStream.mic ? (
					<Microphone strokeWidth={2} />
				) : (
					<MicrophoneOff strokeWidth={2} />
				)}
			</button>

			<button>
				<Message strokeWidth={2} />
			</button>

			<Dropdown title={"More"} placement="topEnd">
				<button onClick={handleLeave}>
					<PhoneOff strokeWidth={2} /> Leave
				</button>

				<button onClick={copy}>
					<Copy strokeWidth={2} /> Copy room-id
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
	);
}

export default Menu;
