import React,{useState,useEffect,useRef} from 'react'
import Constant from '../../Constant';
import adminAxios from '../../utils/adminAxios';
import './userdetail.css'

const UserDetail = () => {
    const [mydata, setMyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError('');
            
            // Use adminAxios which automatically handles cookies and tokens
            const res = await adminAxios.get(Constant.URLs.ApiUrl + '/users');
            
            console.log("Users data:", res.data);
            
            if (res.data.success) {
                setMyData(res.data.users || []);
            } else {
                setError(res.data.message || 'Failed to fetch users');
                alert(res.data.message || 'Failed to fetch users');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setError('Failed to fetch users. Please try again.');
            
            if (error.response?.status === 401) {
                alert('Session expired. Please login again.');
                // Redirect to login will be handled by the interceptor
            } else if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert('Failed to fetch users. Please check your connection.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userid) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this user?');
        if (!confirmDelete) return;
    
        try {
            await adminAxios.delete(`${Constant.URLs.ApiUrl}/users/${userid}`);
            
            // Remove user from state after successful deletion
            setMyData(prevData => prevData.filter(user => user.userid !== userid));
            alert('User deleted successfully.');
        } catch (error) {
            console.error('Error deleting user:', error);
            
            if (error.response?.status === 401) {
                alert('Session expired. Please login again.');
            } else if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert('Failed to delete user.');
            }
        }
    };

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
    }, [mydata]); // Re-run when data changes

    if (loading) {
        return (
            <div className="text-center p-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p>Loading users...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger m-3">
                {error}
            </div>
        );
    }

    return (
        <div className="container-fluid p-3">
            <h1 className="text-center mb-4">User Details</h1>
            
            {mydata.length === 0 ? (
                <div className="alert alert-info text-center">
                    No users found.
                </div>
            ) : (
                <div className="table-responsive">
                    <center>
                        <table ref={tableRef} className='Table table-striped table-hover' width={'80%'}>
                            <thead>
                                <tr>
                                    <th className='emer'>User ID</th>
                                    <th className='emer'>Name</th>
                                    <th className='emer'>Email</th>
                                    <th className='emer'>Contact</th>
                                    <th className='emer'>Date</th>
                                    <th className='emer'>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mydata.map((data) => (
                                    <tr key={data.userid}>
                                        <td className='emer'>{data.userid}</td>
                                        <td className='emer'>{data.name}</td>
                                        <td className='emer'>{data.email}</td>
                                        <td className='emer'>{data.mobile_no}</td>
                                        <td className='emer'>{formatDate(data.date)}</td>
                                        <td className='emer'>
                                            <button 
                                                className='btn btn-outline-danger btn-sm'
                                                onClick={() => handleDelete(data.userid)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </center>
                </div>
            )}
        </div>
    );
}

export default UserDetail;