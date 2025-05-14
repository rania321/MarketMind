import React, {  } from 'react';


function Home() {
  return (
    <>
      <div>
  <div className="main-banner wow fadeIn" id="top" data-wow-duration="1s" data-wow-delay="0.5s">
  <div className="container">
  <div className="row">
    <div className="col-lg-12">
      <div className="row">
        <div className="col-lg-6 align-self-center">
          <div className="left-content header-text wow fadeInLeft" data-wow-duration="1s" data-wow-delay="1s">
            <h6>Welcome to MarketMind</h6>
            <h2>We turn <em>customer data</em> into <span>smart marketing strategies</span></h2>
            <p>MarketMind is an innovative AI-powered platform that helps you understand your customers, generate personalized content, and optimize your marketing campaigns. Start analyzing your data today.</p>
            <form id="search" action="#" method="GET">
              <fieldset>
                <input type="address" name="address" className="email" placeholder="Enter your product page URL..." autoComplete="on" required />
              </fieldset>
              <fieldset>
                <button type="submit" className="main-button">Analyze</button>
              </fieldset>
            </form>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="right-image wow fadeInRight" data-wow-duration="1s" data-wow-delay="0.5s">
            <img src="/assets/images/banner-right-image.png" alt="AI marketing analysis" />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

  </div>
 <div id="about" className="about-us section">
  <div className="container">
    <div className="row">
      <div className="col-lg-4">
        <div className="left-image wow fadeIn" data-wow-duration="1s" data-wow-delay="0.2s">
          <img src="assets/images/about-left-image.png" alt="AI analyzing data" />
        </div>
      </div>
      <div className="col-lg-8 align-self-center">
        <div className="services">
          <div className="row">
            <div className="col-lg-6">
              <div className="item wow fadeIn" data-wow-duration="1s" data-wow-delay="0.5s">
                <div className="icon">
                  <img src="assets/images/service-icon-01.png" alt="customer insight icon" />
                </div>
                <div className="right-text">
                  <h4>Customer Insights</h4>
                  <p>Discover what your customers really want through AI-powered sentiment.</p>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="item wow fadeIn" data-wow-duration="1s" data-wow-delay="0.7s">
                <div className="icon">
                  <img src="assets/images/service-icon-02.png" alt="content generation icon" />
                </div>
                <div className="right-text">
                  <h4>AI Content Creation</h4>
                  <p>Generate high-quality, tailored content for your audience.</p>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="item wow fadeIn" data-wow-duration="1s" data-wow-delay="0.9s">
                <div className="icon">
                  <img src="assets/images/service-icon-03.png" alt="trend detection icon" />
                </div>
                <div className="right-text">
                  <h4>Trend Detection</h4>
                  <p>Analyze social media and customer feedback to detect upcoming trends.</p>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="item wow fadeIn" data-wow-duration="1s" data-wow-delay="1.1s">
                <div className="icon">
                  <img src="assets/images/service-icon-04.png" alt="recommendation icon" />
                </div>
                <div className="right-text">
                  <h4>Smart Recommendations</h4>
                  <p>Get actionable recommendations to personalize your product pages.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<div id="services" className="our-services section">
  <div className="container">
    <div className="row">
      <div className="col-lg-6 align-self-center wow fadeInLeft" data-wow-duration="1s" data-wow-delay="0.2s">
        <div className="left-image">
          <img src="assets/images/services-left-image.png" alt="AI services" />
        </div>
      </div>
      <div className="col-lg-6 wow fadeInRight" data-wow-duration="1s" data-wow-delay="0.2s">
        <div className="section-heading">
          <h2>Enhance your strategy with <em>AI-driven insights</em> & <span>Smart Campaigns</span></h2>
          <p>MarketMind helps businesses understand customer behavior, generate content automatically, and optimize marketing decisions using cutting-edge AI and data analysis tools.</p>
        </div>
        <div className="row">
          <div className="col-lg-12">
            <div className="first-bar progress-skill-bar">
              <h4>Sentiment Analysis</h4>
              <span>90%</span>
              <div className="filled-bar" />
              <div className="full-bar" />
            </div>
          </div>
          <div className="col-lg-12">
            <div className="second-bar progress-skill-bar">
              <h4>Content Generation</h4>
              <span>85%</span>
              <div className="filled-bar" />
              <div className="full-bar" />
            </div>
          </div>
          <div className="col-lg-12">
            <div className="third-bar progress-skill-bar">
              <h4>Trend Prediction</h4>
              <span>92%</span>
              <div className="filled-bar" />
              <div className="full-bar" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<div id="portfolio" className="our-portfolio section">
  <div className="container">
    <div className="row">
      <div className="col-lg-6 offset-lg-3">
        <div className="section-heading wow bounceIn" data-wow-duration="1s" data-wow-delay="0.2s">
          <h2>See What Our Agency <em>Offers</em> &amp; What We <span>Provide</span></h2>
        </div>
      </div>
    </div>
    <div className="row">
      
      <div className="col-lg-3 col-sm-6">
        <a href="/products">
          <div className="item wow bounceInUp" data-wow-duration="1s" data-wow-delay="0.6s">
            <div className="hidden-content">
              <h4>Product & Review</h4>
              <p>Showcase your products and collect valuable customer feedback.</p>
            </div>
            <div className="showed-content">
              <img src="assets/images/Email campaign-amico.png" alt="Product and Review" style={{ width: '250px', height: '120px' }} />
            </div>
          </div>
        </a>
      </div>


      <div className="col-lg-3 col-sm-6">
        <a href="/analysis">
          <div className="item wow bounceInUp" data-wow-duration="1s" data-wow-delay="0.3s">
            <div className="hidden-content">
              <h4>Data Analysis</h4>
              <p>Analyze your data to uncover meaningful insights and trends.</p>
            </div>
            <div className="showed-content">
              <img src="assets/images/Marketing consulting-pana.png" alt="Data Analysis" style={{ width: '250px', height: '120px' }} />
            </div>
          </div>
        </a>
      </div>
      
      
      <div className="col-lg-3 col-sm-6">
        <a href="/marketing-strategy">
          <div className="item wow bounceInUp" data-wow-duration="1s" data-wow-delay="0.4s">
            <div className="hidden-content">
              <h4>Marketing Strategy</h4>
              <p>Generate tailored marketing strategies for your brand.</p>
            </div>
            <div className="showed-content">
              <img src="assets/images/Mobile Marketing-pana.png" alt="Marketing Strategy" style={{ width: '250px', height: '120px' }} />
            </div>
          </div>
        </a>
      </div>
      
      
      <div className="col-lg-3 col-sm-6">
        <a href="/content-generation">
          <div className="item wow bounceInUp" data-wow-duration="1s" data-wow-delay="0.5s">
            <div className="hidden-content">
              <h4>Content Generation</h4>
              <p>Keep your content fresh and up-to-date for ongoing marketing efforts.</p>
            </div>
            <div className="showed-content">
              <img src="assets/images/Media player-cuate.png" alt="Content Generation" style={{ width: '250px', height: '120px' }} />
            </div>
          </div>
        </a>
      </div>
    </div>
  </div>
</div>


  {/* <div id="blog" className="our-blog section">
    <div className="container">
      <div className="row">
        <div className="col-lg-6 wow fadeInDown" data-wow-duration="1s" data-wow-delay="0.25s">
          <div className="section-heading">
            <h2>Check Out What Is <em>Trending</em> In Our Latest <span>News</span></h2>
          </div>
        </div>
        <div className="col-lg-6 wow fadeInDown" data-wow-duration="1s" data-wow-delay="0.25s">
          <div className="top-dec">
            <img src="assets/images/blog-dec.png" alt="" />
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-lg-6 wow fadeInUp" data-wow-duration="1s" data-wow-delay="0.25s">
          <div className="left-image">
            <a href="#"><img src="assets/images/big-blog-thumb.jpg" alt="Workspace Desktop" /></a>
            <div className="info">
              <div className="inner-content">
                <ul>
                  <li><i className="fa fa-calendar" /> 24 Mar 2021</li>
                  <li><i className="fa fa-users" /> TemplateMo</li>
                  <li><i className="fa fa-folder" /> Branding</li>
                </ul>
                <a href="#"><h4>SEO Agency &amp; Digital Marketing</h4></a>
                <p>Lorem ipsum dolor sit amet, consectetur and sed doer ket eismod tempor incididunt ut labore et dolore magna...</p>
                <div className="main-blue-button">
                  <a href="#">Discover More</a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-6 wow fadeInUp" data-wow-duration="1s" data-wow-delay="0.25s">
          <div className="right-list">
            <ul>
              <li>
                <div className="left-content align-self-center">
                  <span><i className="fa fa-calendar" /> 18 Mar 2021</span>
                  <a href="#"><h4>New Websites &amp; Backlinks</h4></a>
                  <p>Lorem ipsum dolor sit amsecteturii and sed doer ket eismod...</p>
                </div>
                <div className="right-image">
                  <a href="#"><img src="assets/images/blog-thumb-01.jpg" alt="" /></a>
                </div>
              </li>
              <li>
                <div className="left-content align-self-center">
                  <span><i className="fa fa-calendar" /> 14 Mar 2021</span>
                  <a href="#"><h4>SEO Analysis &amp; Content Ideas</h4></a>
                  <p>Lorem ipsum dolor sit amsecteturii and sed doer ket eismod...</p>
                </div>
                <div className="right-image">
                  <a href="#"><img src="assets/images/blog-thumb-01.jpg" alt="" /></a>
                </div>
              </li>
              <li>
                <div className="left-content align-self-center">
                  <span><i className="fa fa-calendar" /> 06 Mar 2021</span>
                  <a href="#"><h4>SEO Tips &amp; Digital Marketing</h4></a>
                  <p>Lorem ipsum dolor sit amsecteturii and sed doer ket eismod...</p>
                </div>
                <div className="right-image">
                  <a href="#"><img src="assets/images/blog-thumb-01.jpg" alt="" /></a>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div> */}
  
  <div id="contact" className="contact-us section">
  <div className="container">
    <div className="row">
      <div className="col-lg-6 align-self-center wow fadeInLeft" data-wow-duration="0.5s" data-wow-delay="0.25s">
        <div className="section-heading">
          <h2>Contact Us for Your Marketing & Content Strategy Needs</h2>
          <p>Have questions about how our platform can elevate your marketing strategy or assist with content generation? Reach out to us and let us help you succeed.</p>
          <div className="phone-info">
            <h4>For immediate assistance, call us: <span><i className="fa fa-phone" /> <a href="#">010-020-0340</a></span></h4>
          </div>
        </div>
      </div>
      <div className="col-lg-6 wow fadeInRight" data-wow-duration="0.5s" data-wow-delay="0.25s">
        <form id="contact" action="" method="post">
          <div className="row">
            <div className="col-lg-6">
              <fieldset>
                <input type="text" name="name" id="name" placeholder="Your Name" autoComplete="on" required />
              </fieldset>
            </div>
            <div className="col-lg-6">
              <fieldset>
                <input type="text" name="surname" id="surname" placeholder="Your Surname" autoComplete="on" required />
              </fieldset>
            </div>
            <div className="col-lg-12">
              <fieldset>
                <input type="email" name="email" id="email" pattern="[^ @]*@[^ @]*" placeholder="Your Email" required />
              </fieldset>
            </div>
            <div className="col-lg-12">
              <fieldset>
                <textarea name="message" className="form-control" id="message" placeholder="Tell us how we can assist with your marketing or content needs." required></textarea>
              </fieldset>
            </div>
            <div className="col-lg-12">
              <fieldset>
                <button type="submit" id="form-submit" className="main-button">Send Message</button>
              </fieldset>
            </div>
          </div>
          <div className="contact-dec">
            <img src="assets/images/contact-decoration.png" alt="Contact Decoration" />
          </div>
        </form>
      </div>
    </div>
  </div>
</div>

</div>

    </>
  );
}

export default Home;
