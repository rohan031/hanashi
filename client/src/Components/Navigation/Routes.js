import React from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import Home from "../../Pages/Home";
import Room from "../../Pages/Room";
import NotFound from "../../Pages/NotFound";

function RoutesList() {
	return (
		<HashRouter>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/join/" element={<Room />} />
				<Route path="*" element={<NotFound />} />
			</Routes>
		</HashRouter>
	);
}

export default RoutesList;
