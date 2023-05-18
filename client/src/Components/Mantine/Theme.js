import React from "react";
import { MantineProvider } from "@mantine/core";

function Theme({ children }) {
	return (
		<MantineProvider
			withCSSVariables
			withGlobalStyles
			withNormalizeCSS
			theme={{
				fontFamily: "Manrope, sans-serif",
				colorScheme: "dark",
				primaryColor: "pink",
			}}
		>
			{children}
		</MantineProvider>
	);
}

export default Theme;
