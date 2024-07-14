import app from './app.js';
import connectDB from './db/dbconfig.js';


const PORT = process.env.PORT || 9000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`);
    });
}).catch((error) => {
    console.log(`Database connection failed: ${error}`);
    process.exit(1);
});
