import {useState,useEffect} from 'react'
import logo from '../Assets/ewaste.png';
import icon from './images.jpg'
import { IoLogOutOutline } from "react-icons/io5";

import { Swiper, SwiperSlide } from 'swiper/react';

import { Autoplay, Pagination, Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import { Link } from 'react-router-dom'
import './style.css'

import myImage from './slider1.png'

import myImage2 from './slider2.png'

import myImage3 from './slider3.png'
import myImage4 from './slider5.png'

import Blog from './blog';

const Home = () => {

  const [x, setx] = useState({
    nme: '',
    em: '',
    phone: '',
    msg: '',
  })

  const [weLogin, setWeLogin] = useState(false)
  const [usrN, setUsrN] = useState("")


  const Func = () => {
    console.log("does nothing but stays here")
  }

  const handleChng = (event) => {
    setx({ ...x, [event.target.name]: event.target.value })
  }

  const handleSbmt = (event) => {
    event.preventDefault()
    alert("Pretend form submitted (no backend)")
  }

  useEffect(() => {
    console.log("fake session check, nothing here")
  }, [])

  return (
    <div>
<meta charset="utf-8"/>
  <link href="./Assets/favicon.png" rel="icon"/>

      <div class="index-page">

      <header id="header" class="my-custom-header">
    <div class="container-fluid d-flex align-items-center justify-content-between">
          <a href="/" class="logo d-flex align-items-center">
            <img src={logo} alt="Logo" className="brand-logo" />
            <h1 class="sitename">Eco<span className="highlight-b">b</span>yte</h1>
          </a>
<nav id="navmenu" class="navmenu">
            <ul>
              <li><a href="#hero">Home</a></li>
             <li><a href="#about">About</a></li>
          <li><a href="#booking">Booking</a></li>
      <li><a href="#awarness">Awarness & Blog</a></li>
              <li><a href="#contact">Contact</a></li>

              {!weLogin ? (
                <>
                                 <li><Link to="/Login">Login</Link></li>
                  <li><Link to="/Register">Register</Link></li>
                </>
              ) : (
                <li className="profile-dropdown">
                  <div className="profile-icon">
                           <img src={icon} alt="" className='profile-img' />
                  </div>
                  <div className="hello-text">Hi {usrN}</div>
   <button className="btn btn-secondary">Logout <IoLogOutOutline/></button>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </header>

      <main class="main">
        <section id="hero" class="hero section dark-background">
  <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            spaceBetween={30}
            slidesPerView={1}
            loop={true}
            autoplay={{ delay: 3000 }}
            pagination={{ clickable: true }}
            navigation={true}
          >
            <SwiperSlide><img src={myImage} alt="Slide 1" className="slider-image"/></SwiperSlide>
    <SwiperSlide><img src={myImage2} alt="Slide 2" className="slider-image"/></SwiperSlide>
            <SwiperSlide><img src={myImage3} alt="Slide 3" className="slider-image"/></SwiperSlide>
            <SwiperSlide><img src={myImage4} alt="Slide 4" className="slider-image"/></SwiperSlide>
          </Swiper>
        </section>
        <section id="contact" class="contact section">
          <div class="container">
            <h2>Contact</h2>
            <form class="php-email-form" onSubmit={handleSbmt}>
              <input type="text" name="nme" placeholder="Your Name" onChange={handleChng}/>
              <input type="email" name="em" placeholder="Your Email" onChange={handleChng}/>
              <input type="text" name="phone" placeholder="Your Contact" onChange={handleChng}/>
              <textarea name="msg" placeholder="Message" onChange={handleChng}></textarea>
              <button type="submit">Send Message</button>
            </form>
          </div>
        </section>

        <Blog/>
      </main>
 <footer id="footer" className="footer accent-background">
        <div className="container">
          <p>© Eco<span className="highlight-b">b</span>yte</p>
        </div>
      </footer>
    </div>
  </div>
  )
}

export default Home
