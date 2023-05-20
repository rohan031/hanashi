import React, { useRef, useEffect } from "react";

function Video({ peer, name }) {
	const videoRef = useRef();

	useEffect(() => {
		peer.on("stream", (stream) => {
			videoRef.current.srcObject = stream;
		});
	}, []);

	return (
		<div>
			<video ref={videoRef} autoPlay></video>
			{name}
		</div>
	);
}

export default Video;
