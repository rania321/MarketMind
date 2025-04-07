import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

import Header from "./components/Header"
import Footer from "./components/Footer"
import Home from "./components/Home"
import Login from "./components/Login"
import Register from "./components/Register"
import Bo1ProductsPage from './bo1/pages/ProductsPage';
import Bo1AnalysisPage from './bo1/pages/AnalysisPage';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

         {/* Routes BO1 - Conserve le header/footer existant */}
         <Route path="/bo1/products" element={<Bo1ProductsPage />} />
        {/* <Route path="/bo1/analysis" element={<Bo1AnalysisPage />} />
        <Route path="/bo1/reviews" element={<Bo1ReviewsPage />} /> */}

      </Routes>
      <Footer />
    </Router>
  )
}

export default App

