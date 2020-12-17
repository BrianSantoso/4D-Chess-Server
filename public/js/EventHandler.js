class EventHandler {
    constructor(domElement) {
        this._domElement = domElement;
        this._subscribers = {};
    }

    subscribe(obj, event) {
		this._subscribers[event].add(obj);
	}
	
	unsubscribe(obj) {
		Object.keys(this._subscribers).forEach(key => {
			this._subscribers[key].delete(obj);
		});
	}

	addEventListener(event, f) {
		// https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events
		f = f || ((e) => {});
		this._domElement.addEventListener(event, (e) => {
			
			// TODO: May need to check if e.target is renderer's dom element
			// e.preventDefault(); // TODO: this may be problematic
			f(e);
			e.rayCaster = this._rayCaster;
			this._subscribers[event].forEach(subscriber => {
				subscriber[event](e);
			});
		}, false);
		
		if (!(event in this._subscribers)) {
			this._subscribers[event] = new Set();
		}
		// No need to worry about duplicate event listeners
		// https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Multiple_identical_event_listeners	
	}
}

export default EventHandler;