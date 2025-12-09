import React , {useEffect, useState} from 'react'
import './update.css'
import Constant from '../../Constant'
import axios from 'axios';
import img1 from './download.png'

const Update = () => {
    const [updates,setUpdates] = useState([]);

    useEffect(() => {
        axios.get(Constant.URLs.ApiUrl + '/dashboard/update')
        .then(res=> {
            const updatedData = res.data.map(item => {
                const timeDiff = getTimeDiff(item.date);
                return { ...item, time: timeDiff };
              });
              setUpdates(updatedData);
      })
        .catch(err=>console.log("Error fetching Updates :",err)
        );
    },[])


    const getTimeDiff = (dateString) => {
        const now = new Date();
        const past = new Date(dateString);
        const diffMs = now - past;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHr = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHr / 24);
    
        if (diffSec < 60) return `${diffSec} sec ago`;
        if (diffMin < 60) return `${diffMin} min ago`;
        if (diffHr < 24) return `${diffHr} hr ago`;
        return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
      };

  return (
    <div className='Updates'>
        {updates.map((update,index)=> (
                <div className="update" key={index}>
                    <img src={img1} alt=""/>
                    <div className="noti">
                        <div style = {{marginBottom: '0.5rem'}}>
                            <span>{update.name}</span>
                            <span> 
                               <br></br> try to reach you
                            </span>
                        </div>
                        <span>
                        {update.time}
                        </span>
                    </div>
                 
                </div>
            ))}
    </div>
  )
}

export default Update
