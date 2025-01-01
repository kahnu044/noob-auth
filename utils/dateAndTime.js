const formatDateAndTime = () => {
  const now = new Date();

  // Extract date components
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();

  // Extract time components
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  // Determine AM/PM
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  // Format time
  const formattedTime = `${hours}:${minutes}:${seconds} ${ampm}`;

  // Combine date and time
  const formattedDate = `${day}-${month}-${year}`;
  return `${formattedDate}-${formattedTime}`;
};

module.exports = { formatDateAndTime };
