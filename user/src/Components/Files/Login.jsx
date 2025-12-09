import React, { useState } from 'react';
import axios from 'axios';
import { FaUser, FaLock} from "react-icons/fa";
import { Link,useNavigate } from 'react-router-dom'
import './style.css'
import logo from '../Assets/ewaste.png';
import Constant from '../../Constant'

const Login = () => {
  const [values, setValues] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');


  

  const handleInput = (event) => {
    setValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    let formErrors = {};
    if (!values.email) {
      formErrors.email = "Email is required";
    } else {
      // Step 2: Validate email format using a simple regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(values.email)) {
        formErrors.email = "Please enter a valid email address";
      }
    }

    if (!values.password) {
      formErrors.password = "Password is required";
    }

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return; 
    }

    try {
      const res = await axios.post(
        Constant.URLs.ApiUrl +"/users/login",
        values,
        { withCredentials: true } // Ensures cookies are sent and received
      );
  
      console.log("Backend Response:", res.data);
  
     if (res.data && res.data.success) {
      alert("Successfully Logged In");
      // Store token in localStorage if you want to use it for Authorization header
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      navigate("/");
    } else {
      alert(res.data.message || "Invalid credentials.");
    }
  } catch (error) {
    console.error("Error during login:", error);
    if (error.response) {
      console.log("Error Response:", error.response.data);
      alert(error.response.data.message || "Login failed. Please try again.");
    } else {
      alert("An error occurred. Please check your connection and try again.");
    }
    }
  };
  



// for forgot password
const [isOtpVerified, setIsOtpVerified] = useState(false);
const [newPassword, setNewPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');

const [otpSent, setOtpSent] = useState(false);
const [enteredOtp, setEnteredOtp] = useState('');

const handleForgotPasswordSubmit = async (e) => {
  e.preventDefault();

  if (!forgotEmail) {
    return alert("Email is required");
  }

  if (!otpSent) {
    try {
      const res = await axios.post(Constant.URLs.ApiUrl +"/otp/forgot-password", { email: forgotEmail });
      alert(res.data.message || "OTP sent to your email.");
      setOtpSent(true);
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    }
    return;
  }

  if (!isOtpVerified) {
    if (!enteredOtp) return alert("Please enter OTP");
    try {
      const res = await axios.post(Constant.URLs.ApiUrl +"/otp/verify-ottp", {
        email: forgotEmail,
        otp: enteredOtp,
      });

      if (res.data.success) {
        alert("OTP Verified. Please enter your new password.");
        setIsOtpVerified(true);
      } else {
        alert(res.data.message || "Invalid OTP");
      }
    } catch (error) {
      alert(error.response?.data?.message || "OTP verification failed");
    }
    return;
  }

  if (!newPassword || !confirmPassword) {
    return alert("Please fill in all password fields");
  }
  
  // Password pattern validation
  const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  
  if (!passwordPattern.test(newPassword)) {
    return alert("Password must be at least 8 characters long and include one uppercase letter, one number, and one special character.");
  }
  
  if (newPassword !== confirmPassword) {
    return alert("Password and Confirm Password Should be same.");
  }
  


  try {
    const res = await axios.post(Constant.URLs.ApiUrl +"/otp/reset-password", {
      email: forgotEmail,
      password: newPassword,
    });
    alert(res.data.message || "Password updated successfully");
    setShowForgotPassword(false); // go back to login
    setForgotEmail('');
    setEnteredOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setOtpSent(false);
    setIsOtpVerified(false);
  } catch (error) {
    alert(error.response?.data?.message || "Failed to update password");
  }
};




//for new password fields

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

          <li><a href="/Login">Login</a></li>
          <li><a href="/Register">Register</a></li>

          
          
        </ul>
        <i className="mobile-nav-toggle d-xl-none bi bi-list"></i>
      </nav>

    </div>
  </header>
</div>
      <div className="bg">
      <div className="form-container">
  <div>
    <p className="title">{showForgotPassword ? "Forgot Password" : "Login"}</p>

    {!showForgotPassword ? (
      <form className="form" onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="text"
            name="email"
            placeholder="Email"
            value={values.email}
            onChange={handleInput}
          />
          <FaUser className="icon" />
          {errors.email && <p className="error">{errors.email}</p>}
        </div>
        

        <div className="input-group">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={values.password}
            onChange={handleInput}
          />

          <FaLock className="icon" />
          {errors.password && <p className="error">{errors.password}</p>}
        </div>
       
        <div className="remember-forgot">
          <label>
            <input type="checkbox" /> Remember Me
          </label>
        </div>

        <button type="submit" className="sign">
          Sign in
        </button>

        <p className="signup">
          Don't have an account? <Link to="/Register" className="oho">Signup</Link>
        </p>

        <p className="signup">
          Forgot your password? <span className="oho" onClick={() => setShowForgotPassword(true)}>Reset here</span>
        </p>
      </form>
    ) : (
      <form className="form" onSubmit={handleForgotPasswordSubmit}>
  <div className="input-group">
    <input
      type="email"
      placeholder="Enter your registered email"
      value={forgotEmail}
      onChange={(e) => setForgotEmail(e.target.value)}
      disabled={otpSent}
    />
  </div>

  {otpSent && !isOtpVerified && (
    <div className="input-group">
      <input
        type="text"
        placeholder="Enter OTP"
        value={enteredOtp}
        onChange={(e) => setEnteredOtp(e.target.value)}
      />
    </div>
  )}

{isOtpVerified && (
    <>
      <div className="input-group">
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>
      <div className="input-group">
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
    </>
  )}

<button type="submit" className="sign">
    {!otpSent ? "Send OTP"
    : !isOtpVerified ? "Verify OTP"
    : "Reset Password"}
  </button>

  <p className="signup">
    Back to <span className="oho" onClick={() => setShowForgotPassword(false)}>Login</span>
  </p>
</form>
    )}
  </div>
</div>

      </div>
      </>
    );
  };
  
  export default Login;
  