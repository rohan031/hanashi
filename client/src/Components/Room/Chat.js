import React from "react";
import { Drawer } from "rsuite";
import { Send } from "tabler-icons-react";

function Chat({ open, setOpen, sendMessage, messages }) {
	// handle send message
	const handleMessageSent = (e) => {
		e.preventDefault();
		let message = e.target[0].value;
		sendMessage(message);

		e.target[0].value = "";
	};

	const messageList = messages.map((msgInfo, index) => {
		return (
			<div key={index}>
				<h4>{msgInfo.from}</h4>
				<p>{msgInfo.message}</p>
				<p>{msgInfo.isPeer ? "remote" : "my"}</p>
			</div>
		);
	});

	return (
		<Drawer open={open} onClose={() => setOpen(false)} size="xs">
			<Drawer.Header>
				<Drawer.Title>Room Chat</Drawer.Title>
			</Drawer.Header>
			<Drawer.Body>
				<div className="chats">
					<div className="chats-history">
						{messages && messageList}
					</div>

					<div className="chats-type">
						<form onSubmit={handleMessageSent}>
							<input type="text" />
							<button>
								<Send size={30} strokeWidth={2} />
							</button>
						</form>
					</div>
				</div>
			</Drawer.Body>
		</Drawer>
	);
}

export default Chat;
