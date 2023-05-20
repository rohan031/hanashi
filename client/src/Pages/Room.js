import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Peer from "simple-peer";
import Video from "../Components/Room/Video";

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
	const videoTrackRef = useRef();
	const audioTrackRef = useRef();

	const [myStream, setMyStream] = useState({});
	const [peer, setPeer] = useState(new Set());
	const [videoDevices, setVideoDevices] = useState([]);
	const [toggleDevices, setToggleDevices] = useState({
		mic: true,
		camera: true,
	});

	useEffect(() => {
		if (!location.state) navigate("/");

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
					// let tempPeers = [];

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

						// tempPeers.push(peerInfo);
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
					// const peerInfo = peerRef.current.find(
					// 	(user) => user.peerId === payload.from
					// );

					peerInfo.peer.signal(payload.data);
				});

				socketRef.current.on("user-disconnected", (userId) => {
					console.log("user-disconnected");
					try {
						// const peerInfo = peerRef.current.find(
						// 	(user) => user.peerId === userId
						// );

						const peerInfo = Array.from(peerRef.current).find(
							(user) => user.peerId === userId
						);

						// const updatedPeer = peerRef.current.filter(
						// 	(user) => user.peerId !== userId
						// );
						peerRef.current.forEach((user) => {
							if (user.peerId === userId)
								peerRef.current.delete(user);
						});

						peerInfo?.peer?.destroy();

						// peerRef.current = updatedPeer;
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
			if (myStream.active) {
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

	const handleCameraChange = () => {
		try {
			let deviceId = selectRef.current.value;

			if (myStream.active) {
				const currentVideoTrack = myStream.getVideoTracks()[0];
				currentVideoTrack.stop();

				navigator.mediaDevices
					.getUserMedia({
						video: { deviceId: { exact: deviceId } },
						audio: toggleDevices.mic,
					})
					.then((stream) => {
						myVideo.current.srcObject = stream;
						setMyStream(stream);

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
		<select
			onChange={handleCameraChange}
			ref={selectRef}
			value={videoDevices[0]?.deviceId}
		>
			{videoDevices.map((device) => (
				<option key={device.deviceId} value={device.deviceId}>
					{device.label}
				</option>
			))}
		</select>
	);

	const toggleCamera = () => {
		try {
			if (toggleDevices.camera) {
				const videoTrack = myStream.getVideoTracks()[0];
				videoTrackRef.current = videoTrack;

				videoTrack.stop();
				setToggleDevices((prev) => ({ ...prev, camera: false }));
				return;
			}

			navigator.mediaDevices
				.getUserMedia({
					video: { deviceId: { exact: selectRef.current.value } },
					audio: toggleDevices.mic,
				})
				.then((stream) => {
					myVideo.current.srcObject = stream;
					setMyStream(stream);
					setToggleDevices((prev) => ({ ...prev, camera: true }));

					const newVideoTrack = stream.getVideoTracks()[0];

					peerRef.current.forEach((peer) => {
						peer.peer.replaceTrack(
							videoTrackRef.current,
							newVideoTrack,
							initialStream.current
						);
					});
				});
		} catch (err) {
			console.log(err);
		}
	};

	const toggleMic = () => {
		try {
			if (toggleDevices.mic) {
				const audioTrack = myStream.getAudioTracks()[0];
				audioTrackRef.current = audioTrack;

				audioTrack.stop();
				setToggleDevices((prev) => ({ ...prev, mic: false }));
				return;
			}

			navigator.mediaDevices
				.getUserMedia({
					video: { deviceId: { exact: selectRef.current.value } },
					audio: toggleDevices.mic,
				})
				.then((stream) => {
					myVideo.current.srcObject = stream;
					setMyStream(stream);
					setToggleDevices((prev) => ({ ...prev, mic: true }));

					const newAudioTrack = stream.getAudioTracks()[0];

					peerRef.current.forEach((peer) => {
						peer.peer.replaceTrack(
							audioTrackRef.current,
							newAudioTrack,
							initialStream.current
						);
					});
				});
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

			<div>
				{cameras}
				<button onClick={toggleCamera}>Camera</button>
				<button onClick={toggleMic}>Mic</button>
				<button onClick={handleScreenShare}>Screen Share</button>
			</div>
		</>
	);
}

export default Room;
