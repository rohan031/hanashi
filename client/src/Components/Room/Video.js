import React, { useRef, useEffect } from "react";

function Video({ peer, name }) {
	const videoRef = useRef(); // ref to video element

	useEffect(() => {
		// on receiving remote stream display it to the user
		peer.on("stream", (stream) => {
			console.log("got-remote-stream");
			videoRef.current.srcObject = stream;
		});
	});

	peer.on("stream", (stream) => {
		console.log("got-remote-stream-out");
		videoRef.current.srcObject = stream;
	});

	// handle on click fullscreen
	const handleFullScreen = () => {
		if (videoRef.current.requestFullscreen) {
			videoRef.current.requestFullscreen();
		} else if (videoRef.current.webkitRequestFullscreen) {
			/* Safari */
			videoRef.current.webkitRequestFullscreen();
		}
	};

	return (
		<div className="stream-item">
			<video ref={videoRef} autoPlay onClick={handleFullScreen}></video>
			<p>{name}</p>
		</div>
	);
}

export default Video;
