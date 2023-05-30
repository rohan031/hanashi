import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "../../Pages/Home";
import Room from "../../Pages/Room";
import { BrowserRouter } from "react-router-dom";
import NotFound from "../../Pages/NotFound";

function RoutesList() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/join/" element={<Room />} />
				<Route path="*" element={<NotFound />} />
			</Routes>
		</BrowserRouter>
	);
}

export default RoutesList;
