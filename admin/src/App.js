import './App.css';
import Loginn from './Components/Login/login';
import MainDash from './Components/mainDash/mainDash';
import Sidebar from './Components/Sidebar/Sidebar';
import Right from './Components/Right/right';
import User from './Components/User Details/userdetail';
import Feedback from './Components/Feedback/feedback';
import Contact from './Components/Contact/contact';
import Accepted from './Components/Accepted_Order/accepted_order';
import Blogs from './Components/Blogs/blogs';

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

function AppLayout() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/";

  return (
    <div className="App">
      {/* Only apply AppGlass when NOT on the login page */}
      {!isLoginPage ? (
        <div className="AppGlass">
          <Sidebar />  {/* Sidebar for all pages except login */}
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Loginn />} />
              <Route path="/mainDash" element={<MainDash />} />
              <Route path="/userdetail" element={<User />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/accepted_order" element={<Accepted />} />
              <Route path="/blogs" element={<Blogs />} />
            </Routes>
          </div>
          <Right /> {/* Right panel for all pages except login */}
        </div>
      ) : (
        // Only show login page without AppGlass
        <Routes>
          <Route path="/" element={<Loginn />} />
        </Routes>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
