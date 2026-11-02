// ORDEXA Customer App API Configuration
const ORDEXA_CONFIG = {
    API_BASE: ((window.location.port === "3000") ? "http://localhost:8080/api" : (window.location.origin + "/api")),
    WS_BASE: ((window.location.protocol === "https:" ? "wss://" : "ws://") + (window.location.port === "3000" ? "localhost:8080" : window.location.host) + "/ws")
};

window.ORDEXA_CONFIG = ORDEXA_CONFIG;
