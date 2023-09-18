import React from "react";
import ReactDOM from "react-dom/client";
import {Provider} from "react-redux";
// own modules
import App from "./app/App.tsx";
import {store} from "./store";
// styles
import "./styles/index.scss";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <Provider store={store}>
            <App/>
        </Provider>
    </React.StrictMode>,
); 
