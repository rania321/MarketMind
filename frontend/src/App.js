import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import MarketingStrategy from "./components/MarketingStrategy";
import Logout from "./components/Logout";
import VerifyEmail from "./components/VerifyEmail"; // Importez le nouveau composant
import ContentGenerator from "./components/ContentGenerator";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/marketing-strategy" element={<MarketingStrategy />} />
          <Route path="/content-generator" element={<ContentGenerator />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/verify-email/:key" element={<VerifyEmail />} />{" "}
          {/* Nouvelle route */}
        </Routes>
        <Footer /> {/* Ajoutez le Footer en bas, après les Routes */}
      </AuthProvider>
    </Router>
  );
}

export default App;
