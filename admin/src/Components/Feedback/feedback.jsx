import React,{useState,useEffect,useRef} from 'react'
import Constant from '../../Constant';
import axios from 'axios';  
import './feedback.css'


const Feedback = () => {
    const [mydata, setMyData] = useState([]);

    useEffect(()=>{
        
        axios.get(Constant.URLs.ApiUrl + '/feedback').then((res)=>{
            console.log(res.data);
            setMyData(res.data);
        })
    },[]);
      

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this feedback?");
        if (!confirmDelete) return;
    
        try {
          await axios.delete(`${Constant.URLs.ApiUrl}/feedback/${id}`);
          alert("Feedback deleted successfully!");
          setMyData(mydata.filter(item => item.feedback_id !== id));
        } catch (error) {
          console.error('Delete feedback error:', error);
          alert("Failed to delete feedback.");
        }
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
                  if (index === 2) { // adjust this index if needed
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
      <center><h1>Feedback</h1></center>  
    <div className='em'>
      <div className='emerr'>
    <center>
        <table ref={tableRef} className='Table' style={{color:"black"}} width={'80%'}>
          <tbody>
        <tr>
            <th className='emer'>Feedback ID</th>
            <th className='emer'>Email</th>
            <th className='emer'>Message</th>
            <th className='emer'>Delete</th>
        </tr>
        {
        mydata.map((data)=>{
            return (
                <tr key={data.feedback_id}>
                    <td className='emer'>
                    {data.feedback_id} 
                    </td>
                    <td className='emer'>
                     {data.email}
                    </td>
                    <td className='message'>
                    {data.message}
                    </td>
                    <td className='emer'>
                        <button className='btn btn-outline-danger' onClick={() => handleDelete(data.feedback_id)}>
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
export default Feedback
