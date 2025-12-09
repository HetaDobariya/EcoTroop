import React, { useState, useEffect } from "react";
import axios from "axios";
import Constant from '../../Constant';
import './blogs.css';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newBlog, setNewBlog] = useState({
    title: "",
    content: "",
    youtube_link: ""
  });

  // Fetch existing blogs
  useEffect(() => {
    axios.get(Constant.URLs.ApiUrl + '/blogs')
      .then(res => setBlogs(res.data))
      .catch(err => console.error(err));
  }, []);

  // Handle input change
  const handleChange = (e) => {
    setNewBlog({ ...newBlog, [e.target.name]: e.target.value });
  };


  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent form from reloading page
    axios.post(Constant.URLs.ApiUrl + '/blogs', newBlog)
      .then(res => {
        // Add the newly added blog to the current blogs state
        setBlogs([...blogs, res.data]);
        setShowForm(false); // Close the form after submission
        setNewBlog({ title: "", content: "", youtube_link: "" }); // Clear form inputs
      })
      .catch(err => console.error("Error adding blog:", err));
  };


  return (
    <div className="blogs-container">
      <h1 className="blog-title">Blog Section</h1>

      <button
        onClick={() => setShowForm(!showForm)}
        className="add-blog-btn"
      >
        {showForm ? "Close Form" : "Add Blog"}
      </button>

      {/* Blog Add Form */}
      {showForm && (
        <div className="blog-form">
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={newBlog.title}
            onChange={handleChange}
          />
          <input
            type="text"
            name="youtube_link"
            placeholder="YouTube Link"
            value={newBlog.youtube_link}
            onChange={handleChange}
          />
           <button onClick={handleSubmit} className="submit-btn">
            Submit
          </button>
        </div>
      )}

      {/* Display Blogs */}
      <div>
  {blogs.map(blog => {
    // Convert created_at to a readable format
    const formattedDate = new Date(blog.created_at).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return (
      <div key={blog.id} className="blog-item">
        <h2><strong>{blog.title}</strong></h2>
        <a
          href={blog.youtube_link}
          target="_blank"
          rel="noopener noreferrer"
        >
          {blog.youtube_link}
        </a>
        <p>{formattedDate}</p>
      </div>
    );
  })}
</div>
    </div>
  );
};

export default Blogs;
