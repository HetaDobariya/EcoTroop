import Home from'./Components/Files/Home'
import Login from './Components/Files/Login';
import Register from './Components/Files/Register';
import Feedback from './Components/Files/feedback';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path='/' element={<Home/>}></Route>
          <Route path='/Login' element={<Login/>}></Route>
          <Route path='/Register' element={<Register/>}></Route>
          <Route path='/Feedback' element={<Feedback/>}></Route>
      

        </Routes>
      </Router>
    </div>
  );
}
export default App;
