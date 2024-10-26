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

type AllowedFields<T, K extends keyof T> = {
    [P in K]?: T[P];
};

class FieldUpdateError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'FieldUpdateError';
    }
}

export function allowFieldUpdate<T>(allowedFields: (keyof T)[], data: Partial<T>): Partial<T> {
    if (!allowedFields || allowedFields.length === 0) {
        throw new FieldUpdateError('No allowed fields provided.');
    }

    if (!data || typeof data !== 'object') {
        throw new FieldUpdateError('Invalid data object.');
    }

    const result: Partial<T> = {};

    allowedFields.forEach((field) => {
        if (field in data) {
            result[field] = data[field];
        }
    });

    return result;
}
