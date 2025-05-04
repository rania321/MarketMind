"use client"

import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import "./Header.css"

function Header() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <header className="header">
      <div className="container">
        <div className="logo-container">
          <Link to="/" className="logo-text">
            Markt<span>Mind</span>
          </Link>
        </div>
        <nav className="nav">
          <ul className="nav-list">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/products">Products</Link>
            </li>
            <li>
              <Link to="/reviews">Reviews</Link>
            </li>
            <li>
              <Link to="/analysis">Analysis</Link>
            </li>
          </ul>
        </nav>
        <div className="auth-buttons">
          {currentUser ? (
            <>
              <div className="user-info">
                <span>Hello, {currentUser.firstName || currentUser.email}</span>
              </div>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="login-button">
                Login
              </Link>
              <Link to="/register" className="register-button">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
