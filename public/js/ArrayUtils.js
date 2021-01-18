import { uniqBy } from 'lodash';

class ArrayUtils {
	
}

const unique = function(arr, identifier) {
	return uniqBy(arr, identifier);
}


export default ArrayUtils;
export { unique }