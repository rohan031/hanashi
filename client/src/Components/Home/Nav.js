import React from "react";
import { BrandGithub } from "tabler-icons-react";

function Nav() {
	return (
		<nav>
			<h1 className="hanashi">hanashi</h1>

			<a
				href="https://github.com/rohan031/hanashi/"
				target="_blank"
				className="nav-code"
				rel="noreferrer"
			>
				<BrandGithub strokeWidth={2} />
				Code
			</a>
		</nav>
	);
}

export default Nav;
