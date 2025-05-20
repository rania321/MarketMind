import React, { useState } from "react";
import { useAuth } from "./AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      console.log(formData);
      await login(formData);
      setMessage("Connexion réussie !");
    } catch (error) {
      setMessage(error.detail || "Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="marketing" className="our-portfolio section">
      <div className="container">
        <div className="row">
          <div className="col-lg-6 offset-lg-3">
            <div
              className="section-heading wow bounceIn"
              data-wow-duration="1s"
              data-wow-delay="0.2s"
            >
              <h2>
                Login to your <em>Account</em>
              </h2>
            </div>
          </div>
        </div>

        {/* Formulaire style contact */}
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <form
              onSubmit={handleSubmit}
              id="contact"
              className="bg-white p-5 rounded shadow-sm"
            >
              <div className="row">
                <div className="col-lg-6 mb-4">
                  <label className="form-label">Email:</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="col-lg-6 mb-4">
                  <label className="form-label">Password:</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <div className="col-lg-12 text-center">
                  <button
                    type="submit"
                    className="main-blue-button"
                    disabled={loading}
                  >
                    {loading ? "Login..." : "Connected"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Gestion des messages et loading */}
        {message && (
          <div className="row mt-4">
            <div className="col-lg-12">
              <div
                className={`alert ${
                  message.includes("réussie") ? "alert-success" : "alert-danger"
                } text-center`}
              >
                {message}
              </div>
            </div>
          </div>
        )}

        {loading && !message && (
          <div className="row mt-4">
            <div className="col-lg-12 text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
