class EventHandler {
    constructor(domElement) {
        this._domElement = domElement;
		this._subscribers = {};
		this._customEvents = {};
		this._keyBinds = {};
    }

    subscribe(obj, event) {
		this._subscribers[event].add(obj);
	}
	
	unsubscribe(obj) {
		Object.keys(this._subscribers).forEach(event => {
			this._subscribers[event].delete(obj);
		});
	}

	defineKeyboardEvent(eventName, triggerKeys, f) {
		let customEvent = this.defineCustomEvent(eventName, f);
		triggerKeys.forEach(key => {
			this._bindKey(key, eventName);
		});
		return customEvent;
	}

	defineCustomEvent(eventName, f) {
		let customEvent = new Event(eventName);
		this._customEvents[eventName] = customEvent;
		this.addEventListener(eventName, f);
		return customEvent;
	}

	_bindKey(key, eventName) {
		let binds = this._keyBinds[key];
		if (!binds) {
			binds = this._keyBinds[key] = [];
		}
		let event = this._customEvents[eventName];
		binds.push(event);
	}

	triggerByKey(key) {
		let eventsToTrigger = this._keyBinds[key];
		if (eventsToTrigger) {
			eventsToTrigger.forEach(customEvent => {
				this._domElement.dispatchEvent(customEvent);
			});
		}
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