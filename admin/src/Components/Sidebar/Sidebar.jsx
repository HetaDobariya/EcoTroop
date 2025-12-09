import React, { useState,useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom';
import Logo from '../../Assets/ewaste.png'
import './Sidebar.css'
import {motion} from 'framer-motion'
import { SidebarData } from '../../Data/data'
import {UilSignOutAlt,UilBars} from "@iconscout/react-unicons"
const Sidebar = () => {

const [selected,setselected] = useState(0)
const location = useLocation();
const [expanded, setexpanded] =  useState(true)

useEffect(() => {
    const currentPath = location.pathname;
    const activeIndex = SidebarData.findIndex(item => item.link === currentPath);
    if (activeIndex !== -1) {
      setselected(activeIndex);
    }
  }, [location.pathname]);

const sidebarVariants = {
    true:{
        left: '0'
    },
    false: {
        left : '-60%'
    }
}

  return (
    <> 
        <div className = 'bars' style={expanded?{left:'60%'}:{left:'5%'}} onClick={() => setexpanded(!expanded)}>
            <UilBars/>
        </div>
     <motion.div className='sidebar' 
        variants= {sidebarVariants}
        animate={window.innerWidth<=768?`${expanded}`: ' '}
     >
        <div className='logo'>
            <img src={Logo} alt="" />
            <span>
                Eco<span>b</span>yte
            </span>
        </div>


        <div className='menu'>
           {SidebarData.map((item,index) => {
            return (
                <Link to={item.link} key={index} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className={selected === index? 'menuitem active': 'menuitem'}
                key={index}
                onClick={()=>setselected(index)}
                >
                    <item.icon></item.icon>
                    <span>
                        {item.heading}
                    </span>
                </div>
                </Link>
            )
           })}
           <div className='menuitem'>
                <Link to = "/" ><UilSignOutAlt></UilSignOutAlt> </Link>          
            </div>
        </div>
     </motion.div>
     </>
  )
}

export default Sidebar
