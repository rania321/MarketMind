import React, { useEffect } from 'react';
//import './Header.css';
import { WOW } from 'wowjs';
import 'animate.css';


function Header() {
    useEffect(() => {
        new WOW({ live: false }).init();
      }, []);
  return (
    <>
    <div>
    {/* ***** Preloader Start ***** */}
    {/* <div id="js-preloader" className="js-preloader">
        <div className="preloader-inner">
        <span className="dot" />
        <div className="dots">
            <span />
            <span />
            <span />
        </div>
        </div>
    </div> 
    {/* ***** Preloader End ***** */}
    {/* ***** Header Area Start ***** */}
    <header class="header-area header-sticky wow slideInDown" data-wow-duration="0.75s" data-wow-delay="0s">
        <div className="container">
        <div className="row">
            <div className="col-12">
            <nav className="main-nav">
                {/* ***** Logo Start ***** */}
                <a href="index.html" className="logo">
                <h4>Market<span>Mind</span></h4>
                </a>
                {/* ***** Logo End ***** */}
                {/* ***** Menu Start ***** */}
                <ul className="nav">
                <li className="scroll-to-section"><a href="#top" className="active">Home</a></li>
                <li className="scroll-to-section"><a href="#about">About Us</a></li>
                
                <li className="scroll-to-section"><a href="#portfolio">Services</a></li>
                {/* <li className="scroll-to-section"><a href="#blog">Blog</a></li>  */}
                <li className="scroll-to-section"><a href="#contact">Message Us</a></li> 
                <li className="scroll-to-section"><div className="main-red-button"><a href="#contact">Contact Now</a></div></li> 
                </ul>        
                <a className="menu-trigger" >
                <span>Menu</span>
                </a>
                {/* ***** Menu End ***** */}
            </nav>
            </div>
        </div>
        </div>
    </header>
    </div>

    </>
  );
}

export default Header;
