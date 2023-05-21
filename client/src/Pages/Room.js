import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Peer from "simple-peer";
import Video from "../Components/Room/Video";
import {
	Camera,
	CameraOff,
	Microphone,
	MicrophoneOff,
	PhoneOff,
	DotsVertical as Dots,
	Message2 as Message,
	Copy,
	ScreenShare,
	ScreenShareOff,
} from "tabler-icons-react";

function Room() {
	const location = useLocation();
	const navigate = useNavigate();

	const [userInfo, setUserInfo] = useState({
		name: location.state?.name,
		roomId: location.state?.roomId,
	});

	// code
	const myVideo = useRef(null);
	const socketRef = useRef(null);
	const peerRef = useRef(new Set());
	const selectRef = useRef();
	const initialStream = useRef();

	const [myStream, setMyStream] = useState({});
	const [peer, setPeer] = useState(new Set());
	const [videoDevices, setVideoDevices] = useState([]);
	const [toggleStream, setToggleStream] = useState({
		mic: true,
		camera: true,
		screenShare: false,
	});

	useEffect(() => {
		if (!location.state) navigate("/");
		else {
			socketRef.current = io("/");

			navigator.mediaDevices
				.getUserMedia({
					audio: true,
					video: true,
				})
				.then((stream) => {
					console.log("got my stream ", stream);
					myVideo.current.srcObject = stream;
					setMyStream(stream);
					initialStream.current = stream;

					socketRef.current?.emit("user-joined", {
						roomId: userInfo.roomId,
						name: userInfo.name,
					});

					socketRef.current?.on("room-full", () => {
						alert("Room is full!!");
					});

					socketRef.current?.on("room-info", (users) => {
						console.log("room-info");

						users.forEach((user) => {
							const { id, name } = user;

							const peer = createPeer(
								id,
								socketRef.current?.id,
								stream
							);

							let peerInfo = {
								peerId: id,
								peer,
								name,
							};

							peerRef.current.add(peerInfo);
						});

						setPeer(peerRef.current);
					});

					socketRef.current.on("new-user-connected", (payload) => {
						console.log("new-user-connected");
						const { id, name } = payload.from;
						const peer = addPeer(id, payload.data, stream);

						let peerInfo = {
							peerId: id,
							peer,
							name,
						};

						peerRef.current.add(peerInfo);
						setPeer((prev) => new Set(peerRef.current));
					});

					socketRef.current.on("existing-user-res", (payload) => {
						console.log("existing-user-res");
						const peerInfo = Array.from(peerRef.current).find(
							(user) => user.peerId === payload.from
						);

						peerInfo.peer.signal(payload.data);
					});

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

					getCameras();
				})
				.catch((err) => {
					console.log("error getting media stream ", err);
				});

			navigator.mediaDevices.addEventListener("devicechange", getCameras);
		}
	}, []);

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

	const handleScreenShare = () => {
		try {
			if (!toggleStream.screenShare && myStream.active) {
				const currentVideoTrack = myStream.getVideoTracks()[0];
				currentVideoTrack.stop();

				navigator.mediaDevices
					.getDisplayMedia({
						audio: true,
						video: true,
					})
					.then((stream) => {
						myVideo.current.srcObject = stream;
						setMyStream(stream);

						console.log(stream.getTracks());

						const newVideoTrack = stream.getVideoTracks()[0];

						peerRef.current.forEach((peer) => {
							peer.peer.replaceTrack(
								currentVideoTrack,
								newVideoTrack,
								initialStream.current
							);
						});

						setToggleStream((prev) => ({
							...prev,
							screenShare: true,
							camera: false,
						}));
					})
					.catch((err) => {
						console.log(err);

						toggleCamera(true, currentVideoTrack);
					});
			}
		} catch (err) {
			console.log(err);
		}
	};

	const handleCameraChange = (e) => {
		try {
			let deviceId = selectRef.current.value;

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
							screenShare: false,
						}));

						const newVideoTrack = stream.getVideoTracks()[0];

						peerRef.current.forEach((peer) => {
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

	const cameras = (
		<select onChange={handleCameraChange} ref={selectRef}>
			{videoDevices.map((device) => (
				<option key={device.deviceId} value={device.deviceId}>
					{device.label}
				</option>
			))}
		</select>
	);

	const toggleCamera = (fromScreenShare = false, videoTrack) => {
		try {
			if (toggleStream.screenShare || fromScreenShare) {
				let currentVideoTrack = myStream.getVideoTracks()[0];

				if (fromScreenShare) currentVideoTrack = videoTrack;
				else currentVideoTrack.stop();

				navigator.mediaDevices
					.getUserMedia({
						video: { deviceId: { exact: selectRef.current.value } },
						audio: toggleStream.mic,
					})
					.then((stream) => {
						myVideo.current.srcObject = stream;
						setMyStream(stream);
						setToggleStream((prev) => ({
							...prev,
							camera: true,
							screenShare: false,
						}));

						const newVideoTrack = stream.getVideoTracks()[0];

						peerRef.current.forEach((peer) => {
							peer.peer.replaceTrack(
								currentVideoTrack,
								newVideoTrack,
								initialStream.current
							);
						});
					});
			} else {
				const prevVal = myStream.getVideoTracks()[0].enabled;

				myStream.getVideoTracks()[0].enabled = !prevVal;

				setToggleStream((prev) => ({ ...prev, camera: !prevVal }));
			}
		} catch (err) {
			console.log(err);
		}
	};

	const toggleMic = () => {
		try {
			console.log(myStream.getTracks());
			const prevVal = myStream.getAudioTracks()[0].enabled;

			myStream.getAudioTracks()[0].enabled = !prevVal;

			setToggleStream((prev) => ({ ...prev, mic: !prevVal }));
		} catch (err) {
			console.log(err);
		}
	};

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

			<div className="menu">
				{cameras}
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

				<button onClick={handleScreenShare}> screenShare</button>
			</div>
		</>
	);
}

export default Room;
