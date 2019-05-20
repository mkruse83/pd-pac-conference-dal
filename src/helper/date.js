module.exports = {
    formatToYearAndMonth: (date) => {
        const d = new Date(date);
        return d.getFullYear() + "-" + (d.getUTCMonth() + 1)
    }
};
