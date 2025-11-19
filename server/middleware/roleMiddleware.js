// server/middleware/roleMiddleware.js

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin role required' });
  }
};

const isFaculty = (req, res, next) => {
  if (req.user && req.user.role === 'Faculty') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Faculty role required' });
  }
};

const isStudent = (req, res, next) => {
  if (req.user && req.user.role === 'Student') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Student role required' });
  }
};

// EXPORT: Named Exports
module.exports = { isAdmin, isFaculty, isStudent };