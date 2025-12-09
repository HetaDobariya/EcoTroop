import React, { useState, useEffect, useRef } from 'react';
import Constant from '../../Constant';
import axios from 'axios';
import './table.css';

const Table = () => {
  const [mydata, setMyData] = useState([]);
  const [values, setValues] = useState({
    weight: '',
    payment: '',
  });
  const [showFormRow, setShowFormRow] = useState(null);
  const [deletedRows, setDeletedRows] = useState([]);
  const [acceptedRows, setAcceptedRows] = useState([]);
  const [confirmedRows, setConfirmedRows] = useState([]);
  const tableRef = useRef(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${Constant.URLs.ApiUrl}/pickup`);
        setMyData(response.data);
      } catch (error) {
        console.error('Error fetching pickup data:', error);
        alert('Failed to load pickup data. Please try again later.');
      }
    };
    
    // Load saved states from localStorage
    const savedDeleted = JSON.parse(localStorage.getItem('deletedRows')) || [];
    const savedAccepted = JSON.parse(localStorage.getItem('acceptedRows')) || [];
    const savedConfirmed = JSON.parse(localStorage.getItem('confirmedRows')) || [];
    
    setDeletedRows(savedDeleted);
    setAcceptedRows(savedAccepted);
    setConfirmedRows(savedConfirmed);
    
    fetchData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const handleConfirm = (id) => {
    setShowFormRow(id);
  };

  const handleFormSubmit = async (id) => {
    const row = mydata.find((item) => item.pickup_id === id);
    const { weight, payment } = values;
  
    if (!weight || !payment) {
      alert("Please enter both weight and payment.");
      return;
    }
    
    if (isNaN(weight) || isNaN(payment) || weight <= 0 || payment <= 0) {
      alert("Please enter valid weight and payment values (must be positive numbers).");
      return;
    }
  
    const payload = {
      pickup_id: row.pickup_id,
      userid: row.userid,
      device_name: row.device_name,
      contact: row.contact,
      address: row.address,
      date: row.date,
      email: row.email,
      weight: parseFloat(weight),
      payment: parseFloat(payment)
    };
    
    try {
      const response = await axios.post(`${Constant.URLs.ApiUrl}/pickup/confirm`, payload);
      if (response.data.success) {
        const updatedConfirmed = [...confirmedRows, id];
        setConfirmedRows(updatedConfirmed);
        localStorage.setItem("confirmedRows", JSON.stringify(updatedConfirmed));
        
        // Refresh the data
        const newData = await axios.get(`${Constant.URLs.ApiUrl}/pickup`);
        setMyData(newData.data);
        
        setShowFormRow(null);
        setValues({ weight: '', payment: '' });
        alert("Order confirmed and payment processed successfully!");
      } else {
        throw new Error(response.data.message || 'Failed to confirm order');
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      alert(error.response?.data?.message || "Something went wrong while submitting. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to reject this pickup request?')) {
      return;
    }

    try {
      // Find the pickup request to get email and device_name
      const pickup = mydata.find(item => item.pickup_id === id);
      if (!pickup) {
        throw new Error('Pickup request not found');
      }

      const response = await axios.post(`${Constant.URLs.ApiUrl}/pickup/reject`, {
        pickupId: id,
        email: pickup.email,
        deviceName: pickup.device_name
      });
      
      if (response.data.success) {
        const updated = [...deletedRows, id];
        setDeletedRows(updated);
        localStorage.setItem('deletedRows', JSON.stringify(updated));
        
        // Refresh the data
        const newData = await axios.get(`${Constant.URLs.ApiUrl}/pickup`);
        setMyData(newData.data);
        
        alert('Pickup request rejected successfully!');
      } else {
        throw new Error(response.data.message || 'Failed to reject pickup request');
      }
    } catch (error) {
      console.error('Error rejecting pickup:', error);
      alert(error.response?.data?.message || 'An error occurred while rejecting the pickup');
    }
  };

  const handleAccept = async (id) => {
    const row = mydata.find((item) => item.pickup_id === id);
    
    try {
      const response = await axios.post(`${Constant.URLs.ApiUrl}/pickup/accept`, {
        pickupId: id,
        email: row.email,
        device_name: row.device_name,
        date: row.date
      });
      
      if (response.data.success) {
        const updated = [...acceptedRows, id];
        setAcceptedRows(updated);
        localStorage.setItem('acceptedRows', JSON.stringify(updated));
        
        // Refresh the data
        const newData = await axios.get(`${Constant.URLs.ApiUrl}/pickup`);
        setMyData(newData.data);
        
        alert('Pickup request accepted successfully!');
      } else {
        throw new Error(response.data.message || 'Failed to accept pickup request');
      }
    } catch (error) {
      console.error('Error accepting pickup:', error);
      alert(error.response?.data?.message || 'An error occurred while accepting the pickup');
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { month: "short" };
    const month = date.toLocaleString("en-US", options);
    const day = date.getDate();
    const year = String(date.getFullYear()).slice(2);
    
    let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
    
      return `${month} ${day} ${year}, ${hours}:${minutes} ${ampm}`;
    };



  //following hook is for if we want to stretch our column
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
      <h2>Recent Request</h2>
  
      <div className='emerr'>
    <center>
        <table className='Table' ref={tableRef}>
          <thead>
        <tr>
            <th className='emer'>Request ID</th>
            <th className='emer'>Devices</th>
            <th className='emer'>Estimate Weight</th>
            <th className='emer'>Contact</th>
            <th className='emer'>Email</th>
            <th className='emer'>Date</th>
            <th className='emer'>Address</th>
            <th className='emer'>Accept/Delete</th>
        </tr>
        </thead>
        <tbody>
        {
        [...mydata].reverse().map((data)=>{
            const id = data.pickup_id;
            const isDeleted = deletedRows.includes(data.pickup_id);
            const isAccepted = acceptedRows.includes(data.pickup_id);
            const isConfirmed = confirmedRows.includes(id);
            const isFormVisible = showFormRow === id;

            return (
              <React.Fragment key={id}>
                <tr>
                    <td className='emer'>
                    {data.pickup_id} 
                    </td>
                    <td className='emer'>
                     {data.device_name}
                    </td>
                    <td className='emer'>
                    {data.estimate_weight}
                    </td>
                    <td className='emer'>
                    {data.contact}
                    </td>
                    <td className='emer'>
                    {data.email}
                    </td>
                    <td className='emer'>
                      {formatDate(data.date)}
                    </td>
                    <td className='address-cell'>
                    {data.address}
                    </td>
                    <td className='emer'>
        {isDeleted ? (
            <button className='btn btn-outline-danger' disabled>
                Deleted
            </button>
                ) : isConfirmed ?(
                    <button
                    className='btn btn-outline-success' disabled
                    >
                    Success
                    </button>
                ) : isFormVisible ?( 
                  <button className='btn btn-secondary' disabled>Filling...</button>
                ): isAccepted ? ( 
                    <>
                    <button className='btn btn-success' 
                    onClick={() => handleConfirm(id)}
                    >
                        Pending
                    </button>{' '}
                    <button
                        className='btn btn-outline-danger'
                        onClick={() => handleDelete(id)}
                        >
                        Delete
                    </button>
                    </>
                ):(
                    <>
                        <button
                        className='btn btn-outline-success'
                        onClick={() => handleAccept(id)}
                        >
                        Accept
                        </button>{' '}
                        <button
                        className='btn btn-outline-danger'
                        onClick={() => handleDelete(id)}
                        >
                        Delete
                        </button>
                    </>
                )}
            </td>
        </tr>
        {isFormVisible && (
        <tr>
          <td colSpan="8">
            <div className='form-row'>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleFormSubmit(id);
              }}>
              <input
                type="text"
                placeholder="Weight"
                name = "weight"
                value={values.weight}
                onChange={handleChange}
              />
              <input
                type="text"
                placeholder="Payment"
                name= "payment"
                value={values.payment}
                onChange={handleChange}
              />
              <button className="btn btn-primary" type='submit'>Submit</button>
              </form>
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
})}  
         
    </tbody>
</table>
</center>
</div>
</div>

  )
}
export default Table
