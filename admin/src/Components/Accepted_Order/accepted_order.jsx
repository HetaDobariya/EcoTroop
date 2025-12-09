import React,{useState,useEffect,useRef} from 'react'
import Constant from '../../Constant';
import axios from 'axios';  
import './accepted_order.css'


const Accepted = () => {
    const [mydata, setMyData] = useState([]);

    useEffect(()=>{
        axios.get(Constant.URLs.ApiUrl + '/accepted').then((res)=>{
            console.log(res.data);
            setMyData(res.data);
        })
    },[]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year : "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

     const tableRef = useRef(null);

       useEffect(() => {
         const table = tableRef.current;
         if (!table) return;
       
         const headers = table.querySelectorAll("th");
         headers.forEach((th, index) => {
           const resizer = document.createElement("div");
           resizer.classList.add("resizer");
       
           resizer.addEventListener("mousedown", (event) => {
             event.preventDefault();
             const startX = event.pageX;
             const startWidth = th.offsetWidth;
       
             const handleMouseMove = (moveEvent) => {
               const newWidth = startWidth + (moveEvent.pageX - startX);
               th.style.width = `${newWidth}px`;
               table.querySelectorAll(`td:nth-child(${index + 1})`).forEach((td) => {
                 td.style.width = `${newWidth}px`;
       
                 // If it's the address column (e.g., 7th column), toggle class
                 if (index === 6) { // adjust this index if needed
                   if (newWidth > 200) {
                     td.classList.add("stretch");
                   } else {
                     td.classList.remove("stretch");
                   }
                 }
               });
             };
       
             const handleMouseUp = () => {
               document.removeEventListener("mousemove", handleMouseMove);
               document.removeEventListener("mouseup", handleMouseUp);
             };
       
             document.addEventListener("mousemove", handleMouseMove);
             document.addEventListener("mouseup", handleMouseUp);
           });
       
           th.appendChild(resizer);
         });
       }, []);

  return (
    <div>
      <center><h1>Order History</h1></center>  
    <div className='em'>
      <div className='emerr'>
    <center>
      <div style= {{overflow: "auto"}}>
        <table className='Table'  ref={tableRef}>
          <tbody>
        <tr>
            <th className='emer'>Accepted ID</th>
            <th className='emer'>Pickup ID</th>
            <th className='emer'>User ID</th>
            <th className='emer'>Device Name</th>
            <th className='emer'>Weight</th>
            <th className='emer'>Contact</th>
            <th className='emer'>Address</th>
            <th className='emer'>Date</th>
            <th className='emer'>Email</th>
            <th className='emer'>Payment</th>
        </tr>
        {
        mydata.map((data)=>{
            return (
                <tr key={data.accepted_id}>
                    <td className='emer'>
                    {data.accepted_id} 
                    </td>
                    <td className='emer'>
                     {data.pickup_id}
                    </td>
                    <td className='emer'>
                    {data.userid}
                    </td>
                    <td className='emer'>
                    {data.device_name}
                    </td>
                    <td className='emer'>
                    {data.weight}
                    </td>
                    <td className='emer'>
                    {data.contact}
                    </td>
                    <td className='address-cell'>
                    {data.address}
                    </td>
                    <td className='emer'>
                    {formatDate(data.date)}
                    </td>
                    <td className='emer'>
                    {data.email}
                    </td>
                    <td className='emer'>
                    {data.payment}
                    </td>
                </tr>
                
            )
       })
    }
    </tbody>
</table>
</div>
</center>
</div>
</div>
  </div>
  )
}
export default Accepted
