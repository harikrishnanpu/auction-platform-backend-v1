import dotenv from 'dotenv';
import { createServer } from 'http';
import { app } from './main';
dotenv.config();

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    const httpServer = createServer(app);

    httpServer.listen(PORT, () => {
      console.log(`Server started on ${PORT}`);
    });
  } catch (err) {
    console.log('Server error:' + err);
  }
};

startServer();
