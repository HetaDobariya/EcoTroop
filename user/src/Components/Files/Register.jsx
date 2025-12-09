import { useState } from 'react'
import axios from 'axios';
import './style.css'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../Assets/ewaste.png';
import Constant from '../../Constant';

const Register = () => {
	const navigate = useNavigate();

  const [values, setValues] = useState({
		name: '',
		email: '',
		password: '',
		mobile_no: '',
	})

  const [otpSent, setOtpSent] = useState(false);
  const [otpExpired, setOtpExpired] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  

  const handleChange = (event) => {
    setValues({...values, [event.target.name]: event.target.value});
};

const handleSubmit = (e) => {
  
  e.preventDefault();

  const { name, email, password, mobile_no } = values;

  const nameRegex = /^[A-Za-z\s]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  const mobileRegex = /^[0-9]{10}$/;


  if (!name || !email || !password || !mobile_no) {
    alert('All fields are required');
    return;
  }


  if (!nameRegex.test(name)) {
    alert('Name must contain only alphabets');
    return;
  }

  if (!emailRegex.test(email)) {
    alert('Please enter a valid email address');
    return;
  }

  if (!passwordRegex.test(password)) {
    alert('Password must be at least 8 characters long and include 1 uppercase, 1 lowercase, 1 number, and 1 special character');
    return;
  }

  if (values.password !== values.confirm_password) {
    alert('Password and Confirm Password should be same ');
    return;
  }

  if (!mobileRegex.test(mobile_no)) {
    alert('Mobile number must be exactly 10 digits');
    return;
  }


  
 
  axios.post(Constant.URLs.ApiUrl +'/otp/request-otp', { email: values.email })
    .then(res => {
      alert(res.data.message);
      setOtpSent(true);
    })
    .catch(err => {
      alert(err.response?.data?.message || 'Error Sending OTP');
    });
};


const handleResendOtp = () => {
  axios.post(Constant.URLs.ApiUrl +'/otp/request-otp', { email: values.email })
    .then(res => {
      alert('New OTP sent to your email');
      setOtpSent(true);
      setOtpExpired(false); // Reset expired status
      setEnteredOtp('');
    })
    .catch(err => {
      alert(err.response?.data?.message || 'Something went wrong');
    });
};




const handleVerifyOtp = () => {
  const payload = { ...values, otp: enteredOtp };
  axios.post(Constant.URLs.ApiUrl +'/otp/verify-otp', payload)
    .then(res => {
      alert('Registration successful!');
      navigate('/login');
    })
    .catch(err => {
      const msg = err.response?.data?.message || 'Invalid OTP';
      if (msg === 'OTP expired') {
        setOtpExpired(true);  // Show Resend OTP button
        setEnteredOtp('');
        // Show alert *after* setting state so it doesn't cause re-trigger
        setTimeout(() => {
          alert('OTP expired. Please request a new OTP.');
        }, 100);
      } else {
        alert(msg);  // For other messages like invalid OTP
      }
    });
};


  return (
	<>
    

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
    <Link to = '/' className="logo d-flex align-items-center">
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

          <li><a href="/Login">Login</a></li>
          <li><a href="/Register">Register</a></li>

          
          
        </ul>
        <i className="mobile-nav-toggle d-xl-none bi bi-list"></i>
      </nav>


    </div>
  </header>
</div>




    <div className='bg'>
      <div className="form-containerrr">
	    <p className="title">Signup</p>
		<form onSubmit={handleSubmit}>
  <div className="input-group">
    <input
      type="text"
      placeholder="Name"
      name="name"
      onChange={handleChange}
      disabled={otpSent}
    />
  </div>

  <div className="input-group">
    <input
      type="text"
      placeholder="Email"
      name="email"
      onChange={handleChange}
      disabled={otpSent}
    />
  </div>

  {otpSent && (
  <>
    <div className="input-grouup">
      <input
        type="text"
        placeholder="Enter OTP"
        value={enteredOtp}
        onChange={(e) => setEnteredOtp(e.target.value)}
      />
      <button type="button" onClick={handleVerifyOtp} className="siggn">Verify OTP</button>
    </div>

    
<center>
    {otpExpired && (
    <button type="button" onClick={handleResendOtp} className="siggn" style={{ marginTop: '10px' }}>
    Resend OTP
  </button>
    )}
    </center>
  </>
)}

  <div className="input-group">
    <input
      type="password"
      placeholder="Password"
      name="password"
      onChange={handleChange}
      disabled={otpSent}
    />
  </div>

  <div className="input-group">
  <input
    type="password"
    placeholder="Confirm Password"
    name="confirm_password"
    onChange={handleChange}
    disabled={otpSent}
  />
</div>

  <div className="input-group">
    <input
      type="text"
      placeholder="Contact"
      name="mobile_no"
      onChange={handleChange}
      disabled={otpSent}
    />
  </div>


  {!otpSent && (
            <button type="submit" className="sign">Submit</button>
          )}
          
</form>


	
	<p className="signup">Already have an account? <Link to = '/Login' className='oho'>Login</Link></p>
    </div>
    </div>
	</>
  )
}

export default Register;
