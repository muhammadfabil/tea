import AppRouter from "./router";
import { AuthProvider } from "./context/AuthContext";
import PwaBadge from "./pwa/PwaBadge"; // ✅ Impor PwaBadge di sini

function App() {
  return (
    <AuthProvider>
      <div className="bg-white min-h-screen">
        <PwaBadge /> {/* ✅ Indikator PWA */}
        <AppRouter />
      </div>
    </AuthProvider>
  );
}

export default App;
