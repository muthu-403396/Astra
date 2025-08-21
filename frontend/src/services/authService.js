export const simulateOAuth = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate a 50/50 chance of success
      const isAuthenticated = Math.random() > 0.5;
      resolve(isAuthenticated);
    }, 1000); // Simulate a 1-second delay
  });
}; 