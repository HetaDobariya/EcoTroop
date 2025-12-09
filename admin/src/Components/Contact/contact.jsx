import React,{useState,useEffect,useRef} from 'react'
import Constant from '../../Constant';
import axios from 'axios';  
import './contact.css'


const Contact = () => {
    const [mydata, setMyData] = useState([]);

    useEffect(()=>{
        
        axios.get(Constant.URLs.ApiUrl + '/contact').then((res)=>{
            console.log(res.data);
            setMyData(res.data);
        })
    },[]);


    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this message?");
        if (!confirmDelete) return;
    
        try {
          await axios.delete(`${Constant.URLs.ApiUrl}/contact/${id}`);
          alert("message deleted successfully!");
          setMyData(mydata.filter(item => item.contact_id !== id));
        } catch (error) {
          console.error('Delete contact error:', error);
          alert("Failed to delete message.");
        }
      };
    

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const options = { month: "short" }; // For "Apr"
      const month = date.toLocaleString("en-US", options);
      const day = date.getDate();
      const year = String(date.getFullYear()).slice(2); // "24"
      
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
    
      return `${month} ${day} ${year}, ${hours}:${minutes} ${ampm}`;
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
              if (index === 4) { // adjust this index if needed
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
      <center><h1>Queries</h1></center>  
    <div className='em'>
      <div className='emerr'>
    <center>
        <table ref={tableRef} className='Table' style={{color:"black"}} width={'80%'}>
          <tbody>
        <tr>
            <th className='emer'>Contact ID</th>
            <th className='emer'>Name</th>
            <th className='emer'>Email</th>
            <th className='emer'>Contact</th>
            <th className='emer'>Message</th> 
            <th className='emer'>Date</th> 
            <th className='emer'>Delete</th>
        </tr>
        {
        mydata.map((data)=>{
            return (
                <tr key={data.contact_id}>
                    <td className='emer'>
                    {data.contact_id} 
                    </td>
                    <td className='emer'>
                     {data.name}
                    </td>
                    <td className='emer'>
                    {data.email}
                    </td>
                    <td className='emer'>
                    {data.contact}
                    </td>
                    <td className='message'>
                    {data.message}
                    </td>
                    <td className='emer'>
                    {formatDate(data.date)}
                    </td>
                    <td className='emer'>
                        <button className='btn btn-outline-danger' onClick={() => handleDelete(data.contact_id)}>
                          Delete
                        </button>
                    </td>
                </tr>
                
            )
       })
    }
    </tbody>
</table>
</center>
</div>
</div>
  </div>
  )
}
export default Contact
