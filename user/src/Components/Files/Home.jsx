import {React,useState,useEffect} from 'react'
import logo from '../Assets/ewaste.png';
import icon from './images.jpg'
import { IoLogOutOutline } from "react-icons/io5";
import om from './om.jpeg'
import omm from './th.jpg'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import {FaFacebook,FaLinkedin,FaInstagram,FaHome } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { IoCall } from "react-icons/io5";
import { FaXTwitter } from "react-icons/fa6";
import { Link } from 'react-router-dom'
 import './style.css'

import myImage from './slider1.png' // Replace with your image paths
import myImage2 from './slider2.png'
import myImage3 from './slider3.png'
import myImage4 from './slider5.png'

import Constant from '../../Constant';
import axios from 'axios';

import Blog from './blog';

const Home = () => {

  const [values, setValues] = useState({
    name: '',
		email: '',
    contact: '',
		message: '',
	  })

    const handleChange = (event) => {
      setValues({ ...values, [event.target.name]: event.target.value }); // ← remove the []
    };

    const handleSubmit = (event) => {
      event.preventDefault();

      const email = event.target.email.value;
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailPattern.test(email)) {
    alert("Please enter a valid email address (e.g., name@example.com)");
    return;
  }

  if (!event.target.checkValidity()) {
    event.stopPropagation();
    return;
  }
      
      axios.post(Constant.URLs.ApiUrl + '/contact',values)
      .then ((res) => {
        console.log("submited successfully")
        alert("Submitted Successfully")
      }).catch 
        ((err) => console.log(err))
  };




  const [pickupForm, setPickupForm] = useState({
    estimate_weight: "",
    contact: "",
    email: "",
    datetime: "",
    address: "",
    devices: []
  });
  
  const [devices, setDevices] = useState([{ type: "", other: "" }]);
  
  // Check session status on page load
  useEffect(() => {
    checkSessionStatus();
  }, []);
  
  const checkSessionStatus = () => {
    axios.get(Constant.URLs.ApiUrl + "/auth/session", { withCredentials: true })
      .then(response => {
        if (response.data.loggedIn) {
          setPickupForm(prev => ({ 
            ...prev, 
            email: response.data.user.email,
            userid: response.data.user.userId 
          }));
          setIsLoggedIn(true);
          setUserName(response.data.user.name);
        } else {
          setIsLoggedIn(false);
          setUserName("");
        }
      })
      .catch(error => {
        console.error("Error checking session:", error);
        setIsLoggedIn(false);
      });
  };
  
  const handlePickupChange = (e) => {
    setPickupForm({ ...pickupForm, [e.target.name]: e.target.value });
  };
  
  const handleDeviceChange = (index, event) => {
    const newDevices = [...devices];
    newDevices[index].type = event.target.value;
    if (event.target.value !== "Other") {
      newDevices[index].other = "";
    }
    setDevices(newDevices);
  };
  
  const handleOtherDeviceChange = (index, event) => {
    const newDevices = [...devices];
    newDevices[index].other = event.target.value;
    setDevices(newDevices);
  };
  
  const addDevice = () => {
    setDevices([...devices, { type: "", other: "" }]);
  };
  
  const handlePickupSubmit = async (e) => {
    e.preventDefault();
  
    // Check if user is logged in
    if (!isLoggedIn) {
      alert("Please login to submit pickup request!");
      return;
    }

    if (!pickupForm.userid) {
      alert("User not logged in! Please refresh the page.");
      return;
    }
    
    try {
      await axios.post(Constant.URLs.ApiUrl + "/pickup", { 
        ...pickupForm, 
        devices: JSON.stringify(devices)  // Convert devices array to JSON string
      }, { withCredentials: true });
  
      alert("Pickup Request Submitted!");
      
      // Reset form fields except email (keep logged in user's email)
      setPickupForm(prev => ({
        ...prev,
        estimate_weight: "",
        contact: "",
        datetime: "",
        address: "",
        devices: []
      }));
      setDevices([{ type: "", other: "" }]);
      
    } catch (error) {
      console.error("Pickup submission error:", error);
      if (error.response?.status === 401) {
        alert("Session expired! Please login again.");
        setIsLoggedIn(false);
        setUserName("");
      } else {
        alert("Failed to submit pickup request. Please try again.");
      }
    }
  };
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    axios.post(Constant.URLs.ApiUrl + "/users/logout", {}, { 
      withCredentials: true 
    })
      .then(() => {
        setIsLoggedIn(false);
        setUserName("");
        setShowDropdown(false);
        
        // Clear pickup form email
        setPickupForm(prev => ({ ...prev, email: "" }));
        
        alert("Logged out successfully!");
      })
      .catch((err) => {
        console.error("Logout failed:", err);
        alert("Logout failed. Please try again.");
      });  
  };
  

  return (
    <div>
         <meta charSet="utf-8"/>
  <meta content="width=device-width, initial-scale=1.0" name="viewport"/>

  <meta name="description" content=""/>
  <meta name="keywords" content=""/>

  
  <link href="./Assets/favicon.png" rel="icon"/>
  <link href="assets/img/apple-touch-icon.png" rel="apple-touch-icon"/>

  
  <link href="https://fonts.googleapis.com" rel="preconnect"/>
  <link href="https://fonts.gstatic.com" rel="preconnect" crossOrigin="anonymous"/>
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

      <a href="/" className="logo d-flex align-items-center">
      <img src={logo} alt="Logo" className="brand-logo" />
        <h1 className="sitename">Eco<span className="highlight-b">T</span>roop</h1>
      </a>

      <nav id="navmenu" className="navmenu">
        <ul>
          <li><a href="#hero">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#booking">Booking</a></li>
          <li><a href="#awarness">Awarness & Blog</a></li>
          <li><a href="#contact">Contact</a></li>


          {/* Show Login/Register if not logged in, otherwise show Profile dropdown */}

        {!isLoggedIn ? (
          <>
            <li><Link to="/Login">Login</Link></li>
            <li><Link to="/Register">Register</Link></li>
          </>
        ) : (
          <li className="profile-dropdown">
              <div className="profile-icon" onClick={() => {
                setShowDropdown(!showDropdown);
              }}>
                <img src={icon} alt="" className='profile-img' />
              </div>
              <div className="hello-text">Hello, {userName}</div>
              {showDropdown && (
                <div style={{
                  background: "white",
                  color: "black",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  position: "absolute",
                  top: "60px",
                  right: "0",
                  zIndex: 9999,
                  minWidth: "150px",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
                }}>
                  <div style={{ padding: "8px", borderBottom: "1px solid #ddd", textAlign: "center" }}>
                    <strong>{userName}</strong>
                  </div>
                  <button 
                    onClick={handleLogout} 
                    className="btn btn-secondary"
                    style={{ width: "100%", marginTop: "8px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#6c757d", // Bootstrap's secondary color
    color: "white",
    border: "1px solid #6c757d" }}
                  >
                    Logout <IoLogOutOutline  className="icon" style={{ marginLeft: "8px" }} />
                  </button>
                </div>
              )}
          </li>
        )}
      </ul>
        <i className="mobile-nav-toggle d-xl-none bi bi-list"></i>
      </nav>

    </div>
  </header>

  <main className="main">
    <section id="hero" className="hero section dark-background">

    <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            spaceBetween={30}
            slidesPerView={1}
            loop={true}
            autoplay={{ delay: 3000, disableOnInteraction: false }} // Auto slide every 3 seconds
            pagination={{ clickable: true }}
            navigation={true}
            className="mySwiper"
          >
            <SwiperSlide>
              <img src={myImage} alt="Slide 1" className="slider-image"/>
            </SwiperSlide>
            <SwiperSlide>
              <img src={myImage2} alt="Slide 2" className="slider-image"/>
            </SwiperSlide>
            <SwiperSlide>
              <img src={myImage3} alt="Slide 3" className="slider-image"/>
            </SwiperSlide>
            <SwiperSlide>
              <img src={myImage4} alt="Slide 4" className="slider-image"/>
            </SwiperSlide>
          </Swiper>
        </section>


{/* About Section  */}
    <section id="about" className="about section">

      <div className="container" data-aos="fade-up" data-aos-delay="100">
     
        <div className="row gy-4">
          <div className="col-md-6">
            <div className="about-me">
              
              <h4>About me</h4>
              <p>
              Ecotroop Recycling is an innovative startup focused on addressing the growing challenge of electronic waste (e-waste) through sustainable recycling practices. 
              </p>
              <p>
              As the world becomes increasingly digital, the lifecycle of electronic devices has significantly shortened, leading to a surge in e-waste. 
              </p>
              <p>
              Ecotroop Recycling aims to mitigate the environmental impact of this e-waste by offering a responsible recycling solution.
              </p>
            
             
            </div>
          </div>
          <div className="col-md-6">
            <img src = {om}  alt="om" className="about-img"></img>
          </div>
        </div>
      </div>

    </section>

{/* Booking section  */}
    <section id="booking" className="booking section">

<div className="container" data-aos="fade-up" data-aos-delay="100">


<form className="php-email-form" onSubmit={handlePickupSubmit}>
<div className="section-title text-center" data-aos="fade-up">
  <h2 style={{ marginBottom: "0px" }}>Request to Pick Up</h2>
</div>
              <div className="row gy-4">
                {devices.map((device, index) => (
                  <div key={index} className="col-md-12">
                      <select className="form-control" required value={device.type} onChange={(event) => handleDeviceChange(index, event)}>
                      <option value="" disabled>Select Device</option>
                      <option value="Laptop">Laptop</option>
                      <option value="Mobile Phone">Mobile Phone</option>
                      <option value="Tablet">Tablet</option>
                      <option value="Charger">Charger</option>
                      <option value="Monitor">Monitor</option>
                      <option value="Printer">Printer</option>
                      <option value="Other">Other</option>
                    </select>
                    {device.type === 'Other' && (
                      <input type="text" className="form-control mt-2" placeholder="Specify Other Device" required value={device.other} onChange={(event) => handleOtherDeviceChange(index, event)} />
                    )}
                  </div>
                ))}
                <div className="col-md-12 text-center">
                  <button type="button" className="btn btn-secondary" onClick={addDevice}>Add Another Device</button>
                </div>
                <div className="col-md-12">
                  <input type="text" className="form-control" name="estimate_weight" placeholder="Estimate Weight (KG)" required onChange={handlePickupChange} value={pickupForm.estimate_weight}/>
                </div>
                <div className="col-md-12">
                  <input type="text" className="form-control" name="contact" placeholder="Contact" required pattern="\d{10}"
                  title="Contact number must be exactly 10 digits" onChange={handlePickupChange} value={pickupForm.contact}/>
                </div>
                <div className="col-md-12">
                  <input 
                    type="email" 
                    className="form-control" 
                    name="email"   
                    value={pickupForm.email} 
                    placeholder="Email" 
                    required 
                    onChange={handlePickupChange} 
                    disabled={isLoggedIn}
                  />
                </div>

                <div className="col-md-12">
                <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
                  Please select pickup date & time
                </div>
                <input
                  type="datetime-local"
                  className="form-control"
                  name="datetime"
                  required
                  onChange={handlePickupChange}
                  value={pickupForm.datetime}
                  min={new Date().toISOString().slice(0, 16)}
                />
                </div>

                <div className="col-md-12">
                  <textarea 
                    className="form-control" 
                    name="address" 
                    rows="6" 
                    placeholder="Address" 
                    required 
                    onChange={handlePickupChange}
                    value={pickupForm.address}
                  ></textarea>
                </div>
                <div className="col-md-12 text-center">
                  <button type="submit">Request</button>
                </div>
              </div>
            </form>

</div>

</section>

{/* Awarness and blog Section  */}
<section id="awarness" className="awarness section">

<div className="container" data-aos="fade-up" data-aos-delay="100">

  <div className="row gy-4">
    <div className="col-md-6">
      <div className="awarness">
        
        <h4>Awarness and Blog</h4>
        <p>
        Ecotroop Recycling is an innovative startup focused on addressing the growing challenge of electronic waste (e-waste) through sustainable recycling practices. 
        </p>
        <p>
        As the world becomes increasingly digital, the lifecycle of electronic devices has significantly shortened, leading to a surge in e-waste. 
        </p>
        <p>
        Ecotroop Recycling aims to mitigate the environmental impact of this e-waste by offering a responsible recycling solution.
        </p>
      

      </div>
    </div>
    <div className="col-md-6">
            <img src = {omm}  alt="om" className="awarness-img"></img>
          </div>
  </div>              
</div>
<Blog/>
</section>










    <section id="contact" className="contact section">

   
      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="container section-title contact-title" data-aos="fade-up">
          <h2>Contact</h2>
        </div>

        <div className="info-wrap" data-aos="fade-up" data-aos-delay="200">
      
          <div className="row gy-5">

            <div className="col-lg-4">
              <div className="info-item d-flex align-items-center">
                <i className="bi bi-geo-alt flex-shrink-0"><FaHome className="icons" /></i>
                <div>
                  <h3>Address</h3>
                  <p>Ahmedabad</p>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="info-item d-flex align-items-center">
                <i className="bi bi-telephone flex-shrink-0"><IoCall className="icons"/></i>
                <div>
                  <h3>Call Us</h3>
                  <p>+91 9157992385</p>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="info-item d-flex align-items-center">
                <i className="bi bi-envelope flex-shrink-0"><MdEmail className="icons"/></i>
                <div>
                  <h3>Email Us</h3>
                  <p>omsomani789@gmail.com</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        <form  className="php-email-form" data-aos="fade-up" data-aos-delay="300" onSubmit={handleSubmit}>
          <div className="row gy-4">

            <div className="col-md-12">
              <input type="text" name="name" className="form-control" placeholder="Your Name" required  pattern="^[A-Za-z\s]+$" 
        title="Name should contain alphabets only" onChange={handleChange} />
            </div>

            <div className="col-md-12 ">
              <input type="email" className="form-control" name="email" placeholder="Your Email" required pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$" 
  title="Enter a valid email address (e.g., name@example.com)" onChange={handleChange} />
            </div>

            <div className="col-md-12 ">
              <input type="text" className="form-control" name="contact" placeholder="Your Contact" required  pattern="[0-9]{10}" 
        title="Contact number must be exactly 10 digits" onChange={handleChange}/>
            </div>


            <div className="col-md-12">
              <textarea className="form-control" name="message" rows="6" placeholder="Message" required minLength="15" 
        title="Message should be at least 15 characters long"onChange={handleChange}></textarea>
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
    <center><h6>Follow Us</h6></center>
    
    <div className="social-links d-flex justify-content-center">
      <a href="https://x.com/"><FaXTwitter className="icon" /></a>
      <a href="https://www.facebook.com/"><FaFacebook className="icon" /></a>
      <a href="https://in.linkedin.com/"><FaLinkedin className="icon" /></a>
      <a href="https://www.instagram.com/"><FaInstagram className="icon" /></a>
    </div>

    <div className="col-12 text-center text-body">
      <p>Terms & Conditions | Privacy Policy | Customer Support | Help | FAQs</p>
    </div>

    <div className="copyright text-center">
      <p>© <span>Copyright</span> <strong className="px-1 sitename">Eco<span className="highlight-b">T</span>roop</strong> <span>All Rights Reserved</span></p>
    </div>
  </div>
</footer>






  <script src="assets/js/main.js"></script>
  

</div>

    </div>
   

  )
}

export default Home