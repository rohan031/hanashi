import React from "react";
import Heading from "../Mantine/Heading";
import { BrandGithub } from "tabler-icons-react";
import { Button, rem } from "@mantine/core";

function Nav() {
	return (
		<div className="nav">
			<Heading>
				<h1>hanashi</h1>
			</Heading>

			<div className="nav-link">
				<Button
					component="a"
					href="https://github.com/rohan031/hanashi/tree/master"
					target="_blank"
					variant="subtle"
					leftIcon={
						<BrandGithub
							size="1.8rem"
							strokeWidth={2}
							color="white"
						/>
					}
					styles={(theme) => ({
						label: {
							color: theme.colors.gray[0],
						},
					})}
				>
					Code
				</Button>
			</div>
		</div>
	);
}

export default Nav;
