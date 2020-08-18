import { isEqual } from 'lodash';

class ArrayUtils {
	
}

const union = function(movesA, movesB) {
	let result = [...movesA]
	movesB.forEach(move => {
		if (!contains(result, move)) {
			result.push(move);
		}
	});
	return result;
}

const contains = function(moveList, move) {
	for (let curr of moveList) {
		if (isEqual(curr, move)) {
			return true;
		}
	}
	return false;
}

const indexOf = function(arr, item, predicate=isEqual) {
	for (let i = 0; i < arr.length; i++) {
		if (predicate(arr[i], item)) {
			return i;
		}
	}
	return -1;
}

const unique = function(arr) {
	return arr.filter((item, index) => {
		return indexOf(arr, item) === index
	});
}

export default ArrayUtils;
export { union, contains, unique }