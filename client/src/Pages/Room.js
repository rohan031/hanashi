import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Peer from "simple-peer";
import { Notification, useToaster } from "rsuite";

import Video from "../Components/Room/Video";
import Menu from "../Components/Room/Menu";
import Chat from "../Components/Room/Chat";

function Room() {
	const location = useLocation(); // get state values from previous page
	const navigate = useNavigate(); // to programatically naviage between pages

	const [userInfo, setUserInfo] = useState({
		name: location.state?.name,
		roomId: location.state?.roomId,
	}); // user details state
	const [open, setOpen] = useState(false); // chat drawer management
	const toaster = useToaster(); // to manage notifications

	// code
	const myVideo = useRef(null); // ref to video element
	const socketRef = useRef(null); // socket object ref
	const peerRef = useRef(new Set()); // to manage peers
	const initialStream = useRef(); // for replacing remote streams

	const [myStream, setMyStream] = useState({}); // my media stream state
	const [peer, setPeer] = useState(new Set()); // to mange display of remote peers
	const [videoDevices, setVideoDevices] = useState([]); // to get video media devices
	const [toggleStream, setToggleStream] = useState({
		mic: true,
		camera: true,
	}); // state management for toggling media devices
	const [messages, setMessages] = useState([]); // list of all chat messages

	// room full notification
	const roomFullMessage = (
		<Notification closable type="error" header="error">
			{`Current room ${userInfo.roomId} is full! `}
			Redirected to home page
		</Notification>
	);

	useEffect(() => {
		if (!location.state) navigate("/");
		// if room-id and user details not there redirect to home
		else {
			socketRef.current = io("/"); // socket connection

			navigator.mediaDevices
				.getUserMedia({
					// get user media devices
					audio: true,
					video: true,
				})
				.then((stream) => {
					console.log("got my stream ", stream);
					myVideo.current.srcObject = stream;
					setMyStream(stream);
					initialStream.current = stream;

					// emit event to server when user join the room
					socketRef.current?.emit("user-joined", {
						roomId: userInfo.roomId,
						name: userInfo.name,
					});

					// when room is full send error notification and navigate to home
					socketRef.current?.on("room-full", () => {
						toaster.push(roomFullMessage, {
							placement: "bottomEnd",
						});

						setTimeout(() => {
							toaster.remove(roomFullMessage);
						}, 1000);

						navigate("/");
					});

					// get room details with user id and name
					socketRef.current?.on("room-info", (users) => {
						console.log("room-info");

						users.forEach((user) => {
							const { id, name } = user;

							const peer = createPeer(
								id,
								socketRef.current?.id,
								stream
							); // initiate webrtc offer

							let peerInfo = {
								peerId: id,
								peer,
								name,
							};

							peerRef.current.add(peerInfo);
						});

						setPeer(peerRef.current);
					});

					// when new user joined we get its offer
					socketRef.current.on("new-user-connected", (payload) => {
						console.log("new-user-connected");
						const { id, name } = payload.from;
						const peer = addPeer(id, payload.data, stream); // responding to the new user offer

						let peerInfo = {
							peerId: id,
							peer,
							name,
						};

						peerRef.current.add(peerInfo);
						setPeer((prev) => new Set(peerRef.current));
					});

					// getting existing user singnalling date upon offer acceptance
					socketRef.current.on("existing-user-res", (payload) => {
						console.log("existing-user-res");
						const peerInfo = Array.from(peerRef.current).find(
							(user) => user.peerId === payload.from
						);

						peerInfo.peer.signal(payload.data);
					});

					// handles receiving new message
					socketRef.current.on("new-message", (payload) => {
						reciveMessage(payload);
					});

					// handles user disconnection
					socketRef.current.on("user-disconnected", (userId) => {
						console.log("user-disconnected");
						try {
							const peerInfo = Array.from(peerRef.current).find(
								(user) => user.peerId === userId
							);

							peerRef.current.forEach((user) => {
								if (user.peerId === userId)
									peerRef.current.delete(user);
							});

							peerInfo?.peer?.destroy();

							setPeer((prev) => new Set(peerRef.current));
						} catch (err) {
							console.log(err);
						}
					});

					getCameras(); // get all connected video devices
				})
				.catch((err) => {
					console.log("error getting media stream ", err);
				});

			navigator.mediaDevices.addEventListener("devicechange", getCameras); // add or remove device upon connecting or disconnecting
		}
	}, []);

	// handle receive message
	const reciveMessage = ({ from, message }) => {
		const messageObj = {
			from,
			message,
			isPeer: true,
		};

		setMessages((prev) => [...prev, messageObj]);
	};

	// handle send message
	const sendMessage = (message) => {
		const messageObj = {
			from: userInfo.name,
			message,
		};

		socketRef.current.emit("send-message", messageObj); // send new message to server

		setMessages((prev) => [...prev, { ...messageObj, isPeer: false }]);
	};

	// function to get all connected video devices
	const getCameras = () => {
		navigator.mediaDevices
			.enumerateDevices()
			.then((devices) => {
				const filtered = devices.filter(
					(device) => device.kind === "videoinput"
				);

				setVideoDevices(filtered);
			})
			.catch((err) => console.log(err));
	};

	// function to initiate webrtc offer
	const createPeer = (userId, myId, stream) => {
		console.log("create-peer");
		try {
			const peer = new Peer({
				initiator: true,
				trickle: false,
				stream,
			});

			const myInfo = {
				id: myId,
				name: userInfo.name,
			};
			peer.on("signal", (data) => {
				socketRef.current?.emit("new-user-signal", {
					// send our signalling data for the peer
					from: myInfo,
					to: userId,
					data,
				});
			});

			return peer;
		} catch (err) {
			console.log(err);
		}
	};

	// responding to the signalling data
	const addPeer = (from, data, stream) => {
		console.log("add-peer");
		try {
			const peer = new Peer({
				initiator: false,
				trickle: false,
				stream,
			});

			peer.on("signal", (signalData) => {
				socketRef.current.emit("existing-user-signal", {
					// sending our signalling data upon receiving initiator data
					from: socketRef.current.id,
					to: from,
					data: signalData,
				});
			});

			peer.signal(data);

			return peer;
		} catch (err) {
			console.log(err);
		}
	};

	// switching video device
	const handleCameraChange = (deviceId) => {
		try {
			if (myStream.active) {
				const currentVideoTrack = myStream.getVideoTracks()[0];
				currentVideoTrack.stop();

				navigator.mediaDevices
					.getUserMedia({
						video: { deviceId: { exact: deviceId } },
						audio: toggleStream.mic,
					})
					.then((stream) => {
						myVideo.current.srcObject = stream;
						setMyStream(stream);
						setToggleStream((prev) => ({
							...prev,
							camera: true,
						}));

						const newVideoTrack = stream.getVideoTracks()[0];

						peerRef.current.forEach((peer) => {
							// replacing video tracks for all the connected peers
							peer.peer.replaceTrack(
								currentVideoTrack,
								newVideoTrack,
								initialStream.current
							);
						});
					});
			}
		} catch (err) {
			console.log(err);
		}
	};

	// list of cameras to display to the user
	const cameras = videoDevices.map((device) => ({
		label: device.label,
		value: device.deviceId,
	}));

	// toggle camera on and off
	const toggleCamera = () => {
		try {
			const prevVal = myStream.getVideoTracks()[0].enabled;
			myStream.getVideoTracks()[0].enabled = !prevVal;

			setToggleStream((prev) => ({ ...prev, camera: !prevVal }));
		} catch (err) {
			console.log(err);
		}
	};

	// toggle mic on and off
	const toggleMic = () => {
		try {
			const prevVal = myStream.getAudioTracks()[0].enabled;

			myStream.getAudioTracks()[0].enabled = !prevVal;

			setToggleStream((prev) => ({ ...prev, mic: !prevVal }));
		} catch (err) {
			console.log(err);
		}
	};

	// remote users list
	const remoteUsers = [];
	peer.forEach((peer) => {
		remoteUsers.push(
			<Video key={peer.peerId} peer={peer.peer} name={peer.name} />
		);
	});

	return (
		<>
			<div>
				<video ref={myVideo} autoPlay muted></video>

				{peer && remoteUsers}
			</div>
			<Chat
				open={open}
				socketRef={socketRef}
				setOpen={setOpen}
				sendMessage={sendMessage}
				messages={messages}
			/>
			<Menu
				toggleStream={toggleStream}
				toggleCamera={toggleCamera}
				toggleMic={toggleMic}
				cameras={cameras}
				handleCameraChange={handleCameraChange}
				roomId={userInfo.roomId}
				setOpen={setOpen}
			/>
		</>
	);
}

export default Room;
