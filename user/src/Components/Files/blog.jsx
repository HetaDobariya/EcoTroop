import React, { useState, useEffect } from "react";
import axios from "axios";
import Constant from '../../Constant';  // Make sure the URL is correct
import './style.css';

const Blog = () => {
  const [blogs, setBlogs] = useState([]);

  // Fetch blogs from the backend
  useEffect(() => {
    axios.get(Constant.URLs.ApiUrl + '/blogs')
      .then(res => setBlogs(res.data))
      .catch(err => console.error("Error fetching blogs:", err));
  }, []);

  return (
    <div className="blog-container">
      <h1 className="blog-heading">Blogs</h1>
      {blogs.length === 0 ? (
        <p>No blogs available</p>
      ) : (
        <div className="blog-grid">
          {blogs.map(blog => {
            // Extract YouTube video ID
            const youtubeId = blog.youtube_link.split('v=')[1];
            const youtubeThumbnail = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;

            return (
              <div key={blog.id} className="blog-item">
                <h2 className="blog-title">{blog.title}</h2>
                {/* YouTube Thumbnail */}
                <div className="youtube-thumbnail">
                  <img
                    src={youtubeThumbnail}
                    alt="YouTube Thumbnail"
                    className="thumbnail-img"
                  />
                </div>

                <div className="youtube-link">
                  <a
                    href={blog.youtube_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="youtube-url"
                  >
                    Watch Now
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Blog;
