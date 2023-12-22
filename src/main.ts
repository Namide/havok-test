import { createApp } from "./pages/createApp";
import { createRouter } from "./router/createRouter";
import "./style.css";

const router = createRouter();

router.on("landing", () => console.log("landing"));
router.on("404", () => console.log("404"));
router.changePage({
  path: document.location.pathname,
});

createApp();
