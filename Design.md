# Project Design Commentary (Design.md)

This document explains how the overall design of the software was structured, improved, and optimized throughout the development lifecycle. It highlights the applied design principles, architectural choices, and refactoring efforts that contributed to a cleaner, scalable, and more maintainable system.

## 1. Introduction

The goal of this project was to build a reliable, modular, and scalable application using the MERN stack (MySQL, Express, React, Node.js).  
During development, several design and structural improvements were implemented to ensure the project aligns with modern software engineering best practices.

## 2. How the Design Was Improved

### **2.1 Folder Structure Optimization**
A well‑organized folder structure was created:
- `controllers/` for logic  
- `routes/` for API endpoints  
- `models/` for database schemas  
- `middleware/` for validation and auth  
- `services/` for external logic (email, tokens, etc.)  


### **2.2 Separation of Concerns**
Earlier, some functions mixed business logic and HTTP handling.  
The improved design clearly separates:
- Controller = request/response handling  
- Service = business logic  
- Model = database interaction  

This makes each unit testable and reduces dependency issues.

### **2.3 Consistent Naming Conventions**
Naming was standardized across:
- Files  
- Functions  
- Routes  
- Variables  

### **2.4 Improved API Architecture**
RESTful design principles were applied:
- Proper HTTP verbs (`GET/POST/PUT/DELETE`)
- Clean route naming (`/api/users/login`, `/api/orders/create`)
- Predictable API structure

API responses were standardized using:
```json
{
  "success": true,
  "message": "Operation completed",
  "data": { }
}
```

## 3. Where Design Principles Were Applied

### **3.1 Single Responsibility Principle (SRP)**
Each component/class/module handles *only one responsibility*:
- Controllers only coordinate  
- Services perform actual logic  
- Middleware validates/authenticates  
- Models handle schema and DB interaction  

This simplifies debugging and maintenance.

### **3.2 DRY (Don’t Repeat Yourself)**
Repeated code, especially for:
- validation  
- error responses  
- JWT token management  
- DB queries  

### **3.3 Dependency Inversion**
Instead of directly calling database operations inside controllers,  
services were introduced to abstract logic.

Example:
- `UserService.createUser()`  
- `AuthService.verifyUser()`  
- `OrderService.placeOrder()`  

This allows replacing or modifying backend logic without breaking controllers.

### **3.4 Error Handling Principles**
A global error handler was added:
- Every error flows through one place  
- Error messages are structured  
- Debug mode vs production mode handled  


## 4. Key Refactoring Performed

### **4.1 Moved Logic Out of Routes**
Before:
```js
router.post('/register', async (req, res) => {
  // validation
  // user creation logic
  // token generation
});
```

After:
```js
router.post('/register', userController.registerUser);
```
Improved clarity and reduced file size.

---

### **4.2 Service Layer Creation**
All repeated business logic moved to:
```
/services/userService.js
/services/authService.js
/services/orderService.js
```

This enabled:
- cleaner controllers  
- reusable functions  
- easier test coverage  

---

### **4.3 Removed Hardcoded Values**
Config values like:
- JWT secrets  
- DB strings  
- Email credentials  

were moved to `.env`.

---

### **4.4 Component Reusability in React**
Example: A shared **Modal**, **Card**, and **Input** component replaced multiple duplicate ones.

---

### **4.5 Optimized Database Queries**
Replaced multiple queries with aggregated queries where possible.  

---

## 5. Conclusion

Through the application of clean architecture, design principles like SRP, DRY, and modular design, and multiple rounds of refactoring, the project became significantly easier to scale, test, and maintain.  
These improvements contribute to long‑term project health and better developer experience.

---