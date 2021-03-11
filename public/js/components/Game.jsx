import React, { Component } from 'react';

class Game extends Component {

    constructor(props) {
        super(props);
        this._root = null; // element to mount game's view onto.
        this.state = props;
		this.props.stateHelper.onStateChange((state) => {this.setState(state)});
    }

	componentDidMount() {
		// Mount three.js canvas
		this.state.gameManager.mount(this._root);
	}

	componentDidUpdate() {
		this.render();
	}

	render() {
        // TODO: make ClientGameManager have a single View2D that contains both canvas and gui overlay.
        // make SceneManager have View2D that wraps threejs canvas. (might be difficult since not react component)
		
		return (
			<div id="embedPositioner">
				<div id="embed" className='embed-maximized' ref={(ref) => (this._root = ref)}>
					{this.state.gameManager.view2D()}
				</div>
			</div>
		);
	}
}

export default Game;