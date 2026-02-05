import multer from "multer";

// it is a middleware only. whenever u store data let evryone pass through it
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  
  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + "-" + file.originalname;

    cb(null, uniqueName);
  },
});

export const upload = multer({ storage });
