const fs = require("fs");
const randomStringGenerator = (length = 100) => {
    let chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const len = chars.length;
    let random = ''

    for(let i = 0; i < length; i++){
        const posn = Math.ceil(Math.random() * len);
        random += chars[posn];
    }
    return random;
}

const deleteFile = (filePath) => {
    if(fs.existsSync(filePath)){
        fs.unlinkSync(filePath);
    }
}

const generateSeats = () => {
  const seats = [];
  for (let row = 1; row <= 8; row++) {
    // Left side seats (A)
    seats.push({ seatNumber: `A${row}1`, isBooked: false });
    seats.push({ seatNumber: `A${row}2`, isBooked: false });

    // Right side seats (B)
    seats.push({ seatNumber: `B${row}1`, isBooked: false });
    seats.push({ seatNumber: `B${row}2`, isBooked: false });
  }
  return seats;
};

// console.log(generateSeats());


module.exports = {
    randomStringGenerator,
    deleteFile,
    generateSeats
}