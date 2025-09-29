// Cleanup script to fix localStorage issues
(function() {
  try {
    // Check and clean up authToken
    const token = localStorage.getItem('authToken');
    if (token === "undefined" || token === "null" || token === null) {
      localStorage.removeItem('authToken');
      console.log('Cleaned up invalid authToken');
    }
    
    // Check and clean up user data
    const user = localStorage.getItem('user');
    if (user === "undefined" || user === "null" || user === null) {
      localStorage.removeItem('user');
      console.log('Cleaned up invalid user data');
    } else {
      try {
        // Try to parse user data to check if it's valid JSON
        JSON.parse(user);
      } catch (parseError) {
        // If parsing fails, remove the invalid data
        localStorage.removeItem('user');
        console.log('Cleaned up corrupted user data');
      }
    }
    
    console.log('LocalStorage cleanup completed');
  } catch (error) {
    console.error('Error during localStorage cleanup:', error);
  }
})();