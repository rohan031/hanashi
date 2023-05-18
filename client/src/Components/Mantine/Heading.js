import React from "react";
import { MantineProvider } from "@mantine/core";

function Heading({ children }) {
	return (
		<MantineProvider
			withCSSVariables
			withGlobalStyles
			withNormalizeCSS
			theme={{
				fontFamily: "Pacifico, cursive",
				colorScheme: "dark",
				primaryColor: "pink",
			}}
		>
			{children}
		</MantineProvider>
	);
}

export default Heading;
