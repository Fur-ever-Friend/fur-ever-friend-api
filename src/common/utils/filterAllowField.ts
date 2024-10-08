export const filterAllowedFields = (input: any, allowedFields: string[]) => {
    const filteredData: any = {};
    if (!input || typeof input !== 'object') {
        console.warn('Invalid input provided to filterAllowedFields:', input);
        return filteredData;
    }
    allowedFields.forEach((field) => {
        if (field in input) {
            filteredData[field] = input[field];
        }
    });
    return filteredData;
};
