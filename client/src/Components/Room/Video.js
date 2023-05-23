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

	return (
		<div>
			<video ref={videoRef} autoPlay></video>
			{name}
		</div>
	);
}

export default Video;
