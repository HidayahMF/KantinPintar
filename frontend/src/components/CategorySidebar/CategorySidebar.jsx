import React, { useEffect, useState } from "react";

const CategorySidebar = ({ selectedCategory, onCategorySelect, apiUrl, token }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);  
  const [error, setError] = useState(null);  

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        
        const res = await fetch(`${apiUrl}/api/category/list`, {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        });

        const json = await res.json();

        if (json.success) {
          setCategories(json.data);
        } else {
          setError(json.message || "Failed to fetch categories");
        }
      } catch (err) {
        setError("Failed to fetch categories: " + err.message);  
      } finally {
        setLoading(false);  
      }
    };

    fetchCategories();
  }, [apiUrl, token]); 

  if (loading) {
    return <p>Loading categories...</p>;  
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;  
  }

  return (
    <div className="category-sidebar">
      <select
        value={selectedCategory}
        onChange={(e) => onCategorySelect(e.target.value)}
      >
        <option value="All">All</option>
        {categories.map((cat) => (
          <option key={cat._id} value={cat.name}>
            {cat.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CategorySidebar;
