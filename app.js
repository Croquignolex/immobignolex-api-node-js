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
const webUsersRoutes = require('./routes/web/admin/usersRoutes');
const webProfileRoutes = require('./routes/web/general/profileRoutes');
const webTenantsRoutes = require('./routes/web/property/tenantsRoutes');
const webChambersRoutes = require('./routes/web/property/chambersRoutes');
const webPropertiesRoutes = require('./routes/web/property/propertiesRoutes');

// Setting general model route
router.use("/web/v1/auth", webAuthRoutes);
router.use("/web/v1/users", webUsersRoutes);
router.use("/web/v1/profile", webProfileRoutes);
router.use("/web/v1/tenants", webTenantsRoutes);
router.use("/web/v1/chambers", webChambersRoutes);
router.use("/web/v1/properties", webPropertiesRoutes);

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

