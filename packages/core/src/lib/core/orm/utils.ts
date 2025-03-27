export function getConationFromQuery(query) {
    const whereIndex = query.toUpperCase().indexOf("WHERE");
    if (whereIndex !== -1) {
        const conditions = query
            .substring(whereIndex + "WHERE".length)
            .trim()
            .replace(/\$\d+/g, '?'); // Extract where condition from query;
        return conditions;
    } else {
        return null;
    }
}
