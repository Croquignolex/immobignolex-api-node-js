const http = require('http');
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const useragent = require('express-useragent');

const envConstants = require("./constants/envConstants");
const generalHelpers = require("./helpers/generalHelpers");

// Init express server
const app = express();

// Express router init
const router = express.Router();

// Middleware
const corsOptions = {
    // Authorized header to the client
    allowedHeaders: "accept,content-type,accept-charset,authorization,passport",
    origin: envConstants.APP.ORIGINS,
    exposedHeaders: "authorization,passport",
    methods: "GET,POST,PUT,DELETE",
    optionsSuccessStatus: 200,
    credentials: true
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(useragent.express());

// Routes
const webAuthRoutes = require('./routes/web/general/authRoutes');
const webUserRoutes = require('./routes/web/general/userRoutes');

// Setting general model route
router.use("/web/v1/auth", webAuthRoutes);
router.use("/web/v1/user", webUserRoutes);

// Append /api for our http requests
app.use("/api", router);

// Init server (for socket to listen)
const server = http.createServer(app);

// Express server listen
server.listen(
    envConstants.APP.SERVER_PORT, '0.0.0.0',
    () => {
        generalHelpers.log(`API LISTENING TO PORT ${envConstants.APP.SERVER_PORT}`,
            null,
            true
        );
    }
);

