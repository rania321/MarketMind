import React, { useState } from "react";
import { useAuth } from "./AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password1: "",
    password2: "",
    name: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, resendEmail } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await register(formData);
      setMessage("Registration successful! Check your email.");
    } catch (error) {
      setMessage(error.detail || "Error during registration.");
      console.error("Detailed error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setMessage("");

    try {
      await resendEmail(formData.email);
      setMessage("Verification email resent.");
    } catch (error) {
      setMessage("Error sending email.");
      console.error("Email resend error:", error);
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
                Create Your <em>Account</em>
              </h2>
            </div>
          </div>
        </div>

        {/* Form styled like contact */}
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <form
              onSubmit={handleSubmit}
              id="contact"
              className="bg-white p-5 rounded shadow-sm"
            >
              <div className="row">
                <div className="col-lg-6 mb-4">
                  <label className="form-label">Name:</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Your name"
                    required
                  />
                </div>

                <div className="col-lg-6 mb-4">
                  <label className="form-label">Email:</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Your email"
                    required
                  />
                </div>

                <div className="col-lg-6 mb-4">
                  <label className="form-label">Password:</label>
                  <input
                    type="password"
                    name="password1"
                    value={formData.password1}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Your password"
                    required
                  />
                </div>

                <div className="col-lg-6 mb-4">
                  <label className="form-label">Confirm Password:</label>
                  <input
                    type="password"
                    name="password2"
                    value={formData.password2}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Confirm your password"
                    required
                  />
                </div>

                <div className="col-lg-12 text-center">
                  <button
                    type="submit"
                    className="main-blue-button"
                    disabled={loading}
                  >
                    {loading ? "Registering..." : "Register"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Resend email button */}
        <div className="row justify-content-center mt-3">
          <div className="col-lg-8 text-center">
            <button
              onClick={handleResend}
              className="main-blue-button"
              disabled={loading || !formData.email}
            >
              {loading ? "Sending..." : "Resend Verification Email"}
            </button>
          </div>
        </div>

        {/* Message and loading handling */}
        {message && (
          <div className="row mt-4">
            <div className="col-lg-12">
              <div
                className={`alert ${
                  message.includes("successful") || message.includes("resent")
                    ? "alert-success"
                    : "alert-danger"
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

export default Register;
