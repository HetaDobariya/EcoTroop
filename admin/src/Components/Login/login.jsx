import { useState } from 'react';
import axios from 'axios';
import { FaUser, FaLock} from "react-icons/fa";
import { useNavigate } from 'react-router-dom'
import './login.css'
import Constant from '../../Constant';

const Login = () => {
  const [values, setValues] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();


  const handleInput = (event) => {
    setValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    // Basic Validation
    if (!values.email || !values.password) {
      setErrors({
        email: values.email ? "" : "Email is required",
        password: values.password ? "" : "Password is required",
      });
      return;
    }
  
    try {
      const res = await axios.post(Constant.URLs.ApiUrl + '/admin/login', values, {withCredentials:'true'});
  
      console.log("Backend Response:", res.data);
  
      if (res.data && res.data.message === "Login successful") {
        // ✅ Store the token in localStorage
        localStorage.setItem("adminToken", res.data.token);
  
        alert("Successfully Logged In");
        navigate("/mainDash");
      } else {
        alert("Invalid credentials. Please check your email and password.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      if (error.response) {
        console.log("Error Response:", error.response.data);
        alert(error.response.data.error || "Login failed. Please try again.");
      } else {
        alert("An error occurred. Please check your connection and try again.");
      }
    }
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

  <header id="header" className="header d-flex align-items-center sticky-top">
    <div className="container-fluid container-xl position-relative d-flex align-items-center justify-content-between">





    </div>
  </header>
</div>
      <div className="bg">
        <div className="form-container">
            <div>
              <p className="title">Login</p>
              <form className="form"onSubmit={handleSubmit} >
                <div className="input-group">
                  <input type="text" name="email" placeholder="Email" value={values.email} onChange={handleInput}/>
                  {errors.email && <span className="text-danger">{errors.email}</span>}
                  <FaUser className="icon" />
                </div>
  
                <div className="input-group">
                  <input type="password" name="password" placeholder="Password" value={values.password} onChange={handleInput} />
                  {errors.password && <span className="text-danger">{errors.password}</span>}
                  <FaLock className="icon" />
                </div>
  
                <div className="remember-forgot">
                  <label>
                    <input type="checkbox" /> Remember Me
                  </label>
                </div>
  
                <button type="submit" className="sign" >
                  Sign in
                </button>
              </form>
  
             
            </div>
          
        </div>
      </div>
      </>
    );
  };
  
  export default Login;
  