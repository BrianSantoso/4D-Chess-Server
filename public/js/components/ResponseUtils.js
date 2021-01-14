let firstError = (errors) => {
    let firstError;
    for (let errField in errors) {
        firstError = errors[errField];
        return firstError;
    }
}

export { firstError };