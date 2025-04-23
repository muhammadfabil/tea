import AppRouter from "./router";
import PwaBadge from "./pwa/PwaBadge";

function App() {
  return (
    <div className="bg-white min-h-screen">
      <PwaBadge />
      <AppRouter />
    </div>
  );
}

export default App;
