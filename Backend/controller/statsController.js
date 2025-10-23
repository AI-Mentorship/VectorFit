
const health = (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
}

export {
    health
}