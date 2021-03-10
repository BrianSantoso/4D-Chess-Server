class EventHandler {
    constructor(domElement) {
        this._domElement = domElement;
		this._subscribers = {};
		this._keyBinds = {};
		this._focus = 'focused';
	}

	focused() {
		return this._focus === 'focused';
	}
	
	setFocus(focus) {
		this._focus = focus;
	}

    subscribe(obj, event) {
		console.log('subscribed', obj, 'to', event)
		this._subscribers[event].add(obj);
	}
	
	unsubscribe(obj) {
		console.log('unsubscribe', obj)
		Object.keys(this._subscribers).forEach(event => {
			this._subscribers[event].delete(obj);
		});
	}

	_bindKey(key, eventName) {
		let binds = this._keyBinds[key];
		if (!binds) {
			binds = this._keyBinds[key] = new Set();
		}
		binds.add(eventName);
	}

	_unbindKey(key, eventName) {
		this._keyBinds[key].delete(eventName);
	}

	triggerByKey(keydownEvent) {
		let key = keydownEvent.code;
		let eventsToTrigger = this._keyBinds[key];
		if (eventsToTrigger) {
			eventsToTrigger.forEach(eventName => {
				this.triggerCustomEvent(eventName, keydownEvent);
			});
		}
	}

	triggerCustomEvent(eventName, parentEvent) {
		if (this.focused()) {
			this._subscribers[eventName].forEach(subscriber => {
				subscriber[eventName](parentEvent);
			});
		}
	}

	defineKeyboardEvent(eventName, triggerKeys) {
		let howToTrigger = this.triggerByKey.bind(this);
		this.defineCustomEvent(eventName, 'keydown', howToTrigger);

		triggerKeys.forEach(key => {
			this._bindKey(key, eventName);
		});
	}

	defineCustomEvent(eventName, parentEventName, f) {
		// TODO: add to customEvents map
		this.addEventListener(parentEventName, f);
		if (!(eventName in this._subscribers)) {
			this._subscribers[eventName] = new Set();
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