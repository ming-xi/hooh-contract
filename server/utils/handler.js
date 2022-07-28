function handleError(res, reason, message, code) {
    console.error("ERROR: " + reason);
    res.status(code || 500).json({error: message}).end();
}

function handle_request_error(res, ret_message) {
    console.error("ERROR: " + ret_message);
    res.status(400).json({
        msg: ret_message
    }).end();
}

function handle_server_error(res, reason, ret_code, ret_message) {
    console.error("ERROR: " + reason || ret_message);
    res.status(500).json({
        code: ret_code,
        msg: ret_message
    }).end();
}

module.exports = {
    handleError,
    handle_request_error,
    handle_server_error,
}