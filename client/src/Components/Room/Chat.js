import React, { useState, useEffect, useRef } from "react";
import { Drawer } from "rsuite";
import Enter from "../SVG/Enter";

function getWindowDimensions() {
	const { innerWidth: width } = window;
	return width;
}

function Chat({ open, setOpen, sendMessage, messages }) {
	const [width, setWidth] = useState(getWindowDimensions());
	const chatRef = useRef();

	// change drawer size based on viewport width
	useEffect(() => {
		function handleResize() {
			setWidth(getWindowDimensions());
		}

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// handle send message
	const handleMessageSent = (e) => {
		e.preventDefault();
		let message = e.target[0].value;
		if (message.length > 0) sendMessage(message);

		e.target[0].value = "";
		chatRef.current.scroll({
			top: chatRef.current.scrollHeight,
			behavior: "smooth",
		});
	};

	// text area handle enter key
	const handleTextArea = (event) => {
		if (event.which === 13 && !event.shiftKey) {
			if (!event.repeat) {
				let message = event.target.value;
				if (message.length > 0) sendMessage(message);

				event.target.value = "";
				chatRef.current.scroll({
					top: chatRef.current.scrollHeight,
					behavior: "smooth",
				});
			}

			event.preventDefault(); // Prevents the addition of a new line in the text field
		}
	};

	const messageList = messages.map((msgInfo, index) => {
		return (
			// add workbreak to message
			<div
				key={index}
				className={`message ${msgInfo.isPeer ? " " : "my"}`}
			>
				<h4>{msgInfo.from}</h4>
				<p>{msgInfo.message}</p>
			</div>
		);
	});

	let size = width > 400 ? "xs" : "full";

	return (
		<Drawer open={open} onClose={() => setOpen(false)} size={size}>
			<Drawer.Header>
				<Drawer.Title>Room Chat</Drawer.Title>
			</Drawer.Header>
			<Drawer.Body>
				<div className="chats">
					<div className="chats-history" ref={chatRef}>
						{messages && messageList}
					</div>

					<div className="chats-type">
						<form onSubmit={handleMessageSent}>
							<textarea
								placeholder="Type your message..."
								rows={2}
								onKeyDown={handleTextArea}
							></textarea>

							<button>
								<Enter />
							</button>
						</form>
					</div>
				</div>
			</Drawer.Body>
		</Drawer>
	);
}

export default Chat;
