import {React,useState} from 'react'
import { Link } from "react-router-dom";
import {FaFacebook,FaLinkedin,FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
 import './style.css'
import Constant from '../../Constant';
import axios from 'axios';
import logo from '../Assets/ewaste.png';

const Home = () => {

  const [values, setValues] = useState({
        email: '',
        message: '',
      })
      
    const handleChange = (event) => {
      setValues({ ...values, [event.target.name]:[event.target.value]});
    }

    const handleSubmit = (event) => {
      event.preventDefault();
      axios.post(Constant.URLs.ApiUrl + '/feedback',values)
      .then(res => alert("Submitted"))
      .catch(err => console.log(err));
  }

  return (
    <div>
         <meta charSet="utf-8"/>
  <meta content="width=device-width, initial-scale=1.0" name="viewport"/>

  <meta name="description" content=""/>
  <meta name="keywords" content=""/>

  
  <link href="./Assets/favicon.png" rel="icon"/>
  <link href="assets/img/apple-touch-icon.png" rel="apple-touch-icon"/>

  
  <link href="https://fonts.googleapis.com" rel="preconnect"/>
  <link href="https://fonts.gstatic.com" rel="preconnect" crossOrigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Raleway:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossOrigin="anonymous"/>
 
  <link href="./Assets/vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet"/>
  <link href="./Assets/vendor/bootstrap-icons/bootstrap-icons.css" rel="stylesheet"/>
  <link href="./Assets/vendor/aos/aos.css" rel="stylesheet"/>
  <link href="./Assets/vendor/glightbox/css/glightbox.min.css" rel="stylesheet"/>
  <link href="./Assets/vendor/swiper/swiper-bundle.min.css" rel="stylesheet"/>

  <link href="./assets/css/main.css" rel="stylesheet"></link>

  <div className="index-page">

  <header id="header" className="my-custom-header">
    <div className="container-fluid container-xl position-relative d-flex align-items-center justify-content-between">

      <Link to='/' className="logo d-flex align-items-center">
          <img src={logo} alt="Logo" className="brand-logo" />
            <h1 className="sitename">Eco<span className="highlight-b">b</span>yte</h1>
          </Link>

     <nav id="navmenu" className="navmenu">
             <ul>
               <li><a href="/" className="active">Home</a></li>
               <li><a href="/">About</a></li>
               <li><a href="/">Booking</a></li>
               <li><a href="/">Awarness & Blog</a></li>
               <li><a href="/">Contact</a></li>
              </ul>
           </nav>

    </div>
  </header>

  <main className="main">
  

    <section id="contact" className="contact section">

     

      <div className="container" data-aos="fade-up" data-aos-delay="100">

      <div className="container section-title" data-aos="fade-up">
        <h2>Feedback Form</h2>
      </div>
        <form  className="php-email-form" data-aos="fade-up" data-aos-delay="300" onSubmit={handleSubmit}>
          <div className="row gy-4">

            <div className="col-md-12 ">
              <input type="email" className="form-control" name="email" placeholder="Your Email" required onChange={handleChange} />
            </div>

            <div className="col-md-12">
              <textarea className="form-control" name="message" rows="6" placeholder="Message" required onChange={handleChange}></textarea>
            </div>

            <div className="col-md-12 text-center">
              <div className="loading">Loading</div>
              <div className="error-message"></div>
              <div className="sent-message">Your message has been sent. Thank you!</div>

              <button type="submit">Send Message</button>
            </div>
          </div>
        </form>
      </div>
    </section>
  </main>


  <footer id="footer" className="footer accent-background">

    <div className="container">
     <center> <h6>Follow Us</h6></center>
    <div className="social-links d-flex justify-content-center">
    
        <a href="https://x.com/"><FaXTwitter className="icon" /></a>
        <a href="https://www.facebook.com/"><FaFacebook className="icon" /></a>
        <a href="https://in.linkedin.com/"><FaLinkedin className="icon" /></a>
        <a href="https://www.instagram.com/"><FaInstagram className="icon" /></a>
      </div>
      <p><p></p></p>
    <div className="col-12 text-center text-body">
                    <p className="text-body" >Terms & Conditions | Privacy Policy | Customer Support | Help | FAQs</p>
                 
                </div>
      <div className="copyright text-center ">
        <p>© <span>Copyright</span> <strong className="px-1 sitename">Eco<span className="highlight-b">b</span>yte</strong> <span>All Rights Reserved</span></p>
      </div>
     
      
    </div>

  </footer>


  <Link to='/' id="scroll-top" className="scroll-top d-flex align-items-center justify-content-center"><i className="bi bi-arrow-up-short"></i></Link>



  <script src="assets/js/main.js"></script>
  

</div>

    </div>
   

  )
}

export default Home
