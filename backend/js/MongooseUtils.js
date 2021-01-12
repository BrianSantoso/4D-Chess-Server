const simpleErrors = (mongooseError) => {
    // Returns Errors in the format:
    // { field1: field1Error, field2:... }
    let simpleErrors = {};
    Object.entries(mongooseError.errors).forEach(([field, errObj]) => {
        simpleErrors[field] = errObj.message
    });
    return simpleErrors;
}

export { simpleErrors };