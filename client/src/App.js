import RoutesList from "./Components/Navigation/Routes";
import { CustomProvider } from "rsuite";
import "rsuite/dist/rsuite-no-reset.min.css";
import "./styles/main.scss";

function App() {
	return (
		<CustomProvider theme="dark">
			<RoutesList />
		</CustomProvider>
	);
}

export default App;
