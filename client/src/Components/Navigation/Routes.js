import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "../../Pages/Home";
import Room from "../../Pages/Room";
import NotFoundTitle from "../../Pages/NotFound";

function RoutesList() {
	return (
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="/join/:roomId" element={<Room />} />
			<Route path="*" element={<NotFoundTitle />} />
		</Routes>
	);
}

export default RoutesList;
